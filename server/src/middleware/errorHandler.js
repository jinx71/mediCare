// Centralized error handler — every thrown error or rejected async controller
// lands here and is returned in the shared failure envelope.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || res.statusCode >= 400 ? res.statusCode : 500;
  if (status < 400) status = 500;

  let message = err.message || 'Server error';
  let errors = [];

  // Mongoose: bad ObjectId
  if (err.name === 'CastError') {
    status = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose: validation error
  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Mongoose: duplicate key
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `An account with that ${field} already exists`;
  }

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error('[error]', err);
  }

  res.status(status).json({ success: false, message, errors });
};

module.exports = errorHandler;
