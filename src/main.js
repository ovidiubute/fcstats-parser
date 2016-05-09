"use strict";

var csv = require('csv');
var fs = require('fs');
var process = require('process');
var q = require('promised-io/promise');

var dateutils = require('./date-utils');
var models = require('fcstats-models');
var parsingutils = require('./parsing-utils');

function parseDirectory(dir) {
  var deferred = q.defer();
  var promises = [];

  parsingutils.getFiles(dir, 'csv').then((files) => {
    return q.all(files.map((file) => {
      let parser = csv.parse({
        skip_empty_lines: true,
        trim: true,
        auto_parse: true,
        columns: true,
        relax_column_count: true
      });
      return parseFile(file, parser);
    })).then((results) => {
      deferred.resolve(results.reduce((prev, cur) => {
        cur.forEach((item) => {
          prev.push(item);
        });
        return prev;
      }, []));
    });
  }, (err) => {
    deferred.reject(err);
  });

  return deferred.promise;
}

function parseFile(file, parser) {
  var deferred = q.defer();
  let matches = [];
  let record;

  parser.on('readable', () => {
    while(record = parser.read()) {
      if (parsingutils.notEmpty(record)) {
        matches.push(record);
      }
    }
  })

  parser.on('finish', () => {
    if (!matches.length) {
      deferred.reject(new Error('No matches found!'));
      return;
    }

    const leagueName = matches[0].Div;
    const seasonStartYear = dateutils.getYear(matches[0].Date);
    const seasonFinishYear = seasonStartYear + 1;

    deferred.resolve(
      matches.map((csvMatch, index) => {
        const matchTimestamp = dateutils.getUnix(csvMatch.Date);
        return new models.MatchModel({
          matchId: parsingutils.genMatchId(leagueName, matchTimestamp, index),
          date: matchTimestamp,
          league: new models.LeagueModel({name: leagueName}),
          homeTeam: new models.TeamModel({name: csvMatch.HomeTeam}),
          awayTeam: new models.TeamModel({name: csvMatch.AwayTeam}),
          season: new models.SeasonModel({
            yearStart: seasonStartYear,
            yearEnd: seasonFinishYear,
            leagueName: leagueName
          }),
          score: new models.ScoreModel({
            home: csvMatch.FTHG,
            away: csvMatch.FTAG
          })
        })
      })
    );
  })

  fs.createReadStream(file).pipe(parser);

  return deferred.promise;
}

module.exports = {
  parseDirectory: parseDirectory,
  parseFile: parseFile
};
