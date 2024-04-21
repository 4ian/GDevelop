const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');

describe('libGD.js - gd.Vector* tests', function() {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
  });

  describe('gd.VectorString', function() {
    let vector = null;
    beforeAll(() => vector = new gd.VectorString());

    it('should allow to add strings', function() {
      expect(vector.size()).toBe(0);
      vector.push_back('Hello world');
      expect(vector.size()).toBe(1);
      expect(vector.get(0)).toBe('Hello world');
    });
    it('can be converted to a JS array', function() {
      vector.push_back('Hello world 2');
      vector.push_back('Hello world 3');
      var array = vector.toJSArray();
      expect(Array.isArray(array)).toBe(true);
      expect(array.length).toBe(3);
      expect(array[0]).toBe('Hello world');
      expect(array[1]).toBe('Hello world 2');
    });
    it('can be cleared', function() {
      vector.clear();
      expect(vector.size()).toBe(0);
    });
    it('should allow to add lots of strings', function() {
      expect(vector.size()).toBe(0);
      for (var i = 0; i < 250; ++i) {
        vector.push_back('Hello world #' + i);
      }
      expect(vector.size()).toBe(250);
      expect(vector.get(34)).toBe('Hello world #34');
    });
    it('can change a string at a specified index', function() {
      var vector2 = new gd.VectorString();
      vector2.push_back('foo');
      vector2.push_back('bar');
      expect(vector2.size()).toBe(2);
      expect(vector2.get(1)).toBe('bar');

      expect(vector.set(56, 'Modified hello world'));
      expect(vector.get(34)).toBe('Hello world #34');
      expect(vector2.set(1, 'baz'));
      expect(vector.get(56)).toBe('Modified hello world');
      expect(vector2.get(1)).toBe('baz');
      expect(vector2.get(0)).toBe('foo');
      expect(vector.size()).toBe(250);
    });
    it('should allow to add UTF8 strings', function() {
      vector.clear();
      expect(vector.size()).toBe(0);
      vector.push_back('Bonjour à tous');
      vector.push_back('官话');
      expect(vector.size()).toBe(2);
      expect(vector.get(0)).toBe('Bonjour à tous');
      expect(vector.get(1)).toBe('官话');
    });

    afterAll(() => vector.delete());
  });
});
