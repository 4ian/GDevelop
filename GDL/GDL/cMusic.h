#ifndef CMUSIC_H
#define CMUSIC_H

class RuntimeScene;
class ObjectsConcerned;
class Instruction;

bool CondMusicPlaying( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool CondMusicPaused( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool CondMusicStopped( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );

bool CondSoundPlaying( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool CondSoundPaused( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool CondSoundStopped( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );

bool CondSoundCanalVolume( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool CondMusicCanalVolume( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool CondGlobalVolume( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );

bool CondSoundChannelPitch( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool CondMusicChannelPitch( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );

#endif // CMUSIC_H
