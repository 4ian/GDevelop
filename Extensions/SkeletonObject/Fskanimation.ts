namespace gdjs {
  /**
GDevelop - Skeleton Object Extension
Copyright (c) 2017-2018 Franco Maciel (francomaciel10@gmail.com)
This project is released under the MIT License.
*/

  gdjs.sk.SharedAnimation = function () {
    this.fps = 30;
    this.name = '';
    this.defaultPlayTimes = 0;
    this.duration = 0;

    // In frames
    this.boneAnimators = [];
    this.slotAnimators = [];
    this.meshAnimators = [];
    this.armatureAnimators = [];
    this.zOrderAnimator = null;
  };
  gdjs.sk.SharedAnimation.prototype.loadDragonBones = function (
    animationData,
    fps,
    slots
  ) {
    this.fps = fps;
    this.name = animationData.name;
    this.defaultPlayTimes = 1;
    if (animationData.hasOwnProperty('playTimes')) {
      this.defaultPlayTimes = animationData.playTimes;
    }
    this.duration = animationData.duration;
    for (let i = 0; i < animationData.bone.length; i++) {
      const boneAnimator = new gdjs.sk.SharedBoneAnimator();
      boneAnimator.loadDragonBones(animationData.bone[i]);
      if (boneAnimator.isAnimated()) {
        this.boneAnimators.push(boneAnimator);
      }
    }
    for (let i = 0; i < animationData.slot.length; i++) {
      const slotAnimator = new gdjs.sk.SharedSlotAnimator();
      slotAnimator.loadDragonBones(animationData.slot[i], slots);
      if (slotAnimator.isAnimated()) {
        this.slotAnimators.push(slotAnimator);
      }
    }
    for (let i = 0; i < animationData.slot.length; i++) {
      const armatureAnimator = new gdjs.sk.SharedArmatureAnimator();
      armatureAnimator.loadDragonBones(animationData.slot[i]);
      if (armatureAnimator.isAnimated()) {
        this.armatureAnimators.push(armatureAnimator);
      }
    }
    for (let i = 0; i < animationData.ffd.length; i++) {
      const meshAnimator = new gdjs.sk.SharedMeshAnimator();
      meshAnimator.loadDragonBones(animationData.ffd[i], slots);
      if (meshAnimator.isAnimated()) {
        this.meshAnimators.push(meshAnimator);
      }
    }
    if (animationData.hasOwnProperty('zOrder')) {
      const zOrderAnimator = new gdjs.sk.SharedZOrderAnimator();
      zOrderAnimator.loadDragonBones(animationData.zOrder.frame, slots);
      if (zOrderAnimator.isAnimated()) {
        this.zOrderAnimator = zOrderAnimator;
      }
    }
  };

  /**
   * The Animation holds information to transform bones and slots through time.
   */
  gdjs.sk.Animation = function (armature) {
    this.shared = null;
    this.armature = armature;
    this.playTimes = 0;
    this.playedTimes = 0;
    this.time = 0.0;
    this.finished = false;
    this.boneAnimators = [];
    this.slotAnimators = [];
    this.meshAnimators = [];
    this.armatureAnimators = [];
    this.zOrderAnimator = null;
    this.blending = false;
    this.blendTime = 0.0;
    this.blendDuration = 0.0;

    // In seconds
    this.blendBones = [];
    this.blendSlots = [];
    this.blendMeshes = [];
  };
  gdjs.sk.Animation.prototype.loadData = function (
    animationData,
    armatureData
  ) {
    this.shared = animationData;
    for (let i = 0; i < this.shared.boneAnimators.length; i++) {
      const boneAnimator = new gdjs.sk.BoneAnimator();
      boneAnimator.loadData(
        this.shared.boneAnimators[i],
        this.armature.bonesMap
      );
      this.boneAnimators.push(boneAnimator);
    }
    for (let i = 0; i < this.shared.slotAnimators.length; i++) {
      const slotAnimator = new gdjs.sk.SlotAnimator();
      slotAnimator.loadData(
        this.shared.slotAnimators[i],
        this.armature.slotsMap
      );
      this.slotAnimators.push(slotAnimator);
    }
    for (let i = 0; i < this.shared.meshAnimators.length; i++) {
      const meshAnimator = new gdjs.sk.MeshAnimator();
      meshAnimator.loadData(
        this.shared.meshAnimators[i],
        this.armature.slotsMap
      );
      this.meshAnimators.push(meshAnimator);
    }
    for (let i = 0; i < this.shared.armatureAnimators.length; i++) {
      const armatureAnimator = new gdjs.sk.ArmatureAnimator();
      armatureAnimator.loadData(
        this.shared.armatureAnimators[i],
        this.armature.slotsMap
      );
      this.armatureAnimators.push(armatureAnimator);
    }
    if (this.shared.zOrderAnimator) {
      this.zOrderAnimator = new gdjs.sk.ZOrderAnimator();
      this.zOrderAnimator.loadData(this.shared.zOrderAnimator, this.armature);
    }
  };
  gdjs.sk.Animation.prototype.update = function (delta) {
    this.finished = false;

    // Don't update while blending, instead update the blend
    if (this.blending) {
      this.updateBlending(delta);
      return;
    }
    this.time += delta;
    while (
      this.time > this.shared.duration / this.shared.fps &&
      (this.playTimes === 0 || this.playedTimes < this.playTimes)
    ) {
      this.time -= this.shared.duration / this.shared.fps;
      this.playedTimes += 1;
      for (let i = 0; i < this.armatureAnimators.length; i++) {
        this.armatureAnimators[i].runToBeginning();
      }
    }
    if (this.playTimes !== 0 && this.playedTimes >= this.playTimes) {
      this.time = this.shared.duration / this.shared.fps;
      this.finished = true;
    }
    const frame = this.finished
      ? this.shared.duration
      : this.getFrameAtTime(this.time);
    for (let i = 0; i < this.boneAnimators.length; i++) {
      this.boneAnimators[i].setFrame(frame);
    }
    for (let i = 0; i < this.slotAnimators.length; i++) {
      this.slotAnimators[i].setFrame(frame);
    }
    for (let i = 0; i < this.armatureAnimators.length; i++) {
      this.armatureAnimators[i].runToFrame(frame);
      this.armatureAnimators[i].updateAnimation(delta);
    }
    for (let i = 0; i < this.meshAnimators.length; i++) {
      this.meshAnimators[i].setFrame(frame);
    }
    if (this.zOrderAnimator) {
      this.zOrderAnimator.setFrame(frame);
    }
  };
  gdjs.sk.Animation.prototype.updateBlending = function (delta) {
    this.blendTime += delta;
    if (this.blendTime > this.blendDuration) {
      this.blending = false;
      this.update(this.blendTime - this.blendDuration);
      return;
    }
    const frame = this.getFrameAtTime(this.blendTime);
    for (let i = 0; i < this.blendBones.length; i++) {
      this.blendBones[i].setFrame(frame);
    }
    for (let i = 0; i < this.blendSlots.length; i++) {
      this.blendSlots[i].setFrame(frame);
    }

    // Disable child armatures blending until properly tested
    // for(var i=0; i<this.armatureAnimators.length; i++){
    //     this.armatureAnimators[i].updateAnimation(delta);
    // }
    for (let i = 0; i < this.blendMeshes.length; i++) {
      this.blendMeshes[i].setFrame(frame);
    }
  };
  gdjs.sk.Animation.prototype.getFrameAtTime = function (time) {
    let frame = time * this.shared.fps;
    if (!this.armature.skeleton.animationSmooth) {
      frame = Math.round(frame);
    }
    return frame;
  };
  gdjs.sk.Animation.prototype.reset = function (loops = -1) {
    this.playTimes = loops < 0 ? this.shared.defaultPlayTimes : loops;
    this.playedTimes = 0;
    this.time = 0.0;
    this.finished = false;
    this.blending = false;
    this.blendTime = 0.0;
    this.blendDuration = 0.0;
    this.blendBones.length = 0;
    this.blendSlots.length = 0;
    this.blendMeshes.length = 0;
    for (let i = 0; i < this.armatureAnimators.length; i++) {
      this.armatureAnimators[i].reset();
    }
    this.update(0);
  };
  gdjs.sk.Animation.prototype.blendFrom = function (other, blendDuration) {
    this.blending = true;
    this.blendDuration = blendDuration;
    this.blendBones.length = 0;
    let firstList = other.blending ? other.blendBones : other.boneAnimators;
    this.blendAnimators(
      firstList,
      this.boneAnimators,
      this.blendBones,
      gdjs.sk.BlendBoneAnimator
    );
    this.blendSlots.length = 0;
    firstList = other.blending ? other.blendSlots : other.slotAnimators;
    this.blendAnimators(
      firstList,
      this.slotAnimators,
      this.blendSlots,
      gdjs.sk.BlendSlotAnimator
    );
    this.blendMeshes.length = 0;
    firstList = other.blending ? other.blendMeshes : other.meshAnimators;
    this.blendAnimators(
      firstList,
      this.meshAnimators,
      this.blendMeshes,
      gdjs.sk.BlendMeshAnimator
    );
  };
  gdjs.sk.Animation.prototype.blendAnimators = function (
    firstList,
    secondList,
    listToPush,
    animatorClass
  ) {
    for (let i = 0; i < firstList.length + secondList.length; i++) {
      let first, second;
      if (i < firstList.length) {
        first = firstList[i];
        second = secondList.find(function (element) {
          return element.target === first.target;
        });
      } else {
        second = secondList[i - firstList.length];
        first = firstList.find(function (element) {
          return element.target === second.target;
        });
        if (first) {
          continue;
        }
      }

      // Already added in the first block
      animator = new animatorClass();
      animator.blend(first, second, this.blendDuration * this.shared.fps);
      listToPush.push(animator);
    }
  };
  gdjs.sk.Animation.prototype.isFinished = function () {
    return this.finished;
  };
  gdjs.sk.Animation.prototype.getTime = function (time) {
    return this.time;
  };
  gdjs.sk.Animation.prototype.setTime = function (time) {
    this.blending = false;
    this.time = time %= this.getTimeLength();
    if (this.time < 0) {
      this.time += this.getTimeLength();
    }
  };
  gdjs.sk.Animation.prototype.getTimeLength = function () {
    return this.shared.duration / this.shared.fps;
  };
  gdjs.sk.Animation.prototype.getFrame = function () {
    return this.getFrameAtTime(this.time);
  };
  gdjs.sk.Animation.prototype.setFrame = function (frame) {
    this.blending = false;
    this.setTime(frame / this.shared.fps);
  };
  gdjs.sk.Animation.prototype.getFrameLength = function () {
    return this.shared.duration;
  };
  gdjs.sk.KeyChannel = function () {
    this.values = [];
    this.frames = [];
    this.easings = [];
    this.curve = null;
  };
  gdjs.sk.KeyChannel.prototype.getKey = function (frame) {
    if (this.frames.length === 1) {
      return this.values[0];
    }
    if (frame === this.frames[this.frames.length - 1]) {
      return this.values[this.values.length - 1];
    }
    for (let i = 0; i < this.frames.length - 1; i++) {
      if (this.frames[i] <= frame && frame < this.frames[i + 1]) {
        if (this.easings[i] === gdjs.sk.EASING_CONST) {
          return this.values[i];
        } else {
          if (this.easings[i] === gdjs.sk.EASING_LINEAR) {
            const frame_n =
              (frame - this.frames[i]) / (this.frames[i + 1] - this.frames[i]);
            return (
              this.values[i] + frame_n * (this.values[i + 1] - this.values[i])
            );
          } else {
            if (this.easings[i] === gdjs.sk.EASING_CURVE) {
              return this.values[i];
            }
          }
        }

        // TODO Curves
        break;
      }
    }
  };
  gdjs.sk.KeyChannel.prototype.isEmpty = function (defaultValue) {
    for (let i = 0; i < this.values.length; i++) {
      if (this.values[i] !== defaultValue) {
        return false;
      }
    }
    return true;
  };
  gdjs.sk.FloatChannel = function () {
    gdjs.sk.KeyChannel.call(this);
    this.defaultValue = 0;
  };
  gdjs.sk.FloatChannel.prototype = Object.create(gdjs.sk.KeyChannel.prototype);
  gdjs.sk.FloatChannel.prototype.loadDragonBones = function (
    channelData,
    key,
    defaultValue
  ) {
    this.defaultValue = defaultValue;
    this.frames.push(0);
    for (let i = 0; i < channelData.length; i++) {
      let value = defaultValue;
      if (channelData[i].hasOwnProperty(key)) {
        value = channelData[i][key];
      }
      this.values.push(value);
      if (channelData[i].duration !== 0) {
        this.frames.push(this.frames[i] + channelData[i].duration);
      }
      if (channelData[i].hasOwnProperty('tweenEasing')) {
        if (channelData[i].tweenEasing === 0) {
          this.easings.push(gdjs.sk.EASING_LINEAR);
        } else {
          this.easings.push(gdjs.sk.EASING_CURVE);
        }
      } else {
        this.easings.push(gdjs.sk.EASING_CONST);
      }
    }
    if (this.frames.length > this.values.length && this.frames.length >= 2) {
      this.values.push(this.values[this.frames.length - 2]);
    }
    if (this.frames.length === 1 && this.values.length === 0) {
      this.values.push(defaultValue);
    }
  };
  gdjs.sk.FloatChannel.prototype.isEmpty = function () {
    return gdjs.sk.KeyChannel.prototype.isEmpty.call(this, this.defaultValue);
  };
  gdjs.sk.FloatChannel.prototype.blend = function (x0, x1, duration) {
    this.values.length = 2;
    this.values[0] = x0;
    this.values[1] = x1;
    this.frames.length = 2;
    this.frames[0] = 0;
    this.frames[1] = duration;
    this.easings.push(gdjs.sk.EASING_LINEAR);
  };
  gdjs.sk.ColorChannel = function () {
    gdjs.sk.KeyChannel.call(this);
    this.defaultValue = [255, 255, 255];
  };
  gdjs.sk.ColorChannel.prototype = Object.create(gdjs.sk.KeyChannel.prototype);
  gdjs.sk.ColorChannel.prototype.loadDragonBones = function (
    channelData,
    defaultValue
  ) {
    this.defaultValue = defaultValue;
    this.frames.push(0);
    for (let i = 0; i < channelData.length; i++) {
      let value = defaultValue.slice(0);
      if (channelData[i].hasOwnProperty('color')) {
        value = [255, 255, 255, 1.0];
        if (channelData[i].color.hasOwnProperty('rM')) {
          value[0] = Math.ceil((channelData[i].color.rM * 255) / 100.0);
        }
        if (channelData[i].color.hasOwnProperty('gM')) {
          value[1] = Math.ceil((channelData[i].color.gM * 255) / 100.0);
        }
        if (channelData[i].color.hasOwnProperty('bM')) {
          value[2] = Math.ceil((channelData[i].color.bM * 255) / 100.0);
        }
        if (channelData[i].color.hasOwnProperty('aM')) {
          value[3] = channelData[i].color.aM / 100.0;
        }
      }
      this.values.push(value);
      if (channelData[i].duration !== 0) {
        this.frames.push(this.frames[i] + channelData[i].duration);
      }
      if (channelData[i].hasOwnProperty('tweenEasing')) {
        if (channelData[i].tweenEasing === 0) {
          this.easings.push(gdjs.sk.EASING_LINEAR);
        } else {
          this.easings.push(gdjs.sk.EASING_CURVE);
        }
      } else {
        this.easings.push(gdjs.sk.EASING_CONST);
      }
    }
    if (this.frames.length > this.values.length && this.frames.length >= 2) {
      this.values.push(this.values[this.frames.length - 2].slice(0));
    }
    if (this.frames.length === 1 && this.values.length === 0) {
      this.values.push(defaultValue.slice(0));
    }
  };
  gdjs.sk.ColorChannel.prototype.decomposeAlpha = function (alphaChannel) {
    for (let i = 0; i < this.values.length; i++) {
      if (this.values[i].length < 4) {
        return;
      }
    }
    for (let i = 0; i < this.frames.length; i++) {
      alphaChannel.frames.push(this.frames[i]);
      alphaChannel.values.push(this.values[i].pop());
      if (i >= 1) {
        alphaChannel.easings.push(this.easings[i - 1]);
      }
    }
  };
  gdjs.sk.ColorChannel.prototype.getKey = function (frame) {
    if (this.frames.length === 1) {
      return this.values[0];
    }
    if (frame === this.frames[this.frames.length - 1]) {
      return this.values[this.values.length - 1];
    }
    for (let i = 0; i < this.frames.length - 1; i++) {
      if (this.frames[i] <= frame && frame < this.frames[i + 1]) {
        if (this.easings[i] === gdjs.sk.EASING_CONST) {
          return this.values[i];
        } else {
          if (this.easings[i] === gdjs.sk.EASING_LINEAR) {
            const color = [];
            const frame_n =
              (frame - this.frames[i]) / (this.frames[i + 1] - this.frames[i]);
            for (let j = 0; j < 3; j++) {
              color.push(
                this.values[i][j] +
                  frame_n * (this.values[i + 1][j] - this.values[i][j])
              );
            }
            return color;
          } else {
            if (this.easings[i] === gdjs.sk.EASING_CURVE) {
              return this.values[i];
            }
          }
        }

        // TODO Curves
        break;
      }
    }
  };
  gdjs.sk.ColorChannel.prototype.isEmpty = function () {
    for (let i = 0; i < this.values.length; i++) {
      for (let j = 0; j < 3; j++) {
        if (this.values[i][j] !== this.defaultValue[j]) {
          return false;
        }
      }
    }
    return true;
  };
  gdjs.sk.ColorChannel.prototype.blend = function (color0, color1, duration) {
    this.values.length = 2;
    this.values[0] = color0;
    this.values[1] = color1;
    this.frames.length = 2;
    this.frames[0] = 0;
    this.frames[1] = duration;
    this.easings.push(gdjs.sk.EASING_LINEAR);
  };
  gdjs.sk.BoolChannel = function () {
    gdjs.sk.KeyChannel.call(this);
    this.defaultValue = true;
  };
  gdjs.sk.BoolChannel.prototype = Object.create(gdjs.sk.KeyChannel.prototype);
  gdjs.sk.BoolChannel.prototype.loadDragonBones = function (
    channelData,
    key,
    defaultValue
  ) {
    this.defaultValue = defaultValue;
    this.frames.push(0);
    for (let i = 0; i < channelData.length; i++) {
      let value = defaultValue;
      if (channelData[i].hasOwnProperty(key)) {
        if (channelData.key === -1) {
          value = false;
        }
      } else {
        value = true;
      }
      this.values.push(value);
      if (channelData[i].duration !== 0) {
        this.frames.push(this.frames[i] + channelData[i].duration);
      }
      this.easings.push(gdjs.sk.EASING_CONST);
    }
    if (this.frames.length > this.values.length && this.frames.length >= 2) {
      this.values.push(this.values[this.frames.length - 2]);
    }
    if (this.frames.length === 1 && this.values.length === 0) {
      this.values.push(defaultValue);
    }
  };
  gdjs.sk.BoolChannel.prototype.isEmpty = function () {
    return gdjs.sk.KeyChannel.prototype.isEmpty.call(this, this.defaultValue);
  };
  gdjs.sk.BoolChannel.prototype.blend = function (bool0, bool1, duration) {
    this.values.length = 2;
    this.values[0] = bool0;
    this.values[1] = bool1;
    this.frames.length = 2;
    this.frames[0] = 0;
    this.frames[1] = duration;
    this.easings.push(gdjs.sk.EASING_CONST);
  };
  gdjs.sk.VertexArrayChannel = function () {
    gdjs.sk.KeyChannel.call(this);
    this.defaultValue = [];
    this.verticesToUpdate = [];
  };
  gdjs.sk.VertexArrayChannel.prototype = Object.create(
    gdjs.sk.KeyChannel.prototype
  );
  gdjs.sk.VertexArrayChannel.prototype.loadDragonBones = function (
    channelData,
    vertexLength
  ) {
    this.defaultValue = [];
    for (let i = 0; i < vertexLength; i++) {
      this.defaultValue.push([0, 0]);
    }
    this.frames.push(0);
    for (let i = 0; i < channelData.length; i++) {
      const value = [];
      for (let j = 0; j < vertexLength; j++) {
        value.push([0, 0]);
      }
      for (let j = 0; j < channelData[i].vertices.length / 2; j++) {
        value[j + channelData[i].offset / 2][0] =
          channelData[i].vertices[2 * j];
        value[j + channelData[i].offset / 2][1] =
          channelData[i].vertices[2 * j + 1];
      }
      this.values.push(value);
      if (channelData[i].duration !== 0) {
        this.frames.push(this.frames[i] + channelData[i].duration);
      }
      if (channelData[i].hasOwnProperty('tweenEasing')) {
        if (channelData[i].tweenEasing === 0) {
          this.easings.push(gdjs.sk.EASING_LINEAR);
        } else {
          this.easings.push(gdjs.sk.EASING_CURVE);
        }
      } else {
        this.easings.push(gdjs.sk.EASING_CONST);
      }
    }
    if (this.frames.length > this.values.length && this.frames.length >= 2) {
      this.values.push(this.values[this.frames.length - 2].slice(0));
    }
    if (this.frames.length === 1 && this.values.length === 0) {
      this.values.push(this.defaultValue.slice(0));
    }

    // New empty array of verteices values
    const optimizedValues = new Array(this.values.length);
    for (i = 0; i < optimizedValues.length; i++) {
      optimizedValues[i] = [];
    }

    // Add to the values array animated vertices only
    for (let i = 0; i < vertexLength; i++) {
      for (let j = 0; j < this.values.length; j++) {
        if (this.values[j][i][0] !== 0 || this.values[j][i][1] !== 0) {
          for (let k = 0; k < this.values.length; k++) {
            optimizedValues[k].push(this.values[k][i]);
          }
          this.verticesToUpdate.push(i);
          break;
        }
      }
    }
    this.values = optimizedValues;
  };
  gdjs.sk.VertexArrayChannel.prototype.getKey = function (frame) {
    if (this.frames.length === 1) {
      return this.values[0];
    }
    if (frame === this.frames[this.frames.length - 1]) {
      return this.values[this.values.length - 1];
    }
    for (let i = 0; i < this.frames.length - 1; i++) {
      if (this.frames[i] <= frame && frame < this.frames[i + 1]) {
        if (this.easings[i] === gdjs.sk.EASING_CONST) {
          return this.values[i];
        } else {
          if (this.easings[i] === gdjs.sk.EASING_LINEAR) {
            const vertices = [];
            const frame_n =
              (frame - this.frames[i]) / (this.frames[i + 1] - this.frames[i]);
            for (let j = 0; j < this.verticesToUpdate.length; j++) {
              vertices.push([
                this.values[i][j][0] +
                  frame_n * (this.values[i + 1][j][0] - this.values[i][j][0]),
                this.values[i][j][1] +
                  frame_n * (this.values[i + 1][j][1] - this.values[i][j][1]),
              ]);
            }
            return vertices;
          } else {
            if (this.easings[i] === gdjs.sk.EASING_CURVE) {
              return this.values[i];
            }
          }
        }

        // TODO Curves
        break;
      }
    }
  };
  gdjs.sk.VertexArrayChannel.prototype.isEmpty = function () {
    return this.verticesToUpdate.length === 0;
  };
  gdjs.sk.VertexArrayChannel.prototype.blend = function (
    verts0,
    update0,
    verts1,
    update1,
    duration
  ) {
    const verticesToUpdate = [];
    const vertices0 = [];
    const vertices1 = [];
    for (let i = 0; i < update0.length + update1.length; i++) {
      const vertexIndex =
        i < update0.length ? update0[i] : update1[i - update0.length];
      if (verticesToUpdate.indexOf(vertexIndex) === -1) {
        verticesToUpdate.push(vertexIndex);
        const index0 = update0.indexOf(vertexIndex);
        const index1 = update1.indexOf(vertexIndex);
        if (index0 === -1) {
          vertices0.push([0, 0]);
        } else {
          vertices0.push(verts0[index0]);
        }
        if (index1 === -1) {
          vertices1.push([0, 0]);
        } else {
          vertices1.push(verts1[index1]);
        }
      }
    }
    this.values.length = 2;
    this.values[0] = vertices0;
    this.values[1] = vertices1;
    this.frames.length = 2;
    this.frames[0] = 0;
    this.frames[1] = duration;
    this.easings.push(gdjs.sk.EASING_LINEAR);
    this.verticesToUpdate = verticesToUpdate;
  };
  gdjs.sk.ActionChannel = function () {
    this.frames = [];
    this.actionsLists = [];
  };
  gdjs.sk.ActionChannel.prototype.loadDragonBones = function (channelData) {
    this.frames.push(0);
    for (let i = 0; i < channelData.length; i++) {
      let actions = [];
      if (channelData[i].hasOwnProperty('actions')) {
        for (let j = 0; j < channelData[i].actions.length; j++) {
          if (channelData[i].actions[j].hasOwnProperty('gotoAndPlay')) {
            actions.push({
              type: gdjs.sk.EVENT_PLAY,
              value: channelData[i].actions[j].gotoAndPlay,
            });
          } else {
            if (channelData[i].actions[j].hasOwnProperty('gotoAndStop')) {
              actions.push({
                type: gdjs.sk.EVENT_PLAYSINGLE,
                value: channelData[i].actions[j].gotoAndStop,
              });
            }
          }
        }
      }
      if (actions.length === 0) {
        actions.push({ type: gdjs.sk.EVENT_STOP, value: '' });
      }
      this.actionsLists.push(actions);
      if (channelData[i].duration !== 0) {
        this.frames.push(this.frames[i] + channelData[i].duration);
      }
    }
    if (
      this.frames.length > this.actionsLists.length &&
      this.frames.length >= 2
    ) {
      let actions = [];
      for (
        let i = 0;
        i < this.actionsLists[this.frames.length - 2].length;
        i++
      ) {
        actions.push({
          type: this.actionsLists[this.frames.length - 2][i].type,
          value: this.actionsLists[this.frames.length - 2][i].value,
        });
      }
      this.actionsLists.push(actions);
    }
    if (this.frames.length === 1 && this.actionsLists.length === 0) {
      this.actionsLists.push(
        // empty list of actions
        [{ type: gdjs.sk.EVENT_STOP, value: '' }]
      );
    }
  };
  gdjs.sk.ActionChannel.prototype.isEmpty = function () {
    for (let i = 0; i < this.actionsLists.length; i++) {
      for (let j = 0; j < this.actionsLists[i].length; j++) {
        if (this.actionsLists[i][j].type !== gdjs.sk.EVENT_STOP) {
          return false;
        }
      }
    }
    return true;
  };
  gdjs.sk.ActionChannel.prototype.getKeysToBeginning = function () {
    const actions = this.getKeys(this.frames[this.frames.length - 1]);
    if (this.frames[0] === 0) {
      for (let i = 0; i < this.actionsLists[0].length; i++) {
        actions.push(this.actionsLists[0][i]);
      }
    }
    return actions;
  };
  gdjs.sk.ActionChannel.prototype.getKeys = function (currentFrame, frame) {
    const actions = [];
    for (let i = 0; i < this.frames.length; i++) {
      if (this.frames[i] > currentFrame && this.frames[i] <= frame) {
        for (let j = 0; j < this.actionsLists[i].length; j++) {
          actions.push(this.actionsLists[i][j]);
        }
      }
    }
    return actions;
  };
  gdjs.sk.ActionChannel.prototype.getFirstFrameAnimation = function () {
    if (this.frames > 0 && this.frames[0] === 0) {
      for (let k = 0; k < this.actionsLists[0].length; k++) {
        if (
          this.actionsLists[0][k].type === gdjs.sk.EVENT_PLAY ||
          this.actionsLists[0][k].type === gdjs.sk.EVENT_PLAYSINGLE
        ) {
          return this.actionsLists[0][k].value;
        }
      }
    }
    return '';
  };
  gdjs.sk.SharedBoneAnimator = function () {
    this.target = '';
    this.channelX = new gdjs.sk.FloatChannel();
    this.channelY = new gdjs.sk.FloatChannel();
    this.channelRot = new gdjs.sk.FloatChannel();
    this.channelSclX = new gdjs.sk.FloatChannel();
    this.channelSclY = new gdjs.sk.FloatChannel();
    this.animatedTransform = true;
  };
  gdjs.sk.SharedBoneAnimator.prototype.loadDragonBones = function (
    boneAnimData
  ) {
    this.target = boneAnimData.name;
    this.channelX.loadDragonBones(boneAnimData.translateFrame, 'x', 0);
    this.channelY.loadDragonBones(boneAnimData.translateFrame, 'y', 0);
    this.channelRot.loadDragonBones(boneAnimData.rotateFrame, 'rotate', 0);
    this.channelSclX.loadDragonBones(boneAnimData.scaleFrame, 'x', 1.0);
    this.channelSclY.loadDragonBones(boneAnimData.scaleFrame, 'y', 1.0);
    if (
      this.channelX.isEmpty() &&
      this.channelY.isEmpty() &&
      this.channelRot.isEmpty() &&
      this.channelSclX.isEmpty() &&
      this.channelSclY.isEmpty()
    ) {
      this.animatedTransform = false;
    }

    // Fix rotations to move to the closest angle
    for (let i = 1; i < this.channelRot.values.length; i++) {
      if (this.channelRot.values[i] <= 0) {
        if (
          Math.abs(this.channelRot.values[i] - this.channelRot.values[i - 1]) >
          Math.abs(
            this.channelRot.values[i] + 360 - this.channelRot.values[i - 1]
          )
        ) {
          this.channelRot.values[i] += 360;
        }
      }
      if (this.channelRot.values[i] >= 0) {
        if (
          Math.abs(this.channelRot.values[i] - this.channelRot.values[i - 1]) >
          Math.abs(
            this.channelRot.values[i] - 360 - this.channelRot.values[i - 1]
          )
        ) {
          this.channelRot.values[i] -= 360;
        }
      }
    }
  };
  gdjs.sk.SharedBoneAnimator.prototype.isAnimated = function () {
    return this.animatedTransform;
  };
  gdjs.sk.BoneAnimator = function () {
    this.shared = null;
    this.target = null;
    this.lastX = 0.0;
    this.lastY = 0.0;
    this.lastRot = 0.0;
    this.lastSclX = 1.0;
    this.lastSclY = 1.0;
  };
  gdjs.sk.BoneAnimator.prototype.loadData = function (boneAnimData, bones) {
    this.shared = boneAnimData;
    this.target = bones[this.shared.target];
  };
  gdjs.sk.BoneAnimator.prototype.setFrame = function (frame) {
    if (this.shared.animatedTransform) {
      this.lastX = this.shared.channelX.getKey(frame);
      this.lastY = this.shared.channelY.getKey(frame);
      this.lastRot = this.shared.channelRot.getKey(frame);
      this.lastSclX = this.shared.channelSclX.getKey(frame);
      this.lastSclY = this.shared.channelSclY.getKey(frame);
      this.target.setPos(this.lastX, this.lastY);
      this.target.setRot(this.lastRot);
      this.target.setScale(this.lastSclX, this.lastSclY);
    }
  };
  gdjs.sk.BoneAnimator.prototype.blendFrom = function (
    first,
    second,
    duration
  ) {
    this.target = first ? first.target : second.target;
    const x0 = first ? first.lastX : 0.0;
    const y0 = first ? first.lastY : 0.0;
    const rot0 = first ? first.lastRot : 0.0;
    const sx0 = first ? first.lastSclX : 1.0;
    const sy0 = first ? first.lastSclY : 1.0;
    const x1 = second ? second.channelX.getKey(0) : 0.0;
    const y1 = second ? second.channelY.getKey(0) : 0.0;
    const rot1 = second ? second.channelRot.getKey(0) : 0.0;
    const sx1 = second ? second.channelSclX.getKey(0) : 1.0;
    const sy1 = second ? second.channelSclY.getKey(0) : 1.0;
    this.channelX.blend(x0, x1, duration);
    this.channelY.blend(y0, y1, duration);
    this.channelRot.blend(rot0, rot1, duration);
    this.channelSclX.blend(sx0, sx1, duration);
    this.channelSclY.blend(sy0, sy1, duration);
  };
  gdjs.sk.BlendBoneAnimator = function () {
    this.target = null;
    this.lastX = 0.0;
    this.lastY = 0.0;
    this.lastRot = 0.0;
    this.lastSclX = 1.0;
    this.lastSclY = 1.0;
    this.channelX = new gdjs.sk.FloatChannel();
    this.channelY = new gdjs.sk.FloatChannel();
    this.channelRot = new gdjs.sk.FloatChannel();
    this.channelSclX = new gdjs.sk.FloatChannel();
    this.channelSclY = new gdjs.sk.FloatChannel();
  };
  gdjs.sk.BlendBoneAnimator.prototype.blend = function (
    first,
    second,
    duration
  ) {
    this.target = first ? first.target : second.target;
    const x0 = first ? first.lastX : 0.0;
    const y0 = first ? first.lastY : 0.0;
    const rot0 = first ? first.lastRot : 0.0;
    const sx0 = first ? first.lastSclX : 1.0;
    const sy0 = first ? first.lastSclY : 1.0;
    const x1 = second ? second.shared.channelX.getKey(0) : 0.0;
    const y1 = second ? second.shared.channelY.getKey(0) : 0.0;
    let rot1 = second ? second.shared.channelRot.getKey(0) : 0.0;
    if (rot1 <= 0 && Math.abs(rot1 - rot0) > Math.abs(rot1 + 360 - rot0)) {
      rot1 += 360;
    }
    if (rot1 >= 0 && Math.abs(rot1 - rot0) > Math.abs(rot1 - 360 - rot0)) {
      rot1 -= 360;
    }
    const sx1 = second ? second.shared.channelSclX.getKey(0) : 1.0;
    const sy1 = second ? second.shared.channelSclY.getKey(0) : 1.0;
    this.channelX.blend(x0, x1, duration);
    this.channelY.blend(y0, y1, duration);
    this.channelRot.blend(rot0, rot1, duration);
    this.channelSclX.blend(sx0, sx1, duration);
    this.channelSclY.blend(sy0, sy1, duration);
  };
  gdjs.sk.BlendBoneAnimator.prototype.setFrame = function (frame) {
    this.lastX = this.channelX.getKey(frame);
    this.lastY = this.channelY.getKey(frame);
    this.lastRot = this.channelRot.getKey(frame);
    this.lastSclX = this.channelSclX.getKey(frame);
    this.lastSclY = this.channelSclY.getKey(frame);
    this.target.setPos(this.lastX, this.lastY);
    this.target.setRot(this.lastRot);
    this.target.setScale(this.lastSclX, this.lastSclY);
  };
  gdjs.sk.SharedSlotAnimator = function () {
    this.target = '';
    this.channelColor = new gdjs.sk.ColorChannel();
    this.channelAlpha = new gdjs.sk.FloatChannel();
    this.channelVisible = new gdjs.sk.BoolChannel();
    this.animatedColor = true;
    this.animatedAlpha = true;
    this.animatedVisible = true;
    this.animatedSkinning = true;
  };
  gdjs.sk.SharedSlotAnimator.prototype.loadDragonBones = function (
    slotAnimData,
    slots
  ) {
    this.target = slotAnimData.name;
    let slot = null;
    for (let i = 0; i < slots.length; i++) {
      if (slots[i].name === this.target) {
        slot = slots[i];
        break;
      }
    }
    this.channelColor.loadDragonBones(slotAnimData.colorFrame, [
      slot.defaultR,
      slot.defaultG,
      slot.defaultB,
      slot.defaultAlpha,
    ]);
    if (this.channelColor.isEmpty()) {
      this.animatedColor = false;
    }
    this.channelAlpha.defaultValue = slot.defaultAlpha;
    this.channelColor.decomposeAlpha(this.channelAlpha);
    if (this.channelAlpha.isEmpty()) {
      this.animatedAlpha = false;
    }
    this.channelVisible.loadDragonBones(
      slotAnimData.displayFrame,
      'value',
      this.defaultVisible
    );
    if (this.channelVisible.isEmpty(slot.defaultVisible)) {
      this.animatedVisible = false;
    }
    this.animatedSkinning = slot.skinned;
  };
  gdjs.sk.SharedSlotAnimator.prototype.isAnimated = function () {
    return (
      this.animatedColor ||
      this.animatedAlpha ||
      this.animatedVisible ||
      this.animatedSkinning
    );
  };
  gdjs.sk.SlotAnimator = function () {
    this.shared = null;
    this.target = null;
    this.lastColor = [255, 255, 255];
    this.lastAlpha = 1.0;
    this.lastVisible = true;
  };
  gdjs.sk.SlotAnimator.prototype.loadData = function (slotAnimData, slots) {
    this.shared = slotAnimData;
    this.target = slots[this.shared.target];
    this.lastColor[0] = this.target.shared.defaultR;
    this.lastColor[1] = this.target.shared.defaultG;
    this.lastColor[2] = this.target.shared.defaultB;
    this.lastAlpha = this.target.shared.defaultAlpha;
    this.lastVisible = this.target.shared.defaultVisible;
  };
  gdjs.sk.SlotAnimator.prototype.setFrame = function (frame) {
    if (this.shared.animatedColor) {
      this.lastColor = this.shared.channelColor.getKey(frame);
      this.target.setColor(...this.lastColor);
    }
    if (this.shared.animatedAlpha) {
      this.lastAlpha = this.shared.channelAlpha.getKey(frame);
      this.target.setAlpha(this.lastAlpha);
    }
    if (this.shared.animatedVisible) {
      this.lastVisible = this.shared.channelVisible.getKey(frame);
      this.target.setVisible(this.lastVisible);
    }
    if (this.shared.animatedSkinning) {
      this.target.updateSkinning();
    }
  };
  gdjs.sk.SlotAnimator.prototype.blendFrom = function (
    first,
    second,
    duration
  ) {
    this.target = first ? first.target : second.target;
    const color0 = first
      ? first.lastColor
      : [this.target.defaultR, this.target.defaultG, this.target.defaultB];
    const alpha0 = first ? first.lastAlpha : this.target.defaultAlpha;
    const visible0 = first ? first.lastVisible : this.target.defaultVisible;
    const color1 = second
      ? second.channelColor.getKey(0)
      : [this.target.defaultR, this.target.defaultG, this.target.defaultB];
    const alpha1 = second
      ? second.channelAlpha.getKey(0)
      : this.target.defaultAlpha;
    const visible1 = second
      ? second.channelVisible.getKey(0)
      : this.target.defaultVisible;
    this.channelColor.blend(color0, color1, duration);
    this.channelAlpha.blend(alpha0, alpha1, duration);
    this.channelVisible.blend(visible0, visible1, duration);
  };
  gdjs.sk.BlendSlotAnimator = function () {
    this.target = null;
    this.channelColor = new gdjs.sk.ColorChannel();
    this.channelAlpha = new gdjs.sk.FloatChannel();
    this.channelVisible = new gdjs.sk.BoolChannel();
    this.lastColor = [255, 255, 255];
    this.lastAlpha = 1.0;
    this.lastVisible = true;
  };
  gdjs.sk.BlendSlotAnimator.prototype.blend = function (
    first,
    second,
    duration
  ) {
    this.target = first ? first.target : second.target;
    const color0 = first
      ? first.lastColor
      : [
          this.target.shared.defaultR,
          this.target.shared.defaultG,
          this.target.shared.defaultB,
        ];
    const alpha0 = first ? first.lastAlpha : this.target.shared.defaultAlpha;
    const visible0 = first
      ? first.lastVisible
      : this.target.shared.defaultVisible;
    const color1 = second
      ? second.shared.channelColor.getKey(0)
      : [
          this.target.shared.defaultR,
          this.target.shared.defaultG,
          this.target.shared.defaultB,
        ];
    const alpha1 = second
      ? second.shared.channelAlpha.getKey(0)
      : this.target.shared.defaultAlpha;
    const visible1 = second
      ? second.shared.channelVisible.getKey(0)
      : this.target.shared.defaultVisible;
    this.channelColor.blend(color0, color1, duration);
    this.channelAlpha.blend(alpha0, alpha1, duration);
    this.channelVisible.blend(visible0, visible1, duration);
  };
  gdjs.sk.BlendSlotAnimator.prototype.setFrame = function (frame) {
    this.lastColor = this.channelColor.getKey(frame);
    this.target.setColor(...this.lastColor);
    this.lastAlpha = this.channelAlpha.getKey(frame);
    this.target.setAlpha(this.lastAlpha);
    this.lastVisible = this.channelVisible.getKey(frame);
    this.target.setVisible(this.lastVisible);
    this.target.updateSkinning();
  };
  gdjs.sk.SharedMeshAnimator = function () {
    this.target = '';
    this.channelVertices = new gdjs.sk.VertexArrayChannel();
    this.animatedVertices = true;
  };
  gdjs.sk.SharedMeshAnimator.prototype.loadDragonBones = function (
    ffdAnimData,
    slots
  ) {
    this.target = ffdAnimData.slot;
    let slot = null;
    for (let i = 0; i < slots.length; i++) {
      if (slots[i].name === this.target) {
        slot = slots[i];
        break;
      }
    }
    this.channelVertices.loadDragonBones(
      ffdAnimData.frame,
      slot.defaultVertices.length
    );
    if (this.channelVertices.isEmpty()) {
      this.animatedVertices = false;
    }
  };
  gdjs.sk.SharedMeshAnimator.prototype.isAnimated = function () {
    return this.animatedVertices;
  };
  gdjs.sk.MeshAnimator = function () {
    this.shared = null;
    this.target = undefined;
    this.lastVertices = [];
  };
  gdjs.sk.MeshAnimator.prototype.loadData = function (meshAnimData, slots) {
    this.shared = meshAnimData;
    this.target = slots[this.shared.target];
  };
  gdjs.sk.MeshAnimator.prototype.setFrame = function (frame) {
    this.lastVertices = this.shared.channelVertices.getKey(frame);
    this.target.setVertices(
      this.lastVertices,
      this.shared.channelVertices.verticesToUpdate
    );
  };
  gdjs.sk.MeshAnimator.prototype.blendFrom = function (
    first,
    second,
    duration
  ) {
    this.target = first ? first.target : second.target;
    const verts0 = first ? first.lastVertices : [];
    const update0 = first ? first.channelVertices.verticesToUpdate : [];
    const verts1 = second ? second.channelVertices.getKey(0) : [];
    const update1 = second ? second.channelVertices.verticesToUpdate : [];
    this.channelVertices.blend(verts0, update0, verts1, update1, duration);
  };
  gdjs.sk.MeshAnimator.prototype.getVerticesToUpdate = function () {
    return this.shared.channelVertices.verticesToUpdate;
  };
  gdjs.sk.BlendMeshAnimator = function () {
    this.target = null;
    this.channelVertices = new gdjs.sk.VertexArrayChannel();
    this.lastVertices = [];
  };
  gdjs.sk.BlendMeshAnimator.prototype.blend = function (
    first,
    second,
    duration
  ) {
    this.target = first ? first.target : second.target;
    const verts0 = first ? first.lastVertices : [];
    const update0 = first ? first.getVerticesToUpdate() : [];
    const verts1 = second ? second.shared.channelVertices.getKey(0) : [];
    const update1 = second
      ? second.shared.channelVertices.verticesToUpdate
      : [];
    this.channelVertices.blend(verts0, update0, verts1, update1, duration);
  };
  gdjs.sk.BlendMeshAnimator.prototype.getVerticesToUpdate = function () {
    return this.channelVertices.verticesToUpdate;
  };
  gdjs.sk.BlendMeshAnimator.prototype.setFrame = function (frame) {
    this.lastVertices = this.channelVertices.getKey(frame);
    this.target.setVertices(
      this.lastVertices,
      this.channelVertices.verticesToUpdate
    );
  };
  gdjs.sk.SharedArmatureAnimator = function () {
    this.target = '';
    this.channelAction = new gdjs.sk.ActionChannel();
    this.animatedAction = true;
  };
  gdjs.sk.SharedArmatureAnimator.prototype.loadDragonBones = function (
    slotAnimData
  ) {
    this.target = slotAnimData.name;
    this.channelAction.loadDragonBones(slotAnimData.displayFrame);
    if (this.channelAction.isEmpty()) {
      this.animatedAction = false;
    }
  };
  gdjs.sk.SharedArmatureAnimator.prototype.isAnimated = function () {
    return this.animatedAction;
  };
  gdjs.sk.ArmatureAnimator = function () {
    this.shared = null;
    this.target = undefined;
    this.currentFrame = -1;
  };
  gdjs.sk.ArmatureAnimator.prototype.loadData = function (slotAnimData, slots) {
    this.shared = slotAnimData;
    this.target = slots[this.shared.target];
  };
  gdjs.sk.ArmatureAnimator.prototype.runToBeginning = function () {
    const actions = this.shared.channelAction.getKeysToBeginning();
    this.currentFrame = 0;
    this.runActions(actions);
  };
  gdjs.sk.ArmatureAnimator.prototype.runToFrame = function (frame) {
    const actions = this.shared.channelAction.getKeys(this.currentFrame, frame);
    this.currentFrame = frame;
    this.runActions(actions);
  };
  gdjs.sk.ArmatureAnimator.prototype.runActions = function (actions) {
    for (let i = 0; i < actions.length; i++) {
      if (actions[i].type === gdjs.sk.EVENT_STOP) {
        this.target.childArmature.resetState();
        this.target.childArmature.currentAnimation = -1;
      } else {
        if (actions[i].type === gdjs.sk.EVENT_PLAY) {
          this.target.childArmature.setAnimationName(actions[i].value, 0, -1);
        } else {
          if (actions[i].type === gdjs.sk.EVENT_PLAYSINGLE) {
            this.target.childArmature.setAnimationName(actions[i].value, 0, 1);
          }
        }
      }
    }
  };
  gdjs.sk.ArmatureAnimator.prototype.reset = function () {
    this.currentFrame = -1;
  };
  gdjs.sk.ArmatureAnimator.prototype.updateAnimation = function (delta) {
    this.target.childArmature.updateAnimation(delta);
  };
  gdjs.sk.ArmatureAnimator.prototype.setFirstFrameAnimation = function (
    blendTime
  ) {
    const firstFrameAnimation = this.shared.channelAction.getFirstFrameAnimation();
    if (firstFrameAnimation === '') {
      this.target.childArmature.currentAnimation = -1;
    } else {
      this.target.childArmature.setAnimationName(
        firstFrameAnimation,
        blendTime,
        -1
      );
    }
  };
  gdjs.sk.SharedZOrderAnimator = function () {
    this.values = [];
    this.frames = [];
    this.target = [];
    this.animatedZOrder = false;
  };
  gdjs.sk.SharedZOrderAnimator.prototype.loadDragonBones = function (
    zOrderAnimData,
    slots
  ) {
    this.frames.push(0);
    for (let i = 0; i < slots.length; i++) {
      this.target.push(i);
    }

    // Default slots z
    const defaultOrder = new Array();
    for (let i = 0; i < slots.length; i++) {
      defaultOrder.push(slots[i].defaultZ);
    }

    // Add frames and values
    for (let i = 0; i < zOrderAnimData.length; i++) {
      const value = new Array(slots.length);
      const frameData = zOrderAnimData[i];
      for (let j = 0; j < slots.length; j++) {
        let deltaPos = 0;
        for (let k = 0; k < frameData.zOrder.length; k += 2) {
          if (
            frameData.zOrder[k] > j + deltaPos &&
            frameData.zOrder[k] + frameData.zOrder[k + 1] <= j + deltaPos
          ) {
            deltaPos += 1;
          } else {
            if (
              frameData.zOrder[k] < j + deltaPos &&
              frameData.zOrder[k] + frameData.zOrder[k + 1] >= j + deltaPos
            ) {
              deltaPos -= 1;
            }
          }
        }
        for (let k = 0; k < frameData.zOrder.length; k += 2) {
          if (j === frameData.zOrder[k]) {
            deltaPos = frameData.zOrder[k + 1];
            break;
          }
        }
        value[j] = j + deltaPos;
      }
      this.values.push(value);
      if (frameData.duration !== 0) {
        this.frames.push(this.frames[i] + frameData.duration);
      }
    }

    // Copy previous value if not completed
    if (this.frames.length > this.values.length && this.frames.length >= 2) {
      this.values.push(this.values[this.frames.length - 2]);
    }

    // Add an empty value if no frames
    if (this.frames.length === 1 && this.values.length === 0) {
      this.values.push(defaultOrder);
    }

    // Check for empty animation
    for (let i = 0; i < this.values.length; i++) {
      for (let j = 0; j < this.values[i].length; j++) {
        if (this.values[i][j] !== j) {
          this.animatedZOrder = true;
        }
      }
    }
  };
  gdjs.sk.SharedZOrderAnimator.prototype.isAnimated = function () {
    return this.animatedZOrder;
  };
  gdjs.sk.ZOrderAnimator = function () {
    this.shared = null;
    this.target = [];
    this.armature = null;
    this.lastFrameSet = -1;
  };
  gdjs.sk.ZOrderAnimator.prototype.loadData = function (
    zOrderAnimData,
    armature
  ) {
    this.shared = zOrderAnimData;
    for (let i = 0; i < this.shared.target.length; i++) {
      this.target.push(armature.slots[this.shared.target[i]]);
    }
    this.armature = armature;
  };
  gdjs.sk.ZOrderAnimator.prototype.setFrame = function (frame) {
    let zValues;
    let frameToSet = this.lastFrameSet;
    if (this.shared.frames.length === 1) {
      zValues = this.shared.values[0];
      frameToSet = this.shared.frames[0];
    } else {
      if (frame === this.shared.frames[this.shared.frames.length - 1]) {
        zValues = this.shared.values[this.shared.values.length - 1];
        frameToSet = this.shared.frames[this.shared.frames.length - 1];
      } else {
        for (let i = 0; i < this.shared.frames.length - 1; i++) {
          if (
            this.shared.frames[i] <= frame &&
            frame < this.shared.frames[i + 1]
          ) {
            zValues = this.shared.values[i];
            frameToSet = this.shared.frames[i];
            break;
          }
        }
      }
    }
    if (frameToSet !== this.lastFrameSet) {
      for (let i = 0; i < this.target.length; i++) {
        this.target[i].setZ(zValues[i]);
      }
      this.lastFrameSet = frameToSet;
      this.armature.updateZOrder();
    }
  };
}
