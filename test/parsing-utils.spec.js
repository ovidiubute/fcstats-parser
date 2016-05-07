const assert = require('chai').assert;
const parsingutils = require('../src/parsing-utils');
const path = require('path');

describe('ParsingUtils', () => {
  describe('#notEmpty', () => {
    it('should return false for an empty record', () => {
      assert.isFalse(parsingutils.notEmpty({
        Div: '',
        Date: '',
        HomeTeam: '',
        AwayTeam: '',
        FTHG: '',
        FTAG: '',
        FTR: ''
      }));
    });

    it('should return true for a non-empty record', () => {
      assert.isTrue(parsingutils.notEmpty(
        {
          Div: 'E1',
          Date: '23/12/97',
          HomeTeam: 'Barca',
          AwayTeam: 'Atletico',
          FTHG: '3',
          FTAG: '2',
          FTR: 'H'
        }
      ));
    });
  });

  describe('#getFiles', () => {
    it('should throw error on not found directory', () => {
      return parsingutils.getFiles(path.join('test', 'dummydir')).then(() => {
        assert.fail(true, false, 'Should not have resolved the Promise.');
      }, (err) => {
        assert.isNotNull(err, 'Error should not be null.');
      });
    });

    it('should return a list of files from a flat directory tree of any extension', () => {
      return parsingutils.getFiles(path.join('test', '1993-1994')).then((files) => {
        assert.equal(files.length, 5);
      }, (err) => {
        assert.fail(true, false, 'Should not have rejected the Promise.');
      });
    });

    it('should return a list of files from a flat directory tree only of CSV extension', () => {
      return parsingutils.getFiles(path.join('test', '1993-1994'), 'csv').then((files) => {
        assert.equal(files.length, 4);
      }, (err) => {
        assert.fail(true, false, 'Should not have rejected the Promise.');
      });
    });

    it('should return a list of CSV files from a non-flat dir tree', () => {
      return parsingutils.getFiles(path.join('test', 'recursive'), 'csv').then((files) => {
        assert.equal(files.length, 4);
      }, (err) => {
        assert.fail(true, false, 'Should not have rejected the Promise.');
      });
    });
  });
});
