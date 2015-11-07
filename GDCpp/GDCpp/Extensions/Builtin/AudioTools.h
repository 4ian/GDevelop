/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef AUDIOTOOLS_H
#define AUDIOTOOLS_H

#include <string>
#include "GDCpp/String.h"

class RuntimeScene;

bool GD_API MusicPlaying( RuntimeScene & scene, unsigned int channel );
bool GD_API MusicPaused( RuntimeScene & scene, unsigned int channel );
bool GD_API MusicStopped( RuntimeScene & scene, unsigned int channel );
bool GD_API SoundPlaying( RuntimeScene & scene, unsigned int channel );
bool GD_API SoundPaused( RuntimeScene & scene, unsigned int channel );
bool GD_API SoundStopped( RuntimeScene & scene, unsigned int channel );
void GD_API PlaySound( RuntimeScene & scene, const gd::String & file, bool repeat, float volume, float pitch );
void GD_API PlaySoundOnChannel( RuntimeScene & scene, const gd::String & file, unsigned int channel, bool repeat, float volume, float pitch );
void GD_API StopSoundOnChannel( RuntimeScene & scene, unsigned int channel );
void GD_API PauseSoundOnChannel( RuntimeScene & scene, unsigned int channel );
void GD_API RePlaySoundOnChannel( RuntimeScene & scene, unsigned int channel );
void GD_API PlayMusic( RuntimeScene & scene, const gd::String & file, bool repeat, float volume, float pitch );
void GD_API PlayMusicOnChannel( RuntimeScene & scene, const gd::String & file, unsigned int channel, bool repeat, float volume, float pitch );
void GD_API StopMusicOnChannel( RuntimeScene & scene, unsigned int channel );
void GD_API PauseMusicOnChannel( RuntimeScene & scene, unsigned int channel );
void GD_API RePlayMusicOnChannel( RuntimeScene & scene, unsigned int channel );
void GD_API SetSoundVolumeOnChannel( RuntimeScene & scene, unsigned int channel, float pitch );
void GD_API SetMusicVolumeOnChannel( RuntimeScene & scene, unsigned int channel, float playingOffset );
double GD_API GetSoundVolumeOnChannel( RuntimeScene & scene, unsigned int channel);
double GD_API GetMusicVolumeOnChannel( RuntimeScene & scene, unsigned int channel);
void GD_API SetGlobalVolume( RuntimeScene & scene, float volume );
double GD_API GetGlobalVolume( RuntimeScene & scene );
void GD_API SetSoundPitchOnChannel( RuntimeScene & scene, unsigned int channel, float pitch );
void GD_API SetMusicPitchOnChannel( RuntimeScene & scene, unsigned int channel, float playingOffset );
double GD_API GetSoundPitchOnChannel( RuntimeScene & scene, unsigned int channel);
double GD_API GetMusicPitchOnChannel( RuntimeScene & scene, unsigned int channel);
void GD_API SetSoundPlayingOffsetOnChannel( RuntimeScene & scene, unsigned int channel, float playingOffset );
void GD_API SetMusicPlayingOffsetOnChannel( RuntimeScene & scene, unsigned int channel, float playingOffset );
double GD_API GetSoundPlayingOffsetOnChannel( RuntimeScene & scene, unsigned int channel);
double GD_API GetMusicPlayingOffsetOnChannel( RuntimeScene & scene, unsigned int channel);

#endif // AUDIOTOOLS_H
