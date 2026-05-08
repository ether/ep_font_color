'use strict';

const {inlineAttribute} = require('ep_plugin_helpers/attributes');

const fontColor = inlineAttribute({attr: 'color'});

// Read a `style="color:..."` declaration on imported HTML and apply
// the matching `color::<value>` attribute. The `inlineAttribute` factory
// only reads `class="color:red"` (the form ep_font_color emits on
// export), so without this any externally-pasted HTML using the
// standard CSS form would silently lose color.
const STYLE_COLOR_RE = /(?:^|;|\s)color\s*:\s*([^;]+?)\s*(?:;|$)/i;
// Allowed values match the toolbar palette + a few CSS keywords.
const ALLOWED_COLORS = new Set([
  'black', 'red', 'green', 'blue', 'yellow', 'orange',
]);

const NAMED_TO_PALETTE = (raw) => {
  const v = raw.toLowerCase().trim();
  if (ALLOWED_COLORS.has(v)) return v;
  // Word/LibreOffice often emit hex (e.g. #FF0000). Fold common values
  // back to palette names; everything else falls through.
  if (/^#?ff0+0+$/i.test(v)) return 'red';
  if (/^#?0+ff0+$/i.test(v) || /^#?008000$/i.test(v)) return 'green';
  if (/^#?0+0+ff$/i.test(v)) return 'blue';
  if (/^#?ffff0+$/i.test(v)) return 'yellow';
  if (/^#?ff[ab]?500$/i.test(v) || v === 'orange') return 'orange';
  if (/^#?0+$/i.test(v) || v === 'black') return 'black';
  return null;
};

const collectContentPreOrig = fontColor.collectContentPre;
exports.collectContentPre = (hookName, context) => {
  collectContentPreOrig(hookName, context);
  if (context.styl) {
    const m = STYLE_COLOR_RE.exec(context.styl);
    if (m) {
      const color = NAMED_TO_PALETTE(m[1]);
      if (color) context.cc.doAttrib(context.state, `color::${color}`);
    }
  }
};
exports.collectContentPost = fontColor.collectContentPost;
