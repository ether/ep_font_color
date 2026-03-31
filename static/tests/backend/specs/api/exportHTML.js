'use strict';

const common = require('ep_etherpad-lite/tests/backend/common');
const randomString = require('ep_etherpad-lite/static/js/pad_utils').randomString;

const apiVersion = 1;
let agent;

const createPad = async (padID) => {
  const res = await agent.get(`/api/${apiVersion}/createPad?padID=${padID}`)
      .set('Authorization', await common.generateJWTToken());
  if (res.body.code !== 0) throw new Error('Unable to create new Pad');
  return padID;
};

const setHTML = async (padID, html) => {
  const res = await agent.get(`/api/${apiVersion}/setHTML?padID=${padID}&html=${encodeURIComponent(html)}`)
      .set('Authorization', await common.generateJWTToken());
  if (res.body.code !== 0) throw new Error('Unable to set pad HTML');
  return padID;
};

const getHTMLEndPointFor = (padID) => `/api/${apiVersion}/getHTML?padID=${padID}`;

const codeToBe = (expectedCode, res) => {
  if (res.body.code !== expectedCode) {
    throw new Error(`Code should be ${expectedCode}, was ${res.body.code}`);
  }
};

const codeToBe0 = (res) => { codeToBe(0, res); };

const buildHTML = (body) => `<html><body>${body}</body></html>`;

const textWithColor = (color, text) => {
  if (!text) text = `this is ${color}`;

  return `<span class='color:${color}'>${text}</span>`;
};

const regexWithColor = (color, text) => {
  if (!text) text = `this is ${color}`;

  const regex =
  `<span .*class=['|"].*color:${color}.*['|"].*>${text}</span>`;
  const fallbackRegex = `<span .*data-color=['|"]${color}['|"].*>${text}</span>`;

  return `${regex} || ${fallbackRegex}`;
};

describe('export color styles to HTML', function () {
  let padID;
  let html;

  before(async function () {
    agent = await common.init();
  });

  beforeEach(async function () {
    padID = randomString(5);
    await createPad(padID);
    await setHTML(padID, html());
  });

  context('when pad text has one color', function () {
    before(async function () {
      html = () => buildHTML(textWithColor('red'));
    });

    it('returns ok', async function () {
      await agent.get(getHTMLEndPointFor(padID))
          .set('Authorization', await common.generateJWTToken())
          .expect(codeToBe0)
          .expect('Content-Type', /json/)
          .expect(200);
    });

    it('returns HTML with color class', async function () {
      await agent.get(getHTMLEndPointFor(padID))
          .set('Authorization', await common.generateJWTToken())
          .expect((res) => {
            const expectedRegex = regexWithColor('red');
            const expectedColors = new RegExp(expectedRegex);
            const html = res.body.data.html;
            const foundColor = html.match(expectedColors);
            if (!foundColor) {
              throw new Error(`Color not exported. Regex used:
                ${expectedRegex}, html exported: ${html}`);
            }
          });
    });
  });

  context('when pad text has two colors in a single line', function () {
    before(async function () {
      html = () => buildHTML(textWithColor('red') + textWithColor('blue'));
    });

    it('returns HTML with two color spans', async function () {
      await agent.get(getHTMLEndPointFor(padID))
          .set('Authorization', await common.generateJWTToken())
          .expect((res) => {
            const firstColor = regexWithColor('red');
            const secondColor = regexWithColor('blue');
            const expectedRegex = `${firstColor}.*${secondColor}`;
            const expectedColors = new RegExp(expectedRegex);

            const html = res.body.data.html;
            const foundColor = html.match(expectedColors);
            if (!foundColor) {
              throw new Error(`Color not exported. Regex used:
                ${expectedRegex}, html exported: ${html}`);
            }
          });
    });
  });

  context('when pad text has no colors', function () {
    before(async function () {
      html = () => buildHTML('empty pad');
    });

    it('returns HTML with no color', async function () {
      await agent.get(getHTMLEndPointFor(padID))
          .set('Authorization', await common.generateJWTToken())
          .expect((res) => {
            const expectedRegex = '.*empty pad.*';
            const noColor = new RegExp(expectedRegex);

            const html = res.body.data.html;
            const foundColor = html.match(noColor);
            if (!foundColor) {
              throw new Error(`Color exported, should not have any. Regex used:
                ${expectedRegex}, html exported: ${html}`);
            }
          });
    });
  });

  context('when pad text has color inside strong', function () {
    before(async function () {
      html = () => buildHTML(`<strong>${textWithColor('red', 'this is red and bold')}</strong>`);
    });

    it('returns HTML with strong and color, in any order', async function () {
      await agent.get(getHTMLEndPointFor(padID))
          .set('Authorization', await common.generateJWTToken())
          .expect((res) => {
            const strongInsideColorRegex =
            regexWithColor('red', '<strong>this is red and bold</strong>');
            const colorInsideStrongRegex =
            `<strong>${regexWithColor('red', 'this is red and bold')}</strong>`;
            const expectedStrongInsideColor = new RegExp(strongInsideColorRegex);
            const expectedColorInsideStrong = new RegExp(colorInsideStrongRegex);

            const html = res.body.data.html;
            const foundColor =
            html.match(expectedStrongInsideColor) || html.match(expectedColorInsideStrong);
            if (!foundColor) {
              throw new Error(`Color not exported. Regex used:
                [${strongInsideColorRegex} ||
                 ${colorInsideStrongRegex}], html exported: ${html}`);
            }
          });
    });
  });

  context('when pad text has strong inside color', function () {
    before(async function () {
      html = () => buildHTML(textWithColor('red', '<strong>this is red and bold</strong>'));
    });

    it('returns HTML with strong and color, in any order', async function () {
      await agent.get(getHTMLEndPointFor(padID))
          .set('Authorization', await common.generateJWTToken())
          .expect((res) => {
            const strongInsideColorRegex =
            regexWithColor('red', '<strong>this is red and bold</strong>');
            const colorInsideStrongRegex =
            `<strong>${regexWithColor('red', 'this is red and bold')}</strong>`;
            const expectedStrongInsideColor = new RegExp(strongInsideColorRegex);
            const expectedColorInsideStrong = new RegExp(colorInsideStrongRegex);

            const html = res.body.data.html;
            const foundColor = html.match(expectedStrongInsideColor) ||
            html.match(expectedColorInsideStrong);
            if (!foundColor) {
              throw new Error(`Color not exported. Regex used: [${strongInsideColorRegex} ||
                ${colorInsideStrongRegex}], html exported: ${html}`);
            }
          });
    });
  });

  context('when pad text has part with color and part without it', function () {
    before(async function () {
      html = () => buildHTML(`no color here ${textWithColor('red')}`);
    });

    it('returns HTML with part with color and part without it', async function () {
      await agent.get(getHTMLEndPointFor(padID))
          .set('Authorization', await common.generateJWTToken())
          .expect((res) => {
            const expectedRegex = `no color here ${regexWithColor('red')}`;
            const expectedColors = new RegExp(expectedRegex);
            const html = res.body.data.html;
            const foundColor = html.match(expectedColors);
            if (!foundColor) {
              throw new Error(`Color not exported. Regex used:
                ${expectedRegex}, html exported: ${html}`);
            }
          });
    });
  });
});
