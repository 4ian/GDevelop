#if defined(GD_IDE_ONLY)
#if !defined(GD_NO_WX_GUI)
#include <wx/filename.h>
#include <wx/dir.h>
#include <wx/dirdlg.h>
#include <wx/msgdlg.h>
#include <wx/config.h>
#include <wx/progdlg.h>
#include <wx/zipstrm.h>
#include <wx/wfstream.h>
#endif
#include "GDCore/IDE/AbstractFileSystem.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/Log.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/IDE/SceneNameMangler.h"
#include "AndroidExporter.h"
#include "GDCpp/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCpp/Extensions/CppPlatform.h"
#include "GDCpp/IDE/DependenciesAnalyzer.h"
#include "GDCpp/IDE/Dialogs/AndroidExportDialog.h"
#include "GDCore/IDE/ProjectStripper.h"
#include "GDCore/IDE/Project/ProjectResourcesCopier.h"
#include "GDCore/Tools/HelpFileAccess.h"

void AndroidExporter::ShowProjectExportDialog(gd::Project & project)
{
#if !defined(GD_NO_WX_GUI)
    AndroidExportDialog dialog(nullptr);
    if(dialog.ShowModal() != wxID_OK)
        return;

    ExportWholeProject(project, dialog.GetExportPath());

    wxMessageDialog messageDialog(nullptr, _("The project was exported to \"") + dialog.GetExportPath() + _("\".\nFollow the instructions on the wiki to know how to build the android package from the exported files."), _("Android export"), wxOK|wxCENTRE|wxHELP);

#else
    gd::LogError("BAD USE: Tried to call AndroidExporter::ShowProjectExportDialog with support for wxWidgets disabled!");
#endif
}

bool AndroidExporter::ExportWholeProject(gd::Project & project, gd::String exportDir)
{
    gd::Project exportedProject = project;

    #if !defined(GD_NO_WX_GUI)
    wxProgressDialog progressDialog(_("Export in progress"), _("Exporting the project..."));
    #endif

    //Prepare export directory
    gd::String assetsDir = exportDir + "/assets";
    fs.MkDir(exportDir);
    fs.MkDir(assetsDir);
    fs.CopyDir(GetAndroidProjectPath(), exportDir);
    fs.CopyDir(GetSourcesPath() + "/GDCpp", exportDir + "/jni/GDCpp");
    fs.CopyDir(GetSourcesPath() + "/Core", exportDir + "/jni/Core");
    fs.CopyDir(GetSourcesPath() + "/Extensions", exportDir + "/jni/Extensions");

    //Export the resources (before generating events as some resources filenames may be updated)
    #if !defined(GD_NO_WX_GUI)
    ExportResources(fs, exportedProject, assetsDir, &progressDialog);
    #else
    ExportResources(fs, exportedProject, assetsDir, NULL);
    #endif

    //Generate events code
    if ( !ExportEventsCode(exportedProject, exportDir) )
        return false;

    //Export source files
    /*if ( !ExportExternalSourceFiles(exportedProject, fs.GetTempDir()+"/GDTemporaries/JSCodeTemp/", includesFiles) )
    {
        gd::LogError(_("Error during exporting! Unable to export source files:\n")+lastError);
        return false;
    }*/

    ExportMainFile(exportedProject, exportDir);

    //Strip the project (*after* generating events as the events may use stripped things (objects groups...))
    gd::ProjectStripper::StripProject(exportedProject);

    //Export the project file
    gd::SerializerElement rootElement;
    exportedProject.SerializeTo(rootElement);
    if (!fs.WriteToFile(exportDir + "/assets/gd-project.json", gd::Serializer::ToJSON(rootElement)))
        return false;

    return true;
}

void AndroidExporter::ExportResources(gd::AbstractFileSystem & fs, gd::Project & project, gd::String exportDir, wxProgressDialog * progressDialog)
{
    gd::ProjectResourcesCopier::CopyAllResourcesTo(project, fs, exportDir, true, progressDialog, false, false);
}

bool AndroidExporter::ExportMainFile(gd::Project & project, gd::String outputDir)
{
    gd::String layoutFunctionDeclarations;
    gd::String functionAssignmentCode;

    for (std::size_t i = 0;i<project.GetLayoutsCount();++i)
    {
        auto layout = project.GetLayout(i);
        gd::String layoutFunctionName = "GDSceneEvents" +
            gd::SceneNameMangler::GetMangledSceneName(layout.GetName());

        gd::EventsCodeGenerator codeGenerator(project, layout, CppPlatform::Get());
        layoutFunctionDeclarations += "extern \"C\" int  " + layoutFunctionName + "(RuntimeContext * runtimeContext);\n";
        functionAssignmentCode += "\t\tif (scene->GetName() == \"" +
            codeGenerator.ConvertToString(layout.GetName()) +
            "\") function = &" + layoutFunctionName + ";\n";
    }

    gd::String mainFile = fs.ReadFile(GetAndroidProjectPath() + "/jni/main.cpp")
        .FindAndReplace("/* GDCPP_EVENTS_DECLARATIONS */", layoutFunctionDeclarations)
        .FindAndReplace("/* GDCPP_EVENTS_ASSIGNMENTS */", functionAssignmentCode);

    return fs.WriteToFile(outputDir + "/jni/main.cpp", mainFile);
}

bool AndroidExporter::ExportEventsCode(gd::Project & project, gd::String outputDir)
{
    for (std::size_t i = 0;i<project.GetLayoutsCount();++i)
    {
        gd::Layout & exportedLayout = project.GetLayout(i);
        gd::String eventsOutput = EventsCodeGenerator::GenerateSceneEventsCompleteCode(project, exportedLayout,
            exportedLayout.GetEvents(), true);

        gd::String filename = "scene" + gd::String::From(i) + ".cpp";

        if (!fs.WriteToFile(outputDir + "/jni/" + filename, eventsOutput))
            return false;
    }

    for (std::size_t i = 0;i<project.GetExternalEventsCount();++i)
    {
        gd::ExternalEvents & externalEvents = project.GetExternalEvents(i);

        DependenciesAnalyzer analyzer(project, externalEvents);
        if (!analyzer.ExternalEventsCanBeCompiledForAScene().empty())
        {
            gd::String eventsOutput = EventsCodeGenerator::GenerateExternalEventsCompleteCode(project,
                externalEvents, true);

            gd::String filename = "externalEvents" + gd::String::From(i) + ".cpp";

            if (!fs.WriteToFile(outputDir + "/jni/" + filename, eventsOutput))
                return false;
        }
    }

    return true;
}

#endif
