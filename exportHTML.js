var eejs = require('ep_etherpad-lite/node/eejs/');
var _ = require('ep_etherpad-lite/static/js/underscore');

var colors = ['black', 'red', 'green', 'blue', 'yellow', 'orange'];

// Add the props to be supported in export
exports.exportHtmlAdditionalTags = function(hook, pad, cb){
  var colors_used = findAllColorUsedOn(pad);
  var tags = transformColorsIntoTags(colors_used);

  cb(tags);
};

// Iterate over pad attributes to find only the color ones
function findAllColorUsedOn(pad) {
  var colors_used = [];

  pad.pool.eachAttrib(function(key, value){
    if (key === "color") {
      colors_used.push(value);
    }
  });

  return colors_used;
}

// Transforms an array of color names into color tags like ["color", "red"]
function transformColorsIntoTags(color_names) {
  return _.map(color_names, function(color_name) {
    return ["color", color_name];
  });
}

// Include CSS for HTML export
exports.stylesForExport = function(hook, padId, cb){
  var style = eejs.require("ep_font_color/static/css/color.css");
  cb(style);
};

// TODO: when "asyncLineHTMLForExport" hook is available on Etherpad, use it instead of "getLineHTMLForExport"
// exports.asyncLineHTMLForExport = function (hook, context, cb) {
//   cb(rewriteLine);
// }

exports.getLineHTMLForExport = function (hook, context) {
  rewriteLine(context);
}

function rewriteLine(context){
  var lineContent = context.lineContent;
  colors.forEach(function(color_name){
    if(lineContent){
      lineContent = lineContent.replaceAll("<color:"+color_name, "<span class='color:"+color_name+"'");
      lineContent = lineContent.replaceAll("</color:"+color_name, "</span");
    }
  });

  // TODO: when "asyncLineHTMLForExport" hook is available on Etherpad, return "lineContent" instead of re-setting it
  context.lineContent = lineContent;
  // return lineContent;
}

// Got this from ep_font_size
String.prototype.replaceAll = function(str1, str2, ignore)
{
  return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
}
