#include "ObjectTools.h"
#include "GDL/RuntimeObject.h"
#include "GDL/Polygon.h"
#include "GDL/PolygonCollision.h"
#include <cmath>

using namespace std;

double GD_API PickedObjectsCount( std::map <std::string, std::vector<RuntimeObject*> *> objectsLists )
{
    unsigned int size = 0;
    std::map <std::string, std::vector<RuntimeObject*> *>::const_iterator it = objectsLists.begin();
    for (;it!=objectsLists.end();++it)
    {
        if ( it->second == NULL ) continue;

        size += (it->second)->size();
    }

    return size;
}

bool GD_API HitBoxesCollision( std::map <std::string, std::vector<RuntimeObject*> *> objectsLists1, std::map <std::string, std::vector<RuntimeObject*> *> objectsLists2, bool conditionInverted )
{
    bool sameObjectLists = objectsLists1.size() == objectsLists2.size();
    if ( sameObjectLists ) //Make sure that objects lists are really the same
    {
        for (std::map <std::string, std::vector<RuntimeObject*> *>::iterator it1 = objectsLists1.begin(), it2 = objectsLists2.begin();
             it1 != objectsLists1.end() && it2 != objectsLists2.end();
             ++it1, ++it2)
        {
            if ( it1->second != it2->second )
            {
                sameObjectLists = false;
                break;
            }
        }
    }

    vector<RuntimeObject*> objects1;
    for (std::map <std::string, std::vector<RuntimeObject*> *>::const_iterator it = objectsLists1.begin();it!=objectsLists1.end();++it)
    {
        if ( it->second != NULL )
        {
            objects1.reserve(objects1.size()+it->second->size());
            std::copy(it->second->begin(), it->second->end(), std::back_inserter(objects1));
            it->second->clear();
        }
    }

    vector<RuntimeObject*> objects2;
    if ( sameObjectLists )
        objects2 = objects1;
    else
    {
        for (std::map <std::string, std::vector<RuntimeObject*> *>::const_iterator it = objectsLists2.begin();it!=objectsLists2.end();++it)
        {
            if ( it->second != NULL )
            {
                objects2.reserve(objects2.size()+it->second->size());
                std::copy(it->second->begin(), it->second->end(), std::back_inserter(objects2));
                it->second->clear();
            }
        }
    }

    bool isTrue = false;

    //Test each object against each other objects
	for(unsigned int i = 0;i<objects1.size();++i)
    {
        bool AuMoinsUnObjet = false;
        for(unsigned int j = (!sameObjectLists ? 0 : i+1);j<objects2.size();++j)
        {
            if ( objects1[i] != objects2[j] )
            {
                bool collision = false;

                vector<Polygon2d> objHitboxes = objects1[i]->GetHitBoxes();
                vector<Polygon2d> obj2Hitboxes = objects2[j]->GetHitBoxes();
                for (unsigned int k = 0;k<objHitboxes.size();++k)
                {
                    for (unsigned int l = 0;l<obj2Hitboxes.size();++l)
                    {
                        if ( PolygonCollisionTest(objHitboxes[k], obj2Hitboxes[l]).collision )
                        {
                            collision = true;
                            break;
                        }
                    }

                    if ( collision ) break;
                }

                if ( collision )
                {
                    if ( !conditionInverted )
                    {
                        isTrue = true;
                        std::vector<RuntimeObject*> * objList = objectsLists1[objects1[i]->GetName()];
                        if ( find(objList->begin(), objList->end(), objects1[i]) == objList->end() ) objList->push_back(objects1[i]);

                        objList = objectsLists2[objects2[j]->GetName()];
                        if ( find(objList->begin(), objList->end(), objects2[j]) == objList->end() ) objList->push_back(objects2[j]);
                    }
                    AuMoinsUnObjet = true;
                }
            }
        }
        //Si l'objet n'est en collision avec AUCUN autre objets
        if ( AuMoinsUnObjet == false && conditionInverted)
        {
            isTrue = true;
            objectsLists1[objects1[i]->GetName()]->push_back(objects1[i]);
        }
    }

    return isTrue;
}

float GD_API DistanceBetweenObjects( std::map <std::string, std::vector<RuntimeObject*> *> objectsLists1, std::map <std::string, std::vector<RuntimeObject*> *> objectsLists2, float length, bool conditionInverted)
{
    length *= length;

    bool sameObjectLists = objectsLists1.size() == objectsLists2.size();
    if ( sameObjectLists ) //Make sure that objects lists are really the same
    {
        for (std::map <std::string, std::vector<RuntimeObject*> *>::iterator it1 = objectsLists1.begin(), it2 = objectsLists2.begin();
             it1 != objectsLists1.end() && it2 != objectsLists2.end();
             ++it1, ++it2)
        {
            if ( it1->second != it2->second )
            {
                sameObjectLists = false;
                break;
            }
        }
    }

    vector<RuntimeObject*> objects1;
    for (std::map <std::string, std::vector<RuntimeObject*> *>::const_iterator it = objectsLists1.begin();it!=objectsLists1.end();++it)
    {
        if ( it->second != NULL )
        {
            objects1.reserve(objects1.size()+it->second->size());
            std::copy(it->second->begin(), it->second->end(), std::back_inserter(objects1));
            it->second->clear();
        }
    }

    vector<RuntimeObject*> objects2;
    if ( sameObjectLists )
        objects2 = objects1;
    else
    {
        for (std::map <std::string, std::vector<RuntimeObject*> *>::const_iterator it = objectsLists2.begin();it!=objectsLists2.end();++it)
        {
            if ( it->second != NULL )
            {
                objects2.reserve(objects2.size()+it->second->size());
                std::copy(it->second->begin(), it->second->end(), std::back_inserter(objects2));
                it->second->clear();
            }
        }
    }

    bool isTrue = false;

    //Test each object against each other objects
	for(unsigned int i = 0;i<objects1.size();++i)
    {
        for(unsigned int j = (!sameObjectLists ? 0 : i+1);j<objects2.size();++j)
        {
            if ( objects1[i] != objects2[j] )
            {
                float X = objects1[i]->GetDrawableX()+objects1[i]->GetCenterX() - (objects2[j]->GetDrawableX()+objects2[j]->GetCenterX());
                float Y = objects1[i]->GetDrawableY()+objects1[i]->GetCenterY() - (objects2[j]->GetDrawableY()+objects2[j]->GetCenterY());

                if ( (X*X+Y*Y) <= length )
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
    }

    return isTrue;
}

bool GD_API MovesToward( std::map <std::string, std::vector<RuntimeObject*> *> objectsLists1, std::map <std::string, std::vector<RuntimeObject*> *> objectsLists2, float tolerance, bool conditionInverted )
{
    bool sameObjectLists = objectsLists1.size() == objectsLists2.size();
    if ( sameObjectLists ) //Make sure that objects lists are really the same
    {
        for (std::map <std::string, std::vector<RuntimeObject*> *>::iterator it1 = objectsLists1.begin(), it2 = objectsLists2.begin();
             it1 != objectsLists1.end() && it2 != objectsLists2.end();
             ++it1, ++it2)
        {
            if ( it1->second != it2->second )
            {
                sameObjectLists = false;
                break;
            }
        }
    }

    vector<RuntimeObject*> objects1;
    for (std::map <std::string, std::vector<RuntimeObject*> *>::const_iterator it = objectsLists1.begin();it!=objectsLists1.end();++it)
    {
        if ( it->second != NULL )
        {
            objects1.reserve(objects1.size()+it->second->size());
            std::copy(it->second->begin(), it->second->end(), std::back_inserter(objects1));
            it->second->clear();
        }
    }

    vector<RuntimeObject*> objects2;
    if ( sameObjectLists )
        objects2 = objects1;
    else
    {
        for (std::map <std::string, std::vector<RuntimeObject*> *>::const_iterator it = objectsLists2.begin();it!=objectsLists2.end();++it)
        {
            if ( it->second != NULL )
            {
                objects2.reserve(objects2.size()+it->second->size());
                std::copy(it->second->begin(), it->second->end(), std::back_inserter(objects2));
                it->second->clear();
            }
        }
    }

    bool isTrue = false;

    //Test each object against each other objects
	for(unsigned int i = 0;i<objects1.size();++i)
    {
        if ( objects1[i]->TotalForceLength() != 0 )
        {
            for(unsigned int j = (!sameObjectLists ? 0 : i+1);j<objects2.size();++j)
            {
                if ( objects1[i] != objects2[j] )
                {
                    Force force;
                    //Les comparaisons sont faites de centre à centre
                    force.SetX( ( objects2[j]->GetDrawableX() + objects2[j]->GetCenterX() ) - ( objects1[i]->GetDrawableX() + objects1[i]->GetCenterX() ) );
                    force.SetY( ( objects2[j]->GetDrawableY() + objects2[j]->GetCenterY() ) - ( objects1[i]->GetDrawableY() + objects1[i]->GetCenterY() ) );

                    float angle = force.GetAngle(); //On récupère l'angle entre les deux objets

                    float objectAngle = objects1[i]->TotalForceAngle();

                    //Compute difference between two angles
                    float diff = objectAngle - angle;
                    while ( diff>180 )
                        diff -= 360;
                    while ( diff<-180 )
                        diff += 360;

                    if ( fabs( diff ) <= tolerance / 2 )
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
        }
        else
        {
            if ( conditionInverted )
            {
                isTrue = true;

                if ( find(objectsLists1[objects1[i]->GetName()]->begin(), objectsLists1[objects1[i]->GetName()]->end(), objects1[i]) == objectsLists1[objects1[i]->GetName()]->end() )
                    objectsLists1[objects1[i]->GetName()]->push_back(objects1[i]);
            }
        }
    }

    return isTrue;
}

