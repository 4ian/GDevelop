// @flow
import { encodeUrlAndAddEncodedSearchParameter } from './CorsAwareImage';

describe('encodeUrlAndAddEncodedSearchParameter', () => {
  it('should add search parameter to http url', () => {
    const url = 'http://resources.gdevelop-app.com/file.png';
    const result = encodeUrlAndAddEncodedSearchParameter(url, 'param', 'value');
    expect(result).toBe(
      'http://resources.gdevelop-app.com/file.png?param=value'
    );
  });

  it('should add search parameter to http url with existing params', () => {
    const url = 'http://resources.gdevelop-app.com/file.png?existing=param';
    const result = encodeUrlAndAddEncodedSearchParameter(url, 'param', 'value');
    expect(result).toBe(
      'http://resources.gdevelop-app.com/file.png?existing=param&param=value'
    );
  });

  it('should encode properly the http url', () => {
    const url =
      'http://resources.gdevelop-app.com/folder/my file.png?existing=param';
    const result = encodeUrlAndAddEncodedSearchParameter(url, 'param', 'value');
    expect(result).toBe(
      'http://resources.gdevelop-app.com/folder/my%20file.png?existing=param&param=value'
    );
  });

  it('should add search parameter to https url', () => {
    const url = 'https://resources.gdevelop-app.com/file.png';
    const result = encodeUrlAndAddEncodedSearchParameter(url, 'param', 'value');
    expect(result).toBe(
      'https://resources.gdevelop-app.com/file.png?param=value'
    );
  });

  it('should add search parameter to https url with existing params', () => {
    const url = 'https://resources.gdevelop-app.com/file.png?existing=param';
    const result = encodeUrlAndAddEncodedSearchParameter(url, 'param', 'value');
    expect(result).toBe(
      'https://resources.gdevelop-app.com/file.png?existing=param&param=value'
    );
  });

  it('should encode properly the https url', () => {
    const url =
      'https://resources.gdevelop-app.com/my folder/my file.png?existing=param';
    const result = encodeUrlAndAddEncodedSearchParameter(url, 'param', 'value');
    expect(result).toBe(
      'https://resources.gdevelop-app.com/my%20folder/my%20file.png?existing=param&param=value'
    );
  });

  it('should add search parameter to ftp url', () => {
    const url = 'ftp://example.com/file.png';
    const result = encodeUrlAndAddEncodedSearchParameter(url, 'param', 'value');
    expect(result).toBe('ftp://example.com/file.png?param=value');
  });

  it('should add search parameter to ftp url with existing params', () => {
    const url = 'ftp://example.com/file.png?existing=param';
    const result = encodeUrlAndAddEncodedSearchParameter(url, 'param', 'value');
    expect(result).toBe(
      'ftp://example.com/file.png?existing=param&param=value'
    );
  });

  it('should encode properly the ftp url', () => {
    const url = 'ftp://example.com/my folder/my file.png?existing=param';
    const result = encodeUrlAndAddEncodedSearchParameter(url, 'param', 'value');
    expect(result).toBe(
      'ftp://example.com/my%20folder/my%20file.png?existing=param&param=value'
    );
  });

  it('should add search parameter to file url', () => {
    const url = 'file://User/My folder/file.png';
    const result = encodeUrlAndAddEncodedSearchParameter(url, 'param', 'value');
    expect(result).toBe('file://User/My%20folder/file.png?param=value');
  });

  it('should add search parameter to file url with existing params', () => {
    const url = 'file://User/My folder/file.png?existing=param';
    const result = encodeUrlAndAddEncodedSearchParameter(url, 'param', 'value');
    expect(result).toBe(
      'file://User/My%20folder/file.png?existing=param&param=value'
    );
  });

  it('should encode properly the file url', () => {
    const url = 'file://User/My #folder/my #file.png?existing=param';
    const result = encodeUrlAndAddEncodedSearchParameter(url, 'param', 'value');
    expect(result).toBe(
      'file://User/My%20%23folder/my%20%23file.png?existing=param&param=value'
    );
  });

  it('should return original url for blob/data protocol or static images', () => {
    const url = 'blob://example.com/file.png';
    const result = encodeUrlAndAddEncodedSearchParameter(url, 'param', 'value');
    expect(result).toBe(url);
  });
});
