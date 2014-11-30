/*
 * GDevelop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
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
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/BuiltinExtensions/SpriteExtension/SpriteObject.h"
#include "GDCore/IDE/ProjectResourcesAdder.h"
#include "GDCore/IDE/ArbitraryResourceWorker.h"
#include "GDCore/Serialization/Serializer.h"

class ArbitraryResourceWorkerTest : public gd::ArbitraryResourceWorker
{
public:
    virtual void ExposeFile(std::string & file) { files.push_back(file); };
    virtual void ExposeImage(std::string & imageName) {images.push_back(imageName); };
    virtual void ExposeShader(std::string & shaderName) {}

    std::vector<std::string> files;
    std::vector<std::string> images;
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
        project.GetResourcesManager().AddResource("res1", "path/to/file1.png");
        project.GetResourcesManager().AddResource("res2", "path/to/file2.png");
        project.GetResourcesManager().AddResource("res3", "path/to/file3.png");
        ArbitraryResourceWorkerTest worker;

        project.ExposeResources(worker);
        REQUIRE(worker.files.size() == 3);
        REQUIRE(std::find(worker.files.begin(), worker.files.end(), "path/to/file2.png") != worker.files.end());

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
            REQUIRE(worker.files.size() == 3);
            REQUIRE(worker.images.size() == 1);
            REQUIRE(worker.images[0] == "res1");

            SECTION("ProjectResourcesAdder") {
                std::vector<std::string> uselessResources =
                    gd::ProjectResourcesAdder::GetAllUselessResources(project);

                REQUIRE(uselessResources.size() == 2);

                gd::ProjectResourcesAdder::RemoveAllUselessResources(project);
                std::vector<std::string> remainingResources =
                    project.GetResourcesManager().GetAllResourcesList();
                REQUIRE(remainingResources.size() == 1);
                REQUIRE(remainingResources[0] == "res1");
            }
        }
    }
}
