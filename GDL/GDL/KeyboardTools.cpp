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
    if ( key == "a" ) { return scene.input->IsKeyDown( sf::Key::A ); }
    if ( key == "b" ) { return scene.input->IsKeyDown( sf::Key::B ); }
    if ( key == "c" ) { return scene.input->IsKeyDown( sf::Key::C ); }
    if ( key == "d" ) { return scene.input->IsKeyDown( sf::Key::D ); }
    if ( key == "e" ) { return scene.input->IsKeyDown( sf::Key::E ); }
    if ( key == "f" ) { return scene.input->IsKeyDown( sf::Key::F ); }
    if ( key == "g" ) { return scene.input->IsKeyDown( sf::Key::G ); }
    if ( key == "h" ) { return scene.input->IsKeyDown( sf::Key::H ); }
    if ( key == "i" ) { return scene.input->IsKeyDown( sf::Key::I ); }
    if ( key == "j" ) { return scene.input->IsKeyDown( sf::Key::J ); }
    if ( key == "k" ) { return scene.input->IsKeyDown( sf::Key::K ); }
    if ( key == "l" ) { return scene.input->IsKeyDown( sf::Key::L ); }
    if ( key == "m" ) { return scene.input->IsKeyDown( sf::Key::M ); }
    if ( key == "n" ) { return scene.input->IsKeyDown( sf::Key::N ); }
    if ( key == "o" ) { return scene.input->IsKeyDown( sf::Key::O ); }
    if ( key == "p" ) { return scene.input->IsKeyDown( sf::Key::P ); }
    if ( key == "q" ) { return scene.input->IsKeyDown( sf::Key::Q ); }
    if ( key == "r" ) { return scene.input->IsKeyDown( sf::Key::R ); }
    if ( key == "s" ) { return scene.input->IsKeyDown( sf::Key::S ); }
    if ( key == "t" ) { return scene.input->IsKeyDown( sf::Key::T ); }
    if ( key == "u" ) { return scene.input->IsKeyDown( sf::Key::U ); }
    if ( key == "v" ) { return scene.input->IsKeyDown( sf::Key::V ); }
    if ( key == "w" ) { return scene.input->IsKeyDown( sf::Key::W ); }
    if ( key == "x" ) { return scene.input->IsKeyDown( sf::Key::X ); }
    if ( key == "y" ) { return scene.input->IsKeyDown( sf::Key::Y ); }
    if ( key == "z" ) { return scene.input->IsKeyDown( sf::Key::Z ); }

    if ( key == "Num9" ) { return scene.input->IsKeyDown( sf::Key::Num9 ); }
    if ( key == "Num8" ) { return scene.input->IsKeyDown( sf::Key::Num8 ); }
    if ( key == "Num7" ) { return scene.input->IsKeyDown( sf::Key::Num7 ); }
    if ( key == "Num6" ) { return scene.input->IsKeyDown( sf::Key::Num6 ); }
    if ( key == "Num5" ) { return scene.input->IsKeyDown( sf::Key::Num5 ); }
    if ( key == "Num4" ) { return scene.input->IsKeyDown( sf::Key::Num4 ); }
    if ( key == "Num3" ) { return scene.input->IsKeyDown( sf::Key::Num3 ); }
    if ( key == "Num2" ) { return scene.input->IsKeyDown( sf::Key::Num2 ); }
    if ( key == "Num1" ) { return scene.input->IsKeyDown( sf::Key::Num1 ); }
    if ( key == "Num0" ) { return scene.input->IsKeyDown( sf::Key::Num0 ); }

    if ( key == "Escape" ) { return scene.input->IsKeyDown( sf::Key::Escape ); }
    if ( key == "RControl" ) { return scene.input->IsKeyDown( sf::Key::RControl ); }
    if ( key == "RShift" ) { return scene.input->IsKeyDown( sf::Key::RShift ); }
    if ( key == "RAlt" ) { return scene.input->IsKeyDown( sf::Key::RAlt ); }
    if ( key == "LControl" ) { return scene.input->IsKeyDown( sf::Key::LControl ); }
    if ( key == "LShift" ) { return scene.input->IsKeyDown( sf::Key::LShift ); }
    if ( key == "LAlt" ) { return scene.input->IsKeyDown( sf::Key::LAlt ); }
    if ( key == "Space" ) { return scene.input->IsKeyDown( sf::Key::Space ); }
    if ( key == "Return" ) { return scene.input->IsKeyDown( sf::Key::Return ); }
    if ( key == "Back" ) { return scene.input->IsKeyDown( sf::Key::Back ); }
    if ( key == "Tab" ) { return scene.input->IsKeyDown( sf::Key::Tab ); }
    if ( key == "PageUp" ) { return scene.input->IsKeyDown( sf::Key::PageUp ); }
    if ( key == "PageDown" ) { return scene.input->IsKeyDown( sf::Key::PageDown ); }
    if ( key == "End" ) { return scene.input->IsKeyDown( sf::Key::End ); }
    if ( key == "Home" ) { return scene.input->IsKeyDown( sf::Key::Home ); }
    if ( key == "Insert" ) { return scene.input->IsKeyDown( sf::Key::Insert ); }
    if ( key == "Delete" ) { return scene.input->IsKeyDown( sf::Key::Delete ); }

    if ( key == "Add" ) { return scene.input->IsKeyDown( sf::Key::Add ); }
    if ( key == "Subtract" ) { return scene.input->IsKeyDown( sf::Key::Subtract ); }
    if ( key == "Multiply" ) { return scene.input->IsKeyDown( sf::Key::Multiply ); }
    if ( key == "Divide" ) { return scene.input->IsKeyDown( sf::Key::Divide ); }

    if ( key == "Left" ) { return scene.input->IsKeyDown( sf::Key::Left ); }
    if ( key == "Right" ) { return scene.input->IsKeyDown( sf::Key::Right ); }
    if ( key == "Up" ) { return scene.input->IsKeyDown( sf::Key::Up ); }
    if ( key == "Down" ) { return scene.input->IsKeyDown( sf::Key::Down ); }

    if ( key == "Numpad0" ) { return scene.input->IsKeyDown( sf::Key::Numpad0 ); }
    if ( key == "Numpad1" ) { return scene.input->IsKeyDown( sf::Key::Numpad1 ); }
    if ( key == "Numpad2" ) { return scene.input->IsKeyDown( sf::Key::Numpad2 ); }
    if ( key == "Numpad3" ) { return scene.input->IsKeyDown( sf::Key::Numpad3 ); }
    if ( key == "Numpad4" ) { return scene.input->IsKeyDown( sf::Key::Numpad4 ); }
    if ( key == "Numpad5" ) { return scene.input->IsKeyDown( sf::Key::Numpad5 ); }
    if ( key == "Numpad6" ) { return scene.input->IsKeyDown( sf::Key::Numpad6 ); }
    if ( key == "Numpad7" ) { return scene.input->IsKeyDown( sf::Key::Numpad7 ); }
    if ( key == "Numpad8" ) { return scene.input->IsKeyDown( sf::Key::Numpad8 ); }
    if ( key == "Numpad9" ) { return scene.input->IsKeyDown( sf::Key::Numpad9 ); }

    if ( key == "F1" ) { return scene.input->IsKeyDown( sf::Key::F1 ); }
    if ( key == "F2" ) { return scene.input->IsKeyDown( sf::Key::F2 ); }
    if ( key == "F3" ) { return scene.input->IsKeyDown( sf::Key::F3 ); }
    if ( key == "F4" ) { return scene.input->IsKeyDown( sf::Key::F4 ); }
    if ( key == "F5" ) { return scene.input->IsKeyDown( sf::Key::F5 ); }
    if ( key == "F6" ) { return scene.input->IsKeyDown( sf::Key::F6 ); }
    if ( key == "F7" ) { return scene.input->IsKeyDown( sf::Key::F7 ); }
    if ( key == "F8" ) { return scene.input->IsKeyDown( sf::Key::F8 ); }
    if ( key == "F9" ) { return scene.input->IsKeyDown( sf::Key::F9 ); }
    if ( key == "F10" ) { return scene.input->IsKeyDown( sf::Key::F10 ); }
    if ( key == "F11" ) { return scene.input->IsKeyDown( sf::Key::F11 ); }
    if ( key == "F12" ) { return scene.input->IsKeyDown( sf::Key::F12 ); }
    if ( key == "F13" ) { return scene.input->IsKeyDown( sf::Key::F13 ); }
    if ( key == "F14" ) { return scene.input->IsKeyDown( sf::Key::F14 ); }
    if ( key == "F15" ) { return scene.input->IsKeyDown( sf::Key::F15 ); }

    if ( key == "Pause" ) { return scene.input->IsKeyDown( sf::Key::Pause ); }
    if ( key == "Count" ) { return scene.input->IsKeyDown( sf::Key::Count ); }

    return false;
}

bool GD_API AnyKeyIsPressed( RuntimeScene & scene )
{
    return scene.inputKeyPressed;
}
