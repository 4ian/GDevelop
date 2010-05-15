/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
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
#include "GDL/CommonTools.h"
#include "GDL/Force.h"
#include <iostream>
#include "GDL/Access.h"
#include "GDL/ListVariable.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"

/**
 * Modify a variable of an object
 */
bool Object::ActModVarObjet( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    //Get the variable to modify
    Variable & variable = variablesObjet.ObtainVariable( action.GetParameter( 1 ).GetPlainString() );

    //Update variable value
    if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Set )
        variable = action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()  );
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Add )
        variable += action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()  );
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Substract )
        variable -= action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()  );
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Multiply )
        variable *= action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()  );
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Divide )
        variable /= action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()  );

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
bool Object::ActModVarObjetTxt( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    //Get the variable to modify
    Variable & variable = variablesObjet.ObtainVariable( action.GetParameter( 1 ).GetPlainString() );

    //Update variable value
    if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Set )
        variable = action.GetParameter(2).GetAsTextExpressionResult(scene, objectsConcerned, shared_from_this()  );
    else if ( action.GetParameter( 3 ).GetAsModOperator() == GDExpression::Add )
        variable += action.GetParameter(2).GetAsTextExpressionResult(scene, objectsConcerned, shared_from_this()  );

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
bool ActModVarScene( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    return ModVar( scene.variables, action.GetParameter( 0 ).GetPlainString(), action.GetParameter( 2 ).GetAsModOperator(), action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned));
}

////////////////////////////////////////////////////////////
/// Modifier une variable globale
///
/// Type : ModVarGlobal
/// Paramètre 1 : Nom de la variable globale
/// Paramètre 2 : Valeur
/// Paramètre 3 : Type de modif ( mettre à, soustraire, ajouter... )
////////////////////////////////////////////////////////////
bool ActModVarGlobal( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    return ModVar( scene.game->variables, action.GetParameter( 0 ).GetPlainString(), action.GetParameter( 2 ).GetAsModOperator(), action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned));
}

////////////////////////////////////////////////////////////
/// Modifier le texte d'une variable d'une scene
///
/// Type : ModVarSceneTxt
/// Paramètre 2 : Nom de la variable
/// Paramètre 3 : Texte
/// Paramètre 4 : Type de modif ( mettre à, soustraire, ajouter... )
////////////////////////////////////////////////////////////
bool ActModVarSceneTxt( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    return ModVarTxt( scene.variables, action.GetParameter( 0 ).GetPlainString(), action.GetParameter( 2 ).GetAsModOperator(), action.GetParameter(1).GetAsTextExpressionResult(scene, objectsConcerned));
}

////////////////////////////////////////////////////////////
/// Modifier le texte d'une variable d'une scene
///
/// Type : ModVarGlobalTxt
/// Paramètre 2 : Nom de la variable
/// Paramètre 3 : Texte
/// Paramètre 4 : Type de modif ( mettre à, soustraire, ajouter... )
////////////////////////////////////////////////////////////
bool ActModVarGlobalTxt( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    return ModVarTxt( scene.game->variables, action.GetParameter( 0 ).GetPlainString(), action.GetParameter( 2 ).GetAsModOperator(), action.GetParameter(1).GetAsTextExpressionResult(scene, objectsConcerned));
}
