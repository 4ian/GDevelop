/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
/**
 * @file Tests covering common features of GDevelop Core.
 */
#include <string>
#include "catch.hpp"
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/SystemStats.h"
#include "GDCore/Tools/VersionWrapper.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Extensions/Builtin/SpriteExtension/SpriteObject.h"
#include "GDCore/IDE/Project/ProjectResourcesAdder.h"
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "GDCore/Serialization/Serializer.h"

class ArbitraryResourceWorkerTest : public gd::ArbitraryResourceWorker
{
public:
    virtual void ExposeFile(gd::String & file) { files.push_back(file); };
    virtual void ExposeImage(gd::String & imageName) {images.push_back(imageName); };

    std::vector<gd::String> files;
    std::vector<gd::String> images;
};

TEST_CASE( "Resources", "[common][resources]" ) {
    SECTION("Basics") {
        gd::ImageResource image;
        image.SetName("MyResourceName");

        REQUIRE(image.GetName() == "MyResourceName");
    }
    SECTION("Filename handling") {
        gd::ImageResource image;
        image.SetFile("MyResourceFile");
        REQUIRE(image.GetFile() == "MyResourceFile");
        image.SetFile("My/relative/ResourceFile");
        REQUIRE(image.GetFile() == "My/relative/ResourceFile");
        image.SetFile("..\\My\\windows\\style\\relative\\ResourceFile");
        REQUIRE(image.GetFile() == "../My/windows/style/relative/ResourceFile");
        image.SetFile("Lots\\\\Of\\\\\\..\\Backslashs");
        REQUIRE(image.GetFile() == "Lots//Of///../Backslashs");
    }
    SECTION("ArbitraryResourceWorker") {
        gd::Project project;
        project.GetResourcesManager().AddResource("res1", "path/to/file1.png", "image");
        project.GetResourcesManager().AddResource("res2", "path/to/file2.png", "image");
        project.GetResourcesManager().AddResource("res3", "path/to/file3.png", "image");
        project.GetResourcesManager().AddResource("res4", "path/to/file4.png", "audio");
        ArbitraryResourceWorkerTest worker;

        project.ExposeResources(worker);
        REQUIRE(worker.files.size() == 4);
        REQUIRE(std::find(worker.files.begin(), worker.files.end(), "path/to/file2.png") != worker.files.end());
        REQUIRE(std::find(worker.files.begin(), worker.files.end(), "path/to/file4.png") != worker.files.end());

        SECTION("Object using a resource") {
            gd::SpriteObject obj("myObject");

            gd::Animation anim;
            gd::Sprite sprite;
            sprite.SetImageName("res1");
            anim.SetDirectionsCount(1);
            anim.GetDirection(0).AddSprite(sprite);
            obj.AddAnimation(anim);
            project.InsertObject(obj, 0);

            worker.files.clear();
            worker.images.clear();
            project.ExposeResources(worker);
            REQUIRE(worker.files.size() == 4);
            REQUIRE(worker.images.size() == 1);
            REQUIRE(worker.images[0] == "res1");

            SECTION("ProjectResourcesAdder") {
                std::vector<gd::String> uselessResources =
                    gd::ProjectResourcesAdder::GetAllUselessImages(project);

                REQUIRE(uselessResources.size() == 2);

                gd::ProjectResourcesAdder::RemoveAllUselessImages(project);
                std::vector<gd::String> remainingResources =
                    project.GetResourcesManager().GetAllResourcesList();
                REQUIRE(remainingResources.size() == 2);
                REQUIRE(remainingResources[0] == "res1");
                REQUIRE(remainingResources[1] == "res4");
            }
        }
    }
}
