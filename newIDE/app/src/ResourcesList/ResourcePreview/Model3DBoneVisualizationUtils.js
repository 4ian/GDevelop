// @flow

export type ModelMaterialAppearance = {|
  material: any,
  transparent: boolean,
  opacity: number,
  depthWrite: boolean,
  alphaTest: number,
|};

export type BoneScreenPosition = {|
  x: number,
  y: number,
  depth: number,
  isVisible: boolean,
|};

const getMaterials = (node: any): Array<any> => {
  if (!node.material) return [];
  return Array.isArray(node.material) ? node.material : [node.material];
};

export const captureModelMaterialAppearances = (
  model: any
): Array<ModelMaterialAppearance> => {
  const materialAppearances: Array<ModelMaterialAppearance> = [];
  const recordedMaterials = new Set<any>();
  model.traverse(child => {
    getMaterials(child).forEach(material => {
      if (!material || recordedMaterials.has(material)) return;
      recordedMaterials.add(material);
      materialAppearances.push({
        material,
        transparent: material.transparent,
        opacity: material.opacity,
        depthWrite: material.depthWrite,
        alphaTest: material.alphaTest,
      });
    });
  });
  return materialAppearances;
};

export const setModelMaterialsBonesVisibility = ({
  materialAppearances,
  isVisible,
  previewOpacity,
}: {|
  materialAppearances: Array<ModelMaterialAppearance>,
  isVisible: boolean,
  previewOpacity: number,
|}) => {
  materialAppearances.forEach(appearance => {
    const { material } = appearance;
    const opacity = isVisible
      ? Math.min(appearance.opacity, previewOpacity)
      : appearance.opacity;
    material.transparent = isVisible ? true : appearance.transparent;
    material.opacity = opacity;
    material.depthWrite = isVisible ? false : appearance.depthWrite;
    // glTF MASK materials use alphaTest. Scale the cutoff with the opacity so
    // the same texture pixels pass the mask while the whole mesh becomes
    // translucent. Keeping the original cutoff would discard every fragment
    // when the preview opacity is lower than that cutoff.
    material.alphaTest =
      isVisible && appearance.opacity > 0
        ? appearance.alphaTest * (opacity / appearance.opacity)
        : appearance.alphaTest;
    material.needsUpdate = true;
  });
};

export const findHoveredBoneJointIndex = ({
  boneScreenPositions,
  pointerX,
  pointerY,
  hitRadius,
}: {|
  boneScreenPositions: Array<BoneScreenPosition>,
  pointerX: number,
  pointerY: number,
  hitRadius: number,
|}): number => {
  const maximumDistanceSquared = hitRadius * hitRadius;
  let closestBoneIndex = -1;
  let closestDistanceSquared = maximumDistanceSquared;
  let closestDepth = Infinity;

  boneScreenPositions.forEach((position, boneIndex) => {
    if (!position.isVisible) return;
    const deltaX = position.x - pointerX;
    const deltaY = position.y - pointerY;
    const distanceSquared = deltaX * deltaX + deltaY * deltaY;
    if (
      distanceSquared > closestDistanceSquared ||
      (distanceSquared === closestDistanceSquared &&
        position.depth >= closestDepth)
    ) {
      return;
    }
    closestBoneIndex = boneIndex;
    closestDistanceSquared = distanceSquared;
    closestDepth = position.depth;
  });

  return closestBoneIndex;
};
