/**
 *  Game Develop
 *      Player
 *
 *  Par Florian "4ian" Rival
 *
 */
/**
 *
 *
 *  Conditions sur les calques
 */

#include <vector>
#include <string>
#include <iostream>
#include <sstream>
#include "GDL/Object.h"
#include "GDL/Event.h"
#include "GDL/Chercher.h"
#include "GDL/algo.h"
#include "GDL/Access.h"
#include "GDL/RuntimeScene.h"
#include "GDL/Instruction.h"
#include "GDL/ObjectsConcerned.h"

/**
 * Test the layer of an object
 */
bool Object::CondLayer( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    if ( GetLayer() == eval.EvalTxt( condition.GetParameter( 1 ), shared_from_this() ))
        return true;

    return false;
}

/**
 * Test if a layer is visible
 */
bool CondLayerVisible( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    string layer = condition.GetParameter(0).GetPlainString();
    bool isTrue = false;

    if ( scene->GetLayer(layer).GetVisibility() )
        isTrue = true;

    if ( condition.IsInverted() )
        return !isTrue;

    return isTrue;
}
