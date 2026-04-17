'use strict';

const assert = require('assert').strict;
const fs = require('fs');
const path = require('path');

const indexPath = path.resolve(
    __dirname, '..', '..', '..', '..', 'static', 'js', 'index.js');

describe(__filename, function () {
  let src;
  before(function () { src = fs.readFileSync(indexPath, 'utf8'); });

  it('postAceInit rebinds niceSelect on html10n language change (#21)', function () {
    // niceSelect renders a copy of the <select> at init time and does not
    // observe option-text mutations. After html10n rewrites the <select>
    // options for the new locale, the custom dropdown must be refreshed
    // via `niceSelect('update')` so the user sees the translated labels.
    const postAceInit = src.match(/exports\.postAceInit\s*=\s*[\s\S]*?\n\};/);
    assert(postAceInit, 'expected exports.postAceInit in index.js');
    const body = postAceInit[0];
    assert(/html10n\.bind\(\s*['"]localized['"]/.test(body),
        'postAceInit should subscribe to html10n.localized');
    assert(/niceSelect\(\s*['"]update['"]\s*\)/.test(body),
        'postAceInit should call niceSelect("update") when the language changes');
  });
});
