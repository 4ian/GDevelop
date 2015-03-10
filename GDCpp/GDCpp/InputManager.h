/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef INPUTMANAGER_H
#define INPUTMANAGER_H
#include <vector>
#include <map>
#include <string>
#include <SFML/Window.hpp>

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
        windowHasFocus(true),
        disableInputWhenNotFocused(true)
    {
    }

    /**
     * @brief Constructor to specify a window to manage.
     */
    InputManager(sf::Window * win);

    /** \name Connection with window and events management
     */
    ///@{
    /**
     * \brief Set the window managed by the input manager.
     */
    InputManager & SetWindow(sf::Window * win) { window = win; return *this; }

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
    std::string GetLastPressedKey() const;

    /**
     * \brief Return true if the specified key name is pressed.
     */
    bool IsKeyPressed(std::string key) const;

    /**
     * \brief Return true if any key was pressed since the last call
     * to NextFrame.
     */
    bool AnyKeyIsPressed() const;

    /**
     * @brief Get the unicode value of the characters entered during the last frame.
     */
    std::vector<sf::Uint32> GetCharactersEntered() const { return charactersEntered; };

    static const std::map<std::string, int> & GetKeyNameToSfKeyMap();
    static const std::map<int, std::string> & GetSfKeyToKeyNameMap();
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
    bool IsMouseButtonPressed(const std::string & button) const;

    /**
     * @brief Get the number of ticks the wheel moved during last frame.
     */
    int GetMouseWheelDelta() const;
    ///@}

private:
    sf::Window * window;
    int lastPressedKey; ///< SFML key code of the last pressed key.
    int mouseWheelDelta;
    bool keyWasPressed; ///< True if a key was pressed during the last step.
    bool windowHasFocus; ///< True if the render target has the focus.
    bool disableInputWhenNotFocused; ///< True if input should be ignored when focus is lost.
    std::vector<sf::Uint32> charactersEntered; ///< The characters entered during the last frame.
};

#endif
