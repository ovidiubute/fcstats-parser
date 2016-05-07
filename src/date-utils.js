"use strict";

var moment = require('moment');

const getYear = (date) => {
  return moment(date, 'DD/MM/YY').year();
}

const getUnix = (date) => {
  return moment(date, 'DD/MM/YY').unix();
}

module.exports = {
  getYear: getYear,
  getUnix: getUnix
}
