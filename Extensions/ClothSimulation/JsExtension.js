//@ts-check
/// <reference path="../JsExtensionTypes.d.ts" />

const defaultContent = {
  width: 200,
  height: 200,
  depth: 100,
  segmentsX: 30,
  segmentsY: 30,
  backendPreference: 'Auto',
  simulationFrequency: 360,
  maxSubsteps: 8,
  stiffness: 0.2,
  damping: 0.99,
  gravityX: 0,
  gravityY: 0,
  gravityZ: -600,
  windX: 0,
  windY: 0,
  windZ: 0,
  pinMode: 'TopEveryN',
  pinInterval: 5,
  sphereColliderEnabled: false,
  sphereCenterX: 0,
  sphereCenterY: 0,
  sphereCenterZ: 0,
  sphereRadius: 25,
  color: '32;64;128',
  opacity: 0.85,
  roughness: 0.8,
  metalness: 0,
  doubleSided: true,
  isCastingShadow: false,
  isReceivingShadow: true,
};

const clamp = (value, minimum, maximum) =>
  Math.min(maximum, Math.max(minimum, value));
const finite = (value, fallback) =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;
const integer = (value, fallback, minimum, maximum) =>
  clamp(Math.trunc(finite(value, fallback)), minimum, maximum);
const boolean = (value, fallback) =>
  typeof value === 'boolean' ? value : fallback;
const normalizeColor = (value) => {
  if (typeof value !== 'string') return defaultContent.color;
  const rgbMatch = value.match(
    /^\s*(\d{1,3})\s*;\s*(\d{1,3})\s*;\s*(\d{1,3})\s*$/
  );
  if (rgbMatch) {
    const red = Number(rgbMatch[1]);
    const green = Number(rgbMatch[2]);
    const blue = Number(rgbMatch[3]);
    if (red <= 255 && green <= 255 && blue <= 255) {
      return `${red};${green};${blue}`;
    }
  }
  const hexMatch = value.match(/^#?([0-9a-fA-F]{6})$/);
  if (!hexMatch) return defaultContent.color;
  const color = parseInt(hexMatch[1], 16);
  return `${(color >> 16) & 255};${(color >> 8) & 255};${color & 255}`;
};

/** Normalize editor-side object content before it is stored. */
const normalizeContent = (content) => {
  const segmentsX = integer(content.segmentsX, 30, 2, 64);
  const segmentsY = integer(content.segmentsY, 30, 2, 64);
  const backendPreference = ['Auto', 'CPU', 'WebGPUPreferred'].includes(
    content.backendPreference
  )
    ? content.backendPreference
    : 'Auto';
  const pinMode = ['None', 'TopCorners', 'TopEdge', 'TopEveryN'].includes(
    content.pinMode
  )
    ? content.pinMode
    : 'TopEveryN';
  return {
    ...defaultContent,
    ...content,
    width: Math.max(1, finite(content.width, 200)),
    height: Math.max(1, finite(content.height, 200)),
    depth: Math.max(1, finite(content.depth, 100)),
    segmentsX,
    segmentsY,
    backendPreference,
    simulationFrequency: integer(content.simulationFrequency, 360, 30, 360),
    maxSubsteps: integer(content.maxSubsteps, 8, 1, 12),
    stiffness: clamp(finite(content.stiffness, 0.2), 0, 1),
    damping: clamp(finite(content.damping, 0.99), 0, 1),
    gravityX: clamp(finite(content.gravityX, 0), -100000, 100000),
    gravityY: clamp(finite(content.gravityY, 0), -100000, 100000),
    gravityZ: clamp(finite(content.gravityZ, -600), -100000, 100000),
    windX: clamp(finite(content.windX, 0), -100000, 100000),
    windY: clamp(finite(content.windY, 0), -100000, 100000),
    windZ: clamp(finite(content.windZ, 0), -100000, 100000),
    pinMode,
    pinInterval: integer(content.pinInterval, 5, 1, segmentsX + 1),
    sphereColliderEnabled: boolean(
      content.sphereColliderEnabled,
      defaultContent.sphereColliderEnabled
    ),
    sphereCenterX: finite(content.sphereCenterX, 0),
    sphereCenterY: finite(content.sphereCenterY, 0),
    sphereCenterZ: finite(content.sphereCenterZ, 0),
    sphereRadius: clamp(finite(content.sphereRadius, 25), 0, 1000000),
    color: normalizeColor(content.color),
    opacity: clamp(finite(content.opacity, 0.85), 0, 1),
    roughness: clamp(finite(content.roughness, 0.8), 0, 1),
    metalness: clamp(finite(content.metalness, 0), 0, 1),
    doubleSided: boolean(content.doubleSided, defaultContent.doubleSided),
    isCastingShadow: boolean(
      content.isCastingShadow,
      defaultContent.isCastingShadow
    ),
    isReceivingShadow: boolean(
      content.isReceivingShadow,
      defaultContent.isReceivingShadow
    ),
  };
};

/** @type {ExtensionModule} */
module.exports = {
  createExtension: function (_, gd) {
    const extension = new gd.PlatformExtension();
    extension
      .setExtensionInformation(
        'ClothSimulation',
        _('Cloth simulation'),
        _('Add simulated 3D cloth rendered with the existing 3D renderer.'),
        'GDevelop',
        'MIT'
      )
      .setShortDescription(
        _(
          'Simulate rectangular cloth with CPU fallback and optional WebGPU compute.'
        )
      );
    extension
      .addInstructionOrExpressionGroupMetadata(_('3D cloth'))
      .setIcon('JsPlatform/Extensions/cloth_simulation.svg');

    const clothObject = new gd.ObjectJsImplementation();
    clothObject.content = { ...defaultContent };
    clothObject.updateProperty = (propertyName, newValue) => {
      if (!Object.prototype.hasOwnProperty.call(defaultContent, propertyName)) {
        return false;
      }
      const booleanProperties = new Set([
        'sphereColliderEnabled',
        'doubleSided',
        'isCastingShadow',
        'isReceivingShadow',
      ]);
      const stringProperties = new Set([
        'backendPreference',
        'pinMode',
        'color',
      ]);
      const value = booleanProperties.has(propertyName)
        ? newValue === 'true' || newValue === '1'
          ? true
          : newValue === 'false' || newValue === '0'
            ? false
            : defaultContent[propertyName]
        : stringProperties.has(propertyName)
          ? newValue
          : Number(newValue);
      clothObject.content = normalizeContent({
        ...clothObject.content,
        [propertyName]: value,
      });
      return true;
    };
    clothObject.getProperties = () => {
      clothObject.content = normalizeContent(clothObject.content || {});
      const properties = new gd.MapStringPropertyDescriptor();
      const addNumber = (name, label, group, advanced = false) => {
        const descriptor = properties
          .getOrCreate(name)
          .setValue(String(clothObject.content[name]))
          .setType('number')
          .setLabel(label)
          .setGroup(group);
        if (advanced) descriptor.setAdvanced(true);
      };
      const addBoolean = (name, label, group) =>
        properties
          .getOrCreate(name)
          .setValue(clothObject.content[name] ? 'true' : 'false')
          .setType('boolean')
          .setLabel(label)
          .setGroup(group);

      addNumber('width', _('Width'), _('Default size'));
      addNumber('height', _('Height'), _('Default size'));
      addNumber('depth', _('Depth'), _('Default size'));
      addNumber('segmentsX', _('Horizontal segments'), _('Mesh'));
      addNumber('segmentsY', _('Vertical segments'), _('Mesh'));
      properties
        .getOrCreate('backendPreference')
        .setValue(clothObject.content.backendPreference)
        .setType('choice')
        .addChoice('Auto', _('Automatic (recommended)'))
        .addChoice('CPU', _('CPU'))
        .addChoice('WebGPUPreferred', _('Prefer WebGPU compute'))
        .setLabel(_('Simulation backend'))
        .setDescription(
          _(
            'WebGPU compute is used when suitable and available. CPU is always used as a fallback, and rendering remains WebGL.'
          )
        )
        .setGroup(_('Backend'));
      addNumber(
        'simulationFrequency',
        _('Simulation frequency (Hz)'),
        _('Advanced simulation'),
        true
      );
      addNumber(
        'maxSubsteps',
        _('Maximum substeps per frame'),
        _('Advanced simulation'),
        true
      );
      addNumber('stiffness', _('Stiffness'), _('Fabric'));
      addNumber('damping', _('Damping'), _('Fabric'));
      addNumber('gravityX', _('Gravity X'), _('Forces'));
      addNumber('gravityY', _('Gravity Y'), _('Forces'));
      addNumber('gravityZ', _('Gravity Z'), _('Forces'));
      addNumber('windX', _('Wind X'), _('Forces'));
      addNumber('windY', _('Wind Y'), _('Forces'));
      addNumber('windZ', _('Wind Z'), _('Forces'));
      properties
        .getOrCreate('pinMode')
        .setValue(clothObject.content.pinMode)
        .setType('choice')
        .addChoice('None', _('None'))
        .addChoice('TopCorners', _('Top corners'))
        .addChoice('TopEdge', _('Top edge'))
        .addChoice('TopEveryN', _('Every N vertices on top'))
        .setLabel(_('Pin mode'))
        .setGroup(_('Pinning'));
      addNumber('pinInterval', _('Pin interval'), _('Pinning'));
      addBoolean(
        'sphereColliderEnabled',
        _('Enable sphere collider'),
        _('Sphere collider')
      );
      addNumber('sphereCenterX', _('Sphere center X'), _('Sphere collider'));
      addNumber('sphereCenterY', _('Sphere center Y'), _('Sphere collider'));
      addNumber('sphereCenterZ', _('Sphere center Z'), _('Sphere collider'));
      addNumber('sphereRadius', _('Sphere radius'), _('Sphere collider'));
      properties
        .getOrCreate('color')
        .setValue(clothObject.content.color)
        .setType('color')
        .setLabel(_('Color'))
        .setGroup(_('Appearance'));
      addNumber('opacity', _('Opacity'), _('Appearance'));
      addNumber('roughness', _('Roughness'), _('Appearance'));
      addNumber('metalness', _('Metalness'), _('Appearance'));
      addBoolean('doubleSided', _('Double sided'), _('Appearance'));
      addBoolean('isCastingShadow', _('Cast shadows'), _('Appearance'));
      addBoolean('isReceivingShadow', _('Receive shadows'), _('Appearance'));
      return properties;
    };
    clothObject.updateInitialInstanceProperty = function () {
      return false;
    };
    clothObject.getInitialInstanceProperties = function () {
      return new gd.MapStringPropertyDescriptor();
    };

    const object = extension
      .addObject(
        'Cloth3DObject',
        _('3D cloth'),
        _('A rectangular 3D cloth with real-time simulation.'),
        'JsPlatform/Extensions/cloth_simulation.svg',
        clothObject
      )
      .setCategory('General')
      .setAssetStoreTag('3d cloth')
      .addDefaultBehavior('ResizableCapability::ResizableBehavior')
      .addDefaultBehavior('ScalableCapability::ScalableBehavior')
      .addDefaultBehavior('FlippableCapability::FlippableBehavior')
      .addDefaultBehavior('Scene3D::Base3DBehavior')
      .markAsRenderedIn3D()
      .setIncludeFile('Extensions/3D/A_RuntimeObject3D.js')
      .addIncludeFile('Extensions/3D/A_RuntimeObject3DRenderer.js')
      .addIncludeFile('Extensions/ClothSimulation/ClothSimulationTypes.js')
      .addIncludeFile('Extensions/ClothSimulation/ClothSimulationTopology.js')
      .addIncludeFile('Extensions/ClothSimulation/ClothSimulationBackend.js')
      .addIncludeFile('Extensions/ClothSimulation/CpuClothSimulationBackend.js')
      .addIncludeFile(
        'Extensions/SharedWebGpuCompute/WebGpuComputeDeviceManager.js'
      )
      .addIncludeFile('Extensions/ClothSimulation/WebGpuClothDeviceManager.js')
      .addIncludeFile(
        'Extensions/ClothSimulation/WebGpuClothSimulationBackend.js'
      )
      .addIncludeFile('Extensions/ClothSimulation/ClothSimulationSystem.js')
      .addIncludeFile('Extensions/ClothSimulation/Cloth3DRuntimeObject.js')
      .addIncludeFile(
        'Extensions/ClothSimulation/Cloth3DRuntimeObjectRenderer.js'
      );

    const icon = 'JsPlatform/Extensions/cloth_simulation.svg';
    const addAction = (name, label, description, sentence) =>
      object
        .addScopedAction(
          name,
          label,
          description,
          sentence,
          _('Simulation'),
          icon,
          icon
        )
        .addParameter('object', _('3D cloth'), 'Cloth3DObject', false);
    addAction(
      'SetSimulationEnabled',
      _('Enable simulation'),
      _('Enable or disable cloth simulation.'),
      _('Set simulation of _PARAM0_ to _PARAM1_')
    )
      .addParameter('yesorno', _('Enable'))
      .setFunctionName('setSimulationEnabled');
    addAction(
      'ResetSimulation',
      _('Reset simulation'),
      _('Put the cloth back in its rest pose.'),
      _('Reset the simulation of _PARAM0_')
    ).setFunctionName('resetSimulation');
    addAction(
      'ResetPinning',
      _('Reset pinning'),
      _('Restore the authored pinning configuration.'),
      _('Reset pinning of _PARAM0_')
    ).setFunctionName('resetPinning');
    addAction(
      'SetStiffness',
      _('Set stiffness'),
      _('Set cloth stiffness between 0 and 1.'),
      _('Set stiffness of _PARAM0_ to _PARAM1_')
    )
      .addParameter('expression', _('Stiffness'))
      .setFunctionName('setStiffness');
    addAction(
      'SetDamping',
      _('Set damping'),
      _('Set cloth damping between 0 and 1.'),
      _('Set damping of _PARAM0_ to _PARAM1_')
    )
      .addParameter('expression', _('Damping'))
      .setFunctionName('setDamping');
    addAction(
      'SetGravity',
      _('Set gravity'),
      _('Set scene-coordinate cloth gravity.'),
      _('Set gravity of _PARAM0_ to _PARAM1_; _PARAM2_; _PARAM3_')
    )
      .addParameter('expression', _('X'))
      .addParameter('expression', _('Y'))
      .addParameter('expression', _('Z'))
      .setFunctionName('setGravity');
    addAction(
      'SetWind',
      _('Set wind'),
      _('Set scene-coordinate constant wind acceleration.'),
      _('Set wind of _PARAM0_ to _PARAM1_; _PARAM2_; _PARAM3_')
    )
      .addParameter('expression', _('X'))
      .addParameter('expression', _('Y'))
      .addParameter('expression', _('Z'))
      .setFunctionName('setWind');
    addAction(
      'PinVertex',
      _('Pin a vertex'),
      _('Pin a cloth grid vertex at its current position.'),
      _('Pin vertex _PARAM1_; _PARAM2_ of _PARAM0_')
    )
      .addParameter('expression', _('Column'))
      .addParameter('expression', _('Row'))
      .setFunctionName('pinVertex');
    addAction(
      'UnpinVertex',
      _('Unpin a vertex'),
      _('Unpin a cloth grid vertex without stored release velocity.'),
      _('Unpin vertex _PARAM1_; _PARAM2_ of _PARAM0_')
    )
      .addParameter('expression', _('Column'))
      .addParameter('expression', _('Row'))
      .setFunctionName('unpinVertex');
    addAction(
      'SetSphereColliderEnabled',
      _('Enable sphere collider'),
      _('Enable or disable the local sphere collider.'),
      _('Set sphere collider of _PARAM0_ to _PARAM1_')
    )
      .addParameter('yesorno', _('Enable'))
      .setFunctionName('setSphereColliderEnabled');
    addAction(
      'SetSphereCollider',
      _('Set sphere collider'),
      _('Set the local sphere center and radius.'),
      _('Set sphere collider of _PARAM0_')
    )
      .addParameter('expression', _('Center X'))
      .addParameter('expression', _('Center Y'))
      .addParameter('expression', _('Center Z'))
      .addParameter('expression', _('Radius'))
      .setFunctionName('setSphereCollider');

    const addCondition = (name, label, description, sentence) =>
      object
        .addScopedCondition(
          name,
          label,
          description,
          sentence,
          _('Simulation'),
          icon,
          icon
        )
        .addParameter('object', _('3D cloth'), 'Cloth3DObject', false);
    addCondition(
      'IsSimulationEnabled',
      _('Simulation is enabled'),
      _('Check if cloth simulation is enabled.'),
      _('Simulation of _PARAM0_ is enabled')
    ).setFunctionName('isSimulationEnabled');
    addCondition(
      'IsSimulationRunning',
      _('Simulation is running'),
      _('Check if the cloth is admitted and running.'),
      _('Simulation of _PARAM0_ is running')
    ).setFunctionName('isSimulationRunning');
    addCondition(
      'IsVertexPinned',
      _('Vertex is pinned'),
      _('Check if a cloth grid vertex is pinned.'),
      _('Vertex _PARAM1_; _PARAM2_ of _PARAM0_ is pinned')
    )
      .addParameter('expression', _('Column'))
      .addParameter('expression', _('Row'))
      .setFunctionName('isVertexPinned');
    addCondition(
      'IsUsingWebGPU',
      _('Is using WebGPU compute'),
      _('Check if WebGPU is the active compute backend.'),
      _('_PARAM0_ is using WebGPU compute')
    ).setFunctionName('isUsingWebGPU');
    addCondition(
      'HasWebGPUFallbackOccurred',
      _('WebGPU fallback occurred'),
      _('Check if WebGPU failed and simulation fell back to CPU.'),
      _('_PARAM0_ has fallen back from WebGPU')
    ).setFunctionName('hasWebGPUFallbackOccurred');
    addCondition(
      'IsBudgetPaused',
      _('Is budget paused'),
      _('Check if scene safety budgets paused this cloth.'),
      _('_PARAM0_ is paused by the cloth budget')
    ).setFunctionName('isBudgetPaused');

    object
      .addStrExpression(
        'ActiveBackend',
        _('Active backend'),
        _('Return CPU or WebGPU for the active compute backend.'),
        _('Simulation'),
        icon
      )
      .addParameter('object', _('3D cloth'), 'Cloth3DObject', false)
      .setFunctionName('getActiveBackend');
    [
      [
        'ActualSegmentsX',
        _('Actual horizontal segments'),
        'getActualSegmentsX',
      ],
      ['ActualSegmentsY', _('Actual vertical segments'), 'getActualSegmentsY'],
      [
        'DroppedSimulationTime',
        _('Dropped simulation time'),
        'getDroppedSimulationTime',
      ],
    ].forEach(([name, label, functionName]) => {
      object
        .addExpression(
          name,
          label,
          _('Return a normalized cloth simulation diagnostic.'),
          _('Simulation'),
          icon
        )
        .addParameter('object', _('3D cloth'), 'Cloth3DObject', false)
        .setFunctionName(functionName);
    });
    return extension;
  },

  runExtensionSanityTests: function () {
    return [];
  },

  registerEditorConfigurations: function (objectsEditorService) {
    objectsEditorService.registerEditorConfiguration(
      'ClothSimulation::Cloth3DObject',
      objectsEditorService.getDefaultObjectJsImplementationPropertiesEditor({
        helpPagePath: '/objects/3d-cloth',
      })
    );
  },

  registerInstanceRenderers: function (objectsRenderingService) {
    const RenderedInstance = objectsRenderingService.RenderedInstance;
    const Rendered3DInstance = objectsRenderingService.Rendered3DInstance;
    const PIXI = objectsRenderingService.PIXI;
    const THREE = objectsRenderingService.THREE;

    const getContent = (configuration) => {
      const object = gd.castObject(configuration, gd.ObjectJsImplementation);
      return normalizeContent(object.content || {});
    };

    class RenderedCloth2DInstance extends RenderedInstance {
      constructor(
        project,
        instance,
        associatedObjectConfiguration,
        pixiContainer,
        pixiResourcesLoader
      ) {
        super(
          project,
          instance,
          associatedObjectConfiguration,
          pixiContainer,
          pixiResourcesLoader
        );
        this._pixiObject = new PIXI.Graphics();
        this._pixiContainer.addChild(this._pixiObject);
        this.update();
      }

      update() {
        const content = getContent(this._associatedObjectConfiguration);
        const width = this.getWidth();
        const height = this.getHeight();
        const color = objectsRenderingService.rgbOrHexToHexNumber(
          content.color
        );
        this._pixiObject.clear();
        this._pixiObject.beginFill(color, content.opacity * 0.25);
        this._pixiObject.lineStyle(1, color, content.opacity);
        this._pixiObject.drawRect(-width / 2, -height / 2, width, height);
        const columns = Math.min(content.segmentsX, 24);
        const rows = Math.min(content.segmentsY, 24);
        for (let column = 1; column < columns; column++) {
          const x = -width / 2 + (column / columns) * width;
          this._pixiObject.moveTo(x, -height / 2);
          this._pixiObject.lineTo(x, height / 2);
        }
        for (let row = 1; row < rows; row++) {
          const y = -height / 2 + (row / rows) * height;
          this._pixiObject.moveTo(-width / 2, y);
          this._pixiObject.lineTo(width / 2, y);
        }
        this._pixiObject.endFill();
        this._pixiObject.position.set(
          this._instance.getX() + width / 2,
          this._instance.getY() + height / 2
        );
        this._pixiObject.angle = this._instance.getAngle();
        this._pixiObject.scale.set(
          this._instance.isFlippedX() ? -1 : 1,
          this._instance.isFlippedY() ? -1 : 1
        );
      }

      getDefaultWidth() {
        return getContent(this._associatedObjectConfiguration).width;
      }
      getDefaultHeight() {
        return getContent(this._associatedObjectConfiguration).height;
      }
      getDefaultDepth() {
        return getContent(this._associatedObjectConfiguration).depth;
      }
      static getThumbnail() {
        return 'JsPlatform/Extensions/cloth_simulation.svg';
      }
      onRemovedFromScene() {
        super.onRemovedFromScene();
        this._pixiObject.destroy();
      }
    }

    class RenderedCloth3DInstance extends Rendered3DInstance {
      constructor(
        project,
        instance,
        associatedObjectConfiguration,
        pixiContainer,
        threeGroup,
        pixiResourcesLoader
      ) {
        super(
          project,
          instance,
          associatedObjectConfiguration,
          pixiContainer,
          threeGroup,
          pixiResourcesLoader
        );
        this._pixiObject = new PIXI.Graphics();
        this._pixiContainer.addChild(this._pixiObject);
        this._topologyKey = '';
        this._threeObject = new THREE.Mesh(
          new THREE.PlaneGeometry(1, 1, 2, 2),
          new THREE.MeshBasicMaterial({ wireframe: true })
        );
        this._threeObject.rotation.order = 'ZYX';
        this._threeGroup.add(this._threeObject);
        this.update();
      }

      update() {
        const content = getContent(this._associatedObjectConfiguration);
        const width = this.getWidth();
        const height = this.getHeight();
        const depth = this.getDepth();
        const topologyKey = `${width}:${height}:${content.segmentsX}:${content.segmentsY}`;
        if (topologyKey !== this._topologyKey) {
          this._threeObject.geometry.dispose();
          this._threeObject.geometry = new THREE.PlaneGeometry(
            width,
            height,
            content.segmentsX,
            content.segmentsY
          );
          this._topologyKey = topologyKey;
        }
        this._threeObject.material.color.setHex(
          objectsRenderingService.rgbOrHexToHexNumber(content.color)
        );
        this._threeObject.material.opacity = content.opacity;
        this._threeObject.material.transparent = content.opacity < 1;
        this._threeObject.material.side = content.doubleSided
          ? THREE.DoubleSide
          : THREE.FrontSide;
        this._threeObject.position.set(
          this._instance.getX() + width / 2,
          this._instance.getY() + height / 2,
          this._instance.getZ() + depth / 2
        );
        this._threeObject.rotation.set(
          RenderedInstance.toRad(this._instance.getRotationX()),
          RenderedInstance.toRad(this._instance.getRotationY()),
          RenderedInstance.toRad(this._instance.getAngle())
        );
        this._threeObject.scale.set(
          this._instance.isFlippedX() ? -1 : 1,
          this._instance.isFlippedY() ? -1 : 1,
          this._instance.isFlippedZ() ? -1 : 1
        );
      }

      getDefaultWidth() {
        return getContent(this._associatedObjectConfiguration).width;
      }
      getDefaultHeight() {
        return getContent(this._associatedObjectConfiguration).height;
      }
      getDefaultDepth() {
        return getContent(this._associatedObjectConfiguration).depth;
      }
      onRemovedFromScene() {
        super.onRemovedFromScene();
        this._threeObject.geometry.dispose();
        this._threeObject.material.dispose();
        this._pixiObject.destroy();
      }
    }

    objectsRenderingService.registerInstanceRenderer(
      'ClothSimulation::Cloth3DObject',
      RenderedCloth2DInstance
    );
    objectsRenderingService.registerInstance3DRenderer(
      'ClothSimulation::Cloth3DObject',
      RenderedCloth3DInstance
    );
  },
};
