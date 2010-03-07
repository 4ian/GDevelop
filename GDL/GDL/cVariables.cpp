/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#include <vector>
#include <string>
#include "GDL/Object.h"
#include <cmath>
#include "GDL/cVariables.h"
#include "GDL/Event.h"
#include <iostream>
#include <sstream>
#include "GDL/Chercher.h"
#include "GDL/algo.h"
#include "GDL/Force.h"
#include <iostream>
#include "GDL/Access.h"
#include <SFML/Window.hpp>
#include "GDL/RuntimeScene.h"
#include "GDL/ListVariable.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/Instruction.h"

/**
 * Test a variable of an object
 */
bool Object::CondVarObjet( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    int varId = variablesObjet.FindVariable(condition.GetParameter( 1 ).GetPlainString());
    double varValue = varId != -1 ? variablesObjet.variables.at(varId).Getvalue() : 0;

    //Enfin, on teste vraiment.
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Equal && varValue == eval.EvalExp( condition.GetParameter( 2 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Inferior && varValue < eval.EvalExp( condition.GetParameter( 2 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Superior && varValue > eval.EvalExp( condition.GetParameter( 2 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && varValue <= eval.EvalExp( condition.GetParameter( 2 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && varValue >= eval.EvalExp( condition.GetParameter( 2 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Different && varValue != eval.EvalExp( condition.GetParameter( 2 ), shared_from_this() ) )
       )
    {
        return true;
    }

    return false;
}

/**
 * Test the text of a variable of an object
 */
bool Object::CondVarObjetTxt( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    int varId = variablesObjet.FindVariable(condition.GetParameter( 1 ).GetPlainString());
    string varValue = varId != -1 ? variablesObjet.variables[varId].Gettexte() : "";

    //Enfin, on teste vraiment.
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Equal && varValue == eval.EvalTxt( condition.GetParameter( 2 ), shared_from_this() ) ) ||
        ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Different && varValue != eval.EvalTxt( condition.GetParameter( 2 ), shared_from_this() ) )
       )
    {
        return true;
    }

    return false;
}

/**
 * Test if a variable of an object is defined
 */
bool Object::CondVarObjetDef( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    int varId = variablesObjet.FindVariable(condition.GetParameter( 1 ).GetPlainString());

    //Enfin, on teste vraiment.
    //optimisation : le test de signe en premier
    if ( varId != -1)
        return true;

    return false;
}

////////////////////////////////////////////////////////////
/// Teste une variable de la scène
///
/// Type : VarScene
/// Paramètre 1 : Nom Variable
/// Paramètre 2 : Valeur à tester
/// Paramètre 3 : Type de comparaison
////////////////////////////////////////////////////////////
bool CondVarScene( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    return CondVar(scene->variables, condition.GetParameter( 0 ).GetPlainString(), condition.GetParameter( 2 ).GetAsCompOperator(), eval.EvalExp( condition.GetParameter( 1 ) ) ) ^ condition.IsInverted();
}

////////////////////////////////////////////////////////////
/// Teste le texte d'une variable de la scène
///
/// Type : VarSceneTxt
/// Paramètre 1 : Nom Variable
/// Paramètre 2 : Chaine à tester
/// Paramètre 3 : Type de comparaison
////////////////////////////////////////////////////////////
bool CondVarSceneTxt( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    return CondVarTxt(scene->variables, condition.GetParameter( 0 ).GetPlainString(), condition.GetParameter( 2 ).GetAsCompOperator(), eval.EvalTxt( condition.GetParameter( 1 ) ) ) ^ condition.IsInverted();
}

////////////////////////////////////////////////////////////
/// Teste si une variable globale est définie
///
/// Type : VarGlobalDef
/// Paramètre 1 : Nom Variable
////////////////////////////////////////////////////////////
bool CondVarSceneDef( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    return CondVarDef(scene->variables, condition.GetParameter( 0 ).GetPlainString()) ^ condition.IsInverted();
}

////////////////////////////////////////////////////////////
/// Test une variable globale
///
/// Type : VarGlobal
/// Paramètre 1 : Nom Variable
/// Paramètre 2 : Valeur à tester
/// Paramètre 3 : Type de comparaison
////////////////////////////////////////////////////////////
bool CondVarGlobal( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    return CondVar(scene->game->variables, condition.GetParameter( 0 ).GetPlainString(), condition.GetParameter( 2 ).GetAsCompOperator(), eval.EvalExp( condition.GetParameter( 1 ) ) ) ^ condition.IsInverted();
}

////////////////////////////////////////////////////////////
/// Teste le texte d'une variable globale
///
/// Type : VarGlobalTxt
/// Paramètre 1 : Nom Variable
/// Paramètre 2 : Chaine à tester
/// Paramètre 3 : Type de comparaison
////////////////////////////////////////////////////////////
bool CondVarGlobalTxt( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    return CondVarTxt(scene->game->variables, condition.GetParameter( 0 ).GetPlainString(), condition.GetParameter( 2 ).GetAsCompOperator(), eval.EvalTxt( condition.GetParameter( 1 ) ) ) ^ condition.IsInverted();
}

////////////////////////////////////////////////////////////
/// Teste si une variable globale est définie
///
/// Type : VarGlobalDef
/// Paramètre 1 : Nom Variable
////////////////////////////////////////////////////////////
bool CondVarGlobalDef( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    return CondVarDef(scene->game->variables, condition.GetParameter( 0 ).GetPlainString()) ^ condition.IsInverted();
}

bool CondVar( const ListVariable & variables, string varName, short int compOperator, double valueToCompare )
{
    int varId = variables.FindVariable(varName);
    double varValue = varId != -1 ? variables.variables[varId].Getvalue() : 0;

    //Enfin, on teste vraiment.
    //optimisation : le test de signe en premier
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

bool CondVarTxt( const ListVariable & variables, string varName, short int compOperator, string valueToCompare )
{
    int varId = variables.FindVariable(varName);
    string varValue = varId != -1 ? variables.variables[varId].Gettexte() : "";

    //Enfin, on teste vraiment.
    //optimisation : le test de signe en premier
    if (( compOperator == GDExpression::Equal && varValue == valueToCompare ) ||
        ( compOperator == GDExpression::Different && varValue != valueToCompare )
       )
    {
        return true;
    }

    return false;
}

bool CondVarDef( const ListVariable & variables, string varName)
{
    int varId = variables.FindVariable(varName);
    if ( varId != -1 ) return true;

    return false;
}
