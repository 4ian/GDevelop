#ifdef DEBUG
#include "nommgr.h"
#endif

#include <wx/log.h>
#include <wx/wx.h>
#include "wx/msgdlg.h"
#include <wx/protocol/http.h>
#include <wx/url.h>
#include <wx/wfstream.h>
#include <string>
#include <vector>
#include <iostream>
#include <fstream>
#include "SFML/Network.hpp"
#include "GDL/tinyxml.h"
#include "GDL/VersionWrapper.h"

#ifdef DEBUG

#endif

#include "CheckMAJ.h"
#include "MAJ.h"

using namespace std;


////////////////////////////////////////////////////////////
/// Téléchargement de news.txt
///
/// Télécharge news.txt depuis compilgames.net.
/// Il faut ensuite procéder à l'analyse de news.txt
////////////////////////////////////////////////////////////
void CheckMAJ::DownloadInformation()
{
    wxHTTP http;

    wxURL *url = new wxURL(_T("http://www.compilgames.net/news.txt"));
    wxInputStream * input;

    input = url->GetInputStream();

    if (input!=NULL) {
        wxFileOutputStream out("news.txt");

        if (out.Ok()) {
            input->Read(out);
        }
        else
        {
            wxLogWarning( _( "Impossible d'écrire le fichier de mise à jour.\nVérifiez que vous possédez les droits requis pour écrire dans le dossier de Game Develop ou désactivez la vérification des mises à jour dans les préférences.\n\nVous pouvez désactiver la vérification des mises à jour dans les préférences." ) );
        }

        delete input;
    } else {
        wxLogWarning( _( "Impossible de se connecter au serveur de vérification des mises à jour de Compil Games.\nVérifiez :\n-Votre connexion internet\n-Votre pare-feu\n-Si il vous est possible d'accéder à notre site.\n\nVous pouvez désactiver la vérification des mises à jour dans les préférences." ) );
        return;
    }

    TiXmlDocument doc( "news.txt" );
    if ( !doc.LoadFile() )
    {
        wxLogWarning( _( "Erreur lors du chargement du fichier de mise à jour.\nVérifiez :\n-Votre connexion internet\n-Votre pare-feu\n-Si il vous est possible d'accéder à notre site.\n\nVous pouvez désactiver la vérification des mises à jour dans les préférences.") );
        return;
    }

    TiXmlHandle hdl( &doc );
    TiXmlElement *elem = hdl.FirstChildElement().FirstChildElement().Element();

    //Comparaison de versions
    newMajor = 0;
    elem->QueryIntAttribute( "Major", &newMajor );
    newMinor = 0;
    elem->QueryIntAttribute( "Minor", &newMinor );
    newBuild = 0;
    elem->QueryIntAttribute( "Build", &newBuild );
    newRevision = 0;
    elem->QueryIntAttribute( "Revision", &newRevision );

    if ( newMajor > GDLVersionWrapper::Major() ||
         (newMajor == GDLVersionWrapper::Major() && newMinor > GDLVersionWrapper::Minor()) ||
         (newMajor == GDLVersionWrapper::Major() && newMinor == GDLVersionWrapper::Minor() && newBuild > GDLVersionWrapper::Build()) ||
         (newMajor == GDLVersionWrapper::Major() && newMinor == GDLVersionWrapper::Minor() && newBuild == GDLVersionWrapper::Build() && newRevision > GDLVersionWrapper::Revision() ) )
    {
        newVersionAvailable = true;
    }
    else
        newVersionAvailable = false;

    elem = hdl.FirstChildElement().FirstChildElement("Info").Element();

    if ( elem->Attribute( "Info") != NULL )
         info = elem->Attribute( "Info");

    if ( elem->Attribute( "Lien") != NULL )
         link = elem->Attribute( "Lien");

    return;
}
