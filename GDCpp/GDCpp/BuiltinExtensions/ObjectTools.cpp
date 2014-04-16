#if !defined(EMSCRIPTEN)
#include "ObjectTools.h"
#include "GDCpp/RuntimeObject.h"
#include "GDCpp/Polygon.h"
#include "GDCpp/PolygonCollision.h"
#include "MathematicalTools.h"
#include <cmath>
#include <iostream>

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

/**
 * Internal function picking from objectsLists1 and objectsLists2 only pairs of objects for which the test is true.
 * If inverted == true, only the objects of the first table are filtered.
 *
 * Note that the functor is not called stricly for each pair: When considering a pair of objects, if these objects
 * have already been marked as picked, the functor won't be called again.
 *
 * objectsLists1 and objectsLists2 may contains one or more identical pointers to some lists (See *This is important*
 * comment at the end of the algorithm, when trimming the list).
 *
 * Cost (Worst case, functor being always false):
 *    Cost(Creating tables with a total of NbObjList1+NbObjList2 booleans)
 *  + Cost(functor)*NbObjList1*NbObjList2
 *  + Cost(Testing NbObjList1+NbObjList2 booleans)
 *  + Cost(Removing NbObjList1+NbObjList2 objects from all the lists)
 *
 * Cost (Best case, functor being always true):
 *    Cost(Creating tables with a total of NbObjList1+NbObjList2 booleans)
 *  + Cost(functor)*(NbObjList1+NbObjList2)
 *  + Cost(Testing NbObjList1+NbObjList2 booleans)
 */
bool GD_API TwoObjectListsTest(std::map <std::string, std::vector<RuntimeObject*> *> objectsLists1,
                               std::map <std::string, std::vector<RuntimeObject*> *> objectsLists2,
                               bool conditionInverted,
                               TwoObjectsListsTestFunc functor, float extraParameter )
{
    bool isTrue = false;

    //Create a boolean for each object
    std::vector < std::vector<bool> > pickedList1;
    std::vector < std::vector<bool> > pickedList2;

    for(std::map <std::string, std::vector<RuntimeObject*> *>::const_iterator it = objectsLists1.begin();
        it != objectsLists1.end();++it)
    {
        std::vector<bool> arr;
        arr.assign(it->second->size(), false);
        pickedList1.push_back(arr);
    }
    for(std::map <std::string, std::vector<RuntimeObject*> *>::const_iterator it = objectsLists2.begin();
        it != objectsLists2.end();++it)
    {
        std::vector<bool> arr;
        arr.assign(it->second->size(), false);
        pickedList2.push_back(arr);
    }

    //Launch the function each object of the first list with each object
    //of the second list.
    unsigned int i = 0;
    for(std::map <std::string, std::vector<RuntimeObject*> *>::const_iterator it = objectsLists1.begin();
        it != objectsLists1.end();++it, ++i)
    {
        if ( !it->second ) continue;
        const std::vector<RuntimeObject*> & arr1 = *it->second;

        for(unsigned int k = 0;k<arr1.size();++k) {
            bool atLeastOneObject = false;

            unsigned int j = 0;
            for(std::map <std::string, std::vector<RuntimeObject*> *>::const_iterator it2 = objectsLists2.begin();
                it2 != objectsLists2.end();++it2, ++j)
            {
                if ( !it2->second ) continue;
                const std::vector<RuntimeObject*> & arr2 = *it2->second;

                for(unsigned int l = 0;l<arr2.size();++l) {
                    if ( pickedList1[i][k] && pickedList2[j][l]) continue; //Avoid unnecessary costly call to functor.

                    if ( arr1[k] != arr2[l] && functor(arr1[k], arr2[l], extraParameter) ) {
                        if ( !conditionInverted ) {
                            isTrue = true;

                            //Pick the objects
                            pickedList1[i][k] = true;
                            pickedList2[j][l] = true;
                        }

                        atLeastOneObject = true;
                    }
                }
            }

            if ( !atLeastOneObject && conditionInverted ) { //The object is not overlapping any other object.
                isTrue = true;
                pickedList1[i][k] = true;
            }
        }
    }

    //Trim not picked objects from arrays.
    i = 0;
    for(std::map <std::string, std::vector<RuntimeObject*> *>::const_iterator it = objectsLists1.begin();
        it != objectsLists1.end();++it, ++i)
    {
        size_t finalSize = 0;
        if ( !it->second ) continue;
        std::vector<RuntimeObject*> & arr = *it->second;

        for(unsigned int k = 0;k<arr.size();++k)
        {
            RuntimeObject * obj = arr[k];
            if ( pickedList1[i][k] )
            {
                arr[finalSize] = obj;
                finalSize++;
            }
        }
        arr.resize(finalSize);
    }

    if ( !conditionInverted ) {
        unsigned int i = 0;
        for(std::map <std::string, std::vector<RuntimeObject*> *>::const_iterator it = objectsLists2.begin();
            it != objectsLists2.end();++it, ++i)
        {
            size_t finalSize = 0;
            if ( !it->second ) continue;
            std::vector<RuntimeObject*> & arr = *it->second;

            //*This is important*! We can have a list that has already been trimmed just before
            if ( arr.size() != pickedList2[i].size() ) //If the size of the objects list != size of the boolean "picked" list...
                continue; //... then the object list was already trimmed, skip it.

            for(unsigned int k = 0;k<arr.size();++k)
            {
                RuntimeObject * obj = arr[k];
                if ( pickedList2[i][k] )
                {
                    arr[finalSize] = obj;
                    finalSize++;
                }
            }
            arr.resize(finalSize);
        }
    }

    return isTrue;
}

static bool HitBoxesInnerTest(RuntimeObject * obj1, RuntimeObject * obj2, float )
{
    return obj1->IsCollidingWith(obj2);
}

bool GD_API HitBoxesCollision( std::map <std::string, std::vector<RuntimeObject*> *> objectsLists1, std::map <std::string, std::vector<RuntimeObject*> *> objectsLists2, bool conditionInverted )
{
    return TwoObjectListsTest(objectsLists1, objectsLists2, conditionInverted, &HitBoxesInnerTest, 0);
}

static bool TurnedTowardInnerTest(RuntimeObject * obj1, RuntimeObject * obj2, float tolerance )
{
    double objAngle = atan2(obj2->GetDrawableY()+obj2->GetCenterY() - (obj1->GetDrawableY()+obj1->GetCenterY()),
                              obj2->GetDrawableX()+obj2->GetCenterX() - (obj1->GetDrawableX()+obj1->GetCenterX()));
    objAngle *= 180.0/3.14159;

    return abs(GDpriv::MathematicalTools::angleDifference(obj1->GetAngle(), objAngle)) <= tolerance/2;
}

bool GD_API ObjectsTurnedToward( std::map <std::string, std::vector<RuntimeObject*> *> objectsLists1, std::map <std::string, std::vector<RuntimeObject*> *> objectsLists2, float tolerance, bool conditionInverted )
{
    return TwoObjectListsTest(objectsLists1, objectsLists2, conditionInverted, TurnedTowardInnerTest, tolerance);
}

static bool DistanceInnerTest(RuntimeObject * obj1, RuntimeObject * obj2, float squaredLength)
{
    float X = obj1->GetDrawableX()+obj1->GetCenterX() - (obj2->GetDrawableX()+obj2->GetCenterX());
    float Y = obj1->GetDrawableY()+obj1->GetCenterY() - (obj2->GetDrawableY()+obj2->GetCenterY());

    return (X*X+Y*Y) <= squaredLength;
}

float GD_API DistanceBetweenObjects( std::map <std::string, std::vector<RuntimeObject*> *> objectsLists1, std::map <std::string, std::vector<RuntimeObject*> *> objectsLists2, float length, bool conditionInverted)
{
    length *= length;
    return TwoObjectListsTest(objectsLists1, objectsLists2, conditionInverted, DistanceInnerTest, length);
}

static bool MovesTowardInnerTest(RuntimeObject * obj1, RuntimeObject * obj2, float tolerance)
{
    if ( obj1->TotalForceLength() == 0 ) return false;

    double objAngle = atan2(obj2->GetDrawableY()+obj2->GetCenterY() - (obj1->GetDrawableY()+obj1->GetCenterY()),
                              obj2->GetDrawableX()+obj2->GetCenterX() - (obj1->GetDrawableX()+obj1->GetCenterX()));
    objAngle *= 180.0/3.14159;

    return abs(GDpriv::MathematicalTools::angleDifference(obj1->TotalForceAngle(), objAngle)) <= tolerance/2;
}


bool GD_API MovesToward( std::map <std::string, std::vector<RuntimeObject*> *> objectsLists1, std::map <std::string, std::vector<RuntimeObject*> *> objectsLists2, float tolerance, bool conditionInverted )
{
    return TwoObjectListsTest(objectsLists1, objectsLists2, conditionInverted, MovesTowardInnerTest, tolerance);
}
#endif