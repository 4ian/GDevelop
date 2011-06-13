#ifndef CVARIABLES_H_INCLUDED
#define CVARIABLES_H_INCLUDED

#include <vector>
#include <string>
#include <iostream>
#include "GDL/Object.h"
#include "GDL/Event.h"
#include "GDL/CommonTools.h"
#include "GDL/ListVariable.h"
#include "GDL/RuntimeScene.h"
#include "GDL/GDExpression.h"

bool CondVarScene( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool CondVarSceneTxt( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool GD_API CondVarSceneDef( std::string );
bool CondVarGlobal( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool CondVarGlobalTxt( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool CondVarGlobalDef( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );

/**
 * Helper function, only for internal use.
 */
inline bool CondVar( const ListVariable & variables, std::string varName, short int compOperator, double valueToCompare )
{
    double varValue = variables.GetVariableValue(varName);

    if (( compOperator == GDExpression::Equal && varValue == valueToCompare ) ||
            ( compOperator == GDExpression::Inferior && varValue < valueToCompare ) ||
            ( compOperator == GDExpression::Superior && varValue > valueToCompare ) ||
            ( compOperator == GDExpression::InferiorOrEqual && varValue <= valueToCompare ) ||
            ( compOperator == GDExpression::SuperiorOrEqual && varValue >= valueToCompare ) ||
            ( compOperator == GDExpression::Different && varValue != valueToCompare )
       )
    {
        return true;
    }

    return false;
}

/**
 * Helper function, only for internal use.
 */
inline bool CondVarTxt( const ListVariable & variables, std::string varName, short int compOperator, string valueToCompare )
{
    const std::string & varValue = variables.GetVariableString(varName);

    if (( compOperator == GDExpression::Equal && varValue == valueToCompare ) ||
        ( compOperator == GDExpression::Different && varValue != valueToCompare )
       )
    {
        return true;
    }

    return false;
}

#endif // CVARIABLES_H_INCLUDED
