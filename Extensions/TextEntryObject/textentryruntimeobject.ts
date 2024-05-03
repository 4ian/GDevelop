/*
 *  GDevelop JS Platform
 *  2013 Florian Rival (Florian.Rival@gmail.com)
 */
namespace gdjs {
  /**
   * The TextEntryRuntimeObject allows to capture text typed on the keyboard.
   */
  export class TextEntryRuntimeObject extends gdjs.RuntimeObject {
    _str: string = '';
    _activated: boolean = true;
    _renderer: gdjs.TextEntryRuntimeObjectRenderer;

    /**
     * @param instanceContainer The container the object belongs to.
     * @param textEntryObjectData The initial properties of the object
     */
    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      textEntryObjectData: ObjectData
    ) {
      super(instanceContainer, textEntryObjectData);
      this._renderer = new gdjs.TextEntryRuntimeObjectRenderer(this);

      // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
      this.onCreated();
    }

    updateFromObjectData(oldObjectData, newObjectData): boolean {
      // Nothing to update.
      return true;
    }

    onDestroyed(): void {
      super.onDestroyed();
      this._renderer.onDestroy();
    }

    update(instanceContainer: gdjs.RuntimeInstanceContainer): void {
      if ((this._renderer as any).getString) {
        this._str = (this._renderer as any).getString();
      }
    }

    getString(): string {
      return this._str;
    }

    setString(str: string): void {
      this._str = str;
      this._renderer.updateString();
    }

    isActivated(): boolean {
      return this._activated;
    }

    activate(enable: boolean) {
      this._activated = enable;
      this._renderer.activate(this._activated);
    }
  }
  gdjs.registerObject(
    'TextEntryObject::TextEntry',
    gdjs.TextEntryRuntimeObject
  );
}
