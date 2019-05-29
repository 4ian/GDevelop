const initGDevelopJS = require('../../Binaries/Output/libGD.js/Release/libGD.js');

describe('libGD.js - stress tests', function() {
  it('should support being required a lot', function() {
    process.setMaxListeners(40); //Avoid Node.js warning.
    for (var i = 0; i < 20; ++i) {
      var gd = initGDevelopJS();
      var layout = new gd.Layout();
      layout.setName('Test #' + i);
      expect(layout.getName()).toBe('Test #' + i);
      layout.delete();
    }
  });
  it('should support creates a lot of objects', function() {
    var gd = initGDevelopJS();
    for (var i = 0; i < 100; ++i) {
      var layout = new gd.Layout();
      layout.setName('Test #' + i);
      expect(layout.getName()).toBe('Test #' + i);
      layout.delete();
    }
  });
});
