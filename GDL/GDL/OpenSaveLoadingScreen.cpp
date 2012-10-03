/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/OpenSaveLoadingScreen.h"
#include "GDL/tinyxml/tinyxml.h"
#include <string>
#include <iostream>

using namespace std;

bool OpenSaveLoadingScreen::SaveToFile(const LoadingScreen & data, string file)
{
    TiXmlDocument doc;
    TiXmlDeclaration* decl = new TiXmlDeclaration( "1.0", "ISO-8859-1", "" );
    doc.LinkEndChild( decl );

    TiXmlElement * root = new TiXmlElement( "LoadingScreen" );
    doc.LinkEndChild( root );

    SaveToElement(data, root);

    //Sauvegarde le tout
    if ( !doc.SaveFile( file.c_str() ) )
    {
        cout << "Impossible d'enregistrer le fichier. Vérifiez que le disque comporte assez d'espace disque, ou qu'il n'est pas protégé en écriture";
        return false;
    }

    return true;
}

void OpenSaveLoadingScreen::SaveToElement(const LoadingScreen & data, TiXmlElement * root)
{
    TiXmlElement * infoChargement = new TiXmlElement("Afficher");
    root->LinkEndChild( infoChargement );
    infoChargement->SetAttribute( "value", "true" );
    if ( data.afficher == false ) infoChargement->SetAttribute( "value", "false" );

    infoChargement = new TiXmlElement("Border");
    root->LinkEndChild( infoChargement );
    infoChargement->SetAttribute( "value", "true" );
    if ( data.border == false ) infoChargement->SetAttribute( "value", "false" );

    infoChargement = new TiXmlElement("Smooth");
    root->LinkEndChild( infoChargement );
    infoChargement->SetAttribute( "value", "true" );
    if ( data.smooth == false ) infoChargement->SetAttribute( "value", "false" );

    infoChargement = new TiXmlElement("Width");
    root->LinkEndChild( infoChargement );
    infoChargement->SetDoubleAttribute( "value", data.width );
    infoChargement = new TiXmlElement("Height");
    root->LinkEndChild( infoChargement );
    infoChargement->SetDoubleAttribute( "value", data.height );

    infoChargement = new TiXmlElement("TexteAfficher");
    root->LinkEndChild( infoChargement );
    infoChargement->SetAttribute( "value", "true" );
    if ( data.texte == false ) infoChargement->SetAttribute( "value", "false" );
    infoChargement = new TiXmlElement("TexteXPos");
    root->LinkEndChild( infoChargement );
    infoChargement->SetDoubleAttribute( "value", data.texteXPos );
    infoChargement = new TiXmlElement("TexteYPos");
    root->LinkEndChild( infoChargement );
    infoChargement->SetDoubleAttribute( "value", data.texteYPos );
    infoChargement = new TiXmlElement("Texte");
    root->LinkEndChild( infoChargement );
    infoChargement->SetAttribute( "value", data.texteChargement.c_str() );

    infoChargement = new TiXmlElement("PourcentAfficher");
    root->LinkEndChild( infoChargement );
    infoChargement->SetAttribute( "value", "true" );
    if ( data.pourcent == false ) infoChargement->SetAttribute( "value", "false" );
    infoChargement = new TiXmlElement("PourcentXPos");
    root->LinkEndChild( infoChargement );
    infoChargement->SetDoubleAttribute( "value", data.pourcentXPos );
    infoChargement = new TiXmlElement("PourcentYPos");
    root->LinkEndChild( infoChargement );
    infoChargement->SetDoubleAttribute( "value", data.pourcentYPos );

    infoChargement = new TiXmlElement("ImageAfficher");
    root->LinkEndChild( infoChargement );
    infoChargement->SetAttribute( "value", "true" );
    if ( data.image == false ) infoChargement->SetAttribute( "value", "false" );
    infoChargement = new TiXmlElement("Image");
    root->LinkEndChild( infoChargement );
    infoChargement->SetAttribute( "value", data.imageFichier.c_str() );
}

////////////////////////////////////////////////////////////
/// Chargement depuis une chaine
////////////////////////////////////////////////////////////
bool OpenSaveLoadingScreen::OpenFromString(LoadingScreen & data, string text)
{
    TiXmlDocument doc;
    doc.Parse(text.c_str());

    TiXmlHandle hdl( &doc );
    TiXmlElement *elem = hdl.FirstChildElement().Element();
    return OpenFromElement(data, elem);
}

////////////////////////////////////////////////////////////
/// Chargement depuis un fichier
////////////////////////////////////////////////////////////
bool OpenSaveLoadingScreen::OpenFromFile(LoadingScreen & data, string file)
{
    TiXmlDocument doc;
    if ( !doc.LoadFile(file.c_str()) )
        return false;

    TiXmlHandle hdl( &doc );
    TiXmlElement *elem = hdl.FirstChildElement().Element();
    return OpenFromElement(data, elem);
}

////////////////////////////////////////////////////////////
/// Chargement depuis un TiXmlElement
////////////////////////////////////////////////////////////
bool OpenSaveLoadingScreen::OpenFromElement(LoadingScreen & data, const TiXmlElement * elem)
{
    if (  elem != NULL )
    {
        data.afficher = true;
        if ( elem->FirstChildElement("Afficher") != NULL )
        {
            string result = elem->FirstChildElement("Afficher")->Attribute("value");
            if ( result == "false")
                data.afficher = false;
        }

        data.border = true;
        if ( elem->FirstChildElement("Border") != NULL )
        {
            string result = elem->FirstChildElement("Border")->Attribute("value");
            if ( result == "false")
                data.border = false;
        }

        data.smooth = true;
        if ( elem->FirstChildElement("Smooth") != NULL )
        {
            string result = elem->FirstChildElement("Smooth")->Attribute("value");
            if ( result == "false")
                data.smooth = false;
        }

        if ( elem->FirstChildElement("Width") != NULL ) elem->FirstChildElement("Width")->QueryIntAttribute("value", &data.width);
        if ( elem->FirstChildElement("Height") != NULL ) elem->FirstChildElement("Height")->QueryIntAttribute("value", &data.height);

        data.texte = true;
        if ( elem->FirstChildElement("TexteAfficher") != NULL )
        {
            string result = elem->FirstChildElement("TexteAfficher")->Attribute("value");
            if ( result == "false")
                data.texte = false;
        }
        if ( elem->FirstChildElement("TexteXPos") != NULL ) elem->FirstChildElement("TexteXPos")->QueryIntAttribute("value", &data.texteXPos);
        if ( elem->FirstChildElement("TexteYPos") != NULL ) elem->FirstChildElement("TexteYPos")->QueryIntAttribute("value", &data.texteYPos);
        if ( elem->FirstChildElement("Texte") != NULL ) data.texteChargement = elem->FirstChildElement("Texte")->Attribute("value");

        data.pourcent = false;
        if ( elem->FirstChildElement("PourcentAfficher") != NULL )
        {
            string result = elem->FirstChildElement("PourcentAfficher")->Attribute("value");
            if ( result == "true")
                data.pourcent = true;
        }
        if ( elem->FirstChildElement("PourcentXPos") != NULL ) elem->FirstChildElement("PourcentXPos")->QueryIntAttribute("value", &data.pourcentXPos);
        if ( elem->FirstChildElement("PourcentYPos") != NULL ) elem->FirstChildElement("PourcentYPos")->QueryIntAttribute("value", &data.pourcentYPos);

        data.image = false;
        if ( elem->FirstChildElement("ImageAfficher") != NULL )
        {
            string result = elem->FirstChildElement("ImageAfficher")->Attribute("value");
            if ( result == "true")
                data.image = true;
        }
        if ( elem->FirstChildElement("Image") != NULL ) data.imageFichier = elem->FirstChildElement("Image")->Attribute("value");

    }

    return true;
}

