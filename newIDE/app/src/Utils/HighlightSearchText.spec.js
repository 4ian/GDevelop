// @flow
import {
  getHighlightSearchTextParts,
  mergeStylizedText,
  applySyntaxColoring,
} from './HighlightSearchText';
import { makeTestProject } from '../fixtures/TestProject';

const gd: libGDevelop = global.gd;

describe('HighlightSearchText', () => {
  describe('getHighlightSearchTextParts', () => {
    it('can find an occurrence in a text', () => {
      expect(
        getHighlightSearchTextParts(
          '"Lorem ipsum" + "dolor sit amet"',
          'ipsum',
          {
            className: 'Highlighted',
          }
        )
      ).toMatchInlineSnapshot(
        [
          {
            startIndex: 0,
            endIndex: 7,
            props: {},
            key: 'ipsum-0',
          },
          {
            startIndex: 7,
            endIndex: 12,
            props: {
              className: 'Highlighted',
            },
            key: 'ipsum-1',
          },
          {
            startIndex: 12,
            endIndex: 32,
            props: {},
            key: 'ipsum-2',
          },
        ],
        `
        Array [
          Object {
            "endIndex": 7,
            "key": "ipsum-0",
            "props": Object {},
            "startIndex": 0,
          },
          Object {
            "endIndex": 12,
            "key": "ipsum-1",
            "props": Object {
              "className": "Highlighted",
            },
            "startIndex": 7,
          },
          Object {
            "endIndex": 32,
            "key": "ipsum-2",
            "props": Object {},
            "startIndex": 12,
          },
        ]
      `
      );
    });
  });

  describe('applySyntaxColoring', () => {
    it('can apply syntax coloring on an expression', () => {
      const {
        project,
        testSceneProjectScopedContainersAccessor,
      } = makeTestProject(gd);
      const text = '"Lorem ipsum" + "dolor sit amet"';
      const parser = new gd.ExpressionParser2();
      const rootNode = parser.parseExpression(text).get();
      expect(
        applySyntaxColoring({
          text,
          platform: project.getCurrentPlatform(),
          projectScopedContainers: testSceneProjectScopedContainersAccessor.get(),
          rootType: 'number',
          rootNode,
        })
      ).toMatchInlineSnapshot(
        `
        Array [
          Object {
            "endIndex": 13,
            "key": "color-part-0",
            "props": Object {
              "className": "instruction-parameter string",
            },
            "startIndex": 0,
          },
          Object {
            "endIndex": 16,
            "key": "color-part-1",
            "props": Object {
              "className": "instruction-parameter operator",
            },
            "startIndex": 13,
          },
          Object {
            "endIndex": 32,
            "key": "color-part-2",
            "props": Object {
              "className": "instruction-parameter string",
            },
            "startIndex": 16,
          },
        ]
      `
      );
      parser.delete();
    });
  });

  describe('mergeStylizedText', () => {
    it('can merge syntax coloring and search highlight with highlight over 1 color', () => {
      const {
        project,
        testSceneProjectScopedContainersAccessor,
      } = makeTestProject(gd);
      const text = '"Lorem ipsum" + "dolor sit amet"';
      const parser = new gd.ExpressionParser2();
      const rootNode = parser.parseExpression(text).get();
      expect(
        mergeStylizedText(
          getHighlightSearchTextParts(
            '"Lorem ipsum" + "dolor sit amet"',
            'ipsum',
            {
              className: 'Highlighted',
            }
          ),
          applySyntaxColoring({
            text,
            platform: project.getCurrentPlatform(),
            projectScopedContainers: testSceneProjectScopedContainersAccessor.get(),
            rootType: 'number',
            rootNode,
          })
        )
      ).toMatchInlineSnapshot(
        `
        Array [
          Object {
            "children": Array [
              Object {
                "endIndex": 7,
                "key": "color-part-0",
                "props": Object {
                  "className": "instruction-parameter string",
                },
                "startIndex": 0,
              },
            ],
            "endIndex": 7,
            "key": "ipsum-0",
            "props": Object {},
            "startIndex": 0,
          },
          Object {
            "children": Array [
              Object {
                "endIndex": 12,
                "key": "color-part-0",
                "props": Object {
                  "className": "instruction-parameter string",
                },
                "startIndex": 7,
              },
            ],
            "endIndex": 12,
            "key": "ipsum-1",
            "props": Object {
              "className": "Highlighted",
            },
            "startIndex": 7,
          },
          Object {
            "children": Array [
              Object {
                "endIndex": 13,
                "key": "color-part-0",
                "props": Object {
                  "className": "instruction-parameter string",
                },
                "startIndex": 12,
              },
              Object {
                "endIndex": 16,
                "key": "color-part-1",
                "props": Object {
                  "className": "instruction-parameter operator",
                },
                "startIndex": 13,
              },
              Object {
                "endIndex": 32,
                "key": "color-part-2",
                "props": Object {
                  "className": "instruction-parameter string",
                },
                "startIndex": 16,
              },
            ],
            "endIndex": 32,
            "key": "ipsum-2",
            "props": Object {},
            "startIndex": 12,
          },
        ]
      `
      );
      parser.delete();
    });
    it('can merge syntax coloring and search highlight with highlight over several colors', () => {
      const {
        project,
        testSceneProjectScopedContainersAccessor,
      } = makeTestProject(gd);
      const text = '"Lorem ipsum" + "dolor sit amet"';
      const parser = new gd.ExpressionParser2();
      const rootNode = parser.parseExpression(text).get();
      expect(
        mergeStylizedText(
          getHighlightSearchTextParts(
            '"Lorem ipsum" + "dolor sit amet"',
            'ipsum" + "dolor',
            {
              className: 'Highlighted',
            }
          ),
          applySyntaxColoring({
            text,
            platform: project.getCurrentPlatform(),
            projectScopedContainers: testSceneProjectScopedContainersAccessor.get(),
            rootType: 'number',
            rootNode,
          })
        )
      ).toMatchInlineSnapshot(`
        Array [
          Object {
            "children": Array [
              Object {
                "endIndex": 7,
                "key": "color-part-0",
                "props": Object {
                  "className": "instruction-parameter string",
                },
                "startIndex": 0,
              },
            ],
            "endIndex": 7,
            "key": "ipsum\\" + \\"dolor-0",
            "props": Object {},
            "startIndex": 0,
          },
          Object {
            "children": Array [
              Object {
                "endIndex": 13,
                "key": "color-part-0",
                "props": Object {
                  "className": "instruction-parameter string",
                },
                "startIndex": 7,
              },
              Object {
                "endIndex": 16,
                "key": "color-part-1",
                "props": Object {
                  "className": "instruction-parameter operator",
                },
                "startIndex": 13,
              },
              Object {
                "endIndex": 22,
                "key": "color-part-2",
                "props": Object {
                  "className": "instruction-parameter string",
                },
                "startIndex": 16,
              },
            ],
            "endIndex": 22,
            "key": "ipsum\\" + \\"dolor-1",
            "props": Object {
              "className": "Highlighted",
            },
            "startIndex": 7,
          },
          Object {
            "children": Array [
              Object {
                "endIndex": 32,
                "key": "color-part-2",
                "props": Object {
                  "className": "instruction-parameter string",
                },
                "startIndex": 22,
              },
            ],
            "endIndex": 32,
            "key": "ipsum\\" + \\"dolor-2",
            "props": Object {},
            "startIndex": 22,
          },
        ]
      `);
      parser.delete();
    });
  });
});
