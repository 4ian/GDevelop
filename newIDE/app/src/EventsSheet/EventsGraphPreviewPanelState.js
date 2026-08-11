// @flow

export const getCollapsedGroupPathsAfterGroupPathChange = ({
  previousCollapsedGroupPaths,
  previousGroupPathStrings,
  currentGroupPathStrings,
}: {|
  previousCollapsedGroupPaths: Set<string>,
  previousGroupPathStrings: Array<string>,
  currentGroupPathStrings: Array<string>,
|}): Set<string> => {
  const previousGroupPathSet = new Set(previousGroupPathStrings);
  const currentGroupPathSet = new Set(currentGroupPathStrings);
  const nextCollapsedGroupPaths = new Set(previousCollapsedGroupPaths);
  let didChange = false;

  currentGroupPathStrings.forEach(pathString => {
    if (!previousGroupPathSet.has(pathString)) {
      nextCollapsedGroupPaths.add(pathString);
      didChange = true;
    }
  });

  previousCollapsedGroupPaths.forEach(pathString => {
    if (!currentGroupPathSet.has(pathString)) {
      nextCollapsedGroupPaths.delete(pathString);
      didChange = true;
    }
  });

  return didChange ? nextCollapsedGroupPaths : previousCollapsedGroupPaths;
};
