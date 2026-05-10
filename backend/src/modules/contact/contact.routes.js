const { Router } = require('express');
const controller = require('./contact.controller');

const router = Router();

// Public endpoint — no authentication required
router.post('/messages', controller.submitMessage);

module.exports = router;
