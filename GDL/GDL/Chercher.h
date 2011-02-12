/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef CHERCHER_H_INCLUDED
#define CHERCHER_H_INCLUDED

#include <boost/shared_ptr.hpp>
#include "GDL/Object.h"
#include <vector>
#include <string>

/**
 * \brief Old class picking objects
 * \deprecated Use ObjectsConcerned now.
 */
class GD_API Picker
{
    public :
    static int PickOneObject(const std::vector < boost::shared_ptr<Object> > *objets, const std::string name);
};

#endif // CHERCHER_H_INCLUDED
