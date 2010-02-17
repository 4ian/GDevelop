#ifndef CLAYER_H
#define CLAYER_H

#include <vector>
#include "GDL/Object.h"
#include "GDL/Event.h"
#include "GDL/Access.h"
#include "GDL/RuntimeScene.h"
#include "GDL/Instruction.h"

bool CondLayerVisible( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );

#endif // CLAYER_H
