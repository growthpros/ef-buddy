module.exports = {
  apps: [{
    name: 'ef-buddy-dev',
    script: './node_modules/.bin/next',
    args: 'dev',
    cwd: '/home/user/webapp',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    watch: false,
    ignore_watch: [
      'node_modules',
      '.next',
      '.git'
    ],
    max_memory_restart: '2G',
    time: false
  }]
}