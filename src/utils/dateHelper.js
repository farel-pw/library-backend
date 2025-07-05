const moment = require('moment');

const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  return moment(date).format(format);
};

const addDays = (date, days) => {
  return moment(date).add(days, 'days').toDate();
};

const isDatePast = (date) => {
  return moment(date).isBefore(moment());
};

const getDaysDifference = (date1, date2) => {
  return moment(date1).diff(moment(date2), 'days');
};

module.exports = {
  formatDate,
  addDays,
  isDatePast,
  getDaysDifference
};
