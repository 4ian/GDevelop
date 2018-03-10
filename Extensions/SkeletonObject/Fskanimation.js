
/**
GDevelop - Skeleton Object Extension
Copyright (c) 2017-2018 Franco Maciel (francomaciel10@gmail.com)
This project is released under the MIT License.
*/


/**
 * The Animation holds information to transform bones and slots through time.
 *
 * @namespace gdjs.sk
 * @class Animation
 */
gdjs.sk.Animation = function(armature, fps){
    this.fps = fps <= 0 || !fps ? 30 : fps;
    this.armature = armature;
    this.name = "";
    this.defaultPlayTimes = 0;
    this.playTimes = 0;
    this.playedTimes = 0;
    this.duration = 0; // In frames
    this.time = 0.0;
    this.finished = false;
    this.boneAnimators = [];
    this.slotAnimators = [];
    this.meshAnimators = [];
    this.armatureAnimators = [];
    this.zOrderAnimator = new gdjs.sk.ZOrderAnimator(this.armature.slots);
    this.blending = false;
    this.blendTime = 0.0;
    this.blendDuration = 0.0; // In seconds
    this.blendBones = [];
    this.blendSlots = [];
    this.blendMeshes = [];
};

gdjs.sk.Animation.prototype.loadDragonBones = function(animationData){
    this.name = animationData.name;
	this.defaultPlayTimes = 1;
	if(animationData.hasOwnProperty("playTimes")){
        this.defaultPlayTimes = animationData.playTimes;
    }
	this.duration = animationData.duration;

	for(var i=0; i<animationData.bone.length; i++){
		var boneAnimator = new gdjs.sk.BoneAnimator();
		boneAnimator.loadDragonBones(animationData.bone[i], this.armature.bonesMap);
		if(boneAnimator.isAnimated()){
			this.boneAnimators.push(boneAnimator);
		}
	}

	for(var i=0; i<animationData.slot.length; i++){
		var slotAnimator = new gdjs.sk.SlotAnimator();
		slotAnimator.loadDragonBones(animationData.slot[i], this.armature.slotsMap);
		if(slotAnimator.isAnimated()){
			this.slotAnimators.push(slotAnimator);
		}
	}

	for(var i=0; i<animationData.slot.length; i++){
		var armatureAnimator = new gdjs.sk.ArmatureAnimator();
		armatureAnimator.loadDragonBones(animationData.slot[i], this.armature.slotsMap);
		if(armatureAnimator.isAnimated()){
			this.armatureAnimators.push(armatureAnimator);
		}
	}
	
	for(var i=0; i<animationData.ffd.length; i++){
		var meshAnimator = new gdjs.sk.MeshAnimator();
		meshAnimator.loadDragonBones(animationData.ffd[i], this.armature.slotsMap);
		if(meshAnimator.isAnimated()){
			this.meshAnimators.push(meshAnimator);
		}
	}

	if(animationData.hasOwnProperty("zOrder")){
		this.zOrderAnimator.loadDragonBones(animationData.zOrder.frame);
	}
};

gdjs.sk.Animation.prototype.update = function(delta){
	this.finished = false;

	if(this.blending){
		this.updateBlending(delta);
		return;
	}

	this.time += delta;

	while(this.time > this.duration / this.fps &&
		 (this.playTimes === 0 || this.playedTimes < this.playTimes)){
		this.time -= this.duration / this.fps;
		this.playedTimes += 1;
		for(var i=0; i<this.armatureAnimators.length; i++){
			this.armatureAnimators[i].runToBeginning();
		}
	}
	if(this.playTimes !== 0 && this.playedTimes >= this.playTimes){
		this.time = this.duration / this.fps;
		this.finished = true;
	}

	var frame = this.getFrameAtTime(this.time);

	for(var i=0; i<this.boneAnimators.length; i++){
		this.boneAnimators[i].setFrame(frame);
	}
	for(var i=0; i<this.slotAnimators.length; i++){
		this.slotAnimators[i].setFrame(frame);
	}
	for(var i=0; i<this.armatureAnimators.length; i++){
		this.armatureAnimators[i].runToFrame(frame);
		this.armatureAnimators[i].updateAnimation(delta);
	}
	for(var i=0; i<this.meshAnimators.length; i++){
		this.meshAnimators[i].setFrame(frame);
	}

	if(this.zOrderAnimator.isAnimated()){
		this.zOrderAnimator.setFrame(frame);
		if(this.zOrderAnimator._dirtyZ){
			this.armature.updateZOrder();
			this.zOrderAnimator._dirtyZ = false;
		}
	}
};

gdjs.sk.Animation.prototype.updateBlending = function(delta){
	this.blendTime += delta;

	if(this.blendTime > this.blendDuration){
		this.blending = false;
		this.update(this.blendTime - this.blendDuration);
		return;
	}
	
	var frame = this.getFrameAtTime(this.blendTime);

	for(var i=0; i<this.blendBones.length; i++){
		this.blendBones[i].setFrame(frame);
	}
	for(var i=0; i<this.blendSlots.length; i++){
		this.blendSlots[i].setFrame(frame);
	}
	for(var i=0; i<this.blendMeshes.length; i++){
		this.blendMeshes[i].setFrame(frame);
	}
};

gdjs.sk.Animation.prototype.getFrameAtTime = function(time){
	var frame = time * this.fps;
	if(!this.armature.skeleton.animationSmooth){
		frame = Math.round(frame);
	}
	return frame;
};

gdjs.sk.Animation.prototype.reset = function(loops=-1){
	this.playTimes = loops < 0 ? this.defaultPlayTimes : loops;
	this.playedTimes = 0;
	this.time = 0.0;
	this.finished = false;
	this.blending = false;
	this.blendTime = 0.0;
	this.blendDuration = 0.0;
	this.blendBones.length = 0;
	this.blendSlots.length = 0;
	this.blendMeshes.length = 0;
	for(var i=0; i<this.armatureAnimators.length; i++){
		this.armatureAnimators[i].reset();
	}
	this.update(0);
};

gdjs.sk.Animation.prototype.blendFrom = function(other, blendDuration){
	this.blending = true;
	this.blendDuration = blendDuration;

	var firstList = other.blending ? other.blendBones : other.boneAnimators;
	this.blendAnimators(firstList, this.boneAnimators, this.blendBones, gdjs.sk.BoneAnimator);

	firstList = other.blending ? other.blendSlots : other.slotAnimators;
	this.blendAnimators(firstList, this.slotAnimators, this.blendSlots, gdjs.sk.SlotAnimator);

	firstList = other.blending ? other.blendMeshes : other.meshAnimators;
	this.blendAnimators(firstList, this.meshAnimators, this.blendMeshes, gdjs.sk.MeshAnimator);
}

gdjs.sk.Animation.prototype.blendAnimators = function(firstList, secondList, listToPush, animatorClass){
	for(var i=0; i<firstList.length + secondList.length; i++){
		var first, second;
		if(i < firstList.length){
			first = firstList[i];
			second = secondList.find(function(element){ return element.target === first.target; });
		}
		else{
			second = secondList[i - firstList.length];
			first = firstList.find(function(element){ return element.target === second.target; });
			if(first) continue;
		}
		animator = new animatorClass();
		animator.blendFrom(first, second, this.blendDuration*this.fps);
		listToPush.push(animator);
	}
};

gdjs.sk.Animation.prototype.isFinished = function(){
	return this.finished;
};

gdjs.sk.Animation.prototype.getTime = function(time){
	return this.time;
};

gdjs.sk.Animation.prototype.setTime = function(time){
	this.blending = false;
	this.time = time %= this.getTimeLength();
	if(this.time < 0) this.time += this.getTimeLength();
};

gdjs.sk.Animation.prototype.getTimeLength = function(){
	return this.duration / this.fps;
};

gdjs.sk.Animation.prototype.getFrame = function(){
	return this.getFrameAtTime(this.time);
};

gdjs.sk.Animation.prototype.setFrame = function(frame){
	this.blending = false;
	this.setTime(frame / this.fps);
};

gdjs.sk.Animation.prototype.getFrameLength = function(){
	return this.duration;;
};


gdjs.sk.KeyChannel = function(){
	this.values = [];
	this.frames = [];
	this.easings = [];
	this.curve = undefined;
};

gdjs.sk.KeyChannel.prototype.getKey = function(frame, asAngle=false){
	if(this.frames.length === 1){
		return this.values[0];
	}
	if(frame === this.frames[this.frames.length - 1]){
		return this.values[this.values.length - 1]
	}
	for(var i=0; i<this.frames.length-1; i++){
		if(this.frames[i] <= frame && frame < this.frames[i+1]){

			if(this.easings[i] === gdjs.sk.EASING_CONST){
				return this.values[i];
			}
			else if(this.easings[i] === gdjs.sk.EASING_LINEAR){
				var frame_n = (frame - this.frames[i]) / (this.frames[i+1] - this.frames[i]);
				return this.values[i] + frame_n * (this.values[i+1] - this.values[i]);
			}
			else if(this.easings[i] === gdjs.sk.EASING_CURVE){
				return this.values[i]; // TODO Curves
			}
			break;
		}
	}
};

gdjs.sk.KeyChannel.prototype.isEmpty = function(defaultValue){
	for(var i=0; i<this.values.length; i++){
		if(this.values[i] !== defaultValue){
			return false;
		}
	}
	return true;
};


gdjs.sk.FloatChannel = function(){
	gdjs.sk.KeyChannel.call(this);
	this.defaultValue = 0;
};

gdjs.sk.FloatChannel.prototype = Object.create(gdjs.sk.KeyChannel.prototype);

gdjs.sk.FloatChannel.prototype.loadDragonBones = function(channelData, key, defaultValue){
	this.defaultValue = defaultValue;
	this.frames.push(0);

	for(var i=0; i<channelData.length; i++){
		
		var value = defaultValue;
		if(channelData[i].hasOwnProperty(key)){
			value = channelData[i][key];
		}
		this.values.push(value);


		if(channelData[i].duration !== 0){
			this.frames.push(this.frames[i] + channelData[i].duration);
		}

		if(channelData[i].hasOwnProperty("tweenEasing")){
			if(channelData[i].tweenEasing === 0){
				this.easings.push(gdjs.sk.EASING_LINEAR);
			}
			else{
				this.easings.push(gdjs.sk.EASING_CURVE);
			}
		}
		else{
			this.easings.push(gdjs.sk.EASING_CONST);
		}
	}

	if(this.frames.length > this.values.length && this.frames.length >= 2){
		this.values.push(this.values[this.frames.length - 2]);
	}
	if(this.frames.length === 1 && this.values.length === 0){
		this.values.push(defaultValue);
	}
};

gdjs.sk.FloatChannel.prototype.isEmpty = function(){
	return gdjs.sk.KeyChannel.prototype.isEmpty.call(this, this.defaultValue);
};

gdjs.sk.FloatChannel.prototype.blend = function(x0, x1, duration){
	this.values.length = 2;
	this.values[0] = x0;
	this.values[1] = x1;
	this.frames.length = 2;
	this.frames[0] = 0;
	this.frames[1] = duration;
	this.easings.push(gdjs.sk.EASING_LINEAR);
};


gdjs.sk.ColorChannel = function(){
	gdjs.sk.KeyChannel.call(this);
	this.defaultValue = [255, 255, 255];
};

gdjs.sk.ColorChannel.prototype = Object.create(gdjs.sk.KeyChannel.prototype);

gdjs.sk.ColorChannel.prototype.loadDragonBones = function(channelData, defaultValue){
	this.defaultValue = defaultValue;
	this.frames.push(0);

	for(var i=0; i<channelData.length; i++){
		
		var value = defaultValue.slice(0);
		if(channelData[i].hasOwnProperty("color")){

			value = [255, 255, 255, 1.0];

			if(channelData[i].color.hasOwnProperty("rM")){
				value[0] = Math.ceil(channelData[i].color.rM * 255 / 100.0);
			}
			if(channelData[i].color.hasOwnProperty("gM")){
				value[1] = Math.ceil(channelData[i].color.gM * 255 / 100.0);
			}
			if(channelData[i].color.hasOwnProperty("bM")){
				value[2] = Math.ceil(channelData[i].color.bM * 255 / 100.0);
			}
			if(channelData[i].color.hasOwnProperty("aM")){
				value[3] = channelData[i].color.aM / 100.0;
			}
		}
		this.values.push(value);


		if(channelData[i].duration !== 0){
			this.frames.push(this.frames[i] + channelData[i].duration);
		}

		if(channelData[i].hasOwnProperty("tweenEasing")){
			if(channelData[i].tweenEasing === 0){
				this.easings.push(gdjs.sk.EASING_LINEAR);
			}
			else{
				this.easings.push(gdjs.sk.EASING_CURVE);
			}
		}
		else{
			this.easings.push(gdjs.sk.EASING_CONST);
		}
	}

	if(this.frames.length > this.values.length && this.frames.length >= 2){
		this.values.push(this.values[this.frames.length - 2].slice(0));
	}
	if(this.frames.length === 1 && this.values.length === 0){
		this.values.push(defaultValue.slice(0));
	}
};

gdjs.sk.ColorChannel.prototype.decomposeAlpha = function(alphaChannel){
	for(var i=0; i<this.values.length; i++){
		if(this.values[i].length < 4){
			return;
		}
	}

	for(var i=0; i<this.frames.length; i++){
		alphaChannel.frames.push(this.frames[i]);
		alphaChannel.values.push(this.values[i].pop());
		if(i >= 1){
			alphaChannel.easings.push(this.easings[i-1]);
		}
	}
};

gdjs.sk.ColorChannel.prototype.getKey = function(frame){
	if(this.frames.length === 1){
		return this.values[0];
	}
	if(frame === this.frames[this.frames.length - 1]){
		return this.values[this.values.length - 1]
	}
	for(var i=0; i<this.frames.length-1; i++){
		if(this.frames[i] <= frame && frame < this.frames[i+1]){

			if(this.easings[i] === gdjs.sk.EASING_CONST){
				return this.values[i];
			}
			else if(this.easings[i] === gdjs.sk.EASING_LINEAR){
				var color = [];
				var frame_n = (frame - this.frames[i]) / (this.frames[i+1] - this.frames[i]);
				for(var j=0; j<3; j++){
					color.push(this.values[i][j] + frame_n * (this.values[i+1][j] - this.values[i][j]));
				}
				return color;
			}
			else if(this.easings[i] === gdjs.sk.EASING_CURVE){
				return this.values[i]; // TODO Curves
			}
			break;
		}
	}
};

gdjs.sk.ColorChannel.prototype.isEmpty = function(){
	for(var i=0; i<this.values.length; i++){
		for(var j=0; j<3; j++){
			if(this.values[i][j] !== this.defaultValue[j]){
				return false;
			}
		}
	}
	return true;
};

gdjs.sk.ColorChannel.prototype.blend = function(color0, color1, duration){
	this.values.length = 2;
	this.values[0] = color0;
	this.values[1] = color1;
	this.frames.length = 2;
	this.frames[0] = 0;
	this.frames[1] = duration;
	this.easings.push(gdjs.sk.EASING_LINEAR);
};


gdjs.sk.BoolChannel = function(){
	gdjs.sk.KeyChannel.call(this);
	this.defaultValue = true;
};

gdjs.sk.BoolChannel.prototype = Object.create(gdjs.sk.KeyChannel.prototype);

gdjs.sk.BoolChannel.prototype.loadDragonBones = function(channelData, key, defaultValue){
	this.defaultValue = defaultValue;
	this.frames.push(0);

	for(var i=0; i<channelData.length; i++){
		
		var value = defaultValue;
		if(channelData[i].hasOwnProperty(key)){
			if(channelData.key === -1){
				value = false;
			}
		}
		else{
			value = true;
		}
		this.values.push(value);

		if(channelData[i].duration !== 0){
			this.frames.push(this.frames[i] + channelData[i].duration);
		}

		this.easings.push(gdjs.sk.EASING_CONST);
	}

	if(this.frames.length > this.values.length && this.frames.length >= 2){
		this.values.push(this.values[this.frames.length - 2]);
	}
	if(this.frames.length === 1 && this.values.length === 0){
		this.values.push(defaultValue);
	}
};

gdjs.sk.BoolChannel.prototype.isEmpty = function(){
	return gdjs.sk.KeyChannel.prototype.isEmpty.call(this, this.defaultValue);
};

gdjs.sk.BoolChannel.prototype.blend = function(bool0, bool1, duration){
	this.values.length = 2;
	this.values[0] = bool0;
	this.values[1] = bool1;
	this.frames.length = 2;
	this.frames[0] = 0;
	this.frames[1] = duration;
	this.easings.push(gdjs.sk.EASING_CONST);
};


gdjs.sk.VertexArrayChannel = function(){
	gdjs.sk.KeyChannel.call(this);
	this.defaultValue = [];
	this.verticesToUpdate = [];
};

gdjs.sk.VertexArrayChannel.prototype = Object.create(gdjs.sk.KeyChannel.prototype);

gdjs.sk.VertexArrayChannel.prototype.loadDragonBones = function(channelData, vertexLength){

	this.defaultValue = [];
	for(var i=0; i<vertexLength; i++){
		this.defaultValue.push([0, 0]);
	}
	this.frames.push(0);

	for(var i=0; i<channelData.length; i++){
		
		var value = [];
		for(var j=0; j<vertexLength; j++){
			value.push([0, 0]);
		}

		for(var j=0; j<channelData[i].vertices.length/2; j++){
			value[j + channelData[i].offset/2][0] = channelData[i].vertices[2*j];
			value[j + channelData[i].offset/2][1] = channelData[i].vertices[2*j + 1];
		}
		this.values.push(value);

		if(channelData[i].duration !== 0){
			this.frames.push(this.frames[i] + channelData[i].duration);
		}

		if(channelData[i].hasOwnProperty("tweenEasing")){
			if(channelData[i].tweenEasing === 0){
				this.easings.push(gdjs.sk.EASING_LINEAR);
			}
			else{
				this.easings.push(gdjs.sk.EASING_CURVE);
			}
		}
		else{
			this.easings.push(gdjs.sk.EASING_CONST);
		}
	}

	if(this.frames.length > this.values.length && this.frames.length >= 2){
		this.values.push(this.values[this.frames.length - 2].slice(0));
	}
	if(this.frames.length === 1 && this.values.length === 0){
		this.values.push(this.defaultValue.slice(0));
	}

	// New empty array of verteices values
	var optimizedValues = new Array(this.values.length);
	for(i=0; i<optimizedValues.length; i++){
		optimizedValues[i] = [];
	}
	// Add to the values array animated vertices only
	for(var i=0; i<vertexLength; i++){
		for(var j=0; j<this.values.length; j++){
			if(this.values[j][i][0] !== 0 || this.values[j][i][1] !== 0){
				for(var k=0; k<this.values.length; k++){
					optimizedValues[k].push(this.values[k][i]);
				}
				this.verticesToUpdate.push(i);
				break;
			}
		}
	}
	this.values = optimizedValues;
};

gdjs.sk.VertexArrayChannel.prototype.getKey = function(frame){
	if(this.frames.length === 1){
		return this.values[0];
	}
	if(frame === this.frames[this.frames.length - 1]){
		return this.values[this.values.length - 1]
	}
	for(var i=0; i<this.frames.length-1; i++){
		if(this.frames[i] <= frame && frame < this.frames[i+1]){

			if(this.easings[i] === gdjs.sk.EASING_CONST){
				return this.values[i];
			}
			else if(this.easings[i] === gdjs.sk.EASING_LINEAR){
				var vertices = [];
				var frame_n = (frame - this.frames[i]) / (this.frames[i+1] - this.frames[i]);
				for(var j=0; j<this.verticesToUpdate.length; j++){
					vertices.push([this.values[i][j][0] + frame_n * (this.values[i+1][j][0] - this.values[i][j][0]),
								   this.values[i][j][1] + frame_n * (this.values[i+1][j][1] - this.values[i][j][1])]);
				}
				return vertices;
			}
			else if(this.easings[i] === gdjs.sk.EASING_CURVE){
				return this.values[i]; // TODO Curves
			}
			break;
		}
	}
};

gdjs.sk.VertexArrayChannel.prototype.isEmpty = function(){
	return (this.verticesToUpdate.length === 0);
};

gdjs.sk.VertexArrayChannel.prototype.blend = function(verts0, update0, verts1, update1, duration){
	var verticesToUpdate = [];
	var vertices0 = [];
	var vertices1 = [];
	for(var i=0; i<update0.length + update1.length; i++){
		var vertexIndex = i < update0.length ? update0[i] : update1[i - update0.length];
		if(verticesToUpdate.indexOf(vertexIndex) === -1){
			verticesToUpdate.push(vertexIndex);
			var index0 = update0.indexOf(vertexIndex);
			var index1 = update1.indexOf(vertexIndex);
			if(index0 === -1){
				vertices0.push([0, 0]);
			}
			else{
				vertices0.push(verts0[index0]);
			}
			if(index1 === -1){
				vertices1.push([0, 0]);
			}
			else{
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



gdjs.sk.ActionChannel = function(){
	this.frames = [];
	this.actionsLists = [];
	this._currentFrame = -1;
};

gdjs.sk.ActionChannel.prototype.loadDragonBones = function(channelData){
	this.frames.push(0);

	for(var i=0; i<channelData.length; i++){
		
		var actions = [];
		if(channelData[i].hasOwnProperty("actions")){
			for(var j=0; j<channelData[i].actions.length; j++){
				if(channelData[i].actions[j].hasOwnProperty("gotoAndPlay")){
					actions.push({type: gdjs.sk.EVENT_PLAY,
								  value: channelData[i].actions[j].gotoAndPlay});
				}
				else if(channelData[i].actions[j].hasOwnProperty("gotoAndStop")){
					actions.push({type: gdjs.sk.EVENT_PLAYSINGLE,
								  value: channelData[i].actions[j].gotoAndStop});
				}
			}
		}
		if(actions.length === 0){
			actions.push({type: gdjs.sk.EVENT_STOP, value: ""});
		}
		this.actionsLists.push(actions);


		if(channelData[i].duration !== 0){
			this.frames.push(this.frames[i] + channelData[i].duration);
		}
	}

	if(this.frames.length > this.actionsLists.length && this.frames.length >= 2){
		var actions = [];
		for(var i=0; i<this.actionsLists[this.frames.length - 2].length; i++){
			actions.push({type: this.actionsLists[this.frames.length - 2][i].type,
						  value: this.actionsLists[this.frames.length - 2][i].value});
		}
		this.actionsLists.push(actions);
	}
	if(this.frames.length === 1 && this.actionsLists.length === 0){
		this.actionsLists.push([{type: gdjs.sk.EVENT_STOP, value: ""}]); // empty list of actions
	}
};

gdjs.sk.ActionChannel.prototype.isEmpty = function(){
	for(var i=0; i<this.actionsLists.length; i++){
		for(var j=0; j<this.actionsLists[i].length; j++){
			if(this.actionsLists[i][j].type !== gdjs.sk.EVENT_STOP){
				return false;
			}
		}
	}

	return true;
};

gdjs.sk.ActionChannel.prototype.getKeysToBeginning = function(){
	var actions = this.getKeys(this.frames[this.frames.length - 1]);
	if(this.frames[0] === 0){
		for(var i=0; i<this.actionsLists[0].length; i++){
			actions.push(this.actionsLists[0][i]);
		}
	}
	this._currentFrame = 0;

	return actions;
};

gdjs.sk.ActionChannel.prototype.getKeys = function(frame){
	var actions = [];
	for(var i=0; i<this.frames.length; i++){
		if(this.frames[i] > this._currentFrame && this.frames[i] <= frame){
			for(var j=0; j<this.actionsLists[i].length; j++){
				actions.push(this.actionsLists[i][j]);
			}
		}
	}
	this._currentFrame = frame;

	return actions;
};



gdjs.sk.BoneAnimator = function(){
	this.target = null;
	this.channelX = new gdjs.sk.FloatChannel();
	this.channelY = new gdjs.sk.FloatChannel();
	this.channelRot = new gdjs.sk.FloatChannel();
	this.channelSclX = new gdjs.sk.FloatChannel();
	this.channelSclY = new gdjs.sk.FloatChannel();
	this._updateTransforms = true;
	this.lastX = 0.0;
	this.lastY = 0.0;
	this.lastRot = 0.0;
	this.lastSclX = 1.0;
	this.lastSclY = 1.0;
}; 

gdjs.sk.BoneAnimator.prototype.loadDragonBones = function(boneAnimData, bones){
	this.target = bones[boneAnimData.name];

	this.channelX.loadDragonBones(boneAnimData.translateFrame, "x", 0);
	this.channelY.loadDragonBones(boneAnimData.translateFrame, "y", 0);
	this.channelRot.loadDragonBones(boneAnimData.rotateFrame, "rotate", 0);
	this.channelSclX.loadDragonBones(boneAnimData.scaleFrame, "x", 1.0);
	this.channelSclY.loadDragonBones(boneAnimData.scaleFrame, "y", 1.0);

	if(this.channelX.isEmpty() && this.channelY.isEmpty() &&
	   this.channelRot.isEmpty() &&
	   this.channelSclX.isEmpty() && this.channelSclY.isEmpty()){
		this._updateTransforms = false;
	}

	// Fix rotations to move to the closest angle
	for(var i=1; i<this.channelRot.values.length; i++){
		if(this.channelRot.values[i] <= 0){
			if(Math.abs(this.channelRot.values[i]       - this.channelRot.values[i-1]) >
			   Math.abs(this.channelRot.values[i] + 360 - this.channelRot.values[i-1])){
				this.channelRot.values[i] += 360;
			}
		}
		if(this.channelRot.values[i] >= 0){
			if(Math.abs(this.channelRot.values[i]       - this.channelRot.values[i-1]) >
			   Math.abs(this.channelRot.values[i] - 360 - this.channelRot.values[i-1])){
				this.channelRot.values[i] -= 360;
			}
		}
	}
};

gdjs.sk.BoneAnimator.prototype.setFrame = function(frame){
	if(this._updateTransforms){
		this.lastX = this.channelX.getKey(frame);
		this.lastY = this.channelY.getKey(frame);
		this.lastRot = this.channelRot.getKey(frame);
		this.lastSclX = this.channelSclX.getKey(frame);
		this.lastSclY = this.channelSclY.getKey(frame);
		this.target.setPos(this.lastX, this.lastY);
		this.target.setRot(this.lastRot);
		this.target.setScale(this.lastSclX, this.lastSclY);
	}
};

gdjs.sk.BoneAnimator.prototype.isAnimated = function(){
	return this._updateTransforms;
};

gdjs.sk.BoneAnimator.prototype.blendFrom = function(first, second, duration){
	this.target = first ? first.target : second.target;
	var x0 = first ? first.lastX : 0.0;
	var y0 = first ? first.lastY : 0.0;
	var rot0 = first ? first.lastRot : 0.0;
	var sx0 = first ? first.lastSclX : 1.0;
	var sy0 = first ? first.lastSclY : 1.0;
	var x1 = second ? second.channelX.getKey(0) : 0.0;
	var y1 = second ? second.channelY.getKey(0) : 0.0;
	var rot1 = second ? second.channelRot.getKey(0) : 0.0;
	var sx1 = second ? second.channelSclX.getKey(0) : 1.0;
	var sy1 = second ? second.channelSclY.getKey(0) : 1.0;
	this.channelX.blend(x0, x1, duration);
	this.channelY.blend(y0, y1, duration);
	this.channelRot.blend(rot0, rot1, duration);
	this.channelSclX.blend(sx0, sx1, duration);
	this.channelSclY.blend(sy0, sy1, duration);
};



gdjs.sk.SlotAnimator = function(){
	this.target = undefined;
	this.channelColor = new gdjs.sk.ColorChannel();
	this.channelAlpha = new gdjs.sk.FloatChannel();
	this.channelVisible = new gdjs.sk.BoolChannel();
	this._updateColor = true;
	this._updateAlpha = true;
	this._updateVisible = true;
	this.lastColor = [255, 255, 255];
	this.lastAlpha = 1.0;
	this.lastVisible = true;
};

gdjs.sk.SlotAnimator.prototype.loadDragonBones = function(slotAnimData, slots){
	this.target = slots[slotAnimData.name];

	this.channelColor.loadDragonBones(slotAnimData.colorFrame, [this.target.defaultR,
																this.target.defaultG,
																this.target.defaultB,
																this.target.defaultAlpha]);
	if(this.channelColor.isEmpty()){
		this._updateColor = false;
	}

	this.channelAlpha.defaultValue = this.target.defaultAlpha;
	this.channelColor.decomposeAlpha(this.channelAlpha);
	if(this.channelAlpha.isEmpty()){
		this._updateAlpha = false;
	}

	this.channelVisible.loadDragonBones(slotAnimData.displayFrame, "value", this.defaultVisible);
	if(this.channelVisible.isEmpty(this.target.defaultVisible)){
		this._updateVisible = false;
	}

	this.lastColor[0] = this.target.defaultR;
	this.lastColor[1] = this.target.defaultG;
	this.lastColor[2] = this.target.defaultB;
	this.lastAlpha = this.target.defaultAlpha;
	this.lastVisible = this.target.defaultVisible;
};

gdjs.sk.SlotAnimator.prototype.setFrame = function(frame){
	if(this._updateColor){
		this.lastColor = this.channelColor.getKey(frame);
		this.target.setColor(...this.lastColor);
	}
	if(this._updateAlpha){
		this.lastAlpha = this.channelAlpha.getKey(frame);
		this.target.setAlpha(this.lastAlpha);
	}
	if(this._updateVisible){
		this.lastVisible = this.channelVisible.getKey(frame);
		this.target.setVisible(this.lastVisible);
	}
	if(this.target.skinned){
		this.target.updateSkinning();
	}
};

gdjs.sk.SlotAnimator.prototype.isAnimated = function(){
	return (this._updateColor || this._updateAlpha || this._updateVisible || this.target.skinned);
};

gdjs.sk.SlotAnimator.prototype.blendFrom = function(first, second, duration){
	this.target = first ? first.target : second.target;
	var color0 = first ? first.lastColor : [this.target.defaultR, this.target.defaultG, this.target.defaultB];
	var alpha0 = first ? first.lastAlpha : this.target.defaultAlpha;
	var visible0 = first ? first.lastVisible : this.target.defaultVisible;
	var color1 = second ? second.channelColor.getKey(0) : [this.target.defaultR, this.target.defaultG, this.target.defaultB];
	var alpha1 = second ? second.channelAlpha.getKey(0) : this.target.defaultAlpha;
	var visible1 = second ? second.channelVisible.getKey(0) : this.target.defaultVisible;
	this.channelColor.blend(color0, color1, duration);
	this.channelAlpha.blend(alpha0, alpha1, duration);
	this.channelVisible.blend(visible0, visible1, duration);
};



gdjs.sk.MeshAnimator = function(){
	this.target = undefined;
	this.channelVertices = new gdjs.sk.VertexArrayChannel();
	this._updateVertices = true;
	this.lastVertices = [];
};

gdjs.sk.MeshAnimator.prototype.loadDragonBones = function(ffdAnimData, slots){
	this.target = slots[ffdAnimData.slot];

	this.channelVertices.loadDragonBones(ffdAnimData.frame, this.target.defaultVertices.length);

	if(this.channelVertices.isEmpty()){
		this._updateVertices = false;
	}
};

gdjs.sk.MeshAnimator.prototype.isAnimated = function(){
	return this._updateVertices;
};

gdjs.sk.MeshAnimator.prototype.setFrame = function(frame){
	this.lastVertices = this.channelVertices.getKey(frame);
	this.target.setVertices(this.lastVertices, this.channelVertices.verticesToUpdate);
};

gdjs.sk.MeshAnimator.prototype.blendFrom = function(first, second, duration){
	this.target = first ? first.target : second.target;
	var verts0 = first ? first.lastVertices : [];
	var update0 = first ? first.channelVertices.verticesToUpdate : [];
	var verts1 = second ? second.channelVertices.getKey(0) : [];
	var update1 = second ? second.channelVertices.verticesToUpdate : [];
	this.channelVertices.blend(verts0, update0, verts1, update1, duration);
};



gdjs.sk.ZOrderAnimator = function(slots){
	this.values = [];
	this.frames = [];
	this.target = [];
	this._updateZOrder = false;
	this._lastFrameSet = -1;
	this._dirtyZ = true;

	for(var i=0; i<slots.length; i++){
		this.target.push(slots[i]);
	}
	this.target.sort(function(a, b){ return a.defaultZ - b.defaultZ; });
};

gdjs.sk.ZOrderAnimator.prototype.loadDragonBones = function(zOrderAnimData){
	this.frames.push(0);

	// Default slots z
	var defaultOrder = new Array();
	for(var i=0; i<this.target.length; i++){
		defaultOrder.push(this.target[i].defaultZ);
	}

	// Add frames and values
	for(var i=0; i<zOrderAnimData.length; i++){

		var value = new Array(this.target.length);
		var frameData = zOrderAnimData[i];

		for(var j=0; j<this.target.length; j++){
			var deltaPos = 0;

			for(var k=0; k<frameData.zOrder.length; k+=2){
				if(frameData.zOrder[k] > j + deltaPos &&
				   frameData.zOrder[k] + frameData.zOrder[k+1] <= j + deltaPos){
					deltaPos += 1;
				}
				else if(frameData.zOrder[k] < j + deltaPos &&
						frameData.zOrder[k] + frameData.zOrder[k+1] >= j + deltaPos){
					deltaPos -= 1;
				}
			}

			for(var k=0; k<frameData.zOrder.length; k+=2){
				if(j === frameData.zOrder[k]){
					deltaPos = frameData.zOrder[k+1];
					break;
				}
			}

			value[j] = j + deltaPos;
		}

		this.values.push(value);

		if(frameData.duration !== 0){
			this.frames.push(this.frames[i] + frameData.duration);
		}
	}

	// Copy previous value if not completed
	if(this.frames.length > this.values.length && this.frames.length >= 2){
		this.values.push(this.values[this.frames.length - 2]);
	}
	// Add an empty value if no frames
	if(this.frames.length === 1 && this.values.length === 0){
		this.values.push(defaultOrder);
	}

	// Check for empty animation
	for(var i=0; i<this.values.length; i++){
		for(var j=0; j<this.values[i].length; j++){
			if(this.values[i][j] !== j){
				this._updateZOrder = true;
			}
		}
	}
};

gdjs.sk.ZOrderAnimator.prototype.setFrame = function(frame){
	var zValues;
	var frameToSet = this._lastFrameSet;

	if(this.frames.length === 1){
		zValues = this.values[0];
		frameToSet = this.frames[0];
	}
	else if(frame === this.frames[this.frames.length - 1]){
		zValues = this.values[this.values.length - 1];
		frameToSet = this.frames[this.frames.length - 1];
	}
	else{	
		for(var i=0; i<this.frames.length-1; i++){
			if(this.frames[i] <= frame && frame < this.frames[i+1]){
				zValues = this.values[i];
				frameToSet = this.frames[i];
				break;
			}
		}
	}

	if(frameToSet !== this._lastFrameSet){
		for(var i=0; i<this.target.length; i++){
			this.target[i].setZ(zValues[i]);
		}
		this._lastFrameSet = frameToSet;
		this._dirtyZ = true;
	}
};

gdjs.sk.ZOrderAnimator.prototype.isAnimated = function(){
	return this._updateZOrder;
};



gdjs.sk.ArmatureAnimator = function(){
	this.target = undefined;
	this.channelAction = new gdjs.sk.ActionChannel();
	this._updateAction = true;
};

gdjs.sk.ArmatureAnimator.prototype.loadDragonBones = function(slotAnimData, slots){
	this.target = slots[slotAnimData.name];

	this.channelAction.loadDragonBones(slotAnimData.displayFrame);

	if(this.channelAction.isEmpty()){
		this._updateAction = false;
	}
};

gdjs.sk.ArmatureAnimator.prototype.runToBeginning = function(frame){
	var actions = this.channelAction.getKeysToBeginning();
	if(actions.length > 0){
		this.runActions(actions);
	}
};

gdjs.sk.ArmatureAnimator.prototype.runToFrame = function(frame){
	var actions = this.channelAction.getKeys(frame);
	if(actions.length > 0){
		this.runActions(actions);
	}
};

gdjs.sk.ArmatureAnimator.prototype.runActions = function(actions){
	for(var i=0; i<actions.length; i++){
		if(actions[i].type === gdjs.sk.EVENT_STOP){
			this.target.childArmature.resetState();
			this.target.childArmature.currentAnimation = -1;
		}
		else if(actions[i].type === gdjs.sk.EVENT_PLAY){
			this.target.childArmature.setAnimationName(actions[i].value);
		}
		else if(actions[i].type === gdjs.sk.EVENT_PLAYSINGLE){
			this.target.childArmature.setAnimationName(actions[i].value, 1);
		}
	}
};

gdjs.sk.ArmatureAnimator.prototype.isAnimated = function(){
	return this._updateAction;
};

gdjs.sk.ArmatureAnimator.prototype.reset = function(){
	this.channelAction._currentFrame = -1;
};

gdjs.sk.ArmatureAnimator.prototype.updateAnimation = function(delta, smooth){
	this.target.childArmature.updateAnimation(delta, smooth);
};
