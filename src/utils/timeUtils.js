const moment = require("moment");

const formatDate = (date, format = "YYYY-MM-DD") => {
  return moment(date, "DD-MM-YYYY").format(format);
};

const isValidDate = (date, format = "YYYY-MM-DD") => {
  return moment(date, format, true).isValid();
};

module.exports = { formatDate, isValidDate };
