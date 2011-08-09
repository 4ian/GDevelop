#include "ObjectTools.h"
#include "GDL/Object.h"
#include "GDL/RotatedRectangle.h"
#include "GDL/RotatedRectangleCollision.h"
#include <cmath>

using namespace std;

double GD_API PickedObjectsCount( string , std::map <std::string, std::vector<Object*> *> objectsLists )
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

bool GD_API HitBoxesCollision( string, string, std::map <std::string, std::vector<Object*> *> objectsLists1, std::map <std::string, std::vector<Object*> *> objectsLists2, bool conditionInverted )
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
	for(unsigned int i = 0;i<objects1.size();++i)
    {
        bool AuMoinsUnObjet = false;
        for(unsigned int j = 0;j<objects2.size();++j)
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

float GD_API DistanceBetweenObjects( string, string, std::map <std::string, std::vector<Object*> *> objectsLists1, std::map <std::string, std::vector<Object*> *> objectsLists2, float length, string relationalOperator, bool conditionInverted)
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
	for(unsigned int i = 0;i<objects1.size();++i)
    {
        for(unsigned int j = 0;j<objects2.size();++j)
        {
            if ( objects1[i] != objects2[j] )
            {
                float X = objects1[i]->GetDrawableX()+objects1[i]->GetCenterX() - (objects2[j]->GetDrawableX()+objects2[j]->GetCenterX());
                float Y = objects1[i]->GetDrawableY()+objects1[i]->GetCenterY() - (objects2[j]->GetDrawableY()+objects2[j]->GetCenterY());

                if (( relationalOperator == "=" && sqrt(X*X+Y*Y) == length ) ||
                        ( relationalOperator == "<" && sqrt(X*X+Y*Y) < length ) ||
                        ( relationalOperator == ">" && sqrt(X*X+Y*Y) > length ) ||
                        ( relationalOperator == "<=" && sqrt(X*X+Y*Y) <= length ) ||
                        ( relationalOperator == ">=" && sqrt(X*X+Y*Y) >= length ) ||
                        ( relationalOperator == "!=" && sqrt(X*X+Y*Y) != length )
                   )
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

bool GD_API MovesToward( string, string, std::map <std::string, std::vector<Object*> *> objectsLists1, std::map <std::string, std::vector<Object*> *> objectsLists2, float tolerance, bool conditionInverted )
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
	for(unsigned int i = 0;i<objects1.size();++i)
    {
        if ( objects1[i]->TotalForceLength() != 0 )
        {
            for(unsigned int j = 0;j<objects2.size();++j)
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
