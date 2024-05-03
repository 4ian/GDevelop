// @flow
import { getSentenceErrorText } from './EventsFunctionPropertiesEditor';
const gd: libGDevelop = global.gd;

// $FlowExpectedError
const makeFakeI18n = (fakeI18n): I18nType => ({
  ...fakeI18n,
  _: message => message.id,
});

describe('EventsFunctionPropertiesEditor', () => {
  describe('getSentenceErrorText', () => {
    test('returns an error message if there are extra parameters (free function)', () => {
      const eventsFunction = new gd.EventsFunction();
      eventsFunction.setSentence(
        'This is using _PARAM3_ (which is unexpected) and _PARAM2_ but forgot the first parameter and mistakenly used _PARAM0_.'
      );
      {
        const newParameter = new gd.ParameterMetadata();
        newParameter.setType('expression');
        eventsFunction.getParameters().push_back(newParameter);
        newParameter.delete();
      }
      {
        const newParameter = new gd.ParameterMetadata();
        newParameter.setType('string');
        eventsFunction.getParameters().push_back(newParameter);
        newParameter.delete();
      }

      const errorText = getSentenceErrorText(
        makeFakeI18n(),
        null,
        null,
        eventsFunction
      );

      eventsFunction.delete();
      expect(errorText).toMatchInlineSnapshot(
        `"The sentence is probably missing this/these parameter(s): _PARAM1_ - The sentence displays one or more wrongs parameters: _PARAM3_, _PARAM0_"`
      );
    });
    test('returns an error message if there are extra parameters (behavior function)', () => {
      const eventsFunction = new gd.EventsFunction();
      const eventsBasedBehavior = new gd.EventsBasedBehavior();
      eventsFunction.setSentence(
        'This is using _PARAM2_ (which is unexpected) and _PARAM1_ but forgot the first parameter.'
      );
      {
        const newParameter = new gd.ParameterMetadata();
        newParameter.setType('expression');
        eventsFunction.getParameters().push_back(newParameter);
        newParameter.delete();
      }
      {
        const newParameter = new gd.ParameterMetadata();
        newParameter.setType('string');
        eventsFunction.getParameters().push_back(newParameter);
        newParameter.delete();
      }

      const errorText = getSentenceErrorText(
        makeFakeI18n(),
        eventsBasedBehavior,
        null,
        eventsFunction
      );

      eventsFunction.delete();
      expect(errorText).toMatchInlineSnapshot(
        `"The sentence is probably missing this/these parameter(s): _PARAM0_ - The sentence displays one or more wrongs parameters: _PARAM2_"`
      );
    });
  });
});
