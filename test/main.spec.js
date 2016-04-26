"use strict";

var main = require('../src/main');
var assert = require('assert');
var process = require('process');
var path = require('path');

describe('Parser', function () {
  describe('#fromFile', function () {
    it('should parse a CSV file and return a list of Arrays excluding the header', function () {
      return main.fromFile(path.join(process.cwd(), 'test/es_SP1_1993-1994.csv')).then(function (result) {
        assert(result.length === 380);
        assert.equal(result[0][0], 'SP1');
        assert.equal(result[0][1], '05/09/93');
        assert.equal(result[0][2], 'Ath Bilbao');
        assert.equal(result[0][3], 'Albacete');
        assert.equal(result[0][4], 4);
        assert.equal(result[0][5], 1);
        assert.equal(result[0][6], 'H');
      });
    });
  });

  describe('#extractSeasonYears', function () {
    it('should parse file name and return season years', function () {
      assert.deepEqual(main.extractSeasonYears('test/es_SP1_1993-1994.csv'), [1993, 1994]);
      assert.deepEqual(main.extractSeasonYears('en_SP112_1990-2016.txt'), [1990, 2016]);
    })
  });

  describe('#extractLeagueName', function () {
    it('should parse file name and return league name', function () {
      assert.strictEqual(main.extractLeagueName('test/es_SP1_1993-1994.csv'), 'SP1');
    });
  });
});
