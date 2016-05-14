var appUrl = 'http://localhost:9001';
var apiVersion = 1;

var supertest = require('ep_etherpad-lite/node_modules/supertest'),
           fs = require('fs'),
         path = require('path'),
      request = require('request'),
          api = supertest(appUrl),
 randomString = require('ep_etherpad-lite/static/js/pad_utils').randomString;


describe('export color styles to HTML', function(){
  var padID;
  var html;

  //create a new pad before each test run
  beforeEach(function(done){
    padID = randomString(5);

    createPad(padID, function() {
      setHTML(padID, html(), done);
    });
  });

  context('when pad text has one color', function() {
    before(function() {
      html = function() {
        return buildHTML(textWithColor("red"));
      }
    });

    it('returns ok', function(done) {
      api.get(getHTMLEndPointFor(padID))
      .expect(codeToBe0)
      .expect('Content-Type', /json/)
      .expect(200, done);
    });

    it('returns HTML with color class', function(done) {
      api.get(getHTMLEndPointFor(padID))
      .expect(function(res){
        var expectedRegex = regexWithColor("red");
        var expectedColors = new RegExp(expectedRegex);
        var html = res.body.data.html;
        var foundColor = html.match(expectedColors);
        if(!foundColor) throw new Error("Color not exported. Regex used: " + expectedRegex + ", html exported: " + html);
      })
      .end(done);
    });
  });

  context('when pad text has two colors in a single line', function() {
    before(function() {
      html = function() {
        return buildHTML(textWithColor("red") + textWithColor("blue"));
      }
    });

    it('returns HTML with two color spans', function(done) {
      api.get(getHTMLEndPointFor(padID))
      .expect(function(res){
        var firstColor = regexWithColor("red");
        var secondColor = regexWithColor("blue");
        var expectedRegex = firstColor + ".*" + secondColor;
        var expectedColors = new RegExp(expectedRegex);

        var html = res.body.data.html;
        var foundColor = html.match(expectedColors);
        if(!foundColor) throw new Error("Color not exported. Regex used: " + expectedRegex + ", html exported: " + html);
      })
      .end(done);
    });
  });

  context('when pad text has no colors', function() {
    before(function() {
      html = function() {
        return buildHTML("empty pad");
      }
    });

    it('returns HTML with no color', function(done) {
      api.get(getHTMLEndPointFor(padID))
      .expect(function(res){
        var expectedRegex = ".*empty pad.*";
        var noColor = new RegExp(expectedRegex);

        var html = res.body.data.html;
        var foundColor = html.match(noColor);
        if(!foundColor) throw new Error("Color exported, should not have any. Regex used: " + expectedRegex + ", html exported: " + html);
      })
      .end(done);
    });
  });

  context('when pad text has color inside strong', function() {
    before(function() {
      html = function() {
        return buildHTML("<strong>" + textWithColor("red", "this is red and bold") + "</strong>");
      }
    });

    // Etherpad exports tags using the order they are defined on the array (bold is always inside color)
    it('returns HTML with strong and color, in any order', function(done) {
      api.get(getHTMLEndPointFor(padID))
      .expect(function(res){
        var strongInsideColorRegex = regexWithColor("red", "<strong>this is red and bold<\/strong>");
        var colorInsideStrongRegex = "<strong>" + regexWithColor("red", "this is red and bold") + "<\/strong>";
        var expectedStrongInsideColor = new RegExp(strongInsideColorRegex);
        var expectedColorInsideStrong = new RegExp(colorInsideStrongRegex);

        var html = res.body.data.html;
        var foundColor = html.match(expectedStrongInsideColor) || html.match(expectedColorInsideStrong);
        if(!foundColor) throw new Error("Color not exported. Regex used: [" + strongInsideColorRegex + " || " + colorInsideStrongRegex + "], html exported: " + html);
      })
      .end(done);
    });
  });

  context('when pad text has strong inside color', function() {
    before(function() {
      html = function() {
        return buildHTML(textWithColor("red", "<strong>this is red and bold</strong>"));
      }
    });

    // Etherpad exports tags using the order they are defined on the array (bold is always inside color)
    it('returns HTML with strong and color, in any order', function(done) {
      api.get(getHTMLEndPointFor(padID))
      .expect(function(res){
        var strongInsideColorRegex = regexWithColor("red", "<strong>this is red and bold<\/strong>");
        var colorInsideStrongRegex = "<strong>" + regexWithColor("red", "this is red and bold") + "<\/strong>";
        var expectedStrongInsideColor = new RegExp(strongInsideColorRegex);
        var expectedColorInsideStrong = new RegExp(colorInsideStrongRegex);

        var html = res.body.data.html;
        var foundColor = html.match(expectedStrongInsideColor) || html.match(expectedColorInsideStrong);
        if(!foundColor) throw new Error("Color not exported. Regex used: [" + strongInsideColorRegex + " || " + colorInsideStrongRegex + "], html exported: " + html);
      })
      .end(done);
    });
  });

  context('when pad text has part with color and part without it', function() {
    before(function() {
      html = function() {
        return buildHTML("no color here " + textWithColor("red"));
      }
    });

    it('returns HTML with part with color and part without it', function(done) {
      api.get(getHTMLEndPointFor(padID))
      .expect(function(res){
        var expectedRegex = "no color here " + regexWithColor("red");
        var expectedColors = new RegExp(expectedRegex);
        var html = res.body.data.html;
        var foundColor = html.match(expectedColors);
        if(!foundColor) throw new Error("Color not exported. Regex used: " + expectedRegex + ", html exported: " + html);
      })
      .end(done);
    });
  });
})

// Loads the APIKEY.txt content into a string, and returns it.
var getApiKey = function() {
  var etherpad_root = '/../../../../../../ep_etherpad-lite/../..';
  var filePath = path.join(__dirname, etherpad_root + '/APIKEY.txt');
  var apiKey = fs.readFileSync(filePath,  {encoding: 'utf-8'});
  return apiKey.replace(/\n$/, "");
}

var apiKey = getApiKey();

// Creates a pad and returns the pad id. Calls the callback when finished.
var createPad = function(padID, callback) {
  api.get('/api/'+apiVersion+'/createPad?apikey='+apiKey+"&padID="+padID)
  .end(function(err, res){
    if(err || (res.body.code !== 0)) callback(new Error("Unable to create new Pad"));

    callback(padID);
  })
}

var setHTML = function(padID, html, callback) {
  api.get('/api/'+apiVersion+'/setHTML?apikey='+apiKey+"&padID="+padID+"&html="+html)
  .end(function(err, res){
    if(err || (res.body.code !== 0)) callback(new Error("Unable to set pad HTML"));

    callback(null, padID);
  })
}

var getHTMLEndPointFor = function(padID, callback) {
  return '/api/'+apiVersion+'/getHTML?apikey='+apiKey+"&padID="+padID;
}

var codeToBe = function(expectedCode, res) {
  if(res.body.code !== expectedCode){
    throw new Error("Code should be " + expectedCode + ", was " + res.body.code);
  }
}

var codeToBe0 = function(res) { codeToBe(0, res) }

var buildHTML = function(body) {
  return "<html><body>" + body + "</body></html>"
}

var textWithColor = function(color, text) {
  if (!text) text = "this is " + color;

  return "<span class='color:" + color + "'>" + text + "</span>";
}

var regexWithColor = function(color, text) {
  if (!text) text = "this is " + color;

  var regex = "<span .*class=['|\"].*color:" + color + ".*['|\"].*>" + text + "<\/span>";
  // bug fix: if no other plugin on the Etherpad instance returns a value on getLineHTMLForExport() hook,
  // data-color=(...) won't be replaced by class=color:(...), so we need a fallback regex
  var fallbackRegex = "<span .*data-color=['|\"]" + color + "['|\"].*>" + text + "<\/span>";

  return regex + " || " + fallbackRegex;
}

