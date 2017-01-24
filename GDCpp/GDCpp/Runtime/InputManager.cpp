/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "InputManager.h"

#include <SFML/Window/Event.hpp>
#include <SFML/Window/Keyboard.hpp>
#include <SFML/Window/Mouse.hpp>

InputManager::InputManager(gd::RenderingWindow * win) :
    window(win),
    lastPressedKey(0),
    keyWasPressed(false),
    touchSimulateMouse(true),
    mouseWheelDelta(0),
    windowHasFocus(true),
    disableInputWhenNotFocused(true)
{
}

void InputManager::SimulateMousePressed(sf::Vector2i pos)
{
    mousePosition = pos;
    buttonsPressed["Left"] = true;
}

void InputManager::NextFrame()
{
    keyWasPressed = false;
    charactersEntered.clear();

    oldKeysPressed = keysPressed;
    keysPressed.clear();
    const auto & keyMap = GetKeyNameToSfKeyMap();
    for(auto it = keyMap.begin();it != keyMap.end();++it) {
        keysPressed[it->first] =
            sf::Keyboard::isKeyPressed(static_cast<sf::Keyboard::Key>(it->second));
    }

	mouseWheelDelta = 0;
    oldButtonsPressed = buttonsPressed;
    buttonsPressed.clear();
    const auto & buttonMap = GetButtonNameToSfButtonMap();
    for(auto it = buttonMap.begin();it != buttonMap.end();++it) {
        buttonsPressed[it->first] =
            sf::Mouse::isButtonPressed(static_cast<sf::Mouse::Button>(it->second));
    }

    if (window) mousePosition = gd::RenderingWindow::GetMousePosition(*window);
    if (touchSimulateMouse && !touches.empty()) SimulateMousePressed(touches.begin()->second);
}

void InputManager::HandleEvent(sf::Event & event)
{
    if (event.type == sf::Event::KeyPressed)
    {
        if (!windowHasFocus && disableInputWhenNotFocused)
            return;

        lastPressedKey = event.key.code;
        keyWasPressed = true;
    }
    else if (event.type == sf::Event::TextEntered)
    {
    	if (!windowHasFocus && disableInputWhenNotFocused)
    		return;

    	charactersEntered.push_back(event.text.unicode);
    }
    else if (event.type == sf::Event::MouseWheelMoved)
        mouseWheelDelta = event.mouseWheel.delta;
    else if (event.type == sf::Event::TouchBegan ||
        event.type == sf::Event::TouchMoved)
    {
        touches[event.touch.finger] = sf::Vector2i(event.touch.x, event.touch.y);
        if (touchSimulateMouse) SimulateMousePressed(touches[event.touch.finger]);
    }
    else if (event.type == sf::Event::TouchEnded)
    {
        touches.erase(event.touch.finger);
    }
    else if ( event.type == sf::Event::GainedFocus)
        windowHasFocus = true;
    else if ( event.type == sf::Event::LostFocus)
        windowHasFocus = false;
}

bool InputManager::IsKeyPressed(gd::String key) const
{
    if (!windowHasFocus && disableInputWhenNotFocused)
        return false;

    return keysPressed.find(key) != keysPressed.end() &&
        keysPressed.find(key)->second;
}

bool InputManager::WasKeyReleased(gd::String key) const
{
    return oldKeysPressed.find(key) != oldKeysPressed.end() &&
        oldKeysPressed.find(key)->second &&
        !IsKeyPressed(key);
}

gd::String InputManager::GetLastPressedKey() const
{
    const auto & keyMap = GetSfKeyToKeyNameMap();
    auto it = keyMap.find(lastPressedKey);
    if (it != keyMap.end())
        return it->second;

    return "";
}


bool InputManager::AnyKeyIsPressed() const
{
    if (!windowHasFocus && disableInputWhenNotFocused)
        return false;

    return keyWasPressed;
}

sf::Vector2i InputManager::GetMousePosition() const
{
    return mousePosition;
}

bool InputManager::IsMouseButtonPressed(const gd::String & button) const
{
    if (!windowHasFocus && disableInputWhenNotFocused)
        return false;

    return buttonsPressed.find(button) != buttonsPressed.end() &&
        buttonsPressed.find(button)->second;
}

bool InputManager::IsMouseButtonReleased(const gd::String & button) const
{
    return oldButtonsPressed.find(button) != oldButtonsPressed.end() &&
        oldButtonsPressed.find(button)->second &&
        !IsMouseButtonPressed(button);
}

int InputManager::GetMouseWheelDelta() const
{
    if (!windowHasFocus && disableInputWhenNotFocused)
        return 0;

    return mouseWheelDelta;
}

const std::map<gd::String, int> & InputManager::GetKeyNameToSfKeyMap()
{
    static bool initialized = false;
    static std::map<gd::String, int> * map = new std::map<gd::String, int>();
    if (!initialized)
    {
        (*map)["a"] = sf::Keyboard::A;
        (*map)["b"] = sf::Keyboard::B;
        (*map)["c"] = sf::Keyboard::C;
        (*map)["d"] = sf::Keyboard::D;
        (*map)["e"] = sf::Keyboard::E;
        (*map)["f"] = sf::Keyboard::F;
        (*map)["g"] = sf::Keyboard::G;
        (*map)["h"] = sf::Keyboard::H;
        (*map)["i"] = sf::Keyboard::I;
        (*map)["j"] = sf::Keyboard::J;
        (*map)["k"] = sf::Keyboard::K;
        (*map)["l"] = sf::Keyboard::L;
        (*map)["m"] = sf::Keyboard::M;
        (*map)["n"] = sf::Keyboard::N;
        (*map)["o"] = sf::Keyboard::O;
        (*map)["p"] = sf::Keyboard::P;
        (*map)["q"] = sf::Keyboard::Q;
        (*map)["r"] = sf::Keyboard::R;
        (*map)["s"] = sf::Keyboard::S;
        (*map)["t"] = sf::Keyboard::T;
        (*map)["u"] = sf::Keyboard::U;
        (*map)["v"] = sf::Keyboard::V;
        (*map)["w"] = sf::Keyboard::W;
        (*map)["x"] = sf::Keyboard::X;
        (*map)["y"] = sf::Keyboard::Y;
        (*map)["z"] = sf::Keyboard::Z;

        (*map)["Num9"] = sf::Keyboard::Num9;
        (*map)["Num8"] = sf::Keyboard::Num8;
        (*map)["Num7"] = sf::Keyboard::Num7;
        (*map)["Num6"] = sf::Keyboard::Num6;
        (*map)["Num5"] = sf::Keyboard::Num5;
        (*map)["Num4"] = sf::Keyboard::Num4;
        (*map)["Num3"] = sf::Keyboard::Num3;
        (*map)["Num2"] = sf::Keyboard::Num2;
        (*map)["Num1"] = sf::Keyboard::Num1;
        (*map)["Num0"] = sf::Keyboard::Num0;

        (*map)["Escape"] = sf::Keyboard::Escape;
        (*map)["RControl"] = sf::Keyboard::RControl;
        (*map)["RShift"] = sf::Keyboard::RShift;
        (*map)["RAlt"] = sf::Keyboard::RAlt;
        (*map)["LControl"] = sf::Keyboard::LControl;
        (*map)["LShift"] = sf::Keyboard::LShift;
        (*map)["LAlt"] = sf::Keyboard::LAlt;
        (*map)["LSystem"] = sf::Keyboard::LSystem;
        (*map)["RSystem"] = sf::Keyboard::RSystem;
        (*map)["Menu"] = sf::Keyboard::Menu;
        (*map)["LBracket"] = sf::Keyboard::LBracket;
        (*map)["RBracket"] = sf::Keyboard::RBracket;
        (*map)["SemiColon"] = sf::Keyboard::SemiColon;
        (*map)["Comma"] = sf::Keyboard::Comma;
        (*map)["Period"] = sf::Keyboard::Period;
        (*map)["Quote"] = sf::Keyboard::Quote;
        (*map)["Slash"] = sf::Keyboard::Slash;
        (*map)["BackSlash"] = sf::Keyboard::BackSlash;
        (*map)["Tilde"] = sf::Keyboard::Tilde;
        (*map)["Equal"] = sf::Keyboard::Equal;
        (*map)["Dash"] = sf::Keyboard::Dash;
        (*map)["Space"] = sf::Keyboard::Space;
        (*map)["Return"] = sf::Keyboard::Return;
        (*map)["Back"] = sf::Keyboard::BackSpace;
        (*map)["Tab"] = sf::Keyboard::Tab;
        (*map)["PageUp"] = sf::Keyboard::PageUp;
        (*map)["PageDown"] = sf::Keyboard::PageDown;
        (*map)["End"] = sf::Keyboard::End;
        (*map)["Home"] = sf::Keyboard::Home;
        (*map)["Insert"] = sf::Keyboard::Insert;
        (*map)["Delete"] = sf::Keyboard::Delete;

        (*map)["Add"] = sf::Keyboard::Add;
        (*map)["Subtract"] = sf::Keyboard::Subtract;
        (*map)["Multiply"] = sf::Keyboard::Multiply;
        (*map)["Divide"] = sf::Keyboard::Divide;

        (*map)["Left"] = sf::Keyboard::Left;
        (*map)["Right"] = sf::Keyboard::Right;
        (*map)["Up"] = sf::Keyboard::Up;
        (*map)["Down"] = sf::Keyboard::Down;

        (*map)["Numpad0"] = sf::Keyboard::Numpad0;
        (*map)["Numpad1"] = sf::Keyboard::Numpad1;
        (*map)["Numpad2"] = sf::Keyboard::Numpad2;
        (*map)["Numpad3"] = sf::Keyboard::Numpad3;
        (*map)["Numpad4"] = sf::Keyboard::Numpad4;
        (*map)["Numpad5"] = sf::Keyboard::Numpad5;
        (*map)["Numpad6"] = sf::Keyboard::Numpad6;
        (*map)["Numpad7"] = sf::Keyboard::Numpad7;
        (*map)["Numpad8"] = sf::Keyboard::Numpad8;
        (*map)["Numpad9"] = sf::Keyboard::Numpad9;

        (*map)["F1"] = sf::Keyboard::F1;
        (*map)["F2"] = sf::Keyboard::F2;
        (*map)["F3"] = sf::Keyboard::F3;
        (*map)["F4"] = sf::Keyboard::F4;
        (*map)["F5"] = sf::Keyboard::F5;
        (*map)["F6"] = sf::Keyboard::F6;
        (*map)["F7"] = sf::Keyboard::F7;
        (*map)["F8"] = sf::Keyboard::F8;
        (*map)["F9"] = sf::Keyboard::F9;
        (*map)["F10"] = sf::Keyboard::F10;
        (*map)["F11"] = sf::Keyboard::F11;
        (*map)["F12"] = sf::Keyboard::F12;
        (*map)["F13"] = sf::Keyboard::F13;
        (*map)["F14"] = sf::Keyboard::F14;
        (*map)["F15"] = sf::Keyboard::F15;

        (*map)["Pause"] = sf::Keyboard::Pause;

        initialized = true;
    }

    return *map;
}

const std::map<int, gd::String> & InputManager::GetSfKeyToKeyNameMap()
{
    static bool initialized = false;
    static std::map<int, gd::String> * map = new std::map<int, gd::String>();
    if (!initialized)
    {
        const auto & keyMap = GetKeyNameToSfKeyMap();
        for(auto it = keyMap.begin();it!=keyMap.end();++it)
            (*map)[it->second] = it->first;

        initialized = true;
    }

    return *map;
}

const std::map<gd::String, int> & InputManager::GetButtonNameToSfButtonMap()
{
    static bool initialized = false;
    static std::map<gd::String, int> * map = new std::map<gd::String, int>();
    if (!initialized)
    {
        (*map)["Left"] = sf::Mouse::Left;
        (*map)["Right"] = sf::Mouse::Right;
        (*map)["Middle"] = sf::Mouse::Middle;
        (*map)["XButton1"] = sf::Mouse::XButton1;
        (*map)["XButton2"] = sf::Mouse::XButton2;

        initialized = true;
    }

    return *map;
}

const std::map<int, gd::String> & InputManager::GetSfButtonToButtonNameMap()
{
    static bool initialized = false;
    static std::map<int, gd::String> * map = new std::map<int, gd::String>();
    if (!initialized)
    {
        const auto & buttonMap = GetButtonNameToSfButtonMap();
        for(auto it = buttonMap.begin();it!=buttonMap.end();++it)
            (*map)[it->second] = it->first;

        initialized = true;
    }

    return *map;
}
