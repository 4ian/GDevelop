// @ts-check
describe('gdjs.evtTools.string', () => {
  describe('strReplaceAll', () => {
    const strReplaceAll = gdjs.evtTools.string.strReplaceAll;

    it('replaces all occurrences of the pattern by the specified replacement', () => {
      expect(strReplaceAll('', '', '')).to.be('');
      expect(strReplaceAll('', 'a', '')).to.be('');
      expect(strReplaceAll('', 'a', 'b')).to.be('');
      expect(strReplaceAll('', '', 'b')).to.be('b');

      expect(strReplaceAll('a', '', '')).to.be('a');
      expect(strReplaceAll('a', 'a', '')).to.be('');
      expect(strReplaceAll('a', 'a', 'b')).to.be('b');
      expect(strReplaceAll('a', '', 'b')).to.be('bab');

      expect(strReplaceAll('b', '', '')).to.be('b');
      expect(strReplaceAll('b', 'a', '')).to.be('b');
      expect(strReplaceAll('b', 'a', 'b')).to.be('b');
      expect(strReplaceAll('b', '', 'b')).to.be('b');

      expect(strReplaceAll('aa', '', '')).to.be('aa');
      expect(strReplaceAll('aa', 'a', '')).to.be('');
      expect(strReplaceAll('aa', 'a', 'b')).to.be('bb');
      expect(strReplaceAll('aa', '', 'b')).to.be('babab');

      expect(strReplaceAll('bb', '', '')).to.be('bb');
      expect(strReplaceAll('bb', 'a', '')).to.be('bb');
      expect(strReplaceAll('bb', 'a', 'b')).to.be('bb');
      expect(strReplaceAll('bb', '', 'b')).to.be('bb');

      expect(strReplaceAll('abc', '', '')).to.be('abc');
      expect(strReplaceAll('abc', 'a', '')).to.be('bc');
      expect(strReplaceAll('abc', 'ab', '')).to.be('c');
      expect(strReplaceAll('abc', 'abc', '')).to.be('');
      expect(strReplaceAll('abc', 'a', 'b')).to.be('bbc');
      expect(strReplaceAll('abc', 'ab', 'b')).to.be('bc');
      expect(strReplaceAll('abc', 'abc', 'b')).to.be('b');
      expect(strReplaceAll('abc', '', 'b')).to.be('babbbcb');

      expect(strReplaceAll('foo bar foo baz', 'foo', 'qux')).to.be(
        'qux bar qux baz'
      );
      expect(strReplaceAll('foo bar FOO foo baz', 'FOO', 'qux')).to.be(
        'foo bar qux foo baz'
      );
      expect(strReplaceAll('foo bar FOO foo baz', 'foo', 'foo')).to.be(
        'foo bar FOO foo baz'
      );
    });
  });
  describe('strReplaceOne', () => {
    const strReplaceOne = gdjs.evtTools.string.strReplaceOne;

    it('replaces the first occurrence of the pattern by the specified replacement', () => {
      expect(strReplaceOne('', '', '')).to.be('');
      expect(strReplaceOne('', 'a', '')).to.be('');
      expect(strReplaceOne('', 'a', 'b')).to.be('');
      expect(strReplaceOne('', '', 'b')).to.be('b');

      expect(strReplaceOne('a', '', '')).to.be('a');
      expect(strReplaceOne('a', 'a', '')).to.be('');
      expect(strReplaceOne('a', 'a', 'b')).to.be('b');
      expect(strReplaceOne('a', '', 'b')).to.be('bab');

      expect(strReplaceOne('b', '', '')).to.be('b');
      expect(strReplaceOne('b', 'a', '')).to.be('b');
      expect(strReplaceOne('b', 'a', 'b')).to.be('b');
      expect(strReplaceOne('b', '', 'b')).to.be('b');

      expect(strReplaceOne('aa', '', '')).to.be('aa');
      expect(strReplaceOne('aa', 'a', '')).to.be('a');
      expect(strReplaceOne('aa', 'a', 'b')).to.be('ba');
      expect(strReplaceOne('aa', '', 'b')).to.be('baa');

      expect(strReplaceOne('bb', '', '')).to.be('bb');
      expect(strReplaceOne('bb', 'a', '')).to.be('bb');
      expect(strReplaceOne('bb', 'a', 'b')).to.be('bb');
      expect(strReplaceOne('bb', '', 'b')).to.be('bbb');

      expect(strReplaceOne('abc', '', '')).to.be('abc');
      expect(strReplaceOne('abc', 'a', '')).to.be('bc');
      expect(strReplaceOne('abc', 'ab', '')).to.be('c');
      expect(strReplaceOne('abc', 'abc', '')).to.be('');
      expect(strReplaceOne('abc', 'a', 'b')).to.be('bbc');
      expect(strReplaceOne('abc', 'ab', 'b')).to.be('bc');
      expect(strReplaceOne('abc', 'abc', 'b')).to.be('b');
      expect(strReplaceOne('abc', '', 'b')).to.be('babc');

      expect(strReplaceOne('foo bar foo baz', 'foo', 'qux')).to.be(
        'qux bar foo baz'
      );
      expect(strReplaceOne('foo bar FOO foo baz', 'FOO', 'qux')).to.be(
        'foo bar qux foo baz'
      );
      expect(strReplaceOne('foo bar FOO foo baz', 'foo', 'foo')).to.be(
        'foo bar FOO foo baz'
      );
    });
  });
});
