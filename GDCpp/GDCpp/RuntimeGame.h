/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */
#if !defined(EMSCRIPTEN)
#ifndef RUNTIMEGAME_H
#define RUNTIMEGAME_H

#include "GDCpp/Project.h"
#include "GDCpp/RuntimeVariablesContainer.h"
#include <vector>
#include <string>
#include <map>
#include <boost/shared_ptr.hpp>

/**
 * \brief Represents a game being played.
 *
 * A RuntimeGame is used when a game is played.<be>
 * It contains everything a project provide, but also specific
 * functions and members for runtime ( variables... )
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
     *
     * Typically called automatically by the IDE or by the game executable.
     */
    void LoadFromProject( const gd::Project & project );

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
};

#endif // RUNTIMEGAME_H
#endif