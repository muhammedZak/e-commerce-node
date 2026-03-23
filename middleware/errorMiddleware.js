const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    return res.status(statusCode).json({
      success: false,
      error: {
        status,
        message: err.message,
        stack: err.stack,
      },
    });
  }

  res.status(statusCode).json({
    success: false,
    error: {
      status,
      code: 'INTERNAL_ERROR',
      message: err.message,
    },
  });
};

export default errorHandler;
