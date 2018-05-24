gdjs.RuntimeGamePixiRenderer = function(game, width, height, forceFullscreen)
{
    this._game = game;

    this._isFullscreen = true; //Used to track if the canvas is displayed as fullscreen (see setFullscreen method).
    this._forceFullscreen = forceFullscreen; //If set to true, the canvas will always be displayed as fullscreen, even if _isFullscreen == false.
    this._pixiRenderer = null;
    this._canvasArea = null;
    this._currentWidth = width; //Current size of the canvas
    this._currentHeight = height;
    this._keepRatio = true;
    this._reduceIfNeed = true;
    this._marginLeft = this._marginTop = this._marginRight = this._marginBottom = 0;

    if (navigator.isCocoonJS && !this._forceFullscreen) {
        this._forceFullscreen = true;
        console.log("Forcing fullscreen for CocoonJS.");
    }
    if ( typeof intel != "undefined" ) {
        this._forceFullscreen = true;
        console.log("Forcing fullscreen for Intel XDK.");
    }
}

gdjs.RuntimeGameRenderer = gdjs.RuntimeGamePixiRenderer; //Register the class to let the engine use it.

/**
 * Create a standard canvas inside canvasArea.
 *
 * @method createStandardCanvas
 */
gdjs.RuntimeGamePixiRenderer.prototype.createStandardCanvas = function(canvasArea) {
    this._canvasArea = canvasArea;

    //Create the renderer and setup the rendering area
    this._pixiRenderer = PIXI.autoDetectRenderer(this._game.getDefaultWidth(), this._game.getDefaultHeight());
    canvasArea.style["position"] = "absolute";
    canvasArea.appendChild(this._pixiRenderer.view); // add the renderer view element to the DOM
    canvasArea.tabindex = "1"; //Ensure that the canvas has the focus.
    canvasArea.style.overflow = "hidden"; //No scrollbar in any case.
    this.resize();

    //Handle resize
    var that = this;
    window.addEventListener("resize", function() {
        that.resize();
        that._game._notifySceneForResize = true;
    });

    return this._pixiRenderer;
};

/**
 * Get the current width of the canvas.
 * @method getCurrentWidth
 */
gdjs.RuntimeGamePixiRenderer.prototype.getCurrentWidth = function() {
    return this._currentWidth;
};

/**
 * Get the current height of the canvas.
 * @method getCurrentHeight
 */
gdjs.RuntimeGamePixiRenderer.prototype.getCurrentHeight = function() {
    return this._currentHeight;
};

/**
 * Change the size of the canvas displaying the game.
 * Note that if the canvas is fullscreen, it won't be resized, but when going back to
 * non fullscreen mode, the requested size will be used.
 *
 * @method setSize
 * @param width {Number} The new width
 * @param height {Number} The new height
 */
gdjs.RuntimeGamePixiRenderer.prototype.setSize = function(width, height) {
    this._currentWidth = width;
    this._currentHeight = height;

    this.resize();
    this._game._notifySceneForResize = true;
};


/**
 * Resize the canvas, according to _isFullscreen, _forceFullscreen, _currentWidth,
 * _currentHeight, _marginTop, _marginLeft, _marginRight, _marginBottom, _keepRatio.
 *
 * @method _resizeCanvas
 * @private
 */
gdjs.RuntimeGamePixiRenderer.prototype.resize = function() {
    var keepRatio = this._keepRatio;

    var reduceIfNeed = this._reduceIfNeed;
    var isFullscreen = this._forceFullscreen || this._isFullscreen;
    var width = this.getCurrentWidth();
    var height = this.getCurrentHeight();
    var marginLeft = this._marginLeft;
    var marginTop = this._marginTop;
    var marginRight = this._marginRight;
    var marginBottom = this._marginBottom;
    var maxWidth = window.innerWidth-marginLeft-marginRight;
    var maxHeight = window.innerHeight-marginTop-marginBottom;
    if (maxWidth < 0) maxWidth = 0;
    if (maxHeight < 0) maxHeight = 0;

    if (isFullscreen && !keepRatio) {
        width = maxWidth;
        height = maxHeight;
    } else if (isFullscreen && keepRatio ||
        (reduceIfNeed && (width > maxWidth || height > maxHeight))) {
        var factor = maxWidth/width;
        if (height*factor > maxHeight) factor = maxHeight/height;

        width *= factor;
        height *= factor;
    }

    if (this._pixiRenderer.width !== width || this._pixiRenderer.height !== height)
        this._pixiRenderer.resize(width, height);

    this._canvasArea.style["top"] = ((marginTop+(maxHeight-height)/2)+"px");
    this._canvasArea.style["left"] = ((marginLeft+(maxWidth-width)/2)+"px");
    this._canvasArea.style.width = width+"px";
    this._canvasArea.style.height = height+"px";
};

/**
 * Set if the aspect ratio must be kept when the game rendering area is resized.
 */
gdjs.RuntimeGamePixiRenderer.prototype.keepAspectRatio = function(enable) {
    if (this._keepRatio === enable) return;

    this._keepRatio = enable;
    this.resize();
    this._game._notifySceneForResize = true;
};

/**
 * Change the margin that must be preserved around the game.
 */
gdjs.RuntimeGamePixiRenderer.prototype.setMargins = function(top, right, bottom, left) {
    if (this._marginTop === top && this._marginRight === right && this._marginBottom === bottom &&
        this._marginLeft === left)
        return;

    this._marginTop = top;
    this._marginRight = right;
    this._marginBottom = bottom;
    this._marginLeft = left;
    this.resize();
    this._game._notifySceneForResize = true;
};

/**
 * De/activate fullscreen for the game.
 * @method setFullScreen
 */
gdjs.RuntimeGamePixiRenderer.prototype.setFullScreen = function(enable) {
    if (this._forceFullscreen) return;

    if (this._isFullscreen !== enable) {
        this._isFullscreen = !!enable;
        this.resize();
        this._notifySceneForResize = true;

        if (this._isFullscreen) {
            if(document.documentElement.requestFullScreen) {
                document.documentElement.requestFullScreen();
            } else if(document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            } else if(document.documentElement.webkitRequestFullScreen) {
                document.documentElement.webkitRequestFullScreen();
            }
        }
        else {
            if(document.cancelFullScreen) {
                document.cancelFullScreen();
            } else if(document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if(document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            }
        }
    }
};

/**
 * Add the standard events handler.
 * @method bindStandardEvents
 */
gdjs.RuntimeGamePixiRenderer.prototype.bindStandardEvents = function(manager, window, document) {
    var renderer = this._pixiRenderer;
    var canvasArea = this._canvasArea;

    //Translate an event (mouse or touch) made on the canvas on the page
    //to game coordinates.
    var that = this;
    function getEventPosition(e) {
        var pos = [0,0];
        if (e.pageX) {
            pos[0] = e.pageX-canvasArea.offsetLeft;
            pos[1] = e.pageY-canvasArea.offsetTop;
        } else {
            pos[0] = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft-canvasArea.offsetLeft;
            pos[1] = e.clientY + document.body.scrollTop + document.documentElement.scrollTop-canvasArea.offsetTop;
        }

        //Handle the fact that the game is stretched to fill the canvas.
        pos[0] *= that._game.getDefaultWidth()/renderer.view.width;
        pos[1] *= that._game.getDefaultHeight()/renderer.view.height;

        return pos;
    }

    //Some browsers lacks definition of some variables used to do calculations
    //in getEventPosition. They are defined to 0 as they are useless.
    (function ensureOffsetsExistence() {
        if ( isNaN(canvasArea.offsetLeft) ) {
            canvasArea.offsetLeft = 0;
            canvasArea.offsetTop = 0;
        }
        if ( isNaN(document.body.scrollLeft) ) {
            document.body.scrollLeft = 0;
            document.body.scrollTop = 0;
        }
        if ( document.documentElement === undefined || document.documentElement === null ) {
            document.documentElement = {};
        }
        if ( isNaN(document.documentElement.scrollLeft) ) {
            document.documentElement.scrollLeft = 0;
            document.documentElement.scrollTop = 0;
        }
        if ( isNaN(canvasArea.offsetLeft) ) {
            canvasArea.offsetLeft = 0;
            canvasArea.offsetTop = 0;
        }
    })();

    //Keyboard
    document.onkeydown = function(e) {
        manager.onKeyPressed(e.keyCode);
    };
    document.onkeyup = function(e) {
        manager.onKeyReleased(e.keyCode);
    };
    //Mouse
    renderer.view.onmousemove = function(e){
        var pos = getEventPosition(e);
        manager.onMouseMove(pos[0], pos[1]);
    };
    renderer.view.onmousedown = function(e){
        manager.onMouseButtonPressed(e.button === 2 ? 1 : 0);
        if (window.focus !== undefined) window.focus();
        return false;
    };
    renderer.view.onmouseup = function(e){
        manager.onMouseButtonReleased(e.button === 2 ? 1 : 0);
        return false;
    };
    renderer.view.onmouseout = function(e){
        manager.onMouseButtonReleased(0);
        manager.onMouseButtonReleased(1);
        manager.onMouseWheel(0);
        return false;
    };
    window.addEventListener('click', function(e) {
        if (window.focus !== undefined) window.focus();
        e.preventDefault();
        return false;
    }, false);
    renderer.view.oncontextmenu = function(event) {
        event.preventDefault();
        event.stopPropagation();
        return false;
    };
    renderer.view.onmousewheel = function (event){
        manager.onMouseWheel(event.wheelDelta);
    };
    //Touches
    //Also simulate mouse events when receiving touch events
    window.addEventListener('touchmove', function(e){
        e.preventDefault();
        if (e.changedTouches) {
            for(var i = 0;i<e.changedTouches.length;++i) {
                var pos = getEventPosition(e.changedTouches[i]);
                manager.onTouchMove(e.changedTouches[i].identifier, pos[0], pos[1]);
            }
        }
    });
    window.addEventListener('touchstart', function(e){
        e.preventDefault();
        if (e.changedTouches) {
            for(var i = 0;i<e.changedTouches.length;++i) {
                var pos = getEventPosition(e.changedTouches[i]);
                manager.onTouchStart(e.changedTouches[i].identifier, pos[0], pos[1]);
            }
        }
        return false;
    });
    window.addEventListener('touchend', function(e){
        e.preventDefault();
        if (e.changedTouches) {
            for(var i = 0;i<e.changedTouches.length;++i) {
                var pos = getEventPosition(e.changedTouches[i]);
                manager.onTouchEnd(e.changedTouches[i].identifier);
            }
        }
        return false;
    });
};

gdjs.RuntimeGamePixiRenderer.prototype.setWindowTitle = function(title) {
    if (typeof document !== 'undefined') document.title = title;
}

gdjs.RuntimeGamePixiRenderer.prototype.getWindowTitle = function() {
    return (typeof document !== 'undefined') ? document.title : '';
}

gdjs.RuntimeGamePixiRenderer.prototype.startGameLoop = function(fn) {
    requestAnimationFrame(gameLoop);

    var oldTime = null;
    function gameLoop(time) {
        var dt = oldTime ? time - oldTime : 0;
        oldTime = time;

        if (fn(dt)) requestAnimationFrame(gameLoop);
    }
}

gdjs.RuntimeGamePixiRenderer.prototype.getPIXIRenderer = function() {
    return this._pixiRenderer;
}

gdjs.RuntimeGamePixiRenderer.getScreenWidth = function() {
    return (typeof window !== "undefined") ? window.innerWidth : 800;
}

gdjs.RuntimeGamePixiRenderer.getScreenHeight = function() {
    return (typeof window !== "undefined") ? window.innerHeight : 800;
}