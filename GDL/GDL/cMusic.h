#ifndef CMUSIC_H
#define CMUSIC_H

#include <vector>
#include <string>
#include <iostream>
#include <sstream>
#include "GDL/cMusic.h"
#include "GDL/Object.h"
#include "GDL/Event.h"
#include "GDL/Chercher.h"
#include "GDL/RuntimeScene.h"
#include "GDL/algo.h"
#include <iostream>
#include "GDL/Access.h"
#include "GDL/SoundManager.h"
#include <SFML/Audio.hpp>

bool CondMusicPlaying( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );
bool CondMusicPaused( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );
bool CondMusicStopped( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );

bool CondSoundPlaying( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );
bool CondSoundPaused( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );
bool CondSoundStopped( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );

bool CondSoundCanalVolume( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );
bool CondMusicCanalVolume( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );
bool CondGlobalVolume( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );

#endif // CMUSIC_H
