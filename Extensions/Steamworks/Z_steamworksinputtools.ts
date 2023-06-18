namespace gdjs {
  export namespace steamworks {
    gdjs.registerFirstRuntimeSceneLoadedCallback(() => {
      if (gdjs.steamworks.steamAPI) gdjs.steamworks.steamAPI.input.init();
    });

    export function getControllerCount() {
      return gdjs.steamworks.steamAPI
        ? gdjs.steamworks.steamAPI.input.getControllers().length
        : 0;
    }

    export function activateActionSet(
      controllerIndex: number,
      actionSetName: string
    ) {
      if (gdjs.steamworks.steamAPI) {
        gdjs.steamworks.steamAPI.input
          .getControllers()
          [controllerIndex]?.activateActionSet(
            gdjs.steamworks.steamAPI.input.getActionSet(actionSetName)
          );
      }
    }

    export function isDigitalActionPressed(
      controllerIndex: number,
      actionName: string
    ) {
      if (gdjs.steamworks.steamAPI) {
        gdjs.steamworks.steamAPI.input
          .getControllers()
          [controllerIndex]?.isDigitalActionPressed(
            gdjs.steamworks.steamAPI.input.getDigitalAction(actionName)
          );
      }
    }

    export function getAnalogActionVectorX(
      controllerIndex: number,
      actionName: string
    ) {
      if (gdjs.steamworks.steamAPI) {
        gdjs.steamworks.steamAPI.input
          .getControllers()
          [controllerIndex]?.getAnalogActionVector(
            gdjs.steamworks.steamAPI.input.getAnalogAction(actionName)
          ).x;
      }
    }

    export function getAnalogActionVectorY(
      controllerIndex: number,
      actionName: string
    ) {
      if (gdjs.steamworks.steamAPI) {
        gdjs.steamworks.steamAPI.input
          .getControllers()
          [controllerIndex]?.getAnalogActionVector(
            gdjs.steamworks.steamAPI.input.getAnalogAction(actionName)
          ).y;
      }
    }
  }
}
