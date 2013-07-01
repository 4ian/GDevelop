/*
 *  Game Develop JS Platform
 *  2013 Florian Rival (Florian.Rival@gmail.com)
 */

/**
 * The textRuntimeObject displays a text on the screen.
 *
 * @class textRuntimeObject
 * @extends runtimeObject
 */
gdjs.textRuntimeObject = function(runtimeScene, objectXml)
{
    var that = gdjs.runtimeObject(runtimeScene, objectXml);
    var my = {};
    
    my.characterSize = parseInt($(objectXml).find("CharacterSize").attr("value"));
    my.fontName = "Arial";
    my.bold = $(objectXml).attr("bold") == "true";
    my.italic = $(objectXml).attr("italic") == "true";
    my.underlined = $(objectXml).attr("underlined") == "true";
    my.color = [parseInt($(objectXml).find("Color").attr("r")), 
                parseInt($(objectXml).find("Color").attr("g")),
                parseInt($(objectXml).find("Color").attr("b"))];
    if ( $(objectXml).find("Font").attr("value") != "" ) {
        my.fontName = "\"gdjs_font_"+$(objectXml).find("Font").attr("value")+"\"";
    }
     
    var text = $(objectXml).find("String").attr("value");
    if ( text.length === 0 ) text = " ";
    my.text = new PIXI.Text(text, {align:"left"});
    my.text.anchor.x = 0.5;
    my.text.anchor.y = 0.5;
    runtimeScene.getLayer("").addChildToPIXIContainer(my.text, that.zOrder);

    that.deleteFromScene = function(runtimeScene) {
        runtimeScene.markObjectForDeletion(that);
        runtimeScene.getLayer(that.layer).removePIXIContainerChild(my.text);
    }
    
    my.updateTextStyle = function() {
        style = {align:"left"};
        style.font = my.characterSize+"px"+" "+my.fontName;
        if ( my.bold ) style.font += " bold";
        if ( my.italic ) style.font += " italic";
        //if ( my.underlined ) style.font += " underlined"; Not supported :/
        style.fill = "#"+gdjs.rgbToHex(my.color[0], my.color[1], my.color[2]);
        my.text.setStyle(style);
    }
    my.updateTextStyle();
    
    my.updateTextPosition = function() {
        my.text.position.x = that.x+my.text.width/2;
        my.text.position.y = that.y+my.text.height/2;
        that.hitBoxesDirty = true;
    }
    my.updateTextPosition();

    that.setX = function(x) {
        that.x = x;
        my.updateTextPosition();
    }

    that.setY = function(y) {
        that.y = y;
        my.updateTextPosition();
    }

    that.setAngle = function(angle) {
        that.angle = angle;
		my.text.rotation = gdjs.toRad(angle);
    }

    that.setOpacity = function(opacity) {
        if ( opacity < 0 ) opacity = 0;
        if ( opacity > 255 ) opacity = 255;

        that.opacity = opacity;
        my.text.alpha = opacity/255; 
    }

    that.getOpacity = function() {
        return that.opacity;
    }
    
    that.getString = function() {
        return my.text.text;
    }
    
    that.setString = function(str) {
        if ( str.length === 0 ) str = " ";
        my.text.setText(str);
        my.updateTextPosition();
    }
    
    that.getCharacterSize = function() {
        return my.characterSize;
    }
    
    that.setCharacterSize = function(newSize) {
        my.characterSize = newSize;
        my.updateTextStyle();
    }
    
    that.isBold = function() {
        return my.bold;
    }
    
    that.setBold = function(enable) {
        my.bold = enable;
        my.updateTextStyle();
    }
    
    that.isItalic = function() {
        return my.italic;
    }
    
    that.setItalic = function(enable) {
        my.italic = enable;
        my.updateTextStyle();
    }

    that.hide = function(enable) {
        if ( enable == undefined ) enable = true;
        my.hidden = enable;
        my.text.visible = !enable;
    }

    that.setLayer = function(name) {
        //We need to move the object from the pixi container of the layer
        runtimeScene.getLayer(that.layer).removePIXIContainerChild(my.text);
        that.layer = name;
        runtimeScene.getLayer(that.layer).addChildToPIXIContainer(my.text, that.zOrder);
    }

    that.getWidth = function() {
        return my.text.width;
    }

    that.getHeight = function() {
        return my.text.height;
    }
    
    that.setColor = function(str) {
        my.color = str.split(";");
        my.updateTextStyle();
    }

    /**
     * Set the Z order of the object.
     *
     * @method setZOrder
     * @param z {Number} The new Z order position of the object
     */
    that.setZOrder = function(z) {
        if ( z != that.zOrder ) {
            runtimeScene.getLayer(that.layer).changePIXIContainerChildZOrder(my.text, z);
            that.zOrder = z;
        }
    }

    return that;
}

//Notify gdjs that the textRuntimeObject exists.
gdjs.textRuntimeObject.thisIsARuntimeObjectConstructor = "TextObject::Text";
