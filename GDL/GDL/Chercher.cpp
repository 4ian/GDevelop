/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#include <SFML/System.hpp>
#include <iostream>
#include <SFML/Graphics.hpp>
#include <string>
#include <list>
#include <sstream>
#include <string>
#include <vector>
#include <cmath>
#include <iostream>
#include "GDL/Log.h"
#include "GDL/Object.h"
#include "GDL/Image.h"
#include "GDL/ObjectGroup.h"
#include <algorithm>
#include "GDL/Chercher.h"

using namespace std;

/**
 * Deprecated Search for one object
 */
int Picker::PickOneObject(const vector < boost::shared_ptr<Object> > *objets, const string nom)
{
    //Syntaxe avec l'opérateur [] peu agréable mais
    //nécessaire pour ne pas utiliser at
    const size_t size = objets->size();
    for ( unsigned int i =0;i<size;i++)
    {
        if (objets->at(i)->GetName() == nom)
        {
            return i;
        }
    }

    return -1;
}

