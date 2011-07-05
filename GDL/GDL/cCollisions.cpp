/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include <vector>
#include <string>
#include <iostream>
#include "GDL/Object.h"
#include "GDL/Event.h"
#include "GDL/CommonTools.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/Instruction.h"
#include "GDL/SpriteObject.h"
#include "GDL/RotatedRectangleCollision.h"
#include "GDL/Collisions.h"
#include "GDL/profile.h"

/**
 * Test a collision between two sprites objects
 */
bool CondCollision( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    bool isTrue = false;

    ObjList list = objectsConcerned.PickAndRemove(condition.GetParameter( 0 ).GetAsObjectIdentifier(), condition.IsGlobal());
    ObjList list2 = objectsConcerned.PickAndRemove(condition.GetParameter( 1 ).GetAsObjectIdentifier(), condition.IsGlobal());
    if ( condition.GetParameter( 1 ).GetAsObjectIdentifier() == condition.GetParameter( 0 ).GetAsObjectIdentifier())
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
            if ( *obj != *obj2 &&
                CheckCollision( boost::static_pointer_cast<SpriteObject>(*obj), boost::static_pointer_cast<SpriteObject>(*obj2) ) ^ condition.IsInverted() )
            {
                objectsConcerned.objectsPicked.AddObject( *obj );
                objectsConcerned.objectsPicked.AddObject( *obj2 );
                isTrue = true;
            }
        }
    }

    return isTrue;
}

/**
 * Test a collision between two objects using their hitboxes
 */
bool CondHBCollision( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    ObjList list = objectsConcerned.PickAndRemove(condition.GetParameter( 0 ).GetAsObjectIdentifier(), condition.IsGlobal());
    ObjList list2 = objectsConcerned.PickAndRemove(condition.GetParameter( 1 ).GetAsObjectIdentifier(), condition.IsGlobal());
    if ( condition.GetParameter( 1 ).GetAsObjectIdentifier() == condition.GetParameter( 0 ).GetAsObjectIdentifier())
        list2 = list;
    bool isTrue = false;

    //Test each object against each other objects
	ObjList::iterator obj = list.begin();
	ObjList::const_iterator obj_end = list.end();
    for ( ; obj != obj_end; ++obj )
    {
        bool AuMoinsUnObjet = false;
        ObjList::iterator obj2 = list2.begin();
        ObjList::const_iterator obj2_end = list2.end();
        for ( ; obj2 != obj2_end; ++obj2 )
        {
            if ( *obj != *obj2 )
            {
                bool collision = false;

                std::vector<RotatedRectangle> objHitboxes = (*obj)->GetHitBoxes();
                std::vector<RotatedRectangle> obj2Hitboxes = (*obj2)->GetHitBoxes();
                for (unsigned int i = 0;i<objHitboxes.size();++i)
                {
                    for (unsigned int j = 0;j<obj2Hitboxes.size();++j)
                    {
                        if ( RotatedRectanglesCollisionTest(&objHitboxes[i], &obj2Hitboxes[j]) != 0 )
                            collision = true;
                    }

                    if ( collision ) break;
                }

                if ( collision )
                {
                    if ( !condition.IsInverted() )
                    {
                        isTrue = true;
                        objectsConcerned.objectsPicked.AddObject( *obj ); //L'objet est ajouté aux objets concernés ( Il n'y est pas déjà )
                        objectsConcerned.objectsPicked.AddObject( *obj2 ); //L'objet est ajouté aux objets concernés ( Il n'y est pas déjà )
                    }
                    AuMoinsUnObjet = true;
                }
            }
        }
        //Si l'objet n'est en collision avec AUCUN autre objets
        if ( AuMoinsUnObjet == false && condition.IsInverted())
        {
            isTrue = true;
            objectsConcerned.objectsPicked.AddObject( *obj ); //L'objet est ajouté aux objets concernés ( Il n'y est pas déjà )
        }
    }

    return isTrue;
}
