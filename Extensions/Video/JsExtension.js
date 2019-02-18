/**
 *
 * JsExtention.js :  Permet de déclarer les events et fait l'affichage des instances d'object dans l'éditeur de GD grace à RenderedVideoObjectInstance
 *
 * videoruntimeobject-pixi-renderer.js  : Gère le rendu des object dans la preview et les exports.
 *
 * Les actions : a déclarer dans JsExtention.js, puis ça appel dans videoruntimeobject.js, puis vers videoruntimeobject-pixi-renderer.js
 * Si il y a un operator il faut un .setManipulatedType('number')  et     .setGetter('getVolume');
 * la nouvelle valeur calculé avec l'opérateur est envoyé directement à setFunctionName("setVolume") !
 *
 *
 */

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
        "Video",
        "Video",
        "Display a video in your scene",
        "Aurélien vivet",
        "Open source (MIT License)"
      )
      .setExtensionHelpPath("/all-features/video");

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
      if (propertyName === "Video object opacity") {
        objectContent.property1 = newValue;
        return true;
      }
      if (propertyName === "Video Looped or no") {
        objectContent.property2 = newValue === "1";
        return true;
      }
      if (propertyName === "Volume") {
        objectContent.property3 = newValue;
        return true;
      }

      return false;
    };
    videoObject.getProperties = function(objectContent) {
      var objectProperties = new gd.MapStringPropertyDescriptor();

      objectProperties.set(
        "Video object opacity",
        new gd.PropertyDescriptor(objectContent.property1)
      );
      objectProperties.set(
        "Video Looped or no",
        new gd.PropertyDescriptor(
          objectContent.property2 ? "true" : "false"
        ).setType("boolean")
      );
      objectProperties.set(
        "Volume",
        new gd.PropertyDescriptor(objectContent.property3.toString()).setType(
          "number"
        )
      );

      return objectProperties;
    };
    videoObject.setRawJSONContent(
      JSON.stringify({
        property1: "Hello world",
        property2: false,
        property3: 100
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
      if (propertyName === "Video instance opacity") {
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
        "Video instance opacity",
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

    const object = extension
      .addObject(
        "VideoObject",
        _("Video object for testing"),
        _("This video object does nothing"),
        "JsPlatform/Extensions/videoicon32.png",
        videoObject
      )
      .setIncludeFile("Extensions/Video/videoruntimeobject.js")
      .addIncludeFile("Extensions/Video/videoruntimeobject-pixi-renderer.js");

    object
      .addAction(
        "Play",
        _("Play an video"),
        _("Play an video"),
        _("Play the video of : _PARAM0_"),
        "",
        "JsPlatform/Extensions/videoicon24.png",
        "JsPlatform/Extensions/videoicon16.png"
      )
      .addParameter("object", _("Choose an object video"), "", false)
      .getCodeExtraInformation()
      .setFunctionName("play");

    object
      .addAction(
        "Pause",
        _("Pause an video"),
        _("Pause an video"),
        _("Pause the video on my object : _PARAM0_"),
        "",
        "JsPlatform/Extensions/videoicon24.png",
        "JsPlatform/Extensions/videoicon16.png"
      )
      .addParameter("object", _("Choose an object video"), "", false)
      .getCodeExtraInformation()
      .setFunctionName("pause");

    object
      .addAction(
        "Loop",
        _("Loop an video"),
        _("Loop an video"),
        _("Loop the video on my object : _PARAM0_ is on : _PARAM1_"),
        "",
        "JsPlatform/Extensions/videoicon24.png",
        "JsPlatform/Extensions/videoicon16.png"
      )
      .addParameter("object", _("Choose an object video"), "", false)
      .addParameter("yesorno", _("Loop or not"), "", false)
      .getCodeExtraInformation()
      .setFunctionName("setLoop");

    object
      .addAction(
        "Mute",
        _("Mute an video"),
        _("Mute an video"),
        _("Mute the video on my object : _PARAM0_ is on : _PARAM1_"),
        "",
        "JsPlatform/Extensions/videoicon24.png",
        "JsPlatform/Extensions/videoicon16.png"
      )
      .addParameter("object", _("Choose an object video"), "", false)
      .addParameter("yesorno", _("Mute or not"), "", false)
      .getCodeExtraInformation()
      .setFunctionName("mute");

    object
      .addAction(
        "SetTime",
        _("Set time (in seconds)"),
        _("Set time (in seconds)"),
        _("Set time of my object : _PARAM0_ is _PARAM1_ _PARAM2_ seconds"),
        "",
        "JsPlatform/Extensions/videoicon24.png",
        "JsPlatform/Extensions/videoicon16.png"
      )
      .addParameter("object", _("Choose an object video"), "", false)
      .addParameter("operator", _("Modification's sign"), "", false)
      .addParameter("expression", _("Time in seconds"), "", false)
      .getCodeExtraInformation()
      .setFunctionName("setCurrentTime")
      .setManipulatedType("number")
      .setGetter("getCurrentTime");

    object
      .addAction(
        "SetVolume",
        _("Set volume (in %)"),
        _("Set volume (in %)"),
        _("Do _PARAM1_ _PARAM2_ % to the volume of _PARAM0_"),
        "",
        "JsPlatform/Extensions/videoicon24.png",
        "JsPlatform/Extensions/videoicon16.png"
      )
      .addParameter("object", _("Choose an object video"), "", false)
      .addParameter("operator", _("Modification's sign"), "", false)
      .addParameter("expression", _("Volume in %"), "", false)
      .getCodeExtraInformation()
      .setFunctionName("setVolume")
      .setManipulatedType("number")
      .setGetter("getVolume");

    object
      .addExpression(
        "GetVolume",
        _("Get the volume"),
        _("Get the volume of an video object."),
        _("Volume"),
        "res/physics16.png"
      )
      .addParameter("object", _("Object"), "", false)
      .getCodeExtraInformation()
      .setFunctionName("getVolume");

    object
      .addExpression(
        "IsMuted",
        _("Video is muted"),
        _("Return if video is muted"),
        _("Volume"),
        "res/physics16.png"
      )
      .addParameter("object", _("Object"), "", false)
      .getCodeExtraInformation()
      .setFunctionName("isMuted");

    object
      .addCondition(
        "Play",
        _("Is played"),
        _("Test if an video is played"),
        _("_PARAM0_  is played"),
        "Control time",
        "JsPlatform/Extensions/videoicon24.png",
        "JsPlatform/Extensions/videoicon16.png"
      )
      .addParameter("object", _("Choose an object video"), "", false)
      .getCodeExtraInformation()
      .setFunctionName("isPlayed");

    object
      .addCondition(
        "Pause",
        _("Is paused"),
        _("Test if an video is paused"),
        _("_PARAM0_  is paused"),
        "Control time",
        "JsPlatform/Extensions/videoicon24.png",
        "JsPlatform/Extensions/videoicon16.png"
      )
      .addParameter("object", _("Choose an object video"), "", false)
      .getCodeExtraInformation()
      .setFunctionName("isPaused");

    object
      .addExpression(
        "IsPaused",
        _("Video is played"),
        _("Return if video is played"),
        _("Time"),
        "res/physics16.png"
      )
      .addParameter("object", _("Object"), "", false)
      .getCodeExtraInformation()
      .setFunctionName("isPaused");

    object
      .addExpression(
        "IsPlayed",
        _("Video is played"),
        _("Return if video is played"),
        _("Time"),
        "res/physics16.png"
      )
      .addParameter("object", _("Object"), "", false)
      .getCodeExtraInformation()
      .setFunctionName("isPlayed");

    object
      .addCondition(
        "Loop",
        _("Is looped"),
        _("Is looped"),
        _("_PARAM0_  is looped"),
        "Control time",
        "JsPlatform/Extensions/videoicon24.png",
        "JsPlatform/Extensions/videoicon16.png"
      )
      .addParameter("object", _("Choose an object video"), "", false)
      .getCodeExtraInformation()
      .setFunctionName("isLooped");

    object
      .addExpression(
        "IsPaused",
        _("Video is paused"),
        _("Return if video is paused"),
        _("Time"),
        "res/physics16.png"
      )
      .addParameter("object", _("Object"), "", false)
      .getCodeExtraInformation()
      .setFunctionName("isPaused");

    object
      .addExpression(
        "IsLooped",
        _("Video is looped"),
        _("Return if video is looped"),
        _("Time"),
        "res/physics16.png"
      )
      .addParameter("object", _("Object"), "", false)
      .getCodeExtraInformation()
      .setFunctionName("isLooped");

    object
      .addCondition(
        "Volume",
        _("Volume"),
        _("Test the volume of an video object"),
        _("Volume of _PARAM0_ is _PARAM1_ _PARAM2_"),
        "Volume",
        "JsPlatform/Extensions/videoicon24.png",
        "JsPlatform/Extensions/videoicon16.png"
      )
      .addParameter("object", _("Choose an object video"), "", false)
      .addParameter("relationalOperator", _("Sign of the test"))
      .addParameter("expression", _("Value 0-100"))
      .getCodeExtraInformation()
      .setFunctionName("getVolume")
      .setManipulatedType("number");

    object
      .addCondition(
        "Mute",
        _("Is muted"),
        _("Test if an video is muted"),
        _("_PARAM0_  is muted"),
        "Volume",
        "JsPlatform/Extensions/videoicon24.png",
        "JsPlatform/Extensions/videoicon16.png"
      )
      .addParameter("object", _("Choose an object video"), "", false)
      .getCodeExtraInformation()
      .setFunctionName("isMuted");

    object
      .addExpression(
        "GetCurrentTime",
        _("Get current time"),
        _("Return the current time of an video object (in seconds)"),
        _("Time"),
        "res/physics16.png"
      )
      .addParameter("object", _("Object"), "", false)
      .getCodeExtraInformation()
      .setFunctionName("getCurrentTime");

    object
      .addExpression(
        "GetDuration",
        _("Get the duration"),
        _("Return the duration of an video object (in seconds)"),
        _("Time"),
        "res/physics16.png"
      )
      .addParameter("object", _("Object"), "", false)
      .getCodeExtraInformation()
      .setFunctionName("getDuration");

    object
      .addExpression(
        "IsEnded",
        _("Get the duration"),
        _("Get the duration of an video object (in seconds)"),
        _("Time"),
        "res/physics16.png"
      )
      .addParameter("object", _("Object"), "", false)
      .getCodeExtraInformation()
      .setFunctionName("isEnded");

    object
      .addCondition(
        "Ended",
        _("Is ended"),
        _("Is ended"),
        _("_PARAM0_ is ended"),
        _("Control time"),
        "JsPlatform/Extensions/videoicon24.png",
        "JsPlatform/Extensions/videoicon16.png"
      )
      .addParameter("object", _("Choose an object video"), "", false)
      .getCodeExtraInformation()
      .setFunctionName("isEnded");

    object
      .addAction(
        "SetOpacity",
        _("Set opacity (in %)"),
        _("Set opacity (in %)"),
        _("Do _PARAM1_ _PARAM2_ % to the opacity of _PARAM0_"),
        "",
        "JsPlatform/Extensions/videoicon24.png",
        "JsPlatform/Extensions/videoicon16.png"
      )
      .addParameter("object", _("Choose an object video"), "", false)
      .addParameter("operator", _("Modification's sign"), "", false)
      .addParameter("expression", _("Opacity in %"), "", false)
      .getCodeExtraInformation()
      .setFunctionName("setOpacity")
      .setManipulatedType("number")
      .setGetter("getOpacity");

    object
      .addCondition(
        "GetOpacity",
        _("Opacity"),
        _("Test the opacity of an video object"),
        _("Opacity of _PARAM0_ is _PARAM1_ _PARAM2_"),
        "",
        "JsPlatform/Extensions/videoicon24.png",
        "JsPlatform/Extensions/videoicon16.png"
      )
      .addParameter("object", _("Choose an object video"), "", false)
      .addParameter("relationalOperator", _("Sign of the test"))
      .addParameter("expression", _("Opacity 0-100"))
      .getCodeExtraInformation()
      .setFunctionName("getOpacity")
      .setManipulatedType("number");

    object
      .addExpression(
        "GetOpacity",
        _("Get current opacity"),
        _("Return the opacity of an video object"),
        "",
        "res/physics16.png"
      )
      .addParameter("object", _("Object"), "", false)
      .getCodeExtraInformation()
      .setFunctionName("getOpacity");

    object
      .addAction(
        "SetPlaybackSpeed",
        _("Set playback speed (in %)"),
        _("Set playback speed (in %)"),
        _("Do _PARAM1_ _PARAM2_ % to the playback speed of _PARAM0_"),
        "",
        "JsPlatform/Extensions/videoicon24.png",
        "JsPlatform/Extensions/videoicon16.png"
      )
      .addParameter("object", _("Choose an object video"), "", false)
      .addParameter("operator", _("Modification's sign"), "", false)
      .addParameter("expression", _("Speed in %"), "", false)
      .getCodeExtraInformation()
      .setFunctionName("setPlaybackSpeed")
      .setManipulatedType("number")
      .setGetter("getPlaybackSpeed");

    object
      .addCondition(
        "GetPlaybackSpeed",
        _("Playback speed "),
        _("Test the playback speed of an video object"),
        _("Playback speed of _PARAM0_ is _PARAM1_ _PARAM2_"),
        "",
        "JsPlatform/Extensions/videoicon24.png",
        "JsPlatform/Extensions/videoicon16.png"
      )
      .addParameter("object", _("Choose an object video"), "", false)
      .addParameter("relationalOperator", _("Sign of the test"))
      .addParameter("expression", _("Speed 0-100"))
      .getCodeExtraInformation()
      .setFunctionName("getPlaybackSpeed")
      .setManipulatedType("number");

    object
      .addExpression(
        "GetPlaybackSpeed",
        _("Get current playback speed"),
        _("Return the playback speed of an video object"),
        "",
        "res/physics16.png"
      )
      .addParameter("object", _("Object"), "", false)
      .getCodeExtraInformation()
      .setFunctionName("getPlaybackSpeed");

    /**
     *
     * //TODO Action for change video (with PATH expression fileSystem) of an object video
     * Condition : if video is ready to play
     * Expression :  return if video is ready to play
     */

    //NOTE This don't work, because controls can't be displayed, need comfirmation please.
    /* object
      .addAction(
        "Controls",
        _("Toggle controls on video"),
        _("Display or hide the controls on my video"),
        _("Controls on my object : _PARAM0_ is on : _PARAM1_"),
        "Global",
        "JsPlatform/Extensions/videoicon24.png",
        "JsPlatform/Extensions/videoicon16.png"
      )
      .addParameter("object", _("Choose an object video"), "", false)
      .addParameter("yesorno", _("Display or not"), "", false)
      .getCodeExtraInformation()
      .setFunctionName("controls");

      object
      .addExpression(
        'controlsAreShowing',
        _('Controls on video'),
        _('Return state of controls on video'),
        _('Global'),
        'res/physics16.png'
      )
      .addParameter('object', _("Object"), '', false)
      .getCodeExtraInformation()
      .setFunctionName('controlsAreShowing');

      object
      .addCondition(
        "controlsAreShowing",
        _("Controls on video"),
        _("Controls on video"),
        _("The controls are showing on _PARAM0_ "),
        "Global",
        "JsPlatform/Extensions/videoicon24.png",
        "JsPlatform/Extensions/videoicon16.png"
      )
      .addParameter("object", _("Choose an object video"), "", false)
      .getCodeExtraInformation()
      .setFunctionName("controlsAreShowing"); */

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
      "Video::VideoObject",
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

      //TODO Need ressource manager and can select only video files
      //Codec can be played : https://www.w3schools.com/tags/av_met_canplaytype.asp

      var textureVideo = new PIXI.Texture.fromVideo(
        "C:/Users/RTX-Bouh/Desktop/test_video_GD.mp4"
      );

      //FIXME This autoplay don't work
      textureVideo.baseTexture.source.autoplay = false;

      console.log(textureVideo);

      //Setup the PIXI object:
      this._pixiObject = new PIXI.Sprite(textureVideo);
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
      return "JsPlatform/Extensions/videoicon24.png";
    };

    /**
     * This is called to update the PIXI object on the scene editor
     */
    RenderedVideoObjectInstance.prototype.update = function() {
      //FIXME need help here i can't catch err_file_not_found like this :
      video_is_ok = true;
      this._pixiObject._texture.baseTexture.error = function() {
        console.log("Starting to load video");
        console.log("Force pause");
        //this._pixiObject._texture.baseTexture.source.pause();
        video_is_ok = false;
      };

      if (video_is_ok == false) {
        video_missing = new PIXI.Texture.fromImage(
          "C:/GDevelop/newIDE/electron-app/app/www/JsPlatform/Extensions/missing_video24.png"
        );
        this._pixiObject.texture = video_missing;
      }

      if (
        typeof this._pixiObject._texture.baseTexture.source.pause ===
          "function" &&
        video_is_ok == true
      ) {
        //NOTE This stop the video but is not very clean i guess
        //Stop video in scene editor
        if (!this._pixiObject._texture.baseTexture.source.paused) {
          //promise added here for avoid error in IDE
          var promise = this._pixiObject._texture.baseTexture.source.pause();

          if (promise !== undefined) {
            promise
              .then(_ => {
                // Autoplay started!
                console.log("action pause > play !");
                //this._pixiObject._texture.baseTexture.source.pause();
              })
              .catch(error => {
                // Autoplay was prevented.
                console.log("action pause > pause !");
                //this._pixiObject._texture.baseTexture.source.play();
                // Show a "Play" button so that user can start playback.
              });
          }
        }
      }

      // Read a property from the object
      const property1Value = this._associatedObject
        .getProperties(this.project)
        .get("Video object opacity")
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

      if (this._instance.hasCustomSize()) {
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
      "Video::VideoObject",
      RenderedVideoObjectInstance
    );
  }
};
