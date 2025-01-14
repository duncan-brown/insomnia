'use strict';

const fs = require('fs');
const path = require('path');

const importers = require('../../index');
const fixturesPath = path.join(__dirname, './fixtures');
const fixtures = fs.readdirSync(fixturesPath);

describe('Fixtures', () => {
  for (const name of fixtures) {
    const dir = path.join(fixturesPath, `./${name}`);
    const inputs = fs.readdirSync(dir).filter(name => !!name.match(/^(.+)-?input\.[^.]+$/));

    for (const input of inputs) {
      const prefix = input.replace(/-input\.[^.]+/, '');
      const output = `${prefix}-output.json`;

      if (prefix.startsWith('skip')) {
        continue;
      }

      it(`Import ${name} ${input}`, async () => {
        expect(typeof input).toBe('string');
        expect(typeof output).toBe('string');

        const inputContents = fs.readFileSync(path.join(dir, input), 'utf8');
        const outputContents = fs.readFileSync(path.join(dir, output), 'utf8');

        expect(typeof inputContents).toBe('string');
        expect(typeof outputContents).toBe('string');

        const results = await importers.convert(inputContents);
        const expected = JSON.parse(outputContents);

        expected.__export_date = results.data.__export_date;

        expect(results.data).toEqual(expected);

        const ids = new Set();
        for (const r of results.data.resources) {
          if (ids.has(r._id)) {
            throw new Error(
              'Export contained multiple duplicate IDs: ' + JSON.stringify(r, null, '\t'),
            );
          }
          ids.add(r._id);
        }
      });
    }
  }
});
