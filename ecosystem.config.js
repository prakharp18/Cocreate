module.exports = {
  apps: [
    {
      name: 'cocreate-websocket',
      script: 'src/utils/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 1234
      },
      error_file: './logs/ws-error.log',
      out_file: './logs/ws-out.log',
      log_file: './logs/ws-combined.log',
      time: true
    }
  ]
};
