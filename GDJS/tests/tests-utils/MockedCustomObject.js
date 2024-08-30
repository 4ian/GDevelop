gdjs.evtsExt__MyExtension__MyCustomObject = gdjs.evtsExt__MyExtension__MyCustomObject || {};

/**
 * Mocked generated custom object for MyExtension::MyCustomObject. 
 */
gdjs.evtsExt__MyExtension__MyCustomObject.MyCustomObject = class MyCustomObject extends gdjs.CustomRuntimeObject2D {
  constructor(parentInstanceContainer, objectData) {
    super(parentInstanceContainer, objectData);
    this._parentInstanceContainer = parentInstanceContainer;

    this._onceTriggers = new gdjs.OnceTriggers();
    this._objectData = {};
    
    this._objectData.MyProperty = objectData.content.MyProperty !== undefined ? objectData.content.MyProperty : Number("123") || 0;
    

    // It calls the onCreated super implementation at the end.
    this.onCreated();
  }

  // Hot-reload:
  updateFromObjectData(oldObjectData, newObjectData) {
    super.updateFromObjectData(oldObjectData, newObjectData);
    if (oldObjectData.content.MyProperty !== newObjectData.content.MyProperty)
      this._objectData.MyProperty = newObjectData.content.MyProperty;

    this.onHotReloading(this._parentInstanceContainer);
    return true;
  }

  // Properties:
  
  _getMyProperty() {
    return this._objectData.MyProperty !== undefined ? this._objectData.MyProperty : Number("123") || 0;
  }
  _setMyProperty(newValue) {
    this._objectData.MyProperty = newValue;
  }

  

  
}

// Methods:

gdjs.evtsExt__MyExtension__MyCustomObject.MyCustomObject.prototype.doStepPreEvents = function() {
  this._onceTriggers.startNewFrame();
};


gdjs.registerObject("MyExtension::MyCustomObject", gdjs.evtsExt__MyExtension__MyCustomObject.MyCustomObject);
