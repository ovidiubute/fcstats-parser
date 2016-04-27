"use strict";

var csvParse = require('csv-parse');
var fs = require('fs');
var process = require('process');
var q = require('promised-io/promise');
var path = require('path');

function extractSeasonYears(fileName) {
  var parts = path.basename(fileName).split('_');
  var years = parts[parts.length - 1].split('-');
  years[1] = years[1].slice(0, 4);
  return years;
}

function extractLeagueName(fileName) {
  return path.basename(fileName).split('_')[1];
}

function fromFile(fileName) {
  // Create the parser
  var csvParser = csvParse({skip_empty_lines: true, trim: true, auto_parse: true});
  var record;

  // Use the writable stream api
  var buffer = [];
  csvParser.on('readable', function () {
    while (record = csvParser.read()) {
      // Empty rows in some files..
      if (record[0].trim() === "") {
        continue;
      }

      // Exclude header..
      if (record[0] === "Div") {
        continue;
      }

      buffer.push(record);
    }
  });

  var deferred = q.defer();

  // Catch any error
  csvParser.on('error', function (err) {
    deferred.reject(err);
  });

  // When we are done, test that the parsed output matched what expected
  csvParser.on('finish', function () {
    deferred.resolve(buffer);
  });

  // Pipe
  fs.createReadStream(fileName).pipe(csvParser);

  return deferred.promise;
}

module.exports = {
  fromFile: fromFile,
  extractSeasonYears: extractSeasonYears,
  extractLeagueName: extractLeagueName
};
