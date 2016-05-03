"use strict";

var main = require('../src/main');
var assert = require('assert');
var process = require('process');
var path = require('path');
var MatchModel = require('fcstats-models').MatchModel;
var TeamModel = require('fcstats-models').TeamModel;
var LeagueModel = require('fcstats-models').LeagueModel;
var SeasonModel = require('fcstats-models').SeasonModel;

describe('Parser', function () {
  describe('#parseDirectory', function () {
    it('should parse all CSVs from a given directory', function () {
      return main.parseDirectory(path.join(process.cwd(), "/test/1993-1994")).then(function (results) {
        results.forEach(function (result) {
          result.matches.forEach(function (match) {
            assert(match instanceof MatchModel);
            assert(match.get('homeTeam') instanceof TeamModel);
            assert(match.get('awayTeam') instanceof TeamModel);
            assert(match.get('season') instanceof SeasonModel);
            assert(match.get('league') instanceof LeagueModel);
            assert(match.get('matchId') != null);
          })
        });
      });
    });
  });
});
