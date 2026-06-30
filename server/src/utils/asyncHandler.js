// Wraps an async controller so any rejected promise is forwarded to next()
// and handled by the centralized errorHandler middleware.
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
