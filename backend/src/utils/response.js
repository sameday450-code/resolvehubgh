const success = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const paginated = (res, data, pagination, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination,
  });
};

const error = (res, message = 'An error occurred', statusCode = 500, code = 'ERROR') => {
  return res.status(statusCode).json({
    success: false,
    message,
    code,
  });
};

module.exports = { success, paginated, error };
