/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if !defined(EMSCRIPTEN)
#include "ProjectFileWriter.h"
#include <fstream>
#include "GDCore/Tools/Localization.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Serialization/Splitter.h"
#include "GDCore/Project/Project.h"
#include "GDCore/IDE/wxTools/RecursiveMkDir.h"
#include "GDCore/Tools/Log.h"
#include "GDCore/String.h"

#include "GDCore/TinyXml/tinyxml.h"
#include <SFML/System.hpp>
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include <wx/wx.h>
#include <wx/stdpaths.h>
#include <wx/filename.h>
#endif

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
namespace {

gd::String MakeFileNameSafe(gd::String str)
{
    static const gd::String allowedCharacters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-";

    std::size_t i = 0;
    for( auto it = str.begin(); it != str.end(); ++it )
    {
        char32_t character = *it;
        if (allowedCharacters.find(character) == gd::String::npos)
        {
            //Replace the character by an underscore and its unicode codepoint (in base 10)
            auto it2 = it; ++it2;
            str.replace(it, it2, "_"+gd::String::From(character));

            //The iterator it may have been invalidated:
            //re-assign it with a new iterator pointing to the same position.
            it = str.begin();
            std::advance(it, i);
        }

        ++i;
    }

    return str;
}

}
#endif


namespace gd
{

#if defined(GD_IDE_ONLY)

bool ProjectFileWriter::SaveToFile(const gd::Project & project, const gd::String & filename, bool forceSingleFile)
{
    //Serialize the whole project
    gd::SerializerElement rootElement;
    project.SerializeTo(rootElement);

    #if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
    if (project.IsFolderProject() && !forceSingleFile) //Optionally split the project
    {
        wxString projectPath = wxFileName::FileName(filename).GetPath();
        gd::Splitter splitter;
        auto splitElements = splitter.Split(rootElement, {
            "/layouts/layout",
            "/externalEvents/externalEvents",
            "/externalLayouts/externalLayout",
        });
        for (auto & element : splitElements)
        {
            //Create a partial XML document
            TiXmlDocument doc;
            doc.LinkEndChild(new TiXmlDeclaration("1.0", "UTF-8", ""));

            TiXmlElement * root = new TiXmlElement("projectPartial");
            doc.LinkEndChild(root);
            gd::Serializer::ToXML(element.element, root);

            //And write the element in it
            gd::String filename = projectPath + element.path + "-" + MakeFileNameSafe(element.name);
            gd::RecursiveMkDir::MkDir(wxFileName::FileName(filename).GetPath());
            if (!doc.SaveFile(filename.ToLocale().c_str()))
            {
                gd::LogError( _( "Unable to save file ") + filename + _("!\nCheck that the drive has enough free space, is not write-protected and that you have read/write permissions." ) );
                return false;
            }
        }
    }
    #endif

    //Create the main XML document
    TiXmlDocument doc;
    doc.LinkEndChild(new TiXmlDeclaration( "1.0", "UTF-8", "" ));

    TiXmlElement * root = new TiXmlElement( "project" );
    doc.LinkEndChild(root);
    gd::Serializer::ToXML(rootElement, root);

    //Write XML to file
    if ( !doc.SaveFile( filename.ToLocale().c_str() ) )
    {
        gd::LogError( _( "Unable to save file ") + filename + _("!\nCheck that the drive has enough free space, is not write-protected and that you have read/write permissions." ) );
        return false;
    }

    return true;
}

bool ProjectFileWriter::SaveToJSONFile(const gd::Project & project, const gd::String & filename)
{
    //Serialize the whole project
    gd::SerializerElement rootElement;
    project.SerializeTo(rootElement);

    //Write JSON to file
    gd::String str = gd::Serializer::ToJSON(rootElement);
    std::ofstream ofs(filename.ToLocale().c_str());
    if (!ofs.is_open())
    {
        gd::LogError( _( "Unable to save file ")+ filename + _("!\nCheck that the drive has enough free space, is not write-protected and that you have read/write permissions." ) );
        return false;
    }

    ofs << str;
    ofs.close();
    return true;
}

bool ProjectFileWriter::LoadFromJSONFile(gd::Project & project, const gd::String & filename)
{
    std::ifstream ifs(filename.ToLocale().c_str());
    if (!ifs.is_open())
    {
        gd::String error = _( "Unable to open the file.") + _("Make sure the file exists and that you have the right to open the file.");
        gd::LogError(error);
        return false;
    }

    project.SetProjectFile(filename);
    project.SetDirty(false);

    std::string str((std::istreambuf_iterator<char>(ifs)), std::istreambuf_iterator<char>());
    gd::SerializerElement rootElement = gd::Serializer::FromJSON(str);
    project.UnserializeFrom(rootElement);

    return true;
}
#endif

bool ProjectFileWriter::LoadFromFile(gd::Project & project, const gd::String & filename)
{
    //Load the XML document structure
    TiXmlDocument doc;
    if ( !doc.LoadFile(filename.ToLocale().c_str()) )
    {
        gd::String errorTinyXmlDesc = doc.ErrorDesc();
        gd::String error = _( "Error while loading :" ) + "\n" + errorTinyXmlDesc + "\n\n" +_("Make sure the file exists and that you have the right to open the file.");

        gd::LogError( error );
        return false;
    }

    #if defined(GD_IDE_ONLY)
    project.SetProjectFile(filename);
    project.SetDirty(false);
    #endif

    TiXmlHandle hdl( &doc );
    gd::SerializerElement rootElement;

    ConvertANSIXMLFile(hdl, doc, filename);

    //Load the root element
    TiXmlElement * rootXmlElement = hdl.FirstChildElement("project").ToElement();
    //Compatibility with GD <= 3.3
    if (!rootXmlElement) rootXmlElement = hdl.FirstChildElement("Project").ToElement();
    if (!rootXmlElement) rootXmlElement = hdl.FirstChildElement("Game").ToElement();
    //End of compatibility code
    gd::Serializer::FromXML(rootElement, rootXmlElement);

    //Unsplit the project
    #if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
    wxString projectPath = wxFileName::FileName(filename).GetPath();
    gd::Splitter splitter;
    splitter.Unsplit(rootElement, [&projectPath](gd::String path, gd::String name) {
        TiXmlDocument doc;
        gd::SerializerElement rootElement;

        gd::String filename = projectPath + path + "-" + MakeFileNameSafe(name);
        if (!doc.LoadFile(filename.ToLocale().c_str()))
        {
            gd::String errorTinyXmlDesc = doc.ErrorDesc();
            gd::String error = _( "Error while loading :" ) + "\n" + errorTinyXmlDesc + "\n\n" +_("Make sure the file exists and that you have the right to open the file.");

            gd::LogError(error);
            return rootElement;
        }

        TiXmlHandle hdl( &doc );
        gd::Serializer::FromXML(rootElement, hdl.FirstChildElement().ToElement());
        return rootElement;
    });
    #endif

    //Unserialize the whole project
    project.UnserializeFrom(rootElement);

    return true;
}

void ProjectFileWriter::ConvertANSIXMLFile(TiXmlHandle & hdl, TiXmlDocument & doc, const gd::String & filename)
{
    //COMPATIBILITY CODE WITH ANSI GDEVELOP ( <= 3.6.83 )
    #if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI) //There should not be any problem with encoding in compiled games
    //Get the declaration element
    TiXmlDeclaration * declXmlElement = hdl.FirstChild().ToNode()->ToDeclaration();
    if(strcmp(declXmlElement->Encoding(), "UTF-8") != 0)
    {
        std::cout << "This is a legacy GDevelop project, checking if it is already encoded in UTF8..." << std::endl;

        //The document has not been converted for/saved by GDevelop UTF8, now, try to determine if the project
        //was saved on Linux and is already in UTF8 or on Windows and still in the locale encoding.
        bool isNotInUTF8 = false;
        std::ifstream docStream;
        docStream.open(filename.ToLocale(), std::ios::in);

        while( !docStream.eof() )
        {
            std::string docLine;
            std::getline(docStream, docLine);

            if( !gd::String::FromUTF8(docLine).IsValid() )
            {
                //The file contains an invalid character,
                //the file has been saved by the legacy ANSI Windows version of GDevelop
                // -> stop reading the file and start converting from the locale to UTF8
                isNotInUTF8 = true;
                break;
            }
        }

        docStream.close();

        //If the file is not encoded in UTF8, encode it
        if(isNotInUTF8)
        {
            std::cout << "The project file is not encoded in UTF8, conversion started... ";

            //Create a temporary file
            #if defined(WINDOWS)
            //Convert using the current locale
            wxString tmpFileName = wxFileName::CreateTempFileName("");
            std::ofstream outStream;
            docStream.open(filename.ToLocale(), std::ios::in);

            outStream.open(tmpFileName, std::ios::out | std::ios::trunc);

            while( !docStream.eof() )
            {
                std::string docLine;
                std::string convLine;

                std::getline(docStream, docLine);
                sf::Utf8::fromAnsi(docLine.begin(), docLine.end(), std::back_inserter(convLine));

                outStream << convLine << '\n';
            }

            outStream.close();
            docStream.close();

            #else
            //Convert using iconv command tool
            wxString tmpFileName = wxStandardPaths::Get().GetUserConfigDir() + "/gdevelop_converted_project";
            gd::String iconvCall = gd::String("iconv -f LATIN1 -t UTF-8 \"") + filename.ToLocale() + "\" ";
            #if defined(MACOS)
            iconvCall += "> \"" + tmpFileName + "\"";
            #else
            iconvCall += "-o \"" + tmpFileName + "\"";
            #endif

            std::cout << "Executing " << iconvCall  << std::endl;
            system(iconvCall.c_str());
            #endif

            //Reload the converted file, forcing UTF8 encoding as the XML header is false (still written ISO-8859-1)
            doc.LoadFile(std::string(tmpFileName).c_str(), TIXML_ENCODING_UTF8);

            std::cout << "Finished." << std::endl;
            gd::LogMessage(_("Your project has been upgraded to be used with GDevelop 4.\nIf you save it, you won't be able to open it with an older version: please do a backup of your project file if you want to go back to GDevelop 3."));
        }
    }
    #endif
    //END OF COMPATIBILITY CODE
}

}

#endif
