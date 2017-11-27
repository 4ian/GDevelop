/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
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
#include "GDCore/IDE/wxTools/ShowFolder.h"
#include "GDCore/IDE/Project/ProjectResourcesCopier.h"
#include "GDCore/IDE/ProjectStripper.h"
#include "GDCore/CommonTools.h"
#include "GDJS/IDE/Exporter.h"
#include "GDJS/IDE/ExporterHelper.h"
#include "GDJS/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDJS/IDE/Dialogs/ProjectExportDialog.h"
#include "GDJS/IDE/Dialogs/CocoonJSUploadDialog.h"
#include "GDJS/IDE/Dialogs/CordovaPackageDialog.h"
#undef CopyFile //Disable an annoying macro

namespace gdjs
{

Exporter::Exporter(gd::AbstractFileSystem & fileSystem, gd::String gdjsRoot_) :
    fs(fileSystem),
    gdjsRoot(gdjsRoot_)
{
    SetCodeOutputDirectory(fs.GetTempDir() + "/GDTemporaries/JSCodeTemp");
}

Exporter::~Exporter()
{
}

bool Exporter::ExportLayoutForPixiPreview(gd::Project & project, gd::Layout & layout, gd::String exportDir)
{
    ExporterHelper helper(fs, gdjsRoot, codeOutputDir);
    return helper.ExportLayoutForPixiPreview(project, layout, exportDir, "");
}

bool Exporter::ExportExternalLayoutForPixiPreview(gd::Project & project, gd::Layout & layout,
   gd::ExternalLayout & externalLayout, gd::String exportDir)
{
    gd::SerializerElement options;
    options.AddChild("injectExternalLayout").SetValue(externalLayout.GetName());

    ExporterHelper helper(fs, gdjsRoot, codeOutputDir);
    return helper.ExportLayoutForPixiPreview(project, layout, exportDir,
        gd::Serializer::ToJSON(options)
    );
}

void Exporter::ShowProjectExportDialog(gd::Project & project)
{
    #if !defined(GD_NO_WX_GUI)
    ProjectExportDialog dialog(NULL, project);
    if ( dialog.ShowModal() != 1 ) return;

    if (dialog.GetExportType() == ProjectExportDialog::Cocos2d)
    {
        ExportWholeCocos2dProject(project, dialog.IsDebugMode(), dialog.GetExportDir());
    }
    else
    {
        bool exportForCordova = dialog.GetExportType() == ProjectExportDialog::PixiCordova;
        ExportWholePixiProject(project, dialog.GetExportDir(), dialog.RequestMinify(),
            exportForCordova);
    }

    #else
    gd::LogError("BAD USE: Exporter::ShowProjectExportDialog is not available.");
    #endif
}

bool Exporter::ExportWholePixiProject(gd::Project & project, gd::String exportDir,
    bool minify, bool exportForCordova)
{
    ExporterHelper helper(fs, gdjsRoot, codeOutputDir);

    auto exportProject = [this, &project, &minify,
        &exportForCordova, &helper](gd::String exportDir)
    {
        wxProgressDialog * progressDialogPtr = NULL;
        #if !defined(GD_NO_WX_GUI)
        wxProgressDialog progressDialog(_("Export in progress ( 1/2 )"), _("Exporting the project..."));
        progressDialogPtr = &progressDialog;
        #endif

        //Prepare the export directory
        fs.MkDir(exportDir);
        std::vector<gd::String> includesFiles;

        gd::Project exportedProject = project;

        //Export the resources (before generating events as some resources filenames may be updated)
        helper.ExportResources(fs, exportedProject, exportDir, progressDialogPtr);

        #if !defined(GD_NO_WX_GUI)
        progressDialog.SetTitle(_("Export in progress ( 2/2 )"));
        progressDialog.Update(50, _("Exporting events..."));
        #endif

        //Export events
        if ( !helper.ExportEventsCode(exportedProject, codeOutputDir, includesFiles) )
        {
            gd::LogError(_("Error during exporting! Unable to export events:\n")+lastError);
            return false;
        }
        helper.AddLibsInclude(true, false, includesFiles);

        //Export source files
        if ( !helper.ExportExternalSourceFiles(exportedProject, codeOutputDir, includesFiles) )
        {
            gd::LogError(_("Error during exporting! Unable to export source files:\n")+lastError);
            return false;
        }

        //Strip the project (*after* generating events as the events may use stripped things like objects groups...)...
        gd::ProjectStripper::StripProjectForExport(exportedProject);

        //...and export it
        helper.ExportToJSON(fs, exportedProject, codeOutputDir + "/data.js", "gdjs.projectData");
        includesFiles.push_back(codeOutputDir + "/data.js");

        #if !defined(GD_NO_WX_GUI)
        progressDialog.Update(80, minify ? _("Exporting files and minifying them...") : _("Exporting files..."));
        #endif

        //Copy all dependencies and the index (or metadata) file.
        helper.RemoveIncludes(false, true, includesFiles);
        helper.ExportIncludesAndLibs(includesFiles, exportDir, minify);

        gd::String source = exportForCordova ?
            (gdjsRoot + "/Runtime/Cordova/www/index.html") :
            (gdjsRoot + "/Runtime/index.html");

        if (!helper.ExportPixiIndexFile(source, exportDir, includesFiles, ""))
        {
            gd::LogError(_("Error during export:\n") + lastError);
            return false;
        }

        return true;
    };

    if (exportForCordova)
    {
        //Prepare the export directory
        fs.MkDir(exportDir);
        if (!helper.ExportCordovaConfigFile(project, exportDir))
            return false;

        if (!exportProject(exportDir + "/www"))
            return false;
    } else {
        if (!exportProject(exportDir))
            return false;
    }

    //Finished!
    #if !defined(GD_NO_WX_GUI)
    if ( exportForCordova )
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

bool Exporter::ExportWholeCocos2dProject(gd::Project & project, bool debugMode, gd::String exportDir)
{
    ExporterHelper helper(fs, gdjsRoot, codeOutputDir);

    wxProgressDialog * progressDialogPtr = NULL;
    #if !defined(GD_NO_WX_GUI)
    wxProgressDialog progressDialog(_("Export in progress ( 1/2 )"), _("Exporting the project..."));
    progressDialogPtr = &progressDialog;
    #endif

    //Prepare the export directory
    fs.MkDir(exportDir);
    std::vector<gd::String> includesFiles;

    gd::Project exportedProject = project;

    //Export the resources (before generating events as some resources filenames may be updated)
    helper.ExportResources(fs, exportedProject, exportDir + "/res", progressDialogPtr);

    #if !defined(GD_NO_WX_GUI)
    progressDialog.SetTitle(_("Export in progress ( 2/2 )"));
    progressDialog.Update(50, _("Exporting events..."));
    #endif

    //Export events
    if ( !helper.ExportEventsCode(exportedProject, codeOutputDir, includesFiles) )
    {
        gd::LogError(_("Error during exporting! Unable to export events:\n")+lastError);
        return false;
    }
    helper.AddLibsInclude(false, true, includesFiles);

    //Export source files
    if ( !helper.ExportExternalSourceFiles(exportedProject, codeOutputDir, includesFiles) )
    {
        gd::LogError(_("Error during exporting! Unable to export source files:\n")+lastError);
        return false;
    }

    //Strip the project (*after* generating events as the events may use stripped things like objects groups...)...
    gd::ProjectStripper::StripProjectForExport(exportedProject);

    //...and export it
    helper.ExportToJSON(fs, exportedProject, codeOutputDir + "/data.js", "gdjs.projectData");
    includesFiles.push_back(codeOutputDir + "/data.js");

    #if !defined(GD_NO_WX_GUI)
    progressDialog.Update(80, _("Exporting files..."));
    #endif

    //Copy all dependencies and the index (or metadata) file.
    helper.RemoveIncludes(true, false, includesFiles);
    helper.ExportIncludesAndLibs(includesFiles, exportDir + "/src", false);

    if (!helper.ExportCocos2dFiles(project, exportDir, debugMode, includesFiles))
    {
        gd::LogError(_("Error during export:\n") + lastError);
        return false;
    }

    //Finished!
    #if !defined(GD_NO_WX_GUI)
    //TODO: Factor/update message?
    if ( wxMessageBox(_("Compilation achieved. Do you want to open the folder where the project has been compiled\?"),
                      _("Compilation finished"), wxYES_NO) == wxYES )
    {
        gd::ShowFolder(exportDir);
    }
    #endif

    return true;
}

gd::String Exporter::GetProjectExportButtonLabel()
{
    return _("Export to the web");
}

}
