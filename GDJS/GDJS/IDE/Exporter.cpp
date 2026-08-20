#include "GDJS/IDE/Exporter.h"
#include <algorithm>
#include <fstream>
#include <sstream>
#include <streambuf>
#include <string>
#include <unordered_set>
#include "GDCore/CommonTools.h"
#include "GDCore/Events/CodeGeneration/DiagnosticReport.h"
#include "GDCore/Extensions/Metadata/InGameEditorResourceMetadata.h"
#include "GDCore/IDE/AbstractFileSystem.h"
#include "GDCore/IDE/Events/UsedExtensionsFinder.h"
#include "GDCore/IDE/Project/ProjectResourcesCopier.h"
#include "GDCore/IDE/Project/SceneResourcesFinder.h"
#include "GDCore/IDE/ProjectStripper.h"
#include "GDCore/Project/EventsBasedObject.h"
#include "GDCore/Project/EventsBasedObjectVariant.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/Project/ExternalLayout.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/Log.h"
#include "GDJS/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDJS/IDE/ExporterHelper.h"

#undef CopyFile // Disable an annoying macro

namespace gdjs {

// Modernized using std::unordered_set for O(1) deduplication instead of O(N) std::find
static void InsertUnique(std::vector<gd::String> &container, std::unordered_set<gd::String> &seen, const gd::String &str) {
    if (seen.insert(str).second) {
        container.push_back(str);
    }
}

Exporter::Exporter(gd::AbstractFileSystem &fileSystem, const gd::String &gdjsRoot_) 
    : fs(fileSystem), gdjsRoot(gdjsRoot_) {
    SetCodeOutputDirectory(fs.GetTempDir() + "/GDTemporaries/JSCodeTemp");
}

Exporter::~Exporter() = default;

bool Exporter::ExportProjectForPixiPreview(const PreviewExportOptions &options) {
    ExporterHelper helper(fs, gdjsRoot, codeOutputDir);
    return helper.ExportProjectForPixiPreview(options, includesFiles);
}

bool Exporter::ExportWholePixiProject(const ExportOptions &options) {
    ExporterHelper helper(fs, gdjsRoot, codeOutputDir);
    gd::Project exportedProject = options.project;
    
    auto usedExtensionsResult = gd::UsedExtensionsFinder::ScanProject(options.project);
    const auto &usedExtensions = usedExtensionsResult.GetUsedExtensions();

    auto exportProject = [this, &exportedProject, &options, &helper, &usedExtensionsResult](const gd::String &exportDir) {
        auto &wholeProjectDiagnosticReport = options.project.GetWholeProjectDiagnosticReport();
        wholeProjectDiagnosticReport.Clear();

        // Use project properties fallback to set empty properties
        if (exportedProject.GetAuthorIds().empty() && !options.fallbackAuthorId.empty()) {
            exportedProject.GetAuthorIds().push_back(options.fallbackAuthorId);
        }
        if (exportedProject.GetAuthorUsernames().empty() && !options.fallbackAuthorUsername.empty()) {
            exportedProject.GetAuthorUsernames().push_back(options.fallbackAuthorUsername);
        }

        // Prepare the export directory
        fs.MkDir(exportDir);
        includesFiles.clear();
        std::vector<gd::String> resourcesFiles;
        
        // Track unique elements efficiently
        std::unordered_set<gd::String> seenIncludes;
        std::unordered_set<gd::String> seenResources;

        // Export the resources (before generating events as some resource filenames may be updated)
        helper.ExportResources(fs, exportedProject, exportDir);

        // Compatibility with GD <= 5.0-beta56
        helper.AddDeprecatedFontFilesToFontResources(fs, exportedProject.GetResourcesManager(), exportDir);

        // Export engine libraries
        helper.AddLibsInclude(
            /*pixiRenderers=*/true,
            usedExtensionsResult.Has3DObjects(),
            /*isInGameEditor=*/false,
            /*includeWebsocketDebuggerClient=*/false,
            /*includeWindowMessageDebuggerClient=*/false,
            /*includeMinimalDebuggerClient=*/false,
            /*includeCaptureManager=*/false,
            /*includeInAppTutorialMessage=*/false,
            exportedProject.GetLoadingScreen().GetGDevelopLogoStyle(),
            includesFiles
        );

        // Seed seenIncludes with what AddLibsInclude just populated
        for (const auto &file : includesFiles) {
            seenIncludes.insert(file);
        }

        // Export files for free functions, objects, and behaviors using efficient unique inserts
        for (const auto &includeFile : usedExtensionsResult.GetUsedIncludeFiles()) {
            InsertUnique(includesFiles, seenIncludes, includeFile);
        }
        for (const auto &requiredFile : usedExtensionsResult.GetUsedRequiredFiles()) {
            InsertUnique(resourcesFiles, seenResources, requiredFile);
        }

        // Export effects (after engine libraries as they auto-register themselves to the engine)
        helper.ExportEffectIncludes(exportedProject, includesFiles);

        // Export events
        if (!helper.ExportScenesEventsCode(exportedProject, codeOutputDir, includesFiles, wholeProjectDiagnosticReport, false)) {
            gd::LogError(_("Error during exporting! Unable to export events:\n") + lastError);
            return false;
        }

        // ...and export data configuration
        gd::SerializerElement noRuntimeGameOptions;
        std::vector<gd::InGameEditorResourceMetadata> noInGameEditorResources;
        const gd::String dataJsPath = codeOutputDir + "/data.js";
        
        helper.ExportProjectData(fs, exportedProject, dataJsPath, noRuntimeGameOptions, false, noInGameEditorResources);
        
        includesFiles.push_back(dataJsPath);
        helper.ExportIncludesAndLibs(includesFiles, exportDir, false);
        helper.ExportIncludesAndLibs(resourcesFiles, exportDir, false);

        gd::String source = gdjsRoot + "/Runtime/index.html";
        if (options.target == "cordova") {
            source = gdjsRoot + "/Runtime/Cordova/www/index.html";
        } else if (options.target == "facebookInstantGames") {
            source = gdjsRoot + "/Runtime/FacebookInstantGames/index.html";
        }

        if (!helper.ExportIndexFile(exportedProject, source, exportDir, includesFiles, usedExtensionsResult.GetUsedSourceFiles(), /*nonRuntimeScriptsCacheBurst=*/0, "")) {
            gd::LogError(_("Error during export:\n") + lastError);
            return false;
        }

        return true;
    };

    // Target deployment dispatching
    if (options.target == "cordova") {
        fs.MkDir(options.exportPath);
        fs.MkDir(options.exportPath + "/www");
        if (!exportProject(options.exportPath + "/www")) return false;
        if (!helper.ExportCordovaFiles(exportedProject, options.exportPath, usedExtensions)) return false;
    } 
    else if (options.target == "electron") {
        fs.MkDir(options.exportPath);
        if (!exportProject(options.exportPath + "/app")) return false;
        if (!helper.ExportElectronFiles(exportedProject, options.exportPath, usedExtensions)) return false;
        if (!helper.ExportBuildResourcesElectronFiles(exportedProject, options.exportPath)) return false;
    } 
    else if (options.target == "facebookInstantGames") {
        if (!exportProject(options.exportPath)) return false;
        if (!helper.ExportFacebookInstantGamesFiles(exportedProject, options.exportPath)) return false;
    } 
    else {
        if (!exportProject(options.exportPath)) return false;
        if (!helper.ExportHtml5Files(exportedProject, options.exportPath)) return false;
    }

    return true;
}

void Exporter::SerializeProjectData(const gd::Project &project, const PreviewExportOptions &options, gd::SerializerElement &projectDataElement) {
    std::vector<gd::InGameEditorResourceMetadata> noInGameEditorResources;
    ExporterHelper::SerializeProjectData(fs, project, options, projectDataElement, noInGameEditorResources);
}

void Exporter::SerializeRuntimeGameOptions(const PreviewExportOptions &options, gd::SerializerElement &runtimeGameOptionsElement) {
    ExporterHelper::SerializeRuntimeGameOptions(fs, gdjsRoot, options, includesFiles, runtimeGameOptionsElement);
}

} // namespace gdjs
