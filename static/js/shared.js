'use strict';

const {inlineAttribute} = require('ep_plugin_helpers/attributes');

const fontColor = inlineAttribute({attr: 'color'});

exports.collectContentPre = fontColor.collectContentPre;
exports.collectContentPost = fontColor.collectContentPost;
