/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include "ObjectGroup.h"
#include <vector>
#include <string>
#include <algorithm>
#include "GDCore/TinyXml/tinyxml.h"

using namespace std;

namespace gd
{

bool ObjectGroup::Find(const string & name) const
{
    return std::find(memberObjects.begin(), memberObjects.end(), name) != memberObjects.end();
}

void ObjectGroup::AddObject(const string & name)
{
    if ( !Find(name) ) memberObjects.push_back(name);
}

void ObjectGroup::RemoveObject(const string & name)
{
    memberObjects.erase(std::remove(memberObjects.begin(), memberObjects.end(), name), memberObjects.end());
    return;
}

void ObjectGroup::LoadFromXml(vector < gd::ObjectGroup > & list, const TiXmlElement * elem)
{
    const TiXmlElement * elemScene = elem->FirstChildElement("Groupe");

    //Passage en revue des positions initiales
    while ( elemScene )
    {
        gd::ObjectGroup objectGroup;

        if ( elemScene->Attribute( "nom" ) != NULL ) { objectGroup.SetName(elemScene->Attribute( "nom" ));}

        const TiXmlElement * objet = elemScene->FirstChildElement( "Objet" );
        while ( objet )
        {
            string objetName;
            if ( objet->Attribute( "nom" ) != NULL ) { objetName = objet->Attribute( "nom");}

            objectGroup.AddObject(objetName);
            objet = objet->NextSiblingElement();
        }

        list.push_back( objectGroup );

        elemScene = elemScene->NextSiblingElement();
    }
}

void ObjectGroup::SaveToXml(const vector < gd::ObjectGroup > & list, TiXmlElement * grpsobjets)
{
    for ( unsigned int j = 0;j < list.size();j++ )
    {
        TiXmlElement * grp;

        grp = new TiXmlElement( "Groupe" );
        grpsobjets->LinkEndChild( grp );
        grp->SetAttribute( "nom", list.at( j ).GetName().c_str() );

        vector < string > allObjects = list.at(j).GetAllObjectsNames();
        for ( unsigned int k = 0;k < allObjects.size();k++ )
        {
            TiXmlElement * objet;

            objet = new TiXmlElement( "Objet" );
            grp->LinkEndChild( objet );
            objet->SetAttribute( "nom", allObjects.at(k).c_str() );
        }
    }
}


}
