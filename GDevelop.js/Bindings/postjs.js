// Make sure that the naming convention for methods of GDevelop
// classes is camelCase (instead of PascalCase) and rename methods
// with special names (like `WRAPPED_`, `STATIC_`...).
var adaptNamingConventions = function (gd) {
  function uncapitalizeFirstLetter(method) {
    return method.charAt(0).toLowerCase() + method.slice(1);
  }

  function removePrefix(method, prefix) {
    if (method.indexOf(prefix) !== 0) return method;

    return method.replace(prefix, '');
  }

  function adaptClassMethods(object) {
    var proto = object.prototype;
    for (var method in proto) {
      if (method && proto.hasOwnProperty(method)) {
        var newName = method;
        var addToModule = false;
        var addToObject = false;

        //Detect static methods
        if (method.indexOf('STATIC_') === 0) {
          newName = removePrefix(newName, 'STATIC_');
          addToObject = true;
        }

        //Detect free functions
        if (method.indexOf('FREE_') === 0) {
          newName = removePrefix(newName, 'FREE_');
          addToModule = true;
        }

        //Remove prefix used for custom code generation
        newName = removePrefix(newName, 'MAP_');
        newName = removePrefix(newName, 'WRAPPED_');
        if (newName.indexOf('CLONE_') === 0) {
          newName = 'clone';
        }

        //Normalize method name
        newName = uncapitalizeFirstLetter(newName);
        if (newName !== method) {
          proto[newName] = proto[method];
          delete proto[method];
        }

        if (addToObject) {
          object[newName] = proto[newName];
        }

        if (addToModule) {
          gd[newName] = (function (fct) {
            return function () {
              //Simulate a free function
              if (arguments.length === 0) return fct();
              var args = [];
              Array.prototype.push.apply(args, arguments);
              args.shift();

              return fct.apply(arguments[0], args);
            };
          })(proto[newName]);
        }
      }
    }

    //Offer a delete method that does what gd.destroy does.
    proto.delete = function () {
      // Capture destruction context before the pointer is invalidated.
      // This is only done once per deletion, so the cost of capturing a
      // stack trace is negligible.
      this._destructionContext = {
        source: 'js',
        stack: new Error('Object destroyed here').stack,
        time: Date.now(),
      };
      gd.destroy(this);
      this.ptr = 0;
    };
  }

  for (var gdClass in gd) {
    if (gd.hasOwnProperty(gdClass)) {
      if (typeof gd[gdClass] !== 'function') continue;
      if (!gd[gdClass].prototype) continue;
      if (!gd[gdClass].prototype.hasOwnProperty('__class__')) continue;

      adaptClassMethods(gd[gdClass]);
    }
  }

  gd.Object = gd.gdObject; //Renaming was done to avoid clashing with javascript Object.
  gd.initializePlatforms = gd.ProjectHelper.prototype.initializePlatforms;

  //Provide shortcuts for casts:
  gd.asStandardEvent = function (evt) {
    return gd.castObject(evt, gd.StandardEvent);
  };
  gd.asElseEvent = function (evt) {
    return gd.castObject(evt, gd.ElseEvent);
  };
  gd.asRepeatEvent = function (evt) {
    return gd.castObject(evt, gd.RepeatEvent);
  };
  gd.asWhileEvent = function (evt) {
    return gd.castObject(evt, gd.WhileEvent);
  };
  gd.asForEachEvent = function (evt) {
    return gd.castObject(evt, gd.ForEachEvent);
  };
  gd.asForEachChildVariableEvent = function (evt) {
    return gd.castObject(evt, gd.ForEachChildVariableEvent);
  };
  gd.asCommentEvent = function (evt) {
    return gd.castObject(evt, gd.CommentEvent);
  };
  gd.asGroupEvent = function (evt) {
    return gd.castObject(evt, gd.GroupEvent);
  };
  gd.asLinkEvent = function (evt) {
    return gd.castObject(evt, gd.LinkEvent);
  };
  gd.asJsCodeEvent = function (evt) {
    return gd.castObject(evt, gd.JsCodeEvent);
  };
  gd.asPlatform = function (evt) {
    return gd.castObject(evt, gd.Platform);
  };

  gd.asSpriteConfiguration = function (evt) {
    return gd.castObject(evt, gd.SpriteObject);
  };
  gd.asTiledSpriteConfiguration = function (evt) {
    return gd.castObject(evt, gd.TiledSpriteObject);
  };
  gd.asPanelSpriteConfiguration = function (evt) {
    return gd.castObject(evt, gd.PanelSpriteObject);
  };
  gd.asTextObjectConfiguration = function (evt) {
    return gd.castObject(evt, gd.TextObject);
  };
  gd.asShapePainterConfiguration = function (evt) {
    return gd.castObject(evt, gd.ShapePainterObject);
  };
  gd.asAdMobConfiguration = function (evt) {
    return gd.castObject(evt, gd.AdMobObject);
  };
  gd.asTextEntryObject = function (evt) {
    return gd.castObject(evt, gd.TextEntryObject);
  };
  gd.asParticleEmitterConfiguration = function (evt) {
    return gd.castObject(evt, gd.ParticleEmitterObject);
  };
  gd.asObjectJsImplementation = function (evt) {
    return gd.castObject(evt, gd.ObjectJsImplementation);
  };
  gd.asCustomObjectConfiguration = function (evt) {
    return gd.castObject(evt, gd.CustomObjectConfiguration);
  };
  gd.asModel3DConfiguration = function (evt) {
    return gd.castObject(evt, gd.Model3DObjectConfiguration);
  };
  gd.asSpineConfiguration = function (evt) {
    return gd.castObject(evt, gd.SpineObjectConfiguration);
  };

  gd.asImageResource = function (evt) {
    return gd.castObject(evt, gd.ImageResource);
  };

  //Convenience methods:
  gd.VectorString.prototype.toJSArray = function () {
    var arr = [];
    var size = this.size();
    for (var i = 0; i < size; ++i) {
      arr.push(this.at(i));
    }
    return arr;
  };

  gd.VectorInt.prototype.toJSArray = function () {
    var arr = [];
    var size = this.size();
    for (var i = 0; i < size; ++i) {
      arr.push(this.at(i));
    }
    return arr;
  };

  // Add gd.Serializer.fromJSObject which is much faster than manually parsing
  // JSON with gd.Serializer.fromJSON.
  const elementFromJSObject = function (object, element) {
    if (typeof object === 'number') {
      element.setDoubleValue(object);
    } else if (typeof object === 'string') {
      element.setStringValue(object);
    } else if (typeof object === 'boolean') {
      element.setBoolValue(object);
    } else if (Array.isArray(object)) {
      element.considerAsArray();
      for (var i = 0; i < object.length; ++i) {
        var item = element.addChild('');
        elementFromJSObject(object[i], item);
      }
    } else if (typeof object === 'object') {
      for (var childName in object) {
        if (object.hasOwnProperty(childName)) {
          var child = element.addChild(childName);
          elementFromJSObject(object[childName], child);
        }
      }
    }
  };

  gd.Serializer.fromJSObject = function (object) {
    var element = new gd.SerializerElement();
    elementFromJSObject(object, element);

    return element;
  };

  const valueToJSObject = function (serializerValue) {
    // TODO: use getRaw to avoid conversions
    if (serializerValue.isBoolean()) return serializerValue.getBool();
    else if (serializerValue.isDouble()) return serializerValue.getDouble();
    else if (serializerValue.isInt()) return serializerValue.getInt();
    else if (serializerValue.isString()) {
      return serializerValue.getRawString();
    }

    return null;
  };

  gd.Serializer.toJSObject = function (element) {
    if (!element.isValueUndefined()) {
      return valueToJSObject(element.getValue());
    } else if (element.consideredAsArray()) {
      const array = [];

      const children = element.getAllChildren();
      const childrenCount = children.size();
      for (let i = 0; i < childrenCount; ++i) {
        // TODO: double check usage of shared_ptr
        const sharedPtrSerializerElement =
          children.getSharedPtrSerializerElement(i);
        const serializerElement = sharedPtrSerializerElement.get();
        array.push(gd.Serializer.toJSObject(serializerElement));
        sharedPtrSerializerElement.reset();
      }

      return array;
    } else {
      const object = {};

      const attributes = element.getAllAttributes();
      const attributeNames = attributes.keys();

      for (let i = 0; i < attributeNames.size(); ++i) {
        const name = attributeNames.at(i);
        const serializerValue = attributes.get(name);
        object[name] = valueToJSObject(element.getValue());
      }

      const children = element.getAllChildren();
      const childrenCount = children.size();
      for (let i = 0; i < childrenCount; ++i) {
        // TODO: double check usage of shared_ptr
        const name = children.getString(i);
        const sharedPtrSerializerElement =
          children.getSharedPtrSerializerElement(i);
        const serializerElement = sharedPtrSerializerElement.get();
        object[name] = gd.Serializer.toJSObject(serializerElement);
        sharedPtrSerializerElement.reset();
      }
      return object;
    }
    return null;
  };

  //Preserve backward compatibility with some alias for methods:
  gd.VectorString.prototype.get = gd.VectorString.prototype.at;
  gd.VectorPlatformExtension.prototype.get =
    gd.VectorPlatformExtension.prototype.at;
  gd.InstructionsList.prototype.push_back = function (e) {
    this.insert(e, this.size() - 1);
  };

  // A deep clone function for the `content` of `ObjectJsImplementation`.
  function deepClone(obj) {
    // Handle null, undefined, and non-object values
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    // Handle Date
    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }

    // Handle Array
    if (Array.isArray(obj)) {
      const clonedArr = [];
      for (let i = 0; i < obj.length; i++) {
        clonedArr.push(deepClone(obj[i]));
      }
      return clonedArr;
    }

    // Handle Objects
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        // Ensure key is directly on obj
        clonedObj[key] = deepClone(obj[key]);
      }
    }

    return clonedObj;
  }

  gd._deepCloneForObjectJsImplementationContent = function (obj) {
    return deepClone(obj);
  };

  return gd;
};

adaptNamingConventions(Module);

// --- Use-after-free detection ---

/**
 * Error thrown when code attempts to use a C++/WebIDL object after it has
 * been destroyed (use-after-free). This can happen when:
 * - JS calls a method on a wrapper whose delete() was already called (ptr is 0)
 * - C++ internally deleted the object but a JS wrapper still references it
 */
class UseAfterFreeError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UseAfterFreeError';
  }
}

Module.UseAfterFreeError = UseAfterFreeError;

/**
 * Maps integer call-context IDs to human-readable labels like
 * "Project.removeLayout". Built during patchClassesForUseAfterFreeDetection,
 * read at error time (cold path only).
 * @type {string[]}
 */
var callContextLabels = [];

/**
 * Check that an Emscripten WebIDL object is still alive.
 * Throws UseAfterFreeError if the object has been destroyed.
 *
 * @param {object} obj - The WebIDL wrapper object.
 * @param {string} label - Method name for the error message.
 * @param {object} gd - The Module/gd object.
 * @param {string|null} className - The C++ class name if tracked, null otherwise.
 */
function assertAlive(obj, label, gd, className) {
  if (!obj.ptr) {
    var message = label + ': object was already destroyed from JavaScript (ptr is 0).';
    var ctx = obj._destructionContext;
    if (ctx) {
      var agoMs = Date.now() - ctx.time;
      message += '\nDestroyed ' + agoMs + 'ms ago.';
      if (ctx.stack) {
        message += '\nDestruction stack:\n' + ctx.stack;
      }
    }
    throw new UseAfterFreeError(message);
  }
  if (
    className !== null &&
    gd.MemoryTrackedRegistry.isDead(obj.ptr, className)
  ) {
    var message = label + ': C++ object (' + className + ') was destroyed on C++ side but JavaScript wrapper still exists (ptr is not 0) and was about to be used (this exception was thrown instead).';
    var ctxId = gd.MemoryTrackedRegistry.getDeadContextId(obj.ptr, className);
    if (ctxId >= 0) {
      var ctxLabel = callContextLabels[ctxId] || ('unknown (id=' + ctxId + ')');
      message += '\nDestroyed by call to: ' + ctxLabel;
    }
    var ctxTimeMs = gd.MemoryTrackedRegistry.getDeadContextTimeMs(obj.ptr, className);
    if (ctxTimeMs > 0) {
      var agoMs = Math.round(Date.now() - ctxTimeMs);
      message += ' (' + agoMs + 'ms ago)';
    }
    if (obj._lastSuccessfulCall) {
      message += '\nLast successful method call on this wrapper: ' + className + '.' + obj._lastSuccessfulCall;
    }
    throw new UseAfterFreeError(message);
  }
}

/**
 * Patch all WebIDL classes to check for use-after-free before every method call.
 * Also assigns an integer call-context ID to each method and sets it on the C++
 * side before calling into WASM, so that MemoryTrackedRegistry::remove() can
 * capture which JS call triggered each destruction.
 *
 * @param {object} gd - The Module/gd object (after adaptNamingConventions).
 * @param {{skipped: Set<string>, tracked: Set<string>, verbose: boolean}}
 */
function patchClassesForUseAfterFreeDetection(
  gd,
  { skippedClassNames, trackedClassNames, verbose }
) {
  var patchedCount = 0;
  var nextContextId = 0;
  var setCtxId = gd.MemoryTrackedRegistry.setCurrentCallContextId.bind(
    gd.MemoryTrackedRegistry
  );

  for (var gdClass in gd) {
    if (!gd.hasOwnProperty(gdClass)) continue;
    if (typeof gd[gdClass] !== 'function') continue;
    if (!gd[gdClass].prototype) continue;
    if (!gd[gdClass].prototype.hasOwnProperty('__class__')) continue;
    if (skippedClassNames.has(gdClass)) continue;

    var proto = gd[gdClass].prototype;

    // Determine if this class is tracked in C++.
    var className = trackedClassNames.has(gdClass) ? gdClass : null;

    Object.getOwnPropertyNames(proto).forEach(function (methodName) {
      // Skip special methods.
      if (
        methodName === 'constructor' ||
        methodName === '__destroy__' ||
        methodName === '__class__' ||
        methodName === 'delete'
      )
        return;

      var desc = Object.getOwnPropertyDescriptor(proto, methodName);
      if (!desc || typeof desc.value !== 'function') return;

      // Assign a call-context ID for this (class, method) pair.
      var contextId = nextContextId++;
      callContextLabels[contextId] = gdClass + '.' + methodName;

      // Wrap the method with:
      // 1. A liveness check (assertAlive).
      // 2. Setting the call-context ID on the C++ side (~50-100ns) so
      //    MemoryTrackedRegistry::remove() knows which JS call triggered
      //    any destruction that occurs during this method.
      // 3. For tracked classes, recording the last successful method name
      //    on the wrapper for richer error messages.
      proto[methodName] = (function (original, mName, cName, ctxId) {
        return function useAfterFreeDetectionWrapper() {
          assertAlive(this, cName ? cName + '.' + mName : mName, gd, cName);
          setCtxId(ctxId);
          var result = original.apply(this, arguments);
          if (cName) {
            this._lastSuccessfulCall = mName;
          }
          return result;
        };
      })(desc.value, methodName, className, contextId);
    });

    patchedCount++;
  }

  if (verbose) {
    console.log(
      '[UseAfterFreeDetection] Patched ' + patchedCount + ' classes (' +
      trackedClassNames.size + ' tracked in C++, ' +
      nextContextId + ' call-context IDs assigned).'
    );
  }
}

patchClassesForUseAfterFreeDetection(Module, {
  skippedClassNames: new Set([]),
  // If adding new classes, also add them to `MemoryTrackedRegistryDialog`
  // and to the MemoryTracked member in the C++ class header.
  trackedClassNames: new Set([
    'Project',
    'Layout',
    'gdObject',
    'Behavior',
    'BehaviorsSharedData',
    'EffectsContainer',
    'InitialInstancesContainer',
    'LayersContainer',
    'ObjectGroupsContainer',
    'ObjectsContainer',
    'VariablesContainer',
  ]),
  verbose: false,
});
