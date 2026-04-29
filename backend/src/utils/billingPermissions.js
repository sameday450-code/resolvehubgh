/**
 * Billing Permissions Helper
 * Defines what actions are allowed for each subscription status
 */

/**
 * Subscription capability matrix
 * Defines allowed actions per subscription status
 */
const CAPABILITY_MATRIX = {
  TRIALING: {
    // Active trial (not expired)
    read: true,
    create: true,
    update: true,
    delete: false, // Limited - can't delete core data
    branchLimit: 5, // Feature-gated on branch count
    staffLimit: 10,
    message: 'Your free trial is active. You have limited features.',
  },
  ACTIVE: {
    // Paid subscription is active
    read: true,
    create: true,
    update: true,
    delete: true,
    branchLimit: Infinity,
    staffLimit: Infinity,
    message: 'Your subscription is active.',
  },
  PENDING_PAYMENT: {
    // Payment failed or pending
    read: true,
    create: false,
    update: true, // Can update but not create
    delete: false,
    branchLimit: 0,
    staffLimit: 0,
    message: 'Payment is pending. Please update your payment method.',
    actionBlocked: 'Payment required to create new resources.',
  },
  EXPIRED: {
    // Subscription period ended, not renewed
    read: false,
    create: false,
    update: false,
    delete: false,
    branchLimit: 0,
    staffLimit: 0,
    message: 'Your subscription has expired.',
    actionBlocked: 'Please renew your subscription to continue.',
  },
  PAST_DUE: {
    // Payment overdue
    read: true, // Can still read own data
    create: false,
    update: false, // Can't make changes
    delete: false,
    branchLimit: 0,
    staffLimit: 0,
    message: 'Your subscription is past due.',
    actionBlocked: 'Please settle outstanding payments.',
  },
  CANCELLED: {
    // Customer cancelled subscription
    read: false,
    create: false,
    update: false,
    delete: false,
    branchLimit: 0,
    staffLimit: 0,
    message: 'Your subscription has been cancelled.',
    actionBlocked: 'Please renew your subscription to continue.',
  },
  PENDING_ACTIVATION: {
    // Subscription created but not yet activated
    read: false,
    create: false,
    update: false,
    delete: false,
    branchLimit: 0,
    staffLimit: 0,
    message: 'Your subscription is pending activation.',
    actionBlocked: 'Your subscription is being activated. Please try again shortly.',
  },
};

/**
 * Check if a subscription status has expired trial
 * @param {string} status - Subscription status
 * @param {Date} trialEndsAt - Trial end date
 * @returns {boolean}
 */
const isTrialExpired = (status, trialEndsAt) => {
  if (status !== 'TRIALING' || !trialEndsAt) return false;
  return new Date() > new Date(trialEndsAt);
};

/**
 * Get effective status considering trial expiration
 * @param {object} subscription - Subscription object
 * @returns {string} Effective status
 */
const getEffectiveStatus = (subscription) => {
  if (!subscription) return 'NO_SUBSCRIPTION';
  if (isTrialExpired(subscription.status, subscription.trialEndsAt)) {
    return 'TRIAL_EXPIRED';
  }
  return subscription.status;
};

/**
 * Check if an action is allowed for a given subscription status
 * @param {string} status - Subscription status (or effective status)
 * @param {string} action - Action type: 'read', 'create', 'update', 'delete'
 * @returns {boolean}
 */
const isActionAllowed = (status, action) => {
  // Special case: trial expired
  if (status === 'TRIAL_EXPIRED') {
    return false;
  }

  const capability = CAPABILITY_MATRIX[status];
  if (!capability) return false;

  return capability[action] === true;
};

/**
 * Get permission details for a subscription status
 * Includes user message and action-specific blocks
 * @param {string} status - Subscription status
 * @returns {object}
 */
const getPermissionDetails = (status) => {
  // Special handling for trial expired
  if (status === 'TRIAL_EXPIRED') {
    return {
      status: 'TRIAL_EXPIRED',
      allowed: false,
      message: 'Your free trial has expired. Please upgrade to continue.',
      actionBlocked: 'Please renew your subscription.',
    };
  }

  return CAPABILITY_MATRIX[status] || {
    status: 'UNKNOWN',
    allowed: false,
    message: 'Subscription status unknown.',
    actionBlocked: 'Unable to process request.',
  };
};

/**
 * Get all capabilities for a subscription status
 * @param {string} status - Subscription status
 * @returns {object}
 */
const getCapabilities = (status) => {
  if (status === 'TRIAL_EXPIRED') {
    return {
      read: false,
      create: false,
      update: false,
      delete: false,
      branchLimit: 0,
      staffLimit: 0,
    };
  }

  const capability = CAPABILITY_MATRIX[status];
  if (!capability) {
    return {
      read: false,
      create: false,
      update: false,
      delete: false,
      branchLimit: 0,
      staffLimit: 0,
    };
  }

  return {
    read: capability.read,
    create: capability.create,
    update: capability.update,
    delete: capability.delete,
    branchLimit: capability.branchLimit || 0,
    staffLimit: capability.staffLimit || 0,
  };
};

/**
 * Check if subscription allows write operations
 * @param {string} status - Subscription status
 * @returns {boolean}
 */
const canWrite = (status) => {
  if (status === 'TRIAL_EXPIRED') return false;
  const capability = CAPABILITY_MATRIX[status];
  return capability && (capability.create || capability.update);
};

/**
 * Check if subscription allows delete operations
 * @param {string} status - Subscription status
 * @returns {boolean}
 */
const canDelete = (status) => {
  if (status === 'TRIAL_EXPIRED') return false;
  const capability = CAPABILITY_MATRIX[status];
  return capability && capability.delete === true;
};

/**
 * Get reason code for blocking
 * Used in API responses to help frontend determine UX
 * @param {object} subscription - Subscription object
 * @returns {string}
 */
const getBlockReason = (subscription) => {
  if (!subscription) {
    return 'NO_SUBSCRIPTION';
  }

  if (isTrialExpired(subscription.status, subscription.trialEndsAt)) {
    return 'TRIAL_EXPIRED';
  }

  switch (subscription.status) {
    case 'PENDING_PAYMENT':
      return 'PENDING_PAYMENT';
    case 'EXPIRED':
      return 'EXPIRED';
    case 'PAST_DUE':
      return 'PAST_DUE';
    case 'CANCELLED':
      return 'CANCELLED';
    case 'PENDING_ACTIVATION':
      return 'PENDING_ACTIVATION';
    default:
      return 'BILLING_REQUIRED';
  }
};

module.exports = {
  CAPABILITY_MATRIX,
  isTrialExpired,
  getEffectiveStatus,
  isActionAllowed,
  getPermissionDetails,
  getCapabilities,
  canWrite,
  canDelete,
  getBlockReason,
};
