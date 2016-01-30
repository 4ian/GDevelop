#ifndef RUNTIMESCENECAMERATOOLS_H
#define RUNTIMESCENECAMERATOOLS_H

#include <string>
#include <vector>
#include "GDCpp/Runtime/String.h"

class RuntimeObject;
class RuntimeScene;

float GD_API GetCameraX(RuntimeScene & scene, const gd::String & layer, std::size_t camera);
float GD_API GetCameraY(RuntimeScene & scene, const gd::String & layer, std::size_t camera);
void GD_API SetCameraX(RuntimeScene & scene, float x, const gd::String & layer, std::size_t camera);
void GD_API SetCameraY(RuntimeScene & scene, float y, const gd::String & layer, std::size_t camera);
double GD_API GetCameraAngle(RuntimeScene & scene, const gd::String & layer, std::size_t camera);
void GD_API SetCameraAngle(RuntimeScene & scene, float newValue, const gd::String & layer, std::size_t camera);
void GD_API SetCameraZoom(RuntimeScene & scene, float newZoom, const gd::String & layer, std::size_t cameraNb);
double GD_API GetCameraWidth(RuntimeScene & scene, const gd::String & layer, std::size_t camera);
double GD_API GetCameraHeight(RuntimeScene & scene, const gd::String & layer, std::size_t camera);
double GD_API GetCameraViewportLeft(RuntimeScene & scene, const gd::String & layer, std::size_t camera);
double GD_API GetCameraViewportTop(RuntimeScene & scene, const gd::String & layer, std::size_t camera);
double GD_API GetCameraViewportRight(RuntimeScene & scene, const gd::String & layer, std::size_t camera);
double GD_API GetCameraViewportBottom(RuntimeScene & scene, const gd::String & layer, std::size_t camera);
void GD_API SetCameraSize( RuntimeScene & scene, const gd::String & layer, std::size_t cameraNb, float width, float height);
void GD_API CenterCameraOnObjectWithLimits(RuntimeScene & scene, RuntimeObject * object, float left, float top, float right, float bottom, bool anticipateObjectMove, const gd::String & layer, std::size_t camera);
void GD_API CenterCameraOnObject(RuntimeScene & scene, RuntimeObject * object, bool anticipateObjectMove, const gd::String & layer, std::size_t camera);
void GD_API ActDeleteCamera(RuntimeScene & scene, const gd::String & layer, std::size_t camera);
void GD_API AddCamera( RuntimeScene & scene, const gd::String & layer, float width, float height, float viewportLeft, float viewportTop, float viewportRight, float viewportBottom );
void GD_API SetCameraViewport( RuntimeScene & scene,  const gd::String & layer, std::size_t cameraNb, float viewportLeft, float viewportTop, float viewportRight, float viewportBottom );

#endif // RUNTIMESCENECAMERATOOLS_H
