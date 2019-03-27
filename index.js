var eejs = require('ep_etherpad-lite/node/eejs/');
exports.eejsBlock_editbarMenuLeft = function (hook_name, args, cb) {
  args.content = args.content + eejs.require("ep_font_color/templates/editbarButtons.ejs");
  return cb();
}

exports.eejsBlock_dd_format = function(hook_name, args, cb){
  args.content = args.content + eejs.require("ep_font_color/templates/fileMenu.ejs");
  return cb();
}

exports.padInitToolbar = function (hook_name, args) {
  var toolbar = args.toolbar;

  var fontColor = toolbar.button({
      command: 'fontColor',
      class: "buttonicon font-color-icon ep_font_color"
  });

  toolbar.registerButton('fontColor', fontColor);
};
