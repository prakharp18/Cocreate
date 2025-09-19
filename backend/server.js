const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: ['https://cocreatepizza.vercel.app', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Judge0 language IDs
const JUDGE0_LANGUAGE_IDS = {
  java: 62,    // Java (OpenJDK 13.0.1)
  python: 71,  // Python (3.8.1)
  cpp: 54      // C++ (GCC 9.2.0)
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    port: PORT,
    env: process.env.NODE_ENV
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Cocreate Backend API',
    status: 'running',
    endpoints: ['/api/health', '/api/execute']
  });
});

// Code execution endpoint
app.post('/api/execute', async (req, res) => {
  try {
    const { code, language, input = '' } = req.body;

    // Validation
    if (!code || !language) {
      return res.status(400).json({ 
        error: 'Missing required fields: code and language' 
      });
    }

    if (!JUDGE0_LANGUAGE_IDS[language]) {
      return res.status(400).json({ 
        error: 'Unsupported language. Supported: java, python, cpp' 
      });
    }

    const languageId = JUDGE0_LANGUAGE_IDS[language];
    const apiKey = process.env.RAPIDAPI_KEY;
    const apiHost = process.env.RAPIDAPI_HOST || 'judge0-ce.p.rapidapi.com';

    if (!apiKey) {
      return res.status(500).json({ 
        error: 'Server configuration error: API key not found' 
      });
    }

    // Submit code to Judge0
    console.log(`Submitting ${language} code for execution...`);
    const submitResponse = await fetch('https://judge0-ce.p.rapidapi.com/submissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': apiHost
      },
      body: JSON.stringify({
        source_code: code,
        language_id: languageId,
        stdin: input,
        wait: false
      })
    });

    if (!submitResponse.ok) {
      const errorText = await submitResponse.text();
      console.error('Submit failed:', submitResponse.status, errorText);
      return res.status(502).json({ 
        error: `Code submission failed: ${submitResponse.status}`,
        details: errorText
      });
    }

    const submitData = await submitResponse.json();
    const token = submitData.token;

    // Poll for result
    let attempts = 0;
    const maxAttempts = 30; // Increased timeout
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const resultResponse = await fetch(`https://judge0-ce.p.rapidapi.com/submissions/${token}`, {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': apiHost
        }
      });

      if (!resultResponse.ok) {
        console.error('Result fetch failed:', resultResponse.status);
        return res.status(502).json({ 
          error: `Result fetch failed: ${resultResponse.status}` 
        });
      }

      const resultData = await resultResponse.json();
      
      if (resultData.status.id <= 2) {
        // Still processing
        attempts++;
        continue;
      }

      // Execution finished - format response
      let output = "";
      let success = false;
      
      switch (resultData.status.id) {
        case 3: // Accepted
          output = resultData.stdout || "No output";
          success = true;
          break;
        case 4: // Wrong Answer
          output = `Wrong Answer:\n${resultData.stdout || "No output"}`;
          break;
        case 5: // Time Limit Exceeded
          output = "Time Limit Exceeded";
          break;
        case 6: // Compilation Error
          output = `Compilation Error:\n${resultData.compile_output || "Unknown error"}`;
          break;
        case 7: // Runtime Error (SIGSEGV)
          output = `Runtime Error:\n${resultData.stderr || "Segmentation fault"}`;
          break;
        case 8: // Runtime Error (SIGXFSZ)
          output = "Runtime Error: File size limit exceeded";
          break;
        case 9: // Runtime Error (SIGFPE)
          output = "Runtime Error: Floating point exception";
          break;
        case 10: // Runtime Error (SIGABRT)
          output = `Runtime Error:\n${resultData.stderr || "Program aborted"}`;
          break;
        case 11: // Runtime Error (NZEC)
          output = `Runtime Error:\n${resultData.stderr || "Non-zero exit code"}`;
          break;
        case 12: // Runtime Error (Other)
          output = `Runtime Error:\n${resultData.stderr || "Unknown runtime error"}`;
          break;
        case 13: // Internal Error
          output = "Internal Error: Please try again";
          break;
        case 14: // Exec Format Error
          output = "Exec Format Error";
          break;
        default:
          output = `Unknown status: ${resultData.status.description}`;
      }

      const response = {
        success,
        output,
        executionTime: resultData.time ? `${resultData.time}s` : null,
        memory: resultData.memory ? `${resultData.memory}KB` : null,
        status: resultData.status.description
      };

      if (input) {
        response.input = input;
      }

      console.log(`Execution completed: ${success ? 'SUCCESS' : 'FAILED'}`);
      return res.json(response);
    }

    // Timeout
    console.error('Execution timeout after', maxAttempts, 'attempts');
    return res.status(408).json({ 
      error: "Execution timeout: Code took too long to execute" 
    });

  } catch (error) {
    console.error('Code execution error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Cocreate backend server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🛡️ CORS enabled for: https://cocreatepizza.vercel.app`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔑 API Key configured: ${process.env.RAPIDAPI_KEY ? 'Yes' : 'No'}`);
});
