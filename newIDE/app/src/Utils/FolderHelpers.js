// @flow

/**
 * Generische Hilfsfunktionen für FolderOrItem<T> Strukturen.
 * 
 * Diese Funktionen funktionieren mit:
 * - gdObjectFolderOrObject (Objects)
 * - gdLayoutFolderOrLayout (Scenes)
 * - gdExternalLayoutFolderOrLayout (External Layouts)
 * - Jede andere FolderOrItem<T> Struktur aus dem C++ Backend
 */

/**
 * Ermittelt den Parent-Folder und die Position für ein neues Item,
 * basierend auf dem aktuell ausgewählten Item.
 * 
 * Logik:
 * - Wenn ein Folder ausgewählt ist: Füge ans Ende des Folders ein
 * - Wenn ein Item ausgewählt ist: Füge nach dem Item ein (im gleichen Parent)
 * 
 * @template TFolderOrItem - Der C++ FolderOrItem Typ (z.B. gdObjectFolderOrObject)
 * @param selectedFolderOrItem - Das aktuell ausgewählte Folder oder Item
 * @returns {{ folder: TFolderOrItem, position: number }} - Parent und Position zum Einfügen
 * 
 * @example
 * // Für Objects:
 * const { folder, position } = getInsertionParentAndPosition(selectedObjectFolderOrObject);
 * const newObject = folder.insertObject(newName, position);
 * 
 * @example
 * // Für Scenes:
 * const { folder, position } = getInsertionParentAndPosition(selectedLayoutFolderOrLayout);
 * const newScene = folder.insertLayout(newScene, position);
 */
export function getInsertionParentAndPosition<TFolderOrItem>(
  selectedFolderOrItem: TFolderOrItem
): {| folder: TFolderOrItem, position: number |} {
  // Prüfe ob es ein Folder ist (C++ Methode: bool IsFolder())
  const isFolder = typeof selectedFolderOrItem.isFolder === 'function'
    ? selectedFolderOrItem.isFolder()
    : false;

  if (isFolder) {
    // Wenn Folder: Füge am Ende des Folders ein
    const parentFolder = selectedFolderOrItem;
    const childrenCount = typeof parentFolder.getChildrenCount === 'function'
      ? parentFolder.getChildrenCount()
      : 0;
    
    return {
      folder: parentFolder,
      position: childrenCount,
    };
  } else {
    // Wenn Item: Füge nach dem Item ein (im gleichen Parent)
    const parentFolder = selectedFolderOrItem.getParent();
    const position = parentFolder.getChildPosition(selectedFolderOrItem) + 1;
    
    return {
      folder: parentFolder,
      position: position,
    };
  }
}

/**
 * Prüft ob ein FolderOrItem ein Folder ist.
 * 
 * @template TFolderOrItem
 * @param folderOrItem - Das zu prüfende Item
 * @returns {boolean} - true wenn es ein Folder ist
 * 
 * @example
 * if (isFolder(selectedItem)) {
 *   console.log('Es ist ein Folder');
 * }
 */
export function isFolder<TFolderOrItem>(
  folderOrItem: TFolderOrItem
): boolean {
  return typeof folderOrItem.isFolder === 'function'
    ? folderOrItem.isFolder()
    : false;
}

/**
 * Holt das eigentliche Item aus einem FolderOrItem.
 * 
 * @template TFolderOrItem - Der FolderOrItem Typ
 * @template TItem - Der Item Typ (z.B. gdObject, gdLayout)
 * @param folderOrItem - Das FolderOrItem
 * @returns {TItem | null} - Das Item, oder null wenn es ein Folder ist
 * 
 * @example
 * const object = getItem(objectFolderOrObject); // gdObject
 * const scene = getItem(layoutFolderOrLayout); // gdLayout
 */
export function getItem<TFolderOrItem, TItem>(
  folderOrItem: TFolderOrItem
): TItem | null {
  if (isFolder(folderOrItem)) {
    return null;
  }
  
  return typeof folderOrItem.getItem === 'function'
    ? folderOrItem.getItem()
    : null;
}

/**
 * Holt den Namen eines FolderOrItem (Folder-Name oder Item-Name).
 * 
 * @template TFolderOrItem
 * @param folderOrItem - Das FolderOrItem
 * @param getItemName - Funktion um den Namen des Items zu holen
 * @returns {string} - Der Name
 * 
 * @example
 * const name = getName(
 *   objectFolderOrObject,
 *   (obj) => obj.getName()
 * );
 */
export function getName<TFolderOrItem, TItem>(
  folderOrItem: TFolderOrItem,
  getItemName: (item: TItem) => string
): string {
  if (isFolder(folderOrItem)) {
    return typeof folderOrItem.getFolderName === 'function'
      ? folderOrItem.getFolderName()
      : '';
  }
  
  const item = getItem(folderOrItem);
  return item ? getItemName(item) : '';
}

/**
 * Prüft ob ein FolderOrItem ein Nachfahre (descendant) eines anderen ist.
 * Verhindert zirkuläre Referenzen beim Drag & Drop.
 * 
 * @template TFolderOrItem
 * @param folderOrItem - Das potenzielle Kind
 * @param potentialAncestor - Der potenzielle Vorfahre
 * @returns {boolean} - true wenn folderOrItem ein Nachfahre von potentialAncestor ist
 * 
 * @example
 * // Verhindere Drag & Drop eines Folders in sich selbst:
 * if (isDescendantOf(draggedFolder, targetFolder)) {
 *   return false; // Nicht erlaubt
 * }
 */
export function isDescendantOf<TFolderOrItem>(
  folderOrItem: TFolderOrItem,
  potentialAncestor: TFolderOrItem
): boolean {
  return typeof folderOrItem.isADescendantOf === 'function'
    ? folderOrItem.isADescendantOf(potentialAncestor)
    : false;
}

/**
 * Holt die Anzahl der Kinder eines Folders.
 * 
 * @template TFolder
 * @param folder - Der Folder
 * @returns {number} - Anzahl der Kinder
 * 
 * @example
 * const count = getChildrenCount(objectsRootFolder);
 * console.log(`Folder hat ${count} Kinder`);
 */
export function getChildrenCount<TFolder>(folder: TFolder): number {
  return typeof folder.getChildrenCount === 'function'
    ? folder.getChildrenCount()
    : 0;
}

/**
 * Holt ein Kind eines Folders an einem bestimmten Index.
 * 
 * @template TFolder
 * @template TFolderOrItem
 * @param folder - Der Folder
 * @param index - Der Index des Kindes
 * @returns {TFolderOrItem | null} - Das Kind, oder null
 * 
 * @example
 * const firstChild = getChildAt(folder, 0);
 */
export function getChildAt<TFolder, TFolderOrItem>(
  folder: TFolder,
  index: number
): TFolderOrItem | null {
  return typeof folder.getChildAt === 'function'
    ? folder.getChildAt(index)
    : null;
}

/**
 * Holt den Parent eines FolderOrItem.
 * 
 * @template TFolderOrItem
 * @param folderOrItem - Das FolderOrItem
 * @returns {TFolderOrItem | null} - Der Parent, oder null wenn Root
 * 
 * @example
 * const parent = getParent(selectedObject);
 * if (parent) {
 *   console.log('Parent Folder:', getName(parent, ...));
 * }
 */
export function getParent<TFolderOrItem>(
  folderOrItem: TFolderOrItem
): TFolderOrItem | null {
  return typeof folderOrItem.getParent === 'function'
    ? folderOrItem.getParent()
    : null;
}

/**
 * Bewegt ein FolderOrItem zu einer neuen Position.
 * 
 * @template TFolderOrItem
 * @param sourceFolder - Der Source Folder (Parent des zu verschiebenden Items)
 * @param folderOrItem - Das zu verschiebende FolderOrItem
 * @param targetFolder - Der Ziel-Folder
 * @param targetPosition - Die Ziel-Position
 * 
 * @example
 * moveFolderOrItem(
 *   sourceFolder,
 *   draggedObject,
 *   targetFolder,
 *   targetPosition
 * );
 */
export function moveFolderOrItem<TFolderOrItem>(
  sourceFolder: TFolderOrItem,
  folderOrItem: TFolderOrItem,
  targetFolder: TFolderOrItem,
  targetPosition: number
): void {
  if (typeof targetFolder.moveObjectFolderOrObjectToAnotherFolder === 'function') {
    targetFolder.moveObjectFolderOrObjectToAnotherFolder(
      folderOrItem,
      targetPosition
    );
  }
}

/**
 * Erstellt einen neuen Folder in einem Parent-Folder.
 * 
 * @template TFolder
 * @param parentFolder - Der Parent Folder
 * @param folderName - Name des neuen Folders
 * @param position - Position im Parent
 * @returns {TFolder | null} - Der neue Folder, oder null bei Fehler
 * 
 * @example
 * const newFolder = insertNewFolder(
 *   objectsRootFolder,
 *   'My Folder',
 *   0
 * );
 */
export function insertNewFolder<TFolder>(
  parentFolder: TFolder,
  folderName: string,
  position: number
): TFolder | null {
  return typeof parentFolder.insertNewFolder === 'function'
    ? parentFolder.insertNewFolder(folderName, position)
    : null;
}

/**
 * Prüft ob ein Folder-Name bereits existiert (in den direkten Kindern).
 * 
 * @template TFolder
 * @param parentFolder - Der Parent Folder
 * @param folderName - Der zu prüfende Name
 * @returns {boolean} - true wenn der Name existiert
 * 
 * @example
 * if (hasFolderNamed(parentFolder, 'MyFolder')) {
 *   console.log('Folder existiert bereits');
 * }
 */
export function hasFolderNamed<TFolder>(
  parentFolder: TFolder,
  folderName: string
): boolean {
  const childrenCount = getChildrenCount(parentFolder);
  
  for (let i = 0; i < childrenCount; i++) {
    const child = getChildAt(parentFolder, i);
    if (!child) continue;
    
    if (isFolder(child)) {
      const childName = typeof child.getFolderName === 'function'
        ? child.getFolderName()
        : '';
      
      if (childName === folderName) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Iteriert durch alle Kinder eines Folders.
 * 
 * @template TFolder
 * @template TFolderOrItem
 * @param folder - Der Folder
 * @param callback - Callback für jedes Kind
 * 
 * @example
 * forEachChild(objectsRootFolder, (child, index) => {
 *   console.log(`Child ${index}:`, getName(child, ...));
 * });
 */
export function forEachChild<TFolder, TFolderOrItem>(
  folder: TFolder,
  callback: (child: TFolderOrItem, index: number) => void
): void {
  const childrenCount = getChildrenCount(folder);
  
  for (let i = 0; i < childrenCount; i++) {
    const child = getChildAt(folder, i);
    if (child) {
      callback(child, i);
    }
  }
}

/**
 * Sammelt alle Items (keine Folders) aus einem Folder-Baum.
 * 
 * @template TFolder
 * @template TFolderOrItem
 * @template TItem
 * @param folder - Der Root Folder
 * @returns {Array<TItem>} - Array aller Items
 * 
 * @example
 * const allObjects = collectAllItems(objectsRootFolder);
 * console.log(`Projekt hat ${allObjects.length} Objekte`);
 */
export function collectAllItems<TFolder, TFolderOrItem, TItem>(
  folder: TFolder
): Array<TItem> {
  const items: Array<TItem> = [];
  
  forEachChild(folder, (child) => {
    if (isFolder(child)) {
      // Rekursiv in Subfolder
      items.push(...collectAllItems(child));
    } else {
      // Item hinzufügen
      const item = getItem(child);
      if (item) {
        items.push(item);
      }
    }
  });
  
  return items;
}