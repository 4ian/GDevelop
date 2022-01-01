/// <reference path="shifty.d.ts" />
namespace gdjs {
  export namespace evtTools {
    export namespace tween {
      export const interpolate = (
        from: number,
        to: number,
        position: number,
        easing: shifty.easingFunction
      ) =>
        shifty.interpolate({ value: from }, { value: to }, position, easing)
          .value;

      interface RuntimeScene {
        _tweens: Map<string, shifty.Tweenable>;
      }

      interface shifty.Tweenable {
        
      }

      const getTweensMap = (rs: RuntimeScene) =>
        rs._tweens || (rs._tweens = new Map());

      export const hasTween = (rs: RuntimeScene, id: string) =>
        getTweensMap(rs).has(id);

      export const isPlaying = (rs: RuntimeScene, id: string) => {
        const map = getTweensMap(rs);
        return map.has(id) && map.get(id)!.isPlaying();
      };

      export const hasFinished = (rs: RuntimeScene, id: string) => {
        const map = getTweensMap(rs);
        return map.has(id) && map.get(id)!.hasFinished;
      };

      export const isPlaying = (rs: RuntimeScene, id: string) => {
        const map = getTweensMap(rs);
        return map.has(id) && map.get(id)!.isPlaying();
      };

      export const isPlaying = (rs: RuntimeScene, id: string) => {
        const map = getTweensMap(rs);
        return map.has(id) && map.get(id)!.isPlaying();
      };

      export const tweenVariable = (
        rs: RuntimeScene,
        identifier: string,
        variable: Variable,
        from: number,
        to: number,
        duration: number,
        easing: shifty.easingFunction
      ) => {
        getTweensMap(rs).set(
          identifier,
          shifty.tween({
            from: { value: from },
            to: { value: to },
            easing,
            duration,
            render: ({ value }) => variable.setNumber(value),
          })
        );
      };
    }
  }
}
