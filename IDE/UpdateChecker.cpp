/*
 * GDevelop IDE
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
 */

#include "UpdateChecker.h"
#include "GDCore/Tools/Log.h"
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

UpdateChecker * UpdateChecker::_singleton = NULL;

void UpdateChecker::DownloadInformation(bool excludeFromStatistics)
{
    wxString requestURL = "http://www.compilgames.net/update/?p=GD";
    requestURL += "&l="+gd::LocaleManager::Get()->locale->GetLanguageCanonicalName(
        gd::LocaleManager::Get()->GetLanguage());
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
            gd::LogWarning( _( "Error while downloading the update file.\nPlease check your internet connection and your firewall.\n\nYou can disable Check for updates in the preferences of GDevelop." ) );

        delete input;
    } else {
        gd::LogWarning( _( "Unable to connect to the server so as to check for updates.\nPlease check your internet connection, your firewall and if you can go on GD website.\n\nYou can disable Check for updates in the preferences of GDevelop." ) );
        return;
    }

	gd::String updateInfoFileName = wxFileName::GetTempDir()+"/GDTemporaries/updateinfo.xml";
    TiXmlDocument doc( updateInfoFileName.ToLocale().c_str() );
    if ( !doc.LoadFile() )
    {
        gd::LogWarning( _( "Error while loading the update file.\nPlease check your internet connection and your firewall.\n\nYou can disable Check for updates in the preferences of GDevelop." ) );
        return;
    }

    TiXmlHandle hdl( &doc );

    //Comparing versions
    TiXmlElement *elem = hdl.FirstChildElement().FirstChildElement("Version").Element();
    if (elem)
    {
        newMajor = 0;
        if (elem->Attribute("Major")) elem->QueryIntAttribute( "Major", &newMajor );
        newMinor = 0;
        if (elem->Attribute("Minor")) elem->QueryIntAttribute( "Minor", &newMinor );
        newBuild = 0;
        if (elem->Attribute("Build")) elem->QueryIntAttribute( "Build", &newBuild );
        newRevision = 0;
        if (elem->Attribute("Revision")) elem->QueryIntAttribute( "Revision", &newRevision );

        if ( newMajor > gd::VersionWrapper::Major() ||
             (newMajor == gd::VersionWrapper::Major() && newMinor > gd::VersionWrapper::Minor()) ||
             (newMajor == gd::VersionWrapper::Major() && newMinor == gd::VersionWrapper::Minor() && newBuild > gd::VersionWrapper::Build()) ||
             (newMajor == gd::VersionWrapper::Major() && newMinor == gd::VersionWrapper::Minor() && newBuild == gd::VersionWrapper::Build() && newRevision > gd::VersionWrapper::Revision() ) )
        {
            newVersionAvailable = true;
        }
        else
            newVersionAvailable = false;
    }

    elem = hdl.FirstChildElement().FirstChildElement("Info").Element();
    if (elem)
    {
        if (elem->Attribute( "Info") != NULL) info = gd::String(elem->Attribute( "Info"));
        if (elem->Attribute( "Lien") != NULL) link = gd::String(elem->Attribute( "Lien"));
        info.ReplaceInvalid();
        link.ReplaceInvalid();
    }

    elem = hdl.FirstChildElement().FirstChildElement("CommunityNews").Element();
    if (elem)
    {
        if (elem->Attribute( "text") != NULL)
            news = elem->Attribute( "text");
        else
            std::cout << "No text for community news" << std::endl;

        if (elem->Attribute( "linkLabel1") != NULL) newsLinkLabel1 = elem->Attribute( "linkLabel1");
        if (elem->Attribute( "linkLabel2") != NULL) newsLinkLabel2 = elem->Attribute( "linkLabel2");
        if (elem->Attribute( "link1") != NULL) newsLink1 = elem->Attribute( "link1");
        if (elem->Attribute( "link2") != NULL) newsLink2 = elem->Attribute( "link2");

        std::cout << newsLinkLabel1 << std::endl;
        std::cout << newsLinkLabel2 << std::endl;
        std::cout << newsLink1 << std::endl;
        std::cout << newsLink2 << std::endl;

        news.ReplaceInvalid();
        newsLink1.ReplaceInvalid();
        newsLink2.ReplaceInvalid();
        newsLinkLabel1.ReplaceInvalid();
        newsLinkLabel2.ReplaceInvalid();
    }
    else
        std::cout << "No community news" << std::endl;

    return;
}


UpdateChecker *UpdateChecker::Get()
{
    if ( NULL == _singleton )
    {
        _singleton = new UpdateChecker;
    }

    return ( static_cast<UpdateChecker*>( _singleton ) );
}

void UpdateChecker::DestroySingleton()
{
    if ( NULL != _singleton )
    {
        delete _singleton;
        _singleton = NULL;
    }
}
