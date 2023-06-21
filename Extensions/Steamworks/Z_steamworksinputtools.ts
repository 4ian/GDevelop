namespace gdjs {
  export namespace steamworks {
    gdjs.registerFirstRuntimeSceneLoadedCallback(() => {
      if (gdjs.steamworks.steamAPI) gdjs.steamworks.steamAPI.input.init();
    });

    export function getControllerCount(): integer {
      return gdjs.steamworks.steamAPI
        ? gdjs.steamworks.steamAPI.input.getControllers().length
        : 0;
    }

    export function activateActionSet(
      controllerIndex: number,
      actionSetName: string
    ): void {
      if (!gdjs.steamworks.steamAPI) return;
      gdjs.steamworks.steamAPI.input
        .getControllers()
        [controllerIndex]?.activateActionSet(
          gdjs.steamworks.steamAPI.input.getActionSet(actionSetName)
        );
    }

    export function isDigitalActionPressed(
      controllerIndex: number,
      actionName: string
    ): boolean {
      if (!gdjs.steamworks.steamAPI) return false;
      return !!gdjs.steamworks.steamAPI.input
        .getControllers()
        [controllerIndex]?.isDigitalActionPressed(
          gdjs.steamworks.steamAPI.input.getDigitalAction(actionName)
        );
    }

    export function getAnalogActionVectorX(
      controllerIndex: number,
      actionName: string
    ): float {
      return gdjs.steamworks.steamAPI
        ? gdjs.steamworks.steamAPI.input
            .getControllers()
            [controllerIndex]?.getAnalogActionVector(
              gdjs.steamworks.steamAPI.input.getAnalogAction(actionName)
            ).x ?? 0
        : 0;
    }

    export function getAnalogActionVectorY(
      controllerIndex: number,
      actionName: string
    ): float {
      return gdjs.steamworks.steamAPI
        ? gdjs.steamworks.steamAPI.input
            .getControllers()
            [controllerIndex]?.getAnalogActionVector(
              gdjs.steamworks.steamAPI.input.getAnalogAction(actionName)
            ).y ?? 0
        : 0;
    }
  }
}
