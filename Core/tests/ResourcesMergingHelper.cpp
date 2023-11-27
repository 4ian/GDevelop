/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
/**
 * @file Tests covering common features of GDevelop Core.
 */
#include "GDCore/IDE/Project/ResourcesMergingHelper.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Extensions/Builtin/SpriteExtension/SpriteObject.h"
#include "GDCore/IDE/AbstractFileSystem.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Variable.h"
#include "GDCore/Tools/SystemStats.h"
#include "GDCore/Tools/VersionWrapper.h"
#include "catch.hpp"
#include "GDCore/IDE/ResourceExposer.h"

class MockFileSystem : public gd::AbstractFileSystem {
 public:
  virtual void MkDir(const gd::String& path){};
  virtual bool DirExists(const gd::String& path) { return true; };
  virtual bool FileExists(const gd::String& path) { return true; };
  virtual gd::String FileNameFrom(const gd::String& file) {
    return "FileNameFrom(" + file + ")";
  };
  virtual gd::String DirNameFrom(const gd::String& file) {
    return "DirNameFrom(" + file + ")";
  };
  virtual bool MakeAbsolute(gd::String& filename,
                            const gd::String& baseDirectory) {
    filename = "MakeAbsolute(" + filename + ")";
    return true;
  };
  virtual bool MakeRelative(gd::String& filename,
                            const gd::String& baseDirectory) {
    filename = "MakeRelative(" + filename + ")";
    return true;
  };
  virtual bool IsAbsolute(const gd::String& filename) {
    return !filename.empty() && filename[0] == '/';
  }
  virtual bool CopyFile(const gd::String& file, const gd::String& destination) {
    return true;
  }
  virtual bool ClearDir(const gd::String& directory) { return true; }
  virtual bool WriteToFile(const gd::String& file, const gd::String& content) {
    return true;
  }
  virtual gd::String ReadFile(const gd::String& file) {
    return "Content of " + file;
  }
  virtual gd::String GetTempDir() { return "/tmp/mock/"; }
  virtual std::vector<gd::String> ReadDir(const gd::String& path,
                                          const gd::String& extension = "") {
    std::vector<gd::String> dir = {"MockFile1", "MockFile2"};
    return dir;
  }

  MockFileSystem(){};
  virtual ~MockFileSystem(){};
};

TEST_CASE("ResourcesMergingHelper", "[common]") {
  SECTION("Basics") {
    gd::Project project;
    MockFileSystem fs;
    gd::ResourcesMergingHelper resourcesMerger(project.GetResourcesManager(), fs);
    resourcesMerger.SetBaseDirectory("/game/base/folder/");

    project.GetResourcesManager().AddResource("Image1", "/image1.png", "image");
    project.GetResourcesManager().AddResource("Image2", "image2.png", "image");
    project.GetResourcesManager().AddResource("Audio1", "audio1.png", "audio");
    project.GetResourcesManager().AddResource(
        "Image3", "subfolder/image3.png", "image");

    gd::ResourceExposer::ExposeWholeProjectResources(project, resourcesMerger);

    auto resourcesFilenames =
        resourcesMerger.GetAllResourcesOldAndNewFilename();
    REQUIRE(resourcesFilenames["MakeAbsolute(/image1.png)"] ==
            "FileNameFrom(MakeAbsolute(/image1.png))");
    REQUIRE(resourcesFilenames["MakeAbsolute(audio1.png)"] ==
            "FileNameFrom(MakeAbsolute(audio1.png))");
    REQUIRE(resourcesFilenames["MakeAbsolute(image2.png)"] ==
            "FileNameFrom(MakeAbsolute(image2.png))");
    REQUIRE(resourcesFilenames["MakeAbsolute(subfolder/image3.png)"] ==
            "FileNameFrom(MakeAbsolute(subfolder/image3.png))");
  }
  SECTION("Can preserve directories structure") {
    gd::Project project;
    MockFileSystem fs;
    gd::ResourcesMergingHelper resourcesMerger(project.GetResourcesManager(), fs);
    resourcesMerger.SetBaseDirectory("/game/base/folder/");
    resourcesMerger.PreserveDirectoriesStructure(true);

    project.GetResourcesManager().AddResource("Image1", "/image1.png", "image");
    project.GetResourcesManager().AddResource("Image2", "image2.png", "image");
    project.GetResourcesManager().AddResource("Audio1", "audio1.png", "audio");
    project.GetResourcesManager().AddResource(
        "Image3", "subfolder/image3.png", "image");

    gd::ResourceExposer::ExposeWholeProjectResources(project, resourcesMerger);

    auto resourcesFilenames =
        resourcesMerger.GetAllResourcesOldAndNewFilename();
    REQUIRE(resourcesFilenames["MakeAbsolute(/image1.png)"] ==
            "FileNameFrom(MakeAbsolute(/image1.png))");
    REQUIRE(resourcesFilenames["MakeAbsolute(image2.png)"] ==
            "MakeRelative(MakeAbsolute(image2.png))");
    REQUIRE(resourcesFilenames["MakeAbsolute(audio1.png)"] ==
            "MakeRelative(MakeAbsolute(audio1.png))");
    REQUIRE(resourcesFilenames["MakeAbsolute(subfolder/image3.png)"] ==
            "MakeRelative(MakeAbsolute(subfolder/image3.png))");
  }
}
