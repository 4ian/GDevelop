/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include <vector>
#include <string>
#include <iostream>
#include <sstream>
#include "GDL/Object.h"
#include "GDL/Event.h"
#include "GDL/Chercher.h"
#include "GDL/CommonTools.h"

#include "GDL/RuntimeScene.h"
#include "GDL/Instruction.h"
#include "GDL/ObjectsConcerned.h"

/**
 * Test the layer of an object
 */
bool Object::CondLayer( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    if ( GetLayer() == condition.GetParameter( 1 ).GetAsTextExpressionResult(scene, objectsConcerned, shared_from_this()) )
        return true;

    return false;
}

/**
 * Test if a layer is visible
 */
bool CondLayerVisible( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    string layer = condition.GetParameter(0).GetAsTextExpressionResult(scene, objectsConcerned);;
    bool isTrue = false;

    if ( scene.GetLayer(layer).GetVisibility() )
        isTrue = true;

    if ( condition.IsInverted() )
        return !isTrue;

    return isTrue;
}
