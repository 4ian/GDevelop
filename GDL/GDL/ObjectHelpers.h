/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
/**
 * \file File containing tools to manipulate objects easier.
 */

#ifndef OBJECTHELPERS_H
#define OBJECTHELPERS_H
#include "GDL/Object.h"
#include "GDL/RuntimeObject.h"
#include <boost/shared_ptr.hpp>
#include <vector>

/**
 * An object list is a vector containing (smart) pointers to objects.
 */
typedef std::vector < boost::shared_ptr<RuntimeObject> > RuntimeObjList;

/**
 * Objects are usually managed thanks to (smart) pointers.
 */
typedef boost::shared_ptr<RuntimeObject> RuntimeObjSPtr;

/**
 * \brief Functor testing object name
 *
 * \see Object
 */
struct ObjectHasName : public std::binary_function<boost::shared_ptr<gd::Object>, std::string, bool> {
    bool operator()(const boost::shared_ptr<gd::Object> & object, const std::string & name) const { return object->GetName() == name; }
};

/**
 * \brief Functor for sorting an RuntimeObjList by ZOrder
 *
 * \see Object
 */
struct SortByZOrder
{
   bool operator ()(RuntimeObjSPtr o1, RuntimeObjSPtr o2) const
   {
      return o1->GetZOrder() < o2->GetZOrder();
   }
};

#endif // OBJECTHELPERS_H

