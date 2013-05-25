/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#include <sstream>
#include <fstream>
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
    gd::Layout exportedLayout = layout;
    std::string eventsOutput = EventsCodeGenerator::GenerateSceneEventsCompleteCode(project, exportedLayout, exportedLayout.GetEvents(), includesFiles,
                                                                                    false /*Export for edittime*/);

    //Export the code
    std::ofstream file;
    file.open ( std::string(exportDir+"code.js").c_str() );
    if ( file.is_open() ) {
        file << eventsOutput;
        file.close();
    }
    else {
        lastError = gd::ToString(_("Unable to write ")+exportDir+"code.js");
        return false;
    }

    //Strip the project
    gd::Project strippedProject = StripProject(project, layout.GetName());

    //Export resources and finalize stripping
    ExportResources(strippedProject, exportDir);
    strippedProject.GetLayout(layout.GetName()).GetEvents().clear();

    //Export the project
    if ( !strippedProject.SaveToFile(exportDir+"/data.xml") ) {
        lastError = gd::ToString(_("Unable to write ")+exportDir+"data.xml");
        return false;
    }

    //Copy additional dependencies
    wxCopyFile("./JsPlatform/Runtime/libs/pixi.js", exportDir+"/libs/pixi.js");
    wxCopyFile("./JsPlatform/Runtime/libs/jquery.js", exportDir+"/libs/jquery.js");
    wxCopyFile("./JsPlatform/Runtime/libs/jshashtable.js", exportDir+"/libs/jshashtable.js");
    wxCopyFile("./JsPlatform/Runtime/index.html", exportDir+"/index.html");
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
