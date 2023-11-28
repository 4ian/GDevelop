const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const { makeBenchmarkSuite } = require('../TestUtils/BenchmarkSuite.js');

describe.skip('gd.Serializer benchmarks', function () {
  let gd = null;
  var partialJson = `
        { "a1": { "name": "", "referenceTo": "/a/a1" } },
        { "b1": "world" },
        { "c1": 3 },
        {
          "0": { "name": "layout0", "referenceTo": "/layouts/layout" },
          "1": { "name": "layout1", "referenceTo": "/layouts/layout" },
          "2": { "name": "layout2", "referenceTo": "/layouts/layout" },
          "3": { "name": "layout3", "referenceTo": "/layouts/layout" },
          "4": { "name": "layout4", "referenceTo": "/layouts/layout" }
        }
      `;

  const json = '[' + new Array(1000).fill(partialJson).join(',') + ']';
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
  });

  it('Benchmark JSON string -> SerializerElement', function () {
    const benchmarkSuite = makeBenchmarkSuite({
      benchmarksCount: 3,
      iterationsCount: 4,
    })
      .add('fromJSON', () => {
        gd.Serializer.fromJSON(json);
      })
      .add('JSON.parse + fromJSObject', () => {
        gd.Serializer.fromJSObject(JSON.parse(json));
      });

    console.log(benchmarkSuite.run());
  });

  it('Benchmark JavaScript Object -> SerializerElement', function () {
    const jsObject = JSON.parse(json);
    const benchmarkSuite = makeBenchmarkSuite({
      benchmarksCount: 3,
      iterationsCount: 4,
    })
      .add('JSON.stringify + fromJSON', () => {
        gd.Serializer.fromJSON(JSON.stringify(jsObject));
      })
      .add('fromJSObject', () => {
        gd.Serializer.fromJSObject(jsObject);
      });

    console.log(benchmarkSuite.run());
  });

  it('Benchmark SerializerElement -> JSON string', function () {
    const element = gd.Serializer.fromJSON(json);

    const benchmarkSuite = makeBenchmarkSuite({
      benchmarksCount: 3,
      iterationsCount: 4,
    })
      .add('toJSON', () => {
        var outputJson = gd.Serializer.toJSON(element);
      })
      .add('toJSObject + JSON.stringify', () => {
        var outputJson = JSON.stringify(gd.Serializer.toJSObject(element));
      });

    console.log(benchmarkSuite.run());
  });

  it('Benchmark SerializerElement -> JavaScript Object', function () {
    const element = gd.Serializer.fromJSON(json);

    const benchmarkSuite = makeBenchmarkSuite({
      benchmarksCount: 3,
      iterationsCount: 4,
    })
      .add('JSON.parse + toJSON', () => {
        JSON.parse(gd.Serializer.toJSON(element));
      })
      .add('toJSObject', () => {
        gd.Serializer.toJSObject(element);
      });

    console.log(benchmarkSuite.run());
  });
});
