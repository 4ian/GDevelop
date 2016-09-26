/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef OBJECTSLISTSTOOLS_H
#define OBJECTSLISTSTOOLS_H

#include <string>
#include <vector>
#include <map>
#include "RuntimeScene.h"
#include "RuntimeObject.h"

typedef std::map <gd::String, std::vector<RuntimeObject*> *> RuntimeObjectsLists;

/**
 * \brief Keep only the specified object in the lists of picked objects.
 * \param objectsLists The lists of objects to trim
 * \param thisOne The object to keep in the lists
 * \ingroup GameEngine
 */
void GD_API PickOnly(RuntimeObjectsLists & pickedObjectsLists, RuntimeObject * thisOne);

/**
 * \brief Filter objects to keep only the one that fullfil the predicate
 *
 * Objects that do not fullfil the predicate are removed from objects lists.
 *
 * \param objectsLists The lists of objects to trim
 * \param negatePredicate If set to true, the result of the predicate is negated.
 * \param predicate The function applied to each object: must return true if the object fulfill the predicate.
 * \return true if at least one object fulfill the predicate.
 *
 * \ingroup GameEngine
 */
template <typename Pred>
bool PickObjectsIf(const RuntimeObjectsLists & pickedObjectsLists, bool negatePredicate, Pred predicate)
{
	bool isTrue = false;

    //Create a boolean for each object
    std::vector < std::vector<bool> > pickedList;
    for(RuntimeObjectsLists::const_iterator it = pickedObjectsLists.begin();
        it != pickedObjectsLists.end();++it)
    {
        std::vector<bool> arr;
        arr.assign(it->second->size(), false);
        pickedList.push_back(arr);
    }

    //Pick objects which are fulfulling the predicate.
    std::size_t i = 0;
    for(RuntimeObjectsLists::const_iterator it = pickedObjectsLists.begin();
        it != pickedObjectsLists.end();++it, ++i)
    {
        if ( !it->second ) continue;
        const std::vector<RuntimeObject*> & arr1 = *it->second;

        for(std::size_t k = 0;k<arr1.size();++k)
        {
            if (negatePredicate ^ predicate(arr1[k])) {
                pickedList[i][k] = true;
                isTrue = true;
            }
        }
    }

    //Trim not picked objects from lists.
    i = 0;
    for(RuntimeObjectsLists::const_iterator it = pickedObjectsLists.begin();
        it != pickedObjectsLists.end();++it, ++i)
    {
        size_t finalSize = 0;
        if ( !it->second ) continue;
        std::vector<RuntimeObject*> & arr = *it->second;

        for(std::size_t k = 0;k<arr.size();++k)
        {
            RuntimeObject * obj = arr[k];
            if ( pickedList[i][k] )
            {
                arr[finalSize] = obj;
                finalSize++;
            }
        }
        arr.resize(finalSize);
    }

    return isTrue;
}



/**
 * \brief Picks objects that fullfil the predicate with at least another object.
 *
 * This function picks from objectsLists1 and objectsLists2 only pairs of objects for which the test is true.
 * If inverted == true, only the objects of the first table are filtered.
 *
 * Note that the predicate is not called stricly for each pair: When considering a pair of objects, if these objects
 * have already been marked as picked, the predicate won't be called again.
 *
 * objectsLists1 and objectsLists2 may contains one or more identical pointers to some lists (See *This is important*
 * comment at the end of the algorithm, when trimming the list).
 *
 * Cost (Worst case, predicate being always false):
 *    Cost(Creating tables with a total of NbObjList1+NbObjList2 booleans)
 *  + Cost(predicate)*NbObjList1*NbObjList2
 *  + Cost(Testing NbObjList1+NbObjList2 booleans)
 *  + Cost(Removing NbObjList1+NbObjList2 objects from all the lists)
 *
 * Cost (Best case, predicate being always true):
 *    Cost(Creating tables with a total of NbObjList1+NbObjList2 booleans)
 *  + Cost(predicate)*(NbObjList1+NbObjList2)
 *  + Cost(Testing NbObjList1+NbObjList2 booleans)
 *
 * \ingroup GameEngine
 */
template <typename Pred>
bool TwoObjectListsTest(RuntimeObjectsLists objectsLists1,
                               RuntimeObjectsLists objectsLists2,
                               bool negatePredicate,
                               Pred predicate)
{
    bool isTrue = false;

    //Create a boolean for each object
    std::vector < std::vector<bool> > pickedList1;
    std::vector < std::vector<bool> > pickedList2;

    for(RuntimeObjectsLists::const_iterator it = objectsLists1.begin();
        it != objectsLists1.end();++it)
    {
        std::vector<bool> arr;
        arr.assign(it->second->size(), false);
        pickedList1.push_back(arr);
    }
    for(RuntimeObjectsLists::const_iterator it = objectsLists2.begin();
        it != objectsLists2.end();++it)
    {
        std::vector<bool> arr;
        arr.assign(it->second->size(), false);
        pickedList2.push_back(arr);
    }

    //Launch the function each object of the first list with each object
    //of the second list.
    std::size_t i = 0;
    for(RuntimeObjectsLists::const_iterator it = objectsLists1.begin();
        it != objectsLists1.end();++it, ++i)
    {
        if ( !it->second ) continue;
        const std::vector<RuntimeObject*> & arr1 = *it->second;

        for(std::size_t k = 0;k<arr1.size();++k) {
            bool atLeastOneObject = false;

            std::size_t j = 0;
            for(RuntimeObjectsLists::const_iterator it2 = objectsLists2.begin();
                it2 != objectsLists2.end();++it2, ++j)
            {
                if ( !it2->second ) continue;
                const std::vector<RuntimeObject*> & arr2 = *it2->second;

                for(std::size_t l = 0;l<arr2.size();++l) {
                    if ( pickedList1[i][k] && pickedList2[j][l]) continue; //Avoid unnecessary costly call to functor.

                    if ( std::addressof(arr1[k]) != std::addressof(arr2[l]) && predicate(arr1[k], arr2[l]) ) {
                        if ( !negatePredicate ) {
                            isTrue = true;

                            //Pick the objects
                            pickedList1[i][k] = true;
                            pickedList2[j][l] = true;
                        }

                        atLeastOneObject = true;
                    }
                }
            }

            if ( !atLeastOneObject && negatePredicate ) { //The object is not overlapping any other object.
                isTrue = true;
                pickedList1[i][k] = true;
            }
        }
    }

    //Trim not picked objects from lists.
    i = 0;
    for(RuntimeObjectsLists::const_iterator it = objectsLists1.begin();
        it != objectsLists1.end();++it, ++i)
    {
        size_t finalSize = 0;
        if ( !it->second ) continue;
        std::vector<RuntimeObject*> & arr = *it->second;

        for(std::size_t k = 0;k<arr.size();++k)
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

    if ( !negatePredicate ) {
        std::size_t i = 0;
        for(RuntimeObjectsLists::const_iterator it = objectsLists2.begin();
            it != objectsLists2.end();++it, ++i)
        {
            size_t finalSize = 0;
            if ( !it->second ) continue;
            std::vector<RuntimeObject*> & arr = *it->second;

            //*This is important*! We can have a list that has already been trimmed just before
            if ( arr.size() != pickedList2[i].size() ) //If the size of the objects list != size of the boolean "picked" list...
                continue; //... then the object list was already trimmed, skip it.

            for(std::size_t k = 0;k<arr.size();++k)
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
#endif
