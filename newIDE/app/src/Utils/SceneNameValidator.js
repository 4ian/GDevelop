// @flow

/**
 * Scene names created by the editor are identifiers so they can be used
 * consistently by editor tooling and generated project files.
 *
 * This accepts camelCase/PascalCase and snake_case names, including digits
 * after the first character. Underscores must separate non-empty segments.
 */
export const isValidSceneName = (sceneName: string): boolean =>
  /^[A-Za-z][A-Za-z0-9]*(?:_[A-Za-z0-9]+)*$/.test(sceneName);
