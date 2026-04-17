'use strict';

const {inlineAttribute} = require('ep_plugin_helpers/attributes');

const colors = ['black', 'red', 'green', 'blue', 'yellow', 'orange'];

const fontColor = inlineAttribute({attr: 'color', values: colors});

exports.aceAttribsToClasses = fontColor.aceAttribsToClasses;
exports.aceCreateDomLine = fontColor.aceCreateDomLine;

// Bind the event handler to the toolbar buttons
exports.postAceInit = (hook, context) => {
  const hs = $('.color-selection, #color-selection');
  hs.on('change', function () {
    const value = $(this).val();
    const intValue = parseInt(value, 10);
    if (!isNaN(intValue)) {
      context.ace.callWithAce((ace) => {
        ace.ace_doInsertColors(intValue);
      }, 'insertColor', true);
      hs.val('dummy');
      context.ace.focus();
    }
  });
  $('.font_color').hover(() => {
    $('.submenu > .color-selection').attr('size', 6);
    $('.submenu > #color-selection').attr('size', 6);
  });
  $('.font-color-icon').on('click', () => {
    $('#font-color').toggle();
    context.ace.focus();
  });
  // Re-render the niceSelect dropdown whenever the active UI language
  // changes. html10n rewrites the underlying <select>'s option text in
  // place, but niceSelect renders into its own DOM tree at init time and
  // does not observe DOM mutations — so without a manual refresh the
  // dropdown keeps showing the previous language (#21).
  if (typeof html10n !== 'undefined' && typeof html10n.bind === 'function') {
    html10n.bind('localized', () => {
      hs.niceSelect('update');
    });
  }
};

const doInsertColors = function (level) {
  const rep = this.rep;
  const documentAttributeManager = this.documentAttributeManager;
  if (!(rep.selStart && rep.selEnd) || (level >= 0 && colors[level] === undefined)) {
    return;
  }

  let newColor = ['color', ''];
  if (level >= 0) {
    newColor = ['color', colors[level]];
  }

  documentAttributeManager.setAttributesOnRange(rep.selStart, rep.selEnd, [newColor]);
};

exports.aceInitialized = (hook, context) => {
  const editorInfo = context.editorInfo;
  editorInfo.ace_doInsertColors = doInsertColors.bind(context);
};

exports.postToolbarInit = (hook, context) => {
  const editbar = context.toolbar;

  editbar.registerCommand('fontColor', (buttonName, toolbar, item) => {
    $(item.$el).after($('#font-color'));
    $('#font-color').toggle();
  });
};

exports.aceEditEvent = (hook, call) => {
  const cs = call.callstack;
  const attrManager = call.documentAttributeManager;
  const rep = call.rep;
  const allowedEvents = ['handleClick', 'handleKeyEvent'];
  if (allowedEvents.indexOf(cs.type) === -1 && !(cs.docTextChanged)) {
    return;
  }

  if (cs.type === 'setBaseText' || cs.type === 'setup') return;
  setTimeout(() => {
    const colorSelect = $('.color-selection, #color-selection');
    colorSelect.val('dummy');
    colorSelect.niceSelect('update');
    if (rep.selStart[1] === 0) return;
    if (rep.selStart[1] === 1) {
      if (rep.alltext[0] === '*') return;
    }
    const startAttribs = attrManager.getAttributesOnPosition(rep.selStart[0], rep.selStart[1]);
    const endAttribs = attrManager.getAttributesOnPosition(rep.selEnd[0], rep.selEnd[1]);
    const [startColor] = startAttribs.filter((item) => item[0] === 'color');
    const [endColor] = endAttribs.filter((item) => item[0] === 'color');
    if (!startColor && !endColor) return;
    $.each(colors, (k, v) => {
      if (startColor && startColor[1] === v && (!endColor || endColor[1] === v)) {
        colorSelect.val(k);
      } else if (!startColor && endColor[1] === v) {
        colorSelect.val(k);
      }
    });
    colorSelect.niceSelect('update');
  }, 250);
};

exports.aceEditorCSS = () => ['ep_font_color/static/css/color.css'];
