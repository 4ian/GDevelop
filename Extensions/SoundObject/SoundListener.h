/**

Sound Object Extension
Copyright (c) 2011-2012 Thomas Flecy
This project is released under the MIT License.
*/
#ifndef SOUNDLISTENER_H
#define SOUNDLISTENER_H

void GD_EXTENSION_API SetListenerX(const float & xpos);
void GD_EXTENSION_API SetListenerY(const float & ypos);
void GD_EXTENSION_API SetListenerZ(const float & zpos);

float GD_EXTENSION_API GetListenerX();
float GD_EXTENSION_API GetListenerY();
float GD_EXTENSION_API GetListenerZ();

void GD_EXTENSION_API SetListenerDirectionX(const float & xdir);
void GD_EXTENSION_API SetListenerDirectionY(const float & ydir);
void GD_EXTENSION_API SetListenerDirectionZ(const float & zdir);

float GD_EXTENSION_API GetListenerDirectionX();
float GD_EXTENSION_API GetListenerDirectionY();
float GD_EXTENSION_API GetListenerDirectionZ();

void GD_EXTENSION_API SetGlobalVolume(const float & globalVolume);
float GD_EXTENSION_API GetGlobalVolume();

#endif

