const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');

describe('libGD.js - stress tests', function() {
  it('should support being required a lot', function() {
    process.setMaxListeners(40); //Avoid Node.js warning.
    return Promise.all(new Array(20).fill().map((_, i) => {
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
    return initializeGDevelopJs().then(gd => {
      for (var i = 0; i < 100; ++i) {
        var layout = new gd.Layout();
        layout.setName('Test #' + i);
        expect(layout.getName()).toBe('Test #' + i);
        layout.delete();
      }
    });
  });
});
