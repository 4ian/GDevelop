/**
 * This is a declaration of an extension for GDevelop 5.
 *
 * ℹ️ Run `node import-GDJS-Runtime.js` (in newIDE/app/scripts) if you make any change
 * to this extension file or to any other *.js file that you reference inside.
 *
 * The file must be named "JsExtension.js", otherwise GDevelop won't load it.
 * ⚠️ If you make a change and the extension is not loaded, open the developer console
 * and search for any errors.
 *
 * More information on https://github.com/4ian/GDevelop/blob/master/newIDE/README-extensions.md
 */
module.exports = {
  createExtension: function(t, gd) {
    const extension = new gd.PlatformExtension();
    extension.setExtensionInformation(
      "Physik",
      "Physik behavior",
      "Simulate physics",
      "Florian Rival, Franco Maciel",
      "MIT"
    );

    var physikBehavior = new gd.BehaviorJsImplementation();
    physikBehavior.updateProperty = function(
      behaviorContent,
      propertyName,
      newValue
    ) {
      if (propertyName === "type") {
        behaviorContent.type = newValue;
        return true;
      }
      if (propertyName === "bullet") {
        behaviorContent.bullet = newValue === "1";
        return true;
      }
      if (propertyName === "fixedRotation") {
        behaviorContent.fixedRotation = newValue === "1";
        return true;
      }
      if (propertyName === "shape") {
        behaviorContent.shape = newValue;
        return true;
      }
      if (propertyName === "shapeDimensionA") {
        newValue = parseFloat(newValue);
        if(newValue < 0) newValue = 0;
        behaviorContent.shapeDimensionA = newValue;
        return true;
      }
      if (propertyName === "shapeDimensionB") {
        newValue = parseFloat(newValue);
        if(newValue < 0) newValue = 0;
        behaviorContent.shapeDimensionB = newValue;
        return true;
      }
      if (propertyName === "shapeOffsetX") {
        behaviorContent.shapeOffsetX = parseFloat(newValue);
        return true;
      }
      if (propertyName === "shapeOffsetY") {
        behaviorContent.shapeOffsetY = parseFloat(newValue);
        return true;
      }
      if (propertyName === "density") {
        newValue = parseFloat(newValue);
        if(newValue < 0) newValue = 0;
        behaviorContent.density = newValue;
        return true;
      }
      if (propertyName === "friction") {
        newValue = parseFloat(newValue);
        if(newValue < 0) newValue = 0;
        behaviorContent.friction = newValue;
        return true;
      }
      if (propertyName === "restitution") {
        newValue = parseFloat(newValue);
        if(newValue < 0) newValue = 0;
        behaviorContent.restitution = newValue;
        return true;
      }
      if (propertyName === "linearDamping") {
        behaviorContent.linearDamping = parseFloat(newValue);
        return true;
      }
      if (propertyName === "angularDamping") {
        behaviorContent.angularDamping = parseFloat(newValue);
        return true;
      }
      if (propertyName === "gravityScale") {
        behaviorContent.gravityScale = parseFloat(newValue);
        return true;
      }
      if (propertyName === "layers") {
        // The given binary string is reverse, fix it
        newValue = newValue.split("").reverse().join("");
        // Convert it into a decimal
        newValue = parseInt(newValue, 2);
        // If it can't be converted, cancel the edit
        if(isNaN(newValue)) return false;
        // Layers minimum and maximum values
        if(newValue < 0) newValue = 0;
        if(newValue > 65535) newValue = 65535; // 65535 is the decimal form of 1111111111111111 (16 layer bits flagged)
        // Save the valid decimal
        behaviorContent.layers = newValue;
        return true;
      }
      if (propertyName === "masks") {
        // Same than layers
        newValue = newValue.split("").reverse().join("");
        newValue = parseInt(newValue, 2);
        if(isNaN(newValue)) return false;
        if(newValue < 0) newValue = 0;
        if(newValue > 65535) newValue = 65535;
        behaviorContent.masks = newValue;
        return true;
      }

      return false;
    };
    physikBehavior.getProperties = function(behaviorContent) {
      var behaviorProperties = new gd.MapStringPropertyDescriptor();

      behaviorProperties.set(
        "type",
        new gd.PropertyDescriptor(
          behaviorContent.type
        ).setType("Choice")
        .addExtraInfo("Static")
        .addExtraInfo("Dynamic")
        .addExtraInfo("Kinematic")
      );
      behaviorProperties.set(
        "bullet",
        new gd.PropertyDescriptor(
          behaviorContent.bullet ? "true" : "false"
        ).setType("Boolean")
      );
      behaviorProperties.set(
        "fixedRotation",
        new gd.PropertyDescriptor(
          behaviorContent.fixedRotation ? "true" : "false"
        ).setType("Boolean")
      );
      behaviorProperties.set(
        "shape",
        new gd.PropertyDescriptor(
          behaviorContent.shape
        ).setType("Choice")
        .addExtraInfo("Box")
        .addExtraInfo("Circle")
        // .addExtraInfo("Polygon") Needs an editor to be useful
        .addExtraInfo("Edge")
      );
      behaviorProperties.set(
        "shapeDimensionA",
        new gd.PropertyDescriptor(
          behaviorContent.shapeDimensionA.toString(10)
        ).setType("Number")
      );
      behaviorProperties.set(
        "shapeDimensionB",
        new gd.PropertyDescriptor(
          behaviorContent.shapeDimensionB.toString(10)
        ).setType("Number")
      );
      behaviorProperties.set(
        "shapeOffsetX",
        new gd.PropertyDescriptor(
          behaviorContent.shapeOffsetX.toString(10)
        ).setType("Number")
      );
      behaviorProperties.set(
        "shapeOffsetY",
        new gd.PropertyDescriptor(
          behaviorContent.shapeOffsetY.toString(10)
        ).setType("Number")
      );
      behaviorProperties.set(
        "density",
        new gd.PropertyDescriptor(
          behaviorContent.density.toString(10)
        ).setType("Number")
      );
      behaviorProperties.set(
        "friction",
        new gd.PropertyDescriptor(
          behaviorContent.friction.toString(10)
        ).setType("Number")
      );
      behaviorProperties.set(
        "restitution",
        new gd.PropertyDescriptor(
          behaviorContent.restitution.toString(10)
        ).setType("Number")
      );
      behaviorProperties.set(
        "linearDamping",
        new gd.PropertyDescriptor(
          behaviorContent.linearDamping.toString(10)
        ).setType("Number")
      );
      behaviorProperties.set(
        "angularDamping",
        new gd.PropertyDescriptor(
          behaviorContent.angularDamping.toString(10)
        ).setType("Number")
      );
      behaviorProperties.set(
        "gravityScale",
        new gd.PropertyDescriptor(
          behaviorContent.gravityScale.toString(10)
        ).setType("Number")
      );
      // Transform the layers number into a binary string
      var layers = behaviorContent.layers.toString(2);
      // Reverse the string (so the first layer bit is shown at the left)
      layers = layers.split("").reverse().join("");
      // Add zeros until the total size is 16
      if(layers.length < 16) layers = layers + "0".repeat(16 - layers.length);
      // Expose the converted string
      behaviorProperties.set(
        "layers",
        new gd.PropertyDescriptor(layers)
      );
      // Same than layers
      var masks = behaviorContent.masks.toString(2);
      masks = masks.split("").reverse().join("");
      if(masks.length < 16) masks = masks + "0".repeat(16 - masks.length);
      behaviorProperties.set(
        "masks",
        new gd.PropertyDescriptor(masks)
      );

      return behaviorProperties;
    };
    physikBehavior.setRawJSONContent(
      JSON.stringify({
        type: "Dynamic",
        bullet: false,
        fixedRotation: false,
        shape: "Box",
        shapeDimensionA: 0,
        shapeDimensionB: 0,
        shapeOffsetX: 0,
        shapeOffsetY: 0,
        density: 1.0,
        friction: 0.3,
        restitution: 0.1,
        linearDamping: 0.1,
        angularDamping: 0.1,
        gravityScale: 1,
        layers: 1,
        masks: 1
      })
    );

    var sharedData = new gd.BehaviorSharedDataJsImplementation();
    sharedData.updateProperty = function(
      sharedContent,
      propertyName,
      newValue
    ) {
      if (propertyName === "gravityX") {
        sharedContent.gravityX = parseInt(newValue, 10);
        return true;
      }
      if (propertyName === "gravityY") {
        sharedContent.gravityY = parseInt(newValue, 10);
        return true;
      }
      if (propertyName === "scaleX") {
        sharedContent.scaleX = parseInt(newValue, 10);
        return true;
      }
      if (propertyName === "scaleY") {
        sharedContent.scaleY = parseInt(newValue, 10);
        return true;
      }

      return false;
    };
    sharedData.getProperties = function(sharedContent) {
      var sharedProperties = new gd.MapStringPropertyDescriptor();

      sharedProperties.set(
        "gravityX",
        new gd.PropertyDescriptor(
          sharedContent.gravityX.toString(10)
        ).setType("Number")
      );
      sharedProperties.set(
        "gravityY",
        new gd.PropertyDescriptor(
          sharedContent.gravityY.toString(10)
        ).setType("Number")
      );
      sharedProperties.set(
        "scaleX",
        new gd.PropertyDescriptor(
          sharedContent.scaleX.toString(10)
        ).setType("Number")
      );
      sharedProperties.set(
        "scaleY",
        new gd.PropertyDescriptor(
          sharedContent.scaleY.toString(10)
        ).setType("Number")
      );

      return sharedProperties;
    };
    sharedData.setRawJSONContent(
      JSON.stringify({
        gravityX: 0,
        gravityY: 9.8,
        scaleX: 100,
        scaleY: 100
      })
    );

    var aut = extension
    // extension
      .addBehavior(
        "PhysikBehavior",
        t("Physik behavior"),
        "PhysikBehavior",
        t("Simulate physics"),
        "",
        "res/physics32.png",
        "PhysikBehavior",
        physikBehavior,
        sharedData
      )
      .setIncludeFile("Extensions/Physik/physikruntimebehavior.js")
      .addIncludeFile("Extensions/Physik/box2d.js");

    aut.addCondition(
      "GravityX",
      t("Gravity X"),
      t("Test the world gravity on X."),
      t("Gravity on X is _PARAM2_ _PARAM3_"),
      t("Global"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .addParameter("relationalOperator", t("Sign of the test"))
      .addParameter("expression", t("Value"))
      .getCodeExtraInformation()
      .setFunctionName("getGravityX");

    aut.addCondition(
      "GravityY",
      t("Gravity Y"),
      t("Test the world gravity on Y."),
      t("Gravity on Y is _PARAM2_ _PARAM3_"),
      t("Global"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .addParameter("relationalOperator", t("Sign of the test"))
      .addParameter("expression", t("Value"))
      .getCodeExtraInformation()
      .setFunctionName("getGravityY");

    aut.addAction(
      "GravityX",
      t("Gravity X"),
      t("Modify the world gravity on X."),
      t("Do _PARAM2__PARAM3_ to the gravity on X"),
      t("Global"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .addParameter("operator", t("Modification's sign"))
      .addParameter("expression", t("Value"))
      .getCodeExtraInformation()
      .setFunctionName("setGravityX")
      .setManipulatedType("number")
      .setGetter("getGravityX");

    aut.addAction(
      "GravityY",
      t("Gravity Y"),
      t("Modify the world gravity on Y."),
      t("Do _PARAM2__PARAM3_ to the gravity on Y"),
      t("Global"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .addParameter("operator", t("Modification's sign"))
      .addParameter("expression", t("Value"))
      .getCodeExtraInformation()
      .setFunctionName("setGravityY")
      .setManipulatedType("number")
      .setGetter("getGravityY");

    aut.addCondition(
      "IsDynamic",
      t("Is dynamic"),
      t("Test if an object is dynamic."),
      t("_PARAM0_ is dynamic"),
      t("Dynamics"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .getCodeExtraInformation()
      .setFunctionName("isDynamic");

    aut.addAction(
      "SetDynamic",
      t("Set as dynamic"),
      t("Set an object as dynamic. Is affected by gravity, forces and velocities."),
      t("Set _PARAM0_ as dynamic"),
      t("Dynamics"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .getCodeExtraInformation()
      .setFunctionName("setDynamic");

    aut.addCondition(
      "IsStatic",
      t("Is static"),
      t("Test if an object is static."),
      t("_PARAM0_ is static"),
      t("Dynamics"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .getCodeExtraInformation()
      .setFunctionName("isStatic");

    aut.addAction(
      "SetStatic",
      t("Set as static"),
      t("Set an object as static. Is not affected by gravity, and can't be moved by forces or velocities at all."),
      t("Set _PARAM0_ as static"),
      t("Dynamics"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .getCodeExtraInformation()
      .setFunctionName("setStatic");

    aut.addCondition(
      "IsKinematic",
      t("Is kinematic"),
      t("Test if an object is kinematic."),
      t("_PARAM0_ is kinematic"),
      t("Dynamics"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .getCodeExtraInformation()
      .setFunctionName("isKinematic");

    aut.addAction(
      "SetKinematic",
      t("Set as kinematic"),
      t("Set an object as kinematic. Is like a static body but can be moved through its velocity."),
      t("Set _PARAM0_ as kinematic"),
      t("Dynamics"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .getCodeExtraInformation()
      .setFunctionName("setKinematic");

    aut.addCondition(
      "IsBullet",
      t("Is treat as bullet"),
      t("Test if an object is being treat as a bullet."),
      t("_PARAM0_ is bullet"),
      t("Dynamics"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .getCodeExtraInformation()
      .setFunctionName("isBullet");

    aut.addAction(
      "SetBullet",
      t("Treat as bullet"),
      t("Treat the object as a bullet. Better collision handling on high speeds at cost of some performance."),
      t("Treat _PARAM0_ as bullet: _PARAM2_"),
      t("Dynamics"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .addParameter("yesorno", t("Treat as bullet?"), "", false).setDefaultValue("false")
      .getCodeExtraInformation()
      .setFunctionName("setBullet");

    aut.addCondition(
      "HasFixedRotation",
      t("Has fixed rotation"),
      t("Test if an object has fixed rotation."),
      t("_PARAM0_ has fixed rotation"),
      t("Dynamics"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .getCodeExtraInformation()
      .setFunctionName("hasFixedRotation");

    aut.addAction(
      "SetFixedRotation",
      t("Set fixed rotation"),
      t("Enable or disable an object fixed rotation. If enabled the object won't be able to rotate."),
      t("Set _PARAM0_ fixed rotation: _PARAM2_"),
      t("Rotation"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .addParameter("yesorno", t("Fixed rotation?"), "", false).setDefaultValue("false")
      .getCodeExtraInformation()
      .setFunctionName("setFixedRotation");

    aut.addCondition(
      "Density",
      t("Density"),
      t("Test an object density."),
      t("_PARAM0_ density is _PARAM2__PARAM3_"),
      t("Body settings"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .addParameter("relationalOperator", t("Sign of the test"))
      .addParameter("expression", t("Value"))
      .getCodeExtraInformation()
      .setFunctionName("getDensity");

    aut.addAction(
      "Density",
      t("Density"),
      t("Modify an object density. The body's density and volume determine its mass."),
      t("Do _PARAM2__PARAM3_ to the density of _PARAM0_"),
      t("Body settings"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .addParameter("operator", t("Modification's sign"))
      .addParameter("expression", t("Value (non-negative)"))
      .getCodeExtraInformation()
      .setFunctionName("setDensity")
      .setManipulatedType("number")
      .setGetter("getDensity");

    aut.addCondition(
      "Friction",
      t("Friction"),
      t("Test an object friction."),
      t("_PARAM0_ friction is _PARAM2__PARAM3_"),
      t("Body settings"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .addParameter("relationalOperator", t("Sign of the test"))
      .addParameter("expression", t("Value"))
      .getCodeExtraInformation()
      .setFunctionName("getFriction");

    aut.addAction(
      "Friction",
      t("Friction"),
      t("Modify an object friction. How much energy is lost from the movement of one object over another. The combined friction from two bodies is calculated as 'sqrt(bodyA.friction * bodyB.friction)'."),
      t("Do _PARAM2__PARAM3_ to the friction of _PARAM0_"),
      t("Body settings"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .addParameter("operator", t("Modification's sign"))
      .addParameter("expression", t("Value (non-negative)"))
      .getCodeExtraInformation()
      .setFunctionName("setFriction")
      .setManipulatedType("number")
      .setGetter("getFriction");

    aut.addCondition(
      "Restitution",
      t("Restitution"),
      t("Test an object restitution."),
      t("_PARAM0_ restitution is _PARAM2__PARAM3_"),
      t("Body settings"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .addParameter("relationalOperator", t("Sign of the test"))
      .addParameter("expression", t("Value"))
      .getCodeExtraInformation()
      .setFunctionName("getRestitution");

    aut.addAction(
      "Restitution",
      t("Restitution"),
      t("Modify an object restitution. Energy conservation on collision. The combined restitution from two bodies is calculated as 'max(bodyA.restitution, bodyB.restitution)'."),
      t("Do _PARAM2__PARAM3_ to the restitution of _PARAM0_"),
      t("Body settings"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .addParameter("operator", t("Modification's sign"))
      .addParameter("expression", t("Value (non-negative)"))
      .getCodeExtraInformation()
      .setFunctionName("setRestitution")
      .setManipulatedType("number")
      .setGetter("getRestitution");

    aut.addCondition(
      "LinearDamping",
      t("Linear damping"),
      t("Test an object linear damping."),
      t("_PARAM0_ linear damping is _PARAM2__PARAM3_"),
      t("Body settings"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .addParameter("relationalOperator", t("Sign of the test"))
      .addParameter("expression", t("Value"))
      .getCodeExtraInformation()
      .setFunctionName("getLinearDamping");

    aut.addAction(
      "LinearDamping",
      t("Linear damping"),
      t("Modify an object linear damping. How much movement speed is lost across the time."),
      t("Do _PARAM2__PARAM3_ to the linear damping of _PARAM0_"),
      t("Body settings"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .addParameter("operator", t("Modification's sign"))
      .addParameter("expression", t("Value"))
      .getCodeExtraInformation()
      .setFunctionName("setLinearDamping")
      .setManipulatedType("number")
      .setGetter("getLinearDamping");

    aut.addCondition(
      "AngularDamping",
      t("Angular damping"),
      t("Test an object angular damping."),
      t("_PARAM0_ angular damping is _PARAM2__PARAM3_"),
      t("Body settings"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .addParameter("relationalOperator", t("Sign of the test"))
      .addParameter("expression", t("Value"))
      .getCodeExtraInformation()
      .setFunctionName("getAngularDamping");

    aut.addAction(
      "AngularDamping",
      t("Angular damping"),
      t("Modify an object angular damping. How much angular speed is lost across the time."),
      t("Do _PARAM2__PARAM3_ to the angular damping of _PARAM0_"),
      t("Body settings"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .addParameter("operator", t("Modification's sign"))
      .addParameter("expression", t("Value"))
      .getCodeExtraInformation()
      .setFunctionName("setAngularDamping")
      .setManipulatedType("number")
      .setGetter("getAngularDamping");

    aut.addCondition(
      "GravityScale",
      t("Gravity scale"),
      t("Test an object gravity scale."),
      t("_PARAM0_ gravity scale is _PARAM2__PARAM3_"),
      t("Body settings"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .addParameter("relationalOperator", t("Sign of the test"))
      .addParameter("expression", t("Value"))
      .getCodeExtraInformation()
      .setFunctionName("getGravityScale");

    aut.addAction(
      "GravityScale",
      t("Gravity scale"),
      t("Modify an object gravity scale. The gravity applied to an object is the world gravity multiplied by the object gravity scale."),
      t("Do _PARAM2__PARAM3_ to the gravity scale of _PARAM0_"),
      t("Body settings"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .addParameter("operator", t("Modification's sign"))
      .addParameter("expression", t("Value"))
      .getCodeExtraInformation()
      .setFunctionName("setGravityScale")
      .setManipulatedType("number")
      .setGetter("getGravityScale");

    aut.addCondition(
      "LayerEnabled",
      t("Layer enabled"),
      t("Test if an object has a specific layer enabled."),
      t("_PARAM0_ has layer _PARAM2_ enabled"),
      t("Filtering"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .addParameter("expression", t("Layer (1 - 16)"))
      .getCodeExtraInformation()
      .setFunctionName("layerEnabled");

    aut.addAction(
      "EnableLayer",
      t("Enable layer"),
      t("Enable or disable a layer for an object. Two objects collide if any layer of the first object matches any mask of the second one and vice versa."),
      t("Enable layer _PARAM2_ for _PARAM0_: _PARAM3_"),
      t("Filtering"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .addParameter("expression", t("Layer (1 - 16)"))
      .addParameter("yesorno", t("Enable?"), "", false).setDefaultValue("true")
      .getCodeExtraInformation()
      .setFunctionName("enableLayer");

    aut.addCondition(
      "MaskEnabled",
      t("Mask enabled"),
      t("Test if an object has a specific mask enabled."),
      t("_PARAM0_ has mask _PARAM2_ enabled"),
      t("Filtering"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .addParameter("expression", t("Mask (1 - 16)"))
      .getCodeExtraInformation()
      .setFunctionName("maskEnabled");

    aut.addAction(
      "EnableMask",
      t("Enable mask"),
      t("Enable or disable a mask for an object. Two objects collide if any layer of the first object matches any mask of the second one and vice versa."),
      t("Enable mask _PARAM2_ for _PARAM0_: _PARAM3_"),
      t("Filtering"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .addParameter("expression", t("Mask (1 - 16)"))
      .addParameter("yesorno", t("Enable?"), "", false).setDefaultValue("true")
      .getCodeExtraInformation()
      .setFunctionName("enableMask");

    aut.addCondition(
      "LinearVelocityX",
      t("Linear velocity X"),
      t("Test an object linear velocity on X."),
      t("Linear velocity on X of _PARAM0_ is _PARAM2__PARAM3_"),
      t("Velocity"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .addParameter("relationalOperator", t("Sign of the test"))
      .addParameter("expression", t("Value"))
      .getCodeExtraInformation()
      .setFunctionName("getLinearVelocityX");

    aut.addAction(
      "LinearVelocityX",
      t("Linear velocity X"),
      t("Modify an object linear velocity on X."),
      t("Do _PARAM2__PARAM3_ to the linear velocity on X of _PARAM0_"),
      t("Velocity"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .addParameter("operator", t("Modification's sign"))
      .addParameter("expression", t("Value (pixels/second)"))
      .getCodeExtraInformation()
      .setFunctionName("setLinearVelocityX")
      .setManipulatedType("number")
      .setGetter("getLinearVelocityX");

    aut.addCondition(
      "LinearVelocityY",
      t("Linear velocity Y"),
      t("Test an object linear velocity on Y."),
      t("Linear velocity on Y of _PARAM0_ is _PARAM2__PARAM3_"),
      t("Velocity"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .addParameter("relationalOperator", t("Sign of the test"))
      .addParameter("expression", t("Value"))
      .getCodeExtraInformation()
      .setFunctionName("getLinearVelocityY");

    aut.addAction(
      "LinearVelocityY",
      t("Linear velocity Y"),
      t("Modify an object linear velocity on Y."),
      t("Do _PARAM2__PARAM3_ to the linear velocity on Y of _PARAM0_"),
      t("Velocity"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .addParameter("operator", t("Modification's sign"))
      .addParameter("expression", t("Value (pixels/second)"))
      .getCodeExtraInformation()
      .setFunctionName("setLinearVelocityY")
      .setManipulatedType("number")
      .setGetter("getLinearVelocityY");

    aut.addCondition(
      "LinearVelocityLength",
      t("Linear velocity length"),
      t("Test an object linear velocity length."),
      t("Linear velocity length of _PARAM0_ is _PARAM2__PARAM3_"),
      t("Velocity"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .addParameter("relationalOperator", t("Sign of the test"))
      .addParameter("expression", t("Value"))
      .getCodeExtraInformation()
      .setFunctionName("getLinearVelocityLength");

    aut.addCondition(
      "AngularVelocity",
      t("Angular velocity"),
      t("Test an object angular velocity."),
      t("Angular velocity of _PARAM0_ is _PARAM2__PARAM3_"),
      t("Velocity"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .addParameter("relationalOperator", t("Sign of the test"))
      .addParameter("expression", t("Value"))
      .getCodeExtraInformation()
      .setFunctionName("getAngularVelocity");

    aut.addAction(
      "AngularVelocity",
      t("Angular velocity"),
      t("Modify an object angular velocity."),
      t("Do _PARAM2__PARAM3_ to the angular velocity of _PARAM0_"),
      t("Velocity"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .addParameter("operator", t("Modification's sign"))
      .addParameter("expression", t("Value (º/s)"))
      .getCodeExtraInformation()
      .setFunctionName("setAngularVelocity")
      .setManipulatedType("number")
      .setGetter("getAngularVelocity");

    aut.addAction(
      "ApplyForce",
      t("Apply force"),
      t("Apply a force to the object. You've to specify the applying point (you can get the body mass center through expressions)."),
      t("Apply to _PARAM0_ a force of _PARAM2_;_PARAM3_ (applied at _PARAM4_;_PARAM5_)"),
      t("Forces & impulses"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .addParameter("expression", t("X component (N)"))
      .addParameter("expression", t("Y component (N)"))
      .addParameter("expression", t("Applying X position"))
      .addParameter("expression", t("Applying Y position"))
      .getCodeExtraInformation()
      .setFunctionName("applyForce");

    aut.addAction(
      "ApplyPolarForce",
      t("Apply polar force"),
      t("Apply a force to the object using polar coordinates. You've to specify the applying point (you can get the body mass center through expressions)."),
      t("Apply to _PARAM0_ a force of angle _PARAM2_ and length _PARAM3_ (applied at _PARAM4_;_PARAM5_)"),
      t("Forces & impulses"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .addParameter("expression", t("Angle"))
      .addParameter("expression", t("Length (N)"))
      .addParameter("expression", t("Applying X position"))
      .addParameter("expression", t("Applying Y position"))
      .getCodeExtraInformation()
      .setFunctionName("applyPolarForce");

    aut.addAction(
      "ApplyForceTowardPosition",
      t("Apply force toward position"),
      t("Apply a force to the object to move it toward a position. You've to specify the applying point (you can get the body mass center through expressions)."),
      t("Apply to _PARAM0_ a force of length _PARAM2_ towards _PARAM3_;_PARAM4_ (applied at _PARAM5_;_PARAM6_)"),
      t("Forces & impulses"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .addParameter("expression", t("Length (N)"))
      .addParameter("expression", t("X position"))
      .addParameter("expression", t("Y position"))
      .addParameter("expression", t("Applying X position"))
      .addParameter("expression", t("Applying Y position"))
      .getCodeExtraInformation()
      .setFunctionName("applyForceTowardPosition");

    aut.addAction(
      "ApplyImpulse",
      t("Apply impulse"),
      t("Apply an impulse to the object. You've to specify the applying point (you can get the body mass center through expressions)."),
      t("Apply to _PARAM0_ an impulse of _PARAM2_;_PARAM3_ (applied at _PARAM4_;_PARAM5_)"),
      t("Forces & impulses"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .addParameter("expression", t("X component (N.m)"))
      .addParameter("expression", t("Y component (N.m)"))
      .addParameter("expression", t("Applying X position"))
      .addParameter("expression", t("Applying Y position"))
      .getCodeExtraInformation()
      .setFunctionName("applyImpulse");

    aut.addAction(
      "ApplyPolarImpulse",
      t("Apply polar impulse"),
      t("Apply an impulse to the object using polar coordinates. You've to specify the applying point (you can get the body mass center through expressions)."),
      t("Apply to _PARAM0_ an impulse of angle _PARAM2_ and length _PARAM3_ (applied at _PARAM4_;_PARAM5_)"),
      t("Forces & impulses"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .addParameter("expression", t("Angle"))
      .addParameter("expression", t("Length (N.m)"))
      .addParameter("expression", t("Applying X position"))
      .addParameter("expression", t("Applying Y position"))
      .getCodeExtraInformation()
      .setFunctionName("applyPolarImpulse");

    aut.addAction(
      "ApplyImpulseTowardPosition",
      t("Apply impulse toward position"),
      t("Apply an impulse to the object to move it toward a position. You've to specify the applying point (you can get the body mass center through expressions)."),
      t("Apply to _PARAM0_ an impulse of length _PARAM2_ towards _PARAM3_;_PARAM4_ (applied at _PARAM5_;_PARAM6_)"),
      t("Forces & impulses"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .addParameter("expression", t("Length (N.m)"))
      .addParameter("expression", t("X position"))
      .addParameter("expression", t("Y position"))
      .addParameter("expression", t("Applying X position"))
      .addParameter("expression", t("Applying Y position"))
      .getCodeExtraInformation()
      .setFunctionName("applyImpulseTowardPosition");

    aut.addAction(
      "ApplyTorque",
      t("Apply torque"),
      t("Apply a torque to the object."),
      t("Apply to _PARAM0_ a torque of _PARAM2_"),
      t("Forces & impulses"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .addParameter("expression", t("Torque (N.m)"))
      .getCodeExtraInformation()
      .setFunctionName("applyTorque");

    aut.addAction(
      "ApplyAngularImpulse",
      t("Apply angular impulse"),
      t("Apply an angular impulse to the object."),
      t("Apply to _PARAM0_ an angular impulse of _PARAM2_"),
      t("Forces & impulses"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .addParameter("expression", t("Angular impulse (N.m.s"))
      .getCodeExtraInformation()
      .setFunctionName("applyAngularImpulse");

    aut.addAction(
      "AddDistanceJoint",
      t("Add distance joint"),
      t("Add a distance joint between two objects. The length is converted to meters using the world scale on X. The frequency and damping ratio are related to the joint speed of oscillation and how fast it stops."),
      t("Add a distance joint between _PARAM0_ and _PARAM4_"),
      t("Joints"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("First object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .addParameter("expression", t("X anchor on first body"))
      .addParameter("expression", t("Y anchor on first body"))
      .addParameter("objectPtr", t("Second object"), "", false)
      .addParameter("expression", t("X anchor on second body"))
      .addParameter("expression", t("Y anchor on second body"))
      .addParameter("expression", t("Length (pixels) (-1 to use current objects distance)"), "", true).setDefaultValue("-1")
      .addParameter("expression", t("Frequency (Hz) (common values from 0 to 5, 0 for a rigid joint)"), "", true).setDefaultValue("0")
      .addParameter("expression", t("Damping ratio (common values from 0 to 1, 1 for a rigid joint)"), "", true).setDefaultValue("1")
      .addParameter("yesorno", t("Allow collision between connected bodies?"), "", true).setDefaultValue("false")
      .addParameter("scenevar", t("Variable where to store the joint ID"), "", true)
      .getCodeExtraInformation()
      .setFunctionName("addDistanceJoint");

    aut.addAction(
      "AddRevoluteJoint",
      t("Add revolute joint"),
      t("Add a revolute joint to an object at a fixed point. The reference angle determines what is considered as the initial angle at the initial state."),
      t("Add a revolute joint to _PARAM0_ at _PARAM2_;_PARAM3_"),
      t("Joints"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .addParameter("expression", t("X anchor"))
      .addParameter("expression", t("Y anchor"))
      .addParameter("yesorno", t("Enable angle limits?"), "", true).setDefaultValue("false")
      .addParameter("expression", t("Reference angle"), "", true).setDefaultValue("0")
      .addParameter("expression", t("Minimum angle"), "", true).setDefaultValue("0")
      .addParameter("expression", t("Maximum angle"), "", true).setDefaultValue("0")
      .addParameter("yesorno", t("Enable motor?"), "", true).setDefaultValue("false")
      .addParameter("expression", t("Motor speed"), "", true).setDefaultValue("0")
      .addParameter("expression", t("Motor maximum torque"), "", true).setDefaultValue("0")
      .addParameter("scenevar", t("Variable where to store the joint ID"), "", true)
      .getCodeExtraInformation()
      .setFunctionName("addRevoluteJoint");

    aut.addAction(
      "AddRevoluteJointBetweenTwoBodies",
      t("Add revolute joint between two bodies"),
      t("Add a revolute joint between two objects. The reference angle determines what is considered as the initial angle at the initial state."),
      t("Add a revolute joint between _PARAM0_ and _PARAM4_"),
      t("Joints"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("First object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .addParameter("expression", t("X anchor on first body"))
      .addParameter("expression", t("Y anchor on first body"))
      .addParameter("objectPtr", t("Second object"), "", false)
      .addParameter("expression", t("X anchor on second body"))
      .addParameter("expression", t("Y anchor on second body"))
      .addParameter("yesorno", t("Enable angle limits?"), "", true).setDefaultValue("false")
      .addParameter("expression", t("Reference angle"), "", true).setDefaultValue("0")
      .addParameter("expression", t("Minimum angle"), "", true).setDefaultValue("0")
      .addParameter("expression", t("Maximum angle"), "", true).setDefaultValue("0")
      .addParameter("yesorno", t("Enable motor?"), "", true).setDefaultValue("false")
      .addParameter("expression", t("Motor speed"), "", true).setDefaultValue("0")
      .addParameter("expression", t("Motor maximum torque"), "", true).setDefaultValue("0")
      .addParameter("yesorno", t("Allow collision between connected bodies?"), "", true).setDefaultValue("false")
      .addParameter("scenevar", t("Variable where to store the joint ID"), "", true)
      .getCodeExtraInformation()
      .setFunctionName("addRevoluteJointBetweenTwoBodies");

    aut.addAction(
      "AddPrismaticJoint",
      t("Add prismatic joint"),
      t("Add a prismatic joint between two objects. The translation limits are converted to meters using the world scale on X."),
      t("Add a prismatic joint between _PARAM0_ and _PARAM4_"),
      t("Joints"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("First object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .addParameter("expression", t("X anchor on first body"))
      .addParameter("expression", t("Y anchor on first body"))
      .addParameter("objectPtr", t("Second object"), "", false)
      .addParameter("expression", t("X anchor on second body"))
      .addParameter("expression", t("Y anchor on second body"))
      .addParameter("expression", t("Axis angle"))
      .addParameter("expression", t("Reference angle"), "", true).setDefaultValue("0")
      .addParameter("yesorno", t("Enable limits?"), "", true).setDefaultValue("false")
      .addParameter("expression", t("Minimum translation"), "", true).setDefaultValue("0")
      .addParameter("expression", t("Maximum translation"), "", true).setDefaultValue("0")
      .addParameter("yesorno", t("Enable motor?"), "", true).setDefaultValue("false")
      .addParameter("expression", t("Motor speed"), "", true).setDefaultValue("0")
      .addParameter("expression", t("Motor maximum force"), "", true).setDefaultValue("0")
      .addParameter("yesorno", t("Allow collision between connected bodies?"), "", true).setDefaultValue("false")
      .addParameter("scenevar", t("Variable where to store the joint ID"), "", true)
      .getCodeExtraInformation()
      .setFunctionName("addPrismaticJoint");

    aut.addCondition(
      "PrismaticJointMotorSpeed",
      t("Prismatic motor speed"),
      t("Test a prismatic joint motor speed."),
      t("Prismatic joint _PARAM2_ motor speed is _PARAM3__PARAM4_"),
      t("Joints"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("First object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .addParameter("expression", t("Joint ID"))
      .addParameter("relationalOperator", t("Sign of the test"))
      .addParameter("expression", t("Value"))
      .getCodeExtraInformation()
      .setFunctionName("getPrismaticJointMotorSpeed");

    aut.addAction(
      "PrismaticJointMotorSpeed",
      t("Prismatic motor speed"),
      t("Set a prismatic joint motor speed."),
      t("Do _PARAM3__PARAM4_ to the prismatic joint _PARAM2_ motor speed"),
      t("Joints"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("First object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .addParameter("expression", t("Joint ID"))
      .addParameter("operator", t("Modification's sign"))
      .addParameter("expression", t("Value"))
      .getCodeExtraInformation()
      .setFunctionName("setPrismaticJointMotorSpeed")
      .setManipulatedType("number")
      .setGetter("getPrismaticJointMotorSpeed");

    aut.addExpression(
      "PrismaticJointMotorSpeed",
      t("Prismatic motor speed"),
      t("Prismatic motor speed"),
      t("Joints"),
      "res/physics16.png")
      .addParameter("object", t("Object"))
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .addParameter("expression", t("Joint ID"))
      .getCodeExtraInformation()
      .setFunctionName("getPrismaticJointMotorSpeed");

    aut.addAction(
      "AddPulleyJoint",
      t("Add pulley joint"),
      t("Add a pulley joint between two objects. Lengths are converted to meters using the world scale on X."),
      t("Add a pulley joint between _PARAM0_ and _PARAM4_"),
      t("Joints"),
      "res/physics24.png",
      "res/physics16.png")
      .addParameter("object", t("First object"), "", false)
      .addParameter("behavior", t("Behavior"), "PhysikBehavior")
      .addParameter("expression", t("X anchor on first body"))
      .addParameter("expression", t("Y anchor on first body"))
      .addParameter("objectPtr", t("Second object"), "", false)
      .addParameter("expression", t("X anchor on second body"))
      .addParameter("expression", t("Y anchor on second body"))
      .addParameter("expression", t("Ground X anchor for first object"))
      .addParameter("expression", t("Ground Y anchor for first object"))
      .addParameter("expression", t("Ground X anchor for second object"))
      .addParameter("expression", t("Ground Y anchor for second object"))
      .addParameter("expression", t("Length for first object (-1 to use anchors positions)"), "", true).setDefaultValue("-1")
      .addParameter("expression", t("Length for second object (-1 to use anchors positions)"), "", true).setDefaultValue("-1")
      .addParameter("expression", t("Ratio (non-negative)"), "", true).setDefaultValue("1")
      .addParameter("yesorno", t("Allow collision between connected bodies?"), "", true).setDefaultValue("false")
      .addParameter("scenevar", t("Variable where to store the joint ID"), "", true)
      .getCodeExtraInformation()
      .setFunctionName("addPulleyJoint");

    return extension;
  },

  runExtensionSanityTests: function(gd, extension) {
    return [];
  }
};
