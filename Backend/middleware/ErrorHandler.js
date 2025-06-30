// Middleware untuk menangani error secara global
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    status: false,
    message: 'Terjadi kesalahan server',
    statusCode: 500
  };

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      status: false,
      message: message,
      statusCode: 400
    };
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = {
      status: false,
      message: `${field} sudah ada dalam database`,
      statusCode: 400
    };
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    error = {
      status: false,
      message: 'Data tidak valid',
      statusCode: 400
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      status: false,
      message: 'Token tidak valid',
      statusCode: 401
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      status: false,
      message: 'Token sudah expired',
      statusCode: 401
    };
  }

  // Custom error dengan status code
  if (err.statusCode) {
    error = {
      status: false,
      message: err.message || 'Terjadi kesalahan',
      statusCode: err.statusCode
    };
  }

  res.status(error.statusCode).json(error);
};

export default errorHandler; 