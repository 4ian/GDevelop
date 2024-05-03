const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const { makeMinimalGDJSMock } = require('../TestUtils/GDJSMocks');
const {
  generateCompiledEventsForEventsFunction,
  generateCompiledEventsFromSerializedEvents,
} = require('../TestUtils/CodeGenerationHelpers.js');

describe('libGD.js - GDJS Boolean Operator Code Generation integration tests', () => {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
  });

  const generateAndRunVariableAffectationWithConditions = (conditions) => {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions,
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['SuccessVariable', '=', '1'],
          },
        ],
        events: [],
      },
    ]);

    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement,
      {
        parameterTypes: {
          MyObjectA1: 'object',
          MyObjectA2: 'object',
          MyObjectB1: 'object',
          MyObjectB2: 'object',
          MyObjectC1: 'object',
          MyObjectC2: 'object',
          MyObjectD1: 'object',
          MyObjectD2: 'object',
        },
        groups: {
          MyGroupA: ['MyObjectA1', 'MyObjectA2'],
          MyGroupB: ['MyObjectB1', 'MyObjectB2'],
          MyGroupC: ['MyObjectC1', 'MyObjectC2'],
          MyGroupD: ['MyObjectD1', 'MyObjectD2'],
        },
        logCode: false,
      }
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    const parameters = [
      'MyObjectA1',
      'MyObjectA2',
      'MyObjectB1',
      'MyObjectB2',
      'MyObjectC1',
      'MyObjectC2',
      'MyObjectD1',
      'MyObjectD2',
    ].map((objectName) => {
      const myObject = runtimeScene.createObject(objectName);
      myObject.getVariables().get('MyVariable').setNumber(1);
      const objectLists = new gdjs.Hashtable();
      objectLists.put(objectName, [myObject]);
      return objectLists;
    });
    runCompiledEvents(gdjs, runtimeScene, parameters);
    return runtimeScene;
  };

  it('generates a working function with nested Or and StrEqual', function () {
    // Create nested events using Or and StrEqual conditions
    const runtimeScene = generateAndRunVariableAffectationWithConditions([
      {
        type: {
          value: 'BuiltinCommonInstructions::Or',
        },
        parameters: [],
        subInstructions: [
          {
            type: { value: 'Egal' },
            parameters: ['1', '=', '2'],
          },
          {
            type: {
              value: 'BuiltinCommonInstructions::Or',
            },
            parameters: [],
            subInstructions: [
              // This should be true and make the entire conditions true.
              {
                type: { value: 'StrEqual' },
                parameters: ['"1"', '=', '"1"'],
              },
            ],
          },
          {
            type: { value: 'StrEqual' },
            parameters: ['"1"', '=', '"2"'],
          },
        ],
      },
    ]);

    expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(true);
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(1);
  });

  it('generates a working function with nested And and StrEqual', function () {
    // Create nested events using And and StrEqual conditions
    const runtimeScene = generateAndRunVariableAffectationWithConditions([
      {
        type: {
          value: 'BuiltinCommonInstructions::And',
        },
        parameters: [],
        subInstructions: [
          {
            type: { value: 'Egal' },
            parameters: ['1', '=', '1'],
          },
          {
            type: {
              value: 'BuiltinCommonInstructions::And',
            },
            parameters: [],
            subInstructions: [
              {
                type: { value: 'Egal' },
                parameters: ['1', '=', '1'],
              },
              {
                type: {
                  value: 'BuiltinCommonInstructions::And',
                },
                parameters: [],
                subInstructions: [
                  {
                    type: { value: 'Egal' },
                    parameters: ['1', '=', '1'],
                  },
                  {
                    type: { value: 'StrEqual' },
                    parameters: ['"1"', '=', '"1"'],
                  },
                ],
              },
              {
                type: { value: 'StrEqual' },
                parameters: ['"1"', '=', '"1"'],
              },
            ],
          },
          {
            type: { value: 'StrEqual' },
            parameters: ['"1"', '=', '"1"'],
          },
        ],
      },
    ]);

    expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(true);
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(1);
  });

  const objectNames = ['MyObjectA1', 'MyObjectB1', 'MyObjectC1', 'MyObjectD1'];
  const groupNames = ['MyGroupA', 'MyGroupB', 'MyGroupC', 'MyGroupD'];
  [
    {
      caseName: 'Simple condition',
      trueEqualsCondition: Array(4).fill({
        type: { value: 'Egal' },
        parameters: ['1', '=', '1'],
      }),
      falseEqualsCondition: Array(4).fill({
        type: { value: 'Egal' },
        parameters: ['1', '=', '0'],
      }),
    },
    // The conditions use a different object to avoid picking side effects.
    {
      caseName: 'Condition on an object',
      trueEqualsCondition: objectNames.map((objectName) => ({
        type: { value: 'VarObjet' },
        parameters: [objectName, 'MyVariable', '=', '1'],
      })),
      falseEqualsCondition: objectNames.map((objectName) => ({
        type: { value: 'VarObjet' },
        parameters: [objectName, 'MyVariable', '=', '8'],
      })),
    },
    {
      caseName: 'Condition on a group',
      trueEqualsCondition: groupNames.map((groupName) => ({
        type: { value: 'VarObjet' },
        parameters: [groupName, 'MyVariable', '=', '1'],
      })),
      falseEqualsCondition: groupNames.map((groupName) => ({
        type: { value: 'VarObjet' },
        parameters: [groupName, 'MyVariable', '=', '8'],
      })),
    },
  ].forEach(({ caseName, trueEqualsCondition, falseEqualsCondition }) => {
    const conditionA = (a) =>
      a ? trueEqualsCondition[0] : falseEqualsCondition[0];
    const conditionB = (b) =>
      b ? trueEqualsCondition[1] : falseEqualsCondition[1];
    const conditionC = (c) =>
      c ? trueEqualsCondition[2] : falseEqualsCondition[2];
    const conditionD = (d) =>
      d ? trueEqualsCondition[3] : falseEqualsCondition[3];

    describe(caseName, function () {
      [false, true].forEach((a) => {
        const result = a;
        it(`can generate a condition list with one condition: ${a} is ${result}`, function () {
          const runtimeScene = generateAndRunVariableAffectationWithConditions([
            conditionA(a),
          ]);

          expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(
            result
          );
          if (result) {
            expect(
              runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
            ).toBe(1);
          }
        });
      });

      [false, true].forEach((a) => {
        [false, true].forEach((b) => {
          const result = a && b;
          it(`can generate a condition list: ${a} && ${b} is ${result}`, function () {
            const runtimeScene =
              generateAndRunVariableAffectationWithConditions([
                conditionA(a),
                conditionB(b),
              ]);

            expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(
              result
            );
            if (result) {
              expect(
                runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
              ).toBe(1);
            }
          });
        });
      });

      [false, true].forEach((a) => {
        [false, true].forEach((b) => {
          const result = a && b;
          it(`can generate a And: ${a} && ${b} is ${result}`, function () {
            const runtimeScene =
              generateAndRunVariableAffectationWithConditions([
                {
                  type: {
                    value: 'BuiltinCommonInstructions::And',
                  },
                  parameters: [],
                  subInstructions: [conditionA(a), conditionB(b)],
                },
              ]);

            expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(
              result
            );
            if (result) {
              expect(
                runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
              ).toBe(1);
            }
          });
        });
      });

      [false, true].forEach((a) => {
        const result = a;
        it(`can generate a And with one operand: ${a} is ${result}`, function () {
          const runtimeScene = generateAndRunVariableAffectationWithConditions([
            {
              type: {
                value: 'BuiltinCommonInstructions::And',
              },
              parameters: [],
              subInstructions: [conditionA(a)],
            },
          ]);

          expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(
            result
          );
          if (result) {
            expect(
              runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
            ).toBe(1);
          }
        });
      });

      [false, true].forEach((a) => {
        [false, true].forEach((b) => {
          const result = a || b;
          it(`can generate a Or: ${a} || ${b} is ${result}`, function () {
            const runtimeScene =
              generateAndRunVariableAffectationWithConditions([
                {
                  type: {
                    value: 'BuiltinCommonInstructions::Or',
                  },
                  parameters: [],
                  subInstructions: [conditionA(a), conditionB(b)],
                },
              ]);

            expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(
              result
            );
            if (result) {
              expect(
                runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
              ).toBe(1);
            }
          });
        });
      });

      [false, true].forEach((a) => {
        const result = a;
        it(`can generate a Or with one operand: ${a} is ${result}`, function () {
          const runtimeScene = generateAndRunVariableAffectationWithConditions([
            {
              type: {
                value: 'BuiltinCommonInstructions::Or',
              },
              parameters: [],
              subInstructions: [conditionA(a)],
            },
          ]);

          expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(
            result
          );
          if (result) {
            expect(
              runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
            ).toBe(1);
          }
        });
      });

      [false, true].forEach((a) => {
        const result = !a;
        it(`can generate a Not: !${a} is ${result}`, function () {
          const runtimeScene = generateAndRunVariableAffectationWithConditions([
            {
              type: {
                value: 'BuiltinCommonInstructions::Not',
              },
              parameters: [],
              subInstructions: [conditionA(a)],
            },
          ]);

          expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(
            result
          );
          if (result) {
            expect(
              runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
            ).toBe(1);
          }
        });
      });

      [false, true].forEach((a) => {
        [false, true].forEach((b) => {
          const result = !(a && b);
          it(`can generate a Not: !(${a} && ${b}) is ${result}`, function () {
            const runtimeScene =
              generateAndRunVariableAffectationWithConditions([
                {
                  type: {
                    value: 'BuiltinCommonInstructions::Not',
                  },
                  parameters: [],
                  subInstructions: [conditionA(a), conditionB(b)],
                },
              ]);

            expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(
              result
            );
            if (result) {
              expect(
                runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
              ).toBe(1);
            }
          });
        });
      });

      [false, true].forEach((a) => {
        [false, true].forEach((b) => {
          const result = a && !b;
          it(`can generate a Not: ${a} && !${b} is ${result}`, function () {
            const runtimeScene =
              generateAndRunVariableAffectationWithConditions([
                conditionA(a),
                {
                  type: {
                    value: 'BuiltinCommonInstructions::Not',
                  },
                  parameters: [],
                  subInstructions: [conditionB(b)],
                },
              ]);

            expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(
              result
            );
            if (result) {
              expect(
                runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
              ).toBe(1);
            }
          });
        });
      });

      [false, true].forEach((a) => {
        [false, true].forEach((b) => {
          const result = !a && b;
          it(`can generate a Not: !${a} && ${b} is ${result}`, function () {
            const runtimeScene =
              generateAndRunVariableAffectationWithConditions([
                {
                  type: {
                    value: 'BuiltinCommonInstructions::Not',
                  },
                  parameters: [],
                  subInstructions: [conditionA(a)],
                },
                conditionB(b),
              ]);

            expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(
              result
            );
            if (result) {
              expect(
                runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
              ).toBe(1);
            }
          });
        });
      });

      [false, true].forEach((a) => {
        [false, true].forEach((b) => {
          const result = !(a && !b);
          it(`can generate a Not of Not: !(${a} && !${b}) is ${result}`, function () {
            const runtimeScene =
              generateAndRunVariableAffectationWithConditions([
                {
                  type: {
                    value: 'BuiltinCommonInstructions::Not',
                  },
                  parameters: [],
                  subInstructions: [
                    conditionA(a),
                    {
                      type: {
                        value: 'BuiltinCommonInstructions::Not',
                      },
                      parameters: [],
                      subInstructions: [conditionB(b)],
                    },
                  ],
                },
              ]);

            expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(
              result
            );
            if (result) {
              expect(
                runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
              ).toBe(1);
            }
          });
        });
      });

      [false, true].forEach((a) => {
        [false, true].forEach((b) => {
          const result = !(!a && b);
          it(`can generate a Not of Not: !(!${a} && ${b}) is ${result}`, function () {
            const runtimeScene =
              generateAndRunVariableAffectationWithConditions([
                {
                  type: {
                    value: 'BuiltinCommonInstructions::Not',
                  },
                  parameters: [],
                  subInstructions: [
                    {
                      type: {
                        value: 'BuiltinCommonInstructions::Not',
                      },
                      parameters: [],
                      subInstructions: [conditionA(a)],
                    },
                    conditionB(b),
                  ],
                },
              ]);

            expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(
              result
            );
            if (result) {
              expect(
                runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
              ).toBe(1);
            }
          });
        });
      });

      [false, true].forEach((a) => {
        [false, true].forEach((b) => {
          const result = !(a && b);
          it(`can generate a Not of And: !(${a} && ${b}) is ${result}`, function () {
            const runtimeScene =
              generateAndRunVariableAffectationWithConditions([
                {
                  type: {
                    value: 'BuiltinCommonInstructions::Not',
                  },
                  parameters: [],
                  subInstructions: [
                    {
                      type: {
                        value: 'BuiltinCommonInstructions::And',
                      },
                      parameters: [],
                      subInstructions: [conditionA(a), conditionB(b)],
                    },
                  ],
                },
              ]);

            expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(
              result
            );
            if (result) {
              expect(
                runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
              ).toBe(1);
            }
          });
        });
      });

      [false, true].forEach((a) => {
        [false, true].forEach((b) => {
          const result = a && !b;
          it(`can generate a And of Not: ${a} && !${b} is ${result}`, function () {
            const runtimeScene =
              generateAndRunVariableAffectationWithConditions([
                {
                  type: {
                    value: 'BuiltinCommonInstructions::And',
                  },
                  parameters: [],
                  subInstructions: [
                    conditionA(a),
                    {
                      type: {
                        value: 'BuiltinCommonInstructions::Not',
                      },
                      parameters: [],
                      subInstructions: [conditionB(b)],
                    },
                  ],
                },
              ]);

            expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(
              result
            );
            if (result) {
              expect(
                runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
              ).toBe(1);
            }
          });
        });
      });

      [false, true].forEach((a) => {
        [false, true].forEach((b) => {
          const result = !a && b;
          it(`can generate a And of Not: !${a} && ${b} is ${result}`, function () {
            const runtimeScene =
              generateAndRunVariableAffectationWithConditions([
                {
                  type: {
                    value: 'BuiltinCommonInstructions::And',
                  },
                  parameters: [],
                  subInstructions: [
                    {
                      type: {
                        value: 'BuiltinCommonInstructions::Not',
                      },
                      parameters: [],
                      subInstructions: [conditionA(a)],
                    },
                    conditionB(b),
                  ],
                },
              ]);

            expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(
              result
            );
            if (result) {
              expect(
                runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
              ).toBe(1);
            }
          });
        });
      });

      [false, true].forEach((a) => {
        [false, true].forEach((b) => {
          const result = !(a || b);
          it(`can generate a Not of Or: !(${a} || ${b}) is ${result}`, function () {
            const runtimeScene =
              generateAndRunVariableAffectationWithConditions([
                {
                  type: {
                    value: 'BuiltinCommonInstructions::Not',
                  },
                  parameters: [],
                  subInstructions: [
                    {
                      type: {
                        value: 'BuiltinCommonInstructions::Or',
                      },
                      parameters: [],
                      subInstructions: [conditionA(a), conditionB(b)],
                    },
                  ],
                },
              ]);

            expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(
              result
            );
            if (result) {
              expect(
                runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
              ).toBe(1);
            }
          });
        });
      });

      [false, true].forEach((a) => {
        [false, true].forEach((b) => {
          const result = a || !b;
          it(`can generate a Or of Not: ${a} || !${b} is ${result}`, function () {
            const runtimeScene =
              generateAndRunVariableAffectationWithConditions([
                {
                  type: {
                    value: 'BuiltinCommonInstructions::Or',
                  },
                  parameters: [],
                  subInstructions: [
                    conditionA(a),
                    {
                      type: {
                        value: 'BuiltinCommonInstructions::Not',
                      },
                      parameters: [],
                      subInstructions: [conditionB(b)],
                    },
                  ],
                },
              ]);

            expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(
              result
            );
            if (result) {
              expect(
                runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
              ).toBe(1);
            }
          });
        });
      });

      [false, true].forEach((a) => {
        [false, true].forEach((b) => {
          const result = !a || b;
          it(`can generate a Or of Not: !${a} || ${b} is ${result}`, function () {
            const runtimeScene =
              generateAndRunVariableAffectationWithConditions([
                {
                  type: {
                    value: 'BuiltinCommonInstructions::Or',
                  },
                  parameters: [],
                  subInstructions: [
                    {
                      type: {
                        value: 'BuiltinCommonInstructions::Not',
                      },
                      parameters: [],
                      subInstructions: [conditionA(a)],
                    },
                    conditionB(b),
                  ],
                },
              ]);

            expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(
              result
            );
            if (result) {
              expect(
                runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
              ).toBe(1);
            }
          });
        });
      });

      [false, true].forEach((a) => {
        [false, true].forEach((b) => {
          [false, true].forEach((c) => {
            [false, true].forEach((d) => {
              const result = (a && b) || (c && d);
              it(`can generate a Or of And: (${a} && ${b}) || (${c} && ${d}) is ${result}`, function () {
                const runtimeScene =
                  generateAndRunVariableAffectationWithConditions([
                    {
                      type: {
                        value: 'BuiltinCommonInstructions::Or',
                      },
                      parameters: [],
                      subInstructions: [
                        {
                          type: {
                            value: 'BuiltinCommonInstructions::And',
                          },
                          parameters: [],
                          subInstructions: [conditionA(a), conditionB(b)],
                        },
                        {
                          type: {
                            value: 'BuiltinCommonInstructions::And',
                          },
                          parameters: [],
                          subInstructions: [conditionC(c), conditionD(d)],
                        },
                      ],
                    },
                  ]);

                expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(
                  result
                );
                if (result) {
                  expect(
                    runtimeScene
                      .getVariables()
                      .get('SuccessVariable')
                      .getAsNumber()
                  ).toBe(1);
                }
              });
            });
          });
        });
      });

      [false, true].forEach((a) => {
        [false, true].forEach((b) => {
          [false, true].forEach((c) => {
            [false, true].forEach((d) => {
              const result = (a || b) && (c || d);
              it(`can generate a And of Or: (${a} || ${b}) && (${c} || ${d}) is ${result}`, function () {
                const runtimeScene =
                  generateAndRunVariableAffectationWithConditions([
                    {
                      type: {
                        value: 'BuiltinCommonInstructions::And',
                      },
                      parameters: [],
                      subInstructions: [
                        {
                          type: {
                            value: 'BuiltinCommonInstructions::Or',
                          },
                          parameters: [],
                          subInstructions: [conditionA(a), conditionB(b)],
                        },
                        {
                          type: {
                            value: 'BuiltinCommonInstructions::Or',
                          },
                          parameters: [],
                          subInstructions: [conditionC(c), conditionD(d)],
                        },
                      ],
                    },
                  ]);

                expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(
                  result
                );
                if (result) {
                  expect(
                    runtimeScene
                      .getVariables()
                      .get('SuccessVariable')
                      .getAsNumber()
                  ).toBe(1);
                }
              });
            });
          });
        });
      });

      [false, true].forEach((a) => {
        [false, true].forEach((b) => {
          [false, true].forEach((c) => {
            [false, true].forEach((d) => {
              const result = !(!(!a && !b) || !(!c && !d));
              it(`can generate a Or of And with Not everywhere: !(!(!${a} && !${b}) || !(!${c} && !${d})) is ${result}`, function () {
                const runtimeScene =
                  generateAndRunVariableAffectationWithConditions([
                    {
                      type: {
                        value: 'BuiltinCommonInstructions::Not',
                      },
                      parameters: [],
                      subInstructions: [
                        {
                          type: {
                            value: 'BuiltinCommonInstructions::Or',
                          },
                          parameters: [],
                          subInstructions: [
                            {
                              type: {
                                value: 'BuiltinCommonInstructions::Not',
                              },
                              parameters: [],
                              subInstructions: [
                                {
                                  type: {
                                    value: 'BuiltinCommonInstructions::And',
                                  },
                                  parameters: [],
                                  subInstructions: [
                                    {
                                      type: {
                                        value: 'BuiltinCommonInstructions::Not',
                                      },
                                      parameters: [],
                                      subInstructions: [conditionA(a)],
                                    },
                                    {
                                      type: {
                                        value: 'BuiltinCommonInstructions::Not',
                                      },
                                      parameters: [],
                                      subInstructions: [conditionB(b)],
                                    },
                                  ],
                                },
                              ],
                            },
                            {
                              type: {
                                value: 'BuiltinCommonInstructions::Not',
                              },
                              parameters: [],
                              subInstructions: [
                                {
                                  type: {
                                    value: 'BuiltinCommonInstructions::And',
                                  },
                                  parameters: [],
                                  subInstructions: [
                                    {
                                      type: {
                                        value: 'BuiltinCommonInstructions::Not',
                                      },
                                      parameters: [],
                                      subInstructions: [conditionC(c)],
                                    },
                                    {
                                      type: {
                                        value: 'BuiltinCommonInstructions::Not',
                                      },
                                      parameters: [],
                                      subInstructions: [conditionD(d)],
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ]);

                expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(
                  result
                );
                if (result) {
                  expect(
                    runtimeScene
                      .getVariables()
                      .get('SuccessVariable')
                      .getAsNumber()
                  ).toBe(1);
                }
              });
            });
          });
        });
      });

      [false, true].forEach((a) => {
        [false, true].forEach((b) => {
          [false, true].forEach((c) => {
            [false, true].forEach((d) => {
              const result = !(!(!a || !b) && !(!c || !d));
              it(`can generate a Or of And with Not everywhere: !(!(!${a} || !${b}) && !(!${c} || !${d})) is ${result}`, function () {
                const runtimeScene =
                  generateAndRunVariableAffectationWithConditions([
                    {
                      type: {
                        value: 'BuiltinCommonInstructions::Not',
                      },
                      parameters: [],
                      subInstructions: [
                        {
                          type: {
                            value: 'BuiltinCommonInstructions::And',
                          },
                          parameters: [],
                          subInstructions: [
                            {
                              type: {
                                value: 'BuiltinCommonInstructions::Not',
                              },
                              parameters: [],
                              subInstructions: [
                                {
                                  type: {
                                    value: 'BuiltinCommonInstructions::Or',
                                  },
                                  parameters: [],
                                  subInstructions: [
                                    {
                                      type: {
                                        value: 'BuiltinCommonInstructions::Not',
                                      },
                                      parameters: [],
                                      subInstructions: [conditionA(a)],
                                    },
                                    {
                                      type: {
                                        value: 'BuiltinCommonInstructions::Not',
                                      },
                                      parameters: [],
                                      subInstructions: [conditionB(b)],
                                    },
                                  ],
                                },
                              ],
                            },
                            {
                              type: {
                                value: 'BuiltinCommonInstructions::Not',
                              },
                              parameters: [],
                              subInstructions: [
                                {
                                  type: {
                                    value: 'BuiltinCommonInstructions::Or',
                                  },
                                  parameters: [],
                                  subInstructions: [
                                    {
                                      type: {
                                        value: 'BuiltinCommonInstructions::Not',
                                      },
                                      parameters: [],
                                      subInstructions: [conditionC(c)],
                                    },
                                    {
                                      type: {
                                        value: 'BuiltinCommonInstructions::Not',
                                      },
                                      parameters: [],
                                      subInstructions: [conditionD(d)],
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ]);

                expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(
                  result
                );
                if (result) {
                  expect(
                    runtimeScene
                      .getVariables()
                      .get('SuccessVariable')
                      .getAsNumber()
                  ).toBe(1);
                }
              });
            });
          });
        });
      });

      [false, true].forEach((a) => {
        [false, true].forEach((b) => {
          [false, true].forEach((c) => {
            [false, true].forEach((d) => {
              const result = a && b && c && d;
              it(`can generate a And of And: (${a} && ${b}) && (${c} && ${d}) is ${result}`, function () {
                const runtimeScene =
                  generateAndRunVariableAffectationWithConditions([
                    {
                      type: {
                        value: 'BuiltinCommonInstructions::And',
                      },
                      parameters: [],
                      subInstructions: [
                        {
                          type: {
                            value: 'BuiltinCommonInstructions::And',
                          },
                          parameters: [],
                          subInstructions: [conditionA(a), conditionB(b)],
                        },
                        {
                          type: {
                            value: 'BuiltinCommonInstructions::And',
                          },
                          parameters: [],
                          subInstructions: [conditionC(c), conditionD(d)],
                        },
                      ],
                    },
                  ]);

                expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(
                  result
                );
                if (result) {
                  expect(
                    runtimeScene
                      .getVariables()
                      .get('SuccessVariable')
                      .getAsNumber()
                  ).toBe(1);
                }
              });
            });
          });
        });
      });

      [false, true].forEach((a) => {
        [false, true].forEach((b) => {
          [false, true].forEach((c) => {
            [false, true].forEach((d) => {
              const result = a || b || c || d;
              it(`can generate a Or of Or: (${a} || ${b}) || (${c} || ${d}) is ${result}`, function () {
                const runtimeScene =
                  generateAndRunVariableAffectationWithConditions([
                    {
                      type: {
                        value: 'BuiltinCommonInstructions::Or',
                      },
                      parameters: [],
                      subInstructions: [
                        {
                          type: {
                            value: 'BuiltinCommonInstructions::Or',
                          },
                          parameters: [],
                          subInstructions: [conditionA(a), conditionB(b)],
                        },
                        {
                          type: {
                            value: 'BuiltinCommonInstructions::Or',
                          },
                          parameters: [],
                          subInstructions: [conditionC(c), conditionD(d)],
                        },
                      ],
                    },
                  ]);

                expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(
                  result
                );
                if (result) {
                  expect(
                    runtimeScene
                      .getVariables()
                      .get('SuccessVariable')
                      .getAsNumber()
                  ).toBe(1);
                }
              });
            });
          });
        });
      });
    });
  });
});
