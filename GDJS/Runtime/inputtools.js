/*
 * GDevelop JS Platform
 * Copyright 2013-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * Tools related to input ( Keyboard, mouse ), for events generated code.
 *
 * TODO : Map all keys<br>
 * TODO : Implement others buttons for mouse<br>
 *
 * @namespace gdjs.evtTools
 * @class input
 * @static
 * @private
 */
gdjs.evtTools.input = gdjs.evtTools.input || {};

/**
 * Return true if the specified key is pressed
 * TODO: Map all keys and uses a hash table.
 * @method isKeyPressed
 * @private
 */
gdjs.evtTools.input.isKeyPressed = function(runtimeScene, key) {

    if ( key === "a" ) { return runtimeScene.getGame().isKeyPressed(65); }
    if ( key === "b" ) { return runtimeScene.getGame().isKeyPressed(66); }
    if ( key === "c" ) { return runtimeScene.getGame().isKeyPressed(67); }
    if ( key === "d" ) { return runtimeScene.getGame().isKeyPressed(68); }
    if ( key === "e" ) { return runtimeScene.getGame().isKeyPressed(69); }
    if ( key === "f" ) { return runtimeScene.getGame().isKeyPressed(70); }
    if ( key === "g" ) { return runtimeScene.getGame().isKeyPressed(71); }
    if ( key === "h" ) { return runtimeScene.getGame().isKeyPressed(72); }
    if ( key === "i" ) { return runtimeScene.getGame().isKeyPressed(73); }
    if ( key === "j" ) { return runtimeScene.getGame().isKeyPressed(74); }
    if ( key === "k" ) { return runtimeScene.getGame().isKeyPressed(75); }
    if ( key === "l" ) { return runtimeScene.getGame().isKeyPressed(76); }
    if ( key === "m" ) { return runtimeScene.getGame().isKeyPressed(77); }
    if ( key === "n" ) { return runtimeScene.getGame().isKeyPressed(78); }
    if ( key === "o" ) { return runtimeScene.getGame().isKeyPressed(79); }
    if ( key === "p" ) { return runtimeScene.getGame().isKeyPressed(80); }
    if ( key === "q" ) { return runtimeScene.getGame().isKeyPressed(81); }
    if ( key === "r" ) { return runtimeScene.getGame().isKeyPressed(82); }
    if ( key === "s" ) { return runtimeScene.getGame().isKeyPressed(83); }
    if ( key === "t" ) { return runtimeScene.getGame().isKeyPressed(84); }
    if ( key === "u" ) { return runtimeScene.getGame().isKeyPressed(85); }
    if ( key === "v" ) { return runtimeScene.getGame().isKeyPressed(86); }
    if ( key === "w" ) { return runtimeScene.getGame().isKeyPressed(87); }
    if ( key === "x" ) { return runtimeScene.getGame().isKeyPressed(88); }
    if ( key === "y" ) { return runtimeScene.getGame().isKeyPressed(89); }
    if ( key === "z" ) { return runtimeScene.getGame().isKeyPressed(90); }

    if ( key === "Numpad0" ) { return runtimeScene.getGame().isKeyPressed(96); }
    if ( key === "Numpad1" ) { return runtimeScene.getGame().isKeyPressed(97); }
    if ( key === "Numpad2" ) { return runtimeScene.getGame().isKeyPressed(98); }
    if ( key === "Numpad3" ) { return runtimeScene.getGame().isKeyPressed(99); }
    if ( key === "Numpad4" ) { return runtimeScene.getGame().isKeyPressed(100); }
    if ( key === "Numpad5" ) { return runtimeScene.getGame().isKeyPressed(101); }
    if ( key === "Numpad6" ) { return runtimeScene.getGame().isKeyPressed(102); }
    if ( key === "Numpad7" ) { return runtimeScene.getGame().isKeyPressed(103); }
    if ( key === "Numpad8" ) { return runtimeScene.getGame().isKeyPressed(104); }
    if ( key === "Numpad9" ) { return runtimeScene.getGame().isKeyPressed(105); }

    if ( key == "RControl" ) { return runtimeScene.getGame().isKeyPressed(17); }
    if ( key == "RShift" ) { return runtimeScene.getGame().isKeyPressed(16); }
    if ( key == "RAlt" ) { return runtimeScene.getGame().isKeyPressed(18); }
    if ( key == "LControl" ) { return runtimeScene.getGame().isKeyPressed(17); }
    if ( key == "LShift" ) { return runtimeScene.getGame().isKeyPressed(16);}
    if ( key == "LAlt" ) { return runtimeScene.getGame().isKeyPressed(18); }
    if ( key == "LSystem" ) { return runtimeScene.getGame().isKeyPressed(91); }
    if ( key == "RSystem" ) { return runtimeScene.getGame().isKeyPressed(91); }
    /*if ( key == "Menu" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Menu ); }
    if ( key == "LBracket" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::LBracket ); }
    if ( key == "RBracket" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::RBracket ); }
    if ( key == "SemiColon" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::SemiColon ); }
    if ( key == "Comma" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Comma ); }
    if ( key == "Period" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Period ); }
    if ( key == "Quote" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Quote ); }
    if ( key == "Slash" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Slash ); }
    if ( key == "BackSlash" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::BackSlash ); }
    if ( key == "Tilde" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Tilde ); }
    if ( key == "Equal" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Equal ); }
    if ( key == "Dash" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Dash ); }*/
    if ( key == "Space" ) { return runtimeScene.getGame().isKeyPressed(32); }
    if ( key == "Return" ) { return runtimeScene.getGame().isKeyPressed(13); }
    if ( key == "Back" ) { return runtimeScene.getGame().isKeyPressed(8); }
    if ( key == "Tab" ) { return runtimeScene.getGame().isKeyPressed(9); }
    if ( key == "PageUp" ) { return runtimeScene.getGame().isKeyPressed(33); }
    if ( key == "PageDown" ) { return runtimeScene.getGame().isKeyPressed(34); }
    if ( key == "End" ) { return runtimeScene.getGame().isKeyPressed(35); }
    if ( key == "Home" ) { return runtimeScene.getGame().isKeyPressed(36); }
    if ( key == "Delete" ) { return runtimeScene.getGame().isKeyPressed(46); }
    if ( key == "Insert" ) { return runtimeScene.getGame().isKeyPressed(45); }

    if ( key == "Add" ) { return runtimeScene.getGame().isKeyPressed(107); }
    if ( key == "Subtract" ) { return runtimeScene.getGame().isKeyPressed(109); }
    if ( key == "Multiply" ) { return runtimeScene.getGame().isKeyPressed(106); }
    if ( key == "Divide" ) { return runtimeScene.getGame().isKeyPressed(111); }

    if ( key === "Left" ) { return runtimeScene.getGame().isKeyPressed(37); }
    if ( key === "Up" ) { return runtimeScene.getGame().isKeyPressed(38); }
    if ( key === "Right" ) { return runtimeScene.getGame().isKeyPressed(39); }
    if ( key === "Down" ) { return runtimeScene.getGame().isKeyPressed(40); }

    if ( key === "F1" ) { return runtimeScene.getGame().isKeyPressed(112); }
    if ( key === "F2" ) { return runtimeScene.getGame().isKeyPressed(113); }
    if ( key === "F3" ) { return runtimeScene.getGame().isKeyPressed(114); }
    if ( key === "F4" ) { return runtimeScene.getGame().isKeyPressed(115); }
    if ( key === "F5" ) { return runtimeScene.getGame().isKeyPressed(116); }
    if ( key === "F6" ) { return runtimeScene.getGame().isKeyPressed(117); }
    if ( key === "F7" ) { return runtimeScene.getGame().isKeyPressed(118); }
    if ( key === "F8" ) { return runtimeScene.getGame().isKeyPressed(119); }
    if ( key === "F9" ) { return runtimeScene.getGame().isKeyPressed(120); }
    if ( key === "F10" ) { return runtimeScene.getGame().isKeyPressed(121); }
    if ( key === "F11" ) { return runtimeScene.getGame().isKeyPressed(122); }
    if ( key === "F12" ) { return runtimeScene.getGame().isKeyPressed(123); }

    if ( key === "Pause" ) { return runtimeScene.getGame().isKeyPressed(19); }

    return false;
};

gdjs.evtTools.input.anyKeyPressed = function(runtimeScene) {
    return runtimeScene.getGame().anyKeyPressed();
};

gdjs.evtTools.input.isMouseButtonPressed = function(runtimeScene, button) {
    if ( button == "Left" ) return runtimeScene.getGame().isMouseButtonPressed(0);
    if ( button == "Right" ) return runtimeScene.getGame().isMouseButtonPressed(1);
    return false;
};

gdjs.evtTools.input.hideCursor = function(runtimeScene) {
    runtimeScene.getPIXIRenderer().view.style.cursor = 'none';
};

gdjs.evtTools.input.showCursor = function(runtimeScene) {
    runtimeScene.getPIXIRenderer().view.style.cursor = '';
};

gdjs.evtTools.input.getMouseWheelDelta = function(runtimeScene) {
    return runtimeScene.getGame().getMouseWheelDelta();
};

gdjs.evtTools.input.getMouseX = function(runtimeScene, layer, camera) {
    return runtimeScene.getLayer(layer).convertCoords(runtimeScene.getGame().getMouseX(),
        runtimeScene.getGame().getMouseY())[0];
};

gdjs.evtTools.input.getMouseY = function(runtimeScene, layer, camera) {
    return runtimeScene.getLayer(layer).convertCoords(runtimeScene.getGame().getMouseX(),
        runtimeScene.getGame().getMouseY())[1];
};
