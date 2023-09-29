// @flow

import { cleanUpGameSlug } from './PublicGameProperties';

describe('cleanUpGameSlug', () => {
  it('should replace space characters with dashes and lowercase everything', () => {
    expect(cleanUpGameSlug('Turtle Mutant Ninja Turtle')).toEqual(
      'turtle-mutant-ninja-turtle'
    );
  });
  it('should cut off to a maximal length', () => {
    expect(
      cleanUpGameSlug('turtle-mutant-ninja-turtle-the-return-of-the-rat')
    ).toEqual('turtle-mutant-ninja-turtle-the');
  });
  it('should replace cyrillic characters with latin ones', () => {
    expect(cleanUpGameSlug('БГДЖЗИЙЛПФЦЧШЩЫЭЮЯбвгджзийклмн')).toEqual(
      'bgdzhzijlpftschshshchyeyuyabvg'
    );
    expect(cleanUpGameSlug('птфцчшщыэюя')).toEqual('ptftschshshchyeyuya');
  });
  it('should complete the slug with dashes if the input is not long enough', () => {
    expect(cleanUpGameSlug('TMNT')).toEqual('tmnt--');
  });
});
