/*
 * Game Develop JS Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#include <sstream>
#include <fstream>
#include <streambuf>
#include <string>
#if !defined(GD_NO_WX_GUI)
#include <wx/filename.h>
#include <wx/dir.h>
#include <wx/msgdlg.h>
#include <wx/config.h>
#include <wx/progdlg.h>
#include <wx/zipstrm.h>
#include <wx/wfstream.h>
#endif
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/Log.h"
#include "GDCore/TinyXml/tinyxml.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/IDE/AbstractFileSystem.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/PlatformDefinition/ExternalEvents.h"
#include "GDCore/IDE/wxTools/RecursiveMkDir.h"
#include "GDCore/IDE/ProjectResourcesCopier.h"
#include "GDCore/CommonTools.h"
#include "GDJS/Exporter.h"
#include "GDJS/EventsCodeGenerator.h"
#include "GDJS/Dialogs/ProjectExportDialog.h"
#include "GDJS/Dialogs/UploadOnlineDialog.h"
#include "GDJS/Dialogs/CocoonJSUploadDialog.h"
#undef CopyFile //Disable an annoying macro

namespace gdjs
{

//Nice tools functions
static void InsertUnique(std::vector<std::string> & container, std::string str)
{
    if ( std::find(container.begin(), container.end(), str) == container.end() )
        container.push_back(str);
}

static void GenerateFontsDeclaration(gd::AbstractFileSystem & fs, const std::string & outputDir, std::string & css, std::string & html)
{
    std::vector<std::string> ttfFiles = fs.ReadDir(outputDir, ".TTF");
    for(unsigned int i = 0; i<ttfFiles.size();++i) {
        std::string relativeFile = ttfFiles[i];
        fs.MakeRelative(relativeFile, outputDir);
        css += "@font-face{ font-family : \"gdjs_font_";
        css += relativeFile;
        css += "\"; src : url('";
        css += relativeFile;
        css +="') format('truetype'); }";

        html += "<div style=\"font-family: 'gdjs_font_";
        html += relativeFile;
        html += "';\">.</div>";
    }
}

Exporter::~Exporter()
{
}

bool Exporter::ExportLayoutForPreview(gd::Project & project, gd::Layout & layout, std::string exportDir)
{
    fs.MkDir(exportDir);
    fs.ClearDir(exportDir);
    fs.MkDir(exportDir+"/libs");
    fs.MkDir(exportDir+"/Extensions");
    std::vector<std::string> includesFiles;

    gd::Project exportedProject = project;

    //Export resources ( *before* generating events as some resources filenames may be updated )
    ExportResources(fs, exportedProject, exportDir);
    //Generate events code
    if ( !ExportEventsCode(exportedProject, fs.GetTempDir()+"/GDTemporaries/JSCodeTemp/", includesFiles) )
        return false;

    //Strip the project ( *after* generating events as the events may use strioped things ( objects groups... ) )
    StripProject(exportedProject);
    exportedProject.SetFirstLayout(layout.GetName());

    //Export the project
    std::string result = ExportToJSON(fs, exportedProject, fs.GetTempDir()+"/GDTemporaries/JSCodeTemp/data.js",
                                      "gdjs.projectData", false);
    includesFiles.push_back(fs.GetTempDir()+"/GDTemporaries/JSCodeTemp/data.js");

    //Copy all the dependencies
    ExportIncludesAndLibs(includesFiles, exportDir, false);

    //Create the index file
    if ( !ExportStandardIndexFile(exportedProject, exportDir, includesFiles) ) return false;

    return true;
}

std::string Exporter::ExportToJSON(gd::AbstractFileSystem & fs, const gd::Project & project,
    std::string filename, std::string wrapIntoVariable, bool prettyPrinting)
{
    fs.MkDir(fs.DirNameFrom(filename));

    //Save the project to JSON
    gd::SerializerElement rootElement;
    project.SerializeTo(rootElement);

    std::string output = gd::Serializer::ToJSON(rootElement);
    if (!wrapIntoVariable.empty()) output = wrapIntoVariable + " = " + output + ";";

    if (!fs.WriteToFile(filename, output))
        return "Unable to write "+filename;

    return "";
}

bool Exporter::ExportMetadataFile(gd::Project & project, std::string exportDir, const std::vector<std::string> & includesFiles)
{
    #if !defined(GD_NO_WX_GUI)
    std::string metadata = "{";

    //Fonts metadata
    metadata += "\"fonts\":[";
    bool first = true;
    wxString file = wxFindFirstFile( exportDir + "/*" );
    while ( !file.empty() )
    {
        if ( file.Upper().EndsWith(".TTF") )
        {
            wxFileName relativeFile(file);
            relativeFile.MakeRelativeTo(exportDir);

            if ( !first ) metadata += ", ";
            metadata += "{\"ffamilyname\":\"gdjs_font_"+gd::ToString(relativeFile.GetFullPath())+"\"";
            metadata += ", \"filename\":\""+gd::ToString(relativeFile.GetFullPath())+"\", \"format\":\"truetype\"}";

            first = false;
        }

        file = wxFindNextFile();
    }

    //Used scripts files
    metadata += "],\"scripts\":[";
    for (std::vector<std::string>::const_iterator it = includesFiles.begin(); it != includesFiles.end(); ++it)
    {
        if ( !fs.FileExists(exportDir+"/"+*it) )
            continue;

        if (it != includesFiles.begin()) metadata += ", ";

        wxFileName relativeFile(exportDir+"/"+*it);
        relativeFile.MakeRelativeTo(exportDir);
        metadata += "\""+gd::ToString(relativeFile.GetFullPath(wxPATH_UNIX))+"\"";
    }

    //Other metadata
    metadata += "], ";
    metadata += "\"windowSize\":{\"w\": "+gd::ToString(project.GetMainWindowDefaultWidth())
        +", \"h\": "+gd::ToString(project.GetMainWindowDefaultHeight())+"}";
    metadata += "}";

    {
        std::ofstream file;
        file.open ( std::string(exportDir+"/gd_metadata.json").c_str() );
        if ( file.is_open() ) {
            file << metadata;
            file.close();
        }
        else {
            lastError = "Unable to write the metadata file.";
            return false;
        }
    }
    #else
    gd::LogWarning("BAD USE: Exporter::ExportMetadataFile is not available");
    #endif

    return true;
}

bool Exporter::ExportStandardIndexFile(gd::Project & project, std::string exportDir, const std::vector<std::string> & includesFiles, std::string additionalSpec)
{
    //Open the index.html template
    std::string str = fs.ReadFile("./JsPlatform/Runtime/index.html");

    //Generate custom declarations for font resources
    std::string customCss;
    std::string customHtml;
    GenerateFontsDeclaration(fs, exportDir, customCss, customHtml);

    //Generate the file
    if ( !CompleteIndexFile(str, customCss, customHtml, exportDir, includesFiles, additionalSpec) )
        return false;

    //Write the index.html file
    if ( !fs.WriteToFile(exportDir+"/index.html", str) )
    {
        lastError = "Unable to write index file.";
        return false;
    }

    return true;
}

bool Exporter::ExportIntelXDKIndexFile(gd::Project & project, std::string exportDir, const std::vector<std::string> & includesFiles, std::string additionalSpec)
{
    #if !defined(GD_NO_WX_GUI)
    {
        //Open the index.html template
        std::string str = fs.ReadFile("./JsPlatform/Runtime/XDKindex.html");

        //Generate custom declarations for font resources
        std::string customCss;
        std::string customHtml;
        GenerateFontsDeclaration(fs, exportDir, customCss, customHtml);

        //Generate the file
        if ( !CompleteIndexFile(str, customCss, customHtml, exportDir, includesFiles, additionalSpec) )
            return false;

        //Write the index.html file
        if ( !fs.WriteToFile(exportDir+"/index.html", str) )
        {
            lastError = "Unable to write index file.";
            return false;
        }
    }
    {
        //Open the XDK project file template
        std::string str = fs.ReadFile("./JsPlatform/Runtime/XDKProject.xdk");

        //Complete the project file
        std::string nowTimeStamp = gd::ToString(wxDateTime::Now().GetTicks());
        size_t pos = str.find("\"GDJS_LAST_MODIFIED\"");
        if ( pos < str.length() )
            str = str.replace(pos, 20, nowTimeStamp);
        else
        {
            std::cout << "Unable to find \"GDJS_LAST_MODIFIED\" in the project file." << std::endl;
            lastError = "Unable to find \"GDJS_LAST_MODIFIED\" in the project file.";
            return false;
        }
        pos = str.find("\"GDJS_CREATION\"");
        if ( pos < str.length() )
            str = str.replace(pos, 20, nowTimeStamp);
        else
        {
            std::cout << "Unable to find \"GDJS_CREATION\" in the project file." << std::endl;
            lastError = "Unable to find \"GDJS_CREATION\" in the project file.";
            return false;
        }

        //Write the file
        if (!fs.WriteToFile(exportDir+"/XDKProject.xdk", str))
        {
            lastError = "Unable to write the intel XDK project file.";
            return false;
        }
    }
    {
        if ( !fs.CopyFile("./JsPlatform/Runtime/XDKProject.xdke", exportDir+"/XDKProject.xdke") )
        {
            lastError = "Unable to write the intel XDK second project file.";
            return false;
        }
    }
    #else
        std::cout << "BAD USE: ExportIntelXDKIndexFile is not available." << std::endl;
    #endif

    return true;
}

bool Exporter::CompleteIndexFile(std::string & str, std::string customCss, std::string customHtml, std::string exportDir, const std::vector<std::string> & includesFiles, std::string additionalSpec)
{
    size_t pos = str.find("/* GDJS_CUSTOM_STYLE */");
    if ( pos < str.length() )
        str = str.replace(pos, 23, customCss);
    else
    {
        std::cout << "Unable to find /* GDJS_CUSTOM_STYLE */ in index file." << std::endl;
        lastError = "Unable to find /* GDJS_CUSTOM_STYLE */ in index file.";
        return false;
    }

    pos = str.find("<!-- GDJS_CUSTOM_HTML -->");
    if ( pos < str.length() )
        str = str.replace(pos, 25, customHtml);
    else
    {
        std::cout << "Unable to find <!-- GDJS_CUSTOM_HTML --> in index file." << std::endl;
        lastError = "Unable to find <!-- GDJS_CUSTOM_HTML --> in index file.";
        return false;
    }

    pos = str.find("<!-- GDJS_CODE_FILES -->");
    if ( pos < str.length() )
    {
        std::string codeFilesIncludes;
        for (std::vector<std::string>::const_iterator it = includesFiles.begin(); it != includesFiles.end(); ++it)
        {
            if ( !fs.FileExists(exportDir+"/"+*it) )
            {
                std::cout << "Warning: Unable to found " << exportDir+"/"+*it << "." << std::endl;
                continue;
            }

            std::string relativeFile = exportDir+"/"+*it;
            fs.MakeRelative(relativeFile, exportDir);
            codeFilesIncludes += "\t<script src=\""+relativeFile+"\"></script>\n";
        }

        str = str.replace(pos, 24, codeFilesIncludes);
    }
    else
    {
        std::cout << "Unable to find <!-- GDJS_CODE_FILES --> in index file." << std::endl;
        lastError = "Unable to find <!-- GDJS_CODE_FILES --> in index file.";
        return false;
    }

    pos = str.find("{}/*GDJS_ADDITIONAL_SPEC*/");
    if ( pos < str.length() )
    {
        if (additionalSpec.empty()) additionalSpec = "{}";

        str = str.replace(pos, 26, additionalSpec);
    }
    else
    {
        std::cout << "Unable to find {}/*GDJS_ADDITIONAL_SPEC*/ in index file." << std::endl;
        lastError = "Unable to find {}/*GDJS_ADDITIONAL_SPEC*/ in index file.";
        return false;
    }

    return true;
}

bool Exporter::ExportEventsCode(gd::Project & project, std::string outputDir, std::vector<std::string> & includesFiles)
{
    fs.MkDir(outputDir);

    //First, do not forget common includes ( They must be included before events generated code files ).
    InsertUnique(includesFiles, "libs/pixi.js");
    InsertUnique(includesFiles, "libs/jshashtable.js");
    InsertUnique(includesFiles, "gd.js");
    InsertUnique(includesFiles, "libs/hshg.js");
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
    InsertUnique(includesFiles, "eventscontext.js");
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
    InsertUnique(includesFiles, "storagetools.js");
    InsertUnique(includesFiles, "stringtools.js");
    InsertUnique(includesFiles, "windowtools.js");

    for (unsigned int i = 0;i<project.GetLayoutsCount();++i)
    {
        std::set<std::string> eventsIncludes;
        gd::Layout & exportedLayout = project.GetLayout(i);
        std::string eventsOutput = EventsCodeGenerator::GenerateSceneEventsCompleteCode(project, exportedLayout,
            exportedLayout.GetEvents(), eventsIncludes, false /*Export for edittime*/);
        //Export the code
        if (fs.WriteToFile(outputDir+"code"+gd::ToString(i)+".js", eventsOutput))
        {
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
    #if !defined(GD_NO_WX_GUI)
    //Includes files :
    if ( minify )
    {
        std::string javaExec = GetJavaExecutablePath();
        if ( javaExec.empty() || !fs.FileExists(javaExec) )
        {
            std::cout << "Java executable not found." << std::endl;
            gd::LogWarning(_("The exported script could not be minified : Check that the Java Runtime Environment is installed."));
            minify = false;
        }
        else
        {
            std::string jsPlatformDir = gd::ToString(wxGetCwd()+"/JsPlatform/");
            std::string cmd = javaExec+" -jar \""+jsPlatformDir+"Tools/compiler.jar\" --js ";

            std::string allJsFiles;
            for ( std::vector<std::string>::iterator include = includesFiles.begin() ; include != includesFiles.end(); ++include )
            {
                if ( fs.FileExists(jsPlatformDir+"Runtime/"+*include) )
                    allJsFiles += "\""+jsPlatformDir+"Runtime/"+*include+"\" ";
                else if ( fs.FileExists(jsPlatformDir+"Runtime/Extensions/"+*include) )
                    allJsFiles += "\""+jsPlatformDir+"Runtime/Extensions/"+*include+"\" ";
                else if ( fs.FileExists(*include) )
                    allJsFiles += "\""+*include+"\" ";
            }

            cmd += allJsFiles;
            cmd += "--js_output_file \""+exportDir+"/code.js\"";

            wxArrayString output;
            wxArrayString errors;
            long res = wxExecute(cmd, output, errors);
            if ( res != 0 )
            {
                std::cout << "Execution of the closure compiler failed ( Command line : " << cmd << ")." << std::endl;
                std::cout << "Output: ";
                bool outOfMemoryError = false;
                for (size_t i = 0;i<output.size();++i)
                {
                    outOfMemoryError |= output[i].find("OutOfMemoryError") < output[i].length();
                    std::cout << output[i] << std::endl;
                }
                for (size_t i = 0;i<errors.size();++i)
                {
                    outOfMemoryError |= errors[i].find("OutOfMemoryError") < errors[i].length();
                    std::cout << errors[i] << std::endl;
                }

                if ( outOfMemoryError)
                    gd::LogWarning(_("The exported script could not be minified: It seems that the script is too heavy and need too much memory to be minified.\n\nTry using sub events and reduce the number of events."));
                else
                    gd::LogWarning(_("The exported script could not be minified.\n\nMay be an extension is triggering this error: Try to contact the developer if you think it is the case."));
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
    #else
    minify = false;
    #endif

    //If the closure compiler failed or was not request, simply copy all the include files.
    if ( !minify )
    {
        for ( std::vector<std::string>::iterator include = includesFiles.begin() ; include != includesFiles.end(); ++include )
        {
            if ( fs.FileExists("./JsPlatform/Runtime/"+*include) )
            {
                std::string path = fs.DirNameFrom(exportDir+"/Extensions/"+*include);
                if ( !fs.DirExists(path) ) fs.MkDir(path);

                fs.CopyFile("./JsPlatform/Runtime/"+*include, exportDir+"/"+*include);
                //Ok, the filename is relative to the export dir.
            }
            else if ( fs.FileExists("./JsPlatform/Runtime/Extensions/"+*include) )
            {
                std::string path = fs.DirNameFrom(exportDir+"/Extensions/"+*include);
                if ( !fs.DirExists(path) ) fs.MkDir(path);

                fs.CopyFile("./JsPlatform/Runtime/Extensions/"+*include, exportDir+"/Extensions/"+*include);
                *include = "Extensions/"+*include; //Ensure filename is relative to the export dir.
            }
            else if ( fs.FileExists(*include) )
            {
                fs.CopyFile(*include, exportDir+"/"+fs.FileNameFrom(*include));
                *include = fs.FileNameFrom(*include); //Ensure filename is relative to the export dir.
            }
            else
            {
                std::cout << "Could not copy include file " << *include << " (File not found)." << std::endl;
            }
        }
    }

    return true;
}

void Exporter::StripProject(gd::Project & strippedProject)
{
    strippedProject.GetObjectGroups().clear();
    while ( strippedProject.GetExternalEventsCount() > 0 ) strippedProject.RemoveExternalEvents(strippedProject.GetExternalEvents(0).GetName());

    for (unsigned int i = 0;i<strippedProject.GetLayoutsCount();++i)
    {
        strippedProject.GetLayout(i).GetObjectGroups().clear();
        strippedProject.GetLayout(i).GetEvents().Clear();
    }
}

void Exporter::ExportResources(gd::AbstractFileSystem & fs, gd::Project & project, std::string exportDir, wxProgressDialog * progressDialog)
{
    gd::ProjectResourcesCopier::CopyAllResourcesTo(project, fs, exportDir, true, progressDialog, false, false);
}

void Exporter::ShowProjectExportDialog(gd::Project & project)
{
    #if !defined(GD_NO_WX_GUI)
    ProjectExportDialog dialog(NULL, project);
    if ( dialog.ShowModal() != 1 ) return;

    bool exportForGDShare = dialog.GetExportType() == ProjectExportDialog::GameDevShare;
    bool exportForCocoonJS = dialog.GetExportType() == ProjectExportDialog::CocoonJS;
    bool exportForIntelXDK = dialog.GetExportType() == ProjectExportDialog::IntelXDK;

    ExportWholeProject(project, dialog.GetExportDir(), dialog.RequestMinify(),
        exportForGDShare, exportForCocoonJS, exportForIntelXDK);
    #else
    gd::LogError("BAD USE: Exporter::ShowProjectExportDialog is not available.");
    #endif
}

bool Exporter::ExportWholeProject(gd::Project & project, std::string exportDir,
    bool minify, bool exportForGDShare, bool exportForCocoonJS, bool exportForIntelXDK)
{
    bool exportToZipFile = exportForGDShare || exportForCocoonJS;

    {
        #if !defined(GD_NO_WX_GUI)
        wxProgressDialog progressDialog(_("Export in progress ( 1/2 )"), _("Exporting the project..."));
        #endif

        //Prepare the export directory
        fs.MkDir(exportDir);
        fs.ClearDir(exportDir);
        fs.MkDir(exportDir+"/libs");
        fs.MkDir(exportDir+"/Extensions");
        std::vector<std::string> includesFiles;

        gd::Project exportedProject = project;

        //Export the resources ( before generating events as some resources filenames may be updated )
        #if !defined(GD_NO_WX_GUI)
        ExportResources(fs, exportedProject, exportDir, &progressDialog);
        #else
        ExportResources(fs, exportedProject, exportDir, NULL);
        #endif

        #if !defined(GD_NO_WX_GUI)
        progressDialog.SetTitle(_("Export in progress ( 2/2 )"));
        progressDialog.Update(50, _("Exporting events..."));
        #endif

        //Export events
        if ( !ExportEventsCode(exportedProject, fs.GetTempDir()+"/GDTemporaries/JSCodeTemp/", includesFiles) )
        {
            gd::LogError(_("Error during exporting: Unable to export events ( "+lastError+")."));
            return false;
        }

        #if !defined(GD_NO_WX_GUI)
        progressDialog.Update(60, _("Preparing the project..."));
        #endif

        //Strip the project (*after* generating events as the events may use stripped things like objects groups...)...
        StripProject(exportedProject);

        #if !defined(GD_NO_WX_GUI)
        progressDialog.Update(70, _("Exporting files..."));
        #endif

        //...and export it
        std::string result = ExportToJSON(fs, exportedProject, fs.GetTempDir()+"/GDTemporaries/JSCodeTemp/data.js",
                                          "gdjs.projectData", false);
        includesFiles.push_back(fs.GetTempDir()+"/GDTemporaries/JSCodeTemp/data.js");

        #if !defined(GD_NO_WX_GUI)
        progressDialog.Update(80, minify ? _("Exporting files and minifying them...") : _("Exporting files..."));
        #endif

        //Copy all dependencies and the index (or metadata) file.
        std::string additionalSpec = exportForCocoonJS ? "{forceFullscreen:true}" : "";
        ExportIncludesAndLibs(includesFiles, exportDir, minify);
        bool indexFile = false;
        if (exportForIntelXDK) indexFile = ExportIntelXDKIndexFile(exportedProject, exportDir, includesFiles, additionalSpec);
        else if (exportForGDShare) indexFile = ExportMetadataFile(exportedProject, exportDir, includesFiles);
        else indexFile = ExportStandardIndexFile(exportedProject, exportDir, includesFiles, additionalSpec);

        if ( !indexFile)
        {
            gd::LogError(_("Error during export:\n")+lastError);
            return false;
        }

        //Exporting for online upload requires to zip the whole game.
        if ( exportToZipFile )
        {
            #if !defined(GD_NO_WX_GUI)
            progressDialog.Update(90, _("Creating the zip file..."));

            //Getting all the files to includes in the directory
            wxArrayString files;
            wxDir::GetAllFiles(exportDir, &files);

            wxString zipTempName = fs.GetTempDir()+"/GDTemporaries/zipped_"+ToString(&project)+".zip";
            wxFFileOutputStream out(zipTempName);
            wxZipOutputStream zip(out);
            for(unsigned int i = 0; i < files.size(); ++i)
            {
                wxFileName filename(files[i]);
                filename.MakeRelativeTo(exportDir);
                wxFileInputStream file(files[i]);
                if ( file.IsOk() )
                {
                    zip.PutNextEntry(filename.GetFullPath());
                    zip.Write(file);
                }
            }

            if ( !zip.Close() || !out.Close() )
                gd::LogWarning(_("Unable to finalize the creation of the zip file!\n\nThe exported project won't be put in a zip file."));
            else
            {
                progressDialog.Update(95, _("Cleaning files..."));

                fs.ClearDir(exportDir);
                fs.CopyFile(gd::ToString(zipTempName), exportDir+"/packaged_game.zip");
                wxRemoveFile(zipTempName);
            }
            #else
            gd::LogError("BAD USE: Trying to export to a zip file, but this feature is not available when wxWidgets support is disabled.");
            #endif
        }
    }

    //Finished!
    #if !defined(GD_NO_WX_GUI)
    if ( exportForGDShare )
    {
        UploadOnlineDialog uploadDialog(NULL, project.GetName(), exportDir+wxFileName::GetPathSeparator()+"packaged_game.zip");
        uploadDialog.ShowModal();
    }
    else if ( exportForCocoonJS )
    {
        CocoonJSUploadDialog uploadDialog(NULL, exportDir+wxFileName::GetPathSeparator()+"packaged_game.zip");
        uploadDialog.ShowModal();
    }
    else if ( exportForIntelXDK )
    {
        //TODO: Not finished.
        /*CocoonJSUploadDialog uploadDialog(NULL, exportDir+wxFileName::GetPathSeparator()+"packaged_game.zip");
        uploadDialog.ShowModal();*/
    }
    else
    {
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
    }
    #endif

    return true;
}

std::string Exporter::GetProjectExportButtonLabel()
{
    return gd::ToString(_("Export to the web"));
}

#if !defined(GD_NO_WX_GUI)
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
        guessPaths.push_back("C:/Program Files (x86)/java/jre7/bin/java.exe");
        guessPaths.push_back("C:/Program Files/java/jre6/bin/java.exe");
        guessPaths.push_back("C:/Program Files (x86)/java/jre6/bin/java.exe");

        #elif defined(LINUX)
        guessPaths.push_back("/usr/bin/java");
        guessPaths.push_back("/usr/local/bin/java");
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
#endif

}