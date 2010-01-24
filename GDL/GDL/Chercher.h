/**
 *  Game Develop
 *      Player
 *
 *  Par Florian "4ian" Rival
 *
 */
/**
 *  Chercher.h
 *
 *  Header de chercher.cpp
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

int ChercherImage(const vector < string > *nomImages, const string nom);
int ChercherImage(const vector < Image > & images, const string nom);

class GD_API Picker
{
    public :
    static int PickOneObject(const vector < boost::shared_ptr<Object> > *objets, const string nom, const vector < int > *ObjConcern);
    static int PickOneObject(const vector < boost::shared_ptr<Object> > *objets, const string nom);

    static vector < int > PickAndRemove(const vector < boost::shared_ptr<Object> > *objets, const vector < ObjectGroup > *groups, const string nom);
    static vector < int > PickAndRemove(const vector < boost::shared_ptr<Object> > *objets, const vector < ObjectGroup > *groups, const string nom, vector < int > *ObjConcern);
    static vector < int > Pick(const vector < boost::shared_ptr<Object> > *objets, const vector < ObjectGroup > *groups, const string nom);
    static vector < int > Pick(const vector < boost::shared_ptr<Object> > *objets, const vector < ObjectGroup > *groups, const string nom, const vector < int > *ObjConcern);

    private:
    static vector < int > PickObjects(const vector < boost::shared_ptr<Object> > *objets, const string nom);
    static vector < int > PickObjects(const vector < boost::shared_ptr<Object> > *objets, const string nom, const vector < int > *ObjConcern);

    static vector < int > PickGroups(const vector < boost::shared_ptr<Object> > *objets, const vector < ObjectGroup > *groups, const string nom);
    static vector < int > PickGroups(const vector < boost::shared_ptr<Object> > *objets, const vector < ObjectGroup > *groups, const string nom, const vector < int > *ObjConcern);
};

#endif // CHERCHER_H_INCLUDED
