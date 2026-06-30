const { validationResult } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created, fail } = require('../utils/apiResponse');
const generateToken = require('../utils/generateToken');
const User = require('../models/User');

const safeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
});

const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    fail(
      res,
      'Validation failed',
      422,
      errors.array().map((e) => ({ field: e.param, message: e.msg }))
    );
    return false;
  }
  return true;
};

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  if (!handleValidation(req, res)) return;

  const { name, email, password, phone } = req.body;

  // Role is intentionally NOT taken from the request body — patients self-register.
  // Admin accounts are provisioned via the seed script (or by another admin).
  const user = await User.create({ name, email, password, phone, role: 'patient' });

  created(res, { token: generateToken(user._id), user: safeUser(user) }, 'Account created');
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  if (!handleValidation(req, res)) return;

  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    return fail(res, 'Invalid email or password', 401);
  }

  ok(res, { token: generateToken(user._id), user: safeUser(user) }, 'Signed in');
});

// GET /api/auth/me  (protected)
const getMe = asyncHandler(async (req, res) => {
  ok(res, { user: safeUser(req.user) });
});

module.exports = { register, login, getMe };
