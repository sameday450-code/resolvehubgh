const prisma = require('../../config/database');
const response = require('../../utils/response');
const { Router } = require('express');

const router = Router();

// Public contact form submission
router.post('/contact', async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return response.error(res, 'All fields are required', 400);
    }

    const supportMessage = await prisma.supportMessage.create({
      data: { name, email, subject, message },
    });

    return response.success(res, { id: supportMessage.id }, 'Message sent successfully', 201);
  } catch (err) {
    next(err);
  }
});

// Public - get subscription plans
router.get('/plans', async (req, res, next) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });
    return response.success(res, plans);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
