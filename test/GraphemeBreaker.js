/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const { expect } = require('chai');
const fs = require('fs');
const punycode = require('punycode');
const GraphemeBreaker = require('../src/GraphemeBreaker');

describe('GraphemeBreaker', function() {
  it('basic test', function() {
    const broken = GraphemeBreaker.break('Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞');
    return expect(broken).to.deep.equal(['Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍', 'A̴̵̜̰͔ͫ͗͢', 'L̠ͨͧͩ͘', 'G̴̻͈͍͔̹̑͗̎̅͛́', 'Ǫ̵̹̻̝̳͂̌̌͘', '!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞']);
  });


  it('nextBreak', function() {
    let brk;
    const str = 'Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞';
    let index = 0;

    const res = [];
    while ((brk = GraphemeBreaker.nextBreak(str, index)) < str.length) {
      res.push(str.slice(index, brk));
      index = brk;
    }

    res.push(str.slice(index));
    return expect(res).to.deep.equal(['Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍', 'A̴̵̜̰͔ͫ͗͢', 'L̠ͨͧͩ͘', 'G̴̻͈͍͔̹̑͗̎̅͛́', 'Ǫ̵̹̻̝̳͂̌̌͘', '!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞']);
  });

  it('nextBreak intermediate indexes', function() {
    const str = 'Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞';
    const breaks = {};

    for (let i = -1, end = str.length; i < end; i++) {
      const brk = GraphemeBreaker.nextBreak(str, i);
      breaks[brk] = brk;
    }

    return expect(Object.keys(breaks).map(b => breaks[b])).to.deep.equal([ 0, 19, 28, 34, 47, 58, 75 ]);
  });

  it('previousBreak', function() {
    let brk;
    const str = 'Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞';
    let index = str.length;

    const res = [];
    while ((brk = GraphemeBreaker.previousBreak(str, index)) > 0) {
      res.push(str.slice(brk, index));
      index = brk;
    }

    res.push(str.slice(0, index));
    return expect(res).to.deep.equal(['Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍', 'A̴̵̜̰͔ͫ͗͢', 'L̠ͨͧͩ͘', 'G̴̻͈͍͔̹̑͗̎̅͛́', 'Ǫ̵̹̻̝̳͂̌̌͘', '!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞'].reverse());
  });

  it('previousBreak intermediate indexes', function() {
    const str = 'Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞';
    const breaks = {};

    for (let i = str.length+1; i >= 0; i--) {
      const brk = GraphemeBreaker.previousBreak(str, i);
      breaks[brk] = brk;
    }

    return expect(Object.keys(breaks).map(b => breaks[b])).to.deep.equal([ 0, 19, 28, 34, 47, 58, 75 ]);
  });

  it('previousBreak handles astral characters (e.g. emoji)', function() {
    let brk;
    const str = '😜🇺🇸👍';

    const res = [];
    let index = str.length;
    while ((brk = GraphemeBreaker.previousBreak(str, index)) > 0) {
      res.push(str.slice(brk, index));
      index = brk;
    }

    res.push(str.slice(0, index));
    return expect(res).to.deep.equal([ '👍', '🇺🇸', '😜' ]);
  });

  it('nextBreak handles astral characters (e.g. emoji)', function() {
    let brk;
    const str = '😜🇺🇸👍';

    const res = [];
    let index = 0;
    while ((brk = GraphemeBreaker.nextBreak(str, index)) < str.length) {
      res.push(str.slice(index, brk));
      index = brk;
    }

    res.push(str.slice(index));
    return expect(res).to.deep.equal([ '😜', '🇺🇸', '👍' ]);
  });

  it('should pass all tests in GraphemeBreakTest.txt', function() {
    const data = fs.readFileSync(__dirname + '/GraphemeBreakTest.txt', 'utf8');
    const lines = data.split('\n');

    return (() => {
      const result = [];
      for (let line of Array.from(lines)) {
        if (!line || /^#/.test(line)) { continue; }

        let [cols, comment] = Array.from(line.split('#'));
        const codePoints = cols.split(/\s*[×÷]\s*/).filter(Boolean).map(c => parseInt(c, 16));
        const str = punycode.ucs2.encode(codePoints);

        const expected = cols.split(/\s*÷\s*/).filter(Boolean).map(function(c) {
          let codes = c.split(/\s*×\s*/);
          codes = codes.map(c => parseInt(c, 16));
          return punycode.ucs2.encode(codes);
        });

        comment = comment.trim();
        expect(GraphemeBreaker.break(str)).to.deep.equal(expected, comment);
        result.push(expect(GraphemeBreaker.countBreaks(str)).to.equal(expected.length, comment));
      }
      return result;
    })();
  });

  return it('should pass all tests in GraphemeBreakTest.txt in reverse', function() {
    const data = fs.readFileSync(__dirname + '/GraphemeBreakTest.txt', 'utf8');
    const lines = data.split('\n');

    return (() => {
      const result = [];
      for (let line of Array.from(lines)) {
        var brk;
        if (!line || /^#/.test(line)) { continue; }

        const [cols, comment] = Array.from(line.split('#'));
        const codePoints = cols.split(/\s*[×÷]\s*/).filter(Boolean).map(c => parseInt(c, 16));
        const str = punycode.ucs2.encode(codePoints);

        const expected = cols.split(/\s*÷\s*/).filter(Boolean).map(function(c) {
          let codes = c.split(/\s*×\s*/);
          codes = codes.map(c => parseInt(c, 16));
          return punycode.ucs2.encode(codes);
        });

        const res = [];
        let index = str.length;
        while ((brk = GraphemeBreaker.previousBreak(str, index)) > 0) {
          res.push(str.slice(brk, index));
          index = brk;
        }

        res.push(str.slice(0, index));
        result.push(expect(res).to.deep.equal(expected.reverse(), comment.trim()));
      }
      return result;
    })();
  });
});
