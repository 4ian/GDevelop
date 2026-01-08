/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDJS/IDE/ExporterHelper.h"

#if defined(EMSCRIPTEN)
#include <emscripten.h>
#endif
#include <algorithm>
#include <array>
#include <fstream>
#include <functional>
#include <sstream>
#include <streambuf>
#include <string>

#include "GDCore/CommonTools.h"
#include "GDCore/Events/CodeGeneration/DiagnosticReport.h"
#include "GDCore/Events/CodeGeneration/EffectsCodeGenerator.h"
#include "GDCore/Extensions/Metadata/DependencyMetadata.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Metadata/InGameEditorResourceMetadata.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/IDE/AbstractFileSystem.h"
#include "GDCore/IDE/CaptureOptions.h"
#include "GDCore/IDE/Events/UsedExtensionsFinder.h"
#include "GDCore/IDE/ExportedDependencyResolver.h"
#include "GDCore/IDE/Project/ProjectResourcesCopier.h"
#include "GDCore/IDE/Project/ResourcesMergingHelper.h"
#include "GDCore/IDE/Project/SceneResourcesFinder.h"
#include "GDCore/IDE/ProjectStripper.h"
#include "GDCore/IDE/ResourceExposer.h"
#include "GDCore/IDE/SceneNameMangler.h"
#include "GDCore/Project/EventsBasedObject.h"
#include "GDCore/Project/EventsBasedObjectVariant.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/Project/ExternalLayout.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/Log.h"
#include "GDJS/Events/CodeGeneration/LayoutCodeGenerator.h"
#include "GDJS/Extensions/JsPlatform.h"
#undef CopyFile  // Disable an annoying macro

namespace {
double GetTimeNow() {
#if defined(EMSCRIPTEN)
  double currentTime = emscripten_get_now();
  return currentTime;
#else
  return 0;
#endif
}
double GetTimeSpent(double previousTime) { return GetTimeNow() - previousTime; }
double LogTimeSpent(const gd::String &name, double previousTime) {
  gd::LogStatus(name + " took " + gd::String::From(GetTimeSpent(previousTime)) +
                "ms");
  return GetTimeNow();
}
}  // namespace

namespace gdjs {

static void InsertUnique(std::vector<gd::String> &container, gd::String str) {
  if (std::find(container.begin(), container.end(), str) == container.end())
    container.push_back(str);
}

static void InsertUniqueFirst(std::vector<gd::String> &container, gd::String str) {
  if (std::find(container.begin(), container.end(), str) == container.end())
    container.insert(container.begin(), str);
}

static gd::String CleanProjectName(gd::String projectName) {
  gd::String partiallyCleanedProjectName = projectName;

  static const gd::String forbiddenFileNameCharacters =
      "\\/:*?\"<>|";  // See
                      // https://learn.microsoft.com/en-us/windows/win32/fileio/naming-a-file

  for (size_t i = 0; i < partiallyCleanedProjectName.size();) {
    // Delete all characters that are not allowed in a filename
    if (forbiddenFileNameCharacters.find(partiallyCleanedProjectName[i]) !=
        gd::String::npos) {
      partiallyCleanedProjectName.erase(i, 1);
    } else {
      i++;
    }
  }

  if (partiallyCleanedProjectName.empty())
    partiallyCleanedProjectName = "Project";

  return partiallyCleanedProjectName;
}

ExporterHelper::ExporterHelper(gd::AbstractFileSystem &fileSystem,
                               gd::String gdjsRoot_,
                               gd::String codeOutputDir_)
    : fs(fileSystem), gdjsRoot(gdjsRoot_), codeOutputDir(codeOutputDir_) {};

bool ExporterHelper::ExportProjectForPixiPreview(
    const PreviewExportOptions &options,
    std::vector<gd::String> &includesFiles) {

  if (options.isInGameEdition && !options.shouldReloadProjectData &&
      !options.shouldReloadLibraries && !options.shouldGenerateScenesEventsCode &&
      !options.shouldClearExportFolder) {
    gd::LogStatus("Skip project export entirely");
    return "";
  }

  double previousTime = GetTimeNow();
  fs.MkDir(options.exportPath);
  if (options.shouldClearExportFolder) {
    fs.ClearDir(options.exportPath);
  }
  includesFiles.clear();
  std::vector<gd::String> resourcesFiles;

  std::vector<gd::InGameEditorResourceMetadata> inGameEditorResources;

  // TODO Try to remove side effects to avoid the copy
  // that destroys the AST in cache.
  gd::Project exportedProject = options.project;
  const gd::Project &immutableProject = options.project;
  previousTime = LogTimeSpent("Project cloning", previousTime);

  if (options.isInGameEdition) {
    if (options.shouldReloadProjectData ||
        options.shouldGenerateScenesEventsCode ||
        options.shouldClearExportFolder) {
      auto projectDirectory = fs.DirNameFrom(exportedProject.GetProjectFile());
      gd::ResourcesMergingHelper resourcesMergingHelper(
          exportedProject.GetResourcesManager(), fs);
      resourcesMergingHelper.SetBaseDirectory(projectDirectory);
      resourcesMergingHelper.SetShouldUseOriginalAbsoluteFilenames();
      gd::ResourceExposer::ExposeWholeProjectResources(exportedProject,
                                                        resourcesMergingHelper);

      previousTime = LogTimeSpent("Resource path resolving", previousTime);
    }
    gd::LogStatus("Resource export is skipped");
  } else {
    // Export resources (*before* generating events as some resources filenames
    // may be updated)
    ExportResources(fs, exportedProject, options.exportPath);

    previousTime = LogTimeSpent("Resource export", previousTime);
  }

  if (options.shouldReloadProjectData ||
      options.shouldGenerateScenesEventsCode ||
      options.shouldClearExportFolder) {
    // Compatibility with GD <= 5.0-beta56
    // Stay compatible with text objects declaring their font as just a filename
    // without a font resource - by manually adding these resources.
    AddDeprecatedFontFilesToFontResources(
        fs, exportedProject.GetResourcesManager(), options.exportPath);
    // end of compatibility code
  }

  std::vector<gd::SourceFileMetadata> noUsedSourceFiles;
  std::vector<gd::SourceFileMetadata> &usedSourceFiles = noUsedSourceFiles;
  if (options.shouldReloadLibraries || options.shouldClearExportFolder) {
    auto usedExtensionsResult =
        gd::UsedExtensionsFinder::ScanProject(exportedProject);
    usedSourceFiles = usedExtensionsResult.GetUsedSourceFiles();

    // Export engine libraries
    AddLibsInclude(/*pixiRenderers=*/true,
                  /*pixiInThreeRenderers=*/
                  usedExtensionsResult.Has3DObjects(),
                  /*isInGameEdition=*/
                  options.isInGameEdition,
                  /*includeWebsocketDebuggerClient=*/
                  !options.websocketDebuggerServerAddress.empty(),
                  /*includeWindowMessageDebuggerClient=*/
                  options.useWindowMessageDebuggerClient,
                  /*includeMinimalDebuggerClient=*/
                  options.useMinimalDebuggerClient,
                  /*includeCaptureManager=*/
                  !options.captureOptions.IsEmpty(),
                  /*includeInAppTutorialMessage*/
                  !options.inAppTutorialMessageInPreview.empty(),
                  immutableProject.GetLoadingScreen().GetGDevelopLogoStyle(),
                  includesFiles);

    // Export files for free function, object and behaviors
    for (const auto &includeFile : usedExtensionsResult.GetUsedIncludeFiles()) {
      InsertUnique(includesFiles, includeFile);
    }
    for (const auto &requiredFile : usedExtensionsResult.GetUsedRequiredFiles()) {
      InsertUnique(resourcesFiles, requiredFile);
    }

    if (options.isInGameEdition) {
      // List the in-game editor resources used by the project, so they can
      // be later included in the exported project resources.
      for (const auto &inGameEditorResource : usedExtensionsResult.GetUsedInGameEditorResources()) {
        inGameEditorResources.push_back(inGameEditorResource);

        // Always use absolute paths for in-game editor resources.
        // There are not copied and instead directly refer to the file in the Runtime folder.
        gd::String resourceFile = inGameEditorResource.GetFilePath();
        if (!fs.IsAbsolute(resourceFile)) {
          fs.MakeAbsolute(resourceFile, gdjsRoot + "/Runtime");
        }
        inGameEditorResources.back().SetFilePath(resourceFile);
      }

      // TODO Scan the objects and events of event-based objects
      // (it could be an alternative method ScanProjectAndEventsBasedObjects in
      // UsedExtensionsFinder).
      // This is already done by UsedExtensionsFinder, but maybe it shouldn't.

      // Export all event-based objects because they can be edited even if they
      // are not used yet.
      for (std::size_t e = 0;
           e < exportedProject.GetEventsFunctionsExtensionsCount(); e++) {
        auto &eventsFunctionsExtension =
            exportedProject.GetEventsFunctionsExtension(e);

        for (auto &&eventsBasedObjectUniquePtr :
             eventsFunctionsExtension.GetEventsBasedObjects()
                 .GetInternalVector()) {
          auto eventsBasedObject = eventsBasedObjectUniquePtr.get();

          auto metadata = gd::MetadataProvider::GetExtensionAndObjectMetadata(
              exportedProject.GetCurrentPlatform(),
              gd::PlatformExtension::GetObjectFullType(
                  eventsFunctionsExtension.GetName(),
                  eventsBasedObject->GetName()));
          for (auto &&includeFile : metadata.GetMetadata().includeFiles) {
            InsertUnique(includesFiles, includeFile);
          }
          for (auto &behaviorType :
               metadata.GetMetadata().GetDefaultBehaviors()) {
            auto behaviorMetadata =
                gd::MetadataProvider::GetExtensionAndBehaviorMetadata(
                    exportedProject.GetCurrentPlatform(), behaviorType);
            for (auto &&includeFile :
                 behaviorMetadata.GetMetadata().includeFiles) {
              InsertUnique(includesFiles, includeFile);
            }
          }
        }
      }
    }

    // Export effects (after engine libraries as they auto-register themselves to
    // the engine)
    ExportEffectIncludes(exportedProject, includesFiles);

    previousTime = LogTimeSpent("Include files export", previousTime);
  }
  else {
    gd::LogStatus("Include files export is skipped");
  }

  if (options.shouldGenerateScenesEventsCode) {
    gd::WholeProjectDiagnosticReport &wholeProjectDiagnosticReport =
        options.project.GetWholeProjectDiagnosticReport();
    wholeProjectDiagnosticReport.Clear();

    // Generate events code
    if (!ExportScenesEventsCode(immutableProject,
                          codeOutputDir,
                          includesFiles,
                          wholeProjectDiagnosticReport,
                          true)) {
      return false;
    }
    previousTime = LogTimeSpent("Events code export", previousTime);
  }
  else {
    gd::LogStatus("Events code export is skipped");
  }

  if (options.shouldReloadProjectData || options.shouldClearExportFolder) {

    if (options.fullLoadingScreen) {
      // Use project properties fallback to set empty properties
      if (exportedProject.GetAuthorIds().empty() &&
          !options.fallbackAuthorId.empty()) {
        exportedProject.GetAuthorIds().push_back(options.fallbackAuthorId);
      }
      if (exportedProject.GetAuthorUsernames().empty() &&
          !options.fallbackAuthorUsername.empty()) {
        exportedProject.GetAuthorUsernames().push_back(
            options.fallbackAuthorUsername);
      }
    } else {
      // Most of the time, we skip the logo and minimum duration so that
      // the preview start as soon as possible.
      exportedProject.GetLoadingScreen()
          .ShowGDevelopLogoDuringLoadingScreen(false)
          .SetMinDuration(0);
      exportedProject.GetWatermark().ShowGDevelopWatermark(false);
    }

    gd::SerializerElement runtimeGameOptions;
    ExporterHelper::SerializeRuntimeGameOptions(fs, gdjsRoot, options,
                                                    includesFiles, runtimeGameOptions);
    ExportProjectData(fs, exportedProject, codeOutputDir + "/data.js",
                      runtimeGameOptions, options.isInGameEdition,
                      inGameEditorResources);

    previousTime = LogTimeSpent("Project data export", previousTime);
  }
  else {
    gd::LogStatus("Project data export is skipped");
  }

  if (options.shouldReloadLibraries || options.shouldClearExportFolder) {
    includesFiles.push_back(codeOutputDir + "/data.js");
    // Copy all the dependencies and their source maps
    ExportIncludesAndLibs(includesFiles, options.exportPath, true);
    ExportIncludesAndLibs(resourcesFiles, options.exportPath, true);

    // TODO Build a full includesFiles list without actually doing export or
    // generation.
    if (options.shouldGenerateScenesEventsCode || options.shouldClearExportFolder) {
      // Create the index file
      if (!ExportIndexFile(exportedProject, gdjsRoot + "/Runtime/index.html",
                           options.exportPath, includesFiles, usedSourceFiles,
                           options.nonRuntimeScriptsCacheBurst,
                           "gdjs.runtimeGameOptions")) {
        return false;
      }
    }
    previousTime = LogTimeSpent("Include and libs export", previousTime);
  } else {
    gd::LogStatus("Include and libs export is skipped");
  }

  return true;
}

gd::String ExporterHelper::ExportProjectData(
    gd::AbstractFileSystem &fs, gd::Project &project, gd::String filename,
    const gd::SerializerElement &runtimeGameOptions, bool isInGameEdition,
    const std::vector<gd::InGameEditorResourceMetadata> &inGameEditorResources) {
  fs.MkDir(fs.DirNameFrom(filename));

  gd::SerializerElement projectDataElement;
  ExporterHelper::StripAndSerializeProjectData(project, projectDataElement,
                                                isInGameEdition,
                                                inGameEditorResources);

  // Save the project to JSON
  gd::String output =
      "gdjs.projectData = " + gd::Serializer::ToJSON(projectDataElement) +
      ";\ngdjs.runtimeGameOptions = " + gd::Serializer::ToJSON(runtimeGameOptions) +
      ";\n";

  if (!fs.WriteToFile(filename, output))
    return "Unable to write " + filename;

  return "";
}

void ExporterHelper::SerializeRuntimeGameOptions(
    gd::AbstractFileSystem &fs, const gd::String &gdjsRoot,
    const PreviewExportOptions &options, std::vector<gd::String> &includesFiles,
    gd::SerializerElement &runtimeGameOptions) {
  // Create the setup options passed to the gdjs.RuntimeGame
  runtimeGameOptions.AddChild("isPreview").SetBoolValue(true);

  auto &initialRuntimeGameStatus =
      runtimeGameOptions.AddChild("initialRuntimeGameStatus");
  initialRuntimeGameStatus.AddChild("sceneName")
      .SetStringValue(options.layoutName);
  if (options.isInGameEdition) {
    initialRuntimeGameStatus.AddChild("isInGameEdition").SetBoolValue(true);
    initialRuntimeGameStatus.AddChild("editorId").SetValue(options.editorId);
    if (!options.editorCamera3DCameraMode.empty()) {
      auto &editorCamera3D =
          initialRuntimeGameStatus.AddChild("editorCamera3D");
      editorCamera3D.AddChild("cameraMode").SetStringValue(
          options.editorCamera3DCameraMode);
      editorCamera3D.AddChild("positionX")
          .SetDoubleValue(options.editorCamera3DPositionX);
      editorCamera3D.AddChild("positionY")
          .SetDoubleValue(options.editorCamera3DPositionY);
      editorCamera3D.AddChild("positionZ")
          .SetDoubleValue(options.editorCamera3DPositionZ);
      editorCamera3D.AddChild("rotationAngle")
          .SetDoubleValue(options.editorCamera3DRotationAngle);
      editorCamera3D.AddChild("elevationAngle")
          .SetDoubleValue(options.editorCamera3DElevationAngle);
      editorCamera3D.AddChild("distance")
          .SetDoubleValue(options.editorCamera3DDistance);
    }
  }
  if (!options.externalLayoutName.empty()) {
    initialRuntimeGameStatus.AddChild("injectedExternalLayoutName")
        .SetValue(options.externalLayoutName);

    if (options.isInGameEdition) {
      initialRuntimeGameStatus.AddChild("skipCreatingInstancesFromScene")
          .SetBoolValue(true);
    }
  }
  if (!options.eventsBasedObjectType.empty()) {
    initialRuntimeGameStatus.AddChild("eventsBasedObjectType")
        .SetValue(options.eventsBasedObjectType);
    initialRuntimeGameStatus.AddChild("eventsBasedObjectVariantName")
        .SetValue(options.eventsBasedObjectVariantName);
  }

  if (!options.inGameEditorSettingsJson.empty()) {
    runtimeGameOptions.AddChild("inGameEditorSettings") =
        gd::Serializer::FromJSON(options.inGameEditorSettingsJson);
  }

  runtimeGameOptions.AddChild("shouldReloadLibraries")
      .SetBoolValue(options.shouldReloadLibraries);
  runtimeGameOptions.AddChild("shouldGenerateScenesEventsCode")
      .SetBoolValue(options.shouldGenerateScenesEventsCode);

  runtimeGameOptions.AddChild("nativeMobileApp")
      .SetBoolValue(options.nativeMobileApp);
  runtimeGameOptions.AddChild("websocketDebuggerServerAddress")
      .SetStringValue(options.websocketDebuggerServerAddress);
  runtimeGameOptions.AddChild("websocketDebuggerServerPort")
      .SetStringValue(options.websocketDebuggerServerPort);
  runtimeGameOptions.AddChild("electronRemoteRequirePath")
      .SetStringValue(options.electronRemoteRequirePath);
  if (options.isDevelopmentEnvironment) {
    runtimeGameOptions.AddChild("environment").SetStringValue("dev");
  }
  if (!options.gdevelopResourceToken.empty()) {
    runtimeGameOptions.AddChild("gdevelopResourceToken")
        .SetStringValue(options.gdevelopResourceToken);
  }
  runtimeGameOptions.AddChild("allowAuthenticationUsingIframeForPreview")
      .SetBoolValue(options.allowAuthenticationUsingIframeForPreview);
  if (!options.playerId.empty() && !options.playerToken.empty()) {
    runtimeGameOptions.AddChild("playerUsername")
        .SetStringValue(options.playerUsername);
    runtimeGameOptions.AddChild("playerId").SetStringValue(options.playerId);
    runtimeGameOptions.AddChild("playerToken")
        .SetStringValue(options.playerToken);
  }
  if (!options.inAppTutorialMessageInPreview.empty()) {
    runtimeGameOptions.AddChild("inAppTutorialMessageInPreview")
        .SetStringValue(options.inAppTutorialMessageInPreview);
    runtimeGameOptions.AddChild("inAppTutorialMessagePositionInPreview")
        .SetStringValue(options.inAppTutorialMessagePositionInPreview);
  }
  if (!options.crashReportUploadLevel.empty()) {
    runtimeGameOptions.AddChild("crashReportUploadLevel")
        .SetStringValue(options.crashReportUploadLevel);
  }
  if (!options.previewContext.empty()) {
    runtimeGameOptions.AddChild("previewContext")
        .SetStringValue(options.previewContext);
  }
  runtimeGameOptions.AddChild("gdevelopVersionWithHash")
      .SetStringValue(options.gdevelopVersionWithHash);
  if (!options.projectTemplateSlug.empty()) {
    runtimeGameOptions.AddChild("projectTemplateSlug")
        .SetStringValue(options.projectTemplateSlug);
  }
  if (!options.sourceGameId.empty()) {
    runtimeGameOptions.AddChild("sourceGameId")
        .SetStringValue(options.sourceGameId);
  }

  if (!options.captureOptions.IsEmpty()) {
    auto &captureOptionsElement = runtimeGameOptions.AddChild("captureOptions");
    const auto &screenshots = options.captureOptions.GetScreenshots();
    if (!screenshots.empty()) {
      auto &screenshotsElement = captureOptionsElement.AddChild("screenshots");
      screenshotsElement.ConsiderAsArrayOf("screenshot");
      for (const auto &screenshot : screenshots) {
        screenshotsElement.AddChild("screenshot")
            .SetIntAttribute("delayTimeInSeconds",
                             screenshot.GetDelayTimeInSeconds())
            .SetStringAttribute("signedUrl", screenshot.GetSignedUrl())
            .SetStringAttribute("publicUrl", screenshot.GetPublicUrl());
      }
    }
  }

  // Pass in the options the list of scripts files - useful for hot-reloading.
  // If includeFiles is empty, it means that the include files have not been
  // generated, so do not even add them to the runtime game options, so the
  // hot-reloader will not try to reload them.
  if (!includesFiles.empty()) {
    auto &scriptFilesElement = runtimeGameOptions.AddChild("scriptFiles");
    scriptFilesElement.ConsiderAsArrayOf("scriptFile");

    for (const auto &includeFile : includesFiles) {
      auto hashIt = options.includeFileHashes.find(includeFile);
      gd::String scriptSrc = GetExportedIncludeFilename(fs, gdjsRoot, includeFile);
      scriptFilesElement.AddChild("scriptFile")
          .SetStringAttribute("path", scriptSrc)
          .SetIntAttribute(
              "hash",
              hashIt != options.includeFileHashes.end() ? hashIt->second : 0);
    }
  }
}

void ExporterHelper::AddInGameEditorResources(
    gd::Project &project,
    std::set<gd::String> &projectUsedResources,
    const std::vector<gd::InGameEditorResourceMetadata> &inGameEditorResources) {
  for (const auto &inGameEditorResource : inGameEditorResources) {
    project.GetResourcesManager().AddResource(
        inGameEditorResource.GetResourceName(),
        inGameEditorResource.GetFilePath(),
        inGameEditorResource.GetKind());
    projectUsedResources.insert(inGameEditorResource.GetResourceName());
  }
}

void ExporterHelper::SerializeProjectData(gd::AbstractFileSystem &fs,
                                          const gd::Project &project,
                                          const PreviewExportOptions &options,
                                          gd::SerializerElement &rootElement,
                                          const std::vector<gd::InGameEditorResourceMetadata> &inGameEditorResources) {
  gd::Project clonedProject = project;

  // Replace all resource file paths with the one used in exported projects.
  auto projectDirectory = fs.DirNameFrom(project.GetProjectFile());
  gd::ResourcesMergingHelper resourcesMergingHelper(
      clonedProject.GetResourcesManager(), fs);
  resourcesMergingHelper.SetBaseDirectory(projectDirectory);
  if (options.isInGameEdition) {
    resourcesMergingHelper.SetShouldUseOriginalAbsoluteFilenames();
  } else {
    resourcesMergingHelper.PreserveDirectoriesStructure(false);
    resourcesMergingHelper.PreserveAbsoluteFilenames(false);
  }

  if (!options.fullLoadingScreen) {
    // Most of the time, we skip the logo and minimum duration so that
    // the preview start as soon as possible.
    clonedProject.GetLoadingScreen()
        .ShowGDevelopLogoDuringLoadingScreen(false)
        .SetMinDuration(0);
    clonedProject.GetWatermark().ShowGDevelopWatermark(false);
  }

  gd::ResourceExposer::ExposeWholeProjectResources(clonedProject,
                                                   resourcesMergingHelper);

  ExporterHelper::StripAndSerializeProjectData(clonedProject, rootElement,
                                                options.isInGameEdition,
                                                inGameEditorResources);
}

void ExporterHelper::StripAndSerializeProjectData(
    gd::Project &project, gd::SerializerElement &rootElement,
    bool isInGameEdition,
    const std::vector<gd::InGameEditorResourceMetadata> &inGameEditorResources) {
  auto projectUsedResources =
      gd::SceneResourcesFinder::FindProjectResources(project);

  if (isInGameEdition) {
    // All used in-game editor resources must be always loaded and available.
    ExporterHelper::AddInGameEditorResources(
        project, projectUsedResources, inGameEditorResources);
  }

  std::unordered_map<gd::String, std::set<gd::String>> scenesUsedResources;
  for (std::size_t layoutIndex = 0;
       layoutIndex < project.GetLayoutsCount(); layoutIndex++) {
    auto &layout = project.GetLayout(layoutIndex);
    scenesUsedResources[layout.GetName()] =
        gd::SceneResourcesFinder::FindSceneResources(project, layout);
  }

  std::unordered_map<gd::String, std::set<gd::String>>
      eventsBasedObjectVariantsUsedResources;
  for (std::size_t extensionIndex = 0;
       extensionIndex < project.GetEventsFunctionsExtensionsCount();
       extensionIndex++) {
    auto &eventsFunctionsExtension =
        project.GetEventsFunctionsExtension(extensionIndex);
    for (auto &&eventsBasedObject :
         eventsFunctionsExtension.GetEventsBasedObjects().GetInternalVector()) {

      auto eventsBasedObjectType = gd::PlatformExtension::GetObjectFullType(
          eventsFunctionsExtension.GetName(), eventsBasedObject->GetName());
      eventsBasedObjectVariantsUsedResources[eventsBasedObjectType] =
          gd::SceneResourcesFinder::FindEventsBasedObjectVariantResources(
              project, eventsBasedObject->GetDefaultVariant());

      for (auto &&eventsBasedObjectVariant :
           eventsBasedObject->GetVariants().GetInternalVector()) {

        auto variantType = gd::PlatformExtension::GetVariantFullType(
            eventsFunctionsExtension.GetName(), eventsBasedObject->GetName(),
            eventsBasedObjectVariant->GetName());
        eventsBasedObjectVariantsUsedResources[variantType] =
            gd::SceneResourcesFinder::FindEventsBasedObjectVariantResources(
                project, *eventsBasedObjectVariant);
      }
    }
  }

  // Strip the project (*after* generating events as the events may use stripped
  // things (objects groups...))
  gd::ProjectStripper::StripProjectForExport(project);

  project.SerializeTo(rootElement);
  SerializeUsedResources(rootElement, projectUsedResources, scenesUsedResources,
                         eventsBasedObjectVariantsUsedResources);
  if (isInGameEdition) {
    auto &behaviorsElement = rootElement.AddChild("activatedByDefaultInEditorBehaviors");
    behaviorsElement.ConsiderAsArrayOf("resourceReference");
    auto &platform = project.GetCurrentPlatform();
    for (auto &extension : platform.GetAllPlatformExtensions()) {
      for (auto &behaviorType : extension->GetBehaviorsTypes()) {
        auto &behaviorMetadata = extension->GetBehaviorMetadata(behaviorType);
        if (behaviorMetadata.IsActivatedByDefaultInEditor()) {
          behaviorsElement.AddChild("resourceReference")
              .SetStringValue(behaviorType);
        }
      }
    }
  }
}

void ExporterHelper::SerializeUsedResources(
    gd::SerializerElement &rootElement,
    std::set<gd::String> &projectUsedResources,
    std::unordered_map<gd::String, std::set<gd::String>> &scenesUsedResources,
    std::unordered_map<gd::String, std::set<gd::String>>
        &eventsBasedObjectVariantsUsedResources) {
  auto serializeUsedResources =
      [](gd::SerializerElement &element,
         std::set<gd::String> &usedResources) -> void {
    auto &resourcesElement = element.AddChild("usedResources");
    resourcesElement.ConsiderAsArrayOf("resourceReference");
    for (auto &resourceName : usedResources) {
      auto &resourceElement = resourcesElement.AddChild("resourceReference");
      resourceElement.SetAttribute("name", resourceName);
    }
  };

  serializeUsedResources(rootElement, projectUsedResources);

  auto &layoutsElement = rootElement.GetChild("layouts");
  for (std::size_t layoutIndex = 0;
       layoutIndex < layoutsElement.GetChildrenCount();
       layoutIndex++) {
    auto &layoutElement = layoutsElement.GetChild(layoutIndex);
    const auto layoutName = layoutElement.GetStringAttribute("name");

    auto &layoutUsedResources = scenesUsedResources[layoutName];
    serializeUsedResources(layoutElement, layoutUsedResources);
  }

  auto &extensionsElement = rootElement.GetChild("eventsFunctionsExtensions");
  for (std::size_t extensionIndex = 0;
       extensionIndex < extensionsElement.GetChildrenCount();
       extensionIndex++) {
    auto &extensionElement = extensionsElement.GetChild(extensionIndex);
    const auto extensionName = extensionElement.GetStringAttribute("name");

    auto &objectsElement = extensionElement.GetChild("eventsBasedObjects");

    for (std::size_t objectIndex = 0;
         objectIndex < objectsElement.GetChildrenCount(); objectIndex++) {
      auto &objectElement = objectsElement.GetChild(objectIndex);
      const auto objectName = objectElement.GetStringAttribute("name");

      auto eventsBasedObjectType =
          gd::PlatformExtension::GetObjectFullType(extensionName, objectName);
      auto &objectUsedResources =
          eventsBasedObjectVariantsUsedResources[eventsBasedObjectType];
      serializeUsedResources(objectElement, objectUsedResources);

      auto &variantsElement = objectElement.GetChild("variants");
      for (std::size_t variantIndex = 0;
           variantIndex < variantsElement.GetChildrenCount(); variantIndex++) {
        auto &variantElement = variantsElement.GetChild(variantIndex);
        const auto variantName = variantElement.GetStringAttribute("name");

        auto variantType = gd::PlatformExtension::GetVariantFullType(
            extensionName, objectName, variantName);
        auto &variantUsedResources =
            eventsBasedObjectVariantsUsedResources[variantType];
        serializeUsedResources(variantElement, variantUsedResources);
      }
    }
  }
}

bool ExporterHelper::ExportIndexFile(
    const gd::Project &project,
    gd::String source,
    gd::String exportDir,
    const std::vector<gd::String> &includesFiles,
    const std::vector<gd::SourceFileMetadata> &sourceFiles,
    unsigned int nonRuntimeScriptsCacheBurst,
    gd::String additionalSpec) {
  gd::String str = fs.ReadFile(source);

  // Add a reference to all files to include, as weel as the source files
  // required by the project.
  std::vector<gd::String> finalIncludesFiles = includesFiles;
  auto addSourceFileToIncludeFiles = [&](const gd::SourceFileMetadata& sourceFile) {
    const auto& resourcesManager = project.GetResourcesManager();
    if (!resourcesManager.HasResource(sourceFile.GetResourceName()))
      return;

    const gd::String& sourceFileFilename = resourcesManager.GetResource(sourceFile.GetResourceName()).GetFile();

    if (sourceFile.GetIncludePosition() == "first") {
      InsertUniqueFirst(finalIncludesFiles, sourceFileFilename);
    } else if (sourceFile.GetIncludePosition() == "last") {
      InsertUnique(finalIncludesFiles, sourceFileFilename);
    }
  };
  for (const auto& sourceFile : sourceFiles) {
    addSourceFileToIncludeFiles(sourceFile);
  }

  // Generate the file
  if (!CompleteIndexFile(str,
                         exportDir,
                         finalIncludesFiles,
                         nonRuntimeScriptsCacheBurst,
                         additionalSpec))
    return false;

  // Write the index.html file
  if (!fs.WriteToFile(exportDir + "/index.html", str)) {
    lastError = "Unable to write index file.";
    return false;
  }

  return true;
}

bool ExporterHelper::ExportCordovaFiles(const gd::Project &project,
                                        gd::String exportDir,
                                        std::set<gd::String> usedExtensions) {
  auto &platformSpecificAssets = project.GetPlatformSpecificAssets();
  auto &resourceManager = project.GetResourcesManager();
  auto getIconFilename = [&resourceManager, &platformSpecificAssets](
                             const gd::String &platform,
                             const gd::String &name) {
    const gd::String &file =
        resourceManager.GetResource(platformSpecificAssets.Get(platform, name))
            .GetFile();
    return file.empty() ? "" : "www/" + file;
  };

  auto makeIconsAndroid = [&getIconFilename]() {
    std::vector<std::pair<gd::String, gd::String>> sizes = {{"36", "ldpi"},
                                                            {"48", "mdpi"},
                                                            {"72", "hdpi"},
                                                            {"96", "xhdpi"},
                                                            {"144", "xxhdpi"},
                                                            {"192", "xxxhdpi"}};

    gd::String output;
    for (auto &size : sizes) {
      gd::String filename = getIconFilename("android", "icon-" + size.first);
      output += !filename.empty() ? ("<icon src=\"" + filename +
                                     "\" density=\"" + size.second + "\" />\n")
                                  : "";
    }

    // Splashscreen icon for Android 12+.
    gd::String splashScreenIconFilename =
        getIconFilename("android", "windowSplashScreenAnimatedIcon");
    if (!splashScreenIconFilename.empty())
      output +=
          "<preference name=\"AndroidWindowSplashScreenAnimatedIcon\" "
          "value=\"" +
          splashScreenIconFilename + "\" />\n";

    // Splashscreen "branding" image for Android 12+.
    gd::String splashScreenBrandingImageFilename =
        getIconFilename("android", "windowSplashScreenBrandingImage");
    if (!splashScreenBrandingImageFilename.empty())
      output +=
          "<preference name=\"AndroidWindowSplashScreenBrandingImage\" "
          "value=\"" +
          splashScreenBrandingImageFilename + "\" />\n";

    return output;
  };

  auto makeIconsIos = [&getIconFilename]() {
    std::vector<gd::String> sizes = {
        "180", "60",  "120", "76", "152", "40", "80", "57",  "114", "72",
        "144", "167", "29",  "58", "87",  "50", "20", "100", "167", "1024"};

    gd::String output;
    for (auto &size : sizes) {
      gd::String filename = getIconFilename("ios", "icon-" + size);
      output += !filename.empty() ? ("<icon src=\"" + filename + "\" width=\"" +
                                     size + "\" height=\"" + size + "\" />\n")
                                  : "";
    }

    return output;
  };

  auto makeProjectNameXcodeSafe = [](const gd::String &projectName) {
    // Avoid App Store Connect STATE_ERROR.VALIDATION_ERROR.90121 error, when
    // "CFBundleExecutable Info.plist key contains [...] any of the following
    // unsupported characters: \ [ ] { } ( ) + *".

    // Remove \ [ ] { } ( ) + * from the project name.
    return projectName.FindAndReplace("\\", "")
        .FindAndReplace("[", "")
        .FindAndReplace("]", "")
        .FindAndReplace("{", "")
        .FindAndReplace("}", "")
        .FindAndReplace("(", "")
        .FindAndReplace(")", "")
        .FindAndReplace("+", "")
        .FindAndReplace("*", "");
  };

  gd::String str =
      fs.ReadFile(gdjsRoot + "/Runtime/Cordova/config.xml")
          .FindAndReplace("GDJS_PROJECTNAME",
                          gd::Serializer::ToEscapedXMLString(
                              makeProjectNameXcodeSafe(project.GetName())))
          .FindAndReplace(
              "GDJS_PACKAGENAME",
              gd::Serializer::ToEscapedXMLString(project.GetPackageName()))
          .FindAndReplace("GDJS_PROJECTVERSION", project.GetVersion())
          .FindAndReplace("<!-- GDJS_ICONS_ANDROID -->", makeIconsAndroid())
          .FindAndReplace("<!-- GDJS_ICONS_IOS -->", makeIconsIos());

  gd::String plugins = "";
  auto dependenciesAndExtensions =
      gd::ExportedDependencyResolver::GetDependenciesFor(
          project, usedExtensions, "cordova");
  for (auto &dependencyAndExtension : dependenciesAndExtensions) {
    const auto &dependency = dependencyAndExtension.GetDependency();

    gd::String plugin;
    plugin += "<plugin name=\"" +
              gd::Serializer::ToEscapedXMLString(dependency.GetExportName());
    if (dependency.GetVersion() != "") {
      plugin += "\" spec=\"" +
                gd::Serializer::ToEscapedXMLString(dependency.GetVersion());
    }
    plugin += "\">\n";

    auto extraSettingValues = gd::ExportedDependencyResolver::
        GetExtensionDependencyExtraSettingValues(project,
                                                 dependencyAndExtension);

    // For Cordova, all settings are considered a plugin variable.
    for (auto &extraSetting : extraSettingValues) {
      plugin += "    <variable name=\"" +
                gd::Serializer::ToEscapedXMLString(extraSetting.first) +
                "\" value=\"" +
                gd::Serializer::ToEscapedXMLString(extraSetting.second) +
                "\" />\n";
    }

    plugin += "</plugin>";

    plugins += plugin;
  }

  // TODO: migrate the plugins to the package.json
  str =
      str.FindAndReplace("<!-- GDJS_EXTENSION_CORDOVA_DEPENDENCY -->", plugins);

  if (!fs.WriteToFile(exportDir + "/config.xml", str)) {
    lastError = "Unable to write Cordova config.xml file.";
    return false;
  }

  gd::String jsonName =
      gd::Serializer::ToJSON(gd::SerializerElement(project.GetName()));
  gd::String jsonAuthor =
      gd::Serializer::ToJSON(gd::SerializerElement(project.GetAuthor()));
  gd::String jsonVersion =
      gd::Serializer::ToJSON(gd::SerializerElement(project.GetVersion()));
  gd::String jsonMangledName = gd::Serializer::ToJSON(
      gd::SerializerElement(gd::SceneNameMangler::Get()
                                ->GetMangledSceneName(project.GetName())
                                .LowerCase()
                                .FindAndReplace(" ", "-")));

  {
    gd::String str =
        fs.ReadFile(gdjsRoot + "/Runtime/Cordova/package.json")
            .FindAndReplace("\"GDJS_GAME_NAME\"", jsonName)
            .FindAndReplace("\"GDJS_GAME_AUTHOR\"", jsonAuthor)
            .FindAndReplace("\"GDJS_GAME_VERSION\"", jsonVersion)
            .FindAndReplace("\"GDJS_GAME_MANGLED_NAME\"", jsonMangledName);

    if (!fs.WriteToFile(exportDir + "/package.json", str)) {
      lastError = "Unable to write Cordova package.json file.";
      return false;
    }
  }

  {
    gd::String str =
        fs.ReadFile(gdjsRoot + "/Runtime/Cordova/www/LICENSE.GDevelop.txt");

    if (!fs.WriteToFile(exportDir + "/www/LICENSE.GDevelop.txt", str)) {
      lastError = "Unable to write Cordova LICENSE.GDevelop.txt file.";
      return false;
    }
  }

  return true;
}

bool ExporterHelper::ExportFacebookInstantGamesFiles(const gd::Project &project,
                                                     gd::String exportDir) {
  {
    gd::String str =
        fs.ReadFile(gdjsRoot +
                    "/Runtime/FacebookInstantGames/fbapp-config.json")
            .FindAndReplace("\"GDJS_ORIENTATION\"",
                            project.GetOrientation() == "portrait"
                                ? "\"PORTRAIT\""
                                : "\"LANDSCAPE\"");

    if (!fs.WriteToFile(exportDir + "/fbapp-config.json", str)) {
      lastError =
          "Unable to write Facebook Instant Games fbapp-config.json file.";
      return false;
    }
  }

  return true;
}

bool ExporterHelper::ExportHtml5Files(const gd::Project &project,
                                      gd::String exportDir) {
  if (!fs.WriteToFile(exportDir + "/manifest.webmanifest",
                      GenerateWebManifest(project))) {
    lastError = "Unable to export WebManifest.";
    return false;
  }

  {
    gd::String str =
        fs.ReadFile(gdjsRoot + "/Runtime/Electron/LICENSE.GDevelop.txt");

    if (!fs.WriteToFile(exportDir + "/LICENSE.GDevelop.txt", str)) {
      lastError = "Unable to write LICENSE.GDevelop.txt file.";
      return false;
    }
  }

  return true;
}

bool ExporterHelper::ExportElectronFiles(const gd::Project &project,
                                         gd::String exportDir,
                                         std::set<gd::String> usedExtensions) {
  gd::String jsonName =
      gd::Serializer::ToJSON(gd::SerializerElement(project.GetName()));
  gd::String jsonPackageName =
      gd::Serializer::ToJSON(gd::SerializerElement(project.GetPackageName()));
  gd::String jsonAuthor =
      gd::Serializer::ToJSON(gd::SerializerElement(project.GetAuthor()));
  gd::String jsonVersion =
      gd::Serializer::ToJSON(gd::SerializerElement(project.GetVersion()));
  gd::String jsonMangledName = gd::Serializer::ToJSON(
      gd::SerializerElement(gd::SceneNameMangler::Get()
                                ->GetMangledSceneName(project.GetName())
                                .LowerCase()
                                .FindAndReplace(" ", "-")));
  // It's important to clean the project name from special characters,
  // otherwise Windows executable may be corrupted when electron builds it.
  gd::String jsonCleanedName = gd::Serializer::ToJSON(
      gd::SerializerElement(CleanProjectName(project.GetName())));

  {
    gd::String str =
        fs.ReadFile(gdjsRoot + "/Runtime/Electron/package.json")
            .FindAndReplace("\"GDJS_GAME_NAME\"", jsonCleanedName)
            .FindAndReplace("\"GDJS_GAME_PACKAGE_NAME\"", jsonPackageName)
            .FindAndReplace("\"GDJS_GAME_AUTHOR\"", jsonAuthor)
            .FindAndReplace("\"GDJS_GAME_VERSION\"", jsonVersion)
            .FindAndReplace("\"GDJS_GAME_MANGLED_NAME\"", jsonMangledName);

    gd::String packages = "";

    auto dependenciesAndExtensions =
        gd::ExportedDependencyResolver::GetDependenciesFor(
            project, usedExtensions, "npm");
    for (auto &dependencyAndExtension : dependenciesAndExtensions) {
      const auto &dependency = dependencyAndExtension.GetDependency();
      if (dependency.GetVersion() == "") {
        gd::LogError(
            "Latest Version not available for NPM dependencies, "
            "dependency " +
            dependency.GetName() +
            " is not exported. Please specify a version when calling "
            "addDependency.");
        continue;
      }

      // For Electron, extra settings of dependencies are ignored.
      packages += "\n\t\"" + dependency.GetExportName() + "\": \"" +
                  dependency.GetVersion() + "\",";
    }

    str = str.FindAndReplace("\"GDJS_EXTENSION_NPM_DEPENDENCY\": \"0\",",
                             packages);

    if (!fs.WriteToFile(exportDir + "/package.json", str)) {
      lastError = "Unable to write Electron package.json file.";
      return false;
    }
  }

  {
    gd::String str =
        fs.ReadFile(gdjsRoot + "/Runtime/Electron/main.js")
            .FindAndReplace(
                "800 /*GDJS_WINDOW_WIDTH*/",
                gd::String::From<int>(project.GetGameResolutionWidth()))
            .FindAndReplace(
                "600 /*GDJS_WINDOW_HEIGHT*/",
                gd::String::From<int>(project.GetGameResolutionHeight()))
            .FindAndReplace("\"GDJS_GAME_NAME\"", jsonName);

    if (!fs.WriteToFile(exportDir + "/main.js", str)) {
      lastError = "Unable to write Electron main.js file.";
      return false;
    }
  }

  {
    gd::String str =
        fs.ReadFile(gdjsRoot + "/Runtime/Electron/LICENSE.GDevelop.txt");

    if (!fs.WriteToFile(exportDir + "/LICENSE.GDevelop.txt", str)) {
      lastError = "Unable to write Electron LICENSE.GDevelop.txt file.";
      return false;
    }
  }

  return true;
}

bool ExporterHelper::ExportBuildResourcesElectronFiles(
    const gd::Project &project, gd::String exportDir) {
  auto &platformSpecificAssets = project.GetPlatformSpecificAssets();
  auto &resourceManager = project.GetResourcesManager();

  gd::String iconFilename =
      resourceManager
          .GetResource(platformSpecificAssets.Get("desktop", "icon-512"))
          .GetFile();

  fs.MakeAbsolute(iconFilename, exportDir + "/app");
  fs.MkDir(exportDir + "/buildResources");
  if (fs.FileExists(iconFilename)) {
    fs.CopyFile(iconFilename, exportDir + "/buildResources/icon.png");
  }

  return true;
}

bool ExporterHelper::CompleteIndexFile(
    gd::String &str,
    gd::String exportDir,
    const std::vector<gd::String> &includesFiles,
    unsigned int nonRuntimeScriptsCacheBurst,
    gd::String additionalSpec) {
  if (additionalSpec.empty()) additionalSpec = "{}";

  gd::String codeFilesIncludes;
  for (auto &include : includesFiles) {
    gd::String scriptSrc =
        GetExportedIncludeFilename(fs, gdjsRoot, include, nonRuntimeScriptsCacheBurst);

    // Sanity check if the file exists - if not skip it to avoid
    // including it in the list of scripts.
    gd::String absoluteFilename = scriptSrc;
    fs.MakeAbsolute(absoluteFilename, exportDir);
    if (!fs.FileExists(absoluteFilename)) {
      std::cout << "Warning: Unable to find " << absoluteFilename << "."
                << std::endl;
      continue;
    }

    codeFilesIncludes += "\t<script src=\"" + scriptSrc +
                         "\" crossorigin=\"anonymous\"></script>\n";
  }

  str = str.FindAndReplace("/* GDJS_CUSTOM_STYLE */", "")
            .FindAndReplace("<!-- GDJS_CUSTOM_HTML -->", "")
            .FindAndReplace("<!-- GDJS_CODE_FILES -->", codeFilesIncludes)
            .FindAndReplace("{}/*GDJS_ADDITIONAL_SPEC*/", additionalSpec);

  return true;
}

void ExporterHelper::AddLibsInclude(bool pixiRenderers,
                                    bool pixiInThreeRenderers,
                                    bool isInGameEdition,
                                    bool includeWebsocketDebuggerClient,
                                    bool includeWindowMessageDebuggerClient,
                                    bool includeMinimalDebuggerClient,
                                    bool includeCaptureManager,
                                    bool includeInAppTutorialMessage,
                                    gd::String gdevelopLogoStyle,
                                    std::vector<gd::String> &includesFiles) {
  // First, do not forget common includes (they must be included before events
  // generated code files).
  InsertUnique(includesFiles, "libs/jshashtable.js");
  InsertUnique(includesFiles, "logger.js");
  InsertUnique(includesFiles, "gd.js");
  InsertUnique(includesFiles, "libs/rbush.js");
  InsertUnique(includesFiles, "AsyncTasksManager.js");
  InsertUnique(includesFiles, "inputmanager.js");
  InsertUnique(includesFiles, "jsonmanager.js");
  InsertUnique(includesFiles, "Model3DManager.js");
  InsertUnique(includesFiles, "ResourceLoader.js");
  InsertUnique(includesFiles, "ResourceCache.js");
  InsertUnique(includesFiles, "timemanager.js");
  InsertUnique(includesFiles, "polygon.js");
  InsertUnique(includesFiles, "runtimeobject.js");
  InsertUnique(includesFiles, "profiler.js");
  InsertUnique(includesFiles, "RuntimeInstanceContainer.js");
  InsertUnique(includesFiles, "runtimescene.js");
  InsertUnique(includesFiles, "scenestack.js");
  InsertUnique(includesFiles, "force.js");
  InsertUnique(includesFiles, "RuntimeLayer.js");
  InsertUnique(includesFiles, "layer.js");
  InsertUnique(includesFiles, "RuntimeCustomObjectLayer.js");
  InsertUnique(includesFiles, "timer.js");
  InsertUnique(includesFiles, "runtimewatermark.js");
  InsertUnique(includesFiles, "runtimegame.js");
  InsertUnique(includesFiles, "variable.js");
  InsertUnique(includesFiles, "variablescontainer.js");
  InsertUnique(includesFiles, "oncetriggers.js");
  InsertUnique(includesFiles, "runtimebehavior.js");
  InsertUnique(includesFiles, "SpriteAnimator.js");
  InsertUnique(includesFiles, "spriteruntimeobject.js");
  InsertUnique(includesFiles, "affinetransformation.js");
  InsertUnique(includesFiles, "CustomRuntimeObjectInstanceContainer.js");
  InsertUnique(includesFiles, "CustomRuntimeObject.js");
  InsertUnique(includesFiles, "CustomRuntimeObject2D.js");
  InsertUnique(includesFiles, "indexeddb.js");

  // Common includes for events only.
  InsertUnique(includesFiles, "events-tools/commontools.js");
  InsertUnique(includesFiles, "events-tools/variabletools.js");
  InsertUnique(includesFiles, "events-tools/runtimescenetools.js");
  InsertUnique(includesFiles, "events-tools/inputtools.js");
  InsertUnique(includesFiles, "events-tools/objecttools.js");
  InsertUnique(includesFiles, "events-tools/cameratools.js");
  InsertUnique(includesFiles, "events-tools/soundtools.js");
  InsertUnique(includesFiles, "events-tools/storagetools.js");
  InsertUnique(includesFiles, "events-tools/stringtools.js");
  InsertUnique(includesFiles, "events-tools/windowtools.js");
  InsertUnique(includesFiles, "events-tools/networktools.js");

  if (gdevelopLogoStyle == "dark") {
    InsertUnique(includesFiles, "splash/gd-logo-dark.js");
  } else if (gdevelopLogoStyle == "dark-colored") {
    InsertUnique(includesFiles, "splash/gd-logo-dark-colored.js");
  } else if (gdevelopLogoStyle == "light-colored") {
    InsertUnique(includesFiles, "splash/gd-logo-light-colored.js");
  } else {
    InsertUnique(includesFiles, "splash/gd-logo-light.js");
  }

  if (includeInAppTutorialMessage) {
    InsertUnique(includesFiles, "InAppTutorialMessage.js");
    InsertUnique(includesFiles, "libs/nanomarkdown.js");
  }

  if (includeWebsocketDebuggerClient || includeWindowMessageDebuggerClient) {
    InsertUnique(includesFiles, "debugger-client/hot-reloader.js");
    InsertUnique(includesFiles, "debugger-client/abstract-debugger-client.js");
    InsertUnique(includesFiles, "debugger-client/InGameDebugger.js");
  }
  if (includeWebsocketDebuggerClient) {
    InsertUnique(includesFiles, "debugger-client/websocket-debugger-client.js");
  }
  if (includeWindowMessageDebuggerClient) {
    InsertUnique(includesFiles,
                 "debugger-client/window-message-debugger-client.js");
  }
  if (includeMinimalDebuggerClient) {
    InsertUnique(includesFiles, "debugger-client/minimal-debugger-client.js");
  }

  if (pixiInThreeRenderers || isInGameEdition) {
    InsertUnique(includesFiles, "pixi-renderers/three.js");
    InsertUnique(includesFiles, "pixi-renderers/ThreeAddons.js");
    InsertUnique(includesFiles, "pixi-renderers/draco/gltf/draco_decoder.wasm");
    InsertUnique(includesFiles,
                 "pixi-renderers/draco/gltf/draco_wasm_wrapper.js");
    // Extensions in JS may use it.
    InsertUnique(includesFiles, "Extensions/3D/Scene3DTools.js");
    InsertUnique(includesFiles, "Extensions/3D/A_RuntimeObject3D.js");
    InsertUnique(includesFiles, "Extensions/3D/A_RuntimeObject3DRenderer.js");
    InsertUnique(includesFiles, "Extensions/3D/CustomRuntimeObject3D.js");
    InsertUnique(includesFiles,
                 "Extensions/3D/CustomRuntimeObject3DRenderer.js");
  }
  if (pixiRenderers || isInGameEdition) {
    InsertUnique(includesFiles, "pixi-renderers/pixi.js");
    InsertUnique(includesFiles, "pixi-renderers/pixi-filters-tools.js");
    InsertUnique(includesFiles, "pixi-renderers/runtimegame-pixi-renderer.js");
    InsertUnique(includesFiles, "pixi-renderers/runtimescene-pixi-renderer.js");
    InsertUnique(includesFiles, "pixi-renderers/layer-pixi-renderer.js");
    InsertUnique(includesFiles, "pixi-renderers/pixi-image-manager.js");
    InsertUnique(includesFiles, "pixi-renderers/pixi-bitmapfont-manager.js");
    InsertUnique(includesFiles,
                 "pixi-renderers/spriteruntimeobject-pixi-renderer.js");
    InsertUnique(includesFiles,
                 "pixi-renderers/CustomRuntimeObject2DPixiRenderer.js");
    InsertUnique(includesFiles, "pixi-renderers/DebuggerPixiRenderer.js");
    InsertUnique(includesFiles,
                 "pixi-renderers/loadingscreen-pixi-renderer.js");
    InsertUnique(includesFiles, "pixi-renderers/pixi-effects-manager.js");
    InsertUnique(includesFiles, "howler-sound-manager/howler.min.js");
    InsertUnique(includesFiles, "howler-sound-manager/howler-sound-manager.js");
    InsertUnique(includesFiles,
                 "fontfaceobserver-font-manager/fontfaceobserver.js");
    InsertUnique(
        includesFiles,
        "fontfaceobserver-font-manager/fontfaceobserver-font-manager.js");
  }
  if (isInGameEdition) {
    // `InGameEditor` uses the `is3D` function.
    InsertUnique(includesFiles, "Extensions/3D/Base3DBehavior.js");
    InsertUnique(includesFiles, "Extensions/3D/HemisphereLight.js");
    InsertUnique(includesFiles, "InGameEditor/InGameEditor.js");
  }
  if (includeCaptureManager) {
    InsertUnique(includesFiles, "capturemanager.js");
  }
}

void ExporterHelper::RemoveIncludes(bool pixiRenderers,
                                    std::vector<gd::String> &includesFiles) {
  if (pixiRenderers) {
    for (size_t i = 0; i < includesFiles.size();) {
      const gd::String &includeFile = includesFiles[i];
      if (includeFile.find("pixi-renderer") != gd::String::npos ||
          includeFile.find("pixi-filter") != gd::String::npos)
        includesFiles.erase(includesFiles.begin() + i);
      else
        ++i;
    }
  }
}

bool ExporterHelper::ExportEffectIncludes(
    gd::Project &project, std::vector<gd::String> &includesFiles) {
  std::set<gd::String> effectIncludes;

  gd::EffectsCodeGenerator::GenerateEffectsIncludeFiles(
      project.GetCurrentPlatform(), project, effectIncludes);

  for (auto &include : effectIncludes) InsertUnique(includesFiles, include);

  return true;
}

bool ExporterHelper::ExportScenesEventsCode(
    const gd::Project &project,
    gd::String outputDir,
    std::vector<gd::String> &includesFiles,
    gd::WholeProjectDiagnosticReport &wholeProjectDiagnosticReport,
    bool exportForPreview) {
  fs.MkDir(outputDir);

  for (std::size_t i = 0; i < project.GetLayoutsCount(); ++i) {
    std::set<gd::String> eventsIncludes;
    const gd::Layout &layout = project.GetLayout(i);

    auto &diagnosticReport =
        wholeProjectDiagnosticReport.AddNewDiagnosticReportForScene(
            layout.GetName());
    LayoutCodeGenerator layoutCodeGenerator(project);
    gd::String eventsOutput = layoutCodeGenerator.GenerateLayoutCompleteCode(
        layout, eventsIncludes, diagnosticReport, !exportForPreview);
    gd::String filename =
        outputDir + "/" + "code" + gd::String::From(i) + ".js";

    // Export the code
    if (fs.WriteToFile(filename, eventsOutput)) {
      for (auto &include : eventsIncludes) InsertUnique(includesFiles, include);

      InsertUnique(includesFiles, filename);
    } else {
      lastError = _("Unable to write ") + filename;
      return false;
    }
  }

  return true;
}

gd::String ExporterHelper::GetExportedIncludeFilename(
    gd::AbstractFileSystem &fs, const gd::String &gdjsRoot,
    const gd::String &include, unsigned int nonRuntimeScriptsCacheBurst) {
  auto addSearchParameterToUrl = [](const gd::String &url,
                                    const gd::String &urlEncodedParameterName,
                                    const gd::String &urlEncodedValue) {
    gd::String separator = url.find("?") == gd::String::npos ? "?" : "&";
    return url + separator + urlEncodedParameterName + "=" + urlEncodedValue;
  };

  if (!fs.IsAbsolute(include)) {
    // By convention, an include file that is relative is relative to
    // the "<GDJS Root>/Runtime" folder, and will have the same relative
    // path when exported.

    // We still do this seemingly useless relative to absolute to relative
    // conversion, because some filesystems are using a URL for gdjsRoot, and
    // will convert the relative include to an absolute URL.
    gd::String relativeInclude = gdjsRoot + "/Runtime/" + include;
    fs.MakeRelative(relativeInclude, gdjsRoot + "/Runtime/");
    return relativeInclude;
  } else {
    // Note: all the code generated from events are generated in another
    // folder and fall in this case:
    gd::String resolvedInclude = fs.FileNameFrom(include);

    if (nonRuntimeScriptsCacheBurst == 0) {
      return resolvedInclude;
    }

    // Add the parameter to force the browser to reload the code - useful
    // for cases where the browser is caching files that are getting
    // overwritten.
    return addSearchParameterToUrl(
        resolvedInclude,
        "gdCacheBurst",
        gd::String::From(nonRuntimeScriptsCacheBurst));
  }
}

bool ExporterHelper::ExportIncludesAndLibs(
    const std::vector<gd::String> &includesFiles,
    gd::String exportDir,
    bool exportSourceMaps) {
  for (auto &include : includesFiles) {
    if (!fs.IsAbsolute(include)) {
      // By convention, an include file that is relative is relative to
      // the "<GDJS Root>/Runtime" folder, and will have the same relative
      // path when exported.
      gd::String source = gdjsRoot + "/Runtime/" + include;
      if (fs.FileExists(source)) {
        gd::String path = fs.DirNameFrom(exportDir + "/" + include);
        if (!fs.DirExists(path)) fs.MkDir(path);

        fs.CopyFile(source, exportDir + "/" + include);

        gd::String sourceMap = source + ".map";
        // Copy source map if present
        if (exportSourceMaps && fs.FileExists(sourceMap)) {
          fs.CopyFile(sourceMap, exportDir + "/" + include + ".map");
        }
      } else {
        std::cout << "Could not find GDJS include file " << include
                  << std::endl;
      }
    } else {
      // Note: all the code generated from events are generated in another
      // folder and fall in this case:
      if (fs.FileExists(include)) {
        fs.CopyFile(include, exportDir + "/" + fs.FileNameFrom(include));
      } else {
        std::cout << "Could not find include file " << include << std::endl;
      }
    }
  }

  return true;
}

void ExporterHelper::ExportResources(gd::AbstractFileSystem &fs,
                                     gd::Project &project,
                                     gd::String exportDir) {
  gd::ProjectResourcesCopier::CopyAllResourcesTo(
      project, fs, exportDir, true, false, false);
}

void ExporterHelper::AddDeprecatedFontFilesToFontResources(
    gd::AbstractFileSystem &fs,
    gd::ResourcesContainer &resourcesManager,
    const gd::String &exportDir,
    gd::String urlPrefix) {
  // Compatibility with GD <= 5.0-beta56
  //
  // Before, fonts were detected by scanning the export folder for .TTF files.
  // Text Object (or anything using a font) was just declaring the font filename
  // as a file (using ArbitraryResourceWorker::ExposeFile) for export.
  //
  // To still support this, the time everything is migrated to using font
  // resources, we manually declare font resources for each ".TTF" file, using
  // the name of the file as the resource name.
  std::vector<gd::String> ttfFiles = fs.ReadDir(exportDir, ".TTF");
  for (std::size_t i = 0; i < ttfFiles.size(); ++i) {
    gd::String relativeFile = ttfFiles[i];
    fs.MakeRelative(relativeFile, exportDir);

    // Create a resource named like the file (to emulate the old behavior).
    gd::FontResource fontResource;
    fontResource.SetName(relativeFile);
    fontResource.SetFile(urlPrefix + relativeFile);

    // Note that if a resource with this name already exists, it won't be
    // overwritten - which is expected.
    resourcesManager.AddResource(fontResource);
  }
  // end of compatibility code
}

const std::array<int, 20> IOS_ICONS_SIZES = {
    180, 60,  120, 76, 152, 40, 80, 57,  114, 72,
    144, 167, 29,  58, 87,  50, 20, 100, 167, 1024,
};
const std::array<int, 6> ANDROID_ICONS_SIZES = {36, 48, 72, 96, 144, 192};

const gd::String ExporterHelper::GenerateWebManifest(
    const gd::Project &project) {
  const gd::String &orientation = project.GetOrientation();
  gd::String icons = "[";

  {
    std::map<int, gd::String> resourcesForSizes;
    const auto getFileNameForIcon = [&project](const gd::String &platform,
                                               const int size) {
      const gd::String iconName = "icon-" + gd::String::From(size);
      return project.GetPlatformSpecificAssets().Has(platform, iconName)
                 ? project.GetResourcesManager()
                       .GetResource(project.GetPlatformSpecificAssets().Get(
                           platform, iconName))
                       .GetFile()
                 : "";
    };

    for (const int size : IOS_ICONS_SIZES) {
      const auto iconFile = getFileNameForIcon("ios", size);
      if (!iconFile.empty()) resourcesForSizes[size] = iconFile;
    };

    for (const int size : ANDROID_ICONS_SIZES) {
      const auto iconFile = getFileNameForIcon("android", size);
      if (!iconFile.empty()) resourcesForSizes[size] = iconFile;
    };

    const auto desktopIconFile = getFileNameForIcon("desktop", 512);
    if (!desktopIconFile.empty()) resourcesForSizes[512] = desktopIconFile;

    for (const auto &sizeAndFile : resourcesForSizes) {
      icons +=
          gd::String(R"({
        "src": "{FILE}",
        "sizes": "{SIZE}x{SIZE}"
      },)")
              .FindAndReplace("{SIZE}", gd::String::From(sizeAndFile.first))
              .FindAndReplace("{FILE}", sizeAndFile.second);
    }
  }

  icons = icons.RightTrim(",") + "]";

  gd::String jsonName =
      gd::Serializer::ToJSON(gd::SerializerElement(project.GetName()));
  gd::String jsonPackageName =
      gd::Serializer::ToJSON(gd::SerializerElement(project.GetPackageName()));
  gd::String jsonDescription =
      gd::Serializer::ToJSON(gd::SerializerElement(project.GetDescription()));

  return gd::String(R"webmanifest({
  "name": {NAME},
  "short_name": {NAME},
  "id": {PACKAGE_ID},
  "description": {DESCRIPTION},
  "orientation": "{ORIENTATION}",
  "start_url": "./index.html",
  "display": "standalone",
  "background_color": "black",
  "categories": ["games", "entertainment"],
  "icons": {ICONS}
})webmanifest")
      .FindAndReplace("{NAME}", jsonName)
      .FindAndReplace("{PACKAGE_ID}", jsonPackageName)
      .FindAndReplace("{DESCRIPTION}", jsonDescription)
      .FindAndReplace("{ORIENTATION}",
                      orientation == "default" ? "any" : orientation)
      .FindAndReplace("{ICONS}", icons);
};

}  // namespace gdjs
