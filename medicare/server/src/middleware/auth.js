const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const { fail } = require('../utils/apiResponse');
const User = require('../models/User');

// Verifies the Bearer token and attaches req.user (without the password).
const protect = asyncHandler(async (req, res, next) => {
  let token;
  const header = req.headers.authorization;

  if (header && header.startsWith('Bearer ')) {
    token = header.split(' ')[1];
  }

  if (!token) {
    return fail(res, 'Not authorized — no token provided', 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return fail(res, 'Not authorized — token invalid or expired', 401);
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    return fail(res, 'Not authorized — user no longer exists', 401);
  }

  req.user = user;
  next();
});

// RBAC: pass one or more allowed roles. This is the core lesson for MediCare —
// the same protected route can serve patients while admin-only actions are gated.
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return fail(res, 'Not authorized', 401);
  }
  if (!roles.includes(req.user.role)) {
    return fail(
      res,
      `Forbidden — this action requires role: ${roles.join(' or ')}`,
      403
    );
  }
  next();
};

module.exports = { protect, requireRole };
