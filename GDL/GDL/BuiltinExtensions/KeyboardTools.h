/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */


#ifndef KEYBOARDTOOLS_H
#define KEYBOARDTOOLS_H
#include <string>

class RuntimeScene;

bool IsKeyPressed(RuntimeScene & scene, std::string key);
bool AnyKeyIsPressed(RuntimeScene & scene);

#endif // KEYBOARDTOOLS_H
