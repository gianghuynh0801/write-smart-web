
module.exports = {
  apps: [
    {
      name: 'writesmart',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ],
  deploy: {
    production: {
      user: 'your-username',
      host: ['your-production-host'],
      ref: 'origin/main',
      repo: 'git@github.com:your-username/writesmart.git',
      path: '/var/www/writesmart',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production'
    }
  }
};
