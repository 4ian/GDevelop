namespace gdjs {
  export namespace evtTools {
    export namespace json {
      export const loadJSONResource = (
        scene: gdjs.RuntimeScene,
        resourceName: string,
        variable: gdjs.Variable
      ) => {
        variable.fromJSObject(
          scene.getGame().getJsonManager().getLoadedJson(resourceName)
        );
      };
    }
  }
}
