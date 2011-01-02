#include <vector>
#include <string>
#include <iostream>
#include <SFML/Graphics.hpp>
#include "GDL/Object.h"
#include "GDL/Event.h"
#include "GDL/CommonTools.h"
#include "GDL/RuntimeScene.h"
#include "GDL/Instruction.h"
#include "GDL/ObjectsConcerned.h"

////////////////////////////////////////////////////////////
/// Test du nombre d'objet
///
/// Type : NbObjet
/// Paramètre 1 : Nom de l'objet
/// Paramètre 2 : Nombre à tester
/// Paramètre 3 : Signe du test
////////////////////////////////////////////////////////////
bool CondNbObjet( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    ObjectsConcerned objectsConcernedForExpressions = objectsConcerned;

    ObjList list = objectsConcerned.PickAndRemove(condition.GetParameter( 0 ).GetAsObjectIdentifier(), condition.IsGlobal());
    bool isTrue = false;

    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && list.size() == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcernedForExpressions) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && list.size() < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcernedForExpressions) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && list.size() > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcernedForExpressions) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && list.size() <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcernedForExpressions) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && list.size() >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcernedForExpressions) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && list.size() != condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcernedForExpressions) )
       )
    {
        //Le nombre d'objet est ok
        if ( !condition.IsInverted() ) isTrue = true;
    }
    else
    {
        if ( condition.IsInverted() ) isTrue = true;
    }

    //Pour chaque objet concerné
    //TODO : ?
	ObjList::iterator obj = list.begin();
	ObjList::const_iterator obj_end = list.end();
    for ( ; obj != obj_end; ++obj )
    {
        objectsConcerned.objectsPicked.AddObject(*obj);
    }

    return isTrue;
}

////////////////////////////////////////////////////////////
/// Ajouter des objets aux objet concernés
///
/// Type : AjoutObjConcern
/// Paramètre 1 : Objet à ajouter
////////////////////////////////////////////////////////////
bool CondAjoutObjConcern( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    ObjList list = objectsConcerned.PickAndRemove(condition.GetParameter( 0 ).GetAsObjectIdentifier(), true);

	ObjList::iterator obj = list.begin();
	ObjList::const_iterator obj_end = list.end();
    for ( ; obj != obj_end; ++obj )
    {
        objectsConcerned.objectsPicked.AddObject(*obj);
    }

    return true;
}

////////////////////////////////////////////////////////////
/// Ajouter un objet au hasard ayant le nom indiqué aux objet concernés
///
/// Type : AjoutHasard
/// Paramètre 1 : Objet à ajouter
////////////////////////////////////////////////////////////
bool CondAjoutHasard( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    ObjList list = objectsConcerned.PickAndRemove(condition.GetParameter( 0 ).GetAsObjectIdentifier(), condition.IsGlobal());

    //On en reprend un dans la liste
    if ( !list.empty() )
    {
        int id = sf::Randomizer::Random(0, list.size()-1);
        objectsConcerned.objectsPicked.AddObject(list[id]);
    }


    return true;
}
