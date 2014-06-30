/**

Sound Object Extension
Copyright (c) 2011-2012 Thomas Flecy

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

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

