/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef SCENENAMEMANGLER_H
#define SCENENAMEMANGLER_H
#include <string>

/**
 * Used to mangle the name of a scene
 */
class GD_API SceneNameMangler
{
public:

    /**
     * Mangle the name of a scene, replacing all characters that are not 0-9, a-z, A-Z or _ by "_"+AsciiCodeOfTheCharacter.
     */
    static std::string GetMangledSceneName(const std::string & originalSceneName);

private:
    SceneNameMangler() {};
    virtual ~SceneNameMangler() {};
};

#endif // SCENENAMEMANGLER_H
