#include "BuiltinExtensions/ObjectTools.h"
#include "GDL/Object.h"
#include "GDL/RotatedRectangle.h"
#include "GDL/RotatedRectangleCollision.h"
#include <cmath>

using namespace std;

double GD_API PickedObjectsCount( const std::string &, std::map <std::string, std::vector<Object*> *> objectsLists )
{
    vector<Object*> pickedObjects;
    std::map <std::string, std::vector<Object*> *>::const_iterator it = objectsLists.begin();
    for (;it!=objectsLists.end();++it)
    {
        if ( it->second == NULL ) continue;

        std::vector<Object*> & list = *(it->second);
        for (unsigned int i = 0;i<list.size();++i) pickedObjects.push_back(list[i]);
    }

    return pickedObjects.size();
}

bool GD_API HitBoxesCollision( const std::string & firstObjName, const std::string & secondObjName, std::map <std::string, std::vector<Object*> *> objectsLists1, std::map <std::string, std::vector<Object*> *> objectsLists2, bool conditionInverted )
{
    const bool sameObjectLists = firstObjName == secondObjName;

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
    if ( sameObjectLists )
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

                vector<RotatedRectangle> objHitboxes = objects1[i]->GetHitBoxes();
                vector<RotatedRectangle> obj2Hitboxes = objects2[j]->GetHitBoxes();
                for (unsigned int k = 0;k<objHitboxes.size();++k)
                {
                    for (unsigned int l = 0;l<obj2Hitboxes.size();++l)
                    {
                        if ( RotatedRectanglesCollisionTest(&objHitboxes[k], &obj2Hitboxes[l]) != 0 )
                            collision = true;
                    }

                    if ( collision ) break;
                }

                if ( collision )
                {
                    if ( !conditionInverted )
                    {
                        isTrue = true;
                        if ( find(objectsLists1[objects1[i]->GetName()]->begin(), objectsLists1[objects1[i]->GetName()]->end(), objects1[i]) == objectsLists1[objects1[i]->GetName()]->end() )
                            objectsLists1[objects1[i]->GetName()]->push_back(objects1[i]);

                        if ( find(objectsLists2[objects2[j]->GetName()]->begin(), objectsLists2[objects2[j]->GetName()]->end(), objects2[j]) == objectsLists2[objects2[j]->GetName()]->end() )
                            objectsLists2[objects2[j]->GetName()]->push_back(objects2[j]);
                    }
                    AuMoinsUnObjet = true;
                }
            }
        }
        //Si l'objet n'est en collision avec AUCUN autre objets
        if ( AuMoinsUnObjet == false && conditionInverted)
        {
            isTrue = true;
            if ( find(objectsLists1[objects1[i]->GetName()]->begin(), objectsLists1[objects1[i]->GetName()]->end(), objects1[i]) == objectsLists1[objects1[i]->GetName()]->end() )
                objectsLists1[objects1[i]->GetName()]->push_back(objects1[i]);
        }
    }

    return isTrue;
}

namespace GDpriv
{
    bool GDinternalEqualToTest(float lhs, float rhs)
    {
        return lhs == rhs;
    }
    bool GDinternalInferiorOrEqualToTest(float lhs, float rhs)
    {
        return lhs <= rhs;
    }
    bool GDinternalInferiorToTest(float lhs, float rhs)
    {
        return lhs < rhs;
    }
    bool GDinternalSuperiorToTest(float lhs, float rhs)
    {
        return lhs > rhs;
    }
    bool GDinternalSuperiorOrEqualToTest(float lhs, float rhs)
    {
        return lhs >= rhs;
    }
    bool GDinternalDifferentFromTest(float lhs, float rhs)
    {
        return lhs != rhs;
    }
    bool GDinternalFalse(float , float )
    {
        return false;
    }
}

float GD_API DistanceBetweenObjects( const std::string & firstObjName, const std::string & secondObjName, std::map <std::string, std::vector<Object*> *> objectsLists1, std::map <std::string, std::vector<Object*> *> objectsLists2, float length, string relationalOperator, bool conditionInverted)
{
    length *= length;
    const bool sameObjectLists = firstObjName == secondObjName;

    bool (*relationFunction)(float, float) = &GDpriv::GDinternalFalse;

    if ( relationalOperator == "=" ) relationFunction = &GDpriv::GDinternalEqualToTest;
    else if ( relationalOperator == "<" ) relationFunction = &GDpriv::GDinternalInferiorToTest;
    else if ( relationalOperator == ">" ) relationFunction = &GDpriv::GDinternalSuperiorToTest;
    else if ( relationalOperator == "<=" ) relationFunction = &GDpriv::GDinternalInferiorOrEqualToTest;
    else if ( relationalOperator == ">=" ) relationFunction = &GDpriv::GDinternalSuperiorOrEqualToTest;
    else if ( relationalOperator == "!=" ) relationFunction = &GDpriv::GDinternalDifferentFromTest;

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
    if ( sameObjectLists )
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

                if ( relationFunction((X*X+Y*Y), length) )
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

bool GD_API MovesToward( const std::string & firstObjName, const std::string & secondObjName, std::map <std::string, std::vector<Object*> *> objectsLists1, std::map <std::string, std::vector<Object*> *> objectsLists2, float tolerance, bool conditionInverted )
{
    const bool sameObjectLists = firstObjName == secondObjName;

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
    if ( sameObjectLists )
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
