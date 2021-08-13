const asyncHandler = require('../utils/asyncHandler');
const { ok, fail } = require('../utils/apiResponse');
const drugService = require('../services/drugService');

// GET /api/drugs/search?q=
const searchDrugs = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) {
    return fail(res, 'Provide at least 2 characters to search', 400);
  }
  const results = await drugService.searchDrugs(q);
  ok(res, results, `${results.length} result(s)`);
});

// GET /api/drugs/info?name=
const getDrugInfo = asyncHandler(async (req, res) => {
  const { name } = req.query;
  if (!name) return fail(res, 'A drug name is required', 400);
  const info = await drugService.getDrugInfo(name);
  ok(res, info);
});

module.exports = { searchDrugs, getDrugInfo };
