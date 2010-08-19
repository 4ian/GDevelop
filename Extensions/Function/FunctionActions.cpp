/**

Game Develop - Function Extension
Copyright (c) 2008-2010 Florian Rival (Florian.Rival@gmail.com)

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


#include "GDL/Instruction.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/RuntimeScene.h"
#include "FunctionEvent.h"
#include <iostream>
#include <fstream>
#include <string>
#include <vector>

using namespace std;

bool ActLaunchFunction( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    //Find function
    FunctionEvent * eventPtr = FunctionEvent::functionsList[&scene][action.GetParameter(0).GetPlainString()];
    if ( eventPtr == NULL ) return false;

    //Find objects concerned to transfer
    ObjectsConcerned * functionObjectsConcerned = &objectsConcerned;
    if ( !action.GetParameter(1).GetAsBool() )
    {
        ObjectsConcerned newObjectsConcerned;
        newObjectsConcerned.InheritsFrom(&objectsConcerned);
        newObjectsConcerned.Reset();
        functionObjectsConcerned = &newObjectsConcerned;
    }

    vector < string > params;

    for (unsigned int i = 2;i<action.GetParameters().size();++i)
    	params.push_back(action.GetParameters()[i].GetAsTextExpressionResult(scene, objectsConcerned));

    eventPtr->Launch(scene, *functionObjectsConcerned, params);

    return true;
}


bool ActLaunchFunctionFromExpression( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    //Find function
    FunctionEvent * eventPtr = FunctionEvent::functionsList[&scene][action.GetParameter(0).GetAsTextExpressionResult(scene, objectsConcerned)];
    if ( eventPtr == NULL ) return false;

    //Find objects concerned to transfer
    ObjectsConcerned * functionObjectsConcerned = &objectsConcerned;
    if ( !action.GetParameter(1).GetAsBool() )
    {
        ObjectsConcerned newObjectsConcerned;
        newObjectsConcerned.InheritsFrom(&objectsConcerned);
        newObjectsConcerned.Reset();
        functionObjectsConcerned = &newObjectsConcerned;
    }

    vector < string > params;

    for (unsigned int i = 2;i<action.GetParameters().size();++i)
    	params.push_back(action.GetParameters()[i].GetAsTextExpressionResult(scene, objectsConcerned));

    eventPtr->Launch(scene, *functionObjectsConcerned, params);

    return true;
}
