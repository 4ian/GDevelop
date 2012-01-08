/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
/**
 * \brief File containing tools to manipulate objects easier.
 */

#ifndef OBJECTHELPERS_H
#define OBJECTHELPERS_H

#include <boost/shared_ptr.hpp>
#include <vector>
class Object;

/**
 * An object list is a vector containing (smart) pointers to objects.
 */
typedef std::vector < boost::shared_ptr<Object> > ObjList;

/**
 * Objects are usually managed thanks to (smart) pointers.
 */
typedef boost::shared_ptr<Object> ObjSPtr;

#endif // OBJECTHELPERS_H
