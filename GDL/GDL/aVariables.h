/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef AVARIABLES_H_INCLUDED
#define AVARIABLES_H_INCLUDED

#include <vector>
#include <string>
#include "GDL/ListVariable.h"
#include "GDL/RuntimeScene.h"

bool ActModVarScene( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActModVarGlobal( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActModVarSceneTxt( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActModVarGlobalTxt( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );

/**
 * Helper function, only for internal ( ActModVarScene, ActModVarGlobal ) use.
 */
inline bool ModVar( ListVariable & variables, string varName, short int modOperator, double value )
{
    //Get the variable to modify
    Variable & variable = variables.ObtainVariable( varName );

    //Update variable value
    if ( modOperator == GDExpression::Set )
        variable = value;
    else if ( modOperator == GDExpression::Add )
        variable += value;
    else if ( modOperator == GDExpression::Substract )
        variable -= value;
    else if ( modOperator == GDExpression::Multiply )
        variable *= value;
    else if ( modOperator == GDExpression::Divide )
        variable /= value;

    return true;
};

/**
 * Helper function, only for internal ( ActModVarSceneTxt, ActModVarGlobalTxt ) use.
 */
inline bool ModVarTxt( ListVariable & variables, string varName, short int modOperator, string value )
{
    //Get the variable to modify
    Variable & variable = variables.ObtainVariable( varName );

    //Update variable value
    if ( modOperator == GDExpression::Set )
        variable = value;
    else if ( modOperator == GDExpression::Add )
        variable += value;

    return true;
}

#endif // AVARIABLES_H_INCLUDED
