/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include "SpriteTools.h"
#include <string>
#include <vector>
#include "GDL/SpriteObject.h"
#include "GDL/RuntimeScene.h"
#include "GDL/Collisions.h"
#include "GDL/profile.h"

using namespace std;

bool GD_API SpriteTurnedToward( const std::string & firstObjName, const std::string & secondObjName, std::map <std::string, std::vector<Object*> *> objectsLists1, std::map <std::string, std::vector<Object*> *> objectsLists2, float tolerance, bool conditionInverted )
{
    const bool sameObjectLists = firstObjName == secondObjName;
    bool isTrue = false;

    vector<Object*> objects1;
    for (std::map <std::string, std::vector<Object*> *>::const_iterator it = objectsLists1.begin();it!=objectsLists1.end();++it)
    {
        if ( it->second != NULL )
        {
            objects1.reserve(objects1.size()+it->second->size());
            std::copy(it->second->begin(), it->second->end(), std::back_inserter(objects1));
            it->second->clear();
        }
    }

    vector<Object*> objects2;
    if (sameObjectLists)
        objects2 = objects1;
    else
    {
        for (std::map <std::string, std::vector<Object*> *>::const_iterator it = objectsLists2.begin();it!=objectsLists2.end();++it)
        {
            if ( it->second != NULL )
            {
                objects2.reserve(objects2.size()+it->second->size());
                std::copy(it->second->begin(), it->second->end(), std::back_inserter(objects2));
                it->second->clear();
            }
        }
    }

    //Test each object against each other objects
    for ( unsigned int i = 0; i<objects1.size();++i)
    {
        for (unsigned int j = (!sameObjectLists ? 0 : i+1);j<objects2.size();++j)
        {
            //Get angle between objects
            float X = ( objects2[j]->GetDrawableX() + objects2[j]->GetCenterX() ) - ( objects1[i]->GetDrawableX() + objects1[i]->GetCenterX() );
            float Y = ( objects2[j]->GetDrawableY() + objects2[j]->GetCenterY() ) - ( objects1[i]->GetDrawableY() + objects1[i]->GetCenterY() );
            float angle = atan2(Y,X)*180/3.14159;

            float objectAngle = static_cast<SpriteObject*>(objects1[i])->GetAngle();

            angle = fmodf(angle, 360);
            if ( angle < 0 ) angle += 360;

            objectAngle = fmodf(objectAngle, 360);
            if ( objectAngle < 0 ) objectAngle += 360;

            float gap = fabs( angle - objectAngle );
            gap = gap > 180 ? 360 - gap : gap;

            if ( gap <= tolerance / 2 )
            {
                if ( !conditionInverted )
                {
                    isTrue = true;
                    if ( find(objectsLists1[objects1[i]->GetName()]->begin(), objectsLists1[objects1[i]->GetName()]->end(), objects1[i]) == objectsLists1[objects1[i]->GetName()]->end() )
                        objectsLists1[objects1[i]->GetName()]->push_back(objects1[i]);

                    if ( find(objectsLists2[objects2[j]->GetName()]->begin(), objectsLists2[objects2[j]->GetName()]->end(), objects2[j]) == objectsLists2[objects2[j]->GetName()]->end() )
                        objectsLists2[objects2[j]->GetName()]->push_back(objects2[j]);
                }
            }
            else
            {
                if ( conditionInverted )
                {
                    isTrue = true;
                    if ( find(objectsLists1[objects1[i]->GetName()]->begin(), objectsLists1[objects1[i]->GetName()]->end(), objects1[i]) == objectsLists1[objects1[i]->GetName()]->end() )
                        objectsLists1[objects1[i]->GetName()]->push_back(objects1[i]);

                    if ( find(objectsLists2[objects2[j]->GetName()]->begin(), objectsLists2[objects2[j]->GetName()]->end(), objects2[j]) == objectsLists2[objects2[j]->GetName()]->end() )
                        objectsLists2[objects2[j]->GetName()]->push_back(objects2[j]);
                }
            }
        }
    }

    return isTrue;
}

/**
 * Test a collision between two sprites objects
 */
bool GD_API SpriteCollision( const std::string & firstObjName, const std::string & secondObjName, std::map <std::string, std::vector<Object*> *> objectsLists1, std::map <std::string, std::vector<Object*> *> objectsLists2, bool conditionInverted )
{
    vector<Object*> objects1;
    for (std::map <std::string, std::vector<Object*> *>::const_iterator it = objectsLists1.begin();it!=objectsLists1.end();++it)
    {
        if ( it->second != NULL )
        {
            objects1.reserve(objects1.size()+it->second->size());
            std::copy(it->second->begin(), it->second->end(), std::back_inserter(objects1));
            it->second->clear();
        }
    }

    bool isTrue = false;
    bool sameLists = firstObjName == secondObjName;

    if ( !sameLists )
    {
        vector<Object*> objects2;
        for (std::map <std::string, std::vector<Object*> *>::const_iterator it = objectsLists2.begin();it!=objectsLists2.end();++it)
        {
            if ( it->second != NULL )
            {
                objects2.reserve(objects2.size()+it->second->size());
                std::copy(it->second->begin(), it->second->end(), std::back_inserter(objects2));
                it->second->clear();
            }
        }


        std::vector<Object*>::const_iterator obj_end = objects1.end();
        std::vector<Object*>::const_iterator obj2_end = objects2.end();

        //On teste la collision entre chaque objets
        for ( std::vector<Object*>::const_iterator obj = objects1.begin(); obj != obj_end; ++obj )
        {
            bool collideWithAtLeastOneObject = false;
            for (std::vector<Object*>::const_iterator obj2 = objects2.begin(); obj2 != obj2_end; ++obj2 )
            {
                //On vérifie que ce n'est pas le même objet
                if ( *obj != *obj2 &&
                    CheckCollision( static_cast<SpriteObject*>(*obj), static_cast<SpriteObject*>(*obj2) ) )
                {
                    if ( !conditionInverted )
                    {
                        if ( find(objectsLists1[(*obj)->GetName()]->begin(), objectsLists1[(*obj)->GetName()]->end(), (*obj)) == objectsLists1[(*obj)->GetName()]->end() )
                            objectsLists1[(*obj)->GetName()]->push_back((*obj));

                        if ( find(objectsLists2[(*obj2)->GetName()]->begin(), objectsLists2[(*obj2)->GetName()]->end(), (*obj2)) == objectsLists2[(*obj2)->GetName()]->end() )
                            objectsLists2[(*obj2)->GetName()]->push_back((*obj2));

                        isTrue = true;
                    }

                    collideWithAtLeastOneObject = true;
                }
            }

            if ( conditionInverted && !collideWithAtLeastOneObject)
            {
                isTrue = true;
                if ( find(objectsLists1[(*obj)->GetName()]->begin(), objectsLists1[(*obj)->GetName()]->end(), (*obj)) == objectsLists1[(*obj)->GetName()]->end() )
                    objectsLists1[(*obj)->GetName()]->push_back((*obj));
            }
        }
    }
    else
    {
        //On teste la collision entre chaque objets
        for ( unsigned int i = 0; i<objects1.size();++i)
        {
            bool collideWithAtLeastOneObject = false;
            for (unsigned int j = i+1;j<objects1.size();++j)
            {
                //On vérifie que ce n'est pas le même objet
                if ( CheckCollision( static_cast<SpriteObject*>(objects1[i]), static_cast<SpriteObject*>(objects1[j]) ) )
                {
                    if ( !conditionInverted )
                    {
                        if ( find(objectsLists1[(objects1[i])->GetName()]->begin(), objectsLists1[(objects1[i])->GetName()]->end(), (objects1[i])) == objectsLists1[(objects1[i])->GetName()]->end() )
                            objectsLists1[(objects1[i])->GetName()]->push_back((objects1[i]));

                        if ( find(objectsLists2[(objects1[j])->GetName()]->begin(), objectsLists2[(objects1[j])->GetName()]->end(), (objects1[j])) == objectsLists2[(objects1[j])->GetName()]->end() )
                            objectsLists2[(objects1[j])->GetName()]->push_back((objects1[j]));

                        isTrue = true;
                    }

                    collideWithAtLeastOneObject = true;
                }
            }

            if ( conditionInverted && !collideWithAtLeastOneObject)
            {
                isTrue = true;
                if ( find(objectsLists1[(objects1[i])->GetName()]->begin(), objectsLists1[(objects1[i])->GetName()]->end(), (objects1[i])) == objectsLists1[(objects1[i])->GetName()]->end() )
                    objectsLists1[(objects1[i])->GetName()]->push_back((objects1[i]));
            }
        }
    }

    return isTrue;
}

