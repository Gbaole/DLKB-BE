const buildSearchQuery = (fields, keywords) => {
  const keywordsArray = keywords.trim().split(/\s+/);
  return keywordsArray.map((keyword) => ({
    $or: fields.map((field) => ({
      [field]: { $regex: keyword, $options: "i" },
    })),
  }));
};

module.exports = { buildSearchQuery };
