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
 **************************
 * TODOLIST
 ************************** 
 *
 * FIXME 
 * 
 * TODO 
 * - si la video n'est pas chargé mettre un placeholder fichier non trouver / ou erreur
 * - Souhaite un check de textureVideo si elle est chargé on continue sinon on charge un placeholder error
 *    Verif avec un isloaded ?
 * 
 * NOTE HELP
 * Le clique sur la video ne fait rien via les events
 * Le support du draggable behavior  n'est pas là
 * Pas possible de changer l'opacitée de la vidéo de par ce que GD propose déjà.
 * Doit-je inclure mes actions / contidion pour l'opacitée ?
 * 
 * Est-ce qu'une variable volume global pour géré tout les volume de différentes vidéo en même temps est utile ?
 * 
 **************************
 * List for eventsheet (not updated, see directly the declaration below)
 ************************** 
 * 
 * | Fait | Play | Condition, si la video de l'object MONOBJECTVIDEO est en lecture, MONOBJECTVIDEO is played
 * | Fait | Play | Action, Lancer la video de l'object , Play the video of MONOBJECTVIDEO
 * | WIP | isPlayed | Expression, retourne true/false si la video est en lecture, MONOBJECTVIDEO.Video::IsPlayed()
 * 
 * Pause | Condition, si la video de l'objet MONOBJECTVIDEO est en pause, The object video MONOBJECTVIDEO is paused
 * | Fait | Pause | Action, mettre en pause la video de l'object , Pause the video of MONOBJECTVIDEO
 * isPaused | Expression, retourne true/false si la video est en pause sur un objet, MONOBJECTVIDEO.Video::IsPaused()
 * 
 * Loop | Condition, si la video de l'object MONOBJECTVIDEO est en boucle, The object video MONOBJECTVIDEO is looped
 * | Fait | Loop | Action, mettre la video de l'object MONOBJECTVIDEO en boucle, Looped the video of MONOBJECTVIDEO
 * isLooped | Expression, retourne true/false si la video est en boucle, MONOBJECTVIDEO.Video::IsLooped()
 * 
 * Mute | Condition, si le volume de l'object est mute (ou volume = 0), The volume of MONOBJECTVIDEO is muted
 * | Fait | Mute | Action, mettre le volume de l'object en mute (ou volume = 0), Mute the volume of MONOBJECTVIDEO
 * | Fait | isMuted | Expression, retourne true/false si la video est mute, MONOBJECTVIDEO.Video::IsMuted()
 * 
 * Duration | Condition, si la lecture de la video est au temps 6000 (60 secondes), The duration of MONOBJECTVIDEO is = 6000 ms
 * WIP operator | setTime | Action, met la video a un temps spécifié en ms, Do = 6000 to the timer of MONOBJECTVIDEO
 * getTime | Expression, retourne un number qui est le temps depuis le lancement de la vidéo en ms (6000ms = 60secondes), MONOBJECTVIDEO.Video::GetTime()
 * 
 * Finish | Condition, si la vidéo est fini, If the video of MONOBJECTVIDEO is finish.
 * isFinish  | Expression, retourne true/false , isMuted sur un objet video, MONOBJECTVIDEO.Video::IsFinish()
 * 
 * isLoaded | Condition, si la video de l'object MONOBJECTVIDEO est charger, The video of my MONOBJECTVIDEO is loaded
 * isLoaded | Expression, retourne true/false si la video de MONOBJECTVIDEO est charger, MONOBJECTVIDEO.Video::IsLoaded()
 * 
 * 
 * Volume | Condition, si le volume de l'object est = à 100, The volume of MONOBJECTVIDEO is = 100 %
 * | fait | Volume | Action, mettre le volume de l'object à 100, Do = 100 % to the volume of MONOBJECTVIDEO
 * | fait | getVolume | Expression, getVolume sur un objet video, MONOBJECTVIDEO.Video::GetVolume()
 * 
 * Global Volume | Condition, si le volume global des l'objets est = à 100, The global volume of video objet's is = 100 %
 * Global Volume | Action, mettre le volume global des l'objets à 100, Do = 100 % to the global volume video objet's
 * getGlobalVolume | Expression, getGlobalVolume sur les objets video, Video::GetGlobalVolume()
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
  createExtension: function(t, gd) {
    const extension = new gd.PlatformExtension();
    extension.setExtensionInformation(
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
        new gd.PropertyDescriptor(
            objectContent.property3.toString()
        ).setType("number")
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
        t("Video object for testing"),
        t("This video object does nothing"),
        "JsPlatform/Extensions/videoicon32.png",
        videoObject
      )
      .setIncludeFile("Extensions/Video/videoruntimeobject.js")
      .addIncludeFile("Extensions/Video/videoruntimeobject-pixi-renderer.js");

      object
      .addAction(
        "Play",
        t("Play an video"),
        t("Play an video"),
        t("Play the video of : _PARAM0_"),
        "",
        "JsPlatform/Extensions/videoicon24.png",
        "JsPlatform/Extensions/videoicon16.png"
      )
      .addParameter("object", "Choose an object video", "", false)
      .getCodeExtraInformation()
      .setFunctionName("play");
  
       object
      .addAction(
        "Pause",
        t("Pause an video"),
        t("Pause an video"),
        t("Pause the video on my object : _PARAM0_"),
        "",
        "JsPlatform/Extensions/videoicon24.png",
        "JsPlatform/Extensions/videoicon16.png"
      )
      .addParameter("object", "Choose an object video", "", false)
      .getCodeExtraInformation()
      .setFunctionName("pause");

      object
      .addAction(
        "Loop",
        t("Loop an video"),
        t("Loop an video"),
        t("Loop the video on my object : _PARAM0_ is on : _PARAM1_"),
        "",
        "JsPlatform/Extensions/videoicon24.png",
        "JsPlatform/Extensions/videoicon16.png"
      )
      .addParameter("object", "Choose an object video", "", false)
      .addParameter("yesorno", t("Loop or not"), "", false)
      .getCodeExtraInformation()
      .setFunctionName("setLoop");

      object
      .addAction(
        "Mute",
        t("Mute an video"),
        t("Mute an video"),
        t("Mute the video on my object : _PARAM0_ is on : _PARAM1_"),
        "",
        "JsPlatform/Extensions/videoicon24.png",
        "JsPlatform/Extensions/videoicon16.png"
      )
      .addParameter("object", "Choose an object video", "", false)
      .addParameter("yesorno", t("Mute or not"), "", false)
      .getCodeExtraInformation()
      .setFunctionName("mute");

      object
      .addAction(
        "SetTime",
        t("Set time (in seconds)"),
        t("Set time (in seconds)"),
        t("Set time of my object : _PARAM0_ is _PARAM1_ _PARAM2_ seconds"),
        "",
        "JsPlatform/Extensions/videoicon24.png",
        "JsPlatform/Extensions/videoicon16.png"
      )
      .addParameter("object", t("Choose an object video"), "", false)
      .addParameter('operator', t("Modification's sign"), "", false)
      .addParameter("expression", t("Time in seconds"), "", false)
      .getCodeExtraInformation()
      .setFunctionName("setCurrentTime")
      .setManipulatedType('number')
      .setGetter('getCurrentTime');

      object
      .addAction(
        "SetVolume",
        t("Set volume (in %)"),
        t("Set volume (in %)"),
        t("Do _PARAM1_ _PARAM2_ to the volume of _PARAM0_, in percentage"),
        "",
        "JsPlatform/Extensions/videoicon24.png",
        "JsPlatform/Extensions/videoicon16.png"
      )
      .addParameter("object", t("Choose an object video"), "", false)
      .addParameter('operator', t("Modification's sign"), "", false)
      .addParameter("expression", t("Volume in %"), "", false)
      .getCodeExtraInformation()
      .setFunctionName("setVolume")
      .setManipulatedType('number')
      .setGetter('getVolume');

      object
      .addExpression(
        'getVolume',
        t('Get the volume'),
        t('Get the volume of an video object.'),
        t('Volume'),
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('getVolume');

      object
      .addExpression(
        'isMuted',
        t('Video is muted'),
        t('Return if video is muted'),
        t('Volume'),
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('isMuted');
      
      object
      .addCondition(
        "Play",
        t("Is played"),
        t("Test if an video is played"),
        t("_PARAM0_  is played"),
        "Control time",
        "JsPlatform/Extensions/videoicon24.png",
        "JsPlatform/Extensions/videoicon16.png"
      )
      .addParameter("object", "Choose an object video", "", false)
      .getCodeExtraInformation()
      .setFunctionName("isPlayed");

      object
      .addCondition(
        "Pause",
        t("Is paused"),
        t("Test if an video is paused"),
        t("_PARAM0_  is paused"),
        "Control time",
        "JsPlatform/Extensions/videoicon24.png",
        "JsPlatform/Extensions/videoicon16.png"
      )
      .addParameter("object", "Choose an object video", "", false)
      .getCodeExtraInformation()
      .setFunctionName("isPaused");

      object
      .addExpression(
        'isPaused',
        t('Video is played'),
        t('Return if video is played'),
        t('Time'),
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('isPaused');

      object
      .addExpression(
        'isPlayed',
        t('Video is played'),
        t('Return if video is played'),
        t('Time'),
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('isPlayed');

      object
      .addCondition(
        "Loop",
        t("Is looped"),
        t("Is looped"),
        t("_PARAM0_  is looped"),
        "Control time",
        "JsPlatform/Extensions/videoicon24.png",
        "JsPlatform/Extensions/videoicon16.png"
      )
      .addParameter("object", "Choose an object video", "", false)
      .getCodeExtraInformation()
      .setFunctionName("isLooped");

      object
      .addExpression(
        'isPaused',
        t('Video is paused'),
        t('Return if video is paused'),
        t('Time'),
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('isPaused');

      object
      .addExpression(
        'isLooped',
        t('Video is looped'),
        t('Return if video is looped'),
        t('Time'),
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('isLooped');

      object
      .addCondition(
        "Volume",
        t("Volume"),
        t("Test the volume of an video object"),
        t("Volume of _PARAM0_ is _PARAM1_ _PARAM2_"),
        "Volume",
        "JsPlatform/Extensions/videoicon24.png",
        "JsPlatform/Extensions/videoicon16.png"
      )
      .addParameter('object', t('Choose an object video'), '', false)
      .addParameter('relationalOperator', t('Sign of the test'))
      .addParameter('expression', t('Value 0-100'))
      .getCodeExtraInformation()
      .setFunctionName('getVolume')
      .setManipulatedType('number');

      object
      .addCondition(
        "Mute",
        t("Is muted"),
        t("Test if an video is muted"),
        t("_PARAM0_  is muted"),
        "Volume",
        "JsPlatform/Extensions/videoicon24.png",
        "JsPlatform/Extensions/videoicon16.png"
      )
      .addParameter("object", "Choose an object video", "", false)
      .getCodeExtraInformation()
      .setFunctionName("isMuted");

      object
      .addExpression(
        'getCurrentTime',
        t('Get current time'),
        t('Return the current time of an video object (in seconds)'),
        t('Time'),
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('getCurrentTime');

      object
      .addExpression(
        'getDuration',
        t('Get the duration'),
        t('Return the duration of an video object (in seconds)'),
        t('Time'),
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('getDuration');

      object
      .addExpression(
        'isEnded',
        t('Get the duration'),
        t('Get the duration of an video object (in seconds)'),
        t('Time'),
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('isEnded');

      object
      .addCondition(
        "Ended",
        t("Is ended"),
        t("Is ended"),
        t("_PARAM0_ is ended"),
        t("Control time"),
        "JsPlatform/Extensions/videoicon24.png",
        "JsPlatform/Extensions/videoicon16.png"
      )
      .addParameter("object", "Choose an object video", "", false)
      .getCodeExtraInformation()
      .setFunctionName("isEnded");

      /* object
      .addAction(
        "Controls",
        t("Toggle controls on video"),
        t("Display or hide the controls on my video"),
        t("Controls on my object : _PARAM0_ is on : _PARAM1_"),
        "Global",
        "JsPlatform/Extensions/videoicon24.png",
        "JsPlatform/Extensions/videoicon16.png"
      )
      .addParameter("object", "Choose an object video", "", false)
      .addParameter("yesorno", t("Display or not"), "", false)
      .getCodeExtraInformation()
      .setFunctionName("controls");

      object
      .addExpression(
        'controlsAreShowing',
        t('Controls on video'),
        t('Return state of controls on video'),
        t('Global'),
        'res/physics16.png'
      )
      .addParameter('object', t('Object'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('controlsAreShowing');

      object
      .addCondition(
        "controlsAreShowing",
        t("Controls on video"),
        t("Controls on video"),
        t("The controls are showing on _PARAM0_ "),
        "Global",
        "JsPlatform/Extensions/videoicon24.png",
        "JsPlatform/Extensions/videoicon16.png"
      )
      .addParameter("object", "Choose an object video", "", false)
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
  runExtensionSanityTests: function(gd, extension) { return []; },
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

    
       //TODO
       /*
        si la video n'est pas chargé mettre un placeholder fichier non trouver / ou erreur
       */
       
       
      // create a video texture from a path
      var textureVideo = new PIXI.Texture.fromVideo('C:/Users/RTX-Bouh/Desktop/test_video_GD.mp4');
      
      //TODO fonctionne pas
      /*
      * Souhaite un check de textureVideo si elle est chargé on continue sinon on charge un placeholder error
      * Verif avec un isloaded ?
      */
      if(!textureVideo){
        var textureVideo = new PIXI.Texture.fromImage('C:/Users/RTX-Bouh/Desktop/video.svg');
      }
      
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
       
       //Stop video in IDE
       if(!this._pixiObject._texture.baseTexture.source.paused){
         
         
         
         //promise added here for avoid error in IDE
        var promise = this._pixiObject._texture.baseTexture.source.pause();

        if (promise !== undefined) {
          promise.then(_ => {
            // Autoplay started!
            console.log("action pause > play !");
            //this._pixiObject._texture.baseTexture.source.pause();
          }).catch(error => {
            // Autoplay was prevented.
            console.log("action pause > pause !");
            //this._pixiObject._texture.baseTexture.source.play();
            // Show a "Play" button so that user can start playback.
          });
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
      "Video::VideoObject",
      RenderedVideoObjectInstance
    );
  }
};
