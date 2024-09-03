// @flow

/* eslint-disable no-eval */

/**
 * Taken from https://gist.github.com/tkrotoff/b0b1d39da340f5fc6c5e2a79a8b6cec0 and
 * manually adapted to FlowJS.
 */

import {
  calculate,
  evalReversePolishNotation,
  shuntingYard,
  tokenize,
} from './MathExpressionParser';

describe('MathExpressionParser', () => {
  test('shuntingYard()', () => {
    {
      // https://en.wikipedia.org/wiki/Shunting_yard_algorithm#Detailed_examples
      const rpn = shuntingYard('3 + 4 * 2 / ( 1 - 5 ) ^ 2 ^ 3'.split(' '));
      expect(rpn).toEqual([
        '3',
        '4',
        '2',
        '*',
        '1',
        '5',
        '-',
        '2',
        '3',
        '^',
        '^',
        '/',
        '+',
      ]);
    }

    {
      // https://en.wikipedia.org/wiki/Shunting_yard_algorithm#Detailed_examples
      const rpn = shuntingYard('sin ( max ( 2 3 ) / 3 * 3.14 )'.split(' '));
      expect(rpn).toEqual(['2', '3', 'max', '3', '/', '3.14', '*', 'sin']);
    }

    // Parentheses mismatch
    expect(() => shuntingYard(['('])).toThrow('Parentheses mismatch');
    expect(() => shuntingYard([')'])).toThrow('Parentheses mismatch');
    expect(() => shuntingYard('1 - ( 2 * 3 ) )'.split(' '))).toThrow(
      'Parentheses mismatch'
    );
    expect(() => shuntingYard('1 - ( 2 * 3 ) ) + 4'.split(' '))).toThrow(
      'Parentheses mismatch'
    );

    // Ignore ','
    expect(shuntingYard('max ( 1 , 2 )'.split(' '))).toEqual(['1', '2', 'max']);

    // if the token is: ',':
    //   while the operator at the top of the operator stack is not a left parenthesis:
    //     pop the operator from the operator stack into the output queue
    expect(shuntingYard('max ( 0 + 1 , 2 )'.split(' '))).toEqual([
      '0',
      '1',
      '+',
      '2',
      'max',
    ]);

    // Misplaced ','
    expect(() => shuntingYard('1 , 2'.split(' '))).toThrow("Misplaced ','");
    expect(() => shuntingYard(', 1 / 2'.split(' '))).toThrow("Misplaced ','");
    expect(() => shuntingYard('1 , / 2'.split(' '))).toThrow("Misplaced ','");
    expect(() => shuntingYard('1 / , 2'.split(' '))).toThrow("Misplaced ','");
    expect(() => shuntingYard('1 / 2 ,'.split(' '))).toThrow("Misplaced ','");
    expect(() =>
      shuntingYard(
        'sin ( , max , ( , 2 , 3 , ) , / , 3 , * , 3.14 , )'.split(' ')
      )
    ).not.toThrow();

    // Edge cases
    expect(shuntingYard([''])).toEqual(['']);
    expect(shuntingYard([' '])).toEqual([' ']);
    expect(shuntingYard(['1'])).toEqual(['1']);
    expect(shuntingYard(['a'])).toEqual(['a']);
    expect(shuntingYard(['1a'])).toEqual(['1a']);
    expect(shuntingYard(['*'])).toEqual(['*']);
    expect(shuntingYard(['/'])).toEqual(['/']);

    // All together expression
    expect(
      shuntingYard(
        '( ( 3.1 + cos ( -4 ) / 2 ) * max ( -6 , 6 ) ^ sin ( 6 ) * 9 ) / tan ( log ( 8.8 + -2 ) % 7 ) + ( 6 * -1 - min ( 6 , -4.2 ) )'.split(
          ' '
        )
      )
    ).toEqual(
      '3.1 -4 cos 2 / + -6 6 max 6 sin ^ * 9 * 8.8 -2 + log 7 % tan / 6 -1 * 6 -4.2 min - +'.split(
        ' '
      )
    );
  });

  test('reversePolishNotation()', () => {
    // https://rosettacode.org/wiki/Parsing/RPN_calculator_algorithm#JavaScript
    expect(
      evalReversePolishNotation([
        '3',
        '4',
        '2',
        '*',
        '1',
        '5',
        '-',
        '2',
        '3',
        '^',
        '^',
        '/',
        '+',
      ])
    ).toEqual(3 + (4 * 2) / (1 - 5) ** (2 ** 3));
    expect(
      evalReversePolishNotation([
        '3',
        '4',
        '2',
        '*',
        '1',
        '5',
        '-',
        '2',
        '3',
        '^',
        '^',
        '/',
        '+',
      ])
    ).toEqual(3.000_122_070_312_5);

    // https://en.wikipedia.org/wiki/Shunting_yard_algorithm#Detailed_examples
    expect(
      evalReversePolishNotation(['2', '3', 'max', '3', '/', '3.14', '*', 'sin'])
    ).toEqual(Math.sin((Math.max(2, 3) / 3) * 3.14));
    expect(
      evalReversePolishNotation(['2', '3', 'max', '3', '/', '3.14', '*', 'sin'])
    ).toEqual(0.001_592_652_916_486_828_2);

    // Edge cases
    expect(evalReversePolishNotation([''])).toEqual(0); // :-(
    expect(evalReversePolishNotation([' '])).toEqual(0); // :-(
    expect(evalReversePolishNotation(['1'])).toEqual(1);
    expect(evalReversePolishNotation(['a'])).toBeNaN();
    expect(evalReversePolishNotation(['1a'])).toBeNaN();
    expect(evalReversePolishNotation(['*'])).toBeNaN();
    expect(evalReversePolishNotation(['/'])).toBeNaN();
    expect(() => evalReversePolishNotation(['1', '2'])).toThrow(
      'Insufficient operators'
    );

    // All together expression
    expect(
      evalReversePolishNotation(
        '3.1 -4 cos 2 / + -6 6 max 6 sin ^ * 9 * 8.8 -2 + log 7 % tan / 6 -1 * 6 -4.2 min - +'.split(
          ' '
        )
      )
    ).toEqual(
      eval(
        '((3.1 + Math.cos(-4) / 2) * Math.max(-6, 6) ** Math.sin(6) * 9) / Math.tan(Math.log(8.8 + -2) % 7) + (6 * -1 - Math.min(6, -4.2))'
      )
    );
  });

  test('tokenize()', () => {
    // https://en.wikipedia.org/wiki/Shunting_yard_algorithm#Detailed_examples
    expect(tokenize('3 + 4 * 2 / (1 - 5) ^ 2 ^ 3')).toEqual(
      '3 + 4 * 2 / ( 1 - 5 ) ^ 2 ^ 3'.split(' ')
    );

    // https://en.wikipedia.org/wiki/Shunting_yard_algorithm#Detailed_examples
    expect(tokenize('sin(max(2, 3) / 3 * 3.14)')).toEqual(
      'sin ( max ( 2 , 3 ) / 3 * 3.14 )'.split(' ')
    );

    expect(tokenize('1+2')).toEqual(['1', '+', '2']);
    expect(tokenize('min(1,2)')).toEqual(['min', '(', '1', ',', '2', ')']);
    expect(tokenize('1.1+2.2')).toEqual(['1.1', '+', '2.2']);
    expect(tokenize('min(1.1,2.2)')).toEqual([
      'min',
      '(',
      '1.1',
      ',',
      '2.2',
      ')',
    ]);

    // Decimals
    expect(tokenize('1.1 + 2.2 - 3.3 * 4.4 / 5.5 % 6.6 ^ 7.7')).toEqual(
      '1.1 + 2.2 - 3.3 * 4.4 / 5.5 % 6.6 ^ 7.7'.split(' ')
    );

    // White spaces
    expect(tokenize('')).toEqual([]);
    expect(tokenize(' ')).toEqual([]);
    expect(tokenize(' 1  +  2 ')).toEqual(['1', '+', '2']);
    expect(tokenize('1 \n + \n 2')).toEqual(['1', '+', '2']);
    expect(tokenize('1 \t + \t 2')).toEqual(['1', '+', '2']);

    // Single number
    expect(tokenize('0')).toEqual(['0']);
    expect(tokenize('1')).toEqual(['1']);
    expect(tokenize('-0')).toEqual(['-0']);
    expect(tokenize('-1')).toEqual(['-1']);
    expect(tokenize('(1)')).toEqual(['(', '1', ')']);
    expect(tokenize('(-1)')).toEqual(['(', '-1', ')']);
    expect(tokenize('-(1)')).toEqual(['0', '-', '(', '1', ')']);

    // Starting with +/-
    expect(tokenize('+0')).toEqual(['+0']);
    expect(tokenize('+ 0')).toEqual(['0', '+', '0']);
    expect(tokenize('-0')).toEqual(['-0']);
    expect(tokenize('- 0')).toEqual(['0', '-', '0']);
    expect(tokenize('+1')).toEqual(['+1']);
    expect(tokenize('+ 1')).toEqual(['0', '+', '1']);
    expect(tokenize('-1')).toEqual(['-1']);
    expect(tokenize('- 1')).toEqual(['0', '-', '1']);
    expect(tokenize('+1 + 1')).toEqual(['+1', '+', '1']);
    expect(tokenize('+ 1 + 1')).toEqual(['0', '+', '1', '+', '1']);
    expect(tokenize('-1 + 1')).toEqual(['-1', '+', '1']);
    expect(tokenize('- 1 + 1')).toEqual(['0', '-', '1', '+', '1']);
    expect(tokenize('+')).toEqual(['0', '+']);
    expect(tokenize('-')).toEqual(['0', '-']);

    // Do not confuse '+1' / '-1' with 'x + 1' / 'x - 1' depending on the context
    expect(tokenize('(1+2)+1')).toEqual(['(', '1', '+', '2', ')', '+', '1']);
    expect(tokenize('(1+2)-1')).toEqual(['(', '1', '+', '2', ')', '-', '1']);
    expect(tokenize('1 + -2')).toEqual(['1', '+', '-2']);
    expect(tokenize('1+-2')).toEqual(['1', '+', '-2']);

    // Space in number
    expect(() => tokenize('1 2')).toThrow("Space in number: '1 2'");
    expect(() => tokenize('1  2')).toThrow("Space in number: '1 2'");
    expect(() => tokenize('0 + 1 / (2 3) * 4')).toThrow(
      "Space in number: '2 3'"
    );
    expect(() => tokenize('min(1 2)')).toThrow("Space in number: '1 2'");

    // Double '.' in number
    expect(() => tokenize('1+2.3.4')).toThrow("Double '.' in number: '2.3.'");
    expect(() => tokenize('1+2.3.4.5')).toThrow("Double '.' in number: '2.3.'");
    expect(() => tokenize('0 + 1 / 2.3.4 * 5')).toThrow(
      "Double '.' in number: '2.3.'"
    );
    expect(() => tokenize('min(1, 2.3.4)')).toThrow(
      "Double '.' in number: '2.3.'"
    );

    // Consecutive operators
    expect(tokenize('1++2')).toEqual(['1', '+', '+2']);
    expect(tokenize('1-+2')).toEqual(['1', '-', '+2']);
    expect(tokenize('1--2')).toEqual(['1', '-', '-2']);
    expect(() => tokenize('1++')).toThrow("Consecutive operators: '++'");
    expect(() => tokenize('1-+')).toThrow("Consecutive operators: '-+'");
    expect(() => tokenize('1--')).toThrow("Consecutive operators: '--'");
    expect(() => tokenize('1-*2')).toThrow("Consecutive operators: '-*'");
    expect(() => tokenize('0 + 1 / (2-*3) * 4')).toThrow(
      "Consecutive operators: '-*'"
    );
    expect(() => tokenize('min(1-*2, 3)')).toThrow(
      "Consecutive operators: '-*'"
    );

    // Other edge cases
    expect(tokenize('1,2')).toEqual(['1', ',', '2']);
    expect(tokenize('1+2+')).toEqual(['1', '+', '2', '+']); // :-(
    expect(() => tokenize('1+2a')).toThrow("Invalid characters: 'a'");
    expect(() => tokenize('10 Hello')).toThrow("Invalid characters: 'Hello'");
    expect(tokenize('1-.')).toEqual(['1', '-', '.']); // :-(
    expect(tokenize('*')).toEqual(['*']);
    expect(tokenize('/')).toEqual(['/']);

    // All together expression
    expect(
      tokenize(
        '((3.1 + cos(-4) / 2) * max(-6, 6) ^ sin(6) * 9) / tan(log(8.8 + -2) % 7) + (6 * -1 - min(6, -4.2))'
      )
    ).toEqual(
      '( ( 3.1 + cos ( -4 ) / 2 ) * max ( -6 , 6 ) ^ sin ( 6 ) * 9 ) / tan ( log ( 8.8 + -2 ) % 7 ) + ( 6 * -1 - min ( 6 , -4.2 ) )'.split(
        ' '
      )
    );
    expect(
      tokenize(
        '((3.1+cos(-4)/2)*max(-6,6)^sin(6)*9)/tan(log(8.8+-2)%7)+(6*-1-min(6,-4.2))'
      )
    ).toEqual(
      '( ( 3.1 + cos ( -4 ) / 2 ) * max ( -6 , 6 ) ^ sin ( 6 ) * 9 ) / tan ( log ( 8.8 + -2 ) % 7 ) + ( 6 * -1 - min ( 6 , -4.2 ) )'.split(
        ' '
      )
    );
  });

  test.skip('calculate() failing test cases', () => {
    // TODO: The parser does not handle well `-` operator when in front of function.
    // See https://gist.github.com/tkrotoff/b0b1d39da340f5fc6c5e2a79a8b6cec0?permalink_comment_id=5176448#gistcomment-5176448.
    // If the issue is fixed in the gist, put those tests in the test suite.
    expect(calculate('toDeg(-pi())')).toEqual(-180);
    expect(calculate('min(-12, -max(13, 0))')).toEqual(-13);
  });

  test('calculate()', () => {
    // https://en.wikipedia.org/wiki/Shunting_yard_algorithm#Detailed_examples
    expect(calculate('3 + 4 * 2 / (1 - 5) ^ 2 ^ 3')).toEqual(
      3.000_122_070_312_5
    );

    // https://en.wikipedia.org/wiki/Shunting_yard_algorithm#Detailed_examples
    expect(calculate('sin(max(2, 3) / 3 * 3.14)')).toEqual(
      0.001_592_652_916_486_828_2
    );

    expect(calculate('1+2')).toEqual(3);
    expect(calculate('min(1,2)')).toEqual(1);
    expect(calculate('1.1+2.2')).toEqual(3.300_000_000_000_000_3);
    expect(calculate('min(1.1,2.2)')).toEqual(1.1);

    // if the token is: ',':
    //   while the operator at the top of the operator stack is not a left parenthesis:
    //     pop the operator from the operator stack into the output queue
    expect(calculate('max(0 + 1, 2)')).toEqual(2);

    // Decimals
    expect(calculate('1.1 + 2.2 - 3.3 * 4.4 / 5.5 % 6.6 ^ 7.7')).toEqual(
      eval('1.1 + 2.2 - 3.3 * 4.4 / 5.5 % 6.6 ** 7.7')
    );

    // White spaces
    expect(calculate('')).toBeNaN();
    expect(calculate(' ')).toBeNaN();
    expect(calculate(' 1  +  2 ')).toEqual(3);
    expect(calculate('1 \n + \n 2')).toEqual(3);
    expect(calculate('1 \t + \t 2')).toEqual(3);

    // -0 hack
    expect(calculate('-0 + -0')).toEqual(-0);
    expect(calculate('-0 - 0')).toEqual(-0);
    expect(calculate('0 * -1')).toEqual(-0);
    expect(calculate('0 / -1')).toEqual(-0);
    expect(calculate('-1 % 1')).toEqual(-0);
    expect(calculate('-0 ^ 1')).toEqual(-0);
    expect(calculate('min(-0, 1)')).toEqual(-0);
    expect(calculate('max(-0, -1)')).toEqual(-0);
    expect(calculate('sin(-0)')).toEqual(-0);
    expect(calculate('tan(-0)')).toEqual(-0);
    expect(calculate('log(1)')).toEqual(0); // No need for -0 hack

    // Math.pow() vs **
    expect(calculate('-2 ^ 2')).toEqual((-2) ** 2);
    expect(eval('Math.pow(-2, 2)')).toEqual(4);
    expect(() => eval('-2 ** 2')).toThrow(
      'Unary operator used immediately before exponentiation expression.'
    );

    // Infinity/-Infinity
    expect(calculate('1 / 0')).toEqual(Infinity);
    expect(calculate('1 / -0')).toEqual(-Infinity);
    expect(calculate('-1 / 0')).toEqual(-Infinity);
    expect(calculate('1 + 1 / 0')).toEqual(Infinity);
    expect(calculate('1 - 1 / 0')).toEqual(-Infinity);
    expect(calculate('10 ^ 1000')).toEqual(Infinity);
    expect(calculate('0 - 10 ^ 1000')).toEqual(-Infinity);
    expect(calculate('0 ^ -1')).toEqual(Infinity);
    expect(calculate('-0 ^ -1')).toEqual(-Infinity);
    expect(calculate('log(0)')).toEqual(-Infinity);

    // NaN
    expect(calculate('log(-1)')).toBeNaN();
    expect(calculate('-1 ^ 0.1')).toBeNaN();
    expect(calculate('1 % 0')).toBeNaN();
    expect(calculate('1 / 0 * 0')).toBeNaN();

    // Single number
    expect(calculate('0')).toEqual(0);
    expect(calculate('1')).toEqual(1);
    expect(calculate('-0')).toEqual(-0);
    expect(calculate('-1')).toEqual(-1);
    expect(calculate('(1)')).toEqual(1);
    expect(calculate('(-1)')).toEqual(-1);
    expect(calculate('-(1)')).toEqual(-1);

    // Starting with +/-
    expect(calculate('+0')).toEqual(0);
    expect(calculate('+ 0')).toEqual(0);
    expect(calculate('-0')).toEqual(-0);
    expect(calculate('- 0')).toEqual(0);
    expect(calculate('+1')).toEqual(1);
    expect(calculate('+ 1')).toEqual(+1);
    expect(calculate('-1')).toEqual(-1);
    expect(calculate('- 1')).toEqual(-1);
    expect(calculate('+1 + 1')).toEqual(2);
    expect(calculate('+ 1 + 1')).toEqual(2);
    expect(calculate('-1 + 1')).toEqual(0);
    expect(calculate('- 1 + 1')).toEqual(0);
    expect(calculate('+')).toBeNaN();
    expect(calculate('-')).toBeNaN();

    // Do not confuse '+1' / '-1' with 'x + 1' / 'x - 1' depending on the context
    expect(calculate('(1+2)+1')).toEqual(4);
    expect(calculate('(1+2)-1')).toEqual(2);
    expect(calculate('1 + -2')).toEqual(-1);
    expect(calculate('1+-2')).toEqual(-1);

    // Space in number
    expect(() => calculate('1 2')).toThrow("Space in number: '1 2'");
    expect(() => calculate('1  2')).toThrow("Space in number: '1 2'");
    expect(() => calculate('0 + 1 / (2 3) * 4')).toThrow(
      "Space in number: '2 3'"
    );
    expect(() => calculate('min(1 2)')).toThrow("Space in number: '1 2'");

    // Double '.' in number
    expect(() => calculate('1+2.3.4')).toThrow("Double '.' in number: '2.3.'");
    expect(() => calculate('1+2.3.4.5')).toThrow(
      "Double '.' in number: '2.3.'"
    );
    expect(() => calculate('0 + 1 / 2.3.4 * 5')).toThrow(
      "Double '.' in number: '2.3.'"
    );
    expect(() => calculate('min(1, 2.3.4)')).toThrow(
      "Double '.' in number: '2.3.'"
    );

    // Exponential
    expect(calculate('exp(0)')).toEqual(Math.exp(0));
    expect(calculate('exp(log(1))')).toEqual(1);
    expect(calculate('log(exp(1))')).toEqual(1);
    expect(calculate('-log(exp(1))')).toEqual(-1);

    // Pi
    const precision = 1e-8;
    expect(calculate('sin(pi())') < precision).toBe(true);
    expect(calculate('cos(pi())')).toEqual(-1);
    expect(
      Math.abs(calculate('toDeg(-3.141592653589793)') + 180) < precision
    ).toBe(true);
    expect(calculate('toRad(-180)')).toEqual(-Math.PI);
    expect(Math.abs(calculate('sin(pi()/6)') - 0.5) < precision).toBe(true);
    expect(Math.abs(calculate('cos(pi()/3)') - 0.5) < precision).toBe(true);

    // Angle unit conversion functions
    expect(calculate('toDeg(0)')).toEqual(0);
    expect(calculate('toRad(0)')).toEqual(0);
    expect(calculate('toRad(90)')).toEqual(Math.PI / 2);
    expect(calculate('toRad(45)')).toEqual(Math.PI / 4);
    expect(calculate('toRad(180)')).toEqual(Math.PI);
    expect(calculate('toRad(-180)')).toEqual(-Math.PI);
    expect(calculate('toDeg(pi())')).toEqual(180);
    expect(calculate('toDeg(sin(pi()))') < precision).toBe(true);

    // Consecutive operators
    expect(calculate('1++2')).toEqual(3);
    expect(calculate('1-+2')).toEqual(-1);
    expect(calculate('1--2')).toEqual(3);
    expect(() => calculate('1++')).toThrow("Consecutive operators: '++'");
    expect(() => calculate('1-+')).toThrow("Consecutive operators: '-+'");
    expect(() => calculate('1--')).toThrow("Consecutive operators: '--'");
    expect(() => calculate('1-*2')).toThrow("Consecutive operators: '-*'");
    expect(() => calculate('0 + 1 / (2-*3) * 4')).toThrow(
      "Consecutive operators: '-*'"
    );
    expect(() => calculate('min(1-*2, 3)')).toThrow(
      "Consecutive operators: '-*'"
    );

    // Misplaced ','
    expect(() => calculate('1,2')).toThrow("Misplaced ','");
    expect(() => calculate(',1/2')).toThrow("Misplaced ','");
    expect(() => calculate('1,/2')).toThrow("Misplaced ','");
    expect(() => calculate('1/,2')).toThrow("Misplaced ','");
    expect(() => calculate('1/2,')).toThrow("Misplaced ','");
    expect(() => calculate('sin(,max,(,2,3,),/,3,*,3.14,)')).toThrow(
      'Insufficient operators'
    );
    expect(calculate('sin(,max(,2,3,),/3,*3.14,)')).toEqual(
      0.001_592_652_916_486_828_2
    );

    // Other edge cases
    expect(calculate('1+2+')).toBeNaN();
    expect(() => calculate('1+2a')).toThrow("Invalid characters: 'a'");
    expect(() => calculate('10 Hello')).toThrow("Invalid characters: 'Hello'");
    expect(calculate('1-.')).toBeNaN();
    expect(calculate('*')).toBeNaN();
    expect(calculate('/')).toBeNaN();

    // All together expression
    expect(
      calculate(
        '((3.1 + cos(-4) / 2) * max(-6, 6) ^ sin(6) * 9) / tan(log(8.8 + -2) % 7) + (6 * -1 - min(6, -4.2))'
      )
    ).toEqual(
      eval(
        '((3.1 + Math.cos(-4) / 2) * Math.max(-6, 6) ** Math.sin(6) * 9) / Math.tan(Math.log(8.8 + -2) % 7) + (6 * -1 - Math.min(6, -4.2))'
      )
    );
    expect(
      calculate(
        '((3.1+cos(-4)/2)*max(-6,6)^sin(6)*9)/tan(log(8.8+-2)%7)+(6*-1-min(6,-4.2))'
      )
    ).toEqual(
      eval(
        '((3.1+Math.cos(-4)/2)*Math.max(-6,6)**Math.sin(6)*9)/Math.tan(Math.log(8.8+-2)%7)+(6*-1-Math.min(6,-4.2))'
      )
    );
  });
});
