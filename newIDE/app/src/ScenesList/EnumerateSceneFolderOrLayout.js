// @flow

/**
 * Scene-spezifische Enumeration und Helper-Funktionen für SceneFolderOrLayout.
 * 
 * Diese Datei ist das Scene-Äquivalent zu EnumerateObjectFolderOrObject.js
 */

export type SceneFolderOrLayoutWithContext = {|
  layoutFolderOrLayout: gdLayoutFolderOrLayout,
  global: boolean,
|};

/**
 * Holt die Hierarchie von Folders (ohne Root) für ein Scene FolderOrItem.
 * 
 * @param layoutFolderOrLayout - Das Layout FolderOrItem
 * @returns Array von Parent-Folders (von unten nach oben, ohne Root)
 * 
 * @example
 * // Für: RootFolder > Folder1 > Folder2 > Scene
 * getFoldersAscendanceWithoutRootFolder(scene)
 * // Returns: [Folder2, Folder1]
 */
export const getFoldersAscendanceWithoutRootFolder = (
  layoutFolderOrLayout: gdLayoutFolderOrLayout
): Array<gdLayoutFolderOrLayout> => {
  const folders = [];
  let currentParent = layoutFolderOrLayout.getParent();
  
  while (currentParent && !currentParent.isRootFolder()) {
    folders.push(currentParent);
    currentParent = currentParent.getParent();
  }
  
  return folders;
};

/**
 * Prüft ob ein LayoutFolderOrLayout ein Folder ist.
 * 
 * @param layoutFolderOrLayout - Das zu prüfende Item
 * @returns true wenn es ein Folder ist
 */
export const isSceneFolder = (
  layoutFolderOrLayout: gdLayoutFolderOrLayout
): boolean => {
  return layoutFolderOrLayout.isFolder();
};

/**
 * Holt das Layout aus einem LayoutFolderOrLayout.
 * 
 * @param layoutFolderOrLayout - Das FolderOrItem
 * @returns Das Layout, oder null wenn es ein Folder ist
 */
export const getLayout = (
  layoutFolderOrLayout: gdLayoutFolderOrLayout
): ?gdLayout => {
  if (layoutFolderOrLayout.isFolder()) {
    return null;
  }
  return layoutFolderOrLayout.getItem();
};

/**
 * Holt den Namen eines LayoutFolderOrLayout (Folder-Name oder Layout-Name).
 * 
 * @param layoutFolderOrLayout - Das FolderOrItem
 * @returns Der Name
 */
export const getLayoutFolderOrLayoutName = (
  layoutFolderOrLayout: gdLayoutFolderOrLayout
): string => {
  if (layoutFolderOrLayout.isFolder()) {
    return layoutFolderOrLayout.getFolderName();
  }
  const layout = layoutFolderOrLayout.getItem();
  return layout ? layout.getName() : '';
};

/**
 * Iteriert durch alle Layouts (keine Folders) in einem Folder-Baum.
 * 
 * @param layoutsRootFolder - Der Root Folder
 * @param callback - Callback für jedes Layout
 */
export const enumerateLayouts = (
  layoutsRootFolder: gdLayoutFolderOrLayout,
  callback: (layout: gdLayout, layoutFolderOrLayout: gdLayoutFolderOrLayout) => void
): void => {
  const childrenCount = layoutsRootFolder.getChildrenCount();
  
  for (let i = 0; i < childrenCount; i++) {
    const child = layoutsRootFolder.getChildAt(i);
    if (!child) continue;
    
    if (child.isFolder()) {
      // Rekursiv in Subfolder
      enumerateLayouts(child, callback);
    } else {
      // Layout gefunden
      const layout = child.getItem();
      if (layout) {
        callback(layout, child);
      }
    }
  }
};

/**
 * Sammelt alle Layouts aus einem Folder-Baum in ein Array.
 * 
 * @param layoutsRootFolder - Der Root Folder
 * @returns Array aller Layouts
 */
export const collectAllLayouts = (
  layoutsRootFolder: gdLayoutFolderOrLayout
): Array<gdLayout> => {
  const layouts: Array<gdLayout> = [];
  
  enumerateLayouts(layoutsRootFolder, (layout) => {
    layouts.push(layout);
  });
  
  return layouts;
};

/**
 * Findet ein Layout anhand des Namens im Folder-Baum.
 * 
 * @param layoutsRootFolder - Der Root Folder
 * @param layoutName - Der Name des gesuchten Layouts
 * @returns Das Layout, oder null wenn nicht gefunden
 */
export const findLayoutByName = (
  layoutsRootFolder: gdLayoutFolderOrLayout,
  layoutName: string
): ?gdLayout => {
  let foundLayout: ?gdLayout = null;
  
  enumerateLayouts(layoutsRootFolder, (layout) => {
    if (layout.getName() === layoutName) {
      foundLayout = layout;
    }
  });
  
  return foundLayout;
};

/**
 * Zählt die Anzahl aller Layouts (ohne Folders) in einem Folder-Baum.
 * 
 * @param layoutsRootFolder - Der Root Folder
 * @returns Anzahl der Layouts
 */
export const countLayouts = (
  layoutsRootFolder: gdLayoutFolderOrLayout
): number => {
  let count = 0;
  
  enumerateLayouts(layoutsRootFolder, () => {
    count++;
  });
  
  return count;
};