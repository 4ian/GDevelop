(function() {
  if (window.GDSpine43Adapter) return;

  const scriptPromises = new Map();
  const dataCache = new Map();

  const normalizePath = value =>
    String(value || '')
      .trim()
      .replace(/\\/g, '/');

  const isAbsoluteUrl = value => /^(?:https?:|file:|data:|blob:)/i.test(value);

  const getNodeRequire = () => {
    if (typeof window !== 'undefined' && typeof window.require === 'function')
      return window.require;
    if (
      typeof globalThis !== 'undefined' &&
      typeof globalThis.require === 'function'
    )
      return globalThis.require;
    if (typeof require === 'function') return require;
    return null;
  };

  const fileUrlToPath = url => {
    const nodeRequire = getNodeRequire();
    if (nodeRequire) {
      try {
        const nodeUrl = nodeRequire('url');
        if (nodeUrl && nodeUrl.fileURLToPath) return nodeUrl.fileURLToPath(url);
      } catch (error) {}
    }
    return decodeURIComponent(
      String(url)
        .replace(/^file:\/\/\//i, '')
        .replace(/^file:\/\//i, '')
    );
  };

  const resolvePath = (path, basePath) => {
    const normalizedPath = normalizePath(path);
    const normalizedBase = normalizePath(
      basePath || document.baseURI || window.location.href
    );
    if (!normalizedPath) return '';
    if (isAbsoluteUrl(normalizedPath)) return normalizedPath;
    const resources =
      window.gdjs &&
      window.gdjs.projectData &&
      window.gdjs.projectData.resources &&
      Array.isArray(window.gdjs.projectData.resources.resources)
        ? window.gdjs.projectData.resources.resources
        : [];
    const getBasename = value => {
      const normalizedValue = normalizePath(value);
      const parts = normalizedValue.split('/');
      return parts.length ? parts[parts.length - 1] : normalizedValue;
    };
    const normalizedLower = normalizedPath.toLowerCase();
    const basenameLower = getBasename(normalizedPath).toLowerCase();
    const resource = resources.find(entry => {
      const file = normalizePath(entry && entry.file);
      const name = normalizePath(entry && entry.name);
      return (
        file.toLowerCase() === normalizedLower ||
        name.toLowerCase() === normalizedLower ||
        getBasename(file).toLowerCase() === basenameLower ||
        getBasename(name).toLowerCase() === basenameLower
      );
    });
    const candidate =
      resource && resource.file ? normalizePath(resource.file) : normalizedPath;
    try {
      return new URL(
        candidate,
        normalizedBase || document.baseURI || window.location.href
      ).toString();
    } catch (error) {
      return candidate;
    }
  };

  const ensureScriptLoaded = scriptPath => {
    const resolved = resolvePath(scriptPath);
    if (!resolved)
      return Promise.reject(new Error('Spine runtime script path is empty.'));
    if (scriptPromises.has(resolved)) return scriptPromises.get(resolved);

    const promise = new Promise((resolve, reject) => {
      const existing = document.querySelector(
        'script[data-gd-spine43="' + resolved + '"]'
      );
      if (existing) {
        if (existing.getAttribute('data-loaded') === '1') {
          resolve();
          return;
        }
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener(
          'error',
          () => reject(new Error('Failed to load script: ' + resolved)),
          { once: true }
        );
        return;
      }

      const shouldSandboxRuntime =
        typeof window.require !== 'undefined' ||
        typeof require !== 'undefined' ||
        (typeof process !== 'undefined' &&
          process.versions &&
          process.versions.electron);

      if (shouldSandboxRuntime) {
        (async () => {
          try {
            let source = '';
            if (
              /^file:/i.test(resolved) &&
              typeof window.require === 'function'
            ) {
              const nodeUrl = window.require('url');
              const nodeFs = window.require('fs');
              const filePath = nodeUrl.fileURLToPath
                ? nodeUrl.fileURLToPath(resolved)
                : decodeURI(
                    resolved.replace('file:///', '').replace('file://', '')
                  );
              source = nodeFs.readFileSync(filePath, 'utf8');
            } else {
              const response = await fetch(resolved);
              if (!response.ok)
                throw new Error(
                  'Failed to fetch script: ' +
                    resolved +
                    ' (' +
                    response.status +
                    ')'
                );
              source = await response.text();
            }

            source = source.replace(
              /var __require\s*=\s*\/\*\s*@__PURE__\s*\*\/\s*\(\(x\)[\s\S]*?throw new Error\('Dynamic require of "' \+ x \+ '" is not supported'\);\s*\}\);/g,
              'var __require = function(x) { return typeof PIXI !== "undefined" ? PIXI : window.PIXI; };'
            );

            const wrappedSource =
              '(function(){\n' +
              'var require=undefined;var module=undefined;var exports=undefined;var define=undefined;var process=undefined;\n' +
              source +
              "\n;if (typeof window !== 'undefined' && typeof spine !== 'undefined') window.spine = spine;\n" +
              '})();\n//# sourceURL=' +
              resolved;

            const script = document.createElement('script');
            script.setAttribute('data-gd-spine43', resolved);
            script.text = wrappedSource;
            document.head.appendChild(script);
            script.setAttribute('data-loaded', '1');
            resolve();
          } catch (error) {
            reject(error);
          }
        })();
        return;
      }

      const script = document.createElement('script');
      script.async = true;
      script.src = resolved;
      script.setAttribute('data-gd-spine43', resolved);
      script.addEventListener(
        'load',
        () => {
          script.setAttribute('data-loaded', '1');
          resolve();
        },
        { once: true }
      );
      script.addEventListener(
        'error',
        () => {
          reject(new Error('Failed to load script: ' + resolved));
        },
        { once: true }
      );
      document.head.appendChild(script);
    });

    scriptPromises.set(resolved, promise);
    return promise;
  };

  const getSpineNamespace = runtimeGlobal => {
    const candidates = [
      runtimeGlobal ? window[runtimeGlobal] : null,
      window.spine || null,
      window.PIXI && window.PIXI.spine ? window.PIXI.spine : null,
      typeof globalThis !== 'undefined' && globalThis.spine
        ? globalThis.spine
        : null,
      typeof global !== 'undefined' && global.spine ? global.spine : null,
    ];
    for (const candidate of candidates) {
      if (
        candidate &&
        candidate.TextureAtlas &&
        candidate.AtlasAttachmentLoader
      )
        return candidate;
    }
    return null;
  };

  const ensureRuntime = async options => {
    if (!window.PIXI) {
      throw new Error(
        'PIXI is not available. GDevelop Pixi renderer is required.'
      );
    }

    let namespace = getSpineNamespace(options && options.runtimeGlobal);
    if (namespace) return namespace;

    const runtimeScriptPath =
      options && options.runtimeScriptPath ? options.runtimeScriptPath : '';
    if (!runtimeScriptPath) {
      throw new Error(
        'Spine runtime is missing. Set RuntimeScriptPath to a local spine-pixi-v7 browser build.'
      );
    }

    await ensureScriptLoaded(runtimeScriptPath);
    namespace = getSpineNamespace(options && options.runtimeGlobal);
    if (!namespace) {
      throw new Error(
        'Spine runtime loaded but global namespace was not found.'
      );
    }
    return namespace;
  };

  const fetchCached = async (cacheKey, url, responseType) => {
    if (dataCache.has(cacheKey)) return dataCache.get(cacheKey);
    const promise = (async () => {
      if (/^file:/i.test(url)) {
        const nodeRequire = getNodeRequire();
        if (nodeRequire) {
          const nodeFs = nodeRequire('fs');
          const filePath = fileUrlToPath(url);
          if (responseType === 'arrayBuffer') {
            const buffer = nodeFs.readFileSync(filePath);
            return buffer.buffer.slice(
              buffer.byteOffset,
              buffer.byteOffset + buffer.byteLength
            );
          }
          const text = nodeFs.readFileSync(filePath, 'utf8');
          return responseType === 'json' ? JSON.parse(text) : text;
        }
      }

      const response = await fetch(url);
      if (!response.ok)
        throw new Error('Failed to load ' + url + ' (' + response.status + ')');
      if (responseType === 'json') return response.json();
      if (responseType === 'arrayBuffer') return response.arrayBuffer();
      return response.text();
    })();
    dataCache.set(cacheKey, promise);
    return promise;
  };

  const loadText = url => fetchCached('text:' + url, url, 'text');
  const loadJson = url => fetchCached('json:' + url, url, 'json');
  const loadArrayBuffer = url => fetchCached('bin:' + url, url, 'arrayBuffer');

  const loadBaseTexture = url => {
    const resolved = resolvePath(url);
    if (window.PIXI.BaseTexture && window.PIXI.BaseTexture.from) {
      return window.PIXI.BaseTexture.from(resolved);
    }
    const texture = window.PIXI.Texture.from(resolved);
    return texture.baseTexture || texture;
  };

  const SPINE_TEXTURE_FILTER = {
    nearest: 9728,
    linear: 9729,
    mipmap: 9987,
    mipmapnearestnearest: 9984,
    mipmaplinearnearest: 9985,
    mipmapnearestlinear: 9986,
    mipmaplinearlinear: 9987,
  };

  const SPINE_TEXTURE_WRAP = {
    clamptoedge: 33071,
    mirroredrepeat: 33648,
    repeat: 10497,
  };

  const normalizeAtlasEnum = (value, values, fallback) => {
    if (Number.isFinite(value)) return value;
    const normalized = String(value || '')
      .replace(/[^a-z0-9]/gi, '')
      .toLowerCase();
    return values[normalized] || fallback;
  };

  const ensureAtlasPageTextureSettings = page => {
    if (!page) return;
    page.minFilter = normalizeAtlasEnum(
      page.minFilter,
      SPINE_TEXTURE_FILTER,
      SPINE_TEXTURE_FILTER.linear
    );
    page.magFilter = normalizeAtlasEnum(
      page.magFilter,
      SPINE_TEXTURE_FILTER,
      SPINE_TEXTURE_FILTER.linear
    );
    page.uWrap = normalizeAtlasEnum(
      page.uWrap,
      SPINE_TEXTURE_WRAP,
      SPINE_TEXTURE_WRAP.clamptoedge
    );
    page.vWrap = normalizeAtlasEnum(
      page.vWrap,
      SPINE_TEXTURE_WRAP,
      SPINE_TEXTURE_WRAP.clamptoedge
    );
  };

  const buildAtlas = (spineNamespace, atlasText, atlasUrl) => {
    let isV4_1 = false;
    const atlas = new spineNamespace.TextureAtlas(atlasText, function(
      line,
      callback
    ) {
      isV4_1 = true;
      const imageUrl = resolvePath(line, atlasUrl);
      callback(loadBaseTexture(imageUrl));
    });

    if (!isV4_1 && atlas.pages) {
      for (const page of atlas.pages) {
        ensureAtlasPageTextureSettings(page);
        const imageUrl = resolvePath(page.name, atlasUrl);
        const pixiTexture = loadBaseTexture(imageUrl);
        let spineTex = pixiTexture;
        if (spineNamespace.SpineTexture && spineNamespace.SpineTexture.from) {
          spineTex = spineNamespace.SpineTexture.from(
            pixiTexture.baseTexture || pixiTexture
          );
        }
        page.setTexture(spineTex);
      }
    }

    return atlas;
  };

  const createInstance = async options => {
    const spineNamespace = await ensureRuntime(options || {});
    const atlasUrl = resolvePath(options.atlasFile);
    const skeletonUrl = resolvePath(options.skeletonFile);

    if (!atlasUrl) throw new Error('AtlasFile is empty.');
    if (!skeletonUrl) throw new Error('SkeletonFile is empty.');

    const atlasText = await loadText(atlasUrl);
    const atlas = buildAtlas(spineNamespace, atlasText, atlasUrl);
    const atlasAttachmentLoader = new spineNamespace.AtlasAttachmentLoader(
      atlas
    );
    const parser = options.binaryData
      ? new spineNamespace.SkeletonBinary(atlasAttachmentLoader)
      : new spineNamespace.SkeletonJson(atlasAttachmentLoader);

    if (parser && typeof parser.scale !== 'undefined') {
      parser.scale = Math.max(0.0001, Number(options.importScale) || 1);
    }

    const rawSkeletonData = options.binaryData
      ? new Uint8Array(await loadArrayBuffer(skeletonUrl))
      : await loadJson(skeletonUrl);
    const skeletonData = parser.readSkeletonData(rawSkeletonData);
    const spineObject = new spineNamespace.Spine(skeletonData);

    if ('autoUpdate' in spineObject) spineObject.autoUpdate = false;

    const resultHandle = {
      runtime: spineNamespace,
      spine: spineObject,
      container: spineObject,
      skeletonData: skeletonData,
      lastEventName: '',
      lastEventString: '',
      lastEventInt: 0,
      lastEventFloat: 0,
      lastCompletedAnimation: '',
      eventFiredThisFrame: false,
      completedFiredThisFrame: false,
    };

    if (spineObject.state) {
      spineObject.state.addListener({
        event: (trackIndex, event) => {
          if (event && event.data) {
            resultHandle.lastEventName = String(event.data.name || '');
            resultHandle.lastEventString = String(event.stringValue || '');
            resultHandle.lastEventInt = Number(event.intValue) || 0;
            resultHandle.lastEventFloat = Number(event.floatValue) || 0;
            resultHandle.eventFiredThisFrame = true;
          }
        },
        complete: trackIndex => {
          if (trackIndex && trackIndex.animation) {
            resultHandle.lastCompletedAnimation = String(
              trackIndex.animation.name || ''
            );
            resultHandle.completedFiredThisFrame = true;
          }
        },
      });
    }

    if (spineObject.stateData && typeof options.mixDuration !== 'undefined') {
      spineObject.stateData.defaultMix = Math.max(
        0,
        Number(options.mixDuration) || 0
      );
    }

    if (
      options.skinName &&
      spineObject.skeleton &&
      spineObject.skeleton.setSkinByName
    ) {
      spineObject.skeleton.setSkinByName(String(options.skinName));
      if (spineObject.skeleton.setSlotsToSetupPose)
        spineObject.skeleton.setSlotsToSetupPose();
    }

    const initialAnimationName =
      options.animationName ||
      (skeletonData.animations &&
        skeletonData.animations[0] &&
        skeletonData.animations[0].name) ||
      '';
    if (
      initialAnimationName &&
      spineObject.state &&
      spineObject.state.setAnimation
    ) {
      spineObject.state.setAnimation(
        0,
        String(initialAnimationName),
        !!options.loop
      );
    }

    setInspectorOverrides(resultHandle, options.inspectorOverrides || {});

    return resultHandle;
  };

  const getDisplayObject = handle => {
    if (!handle) return null;
    return handle.container || handle.spine || handle;
  };

  const getSkeleton = handle => {
    const object = getDisplayObject(handle);
    return object && object.skeleton ? object.skeleton : null;
  };

  const getBone = (handle, boneName) => {
    const skeleton = getSkeleton(handle);
    const name = String(boneName || '').trim();
    if (!skeleton || !name) return null;
    if (typeof skeleton.findBone === 'function') return skeleton.findBone(name);
    if (!Array.isArray(skeleton.bones)) return null;
    return (
      skeleton.bones.find(
        bone => bone && bone.data && bone.data.name === name
      ) || null
    );
  };

  const getAppliedBonePose = bone => {
    if (!bone) return null;
    return bone.appliedPose || bone.pose || bone;
  };

  const ensureWorldTransforms = handle => {
    if (handle && handle.transformsDirty) {
      const skeleton = getSkeleton(handle);
      if (skeleton && typeof skeleton.updateWorldTransform === 'function') {
        skeleton.updateWorldTransform(2 /* update */);
      }
      handle.transformsDirty = false;
    }
  };

  const refreshBoneTransforms = handle => {
    if (handle) handle.transformsDirty = true;
    return true;
  };

  const toFiniteNumber = (value, fallback) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
  };

  const inverseAffinePoint = (matrix, x, y) => {
    if (!matrix) return { x, y };
    const det = matrix.a * matrix.d - matrix.b * matrix.c;
    if (Math.abs(det) <= 1e-8) return { x, y };
    const px = x - matrix.tx;
    const py = y - matrix.ty;
    return {
      x: (px * matrix.d - py * matrix.c) / det,
      y: (py * matrix.a - px * matrix.b) / det,
    };
  };

  const applyAffinePoint = (matrix, x, y) => {
    if (!matrix) return { x, y };
    return {
      x: matrix.a * x + matrix.c * y + matrix.tx,
      y: matrix.b * x + matrix.d * y + matrix.ty,
    };
  };

  const scenePointToContainerLocal = (object, sceneX, sceneY) => {
    const point = {
      x: toFiniteNumber(sceneX, 0),
      y: toFiniteNumber(sceneY, 0),
    };
    if (!object || !object.transform) return point;
    if (object.transform.updateLocalTransform)
      object.transform.updateLocalTransform();
    return inverseAffinePoint(
      object.transform.localTransform,
      point.x,
      point.y
    );
  };

  const containerLocalToScenePoint = (object, localX, localY) => {
    const point = {
      x: toFiniteNumber(localX, 0),
      y: toFiniteNumber(localY, 0),
    };
    if (!object || !object.transform) return point;
    if (object.transform.updateLocalTransform)
      object.transform.updateLocalTransform();
    return applyAffinePoint(object.transform.localTransform, point.x, point.y);
  };

  const worldVectorToParentLocal = (bone, worldX, worldY) => {
    if (!bone || !bone.parent) {
      return {
        x: toFiniteNumber(worldX, 0),
        y: toFiniteNumber(worldY, 0),
      };
    }
    const parentPose =
      bone.parent.appliedPose || bone.parent.pose || bone.parent;
    const det = parentPose.a * parentPose.d - parentPose.b * parentPose.c;
    if (Math.abs(det) <= 1e-8) {
      return {
        x: toFiniteNumber(worldX, 0),
        y: toFiniteNumber(worldY, 0),
      };
    }
    return {
      x: (worldX * parentPose.d - worldY * parentPose.b) / det,
      y: (worldY * parentPose.a - worldX * parentPose.c) / det,
    };
  };

  const setupBoneOverridesHook = object => {
    if (!object || object.__boneHookInstalled) return;
    object.__boneHookInstalled = true;
    const originalHook = object.beforeUpdateWorldTransforms;
    object.beforeUpdateWorldTransforms = spine => {
      if (originalHook) originalHook.call(object, spine);
      if (object.__boneOverrides) {
        let hasOverride = false;
        for (const boneName in object.__boneOverrides) {
          const overrides = object.__boneOverrides[boneName];
          const bone = spine.skeleton.findBone(boneName);
          if (bone && bone.pose) {
            if (overrides.x !== undefined) bone.pose.x = overrides.x;
            if (overrides.y !== undefined) bone.pose.y = overrides.y;
            if (overrides.rotation !== undefined)
              bone.pose.rotation = overrides.rotation;
            if (overrides.scaleX !== undefined)
              bone.pose.scaleX = overrides.scaleX;
            if (overrides.scaleY !== undefined)
              bone.pose.scaleY = overrides.scaleY;
            hasOverride = true;
          }
        }
        if (hasOverride) {
          // console.log("Applied bone overrides", JSON.stringify(object.__boneOverrides));
        }
      }
    };
  };

  const setupQueuedPhysicsMovementHook = object => {
    if (!object || object.__queuedPhysicsMovementHookInstalled) return;
    object.__queuedPhysicsMovementHookInstalled = true;
    const originalHook = object.beforeUpdateWorldTransforms;
    object.beforeUpdateWorldTransforms = spine => {
      if (originalHook) originalHook.call(object, spine);

      const movement = object.__queuedPhysicsMovement;
      if (!movement) return;
      object.__queuedPhysicsMovement = null;

      const skeleton = spine && spine.skeleton;
      if (!skeleton) return;

      const x = toFiniteNumber(movement.x, 0);
      const y = toFiniteNumber(movement.y, 0);
      const rotation = toFiniteNumber(movement.rotation, 0);
      if ((x || y) && typeof skeleton.physicsTranslate === 'function') {
        skeleton.physicsTranslate(x, y);
      }
      if (rotation && typeof skeleton.physicsRotate === 'function') {
        skeleton.physicsRotate(0, 0, rotation);
      }
    };
  };

  const setPhysicsTransformInheritance = (
    handle,
    positionX,
    positionY,
    rotation
  ) => {
    const object = getDisplayObject(handle);
    if (!object) return false;

    const positionFactorX = toFiniteNumber(positionX, 0);
    const positionFactorY = toFiniteNumber(positionY, 0);
    if (typeof object.setPhysicsPositionInheritanceFactor === 'function') {
      object.setPhysicsPositionInheritanceFactor(
        positionFactorX,
        positionFactorY
      );
    } else {
      object._physicsPositionInheritanceFactorX = positionFactorX;
      object._physicsPositionInheritanceFactorY = positionFactorY;
    }

    const rotationFactor = toFiniteNumber(rotation, 0);
    if ('physicsRotationInheritanceFactor' in object) {
      object.physicsRotationInheritanceFactor = rotationFactor;
    } else {
      object._physicsRotationInheritanceFactor = rotationFactor;
    }

    if (typeof object.resetPhysicsTransform === 'function') {
      object.resetPhysicsTransform();
    }
    return true;
  };

  const queuePhysicsMovement = (handle, x, y, rotation) => {
    const object = getDisplayObject(handle);
    if (!object) return false;

    setupQueuedPhysicsMovementHook(object);
    const movement = object.__queuedPhysicsMovement || {
      x: 0,
      y: 0,
      rotation: 0,
    };
    movement.x += toFiniteNumber(x, 0);
    movement.y += toFiniteNumber(y, 0);
    movement.rotation += toFiniteNumber(rotation, 0);
    object.__queuedPhysicsMovement = movement;
    return true;
  };

  const findConstraintByName = (skeleton, constraintName) => {
    const name = String(constraintName || '');
    if (!skeleton || !name || !Array.isArray(skeleton.constraints)) return null;
    return (
      skeleton.constraints.find(constraint => {
        const dataName =
          constraint && constraint.data && constraint.data.name
            ? constraint.data.name
            : constraint && constraint.name
            ? constraint.name
            : '';
        return dataName === name;
      }) || null
    );
  };

  const applyInspectorOverrides = handle => {
    const object = getDisplayObject(handle);
    const skeleton = getSkeleton(handle);
    const overrides =
      object && object.__spine43InspectorOverrides
        ? object.__spine43InspectorOverrides
        : null;
    if (!object || !skeleton || !overrides) return false;

    const boneOverrides = overrides.bones || {};
    for (const boneName in boneOverrides) {
      const bone = getBone(handle, boneName);
      const boneOverride = boneOverrides[boneName] || {};
      if (!bone || !bone.pose) continue;
      if (boneOverride.x !== undefined)
        bone.pose.x = toFiniteNumber(boneOverride.x, bone.pose.x || 0);
      if (boneOverride.y !== undefined)
        bone.pose.y = toFiniteNumber(boneOverride.y, bone.pose.y || 0);
      if (boneOverride.rotation !== undefined) {
        bone.pose.rotation = toFiniteNumber(
          boneOverride.rotation,
          bone.pose.rotation || 0
        );
      }
      if (boneOverride.scaleX !== undefined) {
        bone.pose.scaleX = toFiniteNumber(
          boneOverride.scaleX,
          bone.pose.scaleX || 1
        );
      }
      if (boneOverride.scaleY !== undefined) {
        bone.pose.scaleY = toFiniteNumber(
          boneOverride.scaleY,
          bone.pose.scaleY || 1
        );
      }
      if (boneOverride.length !== undefined && bone.data) {
        bone.data.length = Math.max(
          0,
          toFiniteNumber(boneOverride.length, bone.data.length || 0)
        );
      }
    }

    const constraintOverrides = overrides.constraints || {};
    for (const constraintName in constraintOverrides) {
      const constraint = findConstraintByName(skeleton, constraintName);
      const constraintOverride = constraintOverrides[constraintName] || {};
      const pose = constraint && (constraint.pose || constraint.appliedPose);
      if (!pose) continue;
      [
        'mix',
        'inertia',
        'strength',
        'damping',
        'mass',
        'wind',
        'gravity',
      ].forEach(field => {
        if (constraintOverride[field] === undefined) return;
        if (field === 'mass') {
          const mass = Math.max(
            0.0001,
            toFiniteNumber(constraintOverride.mass, 1)
          );
          pose.massInverse = 1 / mass;
        } else {
          pose[field] = toFiniteNumber(
            constraintOverride[field],
            pose[field] || 0
          );
        }
      });
      if (constraintOverride.mixTranslate !== undefined) {
        constraint.mixTranslate = Math.max(
          0,
          Math.min(1, toFiniteNumber(constraintOverride.mixTranslate, 0))
        );
      }
      if (constraintOverride.mixRotate !== undefined) {
        constraint.mixRotate = Math.max(
          0,
          Math.min(1, toFiniteNumber(constraintOverride.mixRotate, 0))
        );
      }
      if (constraintOverride.mixScale !== undefined) {
        constraint.mixScale = Math.max(
          0,
          Math.min(1, toFiniteNumber(constraintOverride.mixScale, 0))
        );
      }
      if (constraintOverride.mixShear !== undefined) {
        constraint.mixShear = Math.max(
          0,
          Math.min(1, toFiniteNumber(constraintOverride.mixShear, 0))
        );
      }
    }

    const slotOverrides = overrides.slots || {};
    for (const slotName in slotOverrides) {
      const slot = skeleton.findSlot
        ? skeleton.findSlot(String(slotName || ''))
        : null;
      const color = getSlotDisplayColor(slot);
      const slotOverride = slotOverrides[slotName] || {};
      if (!slot || !color) continue;
      if (slotOverride.r !== undefined)
        color.r = Math.max(
          0,
          Math.min(1, toFiniteNumber(slotOverride.r, 255) / 255)
        );
      if (slotOverride.g !== undefined)
        color.g = Math.max(
          0,
          Math.min(1, toFiniteNumber(slotOverride.g, 255) / 255)
        );
      if (slotOverride.b !== undefined)
        color.b = Math.max(
          0,
          Math.min(1, toFiniteNumber(slotOverride.b, 255) / 255)
        );
      if (slotOverride.a !== undefined)
        color.a = Math.max(0, Math.min(1, toFiniteNumber(slotOverride.a, 1)));
    }

    refreshBoneTransforms(handle);
    return true;
  };

  const setupInspectorOverridesHook = (object, handle) => {
    if (!object || object.__spine43InspectorOverridesHookInstalled) return;
    object.__spine43InspectorOverridesHookInstalled = true;
    const originalHook = object.beforeUpdateWorldTransforms;
    object.beforeUpdateWorldTransforms = spine => {
      if (originalHook) originalHook.call(object, spine);
      applyInspectorOverrides(handle);
    };
  };

  const setInspectorOverrides = (handle, overrides) => {
    const object = getDisplayObject(handle);
    if (!object) return false;
    object.__spine43InspectorOverrides = overrides || {};
    setupInspectorOverridesHook(object, handle);
    return applyInspectorOverrides(handle);
  };

  const getBoneOverride = (handle, boneName) => {
    const object = getDisplayObject(handle);
    if (!object) return null;
    if (!object.__boneOverrides) object.__boneOverrides = {};
    if (!object.__boneOverrides[boneName])
      object.__boneOverrides[boneName] = {};
    setupBoneOverridesHook(object);
    return object.__boneOverrides[boneName];
  };

  const cleanupBoneOverride = (handle, boneName) => {
    const object = getDisplayObject(handle);
    if (!object || !object.__boneOverrides || !object.__boneOverrides[boneName])
      return;
    const overrides = object.__boneOverrides[boneName];
    if (
      overrides.x === undefined &&
      overrides.y === undefined &&
      overrides.rotation === undefined &&
      overrides.scaleX === undefined &&
      overrides.scaleY === undefined
    ) {
      delete object.__boneOverrides[boneName];
    }
  };

  const AUTO_RESET_TYPES = Object.freeze({
    position: ['x', 'y'],
    rotation: ['rotation'],
    scale: ['scaleX', 'scaleY'],
  });

  const normalizeAutoResetType = value => {
    const text = String(value || '')
      .trim()
      .toLowerCase();
    if (
      text === 'position' ||
      text === 'move' ||
      text === 'pos' ||
      text === '移动' ||
      text === '位移'
    )
      return 'position';
    if (
      text === 'rotation' ||
      text === 'rotate' ||
      text === 'rot' ||
      text === '旋转'
    )
      return 'rotation';
    if (text === 'scale' || text === 'scaling' || text === '缩放')
      return 'scale';
    return '';
  };

  const splitBoneNameList = value => {
    if (Array.isArray(value)) {
      return value.map(entry => String(entry || '').trim()).filter(Boolean);
    }
    return String(value || '')
      .split(/[,\n;|]+/)
      .map(entry => entry.trim())
      .filter(Boolean);
  };

  const expandBoneNameList = (handle, value) => {
    const raw = String(value || '')
      .trim()
      .toLowerCase();
    if (!raw) return [];
    if (raw === '*' || raw === 'all' || raw === '全部' || raw === '所有') {
      const skeleton = getSkeleton(handle);
      if (!skeleton || !Array.isArray(skeleton.bones)) return [];
      return skeleton.bones
        .map(bone =>
          bone && bone.data && bone.data.name ? String(bone.data.name) : ''
        )
        .filter(Boolean);
    }
    return splitBoneNameList(value);
  };

  const createDefaultAutoResetConfig = () => ({
    position: { enabled: false, delay: 0, duration: 0.15 },
    rotation: { enabled: false, delay: 0, duration: 0.15 },
    scale: { enabled: false, delay: 0, duration: 0.15 },
  });

  const getAutoResetStore = handle => {
    if (!handle) return null;
    if (!handle.__boneAutoResetStore) {
      handle.__boneAutoResetStore = {
        configs: {},
        states: {},
      };
    }
    return handle.__boneAutoResetStore;
  };

  const ensureBoneAutoResetConfig = (handle, boneName) => {
    const store = getAutoResetStore(handle);
    if (!store) return null;
    if (!store.configs[boneName]) {
      store.configs[boneName] = createDefaultAutoResetConfig();
    }
    return store.configs[boneName];
  };

  const getBoneAutoResetChannelConfig = (handle, boneName, type) => {
    const normalizedType = normalizeAutoResetType(type);
    if (!normalizedType) return null;
    const config = ensureBoneAutoResetConfig(handle, boneName);
    return config ? config[normalizedType] : null;
  };

  const ensureBoneAutoResetState = (handle, boneName) => {
    const store = getAutoResetStore(handle);
    if (!store) return null;
    if (!store.states[boneName]) {
      store.states[boneName] = {
        position: {
          active: false,
          elapsed: 0,
          delay: 0,
          duration: 0,
          progress: 0,
          start: null,
          target: null,
        },
        rotation: {
          active: false,
          elapsed: 0,
          delay: 0,
          duration: 0,
          progress: 0,
          start: null,
          target: null,
        },
        scale: {
          active: false,
          elapsed: 0,
          delay: 0,
          duration: 0,
          progress: 0,
          start: null,
          target: null,
        },
      };
    }
    return store.states[boneName];
  };

  const cleanupBoneAutoResetState = (handle, boneName) => {
    const store = getAutoResetStore(handle);
    if (!store || !store.states[boneName]) return;
    const state = store.states[boneName];
    if (
      !state.position.active &&
      !state.rotation.active &&
      !state.scale.active
    ) {
      delete store.states[boneName];
    }
  };

  const readBoneChannelValues = (bone, type) => {
    if (!bone || !bone.pose) return null;
    const normalizedType = normalizeAutoResetType(type);
    if (normalizedType === 'position') {
      return { x: bone.pose.x, y: bone.pose.y };
    }
    if (normalizedType === 'rotation') {
      return { rotation: bone.pose.rotation };
    }
    if (normalizedType === 'scale') {
      return { scaleX: bone.pose.scaleX, scaleY: bone.pose.scaleY };
    }
    return null;
  };

  const readOverrideChannelValues = (override, type) => {
    if (!override) return null;
    const normalizedType = normalizeAutoResetType(type);
    if (normalizedType === 'position') {
      return { x: override.x, y: override.y };
    }
    if (normalizedType === 'rotation') {
      return { rotation: override.rotation };
    }
    if (normalizedType === 'scale') {
      return { scaleX: override.scaleX, scaleY: override.scaleY };
    }
    return null;
  };

  const applyChannelValues = (bone, override, type, values) => {
    if (!bone || !bone.pose || !override || !values) return;
    const normalizedType = normalizeAutoResetType(type);
    if (normalizedType === 'position') {
      bone.pose.x = values.x;
      bone.pose.y = values.y;
      override.x = values.x;
      override.y = values.y;
    } else if (normalizedType === 'rotation') {
      bone.pose.rotation = values.rotation;
      override.rotation = values.rotation;
    } else if (normalizedType === 'scale') {
      bone.pose.scaleX = values.scaleX;
      bone.pose.scaleY = values.scaleY;
      override.scaleX = values.scaleX;
      override.scaleY = values.scaleY;
    }
  };

  const clearChannelOverrideValues = (override, type) => {
    if (!override) return;
    const normalizedType = normalizeAutoResetType(type);
    if (normalizedType === 'position') {
      delete override.x;
      delete override.y;
    } else if (normalizedType === 'rotation') {
      delete override.rotation;
    } else if (normalizedType === 'scale') {
      delete override.scaleX;
      delete override.scaleY;
    }
  };

  const clearBoneAutoResetState = (handle, boneName, type) => {
    const normalizedType = normalizeAutoResetType(type);
    const store = getAutoResetStore(handle);
    if (!store) return;
    const names = boneName ? [boneName] : Object.keys(store.states);
    for (const name of names) {
      const state = store.states[name];
      if (!state) continue;
      const clearTypes = normalizedType
        ? [normalizedType]
        : Object.keys(AUTO_RESET_TYPES);
      for (const entryType of clearTypes) {
        state[entryType] = {
          active: false,
          elapsed: 0,
          delay: 0,
          duration: 0,
          progress: 0,
          start: null,
          target: null,
        };
      }
      cleanupBoneAutoResetState(handle, name);
    }
  };

  const configureBoneAutoReset = (
    handle,
    boneNamesValue,
    type,
    enabled,
    delay,
    duration
  ) => {
    const normalizedType = normalizeAutoResetType(type);
    if (!handle || !normalizedType) return false;
    const boneNames = expandBoneNameList(handle, boneNamesValue);
    if (!boneNames.length) return false;
    const enabledValue = !!enabled;
    const delayValue = Math.max(0, Number(delay) || 0);
    const durationValue = Math.max(0, Number(duration) || 0);
    for (const boneName of boneNames) {
      const config = getBoneAutoResetChannelConfig(
        handle,
        boneName,
        normalizedType
      );
      if (!config) continue;
      config.enabled = enabledValue;
      config.delay = delayValue;
      config.duration = durationValue;
      if (!enabledValue) {
        clearBoneAutoResetState(handle, boneName, normalizedType);
      }
    }
    return true;
  };

  const scheduleBoneAutoReset = (handle, boneName, type, targetValues) => {
    const normalizedType = normalizeAutoResetType(type);
    if (!handle || !boneName || !normalizedType || !targetValues) return;
    const config = getBoneAutoResetChannelConfig(
      handle,
      boneName,
      normalizedType
    );
    if (!config || !config.enabled) return;
    const bone = getBone(handle, boneName);
    if (!bone || !bone.pose) return;
    const override = getBoneOverride(handle, boneName);
    const state = ensureBoneAutoResetState(handle, boneName);
    const channel = state ? state[normalizedType] : null;
    if (!override || !channel) return;
    const currentValues =
      readOverrideChannelValues(override, normalizedType) ||
      readBoneChannelValues(bone, normalizedType);
    if (!channel.target) {
      channel.target = { ...targetValues };
    }
    channel.start = currentValues ? { ...currentValues } : { ...targetValues };
    channel.elapsed = 0;
    channel.delay = Math.max(0, Number(config.delay) || 0);
    channel.duration = Math.max(0, Number(config.duration) || 0);
    channel.progress = 0;
    channel.active = true;
  };

  const lerp = (fromValue, toValue, t) => fromValue + (toValue - fromValue) * t;

  const advanceBoneAutoReset = (handle, deltaTime) => {
    const store = getAutoResetStore(handle);
    if (!store) return false;
    const delta = Math.max(0, Number(deltaTime) || 0);
    if (delta <= 0) return false;
    let changed = false;
    for (const boneName of Object.keys(store.states)) {
      const state = store.states[boneName];
      const bone = getBone(handle, boneName);
      if (!state || !bone || !bone.pose) {
        delete store.states[boneName];
        continue;
      }
      const override = getBoneOverride(handle, boneName);
      for (const type of Object.keys(AUTO_RESET_TYPES)) {
        const channel = state[type];
        if (!channel || !channel.active || !channel.target || !channel.start)
          continue;
        const config = getBoneAutoResetChannelConfig(handle, boneName, type);
        if (!config || !config.enabled) {
          channel.active = false;
          continue;
        }
        channel.elapsed += delta;
        if (channel.elapsed < channel.delay) {
          channel.progress = 0;
          continue;
        }
        const duration = Math.max(0, Number(channel.duration) || 0);
        const t =
          duration <= 0
            ? 1
            : Math.max(
                0,
                Math.min(1, (channel.elapsed - channel.delay) / duration)
              );
        if (type === 'position') {
          applyChannelValues(bone, override, type, {
            x: lerp(channel.start.x, channel.target.x, t),
            y: lerp(channel.start.y, channel.target.y, t),
          });
        } else if (type === 'rotation') {
          applyChannelValues(bone, override, type, {
            rotation: lerp(channel.start.rotation, channel.target.rotation, t),
          });
        } else if (type === 'scale') {
          applyChannelValues(bone, override, type, {
            scaleX: lerp(channel.start.scaleX, channel.target.scaleX, t),
            scaleY: lerp(channel.start.scaleY, channel.target.scaleY, t),
          });
        }
        channel.progress = t;
        changed = true;
        if (t >= 1) {
          clearChannelOverrideValues(override, type);
          channel.active = false;
          channel.start = null;
          channel.target = null;
          channel.progress = 1;
          cleanupBoneOverride(handle, boneName);
        }
      }
      cleanupBoneAutoResetState(handle, boneName);
    }
    if (changed) refreshBoneTransforms(handle);
    return changed;
  };

  const isBoneAutoResetActive = (handle, boneName, type) => {
    const normalizedType = normalizeAutoResetType(type);
    if (!normalizedType) return false;
    const store = getAutoResetStore(handle);
    const state =
      store && store.states ? store.states[String(boneName || '')] : null;
    return !!(state && state[normalizedType] && state[normalizedType].active);
  };

  const getBoneAutoResetProgress = (handle, boneName, type) => {
    const normalizedType = normalizeAutoResetType(type);
    if (!normalizedType) return 0;
    const store = getAutoResetStore(handle);
    const state =
      store && store.states ? store.states[String(boneName || '')] : null;
    if (!state || !state[normalizedType]) return 0;
    return Number(state[normalizedType].progress) || 0;
  };

  const updateInstance = (handle, deltaTime) => {
    const object = getDisplayObject(handle);
    if (!object || typeof object.update !== 'function') return;
    if (handle) {
      handle.eventFiredThisFrame = false;
      handle.completedFiredThisFrame = false;
      advanceBoneAutoReset(handle, deltaTime);
    }
    object.update(Math.max(0, Number(deltaTime) || 0));
  };

  const destroyInstance = handle => {
    const object = getDisplayObject(handle);
    if (!object) return;

    try {
      if (object.__customDebugGraphics) {
        if (object.__customDebugGraphics.parent) {
          object.__customDebugGraphics.parent.removeChild(
            object.__customDebugGraphics
          );
        }
        if (typeof object.__customDebugGraphics.destroy === 'function') {
          object.__customDebugGraphics.destroy();
        }
        object.__customDebugGraphics = null;
      }
    } catch (error) {}

    try {
      if (object.parent) object.parent.removeChild(object);
    } catch (error) {}

    try {
      if (typeof object.destroy === 'function') {
        object.destroy({ children: true, texture: false, baseTexture: false });
      }
    } catch (error) {
      try {
        object.destroy();
      } catch (innerError) {}
    }
  };

  const setAnimation = (handle, animationName, loop) => {
    const object = getDisplayObject(handle);
    if (!object || !object.state || !object.state.setAnimation) return false;
    object.state.setAnimation(0, String(animationName || ''), !!loop);
    return true;
  };

  const setAnimationOnTrack = (handle, trackIndex, animationName, loop) => {
    const object = getDisplayObject(handle);
    if (!object || !object.state || !object.state.setAnimation) return false;
    object.state.setAnimation(
      Math.max(0, Number(trackIndex) || 0),
      String(animationName || ''),
      !!loop
    );
    return true;
  };

  const addAnimation = (handle, trackIndex, animationName, loop, delay) => {
    const object = getDisplayObject(handle);
    if (!object || !object.state || !object.state.addAnimation) return false;
    object.state.addAnimation(
      Math.max(0, Number(trackIndex) || 0),
      String(animationName || ''),
      !!loop,
      Number(delay) || 0
    );
    return true;
  };

  const clearTrack = (handle, trackIndex) => {
    const object = getDisplayObject(handle);
    if (!object || !object.state || !object.state.clearTrack) return false;
    object.state.clearTrack(Math.max(0, Number(trackIndex) || 0));
    return true;
  };

  const clearTracks = handle => {
    const object = getDisplayObject(handle);
    if (!object || !object.state || !object.state.clearTracks) return false;
    object.state.clearTracks();
    return true;
  };

  const setSkin = (handle, skinName) => {
    const object = getDisplayObject(handle);
    if (!object || !object.skeleton || !object.skeleton.setSkinByName)
      return false;
    object.skeleton.setSkinByName(String(skinName || ''));
    if (object.skeleton.setSlotsToSetupPose)
      object.skeleton.setSlotsToSetupPose();
    return true;
  };

  const setMix = (handle, mixDuration) => {
    const object = getDisplayObject(handle);
    if (!object || !object.stateData) return false;
    object.stateData.defaultMix = Math.max(0, Number(mixDuration) || 0);
    return true;
  };

  const setVisible = (handle, visible) => {
    const object = getDisplayObject(handle);
    if (!object) return false;
    object.visible = !!visible;
    return true;
  };

  const getCurrentAnimation = handle => {
    const object = getDisplayObject(handle);
    if (!object || !object.state || !object.state.getCurrent) return '';
    const trackEntry = object.state.getCurrent(0);
    const animation =
      trackEntry && trackEntry.animation ? trackEntry.animation : null;
    return animation && animation.name ? String(animation.name) : '';
  };

  const boneExists = (handle, boneName) => !!getBone(handle, boneName);

  const getBoneChildCount = (handle, boneName) => {
    const bone = getBone(handle, boneName);
    if (!bone) return 0;
    if (bone.children && bone.children.length) return bone.children.length || 0;
    const skeleton = getSkeleton(handle);
    if (!skeleton || !Array.isArray(skeleton.bones)) return 0;
    return skeleton.bones.filter(entry => entry && entry.parent === bone)
      .length;
  };

  const getBoneLength = (handle, boneName) => {
    const bone = getBone(handle, boneName);
    if (!bone || !bone.data) return 0;
    return Number(bone.data.length) || 0;
  };

  const getBoneParentName = (handle, boneName) => {
    const bone = getBone(handle, boneName);
    if (!bone) return '';
    if (!bone.parent) return 'ROOT';
    if (!bone.parent.data) return '';
    return String(bone.parent.data.name || '');
  };

  const setBonePosition = (handle, boneName, x, y) => {
    const bone = getBone(handle, boneName);
    if (!bone || !bone.pose) return false;
    const targetValues = readBoneChannelValues(bone, 'position');
    bone.pose.x = toFiniteNumber(x, bone.pose.x);
    bone.pose.y = toFiniteNumber(y, bone.pose.y);
    const overrides = getBoneOverride(handle, boneName);
    if (overrides) {
      overrides.x = bone.pose.x;
      overrides.y = bone.pose.y;
    }
    scheduleBoneAutoReset(handle, boneName, 'position', targetValues);
    refreshBoneTransforms(handle);
    return true;
  };

  const offsetBonePosition = (handle, boneName, deltaX, deltaY) => {
    const bone = getBone(handle, boneName);
    if (!bone || !bone.pose) return false;
    const targetValues = readBoneChannelValues(bone, 'position');
    bone.pose.x += toFiniteNumber(deltaX, 0);
    bone.pose.y += toFiniteNumber(deltaY, 0);
    const overrides = getBoneOverride(handle, boneName);
    if (overrides) {
      overrides.x = bone.pose.x;
      overrides.y = bone.pose.y;
    }
    scheduleBoneAutoReset(handle, boneName, 'position', targetValues);
    refreshBoneTransforms(handle);
    return true;
  };

  const setBoneRotation = (handle, boneName, rotation) => {
    const bone = getBone(handle, boneName);
    if (!bone || !bone.pose) return false;
    const targetValues = readBoneChannelValues(bone, 'rotation');
    bone.pose.rotation = toFiniteNumber(rotation, bone.pose.rotation);
    const overrides = getBoneOverride(handle, boneName);
    if (overrides) {
      overrides.rotation = bone.pose.rotation;
    }
    scheduleBoneAutoReset(handle, boneName, 'rotation', targetValues);
    refreshBoneTransforms(handle);
    return true;
  };

  const offsetBoneRotation = (handle, boneName, deltaRotation) => {
    const bone = getBone(handle, boneName);
    if (!bone || !bone.pose) return false;
    const targetValues = readBoneChannelValues(bone, 'rotation');
    bone.pose.rotation += toFiniteNumber(deltaRotation, 0);
    const overrides = getBoneOverride(handle, boneName);
    if (overrides) {
      overrides.rotation = bone.pose.rotation;
    }
    scheduleBoneAutoReset(handle, boneName, 'rotation', targetValues);
    refreshBoneTransforms(handle);
    return true;
  };

  const setBoneScale = (handle, boneName, scaleX, scaleY) => {
    const bone = getBone(handle, boneName);
    if (!bone || !bone.pose) return false;
    const targetValues = readBoneChannelValues(bone, 'scale');
    bone.pose.scaleX = toFiniteNumber(scaleX, bone.pose.scaleX);
    bone.pose.scaleY = toFiniteNumber(scaleY, bone.pose.scaleY);
    const overrides = getBoneOverride(handle, boneName);
    if (overrides) {
      overrides.scaleX = bone.pose.scaleX;
      overrides.scaleY = bone.pose.scaleY;
    }
    scheduleBoneAutoReset(handle, boneName, 'scale', targetValues);
    refreshBoneTransforms(handle);
    return true;
  };

  const offsetBoneScale = (handle, boneName, deltaScaleX, deltaScaleY) => {
    const bone = getBone(handle, boneName);
    if (!bone || !bone.pose) return false;
    const targetValues = readBoneChannelValues(bone, 'scale');
    bone.pose.scaleX += toFiniteNumber(deltaScaleX, 0);
    bone.pose.scaleY += toFiniteNumber(deltaScaleY, 0);
    const overrides = getBoneOverride(handle, boneName);
    if (overrides) {
      overrides.scaleX = bone.pose.scaleX;
      overrides.scaleY = bone.pose.scaleY;
    }
    scheduleBoneAutoReset(handle, boneName, 'scale', targetValues);
    refreshBoneTransforms(handle);
    return true;
  };

  const getBoneValue = (handle, boneName, fieldName) => {
    const bone = getBone(handle, boneName);
    if (!bone || !bone.pose) return 0;
    const value = bone.pose[fieldName];
    return Number.isFinite(Number(value)) ? Number(value) : 0;
  };

  const getBoneSceneX = (handle, boneName) => {
    ensureWorldTransforms(handle);
    const object = getDisplayObject(handle);
    const bone = getBone(handle, boneName);
    const applied = getAppliedBonePose(bone);
    if (!object || !bone || !applied) return 0;
    const bx = applied.worldX;
    const by = applied.worldY;
    if (object.transform) {
      if (object.transform.updateLocalTransform)
        object.transform.updateLocalTransform();
      const local = object.transform.localTransform;
      if (local) return local.a * bx + local.c * by + local.tx;
    }
    return bx;
  };

  const getBoneSceneY = (handle, boneName) => {
    ensureWorldTransforms(handle);
    const object = getDisplayObject(handle);
    const bone = getBone(handle, boneName);
    const applied = getAppliedBonePose(bone);
    if (!object || !bone || !applied) return 0;
    const bx = applied.worldX;
    const by = applied.worldY;
    if (object.transform) {
      if (object.transform.updateLocalTransform)
        object.transform.updateLocalTransform();
      const local = object.transform.localTransform;
      if (local) return local.b * bx + local.d * by + local.ty;
    }
    return by;
  };

  const getBoneSceneAxis = (handle, boneName) => {
    ensureWorldTransforms(handle);
    const object = getDisplayObject(handle);
    const bone = getBone(handle, boneName);
    const applied = getAppliedBonePose(bone);
    if (!bone || !applied) return null;

    let axisX = applied.a;
    let axisY = applied.c;
    if (object && object.transform) {
      if (object.transform.updateLocalTransform)
        object.transform.updateLocalTransform();
      const local = object.transform.localTransform;
      if (local) {
        axisX = local.a * applied.a + local.c * applied.c;
        axisY = local.b * applied.a + local.d * applied.c;
      }
    }

    const axisLength = Math.hypot(axisX, axisY);
    if (axisLength <= 1e-8) return null;
    return { x: axisX, y: axisY };
  };

  const getBoneSceneRotation = (handle, boneName) => {
    const axis = getBoneSceneAxis(handle, boneName);
    if (!axis) return 0;
    return Math.atan2(axis.y, axis.x) * (180 / Math.PI);
  };

  const getBoneSceneSegment = (handle, boneName) => {
    ensureWorldTransforms(handle);
    const object = getDisplayObject(handle);
    const bone = getBone(handle, boneName);
    const applied = getAppliedBonePose(bone);
    if (!object || !bone || !applied || !bone.data) return null;

    const bx = getBoneSceneX(handle, boneName);
    const by = getBoneSceneY(handle, boneName);

    const tipWorldX = applied.worldX + bone.data.length * applied.a;
    const tipWorldY = applied.worldY + bone.data.length * applied.c;

    let tipX = tipWorldX;
    let tipY = tipWorldY;
    if (object.transform) {
      if (object.transform.updateLocalTransform)
        object.transform.updateLocalTransform();
      const local = object.transform.localTransform;
      if (local) {
        tipX = local.a * tipWorldX + local.c * tipWorldY + local.tx;
        tipY = local.b * tipWorldX + local.d * tipWorldY + local.ty;
      }
    }

    return { bx, by, tipX, tipY };
  };

  const getBoneSceneSegmentData = (handle, boneName) => {
    const segment = getBoneSceneSegment(handle, boneName);
    if (!segment) return null;
    return {
      rootX: segment.bx,
      rootY: segment.by,
      midX: (segment.bx + segment.tipX) / 2,
      midY: (segment.by + segment.tipY) / 2,
      tipX: segment.tipX,
      tipY: segment.tipY,
      length: Math.hypot(segment.tipX - segment.bx, segment.tipY - segment.by),
    };
  };

  const getSlotAttachment = slot => {
    if (!slot) return null;
    if (slot.appliedPose && slot.appliedPose.attachment) {
      return slot.appliedPose.attachment;
    }
    if (typeof slot.getAppliedPose === 'function') {
      try {
        const appliedPose = slot.getAppliedPose();
        if (appliedPose) {
          if (typeof appliedPose.getAttachment === 'function') {
            const attachment = appliedPose.getAttachment();
            if (attachment) return attachment;
          }
          if (appliedPose.attachment) return appliedPose.attachment;
        }
      } catch (error) {}
    }
    if (typeof slot.getPose === 'function') {
      try {
        const pose = slot.getPose();
        if (pose) {
          if (typeof pose.getAttachment === 'function') {
            const attachment = pose.getAttachment();
            if (attachment) return attachment;
          }
          if (pose.attachment) return pose.attachment;
        }
      } catch (error) {}
    }
    if (typeof slot.getAttachment === 'function') {
      const attachment = slot.getAttachment();
      if (attachment) return attachment;
    }
    return slot.attachment || null;
  };

  const getAttachmentWorldVertices = (attachment, slot, skeleton) => {
    if (
      !attachment ||
      !slot ||
      typeof attachment.computeWorldVertices !== 'function'
    )
      return [];
    const slotPose =
      slot.appliedPose ||
      (typeof slot.getAppliedPose === 'function'
        ? slot.getAppliedPose()
        : null) ||
      slot.pose ||
      null;
    let regionOffsets = null;
    if (typeof attachment.getOffsets === 'function') {
      try {
        const offsets = attachment.getOffsets(slotPose);
        if (offsets && typeof offsets.length === 'number')
          regionOffsets = offsets;
      } catch (error) {}
    }
    const fallbackVertexCount =
      Math.max(
        0,
        regionOffsets && typeof regionOffsets.length === 'number'
          ? regionOffsets.length
          : 0,
        Number(attachment.worldVerticesLength) || 0,
        Array.isArray(attachment.offset) ? attachment.offset.length : 0,
        Array.isArray(attachment.vertices) ? attachment.vertices.length : 0,
        attachment.regionUVs && typeof attachment.regionUVs.length === 'number'
          ? attachment.regionUVs.length
          : 0,
        attachment.uvs && typeof attachment.uvs.length === 'number'
          ? attachment.uvs.length
          : 0
      ) || 8;
    const output = new Float32Array(fallbackVertexCount);
    const invocations = [];
    if (regionOffsets && typeof regionOffsets.length === 'number') {
      invocations.push(() =>
        attachment.computeWorldVertices(slot, regionOffsets, output, 0, 2)
      );
    }
    if (skeleton) {
      invocations.push(() =>
        attachment.computeWorldVertices(
          skeleton,
          slot,
          0,
          fallbackVertexCount,
          output,
          0,
          2
        )
      );
    }
    invocations.push(
      () =>
        attachment.computeWorldVertices(
          slot,
          0,
          fallbackVertexCount,
          output,
          0,
          2
        ),
      () => attachment.computeWorldVertices(slot, output, 0, 2),
      () => attachment.computeWorldVertices(slot.bone || slot, output, 0, 2),
      () => attachment.computeWorldVertices(slot, output),
      () => attachment.computeWorldVertices(slot.bone || slot, output)
    );
    for (const invoke of invocations) {
      try {
        invoke();
        return Array.from(output);
      } catch (error) {}
    }
    return [];
  };

  const getAttachmentTriangleIndices = (attachment, worldVertices) => {
    if (!attachment) return [];
    if (
      attachment.triangles &&
      typeof attachment.triangles.length === 'number'
    ) {
      return Array.from(attachment.triangles);
    }
    const vertexCount = Math.floor(
      (worldVertices && worldVertices.length ? worldVertices.length : 0) / 2
    );
    if (vertexCount < 3) return [];
    if (vertexCount === 4) return [0, 1, 2, 2, 3, 0];
    const indices = [];
    for (let index = 1; index < vertexCount - 1; index++) {
      indices.push(0, index, index + 1);
    }
    return indices;
  };

  const getSceneAttachmentTriangles = handle => {
    ensureWorldTransforms(handle);
    const object = getDisplayObject(handle);
    const skeleton = getSkeleton(handle);
    if (!object || !skeleton) return { triangles: [], bounds: null };
    const slots =
      Array.isArray(skeleton.drawOrder) && skeleton.drawOrder.length
        ? skeleton.drawOrder
        : skeleton.slots;
    if (!Array.isArray(slots) || !slots.length)
      return { triangles: [], bounds: null };
    const triangles = [];
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    for (const slot of slots) {
      if (!slot) continue;
      const attachment = getSlotAttachment(slot);
      if (!attachment) continue;
      const worldVertices = getAttachmentWorldVertices(
        attachment,
        slot,
        skeleton
      );
      if (!worldVertices.length || worldVertices.length < 6) continue;
      const indices = getAttachmentTriangleIndices(attachment, worldVertices);
      if (!indices.length) continue;
      for (let index = 0; index + 2 < indices.length; index += 3) {
        const ia = Number(indices[index]) * 2;
        const ib = Number(indices[index + 1]) * 2;
        const ic = Number(indices[index + 2]) * 2;
        if (
          ia < 0 ||
          ib < 0 ||
          ic < 0 ||
          ia + 1 >= worldVertices.length ||
          ib + 1 >= worldVertices.length ||
          ic + 1 >= worldVertices.length
        ) {
          continue;
        }
        const a = containerLocalToScenePoint(
          object,
          worldVertices[ia],
          worldVertices[ia + 1]
        );
        const b = containerLocalToScenePoint(
          object,
          worldVertices[ib],
          worldVertices[ib + 1]
        );
        const c = containerLocalToScenePoint(
          object,
          worldVertices[ic],
          worldVertices[ic + 1]
        );
        const triMinX = Math.min(a.x, b.x, c.x);
        const triMinY = Math.min(a.y, b.y, c.y);
        const triMaxX = Math.max(a.x, b.x, c.x);
        const triMaxY = Math.max(a.y, b.y, c.y);
        minX = Math.min(minX, triMinX);
        minY = Math.min(minY, triMinY);
        maxX = Math.max(maxX, triMaxX);
        maxY = Math.max(maxY, triMaxY);
        triangles.push({
          ax: a.x,
          ay: a.y,
          bx: b.x,
          by: b.y,
          cx: c.x,
          cy: c.y,
          minX: triMinX,
          minY: triMinY,
          maxX: triMaxX,
          maxY: triMaxY,
          slotName:
            slot && slot.data && slot.data.name ? String(slot.data.name) : '',
          attachmentName:
            attachment && attachment.name ? String(attachment.name) : '',
        });
      }
    }

    return {
      triangles,
      bounds: triangles.length
        ? { left: minX, top: minY, right: maxX, bottom: maxY }
        : null,
    };
  };

  const isValidSceneBounds = bounds =>
    !!(
      bounds &&
      Number.isFinite(bounds.left) &&
      Number.isFinite(bounds.top) &&
      Number.isFinite(bounds.right) &&
      Number.isFinite(bounds.bottom) &&
      bounds.right > bounds.left &&
      bounds.bottom > bounds.top
    );

  const getSceneBoundsArea = bounds =>
    isValidSceneBounds(bounds)
      ? Math.abs(bounds.right - bounds.left) *
        Math.abs(bounds.bottom - bounds.top)
      : 0;

  const chooseSceneBounds = (attachmentBounds, containerBounds) => {
    if (!isValidSceneBounds(attachmentBounds)) {
      return isValidSceneBounds(containerBounds) ? containerBounds : null;
    }
    if (!isValidSceneBounds(containerBounds)) return attachmentBounds;

    const attachmentArea = getSceneBoundsArea(attachmentBounds);
    const containerArea = getSceneBoundsArea(containerBounds);
    return containerArea > attachmentArea * 1.25
      ? containerBounds
      : attachmentBounds;
  };

  const getSceneAttachmentBounds = handle => {
    const meshData = getSceneAttachmentTriangles(handle);
    const attachmentBounds =
      meshData && isValidSceneBounds(meshData.bounds) ? meshData.bounds : null;

    ensureWorldTransforms(handle);
    const object = getDisplayObject(handle);
    if (!object || !object.getLocalBounds) return attachmentBounds;

    try {
      const localBounds = object.getLocalBounds();
      if (
        localBounds &&
        Number.isFinite(localBounds.x) &&
        Number.isFinite(localBounds.y) &&
        Number.isFinite(localBounds.width) &&
        Number.isFinite(localBounds.height) &&
        localBounds.width > 0 &&
        localBounds.height > 0
      ) {
        const topLeft = containerLocalToScenePoint(
          object,
          localBounds.x,
          localBounds.y
        );
        const topRight = containerLocalToScenePoint(
          object,
          localBounds.x + localBounds.width,
          localBounds.y
        );
        const bottomLeft = containerLocalToScenePoint(
          object,
          localBounds.x,
          localBounds.y + localBounds.height
        );
        const bottomRight = containerLocalToScenePoint(
          object,
          localBounds.x + localBounds.width,
          localBounds.y + localBounds.height
        );
        const containerBounds = {
          left: Math.min(topLeft.x, topRight.x, bottomLeft.x, bottomRight.x),
          top: Math.min(topLeft.y, topRight.y, bottomLeft.y, bottomRight.y),
          right: Math.max(topLeft.x, topRight.x, bottomLeft.x, bottomRight.x),
          bottom: Math.max(topLeft.y, topRight.y, bottomLeft.y, bottomRight.y),
        };
        return chooseSceneBounds(attachmentBounds, containerBounds);
      }
    } catch (error) {}

    return attachmentBounds;
  };

  const pointInRect = (x, y, left, top, right, bottom) =>
    x >= left && x <= right && y >= top && y <= bottom;

  const pointInTriangle = (px, py, ax, ay, bx, by, cx, cy) => {
    const v0x = cx - ax;
    const v0y = cy - ay;
    const v1x = bx - ax;
    const v1y = by - ay;
    const v2x = px - ax;
    const v2y = py - ay;
    const dot00 = v0x * v0x + v0y * v0y;
    const dot01 = v0x * v1x + v0y * v1y;
    const dot02 = v0x * v2x + v0y * v2y;
    const dot11 = v1x * v1x + v1y * v1y;
    const dot12 = v1x * v2x + v1y * v2y;
    const denom = dot00 * dot11 - dot01 * dot01;
    if (Math.abs(denom) <= 1e-8) return false;
    const invDenom = 1 / denom;
    const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
    const v = (dot00 * dot12 - dot01 * dot02) * invDenom;
    return u >= 0 && v >= 0 && u + v <= 1;
  };

  const segmentsIntersect = (ax, ay, bx, by, cx, cy, dx, dy) => {
    const abx = bx - ax;
    const aby = by - ay;
    const cdx = dx - cx;
    const cdy = dy - cy;
    const denom = abx * cdy - aby * cdx;
    const acx = cx - ax;
    const acy = cy - ay;
    if (Math.abs(denom) <= 1e-8) return false;
    const t = (acx * cdy - acy * cdx) / denom;
    const u = (acx * aby - acy * abx) / denom;
    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
  };

  const triangleIntersectsRect = (triangle, left, top, right, bottom) => {
    if (!triangle) return false;
    if (
      triangle.maxX < left ||
      triangle.minX > right ||
      triangle.maxY < top ||
      triangle.minY > bottom
    )
      return false;
    if (
      pointInRect(triangle.ax, triangle.ay, left, top, right, bottom) ||
      pointInRect(triangle.bx, triangle.by, left, top, right, bottom) ||
      pointInRect(triangle.cx, triangle.cy, left, top, right, bottom)
    ) {
      return true;
    }
    if (
      pointInTriangle(
        left,
        top,
        triangle.ax,
        triangle.ay,
        triangle.bx,
        triangle.by,
        triangle.cx,
        triangle.cy
      ) ||
      pointInTriangle(
        right,
        top,
        triangle.ax,
        triangle.ay,
        triangle.bx,
        triangle.by,
        triangle.cx,
        triangle.cy
      ) ||
      pointInTriangle(
        left,
        bottom,
        triangle.ax,
        triangle.ay,
        triangle.bx,
        triangle.by,
        triangle.cx,
        triangle.cy
      ) ||
      pointInTriangle(
        right,
        bottom,
        triangle.ax,
        triangle.ay,
        triangle.bx,
        triangle.by,
        triangle.cx,
        triangle.cy
      )
    ) {
      return true;
    }
    const rectEdges = [
      [left, top, right, top],
      [right, top, right, bottom],
      [right, bottom, left, bottom],
      [left, bottom, left, top],
    ];
    const triEdges = [
      [triangle.ax, triangle.ay, triangle.bx, triangle.by],
      [triangle.bx, triangle.by, triangle.cx, triangle.cy],
      [triangle.cx, triangle.cy, triangle.ax, triangle.ay],
    ];
    for (const triEdge of triEdges) {
      for (const rectEdge of rectEdges) {
        if (
          segmentsIntersect(
            triEdge[0],
            triEdge[1],
            triEdge[2],
            triEdge[3],
            rectEdge[0],
            rectEdge[1],
            rectEdge[2],
            rectEdge[3]
          )
        ) {
          return true;
        }
      }
    }
    return false;
  };

  const translateTriangle = (triangle, deltaX, deltaY) => ({
    ax: triangle.ax + deltaX,
    ay: triangle.ay + deltaY,
    bx: triangle.bx + deltaX,
    by: triangle.by + deltaY,
    cx: triangle.cx + deltaX,
    cy: triangle.cy + deltaY,
    minX: triangle.minX + deltaX,
    minY: triangle.minY + deltaY,
    maxX: triangle.maxX + deltaX,
    maxY: triangle.maxY + deltaY,
    slotName: triangle.slotName,
    attachmentName: triangle.attachmentName,
  });

  const getTrianglesBounds = triangles => {
    if (!Array.isArray(triangles) || !triangles.length) return null;
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    for (const triangle of triangles) {
      minX = Math.min(minX, triangle.minX);
      minY = Math.min(minY, triangle.minY);
      maxX = Math.max(maxX, triangle.maxX);
      maxY = Math.max(maxY, triangle.maxY);
    }
    return { minX, minY, maxX, maxY };
  };

  const getTrianglesIntersectingRect = (
    triangles,
    left,
    top,
    right,
    bottom
  ) => {
    if (!Array.isArray(triangles) || !triangles.length) return [];
    return triangles.filter(triangle =>
      triangleIntersectsRect(triangle, left, top, right, bottom)
    );
  };

  const normalizeBlockerCollisionMode = value => {
    const text = String(value || '')
      .trim()
      .toLowerCase();
    if (
      text === 'imagepixels' ||
      text === 'pixel' ||
      text === 'pixels' ||
      text === 'image' ||
      text === '图像像素模式' ||
      text === '像素' ||
      text === '像素模式'
    ) {
      return 'ImagePixels';
    }
    return 'CollisionMask';
  };

  const getBlockerBounds = blocker => {
    const pixelBounds =
      blocker && blocker.pixelCollision && blocker.pixelCollision.bounds;
    if (pixelBounds) {
      return {
        left: Math.min(
          toFiniteNumber(pixelBounds.left, 0),
          toFiniteNumber(pixelBounds.right, 0)
        ),
        top: Math.min(
          toFiniteNumber(pixelBounds.top, 0),
          toFiniteNumber(pixelBounds.bottom, 0)
        ),
        right: Math.max(
          toFiniteNumber(pixelBounds.left, 0),
          toFiniteNumber(pixelBounds.right, 0)
        ),
        bottom: Math.max(
          toFiniteNumber(pixelBounds.top, 0),
          toFiniteNumber(pixelBounds.bottom, 0)
        ),
      };
    }
    return {
      left: Math.min(
        toFiniteNumber(blocker && blocker.left, 0),
        toFiniteNumber(blocker && blocker.right, 0)
      ),
      top: Math.min(
        toFiniteNumber(blocker && blocker.top, 0),
        toFiniteNumber(blocker && blocker.bottom, 0)
      ),
      right: Math.max(
        toFiniteNumber(blocker && blocker.left, 0),
        toFiniteNumber(blocker && blocker.right, 0)
      ),
      bottom: Math.max(
        toFiniteNumber(blocker && blocker.top, 0),
        toFiniteNumber(blocker && blocker.bottom, 0)
      ),
    };
  };

  const getPixelCollisionRowBounds = (pixelCollision, rowIndex) => {
    if (!pixelCollision || !pixelCollision.bounds) return null;
    const bounds = pixelCollision.bounds;
    const height = Math.max(
      1,
      Math.floor(toFiniteNumber(pixelCollision.height, 0))
    );
    const sceneHeight = bounds.bottom - bounds.top;
    if (sceneHeight <= 1e-8) return null;
    const flipY = !!pixelCollision.flipY;
    const startRatio = flipY
      ? (height - (rowIndex + 1)) / height
      : rowIndex / height;
    const endRatio = flipY
      ? (height - rowIndex) / height
      : (rowIndex + 1) / height;
    return {
      top: bounds.top + sceneHeight * startRatio,
      bottom: bounds.top + sceneHeight * endRatio,
    };
  };

  const getPixelCollisionSpanBounds = (
    pixelCollision,
    rowIndex,
    startColumn,
    endColumn
  ) => {
    if (!pixelCollision || !pixelCollision.bounds) return null;
    const bounds = pixelCollision.bounds;
    const width = Math.max(
      1,
      Math.floor(toFiniteNumber(pixelCollision.width, 0))
    );
    const sceneWidth = bounds.right - bounds.left;
    if (sceneWidth <= 1e-8) return null;
    const flipX = !!pixelCollision.flipX;
    const startRatio = flipX
      ? (width - endColumn) / width
      : startColumn / width;
    const endRatio = flipX ? (width - startColumn) / width : endColumn / width;
    const rowBounds = getPixelCollisionRowBounds(pixelCollision, rowIndex);
    if (!rowBounds) return null;
    return {
      left: bounds.left + sceneWidth * startRatio,
      top: rowBounds.top,
      right: bounds.left + sceneWidth * endRatio,
      bottom: rowBounds.bottom,
    };
  };

  const triangleIntersectsPixelCollision = (
    triangle,
    pixelCollision,
    left,
    top,
    right,
    bottom
  ) => {
    if (
      !triangle ||
      !pixelCollision ||
      !pixelCollision.bounds ||
      !Array.isArray(pixelCollision.rows)
    )
      return false;
    const bounds = pixelCollision.bounds;
    const width = Math.max(
      1,
      Math.floor(toFiniteNumber(pixelCollision.width, 0))
    );
    const height = Math.max(
      1,
      Math.floor(toFiniteNumber(pixelCollision.height, 0))
    );
    const sceneWidth = bounds.right - bounds.left;
    const sceneHeight = bounds.bottom - bounds.top;
    if (sceneWidth <= 1e-8 || sceneHeight <= 1e-8) return false;
    if (
      triangle.maxX < left ||
      triangle.minX > right ||
      triangle.maxY < top ||
      triangle.minY > bottom
    )
      return false;
    const rowStart = Math.max(
      0,
      Math.floor(
        ((Math.max(triangle.minY, top) - bounds.top) / sceneHeight) * height
      )
    );
    const rowEnd = Math.min(
      height - 1,
      Math.floor(
        ((Math.min(triangle.maxY, bottom) - bounds.top) / sceneHeight) * height
      )
    );
    for (let rowIndex = rowStart; rowIndex <= rowEnd; rowIndex++) {
      const spans = pixelCollision.rows[rowIndex];
      if (!Array.isArray(spans) || !spans.length) continue;
      const rowBounds = getPixelCollisionRowBounds(pixelCollision, rowIndex);
      if (
        !rowBounds ||
        rowBounds.bottom < triangle.minY ||
        rowBounds.top > triangle.maxY
      )
        continue;
      for (const span of spans) {
        if (!Array.isArray(span) || span.length < 2) continue;
        const spanBounds = getPixelCollisionSpanBounds(
          pixelCollision,
          rowIndex,
          span[0],
          span[1]
        );
        if (!spanBounds) continue;
        if (spanBounds.right < triangle.minX || spanBounds.left > triangle.maxX)
          continue;
        if (
          triangleIntersectsRect(
            triangle,
            spanBounds.left,
            spanBounds.top,
            spanBounds.right,
            spanBounds.bottom
          )
        ) {
          return true;
        }
      }
    }
    return false;
  };

  const getTrianglesIntersectingBlocker = (
    triangles,
    blocker,
    left,
    top,
    right,
    bottom
  ) => {
    if (!Array.isArray(triangles) || !triangles.length) return [];
    const collisionMode = normalizeBlockerCollisionMode(
      blocker && blocker.collisionMode
    );
    if (
      collisionMode !== 'ImagePixels' ||
      !blocker ||
      !blocker.pixelCollision
    ) {
      return getTrianglesIntersectingRect(triangles, left, top, right, bottom);
    }
    return triangles.filter(triangle =>
      triangleIntersectsPixelCollision(
        triangle,
        blocker.pixelCollision,
        left,
        top,
        right,
        bottom
      )
    );
  };

  const resolvePixelBlockerAxis = (
    axis,
    previousAxisValue,
    targetAxisValue,
    otherAxisValue,
    blocker,
    rectLeft,
    rectTop,
    rectRight,
    rectBottom,
    getShiftedTriangles
  ) => {
    const delta = targetAxisValue - previousAxisValue;
    if (Math.abs(delta) <= 1e-8) return null;
    const intersectsAt = axisValue => {
      const triangles =
        axis === 'x'
          ? getShiftedTriangles(axisValue, otherAxisValue)
          : getShiftedTriangles(otherAxisValue, axisValue);
      return (
        getTrianglesIntersectingBlocker(
          triangles,
          blocker,
          rectLeft,
          rectTop,
          rectRight,
          rectBottom
        ).length > 0
      );
    };
    if (!intersectsAt(targetAxisValue)) return null;
    let safeT = intersectsAt(previousAxisValue) ? null : 0;
    if (safeT === null) {
      for (let sampleIndex = 7; sampleIndex >= 0; sampleIndex--) {
        const sampleT = sampleIndex / 8;
        const sampleValue = previousAxisValue + delta * sampleT;
        if (!intersectsAt(sampleValue)) {
          safeT = sampleT;
          break;
        }
      }
    }
    if (safeT === null) {
      return {
        axisValue: previousAxisValue,
        normalX: axis === 'x' ? (delta > 0 ? -1 : 1) : 0,
        normalY: axis === 'y' ? (delta > 0 ? -1 : 1) : 0,
      };
    }
    let hitT = 1;
    for (let iteration = 0; iteration < 12; iteration++) {
      const middleT = (safeT + hitT) / 2;
      const sampleValue = previousAxisValue + delta * middleT;
      if (intersectsAt(sampleValue)) hitT = middleT;
      else safeT = middleT;
    }
    const safeValue = previousAxisValue + delta * safeT;
    return {
      axisValue: safeValue,
      normalX: axis === 'x' ? (delta > 0 ? -1 : 1) : 0,
      normalY: axis === 'y' ? (delta > 0 ? -1 : 1) : 0,
    };
  };

  const normalizeBlockerSurfaceType = value => {
    const text = String(value || '')
      .trim()
      .toLowerCase();
    if (
      text === 'slopeupright' ||
      text === 'up-right' ||
      text === 'upright' ||
      text === '右上坡'
    )
      return 'SlopeUpRight';
    if (
      text === 'slopeupleft' ||
      text === 'up-left' ||
      text === 'upleft' ||
      text === '左上坡'
    )
      return 'SlopeUpLeft';
    return 'Solid';
  };

  const getSlopeBlockerProfile = blocker => {
    const surfaceType = normalizeBlockerSurfaceType(
      blocker && blocker.surfaceType
    );
    if (surfaceType === 'Solid') return null;
    const left = Math.min(
      toFiniteNumber(blocker && blocker.left, 0),
      toFiniteNumber(blocker && blocker.right, 0)
    );
    const top = Math.min(
      toFiniteNumber(blocker && blocker.top, 0),
      toFiniteNumber(blocker && blocker.bottom, 0)
    );
    const right = Math.max(
      toFiniteNumber(blocker && blocker.left, 0),
      toFiniteNumber(blocker && blocker.right, 0)
    );
    const bottom = Math.max(
      toFiniteNumber(blocker && blocker.top, 0),
      toFiniteNumber(blocker && blocker.bottom, 0)
    );
    if (right - left <= 1e-8 || bottom - top <= 1e-8) return null;
    const y1 = surfaceType === 'SlopeUpRight' ? bottom : top;
    const y2 = surfaceType === 'SlopeUpRight' ? top : bottom;
    const autoAngle =
      Math.atan2(Math.abs(y2 - y1), Math.abs(right - left)) * (180 / Math.PI);
    const configuredAngle = Math.abs(
      toFiniteNumber(blocker && blocker.surfaceAngle, 0)
    );
    return {
      type: surfaceType,
      left,
      top,
      right,
      bottom,
      y1,
      y2,
      angle: configuredAngle > 0 ? configuredAngle : autoAngle,
      snapDistance: Math.max(
        0,
        toFiniteNumber(blocker && blocker.surfaceSnapDistance, 0)
      ),
      speedScale: Math.max(
        0.05,
        toFiniteNumber(blocker && blocker.surfaceSpeedScale, 1)
      ),
      gripStrength: Math.max(
        0,
        Math.min(1, toFiniteNumber(blocker && blocker.surfaceGripStrength, 1))
      ),
      objectName: blocker && blocker.name ? String(blocker.name) : '',
    };
  };

  const getSlopeSurfaceY = (profile, x) => {
    if (!profile) return 0;
    const width = profile.right - profile.left;
    if (width <= 1e-8) return profile.bottom;
    const t = Math.max(0, Math.min(1, (x - profile.left) / width));
    return profile.y1 + (profile.y2 - profile.y1) * t;
  };

  const getSlopeSurfaceNormal = profile => {
    if (!profile) return { x: 0, y: -1 };
    const dx = profile.right - profile.left;
    const dy = profile.y2 - profile.y1;
    const length = Math.hypot(dx, dy);
    if (length <= 1e-8) return { x: 0, y: -1 };
    return { x: -dy / length, y: dx / length };
  };

  const resolveSlopeContact = (
    profile,
    currentBounds,
    previousBounds,
    deltaX,
    deltaY,
    options
  ) => {
    if (!profile || !currentBounds) return null;
    const overlapLeft = Math.max(currentBounds.minX, profile.left);
    const overlapRight = Math.min(currentBounds.maxX, profile.right);
    if (overlapRight < overlapLeft) return null;
    const footX =
      deltaX > 1e-8
        ? overlapRight
        : deltaX < -1e-8
        ? overlapLeft
        : (overlapLeft + overlapRight) / 2;
    const surfaceY = getSlopeSurfaceY(profile, footX);
    const currentBottom = currentBounds.maxY;
    const previousBottom = previousBounds ? previousBounds.maxY : currentBottom;
    const maxWalkableAngle = Math.max(
      0,
      toFiniteNumber(options && options.maxWalkableAngle, 60)
    );
    const snapDistance =
      Math.max(0, toFiniteNumber(options && options.snapDistance, 0)) +
      profile.snapDistance;
    const allowedPenetration = Math.max(snapDistance, 4);
    if (currentBottom < surfaceY - snapDistance) return null;
    if (previousBottom > surfaceY + allowedPenetration && deltaY < -1e-8)
      return null;
    const walkable = profile.angle <= maxWalkableAngle + 1e-8;
    if (!walkable) {
      return {
        walkable: false,
        contactType: 'steep-slope',
        slopeAngle: profile.angle,
        speedScale: profile.speedScale,
        gripStrength: profile.gripStrength,
        objectName: profile.objectName,
      };
    }
    return {
      walkable: true,
      contactType: 'slope',
      correctionY: surfaceY - currentBottom,
      surfaceY,
      footX,
      normal: getSlopeSurfaceNormal(profile),
      slopeAngle: profile.angle,
      speedScale: profile.speedScale,
      gripStrength: profile.gripStrength,
      objectName: profile.objectName,
      skipSolidCollision: true,
      stableGrounded: currentBottom >= surfaceY - snapDistance,
    };
  };

  const segmentIntersectsRect = (x1, y1, x2, y2, left, top, right, bottom) => {
    if (
      pointInRect(x1, y1, left, top, right, bottom) ||
      pointInRect(x2, y2, left, top, right, bottom)
    ) {
      return true;
    }
    const dx = x2 - x1;
    const dy = y2 - y1;
    let t0 = 0;
    let t1 = 1;
    const clip = (p, q) => {
      if (p === 0) return q >= 0;
      const r = q / p;
      if (p < 0) {
        if (r > t1) return false;
        if (r > t0) t0 = r;
      } else {
        if (r < t0) return false;
        if (r < t1) t1 = r;
      }
      return true;
    };
    return (
      clip(-dx, x1 - left) &&
      clip(dx, right - x1) &&
      clip(-dy, y1 - top) &&
      clip(dy, bottom - y1) &&
      t1 >= t0
    );
  };

  const squaredDistancePointToRect = (x, y, left, top, right, bottom) => {
    const cx = Math.max(left, Math.min(right, x));
    const cy = Math.max(top, Math.min(bottom, y));
    const dx = x - cx;
    const dy = y - cy;
    return dx * dx + dy * dy;
  };

  const squaredDistancePointToSegment = (px, py, x1, y1, x2, y2) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const l2 = dx * dx + dy * dy;
    if (l2 === 0) {
      const sx = px - x1;
      const sy = py - y1;
      return sx * sx + sy * sy;
    }
    let t = ((px - x1) * dx + (py - y1) * dy) / l2;
    t = Math.max(0, Math.min(1, t));
    const projX = x1 + t * dx;
    const projY = y1 + t * dy;
    const diffX = px - projX;
    const diffY = py - projY;
    return diffX * diffX + diffY * diffY;
  };

  const squaredDistanceSegmentToRect = (
    x1,
    y1,
    x2,
    y2,
    left,
    top,
    right,
    bottom
  ) => {
    if (segmentIntersectsRect(x1, y1, x2, y2, left, top, right, bottom))
      return 0;
    let minSq = Math.min(
      squaredDistancePointToRect(x1, y1, left, top, right, bottom),
      squaredDistancePointToRect(x2, y2, left, top, right, bottom)
    );
    minSq = Math.min(
      minSq,
      squaredDistancePointToSegment(left, top, x1, y1, x2, y2)
    );
    minSq = Math.min(
      minSq,
      squaredDistancePointToSegment(right, top, x1, y1, x2, y2)
    );
    minSq = Math.min(
      minSq,
      squaredDistancePointToSegment(left, bottom, x1, y1, x2, y2)
    );
    minSq = Math.min(
      minSq,
      squaredDistancePointToSegment(right, bottom, x1, y1, x2, y2)
    );
    return minSq;
  };

  const getBoneObjectCollisionInfo = (
    handle,
    boneName,
    left,
    top,
    right,
    bottom,
    threshold,
    hitPoint
  ) => {
    const segment = getBoneSceneSegmentData(handle, boneName);
    if (!segment) return null;
    const padding = Math.max(0, Number(threshold) || 0);
    const rectLeft = Math.min(Number(left) || 0, Number(right) || 0) - padding;
    const rectTop = Math.min(Number(top) || 0, Number(bottom) || 0) - padding;
    const rectRight = Math.max(Number(left) || 0, Number(right) || 0) + padding;
    const rectBottom =
      Math.max(Number(top) || 0, Number(bottom) || 0) + padding;
    const mode = normalizeBoneHitPoint(hitPoint);
    let distanceSq = Number.POSITIVE_INFINITY;
    if (mode === 'root') {
      distanceSq = squaredDistancePointToRect(
        segment.rootX,
        segment.rootY,
        rectLeft,
        rectTop,
        rectRight,
        rectBottom
      );
    } else if (mode === 'middle') {
      distanceSq = squaredDistancePointToRect(
        segment.midX,
        segment.midY,
        rectLeft,
        rectTop,
        rectRight,
        rectBottom
      );
    } else {
      distanceSq = squaredDistanceSegmentToRect(
        segment.rootX,
        segment.rootY,
        segment.tipX,
        segment.tipY,
        rectLeft,
        rectTop,
        rectRight,
        rectBottom
      );
    }
    const distance = Math.sqrt(distanceSq);
    const colliding = distanceSq <= 1e-8;
    const strength = colliding
      ? padding > 0
        ? Math.max(0, padding - distance)
        : 1
      : 0;
    return {
      colliding,
      distance,
      strength,
      threshold: padding,
      hitPoint: mode,
      rootX: segment.rootX,
      rootY: segment.rootY,
      midX: segment.midX,
      midY: segment.midY,
      tipX: segment.tipX,
      tipY: segment.tipY,
    };
  };

  const resolveSceneMeshBlocking = (handle, options) => {
    const currentX = toFiniteNumber(options && options.currentX, 0);
    const currentY = toFiniteNumber(options && options.currentY, 0);
    const previousX = toFiniteNumber(options && options.previousX, currentX);
    const previousY = toFiniteNumber(options && options.previousY, currentY);
    const detectionRange = Math.max(
      0,
      Number(options && options.detectionRange) || 0
    );
    const triggerThreshold = Math.max(
      0,
      Number(options && options.triggerThreshold) || 0
    );
    const maxResolveDistance = Math.max(
      0,
      Number(options && options.maxResolveDistance) || 0
    );
    const motionMode = String((options && options.motionMode) || '')
      .trim()
      .toLowerCase();
    const platformLike = motionMode === 'platformer' || motionMode === 'auto';
    const platformSlopeSnapDistance = Math.max(
      0,
      Number(options && options.platformSlopeSnapDistance) || 0
    );
    const platformMaxWalkableSlopeAngle = Math.max(
      0,
      Number(options && options.platformMaxWalkableSlopeAngle) || 60
    );
    const blockers = Array.isArray(options && options.blockers)
      ? options.blockers
      : [];
    const meshData = getSceneAttachmentTriangles(handle);
    const baseTriangles =
      meshData && Array.isArray(meshData.triangles) ? meshData.triangles : [];

    if (!baseTriangles.length || !blockers.length) {
      return {
        changed: false,
        x: currentX,
        y: currentY,
        wallName: '',
        normalX: 0,
        normalY: 0,
      };
    }

    const getShiftedTriangles = (x, y) => {
      const dx = x - currentX;
      const dy = y - currentY;
      if (Math.abs(dx) <= 1e-8 && Math.abs(dy) <= 1e-8) return baseTriangles;
      return baseTriangles.map(triangle => translateTriangle(triangle, dx, dy));
    };

    let targetX = currentX;
    let targetY = currentY;
    let wallName = '';
    let normalX = 0;
    let normalY = 0;
    let surfaceNormalX = 0;
    let surfaceNormalY = 0;
    let contactKind = '';
    let stableGrounded = false;
    let slopeAngle = 0;
    let slopeSpeedScale = 1;
    let wallSlideCandidate = false;
    let ledgeGrabCandidate = false;
    const axisOrder =
      Math.abs(currentX - previousX) >= Math.abs(currentY - previousY)
        ? ['x', 'y']
        : ['y', 'x'];
    const movementDeltaX = currentX - previousX;
    const movementDeltaY = currentY - previousY;

    for (const axis of axisOrder) {
      for (const blocker of blockers) {
        if (!blocker) continue;
        const blockerBounds = getBlockerBounds(blocker);
        const blockerLeft = blockerBounds.left;
        const blockerTop = blockerBounds.top;
        const blockerRight = blockerBounds.right;
        const blockerBottom = blockerBounds.bottom;
        const padding =
          detectionRange +
          Math.max(0, Number(blocker.range) || 0) +
          Math.max(
            triggerThreshold,
            Math.max(0, Number(blocker.threshold) || 0)
          );
        const rectLeft = blockerLeft - padding;
        const rectTop = blockerTop - padding;
        const rectRight = blockerRight + padding;
        const rectBottom = blockerBottom + padding;
        const responseStrength = Math.max(
          0,
          Math.min(1, Number(blocker.responseStrength))
        );
        const currentTriangles = getShiftedTriangles(targetX, targetY);
        const currentBoundsAll = getTrianglesBounds(currentTriangles);
        const previousTrianglesAll = getShiftedTriangles(previousX, previousY);
        const previousBoundsAll = getTrianglesBounds(previousTrianglesAll);
        const slopeProfile = platformLike
          ? getSlopeBlockerProfile({
              left: blockerLeft,
              top: blockerTop,
              right: blockerRight,
              bottom: blockerBottom,
              surfaceType: blocker.surfaceType,
              surfaceAngle: blocker.surfaceAngle,
              surfaceSnapDistance: blocker.surfaceSnapDistance,
              surfaceSpeedScale: blocker.surfaceSpeedScale,
              surfaceGripStrength: blocker.surfaceGripStrength,
              name: blocker.name,
            })
          : null;
        const slopeContact =
          slopeProfile && currentBoundsAll
            ? resolveSlopeContact(
                slopeProfile,
                currentBoundsAll,
                previousBoundsAll,
                movementDeltaX,
                movementDeltaY,
                {
                  maxWalkableAngle: platformMaxWalkableSlopeAngle,
                  snapDistance: platformSlopeSnapDistance + padding,
                }
              )
            : null;
        if (
          slopeContact &&
          slopeContact.walkable &&
          axis === 'x' &&
          slopeContact.skipSolidCollision
        ) {
          continue;
        }
        if (axis === 'y' && slopeContact && slopeContact.walkable) {
          wallName = slopeContact.objectName || blocker.name || wallName;
          normalX = 0;
          normalY = -1;
          surfaceNormalX = slopeContact.normal ? slopeContact.normal.x : 0;
          surfaceNormalY = slopeContact.normal ? slopeContact.normal.y : -1;
          contactKind = 'slope';
          stableGrounded = !!slopeContact.stableGrounded;
          slopeAngle = slopeContact.slopeAngle || 0;
          slopeSpeedScale = slopeContact.speedScale || 1;
          const correctionDelta = Math.max(
            -maxResolveDistance,
            Math.min(maxResolveDistance, slopeContact.correctionY)
          );
          if (Math.abs(correctionDelta) > 1e-8) {
            // Walkable slopes should fully snap to the surface to avoid
            // AABB-based re-collisions causing jitter or bounce.
            targetY += correctionDelta;
          }
          if (slopeContact.skipSolidCollision) continue;
        }
        const currentIntersectingTriangles = getTrianglesIntersectingBlocker(
          currentTriangles,
          blocker,
          rectLeft,
          rectTop,
          rectRight,
          rectBottom
        );
        if (!currentIntersectingTriangles.length) continue;
        const previousTriangles = getShiftedTriangles(
          axis === 'x' ? previousX : targetX,
          axis === 'y' ? previousY : targetY
        );
        const previousBounds = getTrianglesBounds(previousTriangles);
        const currentBounds = getTrianglesBounds(currentIntersectingTriangles);
        if (!currentBounds) continue;

        const delta = axis === 'x' ? targetX - previousX : targetY - previousY;
        if (Math.abs(delta) <= 1e-8) continue;
        let correctedAxisValue = axis === 'x' ? targetX : targetY;
        let hitNormalX = 0;
        let hitNormalY = 0;
        const collisionMode = normalizeBlockerCollisionMode(
          blocker.collisionMode
        );

        if (
          collisionMode === 'ImagePixels' &&
          blocker.pixelCollision &&
          normalizeBlockerSurfaceType(blocker.surfaceType) === 'Solid'
        ) {
          const pixelResolved = resolvePixelBlockerAxis(
            axis,
            axis === 'x' ? previousX : previousY,
            axis === 'x' ? targetX : targetY,
            axis === 'x' ? targetY : targetX,
            blocker,
            rectLeft,
            rectTop,
            rectRight,
            rectBottom,
            getShiftedTriangles
          );
          if (pixelResolved) {
            correctedAxisValue = pixelResolved.axisValue;
            hitNormalX = pixelResolved.normalX;
            hitNormalY = pixelResolved.normalY;
          }
        }

        if (
          axis === 'x' &&
          correctedAxisValue === targetX &&
          Math.abs(delta) > 1e-8 &&
          previousBounds
        ) {
          if (delta > 0 && previousBounds.maxX <= rectLeft + 1e-8) {
            correctedAxisValue = targetX + (rectLeft - currentBounds.maxX);
            hitNormalX = -1;
          } else if (delta < 0 && previousBounds.minX >= rectRight - 1e-8) {
            correctedAxisValue = targetX + (rectRight - currentBounds.minX);
            hitNormalX = 1;
          }
        } else if (
          axis === 'y' &&
          correctedAxisValue === targetY &&
          Math.abs(delta) > 1e-8 &&
          previousBounds
        ) {
          if (delta > 0 && previousBounds.maxY <= rectTop + 1e-8) {
            correctedAxisValue = targetY + (rectTop - currentBounds.maxY);
            hitNormalY = -1;
          } else if (delta < 0 && previousBounds.minY >= rectBottom - 1e-8) {
            correctedAxisValue = targetY + (rectBottom - currentBounds.minY);
            hitNormalY = 1;
          }
        }

        if (axis === 'x' && correctedAxisValue === targetX) {
          const overlapLeft = currentBounds.maxX - rectLeft;
          const overlapRight = rectRight - currentBounds.minX;
          if (overlapLeft <= overlapRight) {
            correctedAxisValue = targetX - overlapLeft;
            hitNormalX = -1;
          } else {
            correctedAxisValue = targetX + overlapRight;
            hitNormalX = 1;
          }
        } else if (axis === 'y' && correctedAxisValue === targetY) {
          const overlapTop = currentBounds.maxY - rectTop;
          const overlapBottom = rectBottom - currentBounds.minY;
          if (overlapTop <= overlapBottom) {
            correctedAxisValue = targetY - overlapTop;
            hitNormalY = -1;
          } else {
            correctedAxisValue = targetY + overlapBottom;
            hitNormalY = 1;
          }
        }

        const correctionDelta = Math.max(
          -maxResolveDistance,
          Math.min(
            maxResolveDistance,
            correctedAxisValue - (axis === 'x' ? targetX : targetY)
          )
        );
        if (Math.abs(correctionDelta) <= 1e-8) continue;
        const appliedDelta =
          correctionDelta *
          (Number.isFinite(responseStrength) ? responseStrength : 1);
        if (axis === 'x') targetX += appliedDelta;
        else targetY += appliedDelta;
        wallName = blocker.name || wallName;
        normalX = hitNormalX || normalX;
        normalY = hitNormalY || normalY;
        if (axis === 'x') {
          contactKind = 'wall';
          const fallingAlongWall = movementDeltaY > 1e-8;
          const ledgeBand = Math.max(12, padding * 2);
          const nearTopEdge =
            currentBounds.minY <= blockerTop + ledgeBand &&
            currentBounds.maxY >= blockerTop - Math.max(2, padding);
          wallSlideCandidate =
            platformLike && fallingAlongWall && !stableGrounded;
          ledgeGrabCandidate = wallSlideCandidate && nearTopEdge;
        } else if (hitNormalY < 0) {
          contactKind = 'ground';
          stableGrounded = true;
        } else if (hitNormalY > 0) {
          contactKind = 'ceiling';
        }
      }
    }

    return {
      changed:
        Math.abs(targetX - currentX) > 1e-8 ||
        Math.abs(targetY - currentY) > 1e-8,
      x: targetX,
      y: targetY,
      wallName,
      normalX,
      normalY,
      surfaceNormalX,
      surfaceNormalY,
      contactKind,
      stableGrounded,
      slopeAngle,
      slopeSpeedScale,
      wallSlideCandidate,
      ledgeGrabCandidate,
      meshBounds: meshData.bounds,
      triangleCount: baseTriangles.length,
    };
  };

  const normalizeBoneAnchorPoint = value => {
    const text = String(value || '')
      .trim()
      .toLowerCase();
    if (
      text === 'root' ||
      text === 'start' ||
      text === '根部' ||
      text === '起点'
    )
      return 'root';
    if (text === 'segment' || text === 'whole' || text === '整段')
      return 'segment';
    return 'middle';
  };

  const normalizeBoneHitPoint = value => {
    const text = String(value || '')
      .trim()
      .toLowerCase();
    if (
      text === 'root' ||
      text === 'start' ||
      text === '根部' ||
      text === '起点'
    )
      return 'root';
    if (
      text === 'middle' ||
      text === 'mid' ||
      text === 'center' ||
      text === '中部' ||
      text === '中点'
    )
      return 'middle';
    return 'segment';
  };

  const isBoneNearPosition = (handle, boneName, x, y, radius, hitPoint) => {
    const segment = getBoneSceneSegment(handle, boneName);
    if (!segment) return false;
    const { bx, by, tipX, tipY } = segment;

    const px = toFiniteNumber(x, 0);
    const py = toFiniteNumber(y, 0);
    const r = toFiniteNumber(radius, 0);
    const mode = normalizeBoneHitPoint(hitPoint);

    if (mode === 'root') {
      const dx = px - bx;
      const dy = py - by;
      return dx * dx + dy * dy <= r * r;
    }

    if (mode === 'middle') {
      const midX = (bx + tipX) / 2;
      const midY = (by + tipY) / 2;
      const dx = px - midX;
      const dy = py - midY;
      return dx * dx + dy * dy <= r * r;
    }

    const l2 = (tipX - bx) * (tipX - bx) + (tipY - by) * (tipY - by);
    if (l2 === 0) {
      const dx = px - bx;
      const dy = py - by;
      return dx * dx + dy * dy <= r * r;
    }

    let t = ((px - bx) * (tipX - bx) + (py - by) * (tipY - by)) / l2;
    t = Math.max(0, Math.min(1, t));

    const projX = bx + t * (tipX - bx);
    const projY = by + t * (tipY - by);

    const dx = px - projX;
    const dy = py - projY;

    return dx * dx + dy * dy <= r * r;
  };

  const setBoneScenePosition = (handle, boneName, sceneX, sceneY) => {
    ensureWorldTransforms(handle);
    const object = getDisplayObject(handle);
    const bone = getBone(handle, boneName);
    if (!object || !bone || !bone.pose) return false;
    const targetValues = readBoneChannelValues(bone, 'position');

    const targetPoint = scenePointToContainerLocal(object, sceneX, sceneY);
    const skelX = targetPoint.x;
    const skelY = targetPoint.y;

    let localX = skelX;
    let localY = skelY;

    if (bone.parent) {
      // 在 Spine 里面，骨骼是被它的父骨骼旋转和缩放的，所以我们要把 Spine 世界坐标转换成父骨骼的本地坐标系
      const parentPose =
        bone.parent.appliedPose || bone.parent.pose || bone.parent;
      const localPoint = worldVectorToParentLocal(
        bone,
        skelX - (parentPose.worldX || 0),
        skelY - (parentPose.worldY || 0)
      );
      localX = localPoint.x;
      localY = localPoint.y;
    }

    bone.pose.x = localX;
    bone.pose.y = localY;

    const overrides = getBoneOverride(handle, boneName);
    if (overrides) {
      overrides.x = localX;
      overrides.y = localY;
    }
    scheduleBoneAutoReset(handle, boneName, 'position', targetValues);
    refreshBoneTransforms(handle);
    return true;
  };

  const setBoneSceneRotationToward = (
    handle,
    boneName,
    sceneX,
    sceneY,
    offsetAngle
  ) => {
    ensureWorldTransforms(handle);
    const object = getDisplayObject(handle);
    const bone = getBone(handle, boneName);
    if (!object || !bone || !bone.pose) return false;
    const targetValues = readBoneChannelValues(bone, 'rotation');

    const targetPoint = scenePointToContainerLocal(object, sceneX, sceneY);
    const applied = getAppliedBonePose(bone);
    if (!applied) return false;
    const dirWorldX = targetPoint.x - (applied.worldX || 0);
    const dirWorldY = targetPoint.y - (applied.worldY || 0);
    if (Math.hypot(dirWorldX, dirWorldY) <= 1e-8) return true;

    const localDir = worldVectorToParentLocal(bone, dirWorldX, dirWorldY);
    if (Math.hypot(localDir.x, localDir.y) <= 1e-8) return true;

    let targetLocalAngle = Math.atan2(localDir.y, localDir.x) * (180 / Math.PI);
    targetLocalAngle += toFiniteNumber(offsetAngle, 0);
    const currentLocalAngle = bone.pose.rotation;

    let diff = targetLocalAngle - currentLocalAngle;
    diff = ((((diff + 180) % 360) + 360) % 360) - 180;

    bone.pose.rotation = currentLocalAngle + diff;

    const overrides = getBoneOverride(handle, boneName);
    if (overrides) {
      overrides.rotation = bone.pose.rotation;
    }
    scheduleBoneAutoReset(handle, boneName, 'rotation', targetValues);
    refreshBoneTransforms(handle);
    return true;
  };

  const resetBone = (handle, boneName) => {
    const object = getDisplayObject(handle);
    const bone = getBone(handle, boneName);
    if (!object || !bone) return false;

    if (typeof bone.setToSetupPose === 'function') {
      bone.setToSetupPose();
    } else if (typeof bone.setupPose === 'function') {
      bone.setupPose();
    } else {
      return false;
    }

    if (object.__boneOverrides && object.__boneOverrides[boneName]) {
      delete object.__boneOverrides[boneName];
    }
    clearBoneAutoResetState(handle, boneName, '');
    refreshBoneTransforms(handle);
    return true;
  };

  const resetAllBones = handle => {
    const object = getDisplayObject(handle);
    const skeleton = getSkeleton(handle);
    if (!object || !skeleton) return false;

    if (typeof skeleton.setBonesToSetupPose === 'function') {
      skeleton.setBonesToSetupPose();
    } else if (typeof skeleton.setupPoseBones === 'function') {
      skeleton.setupPoseBones();
    } else if (typeof skeleton.setupPose === 'function') {
      skeleton.setupPose();
    } else {
      return false;
    }

    if (object.__boneOverrides) {
      object.__boneOverrides = {};
    }
    clearBoneAutoResetState(handle, '', '');
    refreshBoneTransforms(handle);
    return true;
  };

  const hasEventFired = (handle, eventName) => {
    if (!handle || !handle.eventFiredThisFrame) return false;
    return handle.lastEventName === String(eventName || '');
  };

  const hasAnimationCompleted = (handle, animationName) => {
    if (!handle || !handle.completedFiredThisFrame) return false;
    return handle.lastCompletedAnimation === String(animationName || '');
  };

  const getEventString = handle => {
    return handle && handle.lastEventString ? handle.lastEventString : '';
  };

  const getEventInt = handle => {
    return handle && handle.lastEventInt ? handle.lastEventInt : 0;
  };

  const getEventFloat = handle => {
    return handle && handle.lastEventFloat ? handle.lastEventFloat : 0;
  };

  const slotExists = (handle, slotName) => {
    const skeleton = getSkeleton(handle);
    if (!skeleton) return false;
    return !!skeleton.findSlot(String(slotName || ''));
  };

  const getCurrentAttachmentName = (handle, slotName) => {
    const skeleton = getSkeleton(handle);
    if (!skeleton) return '';
    const slot = skeleton.findSlot(String(slotName || ''));
    if (!slot || !slot.attachment) return '';
    return String(slot.attachment.name || '');
  };

  const getSlotDisplayColor = slot => {
    if (!slot) return null;
    if (slot.pose && slot.pose.color) return slot.pose.color;
    if (slot.color) return slot.color;
    return null;
  };

  const setAttachment = (handle, slotName, attachmentName) => {
    const object = getDisplayObject(handle);
    const skeleton = getSkeleton(handle);
    if (!object || !skeleton || !skeleton.setAttachment) return false;
    let nameToSet = attachmentName ? String(attachmentName).trim() : null;
    if (nameToSet) {
      const lower = nameToSet.toLowerCase();
      if (
        lower === 'none' ||
        lower === 'null' ||
        lower === 'empty' ||
        lower === 'clear' ||
        lower === '清空'
      ) {
        nameToSet = null;
      }
    }
    skeleton.setAttachment(String(slotName || ''), nameToSet);
    return true;
  };

  const clearAttachments = (handle, slotNames) => {
    const skeleton = getSkeleton(handle);
    if (!skeleton || typeof skeleton.setAttachment !== 'function') return false;
    const targets = String(slotNames || '')
      .split(/[,\n;|]+/)
      .map(entry => entry.trim())
      .filter(Boolean);
    if (!targets.length) return false;
    for (const slotName of targets) {
      skeleton.setAttachment(slotName, null);
    }
    return true;
  };

  const setSlotColor = (handle, slotName, r, g, b, a) => {
    const object = getDisplayObject(handle);
    const skeleton = getSkeleton(handle);
    if (!object || !skeleton) return false;
    const slot = skeleton.findSlot(String(slotName || ''));
    const color = getSlotDisplayColor(slot);
    if (!slot || !color) return false;
    color.r = Math.max(0, Math.min(1, Number(r) / 255 || 0));
    color.g = Math.max(0, Math.min(1, Number(g) / 255 || 0));
    color.b = Math.max(0, Math.min(1, Number(b) / 255 || 0));
    color.a = Math.max(
      0,
      Math.min(1, typeof a !== 'undefined' ? Number(a) : 1)
    );
    return true;
  };

  const getAnimationDuration = (handle, animationName) => {
    const object = getDisplayObject(handle);
    const skeletonData =
      object && object.spineData
        ? object.spineData
        : handle && handle.skeletonData
        ? handle.skeletonData
        : null;
    if (!skeletonData || !skeletonData.findAnimation) return 0;
    const anim = skeletonData.findAnimation(String(animationName || ''));
    return anim ? anim.duration : 0;
  };

  const setAnimationProgress = (handle, trackIndex, progress) => {
    const object = getDisplayObject(handle);
    if (!object || !object.state || !object.state.tracks) return false;
    const track = object.state.tracks[Math.max(0, Number(trackIndex) || 0)];
    if (!track || !track.animation) return false;
    const duration = track.animation.duration;
    // 强制把 trackTime 设定在对应进度
    track.trackTime =
      Math.max(0, Math.min(1, Number(progress) || 0)) * duration;
    return true;
  };

  const setIkConstraintMix = (handle, ikName, mix) => {
    const object = getDisplayObject(handle);
    const skeleton = getSkeleton(handle);
    if (!object || !skeleton) return false;
    const ik = skeleton.findIkConstraint(String(ikName || ''));
    if (!ik) return false;
    ik.mix = Math.max(0, Math.min(1, Number(mix) || 0));
    return true;
  };

  const setTransformConstraintMix = (
    handle,
    constraintName,
    mixTranslate,
    mixRotate,
    mixScale,
    mixShear
  ) => {
    const object = getDisplayObject(handle);
    const skeleton = getSkeleton(handle);
    if (!object || !skeleton) return false;
    const constraint = skeleton.findTransformConstraint(
      String(constraintName || '')
    );
    if (!constraint) return false;
    constraint.mixTranslate = Math.max(
      0,
      Math.min(1, Number(mixTranslate) || 0)
    );
    constraint.mixRotate = Math.max(0, Math.min(1, Number(mixRotate) || 0));
    constraint.mixScale = Math.max(0, Math.min(1, Number(mixScale) || 0));
    constraint.mixShear = Math.max(0, Math.min(1, Number(mixShear) || 0));
    return true;
  };

  const getAnimationFrame = (handle, trackIndex) => {
    const object = getDisplayObject(handle);
    if (!object || !object.state || !object.state.tracks) return 0;
    const track = object.state.tracks[Math.max(0, Number(trackIndex) || 0)];
    if (!track) return 0;
    return Math.floor(track.trackTime * 30); // 默认以 30FPS 为基准换算帧数
  };

  const hasAnimation = (handle, animationName) => {
    const object = getDisplayObject(handle);
    const skeletonData =
      object && object.spineData
        ? object.spineData
        : handle && handle.skeletonData
        ? handle.skeletonData
        : null;
    if (!skeletonData || !skeletonData.findAnimation) return false;
    return !!skeletonData.findAnimation(String(animationName || ''));
  };

  const hasSkin = (handle, skinName) => {
    const object = getDisplayObject(handle);
    const skeletonData =
      object && object.spineData
        ? object.spineData
        : handle && handle.skeletonData
        ? handle.skeletonData
        : null;
    if (!skeletonData || !skeletonData.findSkin) return false;
    return !!skeletonData.findSkin(String(skinName || ''));
  };

  const isPlayingOnTrack = (handle, trackIndex) => {
    const object = getDisplayObject(handle);
    if (!object || !object.state || !object.state.tracks) return false;
    const track = object.state.tracks[Math.max(0, Number(trackIndex) || 0)];
    return !!track;
  };

  const isAnimationComplete = (handle, trackIndex) => {
    const object = getDisplayObject(handle);
    if (!object || !object.state || !object.state.tracks) return true;
    const track = object.state.tracks[Math.max(0, Number(trackIndex) || 0)];
    if (!track) return true;
    return track.trackTime >= track.animationEnd && !track.loop;
  };

  const getDebugInfo = handle => {
    const object = getDisplayObject(handle);
    const skeletonData =
      object && object.spineData
        ? object.spineData
        : handle && handle.skeletonData
        ? handle.skeletonData
        : null;
    if (!skeletonData) return 'Spine 尚未就绪或数据丢失 (Spine not ready)';

    let info = '=== Spine 4.3 调试信息 (Debug Info) ===\n';

    // 1. 动画列表
    info += '\n[动画 Animations]\n';
    if (skeletonData.animations && skeletonData.animations.length > 0) {
      info += skeletonData.animations
        .map(a => ` - ${a.name} (${a.duration.toFixed(2)}s)`)
        .join('\n');
    } else {
      info += ' - (无 / None)';
    }

    // 2. 皮肤列表
    info += '\n\n[皮肤 Skins]\n';
    if (skeletonData.skins && skeletonData.skins.length > 0) {
      info += skeletonData.skins.map(s => ` - ${s.name}`).join('\n');
    } else {
      info += ' - (无 / None)';
    }

    // 3. 骨骼列表
    info += '\n\n[骨骼 Bones]\n';
    if (skeletonData.bones && skeletonData.bones.length > 0) {
      info += skeletonData.bones
        .map(b => {
          let parent = b.parent ? ` (Parent: ${b.parent.name})` : ' (Root)';
          return ` - ${b.name}${parent}`;
        })
        .join('\n');
    } else {
      info += ' - (无 / None)';
    }

    // 4. 插槽列表
    info += '\n\n[插槽 Slots]\n';
    if (skeletonData.slots && skeletonData.slots.length > 0) {
      info += skeletonData.slots
        .map(s => {
          let attachment = s.attachmentName ? ` -> [${s.attachmentName}]` : '';
          return ` - ${s.name} (Bone: ${s.boneData.name})${attachment}`;
        })
        .join('\n');
    } else {
      info += ' - (无 / None)';
    }

    // 5. 约束列表
    let constraints = [];

    // Spine 4.2+ 统一使用了 constraints 数组
    if (skeletonData.constraints && skeletonData.constraints.length > 0) {
      skeletonData.constraints.forEach(c => {
        let typeName = 'Constraint';
        if (c.constructor && c.constructor.name) {
          typeName = c.constructor.name.replace('Data', ''); // 比如 IkConstraintData -> IkConstraint
        }
        let target = '';
        if (c.target && c.target.name) target = ` (Target: ${c.target.name})`;
        else if (c.bones && c.bones.length > 0)
          target = ` (Bones: ${c.bones.map(b => b.name).join(', ')})`;

        constraints.push(` - [${typeName}] ${c.name}${target}`);
      });
    } else {
      // 兼容老版本 Spine 运行时的分开数组
      if (skeletonData.ikConstraints) {
        skeletonData.ikConstraints.forEach(ik =>
          constraints.push(` - [IK] ${ik.name} (Target: ${ik.target.name})`)
        );
      }
      if (skeletonData.transformConstraints) {
        skeletonData.transformConstraints.forEach(tc =>
          constraints.push(
            ` - [Transform] ${tc.name} (Target: ${tc.target.name})`
          )
        );
      }
      if (skeletonData.pathConstraints) {
        skeletonData.pathConstraints.forEach(pc =>
          constraints.push(` - [Path] ${pc.name} (Target: ${pc.target.name})`)
        );
      }
    }

    info += '\n\n[约束 Constraints]\n';
    if (constraints.length > 0) {
      info += constraints.join('\n');
    } else {
      info += ' - (无 / None)';
    }

    // 6. 自定义事件
    info += '\n\n[事件 Events]\n';
    if (skeletonData.events && skeletonData.events.length > 0) {
      info += skeletonData.events.map(e => ` - ${e.name}`).join('\n');
    } else {
      info += ' - (无 / None)';
    }

    return info;
  };

  const drawBoneEllipse = (
    handle,
    boneName,
    radiusX,
    radiusY,
    colorStr,
    anchorPoint
  ) => {
    const object = getDisplayObject(handle);
    const bone = getBone(handle, boneName);
    if (!object || !bone || !getAppliedBonePose(bone)) return false;

    // 我们需要确保 SpineDebugRenderer 存在，借用它的 parentDebugContainer 或者自己建一个层
    let graphicsContainer = object.__customDebugGraphics;
    if (!graphicsContainer) {
      graphicsContainer = new window.PIXI.Graphics();
      graphicsContainer.zIndex = 9999998;
      graphicsContainer.eventMode = 'none';
      graphicsContainer.interactiveChildren = false;

      // 我们把绘图层放在 Spine 对象的父容器（也就是场景/图层）里
      // 这样它的坐标系就和场景鼠标坐标系直接对应了
      if (object.parent) {
        object.parent.addChild(graphicsContainer);
      } else {
        object.addChild(graphicsContainer);
      }
      object.__customDebugGraphics = graphicsContainer;

      // 每次 update 之前清空，以便重绘
      const originalUpdate = object.update;
      object.update = function(dt) {
        if (object.__customDebugGraphics) {
          object.__customDebugGraphics.clear();
          // 同步层级和可见性
          object.__customDebugGraphics.zIndex = object.zIndex + 1;
          object.__customDebugGraphics.visible = object.visible;
          if (
            object.__customDebugGraphics.parent !== object.parent &&
            object.parent
          ) {
            object.parent.addChild(object.__customDebugGraphics);
          }
        }
        if (originalUpdate) originalUpdate.call(object, dt);
      };
    }

    // 解析颜色
    let color = 0xffff00;
    let alpha = 0.5;
    if (colorStr) {
      const rgb = String(colorStr)
        .split(';')
        .map(Number);
      if (rgb.length >= 3) {
        color = (rgb[0] << 16) + (rgb[1] << 8) + rgb[2];
      }
    }

    const segment = getBoneSceneSegment(handle, boneName);
    if (!segment) return false;
    const { bx, by, tipX, tipY } = segment;

    // 此时 bx, by, tipX, tipY 全部都是绝对的场景坐标了！
    const midX = (bx + tipX) / 2;
    const midY = (by + tipY) / 2;
    const anchor = normalizeBoneAnchorPoint(anchorPoint);
    const centerX = anchor === 'root' ? bx : midX;
    const centerY = anchor === 'root' ? by : midY;
    const drawRadiusX = Math.max(0, toFiniteNumber(radiusX, 50));
    const drawRadiusY = Math.max(0, toFiniteNumber(radiusY, 50));

    // 骨骼在场景中的绝对旋转角度
    const angleRad = Math.atan2(tipY - by, tipX - bx);
    const boneLength = Math.sqrt(
      (tipX - bx) * (tipX - bx) + (tipY - by) * (tipY - by)
    );

    graphicsContainer.beginFill(color, alpha);

    const currentMatrix = graphicsContainer.matrix
      ? graphicsContainer.matrix.clone()
      : new window.PIXI.Matrix();

    if (anchor === 'segment') {
      // “整段”使用和条件同类型的胶囊形可视化：线段本体 + 两端圆头
      graphicsContainer.setMatrix(
        new window.PIXI.Matrix()
          .translate(-bx, -by)
          .rotate(angleRad)
          .translate(bx, by)
      );
      graphicsContainer.drawEllipse(bx, by, drawRadiusX, drawRadiusY);
      graphicsContainer.drawRect(
        bx,
        by - drawRadiusY,
        boneLength,
        drawRadiusY * 2
      );
      graphicsContainer.drawEllipse(
        bx + boneLength,
        by,
        drawRadiusX,
        drawRadiusY
      );
    } else {
      // 根部 / 中部仍然绘制单个椭圆
      graphicsContainer.setMatrix(
        new window.PIXI.Matrix()
          .translate(-centerX, -centerY)
          .rotate(angleRad)
          .translate(centerX, centerY)
      );
      graphicsContainer.drawEllipse(centerX, centerY, drawRadiusX, drawRadiusY);
    }
    graphicsContainer.endFill();

    graphicsContainer.setMatrix(currentMatrix);

    return true;
  };

  const getDebugFeatureAvailability = object => {
    const skeleton = object && object.skeleton ? object.skeleton : null;
    const slots =
      skeleton && Array.isArray(skeleton.slots) ? skeleton.slots : [];
    let hasRegion = false;
    let hasPath = false;
    let hasClipping = false;
    for (const slot of slots) {
      const attachment = slot && slot.attachment ? slot.attachment : null;
      const typeName = String(
        (attachment && attachment.type) ||
          (attachment &&
            attachment.constructor &&
            attachment.constructor.name) ||
          ''
      ).toLowerCase();
      if (!hasRegion && typeName.includes('region')) hasRegion = true;
      if (!hasPath && typeName.includes('path')) hasPath = true;
      if (!hasClipping && typeName.includes('clipping')) hasClipping = true;
      if (hasRegion && hasPath && hasClipping) break;
    }
    const pathConstraints =
      skeleton && Array.isArray(skeleton.pathConstraints)
        ? skeleton.pathConstraints
        : [];
    if (!hasPath && pathConstraints.length > 0) hasPath = true;
    return { hasRegion, hasPath, hasClipping };
  };

  const applyDebugRendererOptions = (debugRenderer, handle) => {
    const object = getDisplayObject(handle);
    if (!debugRenderer || !handle || !object) return;
    const extras = !!handle.debugExtrasVisible;
    const features = getDebugFeatureAvailability(object);
    const regionRequested =
      typeof handle.debugRegionVisible !== 'undefined'
        ? !!handle.debugRegionVisible
        : extras;
    const trianglesRequested =
      typeof handle.debugTrianglesVisible !== 'undefined'
        ? !!handle.debugTrianglesVisible
        : extras;
    const pathsRequested =
      typeof handle.debugPathsVisible !== 'undefined'
        ? !!handle.debugPathsVisible
        : extras;
    const clippingRequested =
      typeof handle.debugClippingVisible !== 'undefined'
        ? !!handle.debugClippingVisible
        : extras;
    const regionFallback = regionRequested && !features.hasRegion;
    const pathFallback = pathsRequested && !features.hasPath;
    const clippingFallback = clippingRequested && !features.hasClipping;
    debugRenderer.drawBoundingBoxes = true;
    debugRenderer.drawRegionAttachments = features.hasRegion
      ? regionRequested
      : false;
    debugRenderer.drawMeshHull = extras || regionFallback || clippingFallback;
    debugRenderer.drawMeshTriangles =
      trianglesRequested || pathFallback || clippingFallback;
    debugRenderer.drawPaths = features.hasPath ? pathsRequested : false;
    debugRenderer.drawClipping = features.hasClipping
      ? clippingRequested
      : false;
  };

  const setDebugVisible = (handle, visible) => {
    const object = getDisplayObject(handle);
    const spineNamespace = handle && handle.runtime ? handle.runtime : null;
    if (!object || !spineNamespace || !spineNamespace.SpineDebugRenderer)
      return false;

    if (visible) {
      if (!object.debug) {
        object.debug = new spineNamespace.SpineDebugRenderer();
      }
      applyDebugRendererOptions(object.debug, handle);
    } else {
      if (object.debug) {
        object.debug = undefined;
      }
    }
    return true;
  };

  const setDebugExtrasVisible = (handle, visible) => {
    const object = getDisplayObject(handle);
    if (!handle) return false;
    handle.debugExtrasVisible = !!visible;
    if (object && object.debug) {
      applyDebugRendererOptions(object.debug, handle);
    }
    return true;
  };

  const setDebugTrianglesVisible = (handle, visible) => {
    const object = getDisplayObject(handle);
    if (!handle) return false;
    handle.debugTrianglesVisible = !!visible;
    if (object && object.debug) applyDebugRendererOptions(object.debug, handle);
    return true;
  };

  const setDebugPathsVisible = (handle, visible) => {
    const object = getDisplayObject(handle);
    if (!handle) return false;
    handle.debugPathsVisible = !!visible;
    if (object && object.debug) applyDebugRendererOptions(object.debug, handle);
    return true;
  };

  const setDebugClippingVisible = (handle, visible) => {
    const object = getDisplayObject(handle);
    if (!handle) return false;
    handle.debugClippingVisible = !!visible;
    if (object && object.debug) applyDebugRendererOptions(object.debug, handle);
    return true;
  };

  const setDebugRegionVisible = (handle, visible) => {
    const object = getDisplayObject(handle);
    if (!handle) return false;
    handle.debugRegionVisible = !!visible;
    if (object && object.debug) applyDebugRendererOptions(object.debug, handle);
    return true;
  };

  window.GDSpine43Adapter = {
    resolvePath,
    ensureRuntime,
    createInstance,
    updateInstance,
    destroyInstance,
    ensureWorldTransforms,
    setPhysicsTransformInheritance,
    queuePhysicsMovement,
    setInspectorOverrides,
    setAnimation,
    setAnimationOnTrack,
    addAnimation,
    clearTrack,
    clearTracks,
    setSkin,
    setMix,
    setVisible,
    getCurrentAnimation,
    boneExists,
    getBoneChildCount,
    getBoneLength,
    getBoneParentName,
    setBonePosition,
    offsetBonePosition,
    setBoneRotation,
    offsetBoneRotation,
    setBoneScale,
    offsetBoneScale,
    getBoneValue,
    getBoneSceneX,
    getBoneSceneY,
    getBoneSceneRotation,
    getBoneSceneSegmentData,
    getBoneObjectCollisionInfo,
    getSceneAttachmentTriangles,
    getSceneAttachmentBounds,
    resolveSceneMeshBlocking,
    isBoneNearPosition,
    setBoneScenePosition,
    setBoneSceneRotationToward,
    resetBone,
    resetAllBones,
    configureBoneAutoReset,
    isBoneAutoResetActive,
    getBoneAutoResetProgress,
    hasEventFired,
    hasAnimationCompleted,
    getEventString,
    getEventInt,
    getEventFloat,
    slotExists,
    getCurrentAttachmentName,
    setAttachment,
    clearAttachments,
    setSlotColor,
    getAnimationDuration,
    setAnimationProgress,
    setIkConstraintMix,
    setTransformConstraintMix,
    getAnimationFrame,
    hasAnimation,
    hasSkin,
    isPlayingOnTrack,
    isAnimationComplete,
    getDebugInfo,
    setDebugVisible,
    setDebugExtrasVisible,
    setDebugTrianglesVisible,
    setDebugPathsVisible,
    setDebugClippingVisible,
    setDebugRegionVisible,
    drawBoneEllipse,
  };
})();
