"use strict";

var moment = require('moment');

const getYear = (date) => {
  if (date.length === 8) {
    return moment(date, 'DD/MM/YY').year();
  } else {
    return moment(date, 'DD/MM/YYYY').year();
  }
}

const getUnix = (date) => {
  let pattern = 'DD/MM/YY';
  if (date.length === 10) {
    pattern = 'DD/MM/YYYY';
  }
  return moment(date, pattern).unix();
}

module.exports = {
  getYear: getYear,
  getUnix: getUnix
}
