/**
 *  Game Develop
 *      Player
 *
 *  Par Florian "4ian" Rival
 *
 */
/**
 *
 *  Contient une ou plusieurs actions
 */

#include <vector>
#include <string>
#include "GDL/aVariables.h"
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
#include "GDL/ListVariable.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"

/**
 * Modify a variable of an object
 */
bool Object::ActModVarObjet( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    //On cherche la variable
    int ID = variablesObjet.FindVariable( action.GetParameter( 1 ).GetPlainString() );
    if ( ID == -1 )
    {
        //Si elle n'existe pas, on la créer
        variablesObjet.variables.push_back( Variable( action.GetParameter(1).GetPlainString() ) );

        //On reprend l'identifiant
        ID = variablesObjet.variables.size() - 1;
    }


    //On modifie la variable
    if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Set )
        variablesObjet.variables.at( ID ) = eval.EvalExp( action.GetParameter( 2 ), shared_from_this()  );
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Add )
        variablesObjet.variables.at( ID ) += eval.EvalExp( action.GetParameter( 2 ), shared_from_this()  );
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Substract )
        variablesObjet.variables.at( ID ) -= eval.EvalExp( action.GetParameter( 2 ), shared_from_this()  );
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Multiply )
        variablesObjet.variables.at( ID ) *= eval.EvalExp( action.GetParameter( 2 ), shared_from_this()  );
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Divide )
        variablesObjet.variables.at( ID ) /= eval.EvalExp( action.GetParameter( 2 ), shared_from_this()  );

    return true;
}


////////////////////////////////////////////////////////////
/// Modifier le texte d'une variable d'un objet
///
/// Type : ModVarObjetTxt
/// Paramètre 1 : Objet
/// Paramètre 2 : Nom de la variable
/// Paramètre 3 : Texte
/// Paramètre 4 : Type de modif ( mettre à,  ajouter... )
////////////////////////////////////////////////////////////
bool Object::ActModVarObjetTxt( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    //On cherche la variable
    int ID = variablesObjet.FindVariable( action.GetParameter( 1 ).GetPlainString() );
    if ( ID == -1 )
    {
        //Si elle n'existe pas, on la créer
        variablesObjet.variables.push_back( Variable( action.GetParameter(1).GetPlainString() ) );

        //On reprend l'identifiant
        ID = variablesObjet.variables.size() - 1;
    }

    //On modifie la variable
    if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Set )
        variablesObjet.variables.at( ID ) = eval.EvalTxt( action.GetParameter( 2 ), shared_from_this()  );
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Add )
        variablesObjet.variables.at( ID ) += eval.EvalTxt( action.GetParameter( 2 ), shared_from_this()  );

    return true;
}

bool ModVar( ListVariable & variables, string varName, int modOperator, double value )
{
    //On cherche la variable
    int ID = variables.FindVariable( varName );
    if ( ID == -1 )
    {
        //Si elle n'existe pas, on la créer
        variables.variables.push_back( Variable(varName) );
        //On reprend l'identifiant
        ID = variables.variables.size() - 1;
    }

    //On modifie la variable
    if ( modOperator == GDExpression::Set )
        variables.variables[ID] = value;
    else if ( modOperator == GDExpression::Add )
        variables.variables[ID] += value;
    else if ( modOperator == GDExpression::Substract )
        variables.variables[ID] -= value;
    else if ( modOperator == GDExpression::Multiply )
        variables.variables[ID] *= value;
    else if ( modOperator == GDExpression::Divide )
        variables.variables[ID] /= value;

    return true;
}

////////////////////////////////////////////////////////////
/// Modifier une variable scene
///
/// Type : ModVarScene
/// Paramètre 1 : Nom de la variable de la scène
/// Paramètre 2 : Valeur
/// Paramètre 3 : Type de modif ( mettre à, soustraire, ajouter... )
////////////////////////////////////////////////////////////
bool ActModVarScene( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    return ModVar( scene->variables, action.GetParameter( 0 ).GetPlainString(), action.GetParameter( 2 ).GetAsModOperator(), eval.EvalExp( action.GetParameter( 1 ) ));
}

////////////////////////////////////////////////////////////
/// Modifier une variable globale
///
/// Type : ModVarGlobal
/// Paramètre 1 : Nom de la variable globale
/// Paramètre 2 : Valeur
/// Paramètre 3 : Type de modif ( mettre à, soustraire, ajouter... )
////////////////////////////////////////////////////////////
bool ActModVarGlobal( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    return ModVar( scene->game->variables, action.GetParameter( 0 ).GetPlainString(), action.GetParameter( 2 ).GetAsModOperator(), eval.EvalExp( action.GetParameter( 1 ) ));
}

bool ModVarTxt( ListVariable & variables, string varName, int modOperator, string value )
{
    //On cherche la variable
    int ID = variables.FindVariable( varName );
    if ( ID == -1 )
    {
        //Si elle n'existe pas, on la créer
        variables.variables.push_back( Variable(varName) );
        //On reprend l'identifiant
        ID = variables.variables.size() - 1;
    }

    //On modifie la variable
    if ( modOperator == GDExpression::Set )
        variables.variables[ID] = value;
    else if ( modOperator == GDExpression::Add )
        variables.variables[ID] += value;

    return true;
}

////////////////////////////////////////////////////////////
/// Modifier le texte d'une variable d'une scene
///
/// Type : ModVarSceneTxt
/// Paramètre 2 : Nom de la variable
/// Paramètre 3 : Texte
/// Paramètre 4 : Type de modif ( mettre à, soustraire, ajouter... )
////////////////////////////////////////////////////////////
bool ActModVarSceneTxt( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    return ModVarTxt( scene->variables, action.GetParameter( 0 ).GetPlainString(), action.GetParameter( 2 ).GetAsModOperator(), eval.EvalTxt( action.GetParameter( 1 ) ));
}

////////////////////////////////////////////////////////////
/// Modifier le texte d'une variable d'une scene
///
/// Type : ModVarGlobalTxt
/// Paramètre 2 : Nom de la variable
/// Paramètre 3 : Texte
/// Paramètre 4 : Type de modif ( mettre à, soustraire, ajouter... )
////////////////////////////////////////////////////////////
bool ActModVarGlobalTxt( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    return ModVarTxt( scene->game->variables, action.GetParameter( 0 ).GetPlainString(), action.GetParameter( 2 ).GetAsModOperator(), eval.EvalTxt( action.GetParameter( 1 ) ));
}
