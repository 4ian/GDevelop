/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/VersionWrapper.h"
#include "GDCore/Tools/Locale/LocaleManager.h"
#include "AnalyticsSender.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Serialization/SerializerElement.h"
#include <SFML/Network.hpp>
#include "GDCore/String.h"
#include <iostream>
#if !defined(GD_NO_WX_GUI)
#include <wx/config.h>
#include <wx/filename.h>
#include <wx/filefn.h>
#include <wx/utils.h>
#endif

namespace gd {

AnalyticsSender *AnalyticsSender::_singleton = NULL;

void AnalyticsSender::SendProgramOpening()
{
    #if !defined(GD_NO_WX_GUI)
    SerializerElement data;
    SendData("program_opening", data);
    #endif
}

void AnalyticsSender::SendNewGameCreated(gd::String platformName, gd::String templateName)
{
    #if !defined(GD_NO_WX_GUI)
    wxFileName templateFile = wxFileName::FileName(templateName);
    templateFile.MakeRelativeTo();

    SerializerElement data;
    data.SetAttribute("platform", platformName);
    data.SetAttribute("templateName", gd::String(templateFile.GetFullPath(wxPATH_UNIX)));
    SendData("new_game_creation", data);
    #endif
}

void AnalyticsSender::SendData(gd::String collection, SerializerElement & data)
{
    #if !defined(GD_NO_WX_GUI)
    //Check if we are allowed to send these data.
    bool sendInfo;
    wxConfigBase::Get()->Read("/Startup/SendInfo", &sendInfo, true);
    if (!sendInfo) return;

    data.SetAttribute("gdVersion", VersionWrapper::FullString());
    data.SetAttribute("os", gd::String(wxGetOsDescription()));
    data.SetAttribute("lang",
        gd::String(wxLocale::GetLanguageCanonicalName(LocaleManager::Get()->GetLanguage())));
    if (wxConfig::Get())
        data.SetAttribute("openingCount", wxConfig::Get()->ReadDouble("Startup/OpeningCount", 0));

    // Create request
    std::cout << "Sending analytics data..."; std::cout.flush();
    sf::Http Http;
    Http.setHost("http://api.keen.io");
    sf::Http::Request request;
    request.setMethod(sf::Http::Request::Post);
    request.setField("Content-Type", "application/json");
    request.setUri("/3.0/projects/"+projectId.ToLocale()+"/events/"+collection.ToLocale()+"?api_key="+writeKey.ToLocale());
    request.setBody(Serializer::ToJSON(data).ToSfString());

    // Send the request
    sf::Http::Response response = Http.sendRequest(request, sf::seconds(2));
    std::cout << "done (" << response.getStatus() << ")" << std::endl;
    #endif
}

AnalyticsSender::AnalyticsSender() :
    projectId("54722730709a3932d94d0d5c"),
    writeKey("fad7129dd241c361e4d4a0390b0dcf6be6eb914ba73e395283115095c9648f912ba84fcc292cc91759cf1970ccac0bc7c29f8207b34b738dbb8a9bde4a8211df20a6f49d3b2a48b598fb02fd33e1d64c0102088ebf093079714ed1cfe8335760c63c6c18a3be9d16ce904f83cec25d4f")
{

}

AnalyticsSender * AnalyticsSender::Get()
{
    if ( NULL == _singleton )
        _singleton = new AnalyticsSender;

    return ( static_cast<AnalyticsSender*>( _singleton ) );
}

void AnalyticsSender::DestroySingleton()
{
    if ( NULL != _singleton )
    {
        delete _singleton;
        _singleton = NULL;
    }
}

}
