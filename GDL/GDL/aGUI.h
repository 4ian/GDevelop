#ifndef AGUI_H
#define AGUI_H
#include "GDL/aGUI.h"
#include <vector>
#include <string>
#include "GDL/Object.h"
#include "GDL/Event.h"
#include <iostream>
#include <sstream>
#include "GDL/Chercher.h"
#include "GDL/Access.h"
#include "GDL/RuntimeScene.h"

bool ActShowMsgBox( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
bool ActShowOpenFile( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
bool ActShowYesNoMsgBox( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
bool ActShowTextInput( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );

#endif // AGUI_H
