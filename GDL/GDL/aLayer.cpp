#include <vector>
#include <string>
#include <iostream>
#include <cmath>
#include <sstream>
#include "GDL/Object.h"
#include "GDL/Event.h"
#include "GDL/Chercher.h"
#include "GDL/algo.h"
#include "GDL/Access.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"

/**
 * Change the layer of an object
 */
bool Object::ActChangeLayer( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    SetLayer(eval.EvalTxt(action.GetParameter(1), shared_from_this()));

    return true;
}

/**
 * Show a layer
 */
bool ActShowLayer( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    string layer = action.GetParameter(0).GetPlainString();

    scene->GetLayer(layer).SetVisibility(true);

    return true;
}

/**
 * Hide a layer
 */
bool ActHideLayer( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    string layer = action.GetParameter(0).GetPlainString();

    scene->GetLayer(layer).SetVisibility(false);

    return true;
}
