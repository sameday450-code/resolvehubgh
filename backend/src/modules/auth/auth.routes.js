const { Router } = require('express');
const authController = require('./auth.controller');
const { validate } = require('../../middleware/validate');
const { authenticate } = require('../../middleware/auth');
const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  superAdminLoginSchema,
  googleAuthSchema,
} = require('./auth.validation');

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/super-admin/login', validate(superAdminLoginSchema), authController.superAdminLogin);
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);
router.post('/google', validate(googleAuthSchema), authController.googleAuth);
router.post('/logout', authenticate, authController.logout);
router.get('/profile', authenticate, authController.getProfile);

module.exports = router;
