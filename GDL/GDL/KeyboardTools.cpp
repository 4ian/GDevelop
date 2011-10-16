/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "KeyboardTools.h"
#include <string>
#include "GDL/RuntimeScene.h"

using namespace std;

bool GD_API IsKeyPressed(RuntimeScene & scene, std::string key)
{
    if ( key == "a" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::A ); }
    if ( key == "b" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::B ); }
    if ( key == "c" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::C ); }
    if ( key == "d" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::D ); }
    if ( key == "e" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::E ); }
    if ( key == "f" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::F ); }
    if ( key == "g" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::G ); }
    if ( key == "h" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::H ); }
    if ( key == "i" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::I ); }
    if ( key == "j" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::J ); }
    if ( key == "k" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::K ); }
    if ( key == "l" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::L ); }
    if ( key == "m" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::M ); }
    if ( key == "n" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::N ); }
    if ( key == "o" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::O ); }
    if ( key == "p" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::P ); }
    if ( key == "q" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Q ); }
    if ( key == "r" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::R ); }
    if ( key == "s" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::S ); }
    if ( key == "t" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::T ); }
    if ( key == "u" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::U ); }
    if ( key == "v" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::V ); }
    if ( key == "w" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::W ); }
    if ( key == "x" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::X ); }
    if ( key == "y" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Y ); }
    if ( key == "z" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Z ); }

    if ( key == "Num9" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Num9 ); }
    if ( key == "Num8" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Num8 ); }
    if ( key == "Num7" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Num7 ); }
    if ( key == "Num6" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Num6 ); }
    if ( key == "Num5" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Num5 ); }
    if ( key == "Num4" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Num4 ); }
    if ( key == "Num3" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Num3 ); }
    if ( key == "Num2" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Num2 ); }
    if ( key == "Num1" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Num1 ); }
    if ( key == "Num0" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Num0 ); }

    if ( key == "Escape" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Escape ); }
    if ( key == "RControl" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::RControl ); }
    if ( key == "RShift" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::RShift ); }
    if ( key == "RAlt" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::RAlt ); }
    if ( key == "LControl" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::LControl ); }
    if ( key == "LShift" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::LShift ); }
    if ( key == "LAlt" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::LAlt ); }
    if ( key == "LSystem" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::LSystem ); }
    if ( key == "RSystem" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::RSystem ); }
    if ( key == "Menu" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Menu ); }
    if ( key == "LBracket" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::LBracket ); }
    if ( key == "RBracket" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::RBracket ); }
    if ( key == "SemiColon" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::SemiColon ); }
    if ( key == "Comma" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Comma ); }
    if ( key == "Period" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Period ); }
    if ( key == "Quote" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Quote ); }
    if ( key == "Slash" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Slash ); }
    if ( key == "BackSlash" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::BackSlash ); }
    if ( key == "Tilde" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Tilde ); }
    if ( key == "Equal" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Equal ); }
    if ( key == "Dash" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Dash ); }
    if ( key == "Space" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Space ); }
    if ( key == "Return" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Return ); }
    if ( key == "Back" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Back ); }
    if ( key == "Tab" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Tab ); }
    if ( key == "PageUp" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::PageUp ); }
    if ( key == "PageDown" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::PageDown ); }
    if ( key == "End" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::End ); }
    if ( key == "Home" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Home ); }
    if ( key == "Insert" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Insert ); }
    if ( key == "Delete" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Delete ); }

    if ( key == "Add" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Add ); }
    if ( key == "Subtract" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Subtract ); }
    if ( key == "Multiply" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Multiply ); }
    if ( key == "Divide" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Divide ); }

    if ( key == "Left" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Left ); }
    if ( key == "Right" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Right ); }
    if ( key == "Up" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Up ); }
    if ( key == "Down" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Down ); }

    if ( key == "Numpad0" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Numpad0 ); }
    if ( key == "Numpad1" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Numpad1 ); }
    if ( key == "Numpad2" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Numpad2 ); }
    if ( key == "Numpad3" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Numpad3 ); }
    if ( key == "Numpad4" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Numpad4 ); }
    if ( key == "Numpad5" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Numpad5 ); }
    if ( key == "Numpad6" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Numpad6 ); }
    if ( key == "Numpad7" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Numpad7 ); }
    if ( key == "Numpad8" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Numpad8 ); }
    if ( key == "Numpad9" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Numpad9 ); }

    if ( key == "F1" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::F1 ); }
    if ( key == "F2" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::F2 ); }
    if ( key == "F3" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::F3 ); }
    if ( key == "F4" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::F4 ); }
    if ( key == "F5" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::F5 ); }
    if ( key == "F6" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::F6 ); }
    if ( key == "F7" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::F7 ); }
    if ( key == "F8" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::F8 ); }
    if ( key == "F9" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::F9 ); }
    if ( key == "F10" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::F10 ); }
    if ( key == "F11" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::F11 ); }
    if ( key == "F12" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::F12 ); }
    if ( key == "F13" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::F13 ); }
    if ( key == "F14" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::F14 ); }
    if ( key == "F15" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::F15 ); }

    if ( key == "Pause" ) { return sf::Keyboard::IsKeyPressed( sf::Keyboard::Pause ); }

    return false;
}

bool GD_API AnyKeyIsPressed( RuntimeScene & scene )
{
    return scene.inputKeyPressed;
}
