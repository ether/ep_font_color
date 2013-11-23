var _ = require('ep_etherpad-lite/static/js/underscore');

var colors = ['black', 'red', 'green', 'blue', 'yellow', 'orange'];

var collectContentPre = function(hook, context){
  var tname = context.tname;
  var state = context.state;
  var lineAttributes = state.lineAttributes
  var tagIndex = _.indexOf(colors, tname);

  if(tagIndex >= 0){
    lineAttributes['color'] = colors[tagIndex];
  }
};

var collectContentPost = function(hook, context){
  var tname = context.tname;
  var state = context.state;
  var lineAttributes = state.lineAttributes
  var tagIndex = _.indexOf(colors, tname);

  if(tagIndex >= 0){
    delete lineAttributes['color'];
  }
};

exports.collectContentPre = collectContentPre;
exports.collectContentPost = collectContentPost;
