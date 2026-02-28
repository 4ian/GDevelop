/**
 * GDevelop - Light3D Instance Renderers
 * Professional 2D and 3D representations for the scene editor
 */

module.exports = {
  /**
   * Register renderers for Light3D instances in the scene editor
   */
  registerInstanceRenderers: function (objectsRenderingService) {
    const RenderedInstance = objectsRenderingService.RenderedInstance;
    const Rendered3DInstance = objectsRenderingService.Rendered3DInstance;
    const PIXI = objectsRenderingService.PIXI;
    const THREE = objectsRenderingService.THREE;

    /**
     * 2D representation of Light3D in the scene editor
     */
    class RenderedLight3D2DInstance extends RenderedInstance {
      _defaultWidth = 64;
      _defaultHeight = 64;

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

      onRemovedFromScene() {
        super.onRemovedFromScene();
        this._pixiObject.destroy();
      }

      static getThumbnail(project, resourcesLoader, objectConfiguration) {
        return 'CppPlatform/Extensions/light3dicon.png';
      }

      update() {
        const width = this.getWidth();
        const height = this.getHeight();
        const object = gd.castObject(
          this._associatedObjectConfiguration,
          gd.ObjectJsImplementation
        );
        
        const content = object.content || {};
        const lightType = content.lightType || 'Point';
        const color = content.color || '255;255;255';
        const rgb = color.split(';').map((v) => parseInt(v, 10));
        const colorHex = (rgb[0] << 16) | (rgb[1] << 8) | rgb[2];
        const enabled = content.enabled !== false;
        const alpha = enabled ? 0.6 : 0.3;

        this._pixiObject.clear();

        // Draw based on light type
        if (lightType === 'Spot') {
          // Draw spotlight cone
          this._pixiObject.beginFill(colorHex, alpha * 0.3);
          this._pixiObject.lineStyle(3, colorHex, alpha);
          
          // Cone shape pointing down
          const coneHeight = height * 1.5;
          const coneWidth = width * 1.2;
          
          this._pixiObject.moveTo(0, -height / 4);
          this._pixiObject.lineTo(coneWidth / 2, coneHeight);
          this._pixiObject.lineTo(-coneWidth / 2, coneHeight);
          this._pixiObject.lineTo(0, -height / 4);
          this._pixiObject.endFill();
          
          // Light source bulb
          this._pixiObject.beginFill(colorHex, alpha * 0.8);
          this._pixiObject.drawCircle(0, 0, width / 4);
          this._pixiObject.endFill();
          
          // Bright center
          this._pixiObject.beginFill(0xffffff, alpha);
          this._pixiObject.drawCircle(0, 0, width / 8);
          this._pixiObject.endFill();
        } else {
          // Point light - draw as radiating circles
          const radius = Math.min(width, height) / 2;
          
          // Outer glow
          this._pixiObject.beginFill(colorHex, alpha * 0.2);
          this._pixiObject.drawCircle(0, 0, radius);
          this._pixiObject.endFill();
          
          // Middle ring
          this._pixiObject.beginFill(colorHex, alpha * 0.4);
          this._pixiObject.drawCircle(0, 0, radius * 0.6);
          this._pixiObject.endFill();
          
          // Inner core
          this._pixiObject.beginFill(colorHex, alpha * 0.7);
          this._pixiObject.drawCircle(0, 0, radius * 0.3);
          this._pixiObject.endFill();
          
          // Bright center
          this._pixiObject.beginFill(0xffffff, alpha);
          this._pixiObject.drawCircle(0, 0, radius * 0.15);
          this._pixiObject.endFill();
          
          // Draw rays
          this._pixiObject.lineStyle(2, colorHex, alpha * 0.5);
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x1 = Math.cos(angle) * radius * 0.4;
            const y1 = Math.sin(angle) * radius * 0.4;
            const x2 = Math.cos(angle) * radius * 0.9;
            const y2 = Math.sin(angle) * radius * 0.9;
            this._pixiObject.moveTo(x1, y1);
            this._pixiObject.lineTo(x2, y2);
          }
        }

        // Position at center
        this._pixiObject.position.x = this._instance.getX() + width / 2;
        this._pixiObject.position.y = this._instance.getY() + height / 2;
        this._pixiObject.angle = this._instance.getAngle();
      }

      getDefaultWidth() {
        return this._defaultWidth;
      }

      getDefaultHeight() {
        return this._defaultHeight;
      }

      getDefaultDepth() {
        return 0;
      }
    }

    /**
     * 3D representation of Light3D in the scene editor
     */
    class RenderedLight3D3DInstance extends Rendered3DInstance {
      _defaultWidth = 64;
      _defaultHeight = 64;
      _defaultDepth = 64;
      _light = null;
      _lightHelper = null;
      _lightTarget = null;

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

        // Create 2D representation
        this._pixiObject = new PIXI.Graphics();
        this._pixiContainer.addChild(this._pixiObject);

        // Create 3D light and helper
        this._createLight();
        
        this.update();
      }

      _createLight() {
        const object = gd.castObject(
          this._associatedObjectConfiguration,
          gd.ObjectJsImplementation
        );
        
        const content = object.content || {};
        const lightType = content.lightType || 'Point';
        const color = content.color || '255;255;255';
        const rgb = color.split(';').map((v) => parseInt(v, 10) / 255);
        const threeColor = new THREE.Color(rgb[0], rgb[1], rgb[2]);
        const intensity = content.intensity || 1.0;
        const distance = content.distance || 100;
        const decay = content.decay !== undefined ? content.decay : 2.0;
        const angle = content.angle || 45;
        const penumbra = content.penumbra || 0.0;
        const castShadow = content.castShadow !== false;

        // Clean up old light resources
        this._disposeLight();

        // Create light based on type
        if (lightType === 'Spot') {
          this._light = new THREE.SpotLight(
            threeColor,
            intensity,
            distance,
            THREE.MathUtils.degToRad(angle),
            penumbra,
            decay
          );
          
          // Create target for spotlight
          this._lightTarget = new THREE.Object3D();
          this._lightTarget.position.set(0, -10, 0);
          this._light.target = this._lightTarget;
          this._threeGroup.add(this._lightTarget);
          
          // Configure shadow properties
          if (castShadow) {
            this._light.castShadow = true;
            this._light.shadow.mapSize.width = 1024;
            this._light.shadow.mapSize.height = 1024;
            this._light.shadow.camera.near = 0.5;
            this._light.shadow.camera.far = distance || 50;
            this._light.shadow.camera.fov = angle || 30;
            this._light.shadow.bias = -0.0001;
            this._light.shadow.focus = 1;
          }
          
          // Create helper
          this._lightHelper = new THREE.SpotLightHelper(this._light);
        } else {
          this._light = new THREE.PointLight(
            threeColor,
            intensity,
            distance,
            decay
          );
          
          // Configure shadow properties
          if (castShadow) {
            this._light.castShadow = true;
            this._light.shadow.mapSize.width = 1024;
            this._light.shadow.mapSize.height = 1024;
            this._light.shadow.camera.near = 0.5;
            this._light.shadow.camera.far = distance || 50;
            this._light.shadow.bias = -0.005;
          }
          
          // Create helper with appropriate size
          this._lightHelper = new THREE.PointLightHelper(this._light, 10);
        }

        this._threeGroup.add(this._light);
        this._threeGroup.add(this._lightHelper);
      }

      _disposeLight() {
        if (this._light) {
          this._threeGroup.remove(this._light);
          this._light.dispose();
          this._light = null;
        }
        if (this._lightHelper) {
          this._threeGroup.remove(this._lightHelper);
          this._lightHelper.dispose();
          this._lightHelper = null;
        }
        if (this._lightTarget) {
          this._threeGroup.remove(this._lightTarget);
          this._lightTarget = null;
        }
      }

      updateThreeObject() {
        const object = gd.castObject(
          this._associatedObjectConfiguration,
          gd.ObjectJsImplementation
        );
        
        const content = object.content || {};
        const lightType = content.lightType || 'Point';
        const color = content.color || '255;255;255';
        const rgb = color.split(';').map((v) => parseInt(v, 10) / 255);
        const threeColor = new THREE.Color(rgb[0], rgb[1], rgb[2]);

        // Check if light type changed - recreate if needed
        const currentLightType = this._light instanceof THREE.SpotLight ? 'Spot' : 'Point';
        if (currentLightType !== lightType) {
          this._createLight();
          return; // Exit early as _createLight handles all setup
        }

        // Update light properties
        if (this._light) {
          this._light.color.copy(threeColor);
          this._light.intensity = content.intensity || 1.0;
          
          const distance = content.distance || 100;
          this._light.distance = distance;
          this._light.decay = content.decay !== undefined ? content.decay : 2.0;
          
          // Update shadow properties if enabled
          const castShadow = content.castShadow !== false;
          if (this._light.castShadow !== castShadow) {
            this._light.castShadow = castShadow;
          }
          
          if (castShadow && this._light.shadow) {
            this._light.shadow.camera.far = distance || 50;
          }
          
          if (this._light instanceof THREE.SpotLight) {
            const angle = content.angle || 45;
            this._light.angle = THREE.MathUtils.degToRad(angle);
            this._light.penumbra = content.penumbra || 0.0;
            
            if (castShadow && this._light.shadow) {
              this._light.shadow.camera.fov = angle;
            }
          }
        }

        // Update position - center the light at the instance position
        const width = this.getWidth();
        const height = this.getHeight();
        const depth = this.getDepth();

        this._threeGroup.position.set(
          this._instance.getX() + width / 2,
          this._instance.getY() + height / 2,
          this._instance.getZ() + depth / 2
        );

        // Update rotation for spotlight direction
        if (this._light instanceof THREE.SpotLight && this._lightTarget) {
          const rotX = this._instance.getRotationX();
          const rotY = this._instance.getRotationY();
          const rotZ = this._instance.getAngle();
          
          this._threeGroup.rotation.set(
            THREE.MathUtils.degToRad(rotX),
            THREE.MathUtils.degToRad(rotY),
            THREE.MathUtils.degToRad(rotZ)
          );
        }

        // Update helper
        if (this._lightHelper) {
          this._lightHelper.update();
        }
      }

      updatePixiObject() {
        const width = this.getWidth();
        const height = this.getHeight();
        const object = gd.castObject(
          this._associatedObjectConfiguration,
          gd.ObjectJsImplementation
        );
        
        const content = object.content || {};
        const lightType = content.lightType || 'Point';
        const color = content.color || '255;255;255';
        const rgb = color.split(';').map((v) => parseInt(v, 10));
        const colorHex = (rgb[0] << 16) | (rgb[1] << 8) | rgb[2];

        this._pixiObject.clear();
        
        // Draw icon based on type
        if (lightType === 'Spot') {
          // Spotlight icon
          this._pixiObject.beginFill(colorHex, 0.4);
          this._pixiObject.lineStyle(2, colorHex, 0.8);
          this._pixiObject.moveTo(0, -height / 4);
          this._pixiObject.lineTo(width / 3, height / 3);
          this._pixiObject.lineTo(-width / 3, height / 3);
          this._pixiObject.lineTo(0, -height / 4);
          this._pixiObject.endFill();
        } else {
          // Point light icon
          this._pixiObject.beginFill(colorHex, 0.4);
          this._pixiObject.lineStyle(2, colorHex, 0.8);
          this._pixiObject.drawCircle(0, 0, width / 3);
          this._pixiObject.endFill();
        }

        this._pixiObject.position.x = this._instance.getX() + width / 2;
        this._pixiObject.position.y = this._instance.getY() + height / 2;
      }

      update() {
        this.updatePixiObject();
        this.updateThreeObject();
      }

      onRemovedFromScene() {
        super.onRemovedFromScene();
        this._disposeLight();
        
        if (this._pixiObject) {
          this._pixiObject.destroy();
          this._pixiObject = null;
        }
      }

      getDefaultWidth() {
        return this._defaultWidth;
      }

      getDefaultHeight() {
        return this._defaultHeight;
      }

      getDefaultDepth() {
        return this._defaultDepth;
      }
    }

    // Register both renderers
    objectsRenderingService.registerInstanceRenderer(
      'Light3D::Light3D',
      RenderedLight3D2DInstance
    );
    objectsRenderingService.registerInstance3DRenderer(
      'Light3D::Light3D',
      RenderedLight3D3DInstance
    );
  },
};
