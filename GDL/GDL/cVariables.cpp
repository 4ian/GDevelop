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
    double varValue = variablesObjet.GetVariableValue(condition.GetParameter( 1 ).GetPlainString());

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
    string varValue = variablesObjet.GetVariableText(condition.GetParameter( 1 ).GetPlainString());

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
    return variablesObjet.HasVariable(condition.GetParameter( 1 ).GetPlainString());
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
    return scene->variables.HasVariable( condition.GetParameter( 0 ).GetPlainString() ) ^ condition.IsInverted();
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
    return scene->game->variables.HasVariable( condition.GetParameter( 0 ).GetPlainString() ) ^ condition.IsInverted();
}
