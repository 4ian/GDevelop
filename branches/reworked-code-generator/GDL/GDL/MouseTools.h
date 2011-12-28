#ifndef MOUSETOOLS_H
#define MOUSETOOLS_H

#include <string>
class RuntimeScene;

void GD_API CenterCursor( RuntimeScene & scene );
void GD_API CenterCursorHorizontally( RuntimeScene & scene );
void GD_API CenterCursorVertically( RuntimeScene & scene );
void GD_API SetCursorPosition( RuntimeScene & scene, float newX, float newY );
void GD_API HideCursor( RuntimeScene & scene );
void GD_API ShowCursor( RuntimeScene & scene );
double GD_API GetCursorXPosition( RuntimeScene & scene, const std::string & layer, unsigned int camera );
double GD_API GetCursorYPosition( RuntimeScene & scene, const std::string & layer, unsigned int camera );
bool GD_API MouseButtonPressed( RuntimeScene & scene, const std::string & key );
int GD_API GetMouseWheelDelta(RuntimeScene & scene );

#endif // MOUSETOOLS_H
