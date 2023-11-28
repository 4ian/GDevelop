/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "ProjectResourcesCopier.h"
#include <map>
#include "GDCore/CommonTools.h"
#include "GDCore/IDE/AbstractFileSystem.h"
#include "GDCore/IDE/Project/ResourcesAbsolutePathChecker.h"
#include "GDCore/IDE/Project/ResourcesMergingHelper.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/Log.h"
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
  map<gd::String, gd::String>& resourcesNewFilename =
      resourcesMergingHelper.GetAllResourcesOldAndNewFilename();
  for (map<gd::String, gd::String>::const_iterator it =
           resourcesNewFilename.begin();
       it != resourcesNewFilename.end();
       ++it) {
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

  return true;
}

}  // namespace gd
