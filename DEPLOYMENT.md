# 🚀 Cocreate Deployment Guide

## **Step-by-Step Deployment**

### **Step 1: Deploy Backend (First!)**

1. **Go to [Render.com](https://render.com)**
   - Sign up with GitHub
   - Click "New +" → "Web Service"

2. **Connect Repository:**
   - Select your `Cocreate` repository
   - **Root Directory:** `backend`
   - **Branch:** `main`

3. **Configuration:**
   ```
   Name: cocreate-backend
   Environment: Node
   Region: Choose closest to you
   Branch: main
   Root Directory: backend
   Build Command: npm install
   Start Command: npm start
   ```

4. **Environment Variables:**
   ```
   RAPIDAPI_KEY=231258f821mshe118e0a368186f5p1738cbjsnb548a1405ccf
   RAPIDAPI_HOST=judge0-ce.p.rapidapi.com
   NODE_ENV=production
   MAX_PARTICIPANTS=4
   ```

5. **Deploy!** 
   - Your backend will be at: `https://cocreate-backend.onrender.com`

---

### **Step 2: Deploy Frontend (Vercel)**

1. **Go to [Vercel.com](https://vercel.com)**
   - Sign up with GitHub
   - Click "Add New" → "Project"

2. **Import Repository:**
   - Select your `Cocreate` repository
   - **Root Directory:** Leave empty (uses root)
   - **Framework Preset:** Vite

3. **Environment Variables:**
   ```
   VITE_BACKEND_URL=https://cocreate-backend.onrender.com
   VITE_WS_URL=wss://cocreate-backend.onrender.com
   ```

4. **Deploy!**
   - Your frontend will be at: `https://cocreate.vercel.app`

---

### **Step 3: Test Everything**

1. **Visit your Vercel URL:** `https://cocreate.vercel.app`
2. **Create a room and test:**
   - ✅ Real-time collaboration (drawing/typing)
   - ✅ Code execution (Java/Python/C++)
   - ✅ Multiple participants

---

## **🔧 Local Development**

```bash
# Terminal 1: Start backend
cd backend
npm install
npm start

# Terminal 2: Start frontend  
npm install
npm run dev
```

---

## **🌐 Final URLs**

- **Live App:** `https://cocreate.vercel.app`
- **API Health:** `https://cocreate-backend.onrender.com/api/health`
- **Repository:** `https://github.com/prakharp18/Cocreate`

---

## **🆘 Troubleshooting**

### Backend Issues:
- Check logs on Render dashboard
- Verify environment variables are set
- Test API: `https://your-backend.onrender.com/api/health`

### Frontend Issues:
- Check Vercel deployment logs
- Verify environment variables point to correct backend URL
- Check browser console for errors

### WebSocket Issues:
- Ensure VITE_WS_URL is set correctly
- Check browser network tab for WebSocket connection
- Verify backend WebSocket server is running
