/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
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
#include "GDL/CommonTools.h"
#include "GDL/Force.h"
#include <iostream>
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/ExtensionsManager.h"
#include <stdexcept>


/**
 * Duplicate an object
 */
bool Object::ActDuplicate( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    ObjSPtr newObject = Clone();

    scene.objectsInstances.AddObject(newObject);
    objectsConcerned.objectsPicked.AddObject(newObject); //Object is concerned for future actions

    return true;
}


/**
 * Create a new object
 */
bool ActCreate( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    //On récupère l'ID de l'objet à créer
    string objectWanted = action.GetParameter(0).GetPlainString();
    int IDsceneObject = Picker::PickOneObject( &scene.initialObjects, objectWanted );
    int IDglobalObject = Picker::PickOneObject( &scene.game->globalObjects, objectWanted );

    ObjSPtr newObject = boost::shared_ptr<Object> ();

    if ( IDsceneObject != -1)
        newObject = scene.initialObjects[IDsceneObject]->Clone();
    else if ( IDglobalObject != -1)
        newObject = scene.game->globalObjects[IDglobalObject]->Clone();
    else
    {
        scene.errors.Add("L'objet à créer ("+objectWanted+") n'existe pas dans la liste des objets", "", "", -1, 1);
        return false;
    }

    //Ajout à la liste d'objet et configuration de sa position
    newObject->errors = &scene.errors;
    newObject->SetX( action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned) );
    newObject->SetY( action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned) );
    newObject->LoadRuntimeResources(*scene.game->imageManager);

    //Compatibilité avec les versions de Game Develop précédentes
    if ( action.GetParameters().size() > 3 )
        newObject->SetLayer( action.GetParameter(3).GetAsTextExpressionResult(scene, objectsConcerned) );

    //Add object to scene and let it be concerned by futures actions
    scene.objectsInstances.AddObject(newObject);
    objectsConcerned.objectsPicked.AddObject( newObject );

    objectsConcerned.AddAnObjectConcerned(newObject->GetObjectIdentifier());

    return true;
}


/**
 * Create a new object using his name
 */
bool ActCreateByName( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    //On récupère l'ID de l'objet à créer
    string objectWanted = action.GetParameter(0).GetAsTextExpressionResult(scene, objectsConcerned);
    int IDsceneObject = Picker::PickOneObject( &scene.initialObjects, objectWanted );
    int IDglobalObject = Picker::PickOneObject( &scene.game->globalObjects, objectWanted );

    ObjSPtr newObject = boost::shared_ptr<Object> ();

    if ( IDsceneObject != -1)
        newObject = scene.initialObjects[IDsceneObject]->Clone();
    else if ( IDglobalObject != -1)
        newObject = scene.game->globalObjects[IDglobalObject]->Clone();
    else
    {
        scene.errors.Add("L'objet à créer ("+objectWanted+") n'existe pas dans la liste des objets", "", "", -1, 1);
        return false;
    }

    //Ajout à la liste d'objet et configuration de sa position
    newObject->errors = &scene.errors;
    newObject->SetX( action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned) );
    newObject->SetY( action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned) );
    newObject->LoadRuntimeResources(*scene.game->imageManager);

    //Compatibilité avec les versions de Game Develop précédentes
    if ( action.GetParameters().size() > 3 )
        newObject->SetLayer( action.GetParameter(3).GetAsTextExpressionResult(scene, objectsConcerned) );

    //Add object to scene and let it be concerned by futures actions
    scene.objectsInstances.AddObject(newObject);
    objectsConcerned.objectsPicked.AddObject( newObject );

    objectsConcerned.AddAnObjectConcerned(newObject->GetObjectIdentifier());

    return true;
}

/**
 * Delete an object ( renaming it to "" cause it to be deleted by RuntimeScene )
 */
bool Object::ActDelete( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    SetName("");

    //Classes that have a reference to the object must know it has not the same name anymore :
    scene.objectsInstances.ObjectIdentifierHasChanged(shared_from_this()); //Keep the object in objectsInstances from scene, but notify its identifier has changed.
    objectsConcerned.AnObjectWasDeleted(shared_from_this()); //Remove object from objectsConcerned.

    return true;
}


////////////////////////////////////////////////////////////
/// Ajouter des objets aux objets concernés
///
/// Type : AjoutObjConcern
/// Paramètre 1 : Objet(s) à ajouter
////////////////////////////////////////////////////////////
bool ActAjoutObjConcern( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    ObjList list = objectsConcerned.Pick(action.GetParameter( 0 ).GetAsObjectIdentifier(), true);

	ObjList::iterator obj = list.begin();
	ObjList::const_iterator obj_end = list.end();
    for ( ; obj != obj_end; ++obj )
    {
        objectsConcerned.objectsPicked.AddObject(*obj);
    }

    return true;
}

////////////////////////////////////////////////////////////
/// Ajouter des objets aux objets concernés
///
/// Type : AjoutObjConcern
/// Paramètre 1 : Objet(s) à ajouter
////////////////////////////////////////////////////////////
bool ActAjoutHasard( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    ObjList list = objectsConcerned.PickAndRemove(action.GetParameter( 0 ).GetAsObjectIdentifier(), action.IsGlobal());

    //On en reprend un dans la liste
    if ( !list.empty() )
    {
        int id = sf::Randomizer::Random(0, list.size()-1);
        objectsConcerned.objectsPicked.AddObject(list[id]);
    }

    return true;
}

#undef PARAM
