/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef PROFILETOOLS_H
#define PROFILETOOLS_H
#include <vector>
#include <map>
class ProfileEvent;
class Scene;
class RuntimeScene;

void GD_API StartProfileTimer(RuntimeScene & scene, unsigned int id);
void GD_API EndProfileTimer(RuntimeScene & scene, unsigned int id);

#endif // PROFILETOOLS_H

#endif
