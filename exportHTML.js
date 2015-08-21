var eejs = require('ep_etherpad-lite/node/eejs/');

var colors = ['color_black', 'color_red', 'color_green', 'color_blue', 'color_yellow', 'color_orange'];

// Add the props to be supported in export
exports.exportHtmlAdditionalTags = function(hook, pad, cb){
  cb(colors);
};

// Include CSS for HTML export
exports.stylesForExport = function(hook, padId, cb){
  var style = eejs.require("ep_font_color/static/css/color.css");
  cb(style);
};

exports.aceAttribClasses = function(hook_name, attr, cb){
  colors.forEach(function(color){
    attr[color] = color;
  });
  cb(attr);
}

// TODO: when "asyncLineHTMLForExport" hook is available on Etherpad, use it instead of "getLineHTMLForExport"
// exports.asyncLineHTMLForExport = function (hook, context, cb) {
//   cb(rewriteLine);
// }

exports.getLineHTMLForExport = function (hook, context) {
  rewriteLine(context);
}

function rewriteLine(context){
  var lineContent = context.lineContent;
  colors.forEach(function(color){
    if(lineContent){
      lineContent = lineContent.replaceAll("<"+color, "<span class='"+color+"'");
      lineContent = lineContent.replaceAll("</"+color, "</span");
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
