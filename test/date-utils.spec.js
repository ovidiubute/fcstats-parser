"use strict";

var assert = require('assert');
var dateutils = require('../src/date-utils');

describe('DateUtils', () => {
  describe('#getYear', () => {
    it('should parse a pre 2000 date and return the year', () => {
      assert.equal(1993, dateutils.getYear('02/02/93'));
    }); 

    it('should parse a post 2000 date and return the year', () => {
      assert.equal(2007, dateutils.getYear('02/05/2007'));
    }); 
  });
});
