/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef RUNTIMEGAME_H
#define RUNTIMEGAME_H

#include "GDCpp/Runtime/Project/Project.h"
#include "GDCpp/Runtime/SoundManager.h"
#include "GDCpp/Runtime/RuntimeVariablesContainer.h"
#include <vector>
#include <string>
#include <map>
#include <memory>
class SoundManager;

/**
 * \brief Represents a game being played.
 *
 * It contains everything a project provides, but also specific
 * functions and members for runtime (variables...)
 *
 * \ingroup GameEngine
 */
class GD_API RuntimeGame : public gd::Project
{
public:
    RuntimeGame();
    virtual ~RuntimeGame() {};

    /**
     * \brief Set up the RuntimeGame using a gd::Project.
     */
    void LoadFromProject( const gd::Project & project );

    /**
     * Return the sound manager of the game.
     */
    SoundManager & GetSoundManager() { return soundManager; };

    /**
     * Return the sound manager of the game.
     */
    const SoundManager & GetSoundManager() const { return soundManager; };

    /**
     * \brief Provide access to the global variables container
     */
    inline const RuntimeVariablesContainer & GetVariables() const { return variables; }

    /**
     * \brief Provide access to the global variables container
     */
    inline RuntimeVariablesContainer & GetVariables() { return variables; }

private:
    RuntimeVariablesContainer variables; ///<List of the global variables
    SoundManager soundManager;
};

#endif // RUNTIMEGAME_H
