const handleError = (res, error, message = "Lỗi máy chủ") => {
  console.error(error);
  res.status(500).json({ message, error: error.message });
};

module.exports = { handleError };
