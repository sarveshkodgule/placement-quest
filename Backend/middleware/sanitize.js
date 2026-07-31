const sanitizeInput = (obj) => {
  if (obj instanceof Object) {
    for (const key in obj) {
      if (key.startsWith('$')) {
        delete obj[key];
      } else if (typeof obj[key] === 'object') {
        sanitizeInput(obj[key]);
      }
    }
  }
};

const querySanitizer = (req, res, next) => {
  sanitizeInput(req.body);
  sanitizeInput(req.query);
  sanitizeInput(req.params);
  next();
};

module.exports = { querySanitizer };
