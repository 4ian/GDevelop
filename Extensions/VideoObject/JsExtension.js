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
      "VideoExtension",
      "Video Extension",
      "Display a video in your scene",
      "Aurélien vivet",
      "MIT"
    );

    // Declare an object.
    // Create a new gd.ObjectJsImplementation object and implement the methods
    // that are called to get and set the properties of the object, as well
    // as the properties of the initial instances of this object
    // Everything that is stored inside the object is in "content" and is automatically
    // saved/loaded to JSON.
    var videoObject = new gd.ObjectJsImplementation();
    videoObject.updateProperty = function(
      objectContent,
      propertyName,
      newValue
    ) {
      if (propertyName === "My first property") {
        objectContent.property1 = newValue;
        return true;
      }
      if (propertyName === "My other property") {
        objectContent.property2 = newValue === "1";
        return true;
      }
      if (propertyName === "My third property") {
        objectContent.property3 = newValue;
        return true;
      }

      return false;
    };
    videoObject.getProperties = function(objectContent) {
      var objectProperties = new gd.MapStringPropertyDescriptor();

      objectProperties.set(
        "My first property",
        new gd.PropertyDescriptor(objectContent.property1)
      );
      objectProperties.set(
        "My other property",
        new gd.PropertyDescriptor(
          objectContent.property2 ? "true" : "false"
        ).setType("boolean")
      );
      objectProperties.set(
        "My third property",
        new gd.PropertyDescriptor(
            objectContent.property3.toString()
        ).setType("number")
      );

      return objectProperties;
    };
    videoObject.setRawJSONContent(
      JSON.stringify({
        property1: "Hello world",
        property2: true,
        property3: 123
      })
    );

    videoObject.updateInitialInstanceProperty = function(
      objectContent,
      instance,
      propertyName,
      newValue,
      project,
      layout
    ) {
      if (propertyName === "My instance property") {
        instance.setRawStringProperty("instanceprop1", newValue);
        return true;
      }
      if (propertyName === "My other instance property") {
        instance.setRawFloatProperty("instanceprop2", parseFloat(newValue));
        return true;
      }

      return false;
    };
    videoObject.getInitialInstanceProperties = function(
      content,
      instance,
      project,
      layout
    ) {
      var instanceProperties = new gd.MapStringPropertyDescriptor();

      instanceProperties.set(
        "My instance property",
        new gd.PropertyDescriptor(
          instance.getRawStringProperty("instanceprop1")
        )
      );
      instanceProperties.set(
        "My other instance property",
        new gd.PropertyDescriptor(
          instance.getRawFloatProperty("instanceprop2").toString()
        ).setType("number")
      );

      return instanceProperties;
    };

    extension
      .addObject(
        "VideoObject",
        t("Video object for testing"),
        t("This video object does nothing"),
        "CppPlatform/Extensions/videoicon.png",
        videoObject
      )
      .setIncludeFile("Extensions/VideoObject/videoruntimeobject.js")
      .addIncludeFile(
        "Extensions/VideoObject/videoruntimeobject-pixi-renderer.js"
      );

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
    runExtensionSanityTests: function (gd, extension) { return []; },
  /**
   * Register editors for objects.
   * 
   * ℹ️ Run `node import-GDJS-Runtime.js` (in newIDE/app/scripts) if you make any change.
   */
  registerEditorConfigurations: function(objectsEditorService) {
    objectsEditorService.registerEditorConfiguration(
      "VideoExtension::VideoObject",
      objectsEditorService.getDefaultObjectJsImplementationPropertiesEditor()
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

    /**
     * Renderer for instances of VideoObject inside the IDE.
     *
     * @extends RenderedInstance
     * @class RenderedVideoObjectInstance
     * @constructor
     */
    function RenderedVideoObjectInstance(
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

    
       //TODO
       /*
        si la video n'est pas chargé mettre un placeholder fichier non trouver / ou erreur
       */
       
       
      // create a video texture from a path
      var texture = new PIXI.Texture.fromVideo('C:/Users/RTX-Bouh/Desktop/test_video_GD.mp4');
      
        if(!texture){
          var texture = new PIXI.Texture.fromImage('C:/Users/RTX-Bouh/Desktop/video.svg');
        }
      
      //Setup the PIXI object:
      this._pixiObject = new PIXI.Sprite(texture);
      this._pixiObject.anchor.x = 0.5;
      this._pixiObject.anchor.y = 0.5;
      this._pixiContainer.addChild(this._pixiObject);
      this.update();
    }
    RenderedVideoObjectInstance.prototype = Object.create(
      RenderedInstance.prototype
    );

    /**
     * Return the path to the thumbnail of the specified object.
     */
    RenderedVideoObjectInstance.getThumbnail = function(
      project,
      resourcesLoader,
      object
    ) {
      return "CppPlatform/Extensions/videoicon24.png";
    };

    /**
     * This is called to update the PIXI object on the scene editor
     */
    RenderedVideoObjectInstance.prototype.update = function() {
       
       //Stop video in IDE
       if(!this._pixiObject._texture.baseTexture.source.paused){
        this._pixiObject._texture.baseTexture.source.pause();   
       }
        
      // Read a property from the object
      const property1Value = this._associatedObject
        .getProperties(this.project)
        .get("My first property")
        .getValue();
      this._pixiObject.text = property1Value;

      // Read position and angle from the instance
      this._pixiObject.position.x =
        this._instance.getX() + this._pixiObject.width / 2;
      this._pixiObject.position.y =
        this._instance.getY() + this._pixiObject.height / 2;
      this._pixiObject.rotation = RenderedInstance.toRad(
        this._instance.getAngle()
      );
      
      if(this._instance.hasCustomSize()){
        this._pixiObject.width = this._instance.getCustomWidth();
        this._pixiObject.height = this._instance.getCustomHeight();
      }
    };

    /**
     * Return the width of the instance, when it's not resized.
     */
    RenderedVideoObjectInstance.prototype.getDefaultWidth = function() {
      return this._pixiObject.width;
    };

    /**
     * Return the height of the instance, when it's not resized.
     */
    RenderedVideoObjectInstance.prototype.getDefaultHeight = function() {
      return this._pixiObject.height;
    };

    /**
     * This is called when instance is removed on the scene editor.
     */
    RenderedVideoObjectInstance.prototype.instanceRemovedFromScene = function() {
      RenderedInstance.prototype.instanceRemovedFromScene.call(this);
      this._pixiObject._texture.baseTexture.source.pause();
    };

    objectsRenderingService.registerInstanceRenderer(
      "VideoExtension::VideoObject",
      RenderedVideoObjectInstance
    );
  }
};
