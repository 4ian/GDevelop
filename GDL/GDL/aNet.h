#ifndef ANET_H
#define ANET_H

#include <vector>
#include "GDL/RuntimeScene.h"

bool ActEnvoiDataNet( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActDownloadFile( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );

#endif // ANET_H
