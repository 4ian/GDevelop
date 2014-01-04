/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

#include "CheckMAJ.h"
#include <wx/log.h>
#include <wx/wx.h>
#include <wx/config.h>
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
#include "GDCore/TinyXml/tinyxml.h"
#include "GDCore/Tools/VersionWrapper.h"
#include "GDCore/Tools/Locale/LocaleManager.h"

using namespace std;


////////////////////////////////////////////////////////////
/// Téléchargement de news.txt
///
/// Télécharge news.txt depuis compilgames.net.
/// Il faut ensuite procéder à l'analyse de news.txt
////////////////////////////////////////////////////////////
void CheckMAJ::DownloadInformation(bool excludeFromStatistics)
{
    wxString requestURL = "http://www.compilgames.net/update/?p=GD";
    requestURL += "&l="+gd::LocaleManager::GetInstance()->locale->GetLanguageCanonicalName(
        gd::LocaleManager::GetInstance()->GetLanguage());
    if ( excludeFromStatistics ) requestURL += "&e=true";

    bool sendInfo;
    wxConfigBase::Get()->Read("/Startup/SendInfo", &sendInfo, true);
    if ( sendInfo )
    {
        requestURL += "&v="+gd::VersionWrapper::FullString();
    }

    std::cout << "Asking for update info: " << requestURL << std::endl;

    wxURL *url = new wxURL(requestURL);
    url->GetProtocol().SetDefaultTimeout(5);
    
    wxInputStream * input = url->GetInputStream();

    if (input!=NULL) {
        wxFileOutputStream out(wxFileName::GetTempDir()+"/GDTemporaries/"+"updateinfo.xml");

        if (out.Ok()) {
            input->Read(out);
        }
        else
            wxLogWarning( _( "Error while downloading the update file.\nPlease check your internet connection and your firewall.\n\nYou can disable Check for updates in the preferences of Game Develop." ) );

        delete input;
    } else {
        wxLogWarning( _( "Unable to connect to the server so as to check for updates.\nPlease check your internet connection, your firewall and if you can go on GD website.\n\nYou can disable Check for updates in the preferences of Game Develop." ) );
        return;
    }

    TiXmlDocument doc( wxFileName::GetTempDir()+"/GDTemporaries/"+"updateinfo.xml" );
    if ( !doc.LoadFile() )
    {
        wxLogWarning( _( "Error while loading the update file.\nPlease check your internet connection and your firewall.\n\nYou can disable Check for updates in the preferences of Game Develop." ) );
        return;
    }

    TiXmlHandle hdl( &doc );
    TiXmlElement *elem = hdl.FirstChildElement().FirstChildElement().Element();

    //Comparaison de versions
    newMajor = 0;
    if ( elem && elem->Attribute("Major")) elem->QueryIntAttribute( "Major", &newMajor );
    newMinor = 0;
    if ( elem && elem->Attribute("Minor")) elem->QueryIntAttribute( "Minor", &newMinor );
    newBuild = 0;
    if ( elem && elem->Attribute("Build")) elem->QueryIntAttribute( "Build", &newBuild );
    newRevision = 0;
    if ( elem && elem->Attribute("Revision")) elem->QueryIntAttribute( "Revision", &newRevision );

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

    if ( elem && elem->Attribute( "Info") != NULL )
         info = elem->Attribute( "Info");

    if ( elem && elem->Attribute( "Lien") != NULL )
         link = elem->Attribute( "Lien");

    return;
}

