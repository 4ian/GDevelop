/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */
#if !defined(EMSCRIPTEN)
#ifndef KEYBOARDTOOLS_H
#define KEYBOARDTOOLS_H
#include <string>

class RuntimeScene;

bool IsKeyPressed(RuntimeScene & scene, std::string key);
bool AnyKeyIsPressed(RuntimeScene & scene);

#endif // KEYBOARDTOOLS_H
#endif