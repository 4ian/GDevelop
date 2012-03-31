/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef PROJECT_H
#define PROJECT_H
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDL/Game.h"

/**
 * \brief (Currently) A simple wrapper around Game.
 */
class GD_API Project : public gd::Project
{
public:
    Project(gd::Platform * platform_, Game * game_) : platform(platform_), game(game_) {};
    virtual ~Project();

    /**
     * Must return a vector containing the names of extensions used by the project.
     */
    std::vector < std::string > GetUsedPlatformExtensions() const { return game->extensionsUsed; };

    /**
     * Must return a reference to the platform the project is based on.
     */
    gd::Platform & GetPlatform() const { return *platform; };

private:
    gd::Platform * platform;
    Game * game;
};

#endif // PROJECT_H

#endif
