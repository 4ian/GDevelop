/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef CHERCHER_H_INCLUDED
#define CHERCHER_H_INCLUDED

#include "GDL/tinyxml.h"
#include <SFML/System.hpp>
#include <SFML/Graphics.hpp>
#include <iostream>
#include <string>
#include <sstream>
#include <string>
#include <vector>
#include <iostream>
#include <boost/shared_ptr.hpp>

#include "GDL/Image.h"
#include "GDL/ObjectGroup.h"

using namespace std;

/**
 * Old class picking objects
 * \deprecated Use ObjectsConcerned now.
 */
class GD_API Picker
{
    public :
    static int PickOneObject(const vector < boost::shared_ptr<Object> > *objets, const string nom);
};

#endif // CHERCHER_H_INCLUDED
