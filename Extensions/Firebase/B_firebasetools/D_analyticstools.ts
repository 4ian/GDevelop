namespace gdjs {
  export namespace evtTools {
    export namespace firebaseTools {
      /**
       * Firebase Analytics Tools
       * @namespace
       */
      export namespace analytics {
        let analytics: firebase.analytics.Analytics | null = null;

        /**
         * Logs an event/conversion for that user on the analytics.
         * @param eventName The event being triggered.
         * @param [eventData] Additional data for the event.
         */
        export const log = (eventName: string, eventData: string): void => {
          if (!analytics) return;
          let eventProperties;
          if (eventData) {
            try {
              eventProperties = JSON.parse(eventData);
            } catch {
              eventProperties = { eventData: eventData };
            }
          }
          analytics.logEvent(eventName, eventProperties);
        };

        /**
         * Sets the User ID (the name under which the user will appear on the analytics).
         * Should be unique if possible.
         * @param newUID The new User ID.
         */
        export const setUserID = (newUID: string): void => {
          if (analytics) analytics.setUserId(newUID);
        };

        /**
         * Set an user's property.
         * @param propertyName The property's name.
         * @param [propertyData] The data associated to the property.
         */
        export const setProperty = (
          propertyName: string,
          propertyData: string
        ): void => {
          if (!analytics) return;
          let properties = {};
          try {
            properties[propertyName] = JSON.parse(propertyData);
          } catch {
            properties[propertyName] = propertyData;
          }
          analytics.setUserProperties(properties);
        };

        // Initialization step required by firebase analytics
        gdjs.evtTools.firebaseTools.onAppCreated.push(() => {
          analytics = firebase.analytics();
        });

        // Callback for setting the analytics current view to the current scene.
        gdjs.registerRuntimeSceneLoadedCallback((runtimeScene) => {
          if (analytics) analytics.setCurrentScreen(runtimeScene.getName());
        });
      }
    }
  }
}
