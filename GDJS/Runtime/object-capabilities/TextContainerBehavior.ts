/*
 * GDevelop JS Platform
 * Copyright 2013-2023 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  export interface TextContainer {
    /**
     * Get the text displayed by the object.
     */
    getText(): string;

    /**
     * Set the text displayed by the object.
     * @param text The new text
     */
    setText(text: string): void;
  }

  /**
   * A behavior that forwards the TextContainer interface to its object.
   */
  export class TextContainerBehavior
    extends gdjs.RuntimeBehavior
    implements TextContainer {
    private object: gdjs.RuntimeObject & TextContainer;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData,
      owner: gdjs.RuntimeObject & TextContainer
    ) {
      super(instanceContainer, behaviorData, owner);
      this.object = owner;
    }

    usesLifecycleFunction(): boolean {
      return false;
    }

    updateFromBehaviorData(oldBehaviorData, newBehaviorData): boolean {
      // Nothing to update.
      return true;
    }

    onDeActivate() {}

    onDestroy() {}

    doStepPreEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {}

    doStepPostEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {}

    getText(): string {
      return this.object.getText();
    }

    setText(text: string): void {
      this.object.setText(text);
    }
  }

  gdjs.registerBehavior(
    'TextContainerCapability::TextContainerBehavior',
    gdjs.TextContainerBehavior
  );
}
