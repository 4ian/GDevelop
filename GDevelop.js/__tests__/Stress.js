const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');

describe.skip('libGD.js - stress tests', function() {
  it('should support being required a lot', function() {
    jest.setTimeout(15000);
    process.setMaxListeners(40); //Avoid Node.js warning.
    return Promise.all(new Array(12).fill().map((_, i) => {
      return new Promise((resolve, reject) => {
        initializeGDevelopJs().then(gd => {
          var layout = new gd.Layout();
          layout.setName('Test #' + i);
          expect(layout.getName()).toBe('Test #' + i);
          layout.delete();
          resolve();
        });
      });
    }));
  });
  it('should support creates a lot of objects', function() {
    jest.setTimeout(15000);
    return initializeGDevelopJs().then(gd => {
      for (var i = 0; i < 75; ++i) {
        var layout = new gd.Layout();
        layout.setName('Test #' + i);
        expect(layout.getName()).toBe('Test #' + i);
        layout.delete();
      }
    });
  });
});
