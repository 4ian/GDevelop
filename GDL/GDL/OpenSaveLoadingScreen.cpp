#include "GDL/OpenSaveLoadingScreen.h"
#include "GDL/tinyxml.h"
#include <string>
#include <iostream>

using namespace std;

OpenSaveLoadingScreen::OpenSaveLoadingScreen(LoadingScreen & datas_) :
datas(datas_)
{
    //ctor
}

OpenSaveLoadingScreen::~OpenSaveLoadingScreen()
{
    //dtor
}

bool OpenSaveLoadingScreen::SaveToFile(string file)
{
    TiXmlDocument doc;
    TiXmlDeclaration* decl = new TiXmlDeclaration( "1.0", "ISO-8859-1", "" );
    doc.LinkEndChild( decl );

    TiXmlElement * root = new TiXmlElement( "LoadingScreen" );
    doc.LinkEndChild( root );

    SaveToElement(root);

    //Sauvegarde le tout
    if ( !doc.SaveFile( file.c_str() ) )
    {
        cout << "Impossible d'enregistrer le fichier. Vérifiez que le disque comporte assez d'espace disque, ou qu'il n'est pas protégé en écriture";
        return false;
    }

    return true;
}

void OpenSaveLoadingScreen::SaveToElement(TiXmlElement * root)
{
    TiXmlElement * infoChargement = new TiXmlElement("Afficher");
    root->LinkEndChild( infoChargement );
    infoChargement->SetAttribute( "value", "true" );
    if ( datas.afficher == false ) infoChargement->SetAttribute( "value", "false" );

    infoChargement = new TiXmlElement("Border");
    root->LinkEndChild( infoChargement );
    infoChargement->SetAttribute( "value", "true" );
    if ( datas.border == false ) infoChargement->SetAttribute( "value", "false" );

    infoChargement = new TiXmlElement("Smooth");
    root->LinkEndChild( infoChargement );
    infoChargement->SetAttribute( "value", "true" );
    if ( datas.smooth == false ) infoChargement->SetAttribute( "value", "false" );

    infoChargement = new TiXmlElement("Width");
    root->LinkEndChild( infoChargement );
    infoChargement->SetDoubleAttribute( "value", datas.width );
    infoChargement = new TiXmlElement("Height");
    root->LinkEndChild( infoChargement );
    infoChargement->SetDoubleAttribute( "value", datas.height );

    infoChargement = new TiXmlElement("TexteAfficher");
    root->LinkEndChild( infoChargement );
    infoChargement->SetAttribute( "value", "true" );
    if ( datas.texte == false ) infoChargement->SetAttribute( "value", "false" );
    infoChargement = new TiXmlElement("TexteXPos");
    root->LinkEndChild( infoChargement );
    infoChargement->SetDoubleAttribute( "value", datas.texteXPos );
    infoChargement = new TiXmlElement("TexteYPos");
    root->LinkEndChild( infoChargement );
    infoChargement->SetDoubleAttribute( "value", datas.texteYPos );
    infoChargement = new TiXmlElement("Texte");
    root->LinkEndChild( infoChargement );
    infoChargement->SetAttribute( "value", datas.texteChargement.c_str() );

    infoChargement = new TiXmlElement("PourcentAfficher");
    root->LinkEndChild( infoChargement );
    infoChargement->SetAttribute( "value", "true" );
    if ( datas.pourcent == false ) infoChargement->SetAttribute( "value", "false" );
    infoChargement = new TiXmlElement("PourcentXPos");
    root->LinkEndChild( infoChargement );
    infoChargement->SetDoubleAttribute( "value", datas.pourcentXPos );
    infoChargement = new TiXmlElement("PourcentYPos");
    root->LinkEndChild( infoChargement );
    infoChargement->SetDoubleAttribute( "value", datas.pourcentYPos );

    infoChargement = new TiXmlElement("ImageAfficher");
    root->LinkEndChild( infoChargement );
    infoChargement->SetAttribute( "value", "true" );
    if ( datas.image == false ) infoChargement->SetAttribute( "value", "false" );
    infoChargement = new TiXmlElement("Image");
    root->LinkEndChild( infoChargement );
    infoChargement->SetAttribute( "value", datas.imageFichier.c_str() );
}

////////////////////////////////////////////////////////////
/// Chargement depuis une chaine
////////////////////////////////////////////////////////////
bool OpenSaveLoadingScreen::OpenFromString(string text)
{
    TiXmlDocument doc;
    doc.Parse(text.c_str());

    TiXmlHandle hdl( &doc );
    TiXmlElement *elem = hdl.FirstChildElement().Element();
    return OpenFromElement(elem);
}

////////////////////////////////////////////////////////////
/// Chargement depuis un fichier
////////////////////////////////////////////////////////////
bool OpenSaveLoadingScreen::OpenFromFile(string file)
{
    TiXmlDocument doc;
    if ( !doc.LoadFile(file.c_str()) )
        return false;

    TiXmlHandle hdl( &doc );
    TiXmlElement *elem = hdl.FirstChildElement().Element();
    return OpenFromElement(elem);
}

////////////////////////////////////////////////////////////
/// Chargement depuis un TiXmlElement
////////////////////////////////////////////////////////////
bool OpenSaveLoadingScreen::OpenFromElement(const TiXmlElement * elem)
{
    if (  elem != NULL )
    {
        datas.afficher = true;
        if ( elem->FirstChildElement("Afficher") != NULL )
        {
            string result = elem->FirstChildElement("Afficher")->Attribute("value");
            if ( result == "false")
                datas.afficher = false;
        }

        datas.border = true;
        if ( elem->FirstChildElement("Border") != NULL )
        {
            string result = elem->FirstChildElement("Border")->Attribute("value");
            if ( result == "false")
                datas.border = false;
        }

        datas.smooth = true;
        if ( elem->FirstChildElement("Smooth") != NULL )
        {
            string result = elem->FirstChildElement("Smooth")->Attribute("value");
            if ( result == "false")
                datas.smooth = false;
        }

        if ( elem->FirstChildElement("Width") != NULL ) elem->FirstChildElement("Width")->QueryIntAttribute("value", &datas.width);
        if ( elem->FirstChildElement("Height") != NULL ) elem->FirstChildElement("Height")->QueryIntAttribute("value", &datas.height);

        datas.texte = true;
        if ( elem->FirstChildElement("TexteAfficher") != NULL )
        {
            string result = elem->FirstChildElement("TexteAfficher")->Attribute("value");
            if ( result == "false")
                datas.texte = false;
        }
        if ( elem->FirstChildElement("TexteXPos") != NULL ) elem->FirstChildElement("TexteXPos")->QueryIntAttribute("value", &datas.texteXPos);
        if ( elem->FirstChildElement("TexteYPos") != NULL ) elem->FirstChildElement("TexteYPos")->QueryIntAttribute("value", &datas.texteYPos);
        if ( elem->FirstChildElement("Texte") != NULL ) datas.texteChargement = elem->FirstChildElement("Texte")->Attribute("value");

        datas.pourcent = false;
        if ( elem->FirstChildElement("PourcentAfficher") != NULL )
        {
            string result = elem->FirstChildElement("PourcentAfficher")->Attribute("value");
            if ( result == "true")
                datas.pourcent = true;
        }
        if ( elem->FirstChildElement("PourcentXPos") != NULL ) elem->FirstChildElement("PourcentXPos")->QueryIntAttribute("value", &datas.pourcentXPos);
        if ( elem->FirstChildElement("PourcentYPos") != NULL ) elem->FirstChildElement("PourcentYPos")->QueryIntAttribute("value", &datas.pourcentYPos);

        datas.image = false;
        if ( elem->FirstChildElement("ImageAfficher") != NULL )
        {
            string result = elem->FirstChildElement("ImageAfficher")->Attribute("value");
            if ( result == "true")
                datas.image = true;
        }
        if ( elem->FirstChildElement("Image") != NULL ) datas.imageFichier = elem->FirstChildElement("Image")->Attribute("value");

    }

    return true;
}
