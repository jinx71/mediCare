const express = require('express');
const { searchDrugs, getDrugInfo } = require('../controllers/drugController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Drug reference is available to any signed-in user (patient or admin).
router.get('/search', protect, searchDrugs);
router.get('/info', protect, getDrugInfo);

module.exports = router;
