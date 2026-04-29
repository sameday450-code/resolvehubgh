const authService = require('./auth.service');
const response = require('../../utils/response');

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);

    // Emit real-time notification to super admins
    const io = req.app.get('io');
    if (io) {
      io.emitToSuperAdmin('notification:new', {
        type: 'NEW_COMPANY_REGISTRATION',
        title: 'New Company Registration',
        message: `${req.body.companyName} has registered and is pending approval.`,
        data: { companyId: result.company.id, companyName: result.company.name },
        createdAt: new Date(),
      });
    }

    return response.success(res, result, 'Registration successful. Pending admin approval.', 201);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return response.success(res, result, 'Login successful');
  } catch (err) {
    next(err);
  }
};

const superAdminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.superAdminLogin(email, password);
    return response.success(res, result, 'Login successful');
  } catch (err) {
    next(err);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const result = await authService.refreshAccessToken(req.body.refreshToken);
    return response.success(res, result, 'Token refreshed');
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    await authService.logout(req.user.id, req.body.refreshToken);
    return response.success(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user.id);
    return response.success(res, user);
  } catch (err) {
    next(err);
  }
};

const googleAuth = async (req, res, next) => {
  try {
    const result = await authService.googleAuth(req.body.accessToken);

    if (result.isNewUser) {
      const io = req.app.get('io');
      if (io) {
        io.emitToSuperAdmin('notification:new', {
          type: 'NEW_COMPANY_REGISTRATION',
          title: 'New Company Registration',
          message: `${result.user.fullName} has registered via Google and is pending approval.`,
          data: { companyId: result.user.company?.id },
          createdAt: new Date(),
        });
      }
    }

    return response.success(res, result, 'Google authentication successful');
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, superAdminLogin, refreshToken, logout, getProfile, googleAuth };
