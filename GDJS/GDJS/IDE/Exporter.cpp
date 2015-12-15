/*
 * GDevelop JS Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include <algorithm>
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
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/ExternalLayout.h"
#include "GDCore/IDE/AbstractFileSystem.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/Project/SourceFile.h"
#include "GDCore/IDE/wxTools/RecursiveMkDir.h"
#include "GDCore/IDE/wxTools/ShowFolder.h"
#include "GDCore/IDE/Project/ProjectResourcesCopier.h"
#include "GDCore/IDE/ProjectStripper.h"
#include "GDCore/CommonTools.h"
#include "GDJS/IDE/Exporter.h"
#include "GDJS/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDJS/IDE/Dialogs/ProjectExportDialog.h"
#include "GDJS/IDE/Dialogs/CocoonJSUploadDialog.h"
#include "GDJS/IDE/Dialogs/CordovaPackageDialog.h"
#undef CopyFile //Disable an annoying macro

namespace gdjs
{

//Nice tools functions
static void InsertUnique(std::vector<gd::String> & container, gd::String str)
{
    if ( std::find(container.begin(), container.end(), str) == container.end() )
        container.push_back(str);
}

static void GenerateFontsDeclaration(gd::AbstractFileSystem & fs, const gd::String & outputDir, gd::String & css, gd::String & html)
{
    std::vector<gd::String> ttfFiles = fs.ReadDir(outputDir, ".TTF");
    for(std::size_t i = 0; i<ttfFiles.size();++i) {
        gd::String relativeFile = ttfFiles[i];
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

bool Exporter::ExportLayoutForPreview(gd::Project & project, gd::Layout & layout, gd::String exportDir)
{
    return ExportLayoutForPreview(project, layout, exportDir, "");
}

bool Exporter::ExportExternalLayoutForPreview(gd::Project & project, gd::Layout & layout,
   gd::ExternalLayout & externalLayout, gd::String exportDir)
{
    gd::SerializerElement options;
    options.AddChild("injectExternalLayout").SetValue(externalLayout.GetName());

    return ExportLayoutForPreview(project, layout, exportDir,
        gd::Serializer::ToJSON(options)
    );
}

bool Exporter::ExportLayoutForPreview(gd::Project & project, gd::Layout & layout, gd::String exportDir, gd::String additionalSpec)
{
    fs.MkDir(exportDir);
    fs.ClearDir(exportDir);
    fs.MkDir(exportDir+"/libs");
    fs.MkDir(exportDir+"/Extensions");
    std::vector<gd::String> includesFiles;

    gd::Project exportedProject = project;

    //Export resources (*before* generating events as some resources filenames may be updated)
    ExportResources(fs, exportedProject, exportDir);
    //Generate events code
    if ( !ExportEventsCode(exportedProject, fs.GetTempDir()+"/GDTemporaries/JSCodeTemp/", includesFiles) )
        return false;

    //Export source files
    if ( !ExportExternalSourceFiles(exportedProject, fs.GetTempDir()+"/GDTemporaries/JSCodeTemp/", includesFiles) )
    {
        gd::LogError(_("Error during exporting! Unable to export source files:\n")+lastError);
        return false;
    }

    //Strip the project (*after* generating events as the events may use stripped things (objects groups...))
    gd::ProjectStripper::StripProject(exportedProject);
    exportedProject.SetFirstLayout(layout.GetName());

    //Export the project
    ExportToJSON(fs, exportedProject, fs.GetTempDir() + "/GDTemporaries/JSCodeTemp/data.js",
                 "gdjs.projectData");
    includesFiles.push_back(fs.GetTempDir()+"/GDTemporaries/JSCodeTemp/data.js");

    //Copy all the dependencies
    ExportIncludesAndLibs(includesFiles, exportDir, false);

    //Create the index file
    if (!ExportIndexFile("./JsPlatform/Runtime/index.html", exportDir, includesFiles, additionalSpec))
        return false;

    return true;
}

gd::String Exporter::ExportToJSON(gd::AbstractFileSystem &fs, const gd::Project &project, gd::String filename,
                                         gd::String wrapIntoVariable)
{
    fs.MkDir(fs.DirNameFrom(filename));

    //Save the project to JSON
    gd::SerializerElement rootElement;
    project.SerializeTo(rootElement);

    gd::String output = gd::Serializer::ToJSON(rootElement);
    if (!wrapIntoVariable.empty()) output = wrapIntoVariable + " = " + output + ";";

    if (!fs.WriteToFile(filename, output))
        return "Unable to write "+filename;

    return "";
}

bool Exporter::ExportIndexFile(gd::String source, gd::String exportDir, const std::vector<gd::String> & includesFiles, gd::String additionalSpec)
{
    gd::String str = fs.ReadFile(source);

    //Generate custom declarations for font resources
    gd::String customCss;
    gd::String customHtml;
    GenerateFontsDeclaration(fs, exportDir, customCss, customHtml);

    //Generate the file
    if (!CompleteIndexFile(str, customCss, customHtml, exportDir, includesFiles, additionalSpec))
        return false;

    //Write the index.html file
    if (!fs.WriteToFile(exportDir + "/index.html", str))
    {
        lastError = "Unable to write index file.";
        return false;
    }

    return true;
}

bool Exporter::ExportCordovaConfigFile(const gd::Project & project, gd::String exportDir)
{
    gd::String str = fs.ReadFile("./JsPlatform/Runtime/Cordova/config.xml")
        .FindAndReplace("GDJS_PROJECTNAME", project.GetName())
        .FindAndReplace("GDJS_PACKAGENAME", project.GetPackageName())
        .FindAndReplace("GDJS_ORIENTATION", "default");

    if (!fs.WriteToFile(exportDir + "/config.xml", str))
    {
        lastError = "Unable to write configuration file.";
        return false;
    }

    return true;
}

bool Exporter::CompleteIndexFile(gd::String & str, gd::String customCss, gd::String customHtml, gd::String exportDir, const std::vector<gd::String> & includesFiles, gd::String additionalSpec)
{
    if (additionalSpec.empty()) additionalSpec = "{}";

    gd::String codeFilesIncludes;
    for (std::vector<gd::String>::const_iterator it = includesFiles.begin(); it != includesFiles.end(); ++it)
    {
        if ( !fs.FileExists(exportDir + "/" + *it) )
        {
            std::cout << "Warning: Unable to found " << exportDir+"/"+*it << "." << std::endl;
            continue;
        }

        gd::String relativeFile = exportDir+"/"+*it;
        fs.MakeRelative(relativeFile, exportDir);
        codeFilesIncludes += "\t<script src=\""+relativeFile+"\"></script>\n";
    }

    str = str.FindAndReplace("/* GDJS_CUSTOM_STYLE */", customCss)
        .FindAndReplace("<!-- GDJS_CUSTOM_HTML -->", customHtml)
        .FindAndReplace("<!-- GDJS_CODE_FILES -->", codeFilesIncludes)
        .FindAndReplace("{}/*GDJS_ADDITIONAL_SPEC*/", additionalSpec);

    return true;
}

bool Exporter::ExportEventsCode(gd::Project & project, gd::String outputDir, std::vector<gd::String> & includesFiles)
{
    fs.MkDir(outputDir);

    //First, do not forget common includes ( They must be included before events generated code files ).
    InsertUnique(includesFiles, "libs/pixi.js");
    InsertUnique(includesFiles, "libs/jshashtable.js");
    InsertUnique(includesFiles, "libs/howler.min.js");
    InsertUnique(includesFiles, "gd.js");
    InsertUnique(includesFiles, "libs/hshg.js");
    InsertUnique(includesFiles, "commontools.js");
    InsertUnique(includesFiles, "inputmanager.js");
    InsertUnique(includesFiles, "timemanager.js");
    InsertUnique(includesFiles, "runtimeobject.js");
    InsertUnique(includesFiles, "runtimescene.js");
    InsertUnique(includesFiles, "scenestack.js");
    InsertUnique(includesFiles, "polygon.js");
    InsertUnique(includesFiles, "force.js");
    InsertUnique(includesFiles, "layer.js");
    InsertUnique(includesFiles, "timer.js");
    InsertUnique(includesFiles, "imagemanager.js");
    InsertUnique(includesFiles, "runtimegame.js");
    InsertUnique(includesFiles, "variable.js");
    InsertUnique(includesFiles, "variablescontainer.js");
    InsertUnique(includesFiles, "eventscontext.js");
    InsertUnique(includesFiles, "runtimebehavior.js");
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

    for (std::size_t i = 0;i<project.GetLayoutsCount();++i)
    {
        std::set<gd::String> eventsIncludes;
        gd::Layout & exportedLayout = project.GetLayout(i);
        gd::String eventsOutput = EventsCodeGenerator::GenerateSceneEventsCompleteCode(project, exportedLayout,
            exportedLayout.GetEvents(), eventsIncludes, false /*Export for edittime*/);
        gd::String filename = outputDir+"code"+gd::String::From(i)+".js";

        //Export the code
        if (fs.WriteToFile(filename, eventsOutput))
        {
            for ( std::set<gd::String>::iterator include = eventsIncludes.begin() ; include != eventsIncludes.end(); ++include )
                InsertUnique(includesFiles, *include);

            InsertUnique(includesFiles, filename);
        }
        else {
            lastError = _("Unable to write ") + filename;
            return false;
        }
    }

    return true;
}

bool Exporter::ExportExternalSourceFiles(gd::Project & project, gd::String outputDir, std::vector<gd::String> & includesFiles)
{
    const std::vector < std::shared_ptr<gd::SourceFile> > & allFiles = project.GetAllSourceFiles();
    for (std::size_t i = 0;i<allFiles.size();++i)
    {
        if (allFiles[i] == std::shared_ptr<gd::SourceFile>() ) continue;
        if (allFiles[i]->GetLanguage() != "Javascript" ) continue;

        gd::SourceFile & file = *allFiles[i];

        gd::String filename = file.GetFileName();
        fs.MakeAbsolute(filename, fs.DirNameFrom(project.GetProjectFile()));
        gd::String outFilename = "ext-code"+gd::String::From(i)+".js";
        if (!fs.CopyFile(filename, outputDir+outFilename))
            gd::LogWarning(_("Could not copy external file") + filename);

        InsertUnique(includesFiles, outputDir+outFilename);
    }

    return true;
}

bool Exporter::ExportIncludesAndLibs(std::vector<gd::String> & includesFiles, gd::String exportDir, bool minify)
{
    #if !defined(GD_NO_WX_GUI)
    //Includes files :
    if ( minify )
    {
        gd::String nodeExec = GetNodeExecutablePath();
        if ( nodeExec.empty() || !fs.FileExists(nodeExec) )
        {
            std::cout << "Node.js executable not found." << std::endl;
            gd::LogWarning(_("The exported script could not be minified: Please check that you installed Node.js on your system."));
            minify = false;
        }
        else
        {
            gd::String jsPlatformDir = wxGetCwd()+"/JsPlatform/";
            gd::String cmd = nodeExec+" \""+jsPlatformDir+"Tools/uglify-js/bin/uglifyjs\" ";

            gd::String allJsFiles;
            for ( std::vector<gd::String>::iterator include = includesFiles.begin() ; include != includesFiles.end(); ++include )
            {
                if ( fs.FileExists(jsPlatformDir+"Runtime/"+*include) )
                    allJsFiles += "\""+jsPlatformDir+"Runtime/"+*include+"\" ";
                else if ( fs.FileExists(jsPlatformDir+"Runtime/Extensions/"+*include) )
                    allJsFiles += "\""+jsPlatformDir+"Runtime/Extensions/"+*include+"\" ";
                else if ( fs.FileExists(*include) )
                    allJsFiles += "\""+*include+"\" ";
            }

            cmd += allJsFiles;
            cmd += "-o \""+exportDir+"/code.js\"";

            wxArrayString output;
            wxArrayString errors;
            long res = wxExecute(cmd, output, errors);
            if ( res != 0 )
            {
                std::cout << "Execution of \"UglifyJS\" failed (Command line : " << cmd << ")." << std::endl;
                std::cout << "Output: ";
                for (size_t i = 0;i<output.size();++i)
                    std::cout << output[i] << std::endl;
                for (size_t i = 0;i<errors.size();++i)
                    std::cout << errors[i] << std::endl;

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
        for ( std::vector<gd::String>::iterator include = includesFiles.begin() ; include != includesFiles.end(); ++include )
        {
            if ( fs.FileExists("./JsPlatform/Runtime/"+*include) )
            {
                gd::String path = fs.DirNameFrom(exportDir+"/Extensions/"+*include);
                if ( !fs.DirExists(path) ) fs.MkDir(path);

                fs.CopyFile("./JsPlatform/Runtime/"+*include, exportDir+"/"+*include);
                //Ok, the filename is relative to the export dir.
            }
            else if ( fs.FileExists("./JsPlatform/Runtime/Extensions/"+*include) )
            {
                gd::String path = fs.DirNameFrom(exportDir+"/Extensions/"+*include);
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

void Exporter::ExportResources(gd::AbstractFileSystem & fs, gd::Project & project, gd::String exportDir, wxProgressDialog * progressDialog)
{
    gd::ProjectResourcesCopier::CopyAllResourcesTo(project, fs, exportDir, true, progressDialog, false, false);
}

void Exporter::ShowProjectExportDialog(gd::Project & project)
{
    #if !defined(GD_NO_WX_GUI)
    ProjectExportDialog dialog(NULL, project);
    if ( dialog.ShowModal() != 1 ) return;

    bool exportForCocoonJS = dialog.GetExportType() == ProjectExportDialog::CocoonJS;
    bool exportForCordova = dialog.GetExportType() == ProjectExportDialog::Cordova;

    ExportWholeProject(project, dialog.GetExportDir(), dialog.RequestMinify(),
        exportForCocoonJS, exportForCordova);
    #else
    gd::LogError("BAD USE: Exporter::ShowProjectExportDialog is not available.");
    #endif
}

bool Exporter::ExportWholeProject(gd::Project & project, gd::String exportDir,
    bool minify, bool exportForCocoonJS, bool exportForCordova)
{
    auto exportProject = [this, &project, &minify,
        &exportForCocoonJS, &exportForCordova](gd::String exportDir)
    {
        #if !defined(GD_NO_WX_GUI)
        wxProgressDialog progressDialog(_("Export in progress ( 1/2 )"), _("Exporting the project..."));
        #endif

        //Prepare the export directory
        fs.MkDir(exportDir);
        fs.ClearDir(exportDir);
        fs.MkDir(exportDir+"/libs");
        fs.MkDir(exportDir+"/Extensions");
        std::vector<gd::String> includesFiles;

        if (exportForCocoonJS)
        {
            fs.MkDir(exportDir+"/libs/CocoonJS");
            includesFiles.push_back("libs/CocoonJS/cocoon.min.js");
        }

        gd::Project exportedProject = project;

        //Export the resources (before generating events as some resources filenames may be updated)
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
            gd::LogError(_("Error during exporting! Unable to export events:\n")+lastError);
            return false;
        }

        //Export source files
        if ( !ExportExternalSourceFiles(exportedProject, fs.GetTempDir()+"/GDTemporaries/JSCodeTemp/", includesFiles) )
        {
            gd::LogError(_("Error during exporting! Unable to export source files:\n")+lastError);
            return false;
        }

        #if !defined(GD_NO_WX_GUI)
        progressDialog.Update(60, _("Preparing the project..."));
        #endif

        //Strip the project (*after* generating events as the events may use stripped things like objects groups...)...
        gd::ProjectStripper::StripProject(exportedProject);

        #if !defined(GD_NO_WX_GUI)
        progressDialog.Update(70, _("Exporting files..."));
        #endif

        //...and export it
        ExportToJSON(fs, exportedProject, fs.GetTempDir() + "/GDTemporaries/JSCodeTemp/data.js",
                     "gdjs.projectData");
        includesFiles.push_back(fs.GetTempDir()+"/GDTemporaries/JSCodeTemp/data.js");

        #if !defined(GD_NO_WX_GUI)
        progressDialog.Update(80, minify ? _("Exporting files and minifying them...") : _("Exporting files..."));
        #endif

        //Copy all dependencies and the index (or metadata) file.
        gd::String additionalSpec = exportForCocoonJS ? "{forceFullscreen:true}" : "";
        ExportIncludesAndLibs(includesFiles, exportDir, minify);

        gd::String source = exportForCordova ?
            "./JsPlatform/Runtime/Cordova/www/index.html" :
            "./JsPlatform/Runtime/index.html";

        if (!ExportIndexFile(source, exportDir, includesFiles, additionalSpec))
        {
            gd::LogError(_("Error during export:\n") + lastError);
            return false;
        }

        //Exporting for online upload requires to zip the whole game.
        if (exportForCocoonJS)
        {
            #if !defined(GD_NO_WX_GUI)
            progressDialog.Update(90, _("Creating the zip file..."));

            //Getting all the files to includes in the directory
            wxArrayString files;
            wxDir::GetAllFiles(exportDir, &files);

            wxString zipTempName = fs.GetTempDir()+"/GDTemporaries/zipped_"+gd::String::From(&project)+".zip";
            wxFFileOutputStream out(zipTempName);
            wxZipOutputStream zip(out);
            for(std::size_t i = 0; i < files.size(); ++i)
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
                fs.CopyFile(zipTempName, exportDir+"/packaged_game.zip");
                wxRemoveFile(zipTempName);
            }
            #else
            gd::LogError("BAD USE: Trying to export to a zip file, but this feature is not available when wxWidgets support is disabled.");
            #endif
        }

        return true;
    };

    if (exportForCordova)
    {
        //Prepare the export directory
        fs.MkDir(exportDir);
        if (!ExportCordovaConfigFile(project, exportDir))
            return false;

        if (!exportProject(exportDir + "/www"))
            return false;
    } else {
        if (!exportProject(exportDir))
            return false;
    }

    //Finished!
    #if !defined(GD_NO_WX_GUI)
    if ( exportForCocoonJS )
    {
        CocoonJSUploadDialog uploadDialog(NULL, exportDir+wxString(wxFileName::GetPathSeparator())+"packaged_game.zip");
        uploadDialog.ShowModal();
    }
    else if ( exportForCordova )
    {
        CordovaPackageDialog packageDialog(NULL, exportDir);
        packageDialog.ShowModal();
    }
    else
    {
        if ( wxMessageBox(_("Compilation achieved. Do you want to open the folder where the project has been compiled\?"),
                          _("Compilation finished"), wxYES_NO) == wxYES )
        {
            gd::ShowFolder(exportDir);
        }
    }
    #endif

    return true;
}

gd::String Exporter::GetProjectExportButtonLabel()
{
    return _("Export to the web");
}

#if !defined(GD_NO_WX_GUI)
gd::String Exporter::GetNodeExecutablePath()
{
    std::vector<gd::String> guessPaths;
    wxString userPath;
    if ( wxConfigBase::Get()->Read("Paths/Node" , &userPath) && !userPath.empty() )
        guessPaths.push_back(userPath);
    else
    {
        //Try some common paths.
        #if defined(WINDOWS)
        guessPaths.push_back("C:/Program Files/nodejs/node.exe");
        guessPaths.push_back("C:/Program Files (x86)/nodejs/node.exe");
        #elif defined(LINUX) || defined(MACOS)
        guessPaths.push_back("/usr/bin/env/nodejs");
        guessPaths.push_back("/usr/bin/nodejs");
        guessPaths.push_back("/usr/local/bin/nodejs");
        guessPaths.push_back("/usr/bin/env/node");
        guessPaths.push_back("/usr/bin/node");
        guessPaths.push_back("/usr/local/bin/node");
        #else
            #warning Please complete this so as to return a path to the Node executable.
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
