// Tiny helpers so every route returns the identical envelope across all 12 apps:
//   success: { success: true, data, message }
//   failure: { success: false, message, errors }

const ok = (res, data = null, message = '', status = 200) =>
  res.status(status).json({ success: true, data, message });

const created = (res, data = null, message = 'Created') =>
  ok(res, data, message, 201);

const fail = (res, message = 'Something went wrong', status = 400, errors = []) =>
  res.status(status).json({ success: false, message, errors });

module.exports = { ok, created, fail };
