namespace gdjs {
  // const logger = new gdjs.Logger('Save State');

  /**
   * @group Behaviors
   * @category Save State
   */
  export class SaveConfigurationRuntimeBehavior extends gdjs.RuntimeBehavior {
    private readonly _defaultProfilePersistence: 'Persisted' | 'DoNotSave' =
      'Persisted';
    private readonly _persistedInProfiles = '';

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData: any,
      owner: RuntimeObject
    ) {
      super(instanceContainer, behaviorData, owner);
      this._defaultProfilePersistence =
        behaviorData.defaultProfilePersistence || 'Persisted';
      this._persistedInProfiles = behaviorData.persistedInProfiles || '';
    }

    getDefaultProfilePersistence() {
      return this._defaultProfilePersistence;
    }

    getPersistedInProfiles() {
      return this._persistedInProfiles;
    }
  }
  gdjs.registerBehavior(
    'SaveState::SaveConfiguration',
    gdjs.SaveConfigurationRuntimeBehavior
  );
}
