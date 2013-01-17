/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef SCENENAMEMANGLER_H
#define SCENENAMEMANGLER_H
#include <string>

/**
 * \brief Used to mangle the name of a scene
 *
 * \ingroup CodeExecutionEngine
 */
class GD_API SceneNameMangler
{
public:

    /**
     * Mangle the name of a scene, replacing all characters that are not 0-9, a-z, A-Z by "_"+AsciiCodeOfTheCharacter.
     */
    static std::string GetMangledSceneName(const std::string & originalSceneName);

private:
    SceneNameMangler() {};
    virtual ~SceneNameMangler() {};
};

#endif // SCENENAMEMANGLER_H

