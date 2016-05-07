"use strict";

const path = require('path');
const q = require('promised-io/promise');
const fs = require('fs');
const fse = require('fs-extra');
const util = require('util');

const genMatchId = (leagueName, matchTimestamp, index) => {
  return util.format('match-%s-%s-%d', leagueName, matchTimestamp, index);
}

const notEmpty = (record) => {
  return Object.keys(record).filter((value) => {
    return record[value] == '';
  }).length < Object.keys(record).length;
}

const getFiles = (dirname, extension) => {
  var deferred = q.defer();

  var items = []
  fse.walk(dirname)
    .on('readable', function () {
      var item;
      while ((item = this.read())) {
        if (item.stats.isFile()) {
          if (typeof extension !== 'undefined') {
            if (item.path.endsWith(extension)) {
              items.push(item.path);
            }
          } else {
            items.push(item.path);
          }
        }
      }
    })
    .on('error', function (err) {
      deferred.reject(err);
    })
    .on('end', function () {
      deferred.resolve(items);
    });

  return deferred.promise;
}

module.exports = {
  genMatchId: genMatchId,
  notEmpty: notEmpty,
  getFiles: getFiles
}
