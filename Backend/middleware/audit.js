const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../logs/audit.log');

// Ensure logs directory exists
if (!fs.existsSync(path.dirname(logFilePath))) {
  fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
}

const auditLogger = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const studentId = req.student ? req.student.id : 'anonymous';
    const logLine = `[${new Date().toISOString()}] IP=${ip} USER=${studentId} ACTION=${method} URL=${originalUrl} STATUS=${statusCode} TIME=${duration}ms\n`;
    
    fs.appendFile(logFilePath, logLine, (err) => {
      if (err) console.error('Failed to write to audit log:', err);
    });
  });
  
  next();
};

module.exports = { auditLogger };
