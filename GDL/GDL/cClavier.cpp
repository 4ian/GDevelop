/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#include <vector>
#include <string>
#include "GDL/Object.h"
#include <cmath>
#include "GDL/cClavier.h"
#include "GDL/Event.h"
#include <iostream>
#include <sstream>
#include "GDL/Chercher.h"
#include "GDL/algo.h"
#include "GDL/Force.h"
#include <iostream>
#include "GDL/Access.h"
#include <SFML/Window.hpp>
#include "GDL/RuntimeScene.h"

#include "GDL/Instruction.h"

////////////////////////////////////////////////////////////
/// Test d'appui sur une touche du clavier
///
/// Type : KeyPressed
/// Paramètre 1 : Touche du clavier
////////////////////////////////////////////////////////////
bool CondKeyPressed( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    bool Ok = false;

    string Key = condition.GetParameter( 0 ).GetPlainString();

    if ( Key == "a" ) { Ok = scene->input->IsKeyDown( sf::Key::A ); }
    if ( Key == "b" ) { Ok = scene->input->IsKeyDown( sf::Key::B ); }
    if ( Key == "c" ) { Ok = scene->input->IsKeyDown( sf::Key::C ); }
    if ( Key == "d" ) { Ok = scene->input->IsKeyDown( sf::Key::D ); }
    if ( Key == "e" ) { Ok = scene->input->IsKeyDown( sf::Key::E ); }
    if ( Key == "f" ) { Ok = scene->input->IsKeyDown( sf::Key::F ); }
    if ( Key == "g" ) { Ok = scene->input->IsKeyDown( sf::Key::G ); }
    if ( Key == "h" ) { Ok = scene->input->IsKeyDown( sf::Key::H ); }
    if ( Key == "i" ) { Ok = scene->input->IsKeyDown( sf::Key::I ); }
    if ( Key == "j" ) { Ok = scene->input->IsKeyDown( sf::Key::J ); }
    if ( Key == "k" ) { Ok = scene->input->IsKeyDown( sf::Key::K ); }
    if ( Key == "l" ) { Ok = scene->input->IsKeyDown( sf::Key::L ); }
    if ( Key == "m" ) { Ok = scene->input->IsKeyDown( sf::Key::M ); }
    if ( Key == "n" ) { Ok = scene->input->IsKeyDown( sf::Key::N ); }
    if ( Key == "o" ) { Ok = scene->input->IsKeyDown( sf::Key::O ); }
    if ( Key == "p" ) { Ok = scene->input->IsKeyDown( sf::Key::P ); }
    if ( Key == "q" ) { Ok = scene->input->IsKeyDown( sf::Key::Q ); }
    if ( Key == "r" ) { Ok = scene->input->IsKeyDown( sf::Key::R ); }
    if ( Key == "s" ) { Ok = scene->input->IsKeyDown( sf::Key::S ); }
    if ( Key == "t" ) { Ok = scene->input->IsKeyDown( sf::Key::T ); }
    if ( Key == "u" ) { Ok = scene->input->IsKeyDown( sf::Key::U ); }
    if ( Key == "v" ) { Ok = scene->input->IsKeyDown( sf::Key::V ); }
    if ( Key == "w" ) { Ok = scene->input->IsKeyDown( sf::Key::W ); }
    if ( Key == "x" ) { Ok = scene->input->IsKeyDown( sf::Key::X ); }
    if ( Key == "y" ) { Ok = scene->input->IsKeyDown( sf::Key::Y ); }
    if ( Key == "z" ) { Ok = scene->input->IsKeyDown( sf::Key::Z ); }

    if ( Key == "Num9" ) { Ok = scene->input->IsKeyDown( sf::Key::Num9 ); }
    if ( Key == "Num8" ) { Ok = scene->input->IsKeyDown( sf::Key::Num8 ); }
    if ( Key == "Num7" ) { Ok = scene->input->IsKeyDown( sf::Key::Num7 ); }
    if ( Key == "Num6" ) { Ok = scene->input->IsKeyDown( sf::Key::Num6 ); }
    if ( Key == "Num5" ) { Ok = scene->input->IsKeyDown( sf::Key::Num5 ); }
    if ( Key == "Num4" ) { Ok = scene->input->IsKeyDown( sf::Key::Num4 ); }
    if ( Key == "Num3" ) { Ok = scene->input->IsKeyDown( sf::Key::Num3 ); }
    if ( Key == "Num2" ) { Ok = scene->input->IsKeyDown( sf::Key::Num2 ); }
    if ( Key == "Num1" ) { Ok = scene->input->IsKeyDown( sf::Key::Num1 ); }
    if ( Key == "Num0" ) { Ok = scene->input->IsKeyDown( sf::Key::Num0 ); }

    if ( Key == "Escape" ) { Ok = scene->input->IsKeyDown( sf::Key::Escape ); }
    if ( Key == "RControl" ) { Ok = scene->input->IsKeyDown( sf::Key::RControl ); }
    if ( Key == "RShift" ) { Ok = scene->input->IsKeyDown( sf::Key::RShift ); }
    if ( Key == "RAlt" ) { Ok = scene->input->IsKeyDown( sf::Key::RAlt ); }
    if ( Key == "LControl" ) { Ok = scene->input->IsKeyDown( sf::Key::LControl ); }
    if ( Key == "LShift" ) { Ok = scene->input->IsKeyDown( sf::Key::LShift ); }
    if ( Key == "LAlt" ) { Ok = scene->input->IsKeyDown( sf::Key::LAlt ); }
    if ( Key == "Space" ) { Ok = scene->input->IsKeyDown( sf::Key::Space ); }
    if ( Key == "Return" ) { Ok = scene->input->IsKeyDown( sf::Key::Return ); }
    if ( Key == "Back" ) { Ok = scene->input->IsKeyDown( sf::Key::Back ); }
    if ( Key == "Tab" ) { Ok = scene->input->IsKeyDown( sf::Key::Tab ); }
    if ( Key == "PageUp" ) { Ok = scene->input->IsKeyDown( sf::Key::PageUp ); }
    if ( Key == "PageDown" ) { Ok = scene->input->IsKeyDown( sf::Key::PageDown ); }
    if ( Key == "End" ) { Ok = scene->input->IsKeyDown( sf::Key::End ); }
    if ( Key == "Home" ) { Ok = scene->input->IsKeyDown( sf::Key::Home ); }
    if ( Key == "Insert" ) { Ok = scene->input->IsKeyDown( sf::Key::Insert ); }
    if ( Key == "Delete" ) { Ok = scene->input->IsKeyDown( sf::Key::Delete ); }

    if ( Key == "Add" ) { Ok = scene->input->IsKeyDown( sf::Key::Add ); }
    if ( Key == "Subtract" ) { Ok = scene->input->IsKeyDown( sf::Key::Subtract ); }
    if ( Key == "Multiply" ) { Ok = scene->input->IsKeyDown( sf::Key::Multiply ); }
    if ( Key == "Divide" ) { Ok = scene->input->IsKeyDown( sf::Key::Divide ); }

    if ( Key == "Left" ) { Ok = scene->input->IsKeyDown( sf::Key::Left ); }
    if ( Key == "Right" ) { Ok = scene->input->IsKeyDown( sf::Key::Right ); }
    if ( Key == "Up" ) { Ok = scene->input->IsKeyDown( sf::Key::Up ); }
    if ( Key == "Down" ) { Ok = scene->input->IsKeyDown( sf::Key::Down ); }

    if ( Key == "Numpad0" ) { Ok = scene->input->IsKeyDown( sf::Key::Numpad0 ); }
    if ( Key == "Numpad1" ) { Ok = scene->input->IsKeyDown( sf::Key::Numpad1 ); }
    if ( Key == "Numpad2" ) { Ok = scene->input->IsKeyDown( sf::Key::Numpad2 ); }
    if ( Key == "Numpad3" ) { Ok = scene->input->IsKeyDown( sf::Key::Numpad3 ); }
    if ( Key == "Numpad4" ) { Ok = scene->input->IsKeyDown( sf::Key::Numpad4 ); }
    if ( Key == "Numpad5" ) { Ok = scene->input->IsKeyDown( sf::Key::Numpad5 ); }
    if ( Key == "Numpad6" ) { Ok = scene->input->IsKeyDown( sf::Key::Numpad6 ); }
    if ( Key == "Numpad7" ) { Ok = scene->input->IsKeyDown( sf::Key::Numpad7 ); }
    if ( Key == "Numpad8" ) { Ok = scene->input->IsKeyDown( sf::Key::Numpad8 ); }
    if ( Key == "Numpad9" ) { Ok = scene->input->IsKeyDown( sf::Key::Numpad9 ); }

    if ( Key == "F1" ) { Ok = scene->input->IsKeyDown( sf::Key::F1 ); }
    if ( Key == "F2" ) { Ok = scene->input->IsKeyDown( sf::Key::F2 ); }
    if ( Key == "F3" ) { Ok = scene->input->IsKeyDown( sf::Key::F3 ); }
    if ( Key == "F4" ) { Ok = scene->input->IsKeyDown( sf::Key::F4 ); }
    if ( Key == "F5" ) { Ok = scene->input->IsKeyDown( sf::Key::F5 ); }
    if ( Key == "F6" ) { Ok = scene->input->IsKeyDown( sf::Key::F6 ); }
    if ( Key == "F7" ) { Ok = scene->input->IsKeyDown( sf::Key::F7 ); }
    if ( Key == "F8" ) { Ok = scene->input->IsKeyDown( sf::Key::F8 ); }
    if ( Key == "F9" ) { Ok = scene->input->IsKeyDown( sf::Key::F9 ); }
    if ( Key == "F10" ) { Ok = scene->input->IsKeyDown( sf::Key::F10 ); }
    if ( Key == "F11" ) { Ok = scene->input->IsKeyDown( sf::Key::F11 ); }
    if ( Key == "F12" ) { Ok = scene->input->IsKeyDown( sf::Key::F12 ); }
    if ( Key == "F13" ) { Ok = scene->input->IsKeyDown( sf::Key::F13 ); }
    if ( Key == "F14" ) { Ok = scene->input->IsKeyDown( sf::Key::F14 ); }
    if ( Key == "F15" ) { Ok = scene->input->IsKeyDown( sf::Key::F15 ); }

    if ( Key == "Pause" ) { Ok = scene->input->IsKeyDown( sf::Key::Pause ); }
    if ( Key == "Count" ) { Ok = scene->input->IsKeyDown( sf::Key::Count ); }

    if ( condition.IsInverted() ) return !Ok;
    return Ok;
}
