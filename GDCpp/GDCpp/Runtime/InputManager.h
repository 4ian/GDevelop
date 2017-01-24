/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef INPUTMANAGER_H
#define INPUTMANAGER_H
#include <vector>
#include <map>
#include <string>
#include <set>
#include "GDCpp/Runtime/Window/RenderingWindow.h"
#include "GDCpp/Runtime/String.h"

/**
 * \brief Manage the events and mouse, keyboard
 * and touches inputs of a sf::Window.
 *
 * In particular, each RuntimeScene owns an InputManager.
 *
 * \see RuntimeScene
 */
class GD_API InputManager
{
public:
    /**
     * @brief Default constructor.
     *
     * Call SetWindow to set the window for which events must be handled
     */
    InputManager() :
        window(nullptr),
        lastPressedKey(0),
        mouseWheelDelta(0),
        keyWasPressed(false),
        touchSimulateMouse(true),
        windowHasFocus(true),
        disableInputWhenNotFocused(true)
    {
    }

    /**
     * @brief Constructor with a window to manage.
     */
    InputManager(gd::RenderingWindow * win);

    /** \name Connection with window and events management
     */
    ///@{
    /**
     * \brief Set the window managed by the input manager.
     */
    InputManager & SetWindow(gd::RenderingWindow * win) { window = win; return *this; }

    /**
     * Set if the input must be disabled when window lose focus.
     */
    void DisableInputWhenFocusIsLost(bool disable = true) { disableInputWhenNotFocused = disable; }

    /**
     * \brief Handle a SFML event made on the window.
     */
    void HandleEvent(sf::Event & event);

    /**
     * \brief Call it when a new frame is rendered.
     */
    void NextFrame();
    ///@}


    /** \name Keyboard
     */
    ///@{
    /**
     * \brief Return the key name of the latest pressed key.
     */
    gd::String GetLastPressedKey() const;

    /**
     * \brief Return true if the specified key name is pressed.
     */
    bool IsKeyPressed(gd::String key) const;

    /**
     * \brief Return true if the specified key name was just released.
     */
    bool WasKeyReleased(gd::String key) const;

    /**
     * \brief Return true if any key was pressed since the last call
     * to NextFrame.
     */
    bool AnyKeyIsPressed() const;

    /**
     * @brief Get the unicode value of the characters entered during the last frame.
     */
    std::vector<sf::Uint32> GetCharactersEntered() const { return charactersEntered; };

    static const std::map<gd::String, int> & GetKeyNameToSfKeyMap();
    static const std::map<int, gd::String> & GetSfKeyToKeyNameMap();
    ///@}

    /** \name Mouse
     */
    ///@{
    /**
     * @brief Return the position of the mouse, in window coordinates.
     */
    sf::Vector2i GetMousePosition() const;

    /**
     * @brief Return true if the specified mouse button is pressed.
     */
    bool IsMouseButtonPressed(const gd::String & button) const;

    /**
     * @brief Return true if the specified mouse button was released in this frame.
     */
    bool IsMouseButtonReleased(const gd::String & button) const;

    /**
     * @brief Get the number of ticks the wheel moved during last frame.
     */
    int GetMouseWheelDelta() const;

    static const std::map<gd::String, int> & GetButtonNameToSfButtonMap();
    static const std::map<int, gd::String> & GetSfButtonToButtonNameMap();
    ///@}

    /** \name Touches
     */
    ///@{
    /**
     * @brief Get all touches being made on the screen, along with their coordinates.
     */
    const std::map<int, sf::Vector2i> & GetAllTouches() { return touches; }
    ///@}

private:
    gd::RenderingWindow * window;

    int lastPressedKey; ///< SFML key code of the last pressed key.
    bool keyWasPressed; ///< True if a key was pressed during the last step.
    std::map<gd::String, bool> keysPressed; ///< The keys pressed for this frame.
    std::map<gd::String, bool> oldKeysPressed; ///< The keys pressed during the last frame.
    std::vector<sf::Uint32> charactersEntered; ///< The characters entered for this frame.

    int mouseWheelDelta;
    sf::Vector2i mousePosition; ///< The mouse position for this frame.
    std::map<gd::String, bool> buttonsPressed; ///< The buttons pressed for this frame.
    std::map<gd::String, bool> oldButtonsPressed; ///< The buttons pressed during the last frame.

    void SimulateMousePressed(sf::Vector2i pos);
    bool touchSimulateMouse;
    std::map<int, sf::Vector2i> touches;

    bool windowHasFocus; ///< True if the render target has the focus.
    bool disableInputWhenNotFocused; ///< True if input should be ignored when focus is lost.
};

#endif
