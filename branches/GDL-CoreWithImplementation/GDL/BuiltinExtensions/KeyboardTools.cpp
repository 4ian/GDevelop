/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include <string>
#include "GDL/BuiltinExtensions/KeyboardTools.h"
#include <SFML/Graphics.hpp>
#include "GDL/RuntimeScene.h"

using namespace std;

bool GD_API IsKeyPressed(RuntimeScene & scene, std::string key)
{
    if ( !scene.RenderWindowHasFocus() && scene.IsInputDisabledWhenFocusIsLost() )
        return false;

    if ( key == "a" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::A ); }
    if ( key == "b" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::B ); }
    if ( key == "c" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::C ); }
    if ( key == "d" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::D ); }
    if ( key == "e" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::E ); }
    if ( key == "f" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::F ); }
    if ( key == "g" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::G ); }
    if ( key == "h" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::H ); }
    if ( key == "i" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::I ); }
    if ( key == "j" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::J ); }
    if ( key == "k" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::K ); }
    if ( key == "l" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::L ); }
    if ( key == "m" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::M ); }
    if ( key == "n" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::N ); }
    if ( key == "o" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::O ); }
    if ( key == "p" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::P ); }
    if ( key == "q" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Q ); }
    if ( key == "r" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::R ); }
    if ( key == "s" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::S ); }
    if ( key == "t" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::T ); }
    if ( key == "u" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::U ); }
    if ( key == "v" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::V ); }
    if ( key == "w" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::W ); }
    if ( key == "x" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::X ); }
    if ( key == "y" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Y ); }
    if ( key == "z" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Z ); }

    if ( key == "Num9" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Num9 ); }
    if ( key == "Num8" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Num8 ); }
    if ( key == "Num7" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Num7 ); }
    if ( key == "Num6" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Num6 ); }
    if ( key == "Num5" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Num5 ); }
    if ( key == "Num4" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Num4 ); }
    if ( key == "Num3" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Num3 ); }
    if ( key == "Num2" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Num2 ); }
    if ( key == "Num1" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Num1 ); }
    if ( key == "Num0" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Num0 ); }

    if ( key == "Escape" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Escape ); }
    if ( key == "RControl" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::RControl ); }
    if ( key == "RShift" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::RShift ); }
    if ( key == "RAlt" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::RAlt ); }
    if ( key == "LControl" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::LControl ); }
    if ( key == "LShift" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::LShift ); }
    if ( key == "LAlt" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::LAlt ); }
    if ( key == "LSystem" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::LSystem ); }
    if ( key == "RSystem" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::RSystem ); }
    if ( key == "Menu" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Menu ); }
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
    if ( key == "Dash" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Dash ); }
    if ( key == "Space" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Space ); }
    if ( key == "Return" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Return ); }
    if ( key == "Back" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::BackSpace ); }
    if ( key == "Tab" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Tab ); }
    if ( key == "PageUp" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::PageUp ); }
    if ( key == "PageDown" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::PageDown ); }
    if ( key == "End" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::End ); }
    if ( key == "Home" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Home ); }
    if ( key == "Insert" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Insert ); }
    if ( key == "Delete" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Delete ); }

    if ( key == "Add" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Add ); }
    if ( key == "Subtract" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Subtract ); }
    if ( key == "Multiply" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Multiply ); }
    if ( key == "Divide" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Divide ); }

    if ( key == "Left" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Left ); }
    if ( key == "Right" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Right ); }
    if ( key == "Up" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Up ); }
    if ( key == "Down" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Down ); }

    if ( key == "Numpad0" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Numpad0 ); }
    if ( key == "Numpad1" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Numpad1 ); }
    if ( key == "Numpad2" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Numpad2 ); }
    if ( key == "Numpad3" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Numpad3 ); }
    if ( key == "Numpad4" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Numpad4 ); }
    if ( key == "Numpad5" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Numpad5 ); }
    if ( key == "Numpad6" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Numpad6 ); }
    if ( key == "Numpad7" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Numpad7 ); }
    if ( key == "Numpad8" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Numpad8 ); }
    if ( key == "Numpad9" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Numpad9 ); }

    if ( key == "F1" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::F1 ); }
    if ( key == "F2" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::F2 ); }
    if ( key == "F3" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::F3 ); }
    if ( key == "F4" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::F4 ); }
    if ( key == "F5" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::F5 ); }
    if ( key == "F6" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::F6 ); }
    if ( key == "F7" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::F7 ); }
    if ( key == "F8" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::F8 ); }
    if ( key == "F9" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::F9 ); }
    if ( key == "F10" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::F10 ); }
    if ( key == "F11" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::F11 ); }
    if ( key == "F12" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::F12 ); }
    if ( key == "F13" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::F13 ); }
    if ( key == "F14" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::F14 ); }
    if ( key == "F15" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::F15 ); }

    if ( key == "Pause" ) { return sf::Keyboard::isKeyPressed( sf::Keyboard::Pause ); }

    return false;
}

bool GD_API AnyKeyIsPressed( RuntimeScene & scene )
{
    if ( !scene.RenderWindowHasFocus() && scene.IsInputDisabledWhenFocusIsLost() )
        return false;

    const std::vector<sf::Event> & events = scene.GetRenderTargetEvents();
    for (unsigned int i = 0;i<events.size();++i)
    {
        if (events[i].type == sf::Event::KeyPressed)
            return true;
    }

    return false;
}

