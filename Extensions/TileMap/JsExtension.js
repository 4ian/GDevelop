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
  createExtension: function(_, gd) {
    const extension = new gd.PlatformExtension();
    extension
      .setExtensionInformation(
        "TileMap",
        _("TileMap Object"),
        _("Displays a tiled file tilemap."),
        "Todor Imreorov",
        "Open source (MIT License)"
      )
      .setExtensionHelpPath("/objects/tile_map");

    var objectTileMap = new gd.ObjectJsImplementation();
    objectTileMap.updateProperty = function(
      objectContent,
      propertyName,
      newValue
    ) {
      if (propertyName in objectContent) {
        if (typeof objectContent[propertyName] === "boolean")
          objectContent[propertyName] = newValue === "1";
        else objectContent[propertyName] = newValue;
        return true;
      }

      return false;
    };
    objectTileMap.getProperties = function(objectContent) {
      var objectProperties = new gd.MapStringPropertyDescriptor();

      objectProperties.set(
        "tiledFile",
        new gd.PropertyDescriptor(objectContent.tiledFile)
          .setType("resource")
          .addExtraInfo("json")
          .setLabel(_("Tiled file"))
      );
      objectProperties.set(
        "tilemapAtlasImage",
        new gd.PropertyDescriptor(objectContent.tilemapAtlasImage)
          .setType("resource")
          .addExtraInfo("image")
          .setLabel(_("Tilemap atlas image"))
      );
      objectProperties.set(
        "render",
        new gd.PropertyDescriptor(objectContent.render)
          .setType("choice")
          .addExtraInfo("visible")
          .addExtraInfo("all")
          .addExtraInfo("index")
          .setLabel(_("Render"))
      );
      objectProperties.set(
        "layerIndex",
        new gd.PropertyDescriptor(objectContent.layerIndex.toString())
          .setType("number")
          .setLabel(_("Layer index"))
      );
      objectProperties.set(
        "visible",
        new gd.PropertyDescriptor(objectContent.visible ? "true" : "false")
          .setType("boolean")
          .setLabel(_("Visible"))
      );

      return objectProperties;
    };
    objectTileMap.setRawJSONContent(
      JSON.stringify({
        tiledFile: "",
        tilemapAtlasImage: "",
        render: "visible",
        layerIndex: 0,
        visible: true
      })
    );

    objectTileMap.updateInitialInstanceProperty = function(
      objectContent,
      instance,
      propertyName,
      newValue,
      project,
      layout
    ) {
      return false;
    };
    objectTileMap.getInitialInstanceProperties = function(
      content,
      instance,
      project,
      layout
    ) {
      var instanceProperties = new gd.MapStringPropertyDescriptor();
      return instanceProperties;
    };

    const object = extension
      .addObject(
        "TileMap",
        _("TileMap"),
        _("Displays a tiled file tilemap"),
        "JsPlatform/Extensions/skeletonicon.png",
        objectTileMap
      )
      .setIncludeFile("Extensions/TileMap/tilemapruntimeobject.js")
      .addIncludeFile(
        "Extensions/TileMap/tilemapruntimeobject-pixi-renderer.js"
      )
      .addIncludeFile("Extensions/TileMap/pixi-tilemap.js")
      .addIncludeFile("Extensions/TileMap/tileset.js");
    /**
     * Utility function to add both a setter and a getter to a property from a list.
     * Useful for setting multiple generic properties.
     */
    ///////////// TODO make reusable ///////////////////////////////////////////////////////////////////////////////////////
    const addSettersAndGettersToObject = (gdObject, properties, objectName) => {
      properties.forEach(property => {
        const parameterType =
          property.type === "boolean" ? "yesorno" : property.type;

        // Add the expression
        if (parameterType === "number") {
          gdObject
            .addExpression(
              `Get${property.functionName}`,
              property.expressionLabel,
              property.expressionDescription,
              "",
              "",
              property.iconPath,
              property.iconPath
            )
            .addParameter("object", objectName, objectName, false)
            .getCodeExtraInformation()
            .setFunctionName(`get${property.functionName}`);
        } else if (parameterType === "string") {
          gdObject
            .addStrExpression(
              `Get${property.functionName}`,
              property.expressionLabel,
              property.expressionDescription,
              "",
              "",
              property.iconPath,
              property.iconPath
            )
            .addParameter("object", objectName, objectName, false)
            .getCodeExtraInformation()
            .setFunctionName(`get${property.functionName}`);
        }

        // Add the action
        if (parameterType === "number" || parameterType === "string") {
          const expressionType =
            parameterType === "number" ? "expression" : "string";
          gdObject
            .addAction(
              `Set${property.functionName}`,
              property.paramLabel,
              property.actionDescription,
              property.actionSentence,
              "",
              property.iconPath,
              property.iconPath
            )
            .addParameter("object", objectName, objectName, false)
            .useStandardOperatorParameters(parameterType)
            .getCodeExtraInformation()
            .setFunctionName(`set${property.functionName}`)
            .setGetter(`get${property.functionName}`);
        } else {
          gdObject
            .addAction(
              `Set${property.functionName}`,
              property.paramLabel,
              property.actionDescription,
              property.actionSentence,
              "",
              property.iconPath,
              property.iconPath
            )
            .addParameter("object", objectName, objectName, false)
            .addParameter(
              parameterType,
              property.paramLabel,
              property.options
                ? '["' + property.options.join('", "') + '"]'
                : "",
              false
            )
            .getCodeExtraInformation()
            .setFunctionName(`set${property.functionName}`)
            .setGetter(`get${property.functionName}`);
        }

        // Add condition
        if (parameterType === "string" || parameterType === "number") {
          const propExpressionType =
            parameterType === "string" ? "string" : "expression";
          gdObject
            .addCondition(
              `Is${property.functionName}`,
              property.paramLabel,
              property.conditionDescription,
              property.conditionSentence,
              "",
              property.iconPath,
              property.iconPath
            )
            .addParameter("object", objectName, objectName, false)
            .useStandardRelationalOperatorParameters(parameterType)
            .getCodeExtraInformation()
            .setFunctionName(`get${property.functionName}`);
        } else if (parameterType === "yesorno") {
          gdObject
            .addCondition(
              `Is${property.functionName}`,
              property.paramLabel,
              property.conditionDescription,
              property.conditionSentence,
              "",
              property.iconPath,
              property.iconPath
            )
            .addParameter("object", objectName, objectName, false)
            .getCodeExtraInformation()
            .setFunctionName(`get${property.functionName}`);
        }
      });
    };
    ////////////// TODO move out of here /////////////////////////////////////////

    const setterAndGetterProperties = [
      {
        functionName: "TiledFile",
        iconPath: "JsPlatform/Extensions/skeletonicon.png",
        type: "jsonResource",
        paramLabel: _("Tiled file"),
        actionDescription: _("Set Tiled file"),
        actionSentence: _("Do _PARAM1__PARAM2_ to the tiled file of _PARAM0_"),
        conditionSentence: _("The tiled file of _PARAM0_ is _PARAM1__PARAM2_"),
        conditionDescription: _("Compare the value of the tiled file."),
        expressionLabel: _("Get the Tiled file"),
        expressionDescription: _("Get the Tiled file")
      },
      {
        functionName: "TilemapAtlasImage",
        iconPath: "JsPlatform/Extensions/skeletonicon.png",
        type: "image",
        paramLabel: _("Tilemap atlas image"),
        actionDescription: _("Set Tilemap atlas image"),
        actionSentence: _(
          "Do _PARAM1__PARAM2_ to the tilemap atlas image of _PARAM0_"
        ),
        conditionSentence: _(
          "The tilemap atlas image of _PARAM0_ is _PARAM1__PARAM2_"
        ),
        conditionDescription: _(
          "Compare the value of the tilemap atlas image."
        ),
        expressionLabel: _("Get the Tilemap atlas image"),
        expressionDescription: _("Get the Tilemap atlas image")
      },
      {
        functionName: "Render",
        iconPath: "JsPlatform/Extensions/skeletonicon.png",
        type: "stringWithSelector",
        paramLabel: _("Render"),
        options: ["visible", "all", "index"],
        actionDescription: _("Set Render"),
        actionSentence: _("Set the render of _PARAM0_ to _PARAM1_"),
        conditionSentence: _("The render of _PARAM0_ is _PARAM1_"),
        expressionLabel: _("Get the Render"),
        expressionDescription: _("Get the Render")
      },
      {
        functionName: "LayerIndex",
        iconPath: "JsPlatform/Extensions/skeletonicon.png",
        type: "number",
        paramLabel: _("Layer index"),
        actionDescription: _("Set Layer index"),
        actionSentence: _("Do _PARAM1__PARAM2_ to the layer index of _PARAM0_"),
        conditionSentence: _("The layer index of _PARAM0_ is _PARAM1__PARAM2_"),
        conditionDescription: _("Compare the value of the layer index."),
        expressionLabel: _("Get the Layer index"),
        expressionDescription: _("Get the Layer index")
      },
      {
        functionName: "Visible",
        iconPath: "JsPlatform/Extensions/skeletonicon.png",
        type: "boolean",
        paramLabel: _("Visible"),
        actionDescription: _("Set Visible"),
        actionSentence: _("Activate visible for _PARAM0_: _PARAM1_"),
        conditionSentence: _("Visible is enabled"),
        conditionDescription: _("Compare the value of the visible."),
        expressionLabel: _("Get the Visible"),
        expressionDescription: _("Get the Visible")
      }
    ];

    addSettersAndGettersToObject(object, setterAndGetterProperties, "TileMap");

    return extension;
  },

  /**
   * You can optionally add sanity tests that will check the basic working
   * of your extension behaviors/objects by instanciating behaviors/objects
   * and setting the property to a given value.
   *
   * If you don't have any tests, you can simply return an empty array like this:
   * `runExtensionSanityTests: function(gd, extension) { return []; }`
   *
   * But it is recommended to create tests for the behaviors/objects properties you created
   * to avoid mistakes.
   */
  runExtensionSanityTests: function(gd, extension) {
    return [];
  },
  /**
   * Register editors for objects.
   *
   * ℹ️ Run `node import-GDJS-Runtime.js` (in newIDE/app/scripts) if you make any change.
   */
  registerEditorConfigurations: function(objectsEditorService) {
    objectsEditorService.registerEditorConfiguration(
      "TileMap::TileMap",
      objectsEditorService.getDefaultObjectJsImplementationPropertiesEditor({
        helpPagePath: "/objects/tile_map_object"
      })
    );
  },
  /**
   * Register renderers for instance of objects on the scene editor.
   *
   * ℹ️ Run `node import-GDJS-Runtime.js` (in newIDE/app/scripts) if you make any change.
   */
  registerInstanceRenderers: function(objectsRenderingService) {
    const RenderedInstance = objectsRenderingService.RenderedInstance;
    const PIXI = objectsRenderingService.PIXI;

    const ImportedExtLib = objectsRenderingService.requireModule(
      __dirname,
      "pixi-tilemap"
    );

    /**
     * Renderer for instances of TileMap inside the IDE.
     *
     * @extends RenderedTileMapInstance
     * @class RenderedTileMapInstance
     * @constructor
     */
    function RenderedTileMapInstance(
      project,
      layout,
      instance,
      associatedObject,
      pixiContainer,
      pixiResourcesLoader
    ) {
      RenderedInstance.call(
        this,
        project,
        layout,
        instance,
        associatedObject,
        pixiContainer,
        pixiResourcesLoader
      );

      this._pixiObject = new PIXI.tilemap.CompositeRectTileLayer(0);
      this._tileSet = null;
      //this._pixiObject.anchor.x = 0.5;
      //this._pixiObject.anchor.y = 0.5;
      this._pixiContainer.addChild(this._pixiObject);
      // this._pixiContainer.addChild(this._tileSet);
      console.log(
        project,
        layout,
        instance,
        associatedObject,
        pixiContainer,
        pixiResourcesLoader
      );
      this.update();
      this.updateTileMap();
    }
    RenderedTileMapInstance.prototype = Object.create(
      RenderedInstance.prototype
    );

    /**
     * Return the path to the thumbnail of the specified object.
     */
    RenderedTileMapInstance.getThumbnail = function(
      project,
      resourcesLoader,
      object
    ) {
      return "JsPlatform/Extensions/skeletonicon.png";
    };
    /**
     * This is called to update the Tilemap
     */
    RenderedTileMapInstance.prototype.updateTileMap = function() {
      // Get the tileset resource to use
      const tilemapAtlasImage = this._associatedObject
        .getProperties(this.project)
        .get("tilemapAtlasImage")
        .getValue();
      const tiledFile = this._associatedObject
        .getProperties(this.project)
        .get("tiledFile")
        .getValue();
      const layerIndex = parseInt(
        this._associatedObject
          .getProperties(this.project)
          .get("layerIndex")
          .getValue(),
        0
      );
      const render = this._associatedObject
        .getProperties(this.project)
        .get("render")
        .getValue();

      this._pixiResourcesLoader.getPIXITileSet(
        this._project,
        tilemapAtlasImage,
        tiledFile,
        tileset => {
          console.log("LOADED", tileset);
          if (tileset && this._pixiObject) {
            this._pixiResourcesLoader.updatePIXITileMap(
              tileset,
              this._pixiObject,
              render,
              layerIndex
            );
          }
        }
      );
    };
    /**
     * This is called to update the PIXI object on the scene editor
     */
    RenderedTileMapInstance.prototype.update = function() {
      const tiledFile = this._associatedObject
        .getProperties(this.project)
        .get("tiledFile")
        .getValue();
      if (this._pixiObject.tiledFile !== tiledFile)
        this._pixiObject.tiledFile = tiledFile;

      const tilemapAtlasImage = this._associatedObject
        .getProperties(this.project)
        .get("tilemapAtlasImage")
        .getValue();
      if (this._pixiObject.tilemapAtlasImage !== tilemapAtlasImage)
        this._pixiObject.tilemapAtlasImage = tilemapAtlasImage;

      const render = this._associatedObject
        .getProperties(this.project)
        .get("render")
        .getValue();
      if (this._pixiObject.render !== render) this._pixiObject.render = render;

      const layerIndex = this._associatedObject
        .getProperties(this.project)
        .get("layerIndex")
        .getValue();
      if (this._pixiObject.layerIndex !== layerIndex)
        this._pixiObject.layerIndex = layerIndex;

      const visible = this._associatedObject
        .getProperties(this.project)
        .get("visible")
        .getValue();
      if (visible !== this._pixiObject._visible) {
        this._pixiObject._visible = visible === "true";
        this._pixiObject.dirty = true;
      }

      this._pixiObject.x = this._instance.getX() + this._pixiObject.width / 2;
      this._pixiObject.y = this._instance.getY() + this._pixiObject.height / 2;
      this._pixiObject.rotation = RenderedInstance.toRad(
        this._instance.getAngle()
      );

      if (this._instance.hasCustomSize()) {
        this._pixiObject.width = this._instance.getCustomWidth();
        this._pixiObject.height = this._instance.getCustomHeight();
      }
    };

    /**
     * Return the width of the instance, when it's not resized.
     */
    RenderedTileMapInstance.prototype.getDefaultWidth = function() {
      return this._pixiObject.width;
    };

    /**
     * Return the height of the instance, when it's not resized.
     */
    RenderedTileMapInstance.prototype.getDefaultHeight = function() {
      return this._pixiObject.height;
    };

    objectsRenderingService.registerInstanceRenderer(
      "TileMap::TileMap",
      RenderedTileMapInstance
    );
  }
};
