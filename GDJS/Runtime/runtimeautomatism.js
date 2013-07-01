/*
 * Game Develop JS Platform
 * Copyright 2013 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

/**
 * The runtimeAutomatism represents an automatism being used by a runtimeObject.
 *
 * @class runtimeAutomatism
 * @constructor 
 */
gdjs.runtimeAutomatism = function(runtimeScene, automatismXml)
{
    var that = {};
    var my = {};
    
    that.name = $(automatismXml).attr("Name") || "";
    that.type = $(automatismXml).attr("Type") || "";
    my.nameId = gdjs.runtimeObject.getNameIdentifier(that.name);
    my.activated = true;
    that.owner = null;
    
    /**
     * Get the name of the automatism.
     * @method getName
     * @return {String} The automatism's name.
     */
    that.getName = function() {
        return that.name;
    }
    
    /**
     * Get the name identifier of the automatism.
     * @method getNameId
     * @return {Number} The automatism's name identifier.
     */
    that.getNameId = function() {
        return my.nameId;
    }
    
    /**
     * Set the object owning this automatism
     * @method setOwner
     * @param obj The object using the automatism
     */
    that.setOwner = function(obj) {
        that.owner = obj;
    }
    
    /**
     * Called at each frame before events. Call doStepPreEvents.<br>
     * Automatisms writers: Please do not redefine this method. Redefine doStepPreEvents instead.
     * @method stepPreEvents
     * @param runtimeScene The runtimeScene owning the object
     */
    that.stepPreEvents = function(runtimeScene) {
        if ( my.activated ) that.doStepPreEvents(runtimeScene);
    }

    /**
     * Called at each frame after events. Call doStepPostEvents.<br>
     * Automatisms writers: Please do not redefine this method. Redefine doStepPreEvents instead.
     * @method stepPostEvents
     * @param runtimeScene The runtimeScene owning the object
     */
    that.stepPostEvents = function(runtimeScene) {
        if ( my.activated ) that.doStepPostEvents(runtimeScene);
    }

    /**
     * De/Activate the automatism
     * @method activate
     */
    that.activate = function(enable) { 
        if ( enable == undefined ) enable = true;
        if ( !my.activated && enable ) { 
            my.activated = true; 
            that.onActivate(); 
        } 
        else if ( activated && !enable ) { 
            my.activated = false; 
            that.onDeActivate(); 
        } 
    };

    /**
     * Return true if the automatism is activated
     * @method activated
     */
    that.activated = function() { 
        return my.activated; 
    }

    /**
     * Automatisms writers: Reimplement this method to do extra work 
     * when the automatism is activated
     * @method onActivate
     */
    that.onActivate = function() {
    
    }
    
    /**
     * Automatisms writers: Reimplement this method to do extra work
     * when the automatism is deactivated
     * @method activated
     */
    that.onDeActivate = function() {
    
    }
    
    /**
     * Automatisms writers: This method is called each tick before events are done.
     * @method doStepPreEvents
     * @param runtimeScene The runtimeScene owning the object
     */
    that.doStepPreEvents = function(runtimeScene) {
    
    }
    
    /**
     * Automatisms writers: This method is called each tick after events are done.
     * @method doStepPostEvents
     * @param runtimeScene The runtimeScene owning the object
     */
    that.doStepPostEvents = function(runtimeScene) {
    
    }
    
    return that;
}

//Notify gdjs that the runtimeAutomatism exists.
gdjs.runtimeAutomatism.thisIsARuntimeAutomatismConstructor = "";