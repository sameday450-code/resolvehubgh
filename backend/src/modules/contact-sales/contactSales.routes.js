const { Router } = require('express');
const contactSalesController = require('./contactSales.controller');
const { authenticate, authorize } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { submitContactSalesSchema, updateContactSalesSchema } = require('./contactSales.validation');

const router = Router();

// Public — anyone can submit a contact-sales request (authenticated optional)
router.post(
  '/',
  validate(submitContactSalesSchema),
  contactSalesController.submitRequest
);

// Super-admin routes
router.get(
  '/',
  authenticate,
  authorize('SUPER_ADMIN'),
  contactSalesController.listRequests
);

router.get(
  '/:id',
  authenticate,
  authorize('SUPER_ADMIN'),
  contactSalesController.getRequestById
);

router.patch(
  '/:id',
  authenticate,
  authorize('SUPER_ADMIN'),
  validate(updateContactSalesSchema),
  contactSalesController.updateRequest
);

module.exports = router;
