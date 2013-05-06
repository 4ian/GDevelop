
/**
 * The runtimeScene object represents a scene being played and rendered in the browser in a canvas.
 * 
 * TODO : Variables
 *
 * @class runtimeScene 
 * @param PixiRenderer The PIXI.Renderer to be used
 */
gdjs.runtimeScene = function(pixiRenderer)
{
    var that = {};
    var my = {};
    
    my.pixiRenderer = pixiRenderer;
    my.instances = new Hashtable();
    my.objects = new Hashtable();
    my.pixiStage = new PIXI.Stage();
    my.latestFrameDate = new Date;
    
    /**
     * Load the runtime scene from the given scene.
     * \param sceneXml A jquery object containing the scene in XML format.
     */
    that.loadFromScene = function(sceneXml)
    {
        document.title = $(sceneXml).attr("titre");
        
        var bgColor = gdjs.rgbToHex(parseInt($(sceneXml).attr("r")), 
                                    parseInt($(sceneXml).attr("v")),
                                    parseInt($(sceneXml).attr("b")));
        my.pixiStage.setBackgroundColor("0x"+bgColor);
        
        //Load objects
        $(sceneXml).find("Objets").find("Objet").each( function() { 
            var objectName = $(this).attr("nom");
            
            my.objects.put(objectName, $(this));
            my.instances.put(objectName, []); //Also reserve an array for the instances
            console.log("Loaded "+objectName+" in memory");
        });
        
        //Create initial instances of objects
        $(sceneXml).find("Positions").find("Objet").each( function() { 
            
            var objectName = $(this).attr("nom");
            
            if ( my.objects.get(objectName) === null ) {
                console.log("Unable to create an instance for object"+objectName+"!");
            }
            else {
            
                var associatedObject = my.objects.get(objectName);
                
                newObject = gdjs.spriteRuntimeObject(that, associatedObject);
                newObject.setPosition(parseFloat($(this).attr("x")), parseFloat($(this).attr("y")));
                newObject.setZOrder(parseFloat($(this).attr("plan")));
                newObject.setAngle(parseFloat($(this).attr("angle")));
                
                that.addObject(newObject);
            }
        });
        
    }
    
    /**
     * Step and render the scene.
     * Should be called in a game loop.
     */
    that.renderAndStep = function()
    {
        my.updateTime();
        that.render();
    }
    
    that.render = function()
    {
        //TODO: Sort objects by Z order.
    
        // render the PIXI stage   
        my.pixiRenderer.render(my.pixiStage);
    }
    
    /**
     * Called when rendering to do all times related management.
     * @todo
     */
    my.updateTime = function()
    {
        var now = new Date;
        var elapsedTime = now - my.latestFrameDate;
        my.latestFrameDate = now;
    }
    
    /**
     * Add an object to the instances living on the scene.
     * \param obj The object to be added.
     */
    that.addObject = function(obj)
    {
        if ( !my.instances.containsKey(obj.name) ) {
            console.log("RuntimeScene.addObject: No objects called \""+obj.name+"\"! Adding it.");
            my.instances.put(obj.name, []);
        }
    
        my.instances.get(obj.name).push(obj);
    }
    
    /**
     * Get all the instances of the object called name.
     * \param name Name of the object the instances must be returned.
     */
    that.getObjects = function(name)
    {
        if ( !my.instances.containsKey(name) ) {
            console.log("RuntimeScene.getObjects: No instances called \""+name+"\"! Adding it.");
            my.instances.put(name, []);
        }
    
        return my.instances.get(name);
    }
    
    /**
     * Get the PIXI.Stage associated to the RuntimeScene.
     */
    that.getPIXIStage = function()
    {
        return my.pixiStage;
    }
    
    return that;
}