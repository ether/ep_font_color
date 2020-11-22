const _ = require('ep_etherpad-lite/static/js/underscore');
const eejs = require('ep_etherpad-lite/node/eejs/');

const colors = ['black', 'red', 'green', 'blue', 'yellow', 'orange'];

// Add the props to be supported in export
exports.exportHtmlAdditionalTagsWithData = async (hookName, pad) => findAllColorUsedOn(pad).map((name) => ['color', name]);

// Iterate over pad attributes to find only the color ones
function findAllColorUsedOn(pad) {
  const colorsUsed = [];
  pad.pool.eachAttrib((key, value) => { if (key === 'color') colorsUsed.push(value); });
  return colorsUsed;
}

// Include CSS for HTML export
exports.stylesForExport = async (hookName, padId) => eejs.require('ep_font_color/static/css/color.css');

exports.getLineHTMLForExport = async (hookName, context) => {
  // Replace data-color="foo" with class="color:x".
  context.lineContent =
      context.lineContent.replace(/data-color=["|']([0-9a-zA-Z]+)["|']/gi, 'class="color:$1"');
};
