const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');

describe('libGD.js object serialization', function () {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
  });

  describe('gd.SerializerElement', function () {
    it('should support operations on its value', function () {
      var element = new gd.SerializerElement();
      element.setStringValue('aaa');
      expect(element.getStringValue()).toBe('aaa');

      element.setIntValue(123);
      expect(element.getIntValue()).toBe(123);

      element.setDoubleValue(123.457);
      expect(element.getDoubleValue()).toBeCloseTo(123.457);
    });
    it('should cast values from a type to another', function () {
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
    it('should support operations on its children', function () {
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
        element.getChild('Child2').getChild('subChild').getStringValue()
      ).toBe('Hello world!');
    });
  });

  describe('gd.Serializer', function () {
    it('should serialize a Text Object', function () {
      var obj = new gd.TextObject('testObject');
      obj.setText('Text of the object, with 官话 characters');

      var serializedObject = new gd.SerializerElement();
      obj.serializeTo(serializedObject);
      var jsonObject = gd.Serializer.toJSON(serializedObject);
      serializedObject.delete();
      obj.delete();

      expect(jsonObject).toBe(
        '{"bold":false,"italic":false,"smoothed":true,"underlined":false,"string":"Text of the object, with 官话 characters","font":"","textAlignment":"left","characterSize":20.0,"color":{"b":0,"g":0,"r":0},"content":{"bold":false,"isOutlineEnabled":false,"isShadowEnabled":false,"italic":false,"outlineColor":"255;255;255","outlineThickness":2.0,"shadowAngle":90.0,"shadowBlurRadius":2.0,"shadowColor":"0;0;0","shadowDistance":4.0,"shadowOpacity":127.0,"smoothed":true,"underlined":false,"text":"Text of the object, with 官话 characters","font":"","textAlignment":"left","verticalTextAlignment":"top","characterSize":20.0,"lineHeight":0.0,"color":"0;0;0"}}'
      );
    });
  });

  describe('gd.Serializer.fromJSON and gd.Serializer.toJSON', function () {
    const checkJsonParseAndStringify = (json) => {
      const element = gd.Serializer.fromJSON(json);
      const outputJson = gd.Serializer.toJSON(element);

      expect(outputJson).toBe(json);
    };

    it('should unserialize and reserialize JSON (string)', function () {
      checkJsonParseAndStringify('"a"');
      checkJsonParseAndStringify('"String with 官话 characters"');
      checkJsonParseAndStringify('""');
    });
    it('should unserialize and reserialize JSON (objects)', function () {
      checkJsonParseAndStringify(
        '{"a":{"a1":{"name":"","referenceTo":"/a/a1"}},"b":{"b1":"world"},"c":{"c1":3.0},"things":{"0":{"name":"layout0","referenceTo":"/layouts/layout"},"1":{"name":"layout1","referenceTo":"/layouts/layout"},"2":{"name":"layout2","referenceTo":"/layouts/layout"},"3":{"name":"layout3","referenceTo":"/layouts/layout"},"4":{"name":"layout4","referenceTo":"/layouts/layout"}}}'
      );
    });
    it('should unserialize and reserialize JSON (arrays)', function () {
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

  describe('gd.Serializer.fromJSObject and gd.Serializer.toJSObject', function () {
    const checkJsonParseAndStringify = (json) => {
      const object = JSON.parse(json);
      const element = gd.Serializer.fromJSObject(object);
      const outputObject = gd.Serializer.toJSObject(element);

      expect(JSON.stringify(outputObject)).toBe(json);
    };

    it('should unserialize and reserialize JSON (string)', function () {
      checkJsonParseAndStringify('"a"');
      checkJsonParseAndStringify('"String with 官话 characters"');
      checkJsonParseAndStringify('""');
    });
    it('should unserialize and reserialize JSON (objects)', function () {
      checkJsonParseAndStringify(
        '{"a":{"a1":{"name":"","referenceTo":"/a/a1"}},"b":{"b1":"world"},"c":{"c1":3},"things":{"0":{"name":"layout0","referenceTo":"/layouts/layout"},"1":{"name":"layout1","referenceTo":"/layouts/layout"},"2":{"name":"layout2","referenceTo":"/layouts/layout"},"3":{"name":"layout3","referenceTo":"/layouts/layout"},"4":{"name":"layout4","referenceTo":"/layouts/layout"}}}'
      );
    });
    it('should unserialize and reserialize JSON (arrays)', function () {
      checkJsonParseAndStringify('[]');
      checkJsonParseAndStringify('[1]');
      checkJsonParseAndStringify('[1,2]');
      checkJsonParseAndStringify('[{}]');
      checkJsonParseAndStringify('[{"a":1}]');
      checkJsonParseAndStringify('[{"a":1},2]');
      checkJsonParseAndStringify('{"7":[],"a":[1,2,{"b":3},{"c":[4,5]},6]}');
    });
  });

  describe('gd.Serializer canonical mode', function () {
    afterEach(() => {
      // Always reset, even if a test failed mid-way: leaving the flag on
      // would silently change the format of every subsequent test.
      gd.Serializer.setCanonicalMode(false);
    });

    it('defaults to off', function () {
      expect(gd.Serializer.isCanonicalMode()).toBe(false);
    });

    it('toggles on and off', function () {
      gd.Serializer.setCanonicalMode(true);
      expect(gd.Serializer.isCanonicalMode()).toBe(true);
      gd.Serializer.setCanonicalMode(false);
      expect(gd.Serializer.isCanonicalMode()).toBe(false);
    });

    const buildElement = () => {
      const element = new gd.SerializerElement();
      element.addChild('zeta').setStringValue('z');
      element.addChild('alpha').setStringValue('a');
      element.addChild('mu').setStringValue('m');
      return element;
    };

    it('keeps insertion key order when off', function () {
      const element = buildElement();
      const json = gd.Serializer.toJSON(element);
      element.delete();
      expect(json).toBe('{"zeta":"z","alpha":"a","mu":"m"}');
    });

    it('writes JSON keys alphabetically when on', function () {
      gd.Serializer.setCanonicalMode(true);
      const element = buildElement();
      const json = gd.Serializer.toJSON(element);
      element.delete();
      expect(json).toBe('{"alpha":"a","mu":"m","zeta":"z"}');
    });

    it('round-trips through fromJSON/toJSON in canonical mode', function () {
      gd.Serializer.setCanonicalMode(true);
      const input = '{"a":1,"b":{"x":[1,2,3],"y":"v"},"c":true}';
      const element = gd.Serializer.fromJSON(input);
      const json = gd.Serializer.toJSON(element);
      expect(json).toBe(input);
    });

    const serializeLayoutEvent = (canonicalMode) => {
      gd.Serializer.setCanonicalMode(canonicalMode);

      const project = new gd.ProjectHelper.createNewGDJSProject();
      const layout = project.insertNewLayout('Scene', 0);
      const events = layout.getEvents();
      events.insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0);

      const element = new gd.SerializerElement();
      events.serializeTo(element);
      const json = gd.Serializer.toJSON(element);
      element.delete();
      project.delete();

      return JSON.parse(json);
    };

    it('writes default booleans/empty arrays for an empty StandardEvent when on', function () {
      const eventsArray = serializeLayoutEvent(true);
      expect(Array.isArray(eventsArray)).toBe(true);
      expect(eventsArray.length).toBe(1);
      const event = eventsArray[0];

      expect(event.disabled).toBe(false);
      expect(event.folded).toBe(false);
      expect(event.events).toEqual([]);
      expect(event.variables).toBeDefined();

      // Keys must be alphabetical.
      const keys = Object.keys(event);
      const sorted = [...keys].sort();
      expect(keys).toEqual(sorted);
    });

    it('omits default values for an empty StandardEvent when off', function () {
      const eventsArray = serializeLayoutEvent(false);
      const event = eventsArray[0];

      expect(event.disabled).toBeUndefined();
      expect(event.folded).toBeUndefined();
      expect(event.events).toBeUndefined();
      expect(event.variables).toBeUndefined();
    });

    it('produces stable, byte-identical output across two serializations', function () {
      gd.Serializer.setCanonicalMode(true);
      const project = new gd.ProjectHelper.createNewGDJSProject();
      const layout = project.insertNewLayout('Scene', 0);
      layout.getObjects().insertNewObject(project, 'Sprite', 'Object1', 0);

      const elementA = new gd.SerializerElement();
      project.serializeTo(elementA);
      const jsonA = gd.Serializer.toJSON(elementA);
      elementA.delete();

      const elementB = new gd.SerializerElement();
      project.serializeTo(elementB);
      const jsonB = gd.Serializer.toJSON(elementB);
      elementB.delete();

      expect(jsonA).toBe(jsonB);

      project.delete();
    });

    it('round-trips through serialize -> deserialize -> serialize', function () {
      gd.Serializer.setCanonicalMode(true);
      const project = new gd.ProjectHelper.createNewGDJSProject();
      project.insertNewLayout('SceneA', 0);
      project.insertNewLayout('SceneB', 1);

      const elementA = new gd.SerializerElement();
      project.serializeTo(elementA);
      const jsonA = gd.Serializer.toJSON(elementA);
      elementA.delete();

      const elementB = gd.Serializer.fromJSON(jsonA);
      const project2 = new gd.ProjectHelper.createNewGDJSProject();
      project2.unserializeFrom(elementB);

      const elementC = new gd.SerializerElement();
      project2.serializeTo(elementC);
      const jsonB = gd.Serializer.toJSON(elementC);
      elementC.delete();

      expect(jsonB).toBe(jsonA);

      project.delete();
      project2.delete();
    });
  });

  describe('gd.BinarySerializer', function () {
    const serializeToBinarySnapshot = (serializerElement) => {
      // Create binary snapshot
      const binaryPtr =
        gd.BinarySerializer.createBinarySnapshot(serializerElement);
      const binarySize = gd.BinarySerializer.getLastBinarySnapshotSize();

      if (!binaryPtr) {
        throw new Error('Failed to create binary snapshot.');
      }

      const binaryView = new Uint8Array(
        gd.HEAPU8.buffer,
        binaryPtr,
        binarySize
      );
      // Copy the buffer out of the WASM heap to simulate it was transferred.
      const binaryBuffer = binaryView.slice();

      gd.BinarySerializer.freeBinarySnapshot(binaryPtr);

      return binaryBuffer;
    };

    const serializeJsonToBinarySnapshot = (json) => {
      const element = gd.Serializer.fromJSON(json);
      // Do NOT delete element, it's a static value.

      return serializeToBinarySnapshot(element);
    };

    const unserializeBinarySnapshotToJson = (binaryBuffer) => {
      const binaryArray =
        binaryBuffer instanceof Uint8Array
          ? binaryBuffer
          : new Uint8Array(binaryBuffer);
      const binarySize = binaryArray.byteLength || binaryArray.length;

      // Allocate memory in Emscripten heap and copy binary data
      const binaryPtr = gd._malloc(binarySize);
      gd.HEAPU8.set(binaryArray, binaryPtr);

      const element = gd.BinarySerializer.deserializeBinarySnapshot(
        binaryPtr,
        binarySize
      );

      // Free the input buffer
      gd._free(binaryPtr);

      if (element.ptr === 0) {
        throw new Error('Failed to deserialize binary snapshot.');
      }

      const json = gd.Serializer.toJSON(element);
      element.delete();
      return json;
    };

    const checkBinaryRoundTrip = (json) => {
      const binaryBuffer = serializeJsonToBinarySnapshot(json);
      expect(binaryBuffer).toBeInstanceOf(Uint8Array);
      expect(binaryBuffer.length).toBeGreaterThan(0);

      const outputJson = unserializeBinarySnapshotToJson(binaryBuffer);
      expect(outputJson).toBe(json);
    };

    it('should round-trip simple values', function () {
      checkBinaryRoundTrip('"hello"');
      checkBinaryRoundTrip('"hello"');
      checkBinaryRoundTrip('123');
      checkBinaryRoundTrip('123.456');
      checkBinaryRoundTrip('true');
      checkBinaryRoundTrip('false');
    });

    it('should round-trip strings with unicode characters', function () {
      checkBinaryRoundTrip('"String with 官话 characters"');
      checkBinaryRoundTrip('"Émojis: 🎮🎲🎯"');
    });

    it('should round-trip objects', function () {
      checkBinaryRoundTrip('{}');
      checkBinaryRoundTrip('{"a":"b"}');
      checkBinaryRoundTrip('{"a":{"nested":"value"}}');
      checkBinaryRoundTrip(
        '{"a":{"a1":{"name":"","referenceTo":"/a/a1"}},"b":{"b1":"world"},"c":{"c1":3.0}}'
      );
    });

    it('should round-trip arrays', function () {
      checkBinaryRoundTrip('[]');
      checkBinaryRoundTrip('[1]');
      checkBinaryRoundTrip('[1,2,3]');
      checkBinaryRoundTrip('[{"a":1},{"b":2}]');
      checkBinaryRoundTrip('{"items":[1,2,3],"nested":[{"x":1},{"y":2}]}');
    });

    it('should round-trip a complex object like a Text Object', function () {
      const obj = new gd.TextObject('testObject');
      obj.setText('Text with 官话 characters');

      const serializedElement = new gd.SerializerElement();
      obj.serializeTo(serializedElement);

      const binaryBuffer = serializeToBinarySnapshot(serializedElement);
      const jsonFromBinaryBuffer =
        unserializeBinarySnapshotToJson(binaryBuffer);

      // Compare JSON output from the original SerializerElement
      // with the JSON obtained from the binary buffer:
      const originalJson = gd.Serializer.toJSON(serializedElement);
      serializedElement.delete();
      obj.delete();

      expect(jsonFromBinaryBuffer).toBe(originalJson);
    });

    it('should round-trip a complex object like a Project', function () {
      const project = new gd.ProjectHelper.createNewGDJSProject();
      const layout = project.insertNewLayout('Scene', 0);
      layout.getObjects().insertNewObject(project, 'Sprite', 'Object1', 0);
      layout.getObjects().insertNewObject(project, 'Sprite', 'Object2', 1);
      const instance1 = layout.getInitialInstances().insertNewInitialInstance();
      const instance2 = layout.getInitialInstances().insertNewInitialInstance();
      instance1.setObjectName('Object1');
      instance2.setObjectName('Object2');

      const serializedElement = new gd.SerializerElement();
      project.serializeTo(serializedElement);

      const binaryBuffer = serializeToBinarySnapshot(serializedElement);
      const jsonFromBinaryBuffer =
        unserializeBinarySnapshotToJson(binaryBuffer);

      // Compare JSON output from the original SerializerElement
      // with the JSON obtained from the binary buffer:
      const originalJson = gd.Serializer.toJSON(serializedElement);
      serializedElement.delete();
      project.delete();

      expect(jsonFromBinaryBuffer).toBe(originalJson);
    });
  });
});
