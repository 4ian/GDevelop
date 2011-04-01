/**

Game Develop - A Star Automatism Extension
Copyright (c) 2010-2011 Florian Rival (Florian.Rival@gmail.com)

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

#include "AStarAutomatism.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/Instruction.h"

bool AStarAutomatism::CondSpeed( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    if (( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Equal && speed == condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Inferior && speed < condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Superior && speed > condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && speed <= condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && speed >= condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Different && speed != condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) )
       )
    {
        return true;
    }

    return false;
}

bool AStarAutomatism::CondCost( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    if (( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Equal && cost == condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Inferior && cost < condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Superior && cost > condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && cost <= condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && cost >= condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Different && cost != condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) )
       )
    {
        return true;
    }

    return false;
}

bool AStarAutomatism::CondGridWidth( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    if ( !runtimeScenesAStarDatas ) return false;

    if (( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Equal && runtimeScenesAStarDatas->gridWidth == condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Inferior && runtimeScenesAStarDatas->gridWidth < condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Superior && runtimeScenesAStarDatas->gridWidth > condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && runtimeScenesAStarDatas->gridWidth <= condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && runtimeScenesAStarDatas->gridWidth >= condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Different && runtimeScenesAStarDatas->gridWidth != condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) )
       )
    {
        return true;
    }

    return false;
}

bool AStarAutomatism::CondGridHeight( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    if ( !runtimeScenesAStarDatas ) return false;

    if (( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Equal && runtimeScenesAStarDatas->gridHeight == condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Inferior && runtimeScenesAStarDatas->gridHeight < condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Superior && runtimeScenesAStarDatas->gridHeight > condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && runtimeScenesAStarDatas->gridHeight <= condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && runtimeScenesAStarDatas->gridHeight >= condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Different && runtimeScenesAStarDatas->gridHeight != condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) )
       )
    {
        return true;
    }

    return false;
}

bool AStarAutomatism::CondLeftBorder( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    if (( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Equal && leftBorder == condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Inferior && leftBorder < condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Superior && leftBorder > condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && leftBorder <= condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && leftBorder >= condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Different && leftBorder != condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) )
       )
    {
        return true;
    }

    return false;
}

bool AStarAutomatism::CondRightBorder( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    if (( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Equal && rightBorder == condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Inferior && rightBorder < condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Superior && rightBorder > condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && rightBorder <= condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && rightBorder >= condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Different && rightBorder != condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) )
       )
    {
        return true;
    }

    return false;
}
bool AStarAutomatism::CondBottomBorder( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    if (( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Equal && bottomBorder == condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Inferior && bottomBorder < condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Superior && bottomBorder > condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && bottomBorder <= condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && bottomBorder >= condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Different && bottomBorder != condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) )
       )
    {
        return true;
    }

    return false;
}
bool AStarAutomatism::CondTopBorder( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    if (( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Equal && topBorder == condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Inferior && topBorder < condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Superior && topBorder > condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && topBorder <= condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && topBorder >= condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Different && topBorder != condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) )
       )
    {
        return true;
    }

    return false;
}
