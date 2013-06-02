/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#include <sstream>
#include <fstream>
#include <streambuf>
#include <string>
#include <wx/filename.h>
#include <wx/log.h>
#include "GDCore/TinyXml/tinyxml.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/ExternalEvents.h"
#include "GDCore/IDE/wxTools/RecursiveMkDir.h"
#include "GDCore/IDE/ProjectResourcesCopier.h"
#include "GDCore/CommonTools.h"
#include <boost/property_tree/xml_parser.hpp>
#include <boost/property_tree/json_parser.hpp>
#include "GDJS/Exporter.h"
#include "GDJS/EventsCodeGenerator.h"


Exporter::~Exporter()
{
}

bool Exporter::ExportLayoutForPreview(gd::Layout & layout, std::string exportDir)
{
    gd::RecursiveMkDir::MkDir(exportDir);
    gd::RecursiveMkDir::MkDir(exportDir+"/libs");
    std::set<std::string> includesFiles;

    //Generate events code
    for (unsigned int i = 0;i<project.GetLayoutCount();++i)
    {
        gd::Layout & exportedLayout = project.GetLayout(i);
        std::string eventsOutput = EventsCodeGenerator::GenerateSceneEventsCompleteCode(project, exportedLayout,
                                                                                        exportedLayout.GetEvents(), includesFiles,
                                                                                        false /*Export for edittime*/);
        //Export the code
        std::ofstream file;
        file.open ( std::string(exportDir+"code"+gd::ToString(i)+".js").c_str() );
        if ( file.is_open() ) {
            file << eventsOutput;
            file.close();
        }
        else {
            lastError = gd::ToString(_("Unable to write ")+exportDir+"code"+gd::ToString(i)+".js");
            return false;
        }
    }

    //Strip the project
    gd::Project strippedProject = StripProject(project, "");
    strippedProject.SetFirstLayout(layout.GetName());

    //Export resources and finalize stripping
    ExportResources(strippedProject, exportDir);
    strippedProject.GetLayout(layout.GetName()).GetEvents().clear();

    //Export the project
    if ( !strippedProject.SaveToFile(exportDir+"/data.xml") ) {
        lastError = gd::ToString(_("Unable to write ")+exportDir+"data.xml");
        return false;
    }

    //Create the index file
    {
        std::ifstream t("./JsPlatform/Runtime/index.html");
        std::stringstream buffer;
        buffer << t.rdbuf();
        std::string str = buffer.str();

        size_t pos = str.find("<!-- GDJS_CODE_FILES -->");
        if ( pos < str.length() ) {

            std::string codeFilesIncludes;
            for (unsigned int i = 0;i<project.GetLayoutCount();++i)
                codeFilesIncludes += "<script src=\"code"+gd::ToString(i)+".js\"></script>\n";

            str = str.replace(pos, 24, codeFilesIncludes);
        }
        else {
            std::cout << "Unable to find <!-- GDJS_CODE_FILES --> in index file." << std::endl;
        }

        {
            std::ofstream file;
            file.open ( std::string(exportDir+"/index.html").c_str() );
            if ( file.is_open() ) {
                file << str;
                file.close();
            }
            else {
                lastError = "Unable to write index file.";
                return false;
            }
        }
    }

    //Copy additional dependencies
    wxCopyFile("./JsPlatform/Runtime/libs/pixi.js", exportDir+"/libs/pixi.js");
    wxCopyFile("./JsPlatform/Runtime/libs/jquery.js", exportDir+"/libs/jquery.js");
    wxCopyFile("./JsPlatform/Runtime/libs/jshashtable.js", exportDir+"/libs/jshashtable.js");
    wxCopyFile("./JsPlatform/Runtime/bunny.png", exportDir+"/bunny.png");
    wxCopyFile("./JsPlatform/Runtime/gd.js", exportDir+"/gd.js");
    wxCopyFile("./JsPlatform/Runtime/runtimeobject.js", exportDir+"/runtimeobject.js");
    wxCopyFile("./JsPlatform/Runtime/runtimescene.js", exportDir+"/runtimescene.js");
    wxCopyFile("./JsPlatform/Runtime/commontools.js", exportDir+"/commontools.js");
    for ( std::set<std::string>::iterator include = includesFiles.begin() ; include != includesFiles.end(); ++include )
    {
        wxLogNull noLogPlease;
        if ( wxFileExists("./JsPlatform/Runtime/"+*include) ) {
            wxCopyFile("./JsPlatform/Runtime/"+*include, exportDir+*include);
        }
    }

    return true;
}

gd::Project Exporter::StripProject(const gd::Project & project, std::string layout)
{
    gd::Project strippedProject = project;
    strippedProject.GetObjectGroups().clear();
    while ( strippedProject.GetExternalEventsCount() > 0 ) strippedProject.RemoveExternalEvents(strippedProject.GetExternalEvents(0).GetName());

    for (unsigned int i = 0;i<strippedProject.GetLayoutCount();)
    {
        if ( !layout.empty() && layout != strippedProject.GetLayout(i).GetName() )
            strippedProject.RemoveLayout(strippedProject.GetLayout(i).GetName());
        else {
            strippedProject.GetLayout(i).GetObjectGroups().clear();
            ++i;
        }
    }

    return strippedProject;
}

void Exporter::ExportResources(gd::Project & project, std::string exportDir)
{
    gd::ProjectResourcesCopier::CopyAllResourcesTo(project, exportDir, true, NULL, false) ;
}
