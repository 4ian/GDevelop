#ifndef AMUSIC_H_INCLUDED
#define AMUSIC_H_INCLUDED

#include <vector>
#include <string>
#include "GDL/Object.h"
#include <cmath>
#include "GDL/aMusic.h"
#include "GDL/Event.h"
#include <iostream>
#include <sstream>
#include "GDL/Chercher.h"
#include "GDL/CommonTools.h"
#include "GDL/Force.h"
#include <iostream>
#include "GDL/Access.h"
#include <SFML/Audio.hpp>
#include "GDL/RuntimeScene.h"

bool ActPlaySound( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActPlaySoundCanal( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActStopSoundCanal( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActPauseSoundCanal( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActRePlaySoundCanal( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );

bool ActPlayMusic( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActPlayMusicCanal( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActStopMusicCanal( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActPauseMusicCanal( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActRePlayMusicCanal( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );

bool ActModVolumeSoundCanal( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActModVolumeMusicCanal( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActModGlobalVolume( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );

#endif // AMUSIC_H_INCLUDED
