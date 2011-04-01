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


bool AStarAutomatism::ActSetDestination( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    destinationX = action.GetParameter(2).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject());
    destinationY = action.GetParameter(3).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject());

    ComputePath();

    return true;
};

bool AStarAutomatism::ActSetSpeed( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Set )
        speed = action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()  );
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Add )
        speed += action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()  );
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Substract )
        speed -= action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()  );
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Multiply )
        speed *= action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()  );
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Divide )
        speed /= action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()  );

    return true;
};

bool AStarAutomatism::ActSetCost( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Set )
        cost = action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()  );
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Add )
        cost += action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()  );
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Substract )
        cost -= action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()  );
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Multiply )
        cost *= action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()  );
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Divide )
        cost /= action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()  );

    return true;
};

bool AStarAutomatism::ActSetGridWidth( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( !runtimeScenesAStarDatas ) return false;

    if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Set )
        runtimeScenesAStarDatas->gridWidth = action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()  );
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Add )
        runtimeScenesAStarDatas->gridWidth += action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()  );
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Substract )
        runtimeScenesAStarDatas->gridWidth -= action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()  );
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Multiply )
        runtimeScenesAStarDatas->gridWidth *= action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()  );
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Divide )
        runtimeScenesAStarDatas->gridWidth /= action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()  );

    return true;
};

bool AStarAutomatism::ActSetGridHeight( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( !runtimeScenesAStarDatas ) return false;

    if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Set )
        runtimeScenesAStarDatas->gridHeight = action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()  );
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Add )
        runtimeScenesAStarDatas->gridHeight += action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()  );
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Substract )
        runtimeScenesAStarDatas->gridHeight -= action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()  );
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Multiply )
        runtimeScenesAStarDatas->gridHeight *= action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()  );
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Divide )
        runtimeScenesAStarDatas->gridHeight /= action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()  );

    return true;
};

bool AStarAutomatism::ActEnterSegment( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Set )
        EnterSegment(action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()));
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Add )
        EnterSegment(currentSegment+action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()  ));
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Substract )
        EnterSegment(currentSegment - action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()  ));
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Multiply )
        EnterSegment( currentSegment * action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()  ));
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Divide )
        EnterSegment( currentSegment / action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()  ));

    return true;
};

bool AStarAutomatism::ActSetLeftBorder( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Set )
        leftBorder = action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()  );
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Add )
        leftBorder += action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()  );
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Substract )
        leftBorder -= action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()  );
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Multiply )
        leftBorder *= action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()  );
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Divide )
        leftBorder /= action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()  );

    return true;
};

bool AStarAutomatism::ActSetRightBorder( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Set )
        rightBorder = action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()  );
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Add )
        rightBorder += action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()  );
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Substract )
        rightBorder -= action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()  );
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Multiply )
        rightBorder *= action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()  );
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Divide )
        rightBorder /= action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()  );

    return true;
};

bool AStarAutomatism::ActSetTopBorder( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Set )
        topBorder = action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()  );
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Add )
        topBorder += action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()  );
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Substract )
        topBorder -= action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()  );
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Multiply )
        topBorder *= action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()  );
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Divide )
        topBorder /= action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()  );

    return true;
};

bool AStarAutomatism::ActSetBottomBorder( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Set )
        bottomBorder = action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()  );
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Add )
        bottomBorder += action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()  );
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Substract )
        bottomBorder -= action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()  );
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Multiply )
        bottomBorder *= action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()  );
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Divide )
        bottomBorder /= action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()  );

    return true;
};
