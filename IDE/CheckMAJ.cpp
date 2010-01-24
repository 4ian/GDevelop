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
#include "tinyxml.h"
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
CheckMAJ::CheckMAJ()
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
            wxLogWarning( _( "Impossible d'écrire le fichier de mise à jour.\nVérifiez que vous possédez les droits requis pour écrire dans le dossier de Game Develop ou désactivez la vérification des mises à jour dans les préférences." ) );

        delete input;
    } else {
        wxLogWarning( _( "Impossible de se connecter au serveur de vérification des mises à jour de Compil Games.\nVérifiez :\n-Votre connexion internet\n-Votre pare-feu\n-Si il vous est possible d'accéder à notre site.\n\nVous pouvez désactiver la vérification des mises à jour dans les préférences." ) );
    }



}

CheckMAJ::~CheckMAJ()
{
    //dtor
}


////////////////////////////////////////////////////////////
/// Controle de la version
///
/// Utilise le fichier news.txt pour controler la version
////////////////////////////////////////////////////////////
void CheckMAJ::Check()
{
    TiXmlDocument doc( "news.txt" );
    if ( !doc.LoadFile() )
    {
        wxString ErrorDescription = doc.ErrorDesc();
        wxString Error = _( "Erreur lors du chargement du fichier de mise à jour ( " ) + ErrorDescription + _(" )\nVérifiez :\n-Votre connexion internet\n-Votre pare-feu\n-Si il vous est possible d'accéder à notre site.\n\nVous pouvez désactiver la vérification des mises à jour dans les préférences.");
        wxLogWarning( Error );
        return;
    }

    TiXmlHandle hdl( &doc );
    TiXmlElement *elem = hdl.FirstChildElement().FirstChildElement().Element();

    //Comparaison de versions
    int Major = 0;
    elem->QueryIntAttribute( "Major", &Major );
    if ( Major > GDLVersionWrapper::Major() )
    {
        if ( wxMessageBox( "Une nouvelle version de Game Develop est disponible !\nVoulez vous ouvrir la fenêtre de mise à jour ?\n\nVous pouvez désactiver la vérification automatique dans les préférences.", "Nouvelle version", wxYES_NO ) == wxYES )
        {
            MAJ dialog( NULL );
            dialog.ShowModal();
        }

    }
    else
    {
        int Minor = 0;
        elem->QueryIntAttribute( "Minor", &Minor );
        int Build = 0;
        elem->QueryIntAttribute( "Build", &Build );
        int Revision = 0;
        elem->QueryIntAttribute( "Revision", &Revision );

        if ( Build > GDLVersionWrapper::Build() || Minor > GDLVersionWrapper::Minor() || Revision > GDLVersionWrapper::Revision() )
        {
            if ( wxMessageBox( "Une nouvelle version de Game Develop est disponible !\nVoulez vous ouvrir la fenêtre de mise à jour ?\n\nVous pouvez désactiver la vérification automatique dans les préférences.", "Nouvelle version", wxYES_NO ) == wxYES )
            {
                MAJ dialog( NULL );
                dialog.ShowModal();
            }
        }
    }

    return;
}
