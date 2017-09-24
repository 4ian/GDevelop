/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
/**
 * @file Tests covering project refactoring
 */
#include "catch.hpp"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/ExternalLayout.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Events/Builtin/LinkEvent.h"
#include "GDCore/Project/Variable.h"
#include "GDCore/IDE/WholeProjectRefactorer.h"

namespace
{

void SetupProjectWithDummyPlatform(gd::Project &project, gd::Platform &platform)
{
    std::shared_ptr<gd::PlatformExtension> extension = std::shared_ptr<gd::PlatformExtension>(new gd::PlatformExtension);
    extension->AddObject<gd::Object>("Sprite", "Dummy Sprite", "Dummy sprite object", "");
    platform.AddExtension(extension);
    project.AddPlatform(platform);
}
}

TEST_CASE("WholeProjectRefactorer", "[common]")
{
    SECTION("Object deleted")
    {
        SECTION("Groups")
        {
            gd::Project project;
            gd::Platform platform;
            SetupProjectWithDummyPlatform(project, platform);
            auto &layout1 = project.InsertNewLayout("Layout1", 0);

            gd::ObjectGroup group1;
            group1.AddObject("Object1");
            group1.AddObject("Object2");
            group1.AddObject("NotExistingObject");
            group1.AddObject("GlobalObject1");
            layout1.GetObjectGroups().Insert(group1);

            layout1.InsertNewObject(project, "Sprite", "Object1", 0);
            layout1.InsertNewObject(project, "Sprite", "Object2", 0);

            gd::WholeProjectRefactorer::ObjectRemovedInLayout(project, layout1, "Object1");
            gd::WholeProjectRefactorer::GlobalObjectRemoved(project, "GlobalObject1");
            REQUIRE(layout1.GetObjectGroups()[0].Find("Object1") == false);
            REQUIRE(layout1.GetObjectGroups()[0].Find("Object2") == true);
            REQUIRE(layout1.GetObjectGroups()[0].Find("NotExistingObject") == true);
            REQUIRE(layout1.GetObjectGroups()[0].Find("GlobalObject1") == false);
        }

        SECTION("Initial instances")
        {
            gd::Project project;
            gd::Platform platform;
            SetupProjectWithDummyPlatform(project, platform);
            auto &layout1 = project.InsertNewLayout("Layout1", 0);

            layout1.InsertNewObject(project, "Sprite", "Object1", 0);
            layout1.InsertNewObject(project, "Sprite", "Object2", 0);

            gd::InitialInstance instance1;
            instance1.SetObjectName("Object1");
            gd::InitialInstance instance2;
            instance2.SetObjectName("Object2");
            gd::InitialInstance instance3;
            instance3.SetObjectName("GlobalObject1");
            layout1.GetInitialInstances().InsertInitialInstance(instance1);
            layout1.GetInitialInstances().InsertInitialInstance(instance2);
            layout1.GetInitialInstances().InsertInitialInstance(instance3);

            gd::WholeProjectRefactorer::ObjectRemovedInLayout(project, layout1, "Object1");
            gd::WholeProjectRefactorer::GlobalObjectRemoved(project, "GlobalObject1");
            REQUIRE(layout1.GetInitialInstances().HasInstancesOfObject("Object1") == false);
            REQUIRE(layout1.GetInitialInstances().HasInstancesOfObject("Object2") == true);
            REQUIRE(layout1.GetInitialInstances().HasInstancesOfObject("GlobalObject1") == false);
        }

        SECTION("Initial instances in associated external layouts")
        {
            gd::Project project;
            gd::Platform platform;
            SetupProjectWithDummyPlatform(project, platform);
            auto &layout1 = project.InsertNewLayout("Layout1", 0);
            auto &layout2 = project.InsertNewLayout("Layout2", 0);
            auto &externalLayout1 = project.InsertNewExternalLayout("ExternalLayout1", 0);
            auto &externalLayout2 = project.InsertNewExternalLayout("ExternalLayout2", 0);

            externalLayout1.SetAssociatedLayout("Layout1");
            externalLayout2.SetAssociatedLayout("Layout2");

            layout1.InsertNewObject(project, "Sprite", "Object1", 0);
            layout1.InsertNewObject(project, "Sprite", "Object2", 0);

            gd::InitialInstance instance1;
            instance1.SetObjectName("Object1");
            gd::InitialInstance instance2;
            instance2.SetObjectName("Object2");
            gd::InitialInstance instance3;
            instance3.SetObjectName("GlobalObject1");
            externalLayout1.GetInitialInstances().InsertInitialInstance(instance1);
            externalLayout1.GetInitialInstances().InsertInitialInstance(instance2);
            externalLayout1.GetInitialInstances().InsertInitialInstance(instance3);
            externalLayout2.GetInitialInstances().InsertInitialInstance(instance1);
            externalLayout2.GetInitialInstances().InsertInitialInstance(instance2);
            externalLayout2.GetInitialInstances().InsertInitialInstance(instance3);

            gd::WholeProjectRefactorer::ObjectRemovedInLayout(project, layout1, "Object1");
            gd::WholeProjectRefactorer::GlobalObjectRemoved(project, "GlobalObject1");
            REQUIRE(externalLayout1.GetInitialInstances().HasInstancesOfObject("Object1") == false);
            REQUIRE(externalLayout1.GetInitialInstances().HasInstancesOfObject("Object2") == true);
            REQUIRE(externalLayout1.GetInitialInstances().HasInstancesOfObject("GlobalObject1") == false);
            REQUIRE(externalLayout2.GetInitialInstances().HasInstancesOfObject("Object1") == true);
            REQUIRE(externalLayout2.GetInitialInstances().HasInstancesOfObject("Object2") == true);
            REQUIRE(externalLayout2.GetInitialInstances().HasInstancesOfObject("GlobalObject1") == false);
        }
    }

    SECTION("Object renamed")
    {
        SECTION("Groups")
        {
            gd::Project project;
            gd::Platform platform;
            SetupProjectWithDummyPlatform(project, platform);
            auto &layout1 = project.InsertNewLayout("Layout1", 0);

            gd::ObjectGroup group1;
            group1.AddObject("Object1");
            group1.AddObject("Object2");
            group1.AddObject("NotExistingObject");
            group1.AddObject("GlobalObject1");
            layout1.GetObjectGroups().Insert(group1);

            layout1.InsertNewObject(project, "Sprite", "Object1", 0);
            layout1.InsertNewObject(project, "Sprite", "Object2", 0);

            gd::WholeProjectRefactorer::ObjectRenamedInLayout(project, layout1, "Object1", "Object3");
            gd::WholeProjectRefactorer::GlobalObjectRenamed(project, "GlobalObject1", "GlobalObject3");
            REQUIRE(layout1.GetObjectGroups()[0].Find("Object1") == false);
            REQUIRE(layout1.GetObjectGroups()[0].Find("Object2") == true);
            REQUIRE(layout1.GetObjectGroups()[0].Find("Object3") == true);
            REQUIRE(layout1.GetObjectGroups()[0].Find("GlobalObject1") == false);
            REQUIRE(layout1.GetObjectGroups()[0].Find("GlobalObject3") == true);
        }

        SECTION("Initial instances")
        {
            gd::Project project;
            gd::Platform platform;
            SetupProjectWithDummyPlatform(project, platform);
            auto &layout1 = project.InsertNewLayout("Layout1", 0);

            layout1.InsertNewObject(project, "Sprite", "Object1", 0);
            layout1.InsertNewObject(project, "Sprite", "Object2", 0);

            gd::InitialInstance instance1;
            instance1.SetObjectName("Object1");
            gd::InitialInstance instance2;
            instance2.SetObjectName("Object2");
            gd::InitialInstance instance3;
            instance3.SetObjectName("GlobalObject1");
            layout1.GetInitialInstances().InsertInitialInstance(instance1);
            layout1.GetInitialInstances().InsertInitialInstance(instance2);
            layout1.GetInitialInstances().InsertInitialInstance(instance3);

            gd::WholeProjectRefactorer::ObjectRenamedInLayout(project, layout1, "Object1", "Object3");
            gd::WholeProjectRefactorer::GlobalObjectRenamed(project, "GlobalObject1", "GlobalObject3");
            REQUIRE(layout1.GetInitialInstances().HasInstancesOfObject("Object1") == false);
            REQUIRE(layout1.GetInitialInstances().HasInstancesOfObject("Object3") == true);
            REQUIRE(layout1.GetInitialInstances().HasInstancesOfObject("GlobalObject1") == false);
            REQUIRE(layout1.GetInitialInstances().HasInstancesOfObject("GlobalObject3") == true);
        }

        SECTION("Initial instances in associated external layouts")
        {
            gd::Project project;
            gd::Platform platform;
            SetupProjectWithDummyPlatform(project, platform);
            auto &layout1 = project.InsertNewLayout("Layout1", 0);
            auto &layout2 = project.InsertNewLayout("Layout2", 0);
            auto &externalLayout1 = project.InsertNewExternalLayout("ExternalLayout1", 0);
            auto &externalLayout2 = project.InsertNewExternalLayout("ExternalLayout2", 0);

            externalLayout1.SetAssociatedLayout("Layout1");
            externalLayout2.SetAssociatedLayout("Layout2");

            layout1.InsertNewObject(project, "Sprite", "Object1", 0);
            layout1.InsertNewObject(project, "Sprite", "Object2", 0);

            gd::InitialInstance instance1;
            instance1.SetObjectName("Object1");
            gd::InitialInstance instance2;
            instance2.SetObjectName("Object2");
            gd::InitialInstance instance3;
            instance3.SetObjectName("GlobalObject1");
            externalLayout1.GetInitialInstances().InsertInitialInstance(instance1);
            externalLayout1.GetInitialInstances().InsertInitialInstance(instance2);
            externalLayout1.GetInitialInstances().InsertInitialInstance(instance3);
            externalLayout2.GetInitialInstances().InsertInitialInstance(instance1);
            externalLayout2.GetInitialInstances().InsertInitialInstance(instance2);
            externalLayout2.GetInitialInstances().InsertInitialInstance(instance3);

            gd::WholeProjectRefactorer::ObjectRenamedInLayout(project, layout1, "Object1", "Object3");
            gd::WholeProjectRefactorer::GlobalObjectRenamed(project, "GlobalObject1", "GlobalObject3");
            REQUIRE(externalLayout1.GetInitialInstances().HasInstancesOfObject("Object1") == false);
            REQUIRE(externalLayout1.GetInitialInstances().HasInstancesOfObject("Object2") == true);
            REQUIRE(externalLayout1.GetInitialInstances().HasInstancesOfObject("Object3") == true);
            REQUIRE(externalLayout1.GetInitialInstances().HasInstancesOfObject("GlobalObject1") == false);
            REQUIRE(externalLayout1.GetInitialInstances().HasInstancesOfObject("GlobalObject3") == true);
            REQUIRE(externalLayout2.GetInitialInstances().HasInstancesOfObject("Object1") == true);
            REQUIRE(externalLayout2.GetInitialInstances().HasInstancesOfObject("Object2") == true);
            REQUIRE(externalLayout2.GetInitialInstances().HasInstancesOfObject("Object3") == false);
            REQUIRE(externalLayout2.GetInitialInstances().HasInstancesOfObject("GlobalObject1") == false);
            REQUIRE(externalLayout2.GetInitialInstances().HasInstancesOfObject("GlobalObject3") == true);
        }
    }
}
