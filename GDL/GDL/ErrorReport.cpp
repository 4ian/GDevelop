/**
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/ErrorReport.h"
#include <sstream>
#include "GDL/Log.h"

ErrorReport::ErrorReport()
{
    //ctor
}

ErrorReport::~ErrorReport()
{
    //dtor
}

void ErrorReport::Add(string pMess, string pImage, string pObjet, int pEvent, int pNiveau)
{
    for (unsigned int i = 0;i<messages.size();i++)
    {
    	if ( messages.at(i) == pMess )
            return; //On n'ajoute pas le message si il existe déjà dans la liste
    }

    messages.push_back(pMess);
    image.push_back(pImage);
    objet.push_back(pObjet);
    event.push_back(pEvent);
    niveau.push_back(pNiveau);

    std::ostringstream ss;
    ss << pEvent;
    string eventStr = ss.str();

    EcrireLog("Erreur reportée", pMess);
    EcrireLog("     concernant", "Image : "+pImage+", Objet :"+pObjet+", Event n°"+eventStr);
}
