const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');

describe('libGD.js object serialization', function() {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
  });

  describe('gd.SerializerElement', function() {
    it('should support operations on its value', function() {
      var element = new gd.SerializerElement();
      element.setStringValue('aaa');
      expect(element.getStringValue()).toBe('aaa');

      element.setIntValue(123);
      expect(element.getIntValue()).toBe(123);

      element.setDoubleValue(123.457);
      expect(element.getDoubleValue()).toBeCloseTo(123.457);
    });
    it('should cast values from a type to another', function() {
      var element = new gd.SerializerElement();
      element.setStringValue('123');
      expect(element.getStringValue()).toBe('123');
      expect(element.getIntValue()).toBe(123);
      expect(element.getDoubleValue()).toBe(123.0);

      element.setStringValue('true');
      expect(element.getBoolValue()).toBe(true);
      element.setBoolValue(false);
      expect(element.getBoolValue()).toBe(false);
    });
    it('should support operations on its children', function() {
      var element = new gd.SerializerElement();

      expect(element.hasChild('Missing')).toBe(false);
      var child1 = element.addChild('Child1');
      expect(element.hasChild('Child1')).toBe(true);
      expect(element.getChild('Child1').ptr).toBe(child1.ptr);

      var child2 = new gd.SerializerElement();
      child2.addChild('subChild').setStringValue('Hello world!');
      element.addChild('Child2');
      element.setChild('Child2', child2);

      expect(
        element
          .getChild('Child2')
          .getChild('subChild')
          .getStringValue()
      ).toBe('Hello world!');
    });
  });

  describe('gd.Serializer', function() {
    it('should serialize a Text Object', function() {
      var obj = new gd.TextObject('testObject');
      obj.setText('Text of the object, with 官话 characters');

      var serializedObject = new gd.SerializerElement();
      obj.serializeTo(serializedObject);
      var jsonObject = gd.Serializer.toJSON(serializedObject);
      serializedObject.delete();
      obj.delete();

      expect(jsonObject).toBe(
        '{"bold":false,"italic":false,"smoothed":true,"underlined":false,"string":"Text of the object, with 官话 characters","font":"","textAlignment":"left","characterSize":20.0,"color":{"b":0,"g":0,"r":0},"content":{"bold":false,"isOutlineEnabled":false,"isShadowEnabled":false,"italic":false,"outlineColor":"255;255;255","outlineThickness":2.0,"shadowAngle":90.0,"shadowBlurRadius":2.0,"shadowColor":"0;0;0","shadowDistance":4.0,"shadowOpacity":127.0,"smoothed":true,"underlined":false,"text":"Text of the object, with 官话 characters","font":"","textAlignment":"left","characterSize":20.0,"color":"0;0;0"}}'
      );
    });
  });

  describe('gd.Serializer.fromJSON and gd.Serializer.toJSON', function() {
    const checkJsonParseAndStringify = (json) => {
      const element = gd.Serializer.fromJSON(json);
      const outputJson = gd.Serializer.toJSON(element);

      expect(outputJson).toBe(json);
    }

    it('should unserialize and reserialize JSON (string)', function() {
      checkJsonParseAndStringify(
        '"a"'
      );
      checkJsonParseAndStringify(
        '"String with 官话 characters"'
      );
      checkJsonParseAndStringify(
        '""'
      );
    });
    it('should unserialize and reserialize JSON (objects)', function() {
      checkJsonParseAndStringify(
        '{"a":{"a1":{"name":"","referenceTo":"/a/a1"}},"b":{"b1":"world"},"c":{"c1":3.0},"things":{"0":{"name":"layout0","referenceTo":"/layouts/layout"},"1":{"name":"layout1","referenceTo":"/layouts/layout"},"2":{"name":"layout2","referenceTo":"/layouts/layout"},"3":{"name":"layout3","referenceTo":"/layouts/layout"},"4":{"name":"layout4","referenceTo":"/layouts/layout"}}}'
      );
    });
    it('should unserialize and reserialize JSON (arrays)', function() {
      checkJsonParseAndStringify('[]');
      checkJsonParseAndStringify('[1]');
      checkJsonParseAndStringify('[1,2]');
      checkJsonParseAndStringify('[{}]');
      checkJsonParseAndStringify('[{"a":1}]');
      checkJsonParseAndStringify('[{"a":1},2]');
      checkJsonParseAndStringify('{"a":[1,2,{"b":3},{"c":[4,5]},6],"7":[]}');
    });
  });

  // TODO: test failures

  describe('gd.Serializer.fromJSObject and gd.Serializer.toJSObject', function() {
    const checkJsonParseAndStringify = (json) => {
      const object = JSON.parse(json);
      const element = gd.Serializer.fromJSObject(object);
      const outputObject = gd.Serializer.toJSObject(element);

      expect(JSON.stringify(outputObject)).toBe(json);
    }

    it('should unserialize and reserialize JSON (string)', function() {
      checkJsonParseAndStringify(
        '"a"'
      );
      checkJsonParseAndStringify(
        '"String with 官话 characters"'
      );
      checkJsonParseAndStringify(
        '""'
      );
    });
    it('should unserialize and reserialize JSON (objects)', function() {
      checkJsonParseAndStringify(
        '{"a":{"a1":{"name":"","referenceTo":"/a/a1"}},"b":{"b1":"world"},"c":{"c1":3},"things":{"0":{"name":"layout0","referenceTo":"/layouts/layout"},"1":{"name":"layout1","referenceTo":"/layouts/layout"},"2":{"name":"layout2","referenceTo":"/layouts/layout"},"3":{"name":"layout3","referenceTo":"/layouts/layout"},"4":{"name":"layout4","referenceTo":"/layouts/layout"}}}'
      );
    });
    it('should unserialize and reserialize JSON (arrays)', function() {
      checkJsonParseAndStringify('[]');
      checkJsonParseAndStringify('[1]');
      checkJsonParseAndStringify('[1,2]');
      checkJsonParseAndStringify('[{}]');
      checkJsonParseAndStringify('[{"a":1}]');
      checkJsonParseAndStringify('[{"a":1},2]');
      checkJsonParseAndStringify('{"7":[],"a":[1,2,{"b":3},{"c":[4,5]},6]}');
    });
  });
});
