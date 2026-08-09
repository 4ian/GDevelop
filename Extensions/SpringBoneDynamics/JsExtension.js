//@ts-check
/// <reference path="../JsExtensionTypes.d.ts" />

const defaults = {
  configurationResource: '',
  enabled: true,
  backendPreference: 'WebGPUPreferred',
  simulationFrequency: 120,
  maxSubsteps: 6,
  blendWeight: 1,
  movementInertia: 1,
  rotationInertia: 1,
  gravityScale: 1,
  windX: 0,
  windY: 0,
  windZ: 0,
  teleportDistance: 300,
  teleportAngle: 90,
};

/** @type {ExtensionModule} */
module.exports = {
  createExtension: function (_, gd) {
    const extension = new gd.PlatformExtension();
    extension
      .setExtensionInformation(
        'SpringBoneDynamics',
        _('Spring bone dynamics'),
        _(
          'Animate hair, tails, straps and other authored 3D model bone chains using WebGPU compute with CPU fallback.'
        ),
        'GDevelop',
        'MIT'
      )
      .setShortDescription(
        _(
          'Apply real-time secondary motion to existing bones in a skinned 3D model.'
        )
      );
    extension
      .addInstructionOrExpressionGroupMetadata(_('3D spring bones'))
      .setIcon('JsPlatform/Extensions/spring_bone_dynamics.svg');

    const implementation = new gd.BehaviorJsImplementation();
    implementation.initializeContent = function (content) {
      content.setStringAttribute(
        'configurationResource',
        defaults.configurationResource
      );
      content.setBoolAttribute('enabled', defaults.enabled);
      content.setStringAttribute(
        'backendPreference',
        defaults.backendPreference
      );
      [
        'simulationFrequency',
        'maxSubsteps',
        'blendWeight',
        'movementInertia',
        'rotationInertia',
        'gravityScale',
        'windX',
        'windY',
        'windZ',
        'teleportDistance',
        'teleportAngle',
      ].forEach((name) =>
        content.setDoubleAttribute(name, defaults[name])
      );
    };
    implementation.updateProperty = function (content, propertyName, value) {
      if (!Object.prototype.hasOwnProperty.call(defaults, propertyName)) {
        return false;
      }
      if (propertyName === 'configurationResource') {
        content.setStringAttribute(propertyName, value);
      } else if (propertyName === 'backendPreference') {
        content.setStringAttribute(
          propertyName,
          ['Auto', 'CPU', 'WebGPUPreferred'].includes(value)
            ? value
            : defaults.backendPreference
        );
      } else if (propertyName === 'enabled') {
        content.setBoolAttribute(
          propertyName,
          value === 'true' || value === '1'
        );
      } else {
        const number = Number(value);
        content.setDoubleAttribute(
          propertyName,
          Number.isFinite(number) ? number : defaults[propertyName]
        );
      }
      return true;
    };
    implementation.getProperties = function (content) {
      const properties = new gd.MapStringPropertyDescriptor();
      properties
        .getOrCreate('configurationResource')
        .setValue(content.getStringAttribute('configurationResource'))
        .setType('Resource')
        .addExtraInfo('json')
        .setLabel(_('Spring-bone configuration'))
        .setDescription(
          _(
            'A version-1 JSON resource containing the authored bone chains and body collider proxies.'
          )
        );
      properties
        .getOrCreate('enabled')
        .setValue(content.getBoolAttribute('enabled') ? 'true' : 'false')
        .setType('Boolean')
        .setLabel(_('Enable simulation'));
      properties
        .getOrCreate('backendPreference')
        .setValue(content.getStringAttribute('backendPreference'))
        .setType('Choice')
        .addChoice('WebGPUPreferred', _('Prefer WebGPU compute'))
        .addChoice('Auto', _('Automatic'))
        .addChoice('CPU', _('CPU'))
        .setLabel(_('Simulation backend'))
        .setDescription(
          _(
            'Rendering remains WebGL. CPU is used while WebGPU initializes and as a failure fallback.'
          )
        );
      const labels = {
        simulationFrequency: _('Simulation frequency (Hz)'),
        maxSubsteps: _('Maximum substeps'),
        blendWeight: _('Simulation blend weight'),
        movementInertia: _('Movement inertia'),
        rotationInertia: _('Rotation inertia'),
        gravityScale: _('Gravity scale'),
        windX: _('Wind X'),
        windY: _('Wind Y'),
        windZ: _('Wind Z'),
        teleportDistance: _('Teleport reset distance'),
        teleportAngle: _('Teleport reset angle'),
      };
      Object.keys(labels).forEach((name) => {
        const property = properties
          .getOrCreate(name)
          .setValue(String(content.getDoubleAttribute(name)))
          .setType('Number')
          .setLabel(labels[name]);
        if (name === 'simulationFrequency' || name === 'maxSubsteps') {
          property.setAdvanced(true);
        }
      });
      return properties;
    };

    const behavior = extension
      .addBehavior(
        'SpringBone3DBehavior',
        _('3D spring bone dynamics'),
        'SpringBone3DBehavior',
        _(
          'Animate existing skinned model bones after the model animation mixer runs.'
        ),
        '',
        'JsPlatform/Extensions/spring_bone_dynamics.svg',
        'SpringBone3DBehavior',
        // @ts-ignore BehaviorJsImplementation is accepted by the extension API.
        implementation,
        new gd.BehaviorsSharedData()
      )
      .setObjectType('Scene3D::Model3DObject')
      .addIncludeFile(
        'Extensions/SharedWebGpuCompute/WebGpuComputeDeviceManager.js'
      )
      .addIncludeFile(
        'Extensions/SpringBoneDynamics/SpringBoneDynamicsTypes.js'
      )
      .addIncludeFile(
        'Extensions/SpringBoneDynamics/SpringBoneConfiguration.js'
      )
      .addIncludeFile('Extensions/SpringBoneDynamics/SpringBoneBackend.js')
      .addIncludeFile('Extensions/SpringBoneDynamics/SpringBoneSolver.js')
      .addIncludeFile('Extensions/SpringBoneDynamics/CpuSpringBoneBackend.js')
      .addIncludeFile(
        'Extensions/SpringBoneDynamics/SpringBoneWebGpuShaders.js'
      )
      .addIncludeFile(
        'Extensions/SpringBoneDynamics/WebGpuSpringBoneBackend.js'
      )
      .addIncludeFile(
        'Extensions/SpringBoneDynamics/SpringBoneSimulationSystem.js'
      )
      .addIncludeFile(
        'Extensions/SpringBoneDynamics/SpringBone3DRuntimeBehavior.js'
      );

    const icon = 'JsPlatform/Extensions/spring_bone_dynamics.svg';
    const addBehaviorParameters = (metadata) =>
      metadata
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .addParameter(
          'behavior',
          _('Spring bone behavior'),
          'SpringBone3DBehavior',
          false
        );
    const addAction = (name, label, description, sentence) =>
      addBehaviorParameters(
        behavior.addAction(
          name,
          label,
          description,
          sentence,
          _('Simulation'),
          icon,
          icon
        )
      );
    addAction(
      'SetSimulationEnabled',
      _('Enable simulation'),
      _('Enable or disable spring-bone simulation.'),
      _('Set spring-bone simulation of _PARAM0_ to _PARAM2_')
    )
      .addParameter('yesorno', _('Enable'))
      .getCodeExtraInformation()
      .setFunctionName('setSimulationEnabled');
    addAction(
      'ResetSimulation',
      _('Reset simulation'),
      _('Snap all simulated hair points to the current animation pose.'),
      _('Reset spring-bone simulation of _PARAM0_')
    )
      .getCodeExtraInformation()
      .setFunctionName('resetSimulation');
    addAction(
      'NotifyTeleported',
      _('Notify that the model teleported'),
      _('Reset secondary motion on the next post-events step.'),
      _('Notify spring bones of _PARAM0_ that it teleported')
    )
      .getCodeExtraInformation()
      .setFunctionName('notifyTeleported');
    [
      ['SetBlendWeight', _('Set blend weight'), 'setBlendWeight'],
      ['SetMovementInertia', _('Set movement inertia'), 'setMovementInertia'],
      ['SetRotationInertia', _('Set rotation inertia'), 'setRotationInertia'],
      ['SetGravityScale', _('Set gravity scale'), 'setGravityScale'],
    ].forEach(([name, label, functionName]) => {
      addAction(
        name,
        label,
        _('Set a normalized spring-bone simulation parameter.'),
        _(`${label} of _PARAM0_ to _PARAM2_`)
      )
        .addParameter('expression', _('Value'))
        .getCodeExtraInformation()
        .setFunctionName(functionName);
    });
    addAction(
      'SetWind',
      _('Set wind'),
      _('Set scene-coordinate wind acceleration.'),
      _('Set spring-bone wind of _PARAM0_')
    )
      .addParameter('expression', _('X'))
      .addParameter('expression', _('Y'))
      .addParameter('expression', _('Z'))
      .getCodeExtraInformation()
      .setFunctionName('setWind');

    const addCondition = (name, label, description, sentence) =>
      addBehaviorParameters(
        behavior.addCondition(
          name,
          label,
          description,
          sentence,
          _('Simulation'),
          icon,
          icon
        )
      );
    [
      [
        'IsSimulationEnabled',
        _('Simulation is enabled'),
        'isSimulationEnabled',
      ],
      [
        'IsSimulationRunning',
        _('Simulation is running'),
        'isSimulationRunning',
      ],
      [
        'HasValidConfiguration',
        _('Configuration is valid'),
        'hasValidConfiguration',
      ],
      ['IsBudgetPaused', _('Is budget paused'), 'isBudgetPaused'],
      ['IsUsingWebGPU', _('Is using WebGPU compute'), 'isUsingWebGPU'],
      [
        'HasWebGPUFallbackOccurred',
        _('WebGPU fallback occurred'),
        'hasWebGPUFallbackOccurred',
      ],
    ].forEach(([name, label, functionName]) => {
      addCondition(
        name,
        label,
        _('Check a spring-bone simulation diagnostic.'),
        _(`${label} for _PARAM0_`)
      )
        .getCodeExtraInformation()
        .setFunctionName(functionName);
    });
    addCondition(
      'HasChain',
      _('Has chain'),
      _('Check whether the loaded configuration contains a named chain.'),
      _('_PARAM0_ has spring-bone chain _PARAM2_')
    )
      .addParameter('string', _('Chain name'))
      .getCodeExtraInformation()
      .setFunctionName('hasChain');

    [
      ['ConfigurationStatus', _('Configuration status'), 'getConfigurationStatus'],
      ['ActiveBackend', _('Active backend'), 'getActiveBackend'],
      ['BackendStatus', _('Backend status'), 'getBackendStatus'],
    ].forEach(([name, label, functionName]) => {
      addBehaviorParameters(
        behavior.addStrExpression(
          name,
          label,
          _('Return a stable spring-bone diagnostic string.'),
          _('Simulation'),
          icon
        )
      )
        .getCodeExtraInformation()
        .setFunctionName(functionName);
    });
    [
      ['ChainCount', _('Chain count'), 'getChainCount'],
      ['SimulatedBoneCount', _('Simulated bone count'), 'getSimulatedBoneCount'],
      [
        'DroppedSimulationTime',
        _('Dropped simulation time'),
        'getDroppedSimulationTime',
      ],
    ].forEach(([name, label, functionName]) => {
      addBehaviorParameters(
        behavior.addExpression(
          name,
          label,
          _('Return a spring-bone simulation diagnostic.'),
          _('Simulation'),
          icon
        )
      )
        .getCodeExtraInformation()
        .setFunctionName(functionName);
    });

    return extension;
  },

  runExtensionSanityTests: function () {
    return [];
  },
};
