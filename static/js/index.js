var _, $, jQuery;

var $ = require('ep_etherpad-lite/static/js/rjquery').$;
var _ = require('ep_etherpad-lite/static/js/underscore');
var cssFiles = ["ep_font_color/static/css/color.css"];

// All our colors are block elements, so we just return them.
var colors = ['black', 'red', 'green', 'blue', 'yellow', 'orange'];

// Bind the event handler to the toolbar buttons
var postAceInit = function(hook, context){
  var hs = $('.color-selection');
  hs.on('change', function(){
    var value = $(this).val();
    var intValue = parseInt(value,10);
    if(!_.isNaN(intValue)){
      context.ace.callWithAce(function(ace){
        ace.ace_doInsertColors(intValue);
      },'insertColor' , true);
      hs.val("dummy");
    }
  })
  $('.font_color').hover(function(){
    $('.submenu > .color-selection').attr('size', 6);
  });
  $('.font-color-icon').click(function(){
    $('#font-color').toggle();
  });
};

// Our colors attribute will result in a color:red... _yellow class
function aceAttribsToClasses(hook, context){
  if(context.key.indexOf("color:") !== -1){
    var color = /(?:^| )color:([A-Za-z0-9]*)/.exec(context.key);
    return ['color:' + color[1] ];
  }
  if(context.key == 'color'){
    return ['color:' + context.value ];
  }
}


// Here we convert the class color:red into a tag
exports.aceCreateDomLine = function(name, context){
  var cls = context.cls;
  var domline = context.domline;
  var colorsType = /(?:^| )color:([A-Za-z0-9]*)/.exec(cls);

  var tagIndex;
  if (colorsType) tagIndex = _.indexOf(colors, colorsType[1]);


  if (tagIndex !== undefined && tagIndex >= 0){
    var tag = colors[tagIndex];
    var modifier = {
      extraOpenTags: '',
      extraCloseTags: '',
      cls: cls
    };
    return [modifier];
  }
  return [];
};


// Find out which lines are selected and assign them the color attribute.
// Passing a level >= 0 will set a colors on the selected lines, level < 0
// will remove it
function doInsertColors(level){
  var rep = this.rep,
    documentAttributeManager = this.documentAttributeManager;
  if (!(rep.selStart && rep.selEnd) || (level >= 0 && colors[level] === undefined)){
    return;
  }

  var new_color = ["color", ""];
  if(level >= 0) {
    new_color = ["color", colors[level]];
  }

  documentAttributeManager.setAttributesOnRange(rep.selStart, rep.selEnd, [new_color]);
}


// Once ace is initialized, we set ace_doInsertColors and bind it to the context
function aceInitialized(hook, context){
  var editorInfo = context.editorInfo;
  editorInfo.ace_doInsertColors = _(doInsertColors).bind(context);
}

function aceEditorCSS(){
  return cssFiles;
};


// Export all hooks
exports.aceInitialized = aceInitialized;
exports.postAceInit = postAceInit;
exports.aceAttribsToClasses = aceAttribsToClasses;
exports.aceEditorCSS = aceEditorCSS;
