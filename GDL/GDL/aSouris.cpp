#include <vector>
#include <string>
#include "GDL/Object.h"
#include <cmath>
#include "GDL/aSouris.h"
#include "GDL/Event.h"
#include <iostream>
#include <sstream>
#include "GDL/Chercher.h"
#include "GDL/CommonTools.h"
#include "GDL/Force.h"
#include <iostream>
#include "GDL/Access.h"
#include <SFML/Graphics.hpp>
#include "GDL/RuntimeScene.h"

bool ActCentreSouris( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    scene.renderWindow->SetCursorPosition(scene.renderWindow->GetWidth()/2, scene.renderWindow->GetHeight()/2 );

    return true;
}

bool ActCentreSourisX( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    scene.renderWindow->SetCursorPosition(scene.renderWindow->GetWidth()/2, scene.input->GetMouseY() );
    return true;
}

bool ActCentreSourisY( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    scene.renderWindow->SetCursorPosition(scene.input->GetMouseX(), scene.renderWindow->GetHeight()/2 );
    return true;
}

bool ActSetSourisXY( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    float newX = action.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned);
    float newY = action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned);

    scene.renderWindow->SetCursorPosition( newX, newY );

    return true;
}

bool ActCacheSouris( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    scene.renderWindow->ShowMouseCursor(false);
    return true;
}

bool ActMontreSouris( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    scene.renderWindow->ShowMouseCursor(true);
    return true;
}
