var _, $, jQuery;

var $ = require('ep_etherpad-lite/static/js/rjquery').$;
var _ = require('ep_etherpad-lite/static/js/underscore');
var colorsClass = 'colors';

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
};

// Our colors attribute will result in a heaading:h1... :h6 class
function aceAttribsToClasses(hook, context){
  if(context.key == 'colors'){
    return ['colors:' + context.value ];
  }
}


// Here we convert the class colors:h1 into a tag
exports.aceCreateDomLine = function(name, context){
  var cls = context.cls;
  var domline = context.domline;
  var colorsType = /(?:^| )colors:([A-Za-z0-9]*)/.exec(cls);

  var tagIndex;
  if (colorsType) tagIndex = _.indexOf(colors, colorsType[1]);

      
  if (tagIndex !== undefined && tagIndex >= 0){
    var tag = colors[tagIndex];
    var modifier = {
      extraOpenTags: '<span style="color: ' + tag + ';">',
      extraCloseTags: '</span>',
      cls: cls
    };
    return [modifier];
  }
  return [];
};



// Find out which lines are selected and assign them the colors attribute.
// Passing a level >= 0 will set a colors on the selected lines, level < 0 
// will remove it
function doInsertColors(level){
  var rep = this.rep,
    documentAttributeManager = this.documentAttributeManager;
  if (!(rep.selStart && rep.selEnd) || (level >= 0 && colors[level] === undefined)){
    return;
  }
  
  if(level >= 0){
    documentAttributeManager.setAttributesOnRange(rep.selStart, rep.selEnd, [
      ['colors', colors[level]]
    ]);
  }else{
    documentAttributeManager.setAttributesOnRange(rep.selStart, rep.selEnd, [
      ['colors', '']
    ]);
  }
}


// Once ace is initialized, we set ace_doInsertColors and bind it to the context
function aceInitialized(hook, context){
  var editorInfo = context.editorInfo;
  editorInfo.ace_doInsertColors = _(doInsertColors).bind(context);
}


// Export all hooks
exports.aceInitialized = aceInitialized;
exports.postAceInit = postAceInit;
exports.aceAttribsToClasses = aceAttribsToClasses;
