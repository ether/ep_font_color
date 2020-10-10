describe("Set Font Color and ensure its removed properly", function(){

  // Tests still to do
  // Ensure additional chars keep the same formatting
  // Ensure heading value is properly set when caret is placed on font color changed content

  //create a new pad before each test run
  beforeEach(function(cb){
    helper.newPad(cb);
    this.timeout(60000);
  });

  // Create Pad
  // Select all text
  // Set it to Color red
  // Select all text
  // Set it to Color black

  it("Changes from Color black to red and back to black", function(done) {
    this.timeout(60000);
    var chrome$ = helper.padChrome$;
    var inner$ = helper.padInner$;

    var $firstTextElement = inner$("div").first();
    var $editorContainer = chrome$("#editorcontainer");

    var $editorContents = inner$("div")
    $firstTextElement.sendkeys('foo');
    $firstTextElement.sendkeys('{selectall}');

    // sets first line to Font Color red
    chrome$('.color-selection').val("1");
    chrome$('.color-selection').change();

    var fElement = inner$("div").first();
    helper.waitFor(function(){
      let elementHasClass = fElement.children().first().hasClass("color:red");
      return expect(elementHasClass).to.be(true);
    }).done(function(){
      $firstTextElement = inner$("div").first();
      $firstTextElement.sendkeys('{selectall}');
      // sets first line to Font Color black
      chrome$('.color-selection').val('0');
      chrome$('.color-selection').change();
      helper.waitFor(function(){
        fElement = inner$("div").first();
        let elementHasClass = fElement.children().first().hasClass("color:black");
        return expect(elementHasClass).to.be(true);
      }).done(function(){
        done();
      });
    });
  });
});

