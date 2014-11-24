animateObjects = function(runtimeScene, objects) {
	for(var i = 0;i<objects.length;++i) {
		objects[i].setAngle(Math.cos(runtimeScene.getTimeFromStart()/100)*90);
	}
}