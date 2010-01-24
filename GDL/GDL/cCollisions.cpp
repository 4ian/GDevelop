/**
 *  Game Develop
 *      Player
 *
 *  Par Florian "4ian" Rival
 *
 */
/**
 *
 *
 *  Contient une ou plusieurs conditions
 */

#include <vector>
#include <string>
#include "GDL/Object.h"
#include <cmath>
#include "GDL/cCollisions.h"
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
#include "GDL/profile.h"
#include "GDL/ObjectsConcerned.h"

#include "GDL/Instruction.h"

/**
 * Test a collision between two sprites objects
 */
bool CondCollision( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    BT_PROFILE("Collision");

    ObjectsConcerned originalObjectsConcerned = objectsConcerned;
    eval.SetObjectsConcerned(&originalObjectsConcerned);

    ObjList list = objectsConcerned.PickAndRemove(condition.GetParameter( 0 ).GetPlainString(), condition.IsGlobal());
    ObjList list2 = objectsConcerned.PickAndRemove(condition.GetParameter( 1 ).GetPlainString(), condition.IsGlobal());
    if ( condition.GetParameter( 1 ).GetPlainString() == condition.GetParameter( 0 ).GetPlainString())
        list2 = list;

    //Pour chaque objet, on retient son ID, et la liste des objets avec lesquels il est en collision.
    ObjList ObjetsEnCollisions;

	ObjList::iterator obj = list.begin();
	ObjList::const_iterator obj_end = list.end();

	ObjList::iterator obj2 = list2.begin();
	ObjList::const_iterator obj2_end = list2.end();

    //On teste la collision entre chaque objets
    for ( obj = list.begin(); obj != obj_end; ++obj )
    {
        for (obj2 = list2.begin(); obj2 != obj2_end; ++obj2 )
        {
            //On vérifie que ce n'est pas le même objet
            if ( *obj != *obj2
                && CheckCollision( boost::static_pointer_cast<SpriteObject>(*obj),
                                  boost::static_pointer_cast<SpriteObject>(*obj2) ) )
            {
                ObjetsEnCollisions.push_back(*obj);
                ObjetsEnCollisions.push_back(*obj2);
            }

        }
    }

    bool AuMoinsUnObjet = false; // Y a t il au moins 1 objet en collision ?
    bool TousLesObjets = true; // Tous les objets sont il en collision ?
    for (obj = list.begin() ; obj != obj_end; ++obj )
    {
        //L'objet est il en collision avec un autre ?
        if ( find(ObjetsEnCollisions.begin(), ObjetsEnCollisions.end(), *obj) != ObjetsEnCollisions.end() )
        {
            if ( !condition.IsInverted() ) objectsConcerned.objectsPicked.push_back( *obj );
            AuMoinsUnObjet = true;
        }
        else
        {
            if ( condition.IsInverted() ) objectsConcerned.objectsPicked.push_back( *obj );
            TousLesObjets = false;
        }
    }
    for (obj2 = list2.begin() ; obj2 != obj2_end; ++obj2 )
    {
        //L'objet est il en collision avec un autre ?
        if ( find(ObjetsEnCollisions.begin(), ObjetsEnCollisions.end(), *obj2) != ObjetsEnCollisions.end() )
        {
            if ( !condition.IsInverted() ) objectsConcerned.objectsPicked.push_back( *obj2 );
            AuMoinsUnObjet = true;
        }
        else
        {
            if ( condition.IsInverted() ) objectsConcerned.objectsPicked.push_back( *obj2 );
            TousLesObjets = false;
        }
    }

    if ( AuMoinsUnObjet && !condition.IsInverted() )
        return true;
    else if ( !AuMoinsUnObjet && !condition.IsInverted()  )
        return false;

    if ( TousLesObjets && condition.IsInverted() )
        return false;
    else if ( !TousLesObjets && condition.IsInverted() )
        return true;

    return false;
}

/**
 * Test a collision between two sprites objects with only theirs coordinates/size.
 */
bool CondCollisionNP( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{

    ObjectsConcerned originalObjectsConcerned = objectsConcerned;
    eval.SetObjectsConcerned(&originalObjectsConcerned);

    ObjList list = objectsConcerned.PickAndRemove(condition.GetParameter( 0 ).GetPlainString(), condition.IsGlobal());
    ObjList list2 = objectsConcerned.PickAndRemove(condition.GetParameter( 1 ).GetPlainString(), condition.IsGlobal());
    if ( condition.GetParameter( 1 ).GetPlainString() == condition.GetParameter( 0 ).GetPlainString())
        list2 = list;
    bool isTrue = false;

	ObjList::iterator obj = list.begin();
	ObjList::const_iterator obj_end = list.end();
    for ( ; obj != obj_end; ++obj )
    {
        bool AuMoinsUnObjet = false;
        ObjList::iterator obj2 = list2.begin();
        ObjList::const_iterator obj2_end = list2.end();
        for ( ; obj2 != obj2_end; ++obj2 )
        {
            //Enfin, on teste vraiment.
            if ( *obj != *obj2 )
            {
                sf::Clock Latence;
                if ( CheckCollisionNP(  boost::static_pointer_cast<SpriteObject>(*obj),
                                        boost::static_pointer_cast<SpriteObject>(*obj2)) )
                {
                    if ( !condition.IsInverted() )
                    {
                        isTrue = true;
                        objectsConcerned.objectsPicked.push_back( *obj ); //L'objet est ajouté aux objets concernés ( Il n'y est pas déjà )
                        objectsConcerned.objectsPicked.push_back( *obj2 ); //L'objet est ajouté aux objets concernés ( Il n'y est pas déjà )
                    }
                    AuMoinsUnObjet = true;
                }
            }
        }
        //Si l'objet n'est en collision avec AUCUN autre objets
        if ( AuMoinsUnObjet == false )
        {
            if ( condition.IsInverted() )
            {
                isTrue = true;
                objectsConcerned.objectsPicked.push_back( *obj ); //L'objet est ajouté aux objets concernés ( Il n'y est pas déjà )
            }
        }
    }

    return isTrue;
}

#undef PARAM
#undef PREPARATION
#undef RENVOI
