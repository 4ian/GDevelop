/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "SpriteTools.h"
#include <string>
#include <vector>
#include "GDL/SpriteObject.h"
#include "GDL/RuntimeScene.h"
#include "GDL/Collisions.h"

bool GD_API SpriteTurnedToward( std::string, std::string, std::map <std::string, std::vector<Object*> *> objectsLists1, std::map <std::string, std::vector<Object*> *> objectsLists2, float tolerance, bool conditionInverted )
{
    vector<Object*> objects1;
    for (std::map <std::string, std::vector<Object*> *>::const_iterator it = objectsLists1.begin();it!=objectsLists1.end();++it)
    {
        if ( it->second == NULL ) continue;

        std::vector<Object*> & list = *(it->second);
        for (unsigned int i = 0;i<list.size();++i) objects1.push_back(list[i]);
        list.clear();
    }
    vector<Object*> objects2;
    for (std::map <std::string, std::vector<Object*> *>::const_iterator it = objectsLists2.begin();it!=objectsLists2.end();++it)
    {
        if ( it->second == NULL ) continue;

        std::vector<Object*> & list = *(it->second);
        for (unsigned int i = 0;i<list.size();++i) objects2.push_back(list[i]);
        list.clear();
    }

    bool isTrue = false;

    //Test each object against each other objects
	std::vector<Object*>::iterator obj = objects1.begin();
	std::vector<Object*>::const_iterator obj_end = objects1.end();
    for ( ; obj != obj_end; ++obj )
    {
        std::vector<Object*>::iterator obj2 = objects2.begin();
        std::vector<Object*>::const_iterator obj2_end = objects2.end();
        for (; obj2 != obj2_end; ++obj2 )
        {
            if ( *obj != *obj2 )
            {
                Force force;
                force.SetX( ( (*obj2)->GetDrawableX() + (*obj2)->GetCenterX() ) - ( (*obj)->GetDrawableX() + (*obj)->GetCenterX() ) );
                force.SetY( ( (*obj2)->GetDrawableY() + (*obj2)->GetCenterY() ) - ( (*obj)->GetDrawableY() + (*obj)->GetCenterY() ) );

                int angle = static_cast<int>(force.GetAngle()); //On récupère l'angle entre les deux objets

                int angleObjet = static_cast<SpriteObject*>(*obj)->GetAngle();

                angle = fmodf(angle, 360);
                if ( angle < 0 )
                    angle += 360;

                angleObjet = fmodf(angleObjet, 360);
                if ( angleObjet < 0 )
                    angleObjet += 360;

                float gap = fabs( static_cast<float>(angle - angleObjet) );
                gap = gap > 180 ? 360 - gap : gap;

                if ( gap < tolerance / 2 )
                {
                    if ( !conditionInverted )
                    {
                        isTrue = true;
                        if ( find(objectsLists1[(*obj)->GetName()]->begin(), objectsLists1[(*obj)->GetName()]->end(), (*obj)) == objectsLists1[(*obj)->GetName()]->end() )
                            objectsLists1[(*obj)->GetName()]->push_back((*obj));

                        if ( find(objectsLists2[(*obj2)->GetName()]->begin(), objectsLists2[(*obj2)->GetName()]->end(), (*obj2)) == objectsLists2[(*obj2)->GetName()]->end() )
                            objectsLists2[(*obj2)->GetName()]->push_back((*obj2));
                    }
                }
                else
                {
                    if ( conditionInverted )
                    {
                        isTrue = true;
                        if ( find(objectsLists1[(*obj)->GetName()]->begin(), objectsLists1[(*obj)->GetName()]->end(), (*obj)) == objectsLists1[(*obj)->GetName()]->end() )
                            objectsLists1[(*obj)->GetName()]->push_back((*obj));

                        if ( find(objectsLists2[(*obj2)->GetName()]->begin(), objectsLists2[(*obj2)->GetName()]->end(), (*obj2)) == objectsLists2[(*obj2)->GetName()]->end() )
                            objectsLists2[(*obj2)->GetName()]->push_back((*obj2));
                    }
                }
            }
        }
    }

    return isTrue;
}

/**
 * Test a collision between two sprites objects
 */
bool GD_API SpriteCollision( std::string, std::string, std::map <std::string, std::vector<Object*> *> objectsLists1, std::map <std::string, std::vector<Object*> *> objectsLists2, bool conditionInverted )
{
    vector<Object*> objects1;
    for (std::map <std::string, std::vector<Object*> *>::const_iterator it = objectsLists1.begin();it!=objectsLists1.end();++it)
    {
        if ( it->second == NULL ) continue;

        std::vector<Object*> & list = *(it->second);
        for (unsigned int i = 0;i<list.size();++i) objects1.push_back(list[i]);
        list.clear();
    }

    vector<Object*> objects2;
    for (std::map <std::string, std::vector<Object*> *>::const_iterator it = objectsLists2.begin();it!=objectsLists2.end();++it)
    {
        if ( it->second == NULL ) continue;

        std::vector<Object*> & list = *(it->second);
        for (unsigned int i = 0;i<list.size();++i) objects2.push_back(list[i]);
        list.clear();
    }

    bool isTrue = false;

	std::vector<Object*>::const_iterator obj_end = objects1.end();
	std::vector<Object*>::const_iterator obj2_end = objects2.end();

    //On teste la collision entre chaque objets
    for ( std::vector<Object*>::const_iterator obj = objects1.begin(); obj != obj_end; ++obj )
    {
        for (std::vector<Object*>::const_iterator obj2 = objects2.begin(); obj2 != obj2_end; ++obj2 )
        {
            //On vérifie que ce n'est pas le même objet
            if ( *obj != *obj2 &&
                CheckCollision( static_cast<SpriteObject*>(*obj), static_cast<SpriteObject*>(*obj2) ) ^ conditionInverted )
            {
                if ( find(objectsLists1[(*obj)->GetName()]->begin(), objectsLists1[(*obj)->GetName()]->end(), (*obj)) == objectsLists1[(*obj)->GetName()]->end() )
                    objectsLists1[(*obj)->GetName()]->push_back((*obj));

                if ( find(objectsLists2[(*obj2)->GetName()]->begin(), objectsLists2[(*obj2)->GetName()]->end(), (*obj2)) == objectsLists2[(*obj2)->GetName()]->end() )
                    objectsLists2[(*obj2)->GetName()]->push_back((*obj2));
                isTrue = true;
            }
        }
    }

    return isTrue;
}
