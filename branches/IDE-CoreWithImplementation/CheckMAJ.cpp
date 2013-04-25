/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include "CheckMAJ.h"
#include <wx/log.h>
#include <wx/wx.h>
#include "wx/msgdlg.h"
#include <wx/protocol/http.h>
#include <wx/url.h>
#include <wx/wfstream.h>
#include <wx/filename.h>
#include <string>
#include <vector>
#include <iostream>
#include <fstream>
#include "SFML/Network.hpp"
#include "GDL/tinyxml/tinyxml.h"
#include "GDCore/Tools/VersionWrapper.h"

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
    url->GetProtocol().SetDefaultTimeout(5);
    wxInputStream * input;

    input = url->GetInputStream();

    if (input!=NULL) {
        wxFileOutputStream out(wxFileName::GetTempDir()+"/GDTemporaries/"+"news.txt");

        if (out.Ok()) {
            input->Read(out);
        }
        else
        {
            wxLogWarning( _( "Error while loading the update file.\nCheck :\n-Your internet connection\n-Your firewall-If you can manually access  our site.\n\nYou can disable Check for updates in the preferences of Game Develop." ) );
        }

        delete input;
    } else {
        wxLogWarning( _( "Unable to connect to the server so as to check for updates.\nCheck :\n-Your internet connection\n-Your firewall-If you can manually access  our site.\n\nYou can disable Check for updates in the preferences of Game Develop." ) );
        return;
    }

    TiXmlDocument doc( wxFileName::GetTempDir()+"/GDTemporaries/"+"news.txt" );
    if ( !doc.LoadFile() )
    {
        wxLogWarning( _( "Error while loading the update file.\nCheck :\n-Your internet connection\n-Your firewall-If you can manually access  our site.\n\nYou can disable Check for updates in the preferences of Game Develop.") );
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

    if ( newMajor > gd::VersionWrapper::Major() ||
         (newMajor == gd::VersionWrapper::Major() && newMinor > gd::VersionWrapper::Minor()) ||
         (newMajor == gd::VersionWrapper::Major() && newMinor == gd::VersionWrapper::Minor() && newBuild > gd::VersionWrapper::Build()) ||
         (newMajor == gd::VersionWrapper::Major() && newMinor == gd::VersionWrapper::Minor() && newBuild == gd::VersionWrapper::Build() && newRevision > gd::VersionWrapper::Revision() ) )
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

