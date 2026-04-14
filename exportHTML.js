'use strict';

const {inlineAttributeExport} = require('ep_plugin_helpers/attributes-server');

const colorExport = inlineAttributeExport({
  attr: 'color',
  exportCssFile: 'ep_font_color/static/css/color.css',
  exportDataAttr: 'data-color',
});

exports.exportHtmlAdditionalTagsWithData = colorExport.exportHtmlAdditionalTagsWithData;
exports.stylesForExport = colorExport.stylesForExport;
exports.getLineHTMLForExport = colorExport.getLineHTMLForExport;
