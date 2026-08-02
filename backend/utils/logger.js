const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    process.env.NODE_ENV === 'production' 
        ? winston.format.json() 
        : winston.format.prettyPrint()
  ),
  defaultMeta: { service: 'lockedin-backend' },
  transports: [
    new winston.transports.Console()
  ],
});

module.exports = logger;
