/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#include <vector>
#include <string>
#include "GDL/Object.h"
#include <cmath>
#include "GDL/Collisions.h"
#include "GDL/Event.h"
#include <iostream>
#include <sstream>
#include "GDL/Chercher.h"
#include "GDL/algo.h"
#include "GDL/Force.h"
#include <iostream>
#include "GDL/Access.h"
#include "GDL/RuntimeScene.h"

////////////////////////////////////////////////////////////
/// Modifie la couleur de l'arrière plan
///
/// Type : SceneBackground
/// Paramètre 1 : Nouvelle couleur
////////////////////////////////////////////////////////////
bool ActSceneBackground( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    vector < GDExpression > colors = SpliterStringToVector <GDExpression> (action.GetParameter(0).GetPlainString(), ';');

    if ( colors.size() > 2 )
    {
        scene->backgroundColorR = colors[0].GetAsMathExpressionResult(scene, objectsConcerned);
        scene->backgroundColorG = colors[1].GetAsMathExpressionResult(scene, objectsConcerned);
        scene->backgroundColorB = colors[2].GetAsMathExpressionResult(scene, objectsConcerned);
    }

    return true;
}
