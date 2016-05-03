"use strict";

var csv = require('csv');
var fs = require('fs');
var process = require('process');
var q = require('promised-io/promise');
var path = require('path');
var moment = require('moment');
var models = require('fcstats-models');
var util = require('util');

function extractSeasonYears(fileName) {
  var parts = path.basename(fileName).split('_');
  var years = parts[parts.length - 1].split('-');
  years[1] = years[1].slice(0, 4);
  return years;
}

function extractLeagueName(fileName) {
  return path.basename(fileName).split('_')[1];
}

function parseDirectory(dir) {
  var deferred = q.defer();
  var promises = [];

  _getFiles(dir).then((files) => {
    return q.all(files.map((file) => {
      return _parse(dir, file);
    })).then((results) => {
      deferred.resolve(results);
    });
  }, (err) => {
    deferred.reject(err);
  });

  return deferred.promise;
}

function _getFiles(dirname) {
  var deferred = q.defer();

  fs.readdir(dirname, (err, files) => {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(files);
    }
  });

  return deferred.promise;
}

const _notEmpty = (record) => {
  return Object.keys(record).filter((value) => {
    return record[value] != "";
  }).length > 0;
}

function _parse(dirname, filename) {
  var deferred = q.defer();

  let parser = csv.parse({
    skip_empty_lines: true,
    trim: true,
    auto_parse: true,
    columns: true,
    relax_column_count: true
  });
  let matches = [];
  let record;
  let seasonStartYear = 0;
  let leagueName = '';

  parser.on('readable', () => {
    while(record = parser.read()) {
      if (_notEmpty(record)) {
        let seasonYear = moment(record.Date, 'DD/MM/YY').year();
        if (seasonStartYear == 0) {
          seasonStartYear = seasonYear;
        }
        if (leagueName == '') {
          leagueName = record.Div;
        }

        matches.push(record);
      }
    }
  })

  parser.on('finish', () => {
    deferred.resolve({
      matches: matches.map((csvMatch, index) => {
        const momentDate = moment(csvMatch.Date, 'DD/MM/YY');
        return new models.MatchModel({
          matchId: util.format('match-%s-%s-%s-%s',
            csvMatch.Div, seasonStartYear, momentDate.year(), index + 1),
          date: momentDate.unix(),
          league: new models.LeagueModel({name: leagueName}),
          homeTeam: new models.TeamModel({name: csvMatch.HomeTeam}),
          awayTeam: new models.TeamModel({name: csvMatch.AwayTeam}),
          season: new models.SeasonModel({
            yearStart: seasonStartYear,
            yearEnd: seasonStartYear + 1,
            leagueName: csvMatch.Div
          }),
          score: new models.ScoreModel({
            home: csvMatch.FTHG,
            away: csvMatch.FTAG
          })
        })
      }),
      leagueName: leagueName,
      season: {
        start: seasonStartYear,
        end: seasonStartYear + 1
      }
    });
  })

  fs.createReadStream(path.join(dirname, filename)).pipe(parser);

  return deferred.promise;
}

module.exports = {
  parseDirectory: parseDirectory,
  extractSeasonYears: extractSeasonYears,
  extractLeagueName: extractLeagueName
};
