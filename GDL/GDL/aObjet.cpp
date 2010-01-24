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
#include "GDL/Object.h"
#include <cmath>
#include "GDL/aObjet.h"
#include "GDL/Event.h"
#include <iostream>
#include <sstream>
#include "GDL/Chercher.h"
#include "GDL/algo.h"
#include "GDL/Force.h"
#include <iostream>
#include "GDL/Access.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/ExtensionsManager.h"
#include <stdexcept>



/**
 * Duplicate an object
 */
bool Object::ActDuplicate( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    gdp::ExtensionsManager * extensionManager = gdp::ExtensionsManager::getInstance();

    scene->objets.push_back( extensionManager->CreateObject(shared_from_this()) );
    objectsConcerned.objectsPicked.push_back( scene->objets.back() ); //Ajout aux objets concernés

    return true;
}


/**
 * Create a new object
 */
bool ActCreate( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    //On récupère l'ID de l'objet à créer
    string objectWanted = eval.EvalTxt(action.GetParameter( 0 ));
    int IDsceneObject = Picker::PickOneObject( &scene->objetsInitiaux, objectWanted );
    int IDglobalObject = Picker::PickOneObject( &scene->game->globalObjects, objectWanted );

    gdp::ExtensionsManager * extensionManager = gdp::ExtensionsManager::getInstance();

    if ( IDsceneObject != -1)
        scene->objets.push_back( extensionManager->CreateObject(scene->objetsInitiaux[IDsceneObject]) );
    else if ( IDglobalObject != -1)
        scene->objets.push_back( extensionManager->CreateObject(scene->game->globalObjects[IDglobalObject]) );
    else
    {
        scene->errors.Add("L'objet à créer ("+objectWanted+") n'existe pas dans la liste des objets", "", "", -1, 1);
        return false;
    }

    //Ajout à la liste d'objet et configuration de sa position
    scene->objets.back()->errors = &scene->errors;
    scene->objets.back()->SetX( eval.EvalExp( action.GetParameter( 1 ) ) );
    scene->objets.back()->SetY( eval.EvalExp( action.GetParameter( 2 ) ) );

    //Compatibilité avec les versions de Game Develop précédentes
    if ( action.GetParameters().size() > 3 )
        scene->objets.back()->SetLayer( eval.EvalTxt( action.GetParameter( 3 ) ) );

    //Ajout aux objets concernés
    objectsConcerned.objectsPicked.push_back( scene->objets.back() );
    objectsConcerned.AddAnObjectConcerned(objectWanted);

    return true;
}


/**
 * Delete an object ( renaming it to "" cause it to be deleted by RuntimeScene )
 */
bool Object::ActDelete( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    SetName("");

    return true;
}


////////////////////////////////////////////////////////////
/// Ajouter des objets aux objets concernés
///
/// Type : AjoutObjConcern
/// Paramètre 1 : Objet(s) à ajouter
////////////////////////////////////////////////////////////
bool ActAjoutObjConcern( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    ObjList list = objectsConcerned.Pick(action.GetParameter( 0 ).GetPlainString(), action.IsGlobal());

	ObjList::iterator obj = list.begin();
	ObjList::const_iterator obj_end = list.end();
    for ( ; obj != obj_end; ++obj )
    {
        objectsConcerned.objectsPicked.push_back(*obj);
        //TODO : Encore utile ?
    }

    return true;
}

////////////////////////////////////////////////////////////
/// Ajouter des objets aux objets concernés
///
/// Type : AjoutObjConcern
/// Paramètre 1 : Objet(s) à ajouter
////////////////////////////////////////////////////////////
bool ActAjoutHasard( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    ObjList list = objectsConcerned.PickAndRemove(action.GetParameter( 0 ).GetPlainString(), action.IsGlobal());

    //On en reprend un dans la liste
    if ( !list.empty() )
    {
        int id = sf::Randomizer::Random(0, list.size()-1);
        objectsConcerned.objectsPicked.push_back(list[id]);
    }

    return true;
}

#undef PARAM
