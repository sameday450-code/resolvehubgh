const Joi = require('joi');

const submitContactSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).required()
    .messages({
      'string.min': 'Full name must be at least 2 characters',
      'string.max': 'Full name must not exceed 100 characters',
      'any.required': 'Full name is required',
    }),
  email: Joi.string().trim().email({ tlds: { allow: false } }).max(254).required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email address is required',
    }),
  company: Joi.string().trim().max(150).optional().allow('', null),
  subject: Joi.string().trim().min(3).max(200).required()
    .messages({
      'string.min': 'Subject must be at least 3 characters',
      'string.max': 'Subject must not exceed 200 characters',
      'any.required': 'Subject is required',
    }),
  message: Joi.string().trim().min(10).max(5000).required()
    .messages({
      'string.min': 'Message must be at least 10 characters',
      'string.max': 'Message must not exceed 5000 characters',
      'any.required': 'Message is required',
    }),
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('NEW', 'READ', 'REPLIED', 'ARCHIVED').required()
    .messages({ 'any.required': 'Status is required' }),
});

const replySchema = Joi.object({
  replyMessage: Joi.string().trim().min(10).max(10000).required()
    .messages({
      'string.min': 'Reply must be at least 10 characters',
      'any.required': 'Reply message is required',
    }),
});

module.exports = { submitContactSchema, updateStatusSchema, replySchema };
