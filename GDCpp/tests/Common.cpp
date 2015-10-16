/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
/**
 * @file Tests covering common features of GDevelop C++ Platform.
 */
#include "catch.hpp"
#include "GDCore/CommonTools.h"
#include "GDCore/PlatformDefinition/ClassWithObjects.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/RuntimeGame.h"

TEST_CASE( "RuntimeScene", "[common]" ) {
	SECTION("Basics") {
		RuntimeGame game;
		RuntimeScene scene(NULL, &game);
		REQUIRE( scene.GetTimeManager().IsFirstLoop() == true );
		REQUIRE( scene.GetTimeManager().GetTimeScale() == 1 );
		REQUIRE( scene.renderWindow == NULL );
		REQUIRE( scene.game == &game );
	}
	SECTION("Loading from a layout") {
		gd::Project project;
		gd::Layout layout;
        layout.SetName("My layout");
        gd::Variable var1;
        var1.SetString("Hello");
        gd::Variable var2;
        var2.SetValue(42);
        layout.GetVariables().Insert("MaVar", var1, 0);
        layout.GetVariables().Insert("MaVar2", var2, 0);

		RuntimeGame game;
		RuntimeScene scene(NULL, &game);

		scene.LoadFromScene(layout);
        REQUIRE(scene.GetName() == "My layout");
        REQUIRE(scene.GetVariables().Get("MaVar").GetString() == "Hello");
        REQUIRE(scene.GetVariables().Get("MaVar2").GetValue() == 42);
	}
}

TEST_CASE( "gd::Project", "[common]" ) {
	SECTION("Basics") {
		gd::Project project;
		project.SetName("MyName");
		project.GetUsedExtensions().push_back("Ext1");
		project.GetUsedExtensions().push_back("Ext2");

		REQUIRE( project.GetName() == "MyName" );

		SECTION("Copy a project in memory")	 {
			gd::Project copy = project;

			REQUIRE( copy.GetName() == "MyName" );
			REQUIRE( copy.GetUsedExtensions().size() == project.GetUsedExtensions().size() );
		}
	}
}
