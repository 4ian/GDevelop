/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "ProjectResourcesCopier.h"
#include <map>
#include <vector>
#include "GDCore/CommonTools.h"
#include "GDCore/IDE/AbstractFileSystem.h"
#include "GDCore/IDE/Project/ResourcesAbsolutePathChecker.h"
#include "GDCore/IDE/Project/ResourcesMergingHelper.h"
#include "GDCore/IDE/Project/AssetResourcesMergingHelper.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/Log.h"
#include "GDCore/Extensions/Builtin/SpriteExtension/SpriteObject.h"
#include "GDCore/IDE/ResourceExposer.h"

using namespace std;

namespace gd {

bool ProjectResourcesCopier::CopyAllResourcesTo(
    gd::Project& originalProject,
    AbstractFileSystem& fs,
    gd::String destinationDirectory,
    bool updateOriginalProject,
    bool preserveAbsoluteFilenames,
    bool preserveDirectoryStructure) {
  if (updateOriginalProject) {
    gd::ProjectResourcesCopier::CopyAllResourcesTo(
        originalProject, originalProject, fs, destinationDirectory,
        preserveAbsoluteFilenames, preserveDirectoryStructure);
  } else {
    gd::Project clonedProject = originalProject;
    gd::ProjectResourcesCopier::CopyAllResourcesTo(
        originalProject, clonedProject, fs, destinationDirectory,
        preserveAbsoluteFilenames, preserveDirectoryStructure);
  }
  return true;
}

bool ProjectResourcesCopier::CopyAllResourcesTo(
    gd::Project& originalProject,
    gd::Project& clonedProject,
    AbstractFileSystem& fs,
    gd::String destinationDirectory,
    bool preserveAbsoluteFilenames,
    bool preserveDirectoryStructure) {

  // Check if there are some resources with absolute filenames
  gd::ResourcesAbsolutePathChecker absolutePathChecker(originalProject.GetResourcesManager(), fs);
  gd::ResourceExposer::ExposeWholeProjectResources(originalProject, absolutePathChecker);

  auto projectDirectory = fs.DirNameFrom(originalProject.GetProjectFile());
  std::cout << "Copying all resources from " << projectDirectory << " to "
            << destinationDirectory << "..." << std::endl;

  // Get the resources to be copied
  gd::ResourcesMergingHelper resourcesMergingHelper(
      clonedProject.GetResourcesManager(), fs);
  resourcesMergingHelper.SetBaseDirectory(projectDirectory);
  resourcesMergingHelper.PreserveDirectoriesStructure(
      preserveDirectoryStructure);
  resourcesMergingHelper.PreserveAbsoluteFilenames(preserveAbsoluteFilenames);
  gd::ResourceExposer::ExposeWholeProjectResources(clonedProject,
                                                    resourcesMergingHelper);

  // Copy resources
  CopyResourcesTo(resourcesMergingHelper.GetAllResourcesOldAndNewFilename(), fs, destinationDirectory);

  return true;
}

bool ProjectResourcesCopier::CopyObjectResourcesTo(
    gd::Project &project, gd::Object &object, AbstractFileSystem &fs,
    const gd::String &destinationDirectory, const gd::String &objectFullName) {
  auto projectDirectory = fs.DirNameFrom(project.GetProjectFile());
  std::cout << "Copying some resources from " << projectDirectory << " to "
            << destinationDirectory << "..." << std::endl;

  // Get the resources to be copied
  gd::AssetResourcesMergingHelper resourcesMergingHelper(project, fs);
  resourcesMergingHelper.SetBaseDirectory(projectDirectory);
  resourcesMergingHelper.PreserveDirectoriesStructure(false);
  resourcesMergingHelper.PreserveAbsoluteFilenames(false);

  object.GetConfiguration().ExposeResources(resourcesMergingHelper);
  auto &resourcesNewFileNames =
      resourcesMergingHelper.GetAllResourcesOldAndNewFilename();

  NormalizeResourceNames(object, resourcesNewFileNames, objectFullName);

  CopyResourcesTo(resourcesNewFileNames, fs, destinationDirectory);

  return true;
}

void ProjectResourcesCopier::NormalizeResourceNames(
    gd::Object &object, std::map<gd::String, gd::String> &resourcesNewFileNames,
    const gd::String &objectFullName) {

  if (object.GetConfiguration().GetType() == "Sprite") {
    gd::SpriteObject &spriteConfiguration =
        dynamic_cast<gd::SpriteObject &>(object.GetConfiguration());
    std::map<gd::String, gd::String> normalizedFileNames;

    for (std::size_t animationIndex = 0;
         animationIndex < spriteConfiguration.GetAnimationsCount();
         animationIndex++) {
      auto &animation = spriteConfiguration.GetAnimation(animationIndex);
      auto &direction = animation.GetDirection(0);

      const gd::String &animationName =
          animation.GetName().empty()
              ? gd::String::From(animationIndex)
              : animation.GetName().FindAndReplace("_", " ", true);

      // Search frames that share the same resource.
      map<gd::String, std::vector<int>> frameIndexes;
      for (std::size_t frameIndex = 0; frameIndex < direction.GetSpritesCount();
           frameIndex++) {
        auto &frame = direction.GetSprite(frameIndex);

        if (frameIndexes.find(frame.GetImageName()) == frameIndexes.end()) {
          std::vector<int> emptyVector;
          frameIndexes[frame.GetImageName()] = emptyVector;
        }
        auto &indexes = frameIndexes[frame.GetImageName()];
        indexes.push_back(frameIndex);
      }

      for (std::size_t frameIndex = 0; frameIndex < direction.GetSpritesCount();
           frameIndex++) {
        auto &frame = direction.GetSprite(frameIndex);
        auto oldName = frame.GetImageName();

        if (normalizedFileNames.find(oldName) != normalizedFileNames.end()) {
          gd::LogWarning("The resource \"" + oldName +
                         "\" is shared by several animations.");
          continue;
        }

        gd::String newName = objectFullName;
        if (spriteConfiguration.GetAnimationsCount() > 1) {
          newName += "_" + animationName;
        }
        if (direction.GetSpritesCount() > 1) {
          newName += "_";
          auto &indexes = frameIndexes[frame.GetImageName()];
          for (size_t i = 0; i < indexes.size(); i++) {
            newName += gd::String::From(indexes.at(i) + 1);
            if (i < indexes.size() - 1) {
              newName += ";";
            }
          }
        }
        gd::String extension = oldName.substr(oldName.find_last_of("."));
        newName += extension;

        frame.SetImageName(newName);
        normalizedFileNames[oldName] = newName;
      }
    }
    for (map<gd::String, gd::String>::const_iterator it =
             resourcesNewFileNames.begin();
         it != resourcesNewFileNames.end(); ++it) {
      if (!it->first.empty()) {
        gd::String originFile = it->first;
        gd::String destinationFile = it->second;
        resourcesNewFileNames[originFile] =
            normalizedFileNames[destinationFile];
      }
    }
  }
}

void ProjectResourcesCopier::CopyResourcesTo(
    map<gd::String, gd::String>& resourcesNewFileNames,
    AbstractFileSystem& fs,
    const gd::String &destinationDirectory) {
  for (map<gd::String, gd::String>::const_iterator it =
           resourcesNewFileNames.begin();
       it != resourcesNewFileNames.end();
       ++it) {
      std::cout << it->first << " --> " << it->second << std::endl;
    if (!it->first.empty()) {
      // Create the destination filename
      gd::String destinationFile = it->second;
      fs.MakeAbsolute(destinationFile, destinationDirectory);

      // Be sure the directory exists
      gd::String dir = fs.DirNameFrom(destinationFile);
      if (!fs.DirExists(dir)) fs.MkDir(dir);

      // We can now copy the file
      if (!fs.CopyFile(it->first, destinationFile)) {
        gd::LogWarning(_("Unable to copy \"") + it->first + _("\" to \"") +
                       destinationFile + _("\"."));
      }
    }
  }
}

}  // namespace gd
