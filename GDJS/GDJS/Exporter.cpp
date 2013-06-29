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
#include <wx/msgdlg.h>
#include <wx/config.h>
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
#include "GDJS/Dialogs/ProjectExportDialog.h"

//Nice tool fonction
static void InsertUnique(std::vector<std::string> & container, std::string str)
{
    if ( std::find(container.begin(), container.end(), str) == container.end() )
        container.push_back(str);
}

static void ClearDirectory(wxString dir)
{
    wxString file = wxFindFirstFile( dir + "/*" );
    while ( !file.empty() )
    {
        wxRemoveFile( file );
        file = wxFindNextFile();
    }
}

static void GenerateFontsDeclaration(const std::string & outputDir, std::string & css, std::string & html)
{
    wxString file = wxFindFirstFile( outputDir + "/*" );
    while ( !file.empty() )
    {
        if ( file.Upper().EndsWith(".TTF") )
        {
            wxFileName relativeFile = wxFileName::FileName(file);
            relativeFile.MakeRelativeTo(outputDir);
            css += "@font-face{ font-family : \"gdjs_font_";
            css += gd::ToString(relativeFile.GetFullPath());
            css += "\"; src : url('";
            css += gd::ToString(relativeFile.GetFullPath());
            css +="') format('truetype'); }";

            html += "<div style=\"font-family: 'gdjs_font_";
            html += gd::ToString(relativeFile.GetFullPath());
            html += "';\">.</div>";
        }

        file = wxFindNextFile();
    }
}

Exporter::~Exporter()
{
}

bool Exporter::ExportLayoutForPreview(gd::Layout & layout, std::string exportDir)
{
    if ( !project ) return false;

    gd::RecursiveMkDir::MkDir(exportDir);
    ClearDirectory(exportDir);
    gd::RecursiveMkDir::MkDir(exportDir+"/libs");
    gd::RecursiveMkDir::MkDir(exportDir+"/Extensions");
    std::vector<std::string> includesFiles;

    //Generate events code
    if ( !ExportEventsCode(*project, gd::ToString(wxFileName::GetTempDir()+"/GDTemporaries/JSCodeTemp/"), includesFiles) )
        return false;

    //Strip the project
    gd::Project strippedProject = StripProject(*project, "");
    strippedProject.SetFirstLayout(layout.GetName());

    //Export resources and finalize stripping
    ExportResources(strippedProject, exportDir);
    strippedProject.GetLayout(layout.GetName()).GetEvents().clear();

    //Copy additional dependencies
    ExportIncludesAndLibs(includesFiles, exportDir, false);

    //Create the index file
    if ( !ExportIndexFile(*project, exportDir, includesFiles) ) return false;

    //Export the project
    if ( !strippedProject.SaveToFile(exportDir+"/data.xml") ) {
        lastError = gd::ToString(_("Unable to write ")+exportDir+"/data.xml");
        return false;
    }

    return true;
}

bool Exporter::ExportIndexFile(gd::Project & project, std::string exportDir, const std::vector<std::string> & includesFiles)
{
    std::ifstream t("./JsPlatform/Runtime/index.html");
    std::stringstream buffer;
    buffer << t.rdbuf();
    std::string str = buffer.str();

    //Generate custom declarations for font resources
    std::string customCss;
    std::string customHtml;
    GenerateFontsDeclaration(exportDir, customCss, customHtml);

    size_t pos = str.find("<!-- GDJS_CUSTOM_STYLE -->");
    if ( pos < str.length() )
        str = str.replace(pos, 26, customCss);
    else
    {
        std::cout << "Unable to find <!-- GDJS_CUSTOM_STYLE --> in index file." << std::endl;
        lastError = "Unable to find <!-- GDJS_CUSTOM_STYLE --> in index file.";
        return false;
    }

    pos = str.find("<!-- GDJS_CUSTOM_HTML -->");
    if ( pos < str.length() )
        str = str.replace(pos, 25, customHtml);
    else
    {
        std::cout << "Unable to find <!-- GDJS_CUSTOM_STYLE --> in index file." << std::endl;
        lastError = "Unable to find <!-- GDJS_CUSTOM_STYLE --> in index file.";
        return false;
    }

    pos = str.find("<!-- GDJS_CODE_FILES -->");
    if ( pos < str.length() )
    {

        std::string codeFilesIncludes;
        for (std::vector<std::string>::const_iterator it = includesFiles.begin(); it != includesFiles.end(); ++it)
        {
            if ( !wxFileExists(exportDir+"/"+*it) )
            {
                std::cout << "Warning: Unable to found " << exportDir+"/"+*it << "." << std::endl;
                continue;
            }

            wxFileName relativeFile = wxFileName::FileName(exportDir+"/"+*it);
            relativeFile.MakeRelativeTo(exportDir);
            codeFilesIncludes += "\t<script src=\""+gd::ToString(relativeFile.GetFullPath(wxPATH_UNIX))+"\"></script>\n";
        }

        str = str.replace(pos, 24, codeFilesIncludes);
    }
    else
    {
        std::cout << "Unable to find <!-- GDJS_CODE_FILES --> in index file." << std::endl;
        lastError = "Unable to find <!-- GDJS_CODE_FILES --> in index file.";
        return false;
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

    return true;
}

bool Exporter::ExportEventsCode(gd::Project & project, std::string outputDir, std::vector<std::string> & includesFiles)
{
    gd::RecursiveMkDir::MkDir(outputDir);

    //First, do not forget common includes ( They must be included before events generated code files ).
    InsertUnique(includesFiles, "libs/pixi.js");
    InsertUnique(includesFiles, "libs/jquery.js");
    InsertUnique(includesFiles, "libs/jshashtable.js");
    InsertUnique(includesFiles, "libs/hshg.js");
    InsertUnique(includesFiles, "gd.js");
    InsertUnique(includesFiles, "commontools.js");
    InsertUnique(includesFiles, "runtimeobject.js");
    InsertUnique(includesFiles, "runtimescene.js");
    InsertUnique(includesFiles, "polygon.js");
    InsertUnique(includesFiles, "force.js");
    InsertUnique(includesFiles, "layer.js");
    InsertUnique(includesFiles, "timer.js");
    InsertUnique(includesFiles, "imagemanager.js");
    InsertUnique(includesFiles, "runtimegame.js");
    InsertUnique(includesFiles, "variable.js");
    InsertUnique(includesFiles, "variablescontainer.js");
    InsertUnique(includesFiles, "runtimescene.js");
    InsertUnique(includesFiles, "runtimeautomatism.js");
    InsertUnique(includesFiles, "runtimeobject.js");
    InsertUnique(includesFiles, "spriteruntimeobject.js");
    InsertUnique(includesFiles, "soundmanager.js");

    //Common includes for events only.
    InsertUnique(includesFiles, "runtimescenetools.js");
    InsertUnique(includesFiles, "inputtools.js");
    InsertUnique(includesFiles, "objecttools.js");
    InsertUnique(includesFiles, "cameratools.js");
    InsertUnique(includesFiles, "soundtools.js");

    for (unsigned int i = 0;i<project.GetLayoutCount();++i)
    {
        std::set<std::string> eventsIncludes;
        gd::Layout & exportedLayout = project.GetLayout(i);
        std::string eventsOutput = EventsCodeGenerator::GenerateSceneEventsCompleteCode(project, exportedLayout,
                                                                                        exportedLayout.GetEvents(), eventsIncludes,
                                                                                        false /*Export for edittime*/);
        //Export the code
        std::ofstream file;
        file.open ( std::string(outputDir+"code"+gd::ToString(i)+".js").c_str() );
        if ( file.is_open() ) {
            file << eventsOutput;
            file.close();

            for ( std::set<std::string>::iterator include = eventsIncludes.begin() ; include != eventsIncludes.end(); ++include )
                InsertUnique(includesFiles, *include);

            InsertUnique(includesFiles, std::string(outputDir+"code"+gd::ToString(i)+".js"));
        }
        else {
            lastError = gd::ToString(_("Unable to write ")+outputDir+"code"+gd::ToString(i)+".js");
            return false;
        }
    }

    return true;
}

bool Exporter::ExportIncludesAndLibs(std::vector<std::string> & includesFiles, std::string exportDir, bool minify)
{
    //Includes files :
    if ( minify )
    {
        std::string javaExec = GetJavaExecutablePath();
        if ( javaExec.empty() || !wxFileExists(javaExec) )
        {
            std::cout << "Java executable not found." << std::endl;
            wxLogWarning(_("The exported script could not be minified : Check that the Java Runtime Environment is installed."));
            minify = false;
        }
        else
        {
            std::string jsPlatformDir = gd::ToString(wxGetCwd()+"/JsPlatform/");
            std::string cmd = javaExec+" -jar \""+jsPlatformDir+"Tools/compiler.jar\" --js ";

            std::string allJsFiles;
            for ( std::vector<std::string>::iterator include = includesFiles.begin() ; include != includesFiles.end(); ++include )
            {
                if ( wxFileExists(jsPlatformDir+"Runtime/"+*include) )
                    allJsFiles += "\""+jsPlatformDir+"Runtime/"+*include+"\" ";
                else if ( wxFileExists(jsPlatformDir+"Runtime/Extensions/"+*include) )
                    allJsFiles += "\""+jsPlatformDir+"Runtime/Extensions/"+*include+"\" ";
                else if ( wxFileExists(*include) )
                    allJsFiles += "\""+*include+"\" ";
            }

            cmd += allJsFiles;
            cmd += "--js_output_file "+exportDir+"/code.js";

            wxArrayString output;
            wxArrayString errors;
            long res = wxExecute(cmd, output, errors);
            if ( res != 0 )
            {
                std::cout << "Execution of the closure compiler failed ( Command line : " << cmd << ")." << std::endl;
                std::cout << "Output: ";
                for (size_t i = 0;i<output.size();++i) std::cout << output[i] << std::endl;
                for (size_t i = 0;i<errors.size();++i) std::cout << errors[i] << std::endl;

                wxLogWarning(_("The exported script could not be minified.\n\nMay be an extension is triggering this error: Try to contact the developer if you think it is the case."));
                minify = false;
            }
            else
            {
                includesFiles.clear();
                InsertUnique(includesFiles, "code.js");
                return true;
            }

        }
    }

    //If the close compiler failed or was not request, simply copy all the include files.
    if ( !minify )
    {
        for ( std::vector<std::string>::iterator include = includesFiles.begin() ; include != includesFiles.end(); ++include )
        {
            std::cout << *include << std::endl;
            wxLogNull noLogPlease;
            if ( wxFileExists("./JsPlatform/Runtime/"+*include) )
            {
                wxString path = wxFileName::FileName(exportDir+"/Extensions/"+*include).GetPath();
                if ( !wxDirExists(path) ) gd::RecursiveMkDir::MkDir(path);

                wxCopyFile("./JsPlatform/Runtime/"+*include, exportDir+"/"+*include);
                //Ok, the filename is relative to the export dir.
            }
            else if ( wxFileExists("./JsPlatform/Runtime/Extensions/"+*include) )
            {
                wxString path = wxFileName::FileName(exportDir+"/Extensions/"+*include).GetPath();
                if ( !wxDirExists(path) ) gd::RecursiveMkDir::MkDir(path);

                wxCopyFile("./JsPlatform/Runtime/Extensions/"+*include, exportDir+"/Extensions/"+*include);
                *include = "Extensions/"+*include; //Ensure filename is relative to the export dir.
            }
            else if ( wxFileExists(*include) )
            {
                wxCopyFile(*include, exportDir+"/"+wxFileName::FileName(*include).GetFullName());
                *include = gd::ToString(wxFileName::FileName(*include).GetFullName()); //Ensure filename is relative to the export dir.
            }
            else
            {
                std::cout << "Could not copy include file " << *include << " (File not found)." << std::endl;
            }
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
        else
        {
            strippedProject.GetLayout(i).GetObjectGroups().clear();
            ++i;
        }
    }

    return strippedProject;
}

void Exporter::ExportResources(gd::Project & project, std::string exportDir)
{
    gd::ProjectResourcesCopier::CopyAllResourcesTo(project, exportDir, true, NULL, false);
}

void Exporter::ShowProjectExportDialog(gd::Project & project)
{
    ProjectExportDialog dialog(NULL, project);
    if ( dialog.ShowModal() != 1 ) return;

    bool minify = dialog.RequestMinify();
    std::string exportDir = dialog.GetExportDir();
    gd::RecursiveMkDir::MkDir(exportDir);
    ClearDirectory(exportDir);
    gd::RecursiveMkDir::MkDir(exportDir+"/libs");
    gd::RecursiveMkDir::MkDir(exportDir+"/Extensions");
    std::vector<std::string> includesFiles;

    //TODO: Handle errors
    if ( !ExportEventsCode(project, gd::ToString(wxFileName::GetTempDir()+"/GDTemporaries/JSCodeTemp/"), includesFiles) )
    {
        wxLogError(_("Error during exporting: Unable to export events ( "+lastError+")."));
        return;
    }

    gd::Project strippedProject = StripProject(project);
    ExportResources(strippedProject, exportDir);
    ExportIncludesAndLibs(includesFiles, exportDir, minify);
    if ( !ExportIndexFile(project, exportDir, includesFiles) )
    {
        wxLogError(_("Error during exporting:\n"+lastError));
        return;
    }

    if ( !strippedProject.SaveToFile(exportDir+"/data.xml") ) {
        lastError = gd::ToString(_("Unable to write ")+exportDir+"/data.xml");
        wxLogError(wxString(lastError));
        return;
    }


    if ( wxMessageBox(_("Compilation achieved. Do you want to open the folder where the project has been compiled\?"),
                      _("Compilation finished"), wxYES_NO) == wxYES )
    {
        #if defined(WINDOWS)
        wxExecute("explorer.exe \""+exportDir+"\"");
        #elif defined(LINUX)
        system(std::string("xdg-open \""+exportDir).c_str());
        #elif defined(MAC)
        system(std::string("open \""+exportDir).c_str());
        #endif
    }
};

std::string Exporter::GetProjectExportButtonLabel()
{
    return gd::ToString(_("Export to the web"));
}

std::string Exporter::GetJavaExecutablePath()
{
    std::vector<std::string> guessPaths;
    wxString userPath;
    if ( wxConfigBase::Get()->Read("Paths/Java" , &userPath) && !userPath.empty() )
        guessPaths.push_back(gd::ToString(userPath));
    else
    {
        #if defined(WINDOWS)

        //Try some common paths.
        guessPaths.push_back("C:/Program Files/java/jre7/bin/java.exe");
        guessPaths.push_back("C:/Program Files/java/jre6/bin/java.exe");
        guessPaths.push_back("C:/Program Files (x86)/java/jre7/bin/java.exe");
        guessPaths.push_back("C:/Program Files (x86)/java/jre6/bin/java.exe");

        #else
            #warning Please complete this so as to return a path to the Java executable.
        #endif
    }

    for (size_t i = 0;i<guessPaths.size();++i)
    {
        if ( wxFileExists(guessPaths[i]) )
            return guessPaths[i];
    }

    return "";
}
