alertObjectPosition = function(objects) {
	if (!objects[0]) {
		return;
	}
	window.alert("You clicked on object at position "+
		objects[0].getX()+";"+objects[0].getY()+"!");
}

