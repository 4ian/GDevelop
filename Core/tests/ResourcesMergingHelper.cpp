/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
/**
 * @file Tests covering common features of GDevelop Core.
 */
#include "catch.hpp"
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/SystemStats.h"
#include "GDCore/Tools/VersionWrapper.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/Variable.h"
#include "GDCore/IDE/ResourcesMergingHelper.h"
#include "GDCore/IDE/AbstractFileSystem.h"
#include "GDCore/BuiltinExtensions/SpriteExtension/SpriteObject.h"

class MockFileSystem : public gd::AbstractFileSystem
{
public:
    virtual void MkDir(const gd::String & path) {};
    virtual bool DirExists(const gd::String & path) { return true; };
    virtual bool FileExists(const gd::String & path) { return true; };
    virtual gd::String FileNameFrom(const gd::String & file) { return "FileNameFrom(" + file + ")"; };
    virtual gd::String DirNameFrom(const gd::String & file) { return "DirNameFrom(" + file + ")"; };
    virtual bool MakeAbsolute(gd::String & filename, const gd::String & baseDirectory) { filename = "MakeAbsolute(" + filename + ")"; return true; };
    virtual bool MakeRelative(gd::String & filename, const gd::String & baseDirectory) { filename = "MakeRelative(" + filename + ")"; return true; };
    virtual bool IsAbsolute(const gd::String & filename) { return !filename.empty() && filename[0] == '/'; }
    virtual bool CopyFile(const gd::String & file, const gd::String & destination) { return true; }
    virtual bool CopyDir(const gd::String & source, const gd::String & destination) { return true; }
    virtual bool ClearDir(const gd::String & directory) { return true; }
    virtual bool WriteToFile(const gd::String & file, const gd::String & content) { return true; }
    virtual gd::String ReadFile(const gd::String & file) { return "Content of " + file; }
    virtual gd::String GetTempDir() { return "/tmp/mock/"; }
    virtual std::vector<gd::String> ReadDir(const gd::String & path, const gd::String & extension = "")
    {
        std::vector<gd::String> dir = { "MockFile1", "MockFile2" };
        return dir;
    }

    MockFileSystem() {};
    virtual ~MockFileSystem() {};
};

TEST_CASE( "ResourcesMergingHelper", "[common]" ) {
    SECTION("Basics") {
        MockFileSystem fs;
        gd::ResourcesMergingHelper resourcesMerger(fs);
        resourcesMerger.SetBaseDirectory("/game/base/folder/");

        gd::Project project;
        project.GetResourcesManager().AddResource("Image1", "/image1.png");
        project.GetResourcesManager().AddResource("Image2", "image2.png");
        project.GetResourcesManager().AddResource("Image3", "subfolder/image3.png");

        project.ExposeResources(resourcesMerger);

        auto resourcesFilenames = resourcesMerger.GetAllResourcesOldAndNewFilename();
        REQUIRE(resourcesFilenames["MakeAbsolute(/image1.png)"] == "FileNameFrom(MakeAbsolute(/image1.png))");
        REQUIRE(resourcesFilenames["MakeAbsolute(image2.png)"] == "FileNameFrom(MakeAbsolute(image2.png))");
        REQUIRE(resourcesFilenames["MakeAbsolute(subfolder/image3.png)"] == "FileNameFrom(MakeAbsolute(subfolder/image3.png))");
    }
    SECTION("Can preserve directories structure") {
        MockFileSystem fs;
        gd::ResourcesMergingHelper resourcesMerger(fs);
        resourcesMerger.SetBaseDirectory("/game/base/folder/");
        resourcesMerger.PreserveDirectoriesStructure(true);

        gd::Project project;
        project.GetResourcesManager().AddResource("Image1", "/image1.png");
        project.GetResourcesManager().AddResource("Image2", "image2.png");
        project.GetResourcesManager().AddResource("Image3", "subfolder/image3.png");

        project.ExposeResources(resourcesMerger);

        auto resourcesFilenames = resourcesMerger.GetAllResourcesOldAndNewFilename();
        REQUIRE(resourcesFilenames["MakeAbsolute(/image1.png)"] == "MakeRelative(MakeAbsolute(/image1.png))");
        REQUIRE(resourcesFilenames["MakeAbsolute(image2.png)"] == "MakeRelative(MakeAbsolute(image2.png))");
        REQUIRE(resourcesFilenames["MakeAbsolute(subfolder/image3.png)"] == "MakeRelative(MakeAbsolute(subfolder/image3.png))");
    }
}

