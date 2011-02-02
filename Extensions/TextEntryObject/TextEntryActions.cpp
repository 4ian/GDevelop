/**

Game Develop - TextEntry Object Extension
Copyright (c) 2011 Florian Rival (Florian.Rival@gmail.com)

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

#include "TextEntryObject.h"

#include "GDL/Instruction.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/RuntimeScene.h"
#include "GDL/CommonTools.h"


/**
 * Change the string
 */
bool TextEntryObject::ActString( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter(2).GetAsModOperator() == GDExpression::Set )
        SetString( action.GetParameter(1).GetAsTextExpressionResult(scene, objectsConcerned, shared_from_this()) );
    else if ( action.GetParameter(2).GetAsModOperator() == GDExpression::Add )
        SetString( GetString() + action.GetParameter(1).GetAsTextExpressionResult(scene, objectsConcerned, shared_from_this()) );

    return true;
}

/**
 * Change the string
 */
bool TextEntryObject::ActActivate( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    activated = action.GetParameter(1).GetAsBool();

    return true;
}
