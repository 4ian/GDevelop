#ifndef MOUSETOOLS_H
#define MOUSETOOLS_H

#include <map>
#include <string>
#include <vector>
#include "GDCpp/Runtime/String.h"

class RuntimeScene;
class RuntimeObject;

void GD_API CenterCursor(RuntimeScene &scene);
void GD_API CenterCursorHorizontally(RuntimeScene &scene);
void GD_API CenterCursorVertically(RuntimeScene &scene);
void GD_API SetCursorPosition(RuntimeScene &scene, float newX, float newY);
void GD_API HideCursor(RuntimeScene &scene);
void GD_API ShowCursor(RuntimeScene &scene);
double GD_API GetCursorXPosition(RuntimeScene &scene,
                                 const gd::String &layer,
                                 std::size_t camera);
double GD_API GetCursorYPosition(RuntimeScene &scene,
                                 const gd::String &layer,
                                 std::size_t camera);
bool GD_API MouseButtonPressed(RuntimeScene &scene, const gd::String &key);
bool GD_API MouseButtonReleased(RuntimeScene &scene, const gd::String &key);
int GD_API GetMouseWheelDelta(RuntimeScene &scene);
bool GD_API IsMouseWheelScrollingUp(RuntimeScene &scene);
bool GD_API IsMouseWheelScrollingDown(RuntimeScene &scene);

#endif  // MOUSETOOLS_H
