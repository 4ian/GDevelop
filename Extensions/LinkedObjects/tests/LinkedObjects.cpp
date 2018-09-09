/**

GDevelop - LinkedObjects Extension
Copyright (c) 2011-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
/**
 * @file Tests for the Linked Objects extension.
 */
#define CATCH_CONFIG_MAIN
#include "catch.hpp"
#include "GDCore/CommonTools.h"
#include "GDCore/Project/ObjectsContainer.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Object.h"
#include "GDCpp/Runtime/RuntimeScene.h"
#include "GDCpp/Runtime/RuntimeGame.h"
#include "GDCpp/Runtime/RuntimeObject.h"
#include "GDCpp/Extensions/Builtin/ObjectTools.h"
#include "GDCpp/Extensions/Builtin/ObjectTools.h"
#include "../LinkedObjectsTools.h"
#include "../ObjectsLinksManager.h"

TEST_CASE( "LinkedObjects", "[game-engine][linked-objects]" ) {
	SECTION("LinkedObjectsTools") {
		//Prepare some objects and the context
		gd::Object obj1("1");
		gd::Object obj2("2");

		RuntimeGame game;
		RuntimeScene scene(NULL, &game);

		RuntimeObject obj1A(scene, obj1);
		RuntimeObject obj1B(scene, obj1);
		RuntimeObject obj1C(scene, obj1);

		RuntimeObject obj2A(scene, obj2);
		RuntimeObject obj2B(scene, obj2);
		RuntimeObject obj2C(scene, obj2);

		//Link two objects
		GDpriv::LinkedObjects::ObjectsLinksManager & manager = GDpriv::LinkedObjects::ObjectsLinksManager::managers[&scene];
		manager.LinkObjects(&obj1A, &obj2A);
		{
			std::vector<RuntimeObject*> linkedObjects = manager.GetObjectsLinkedWith(&obj1A);
			REQUIRE(linkedObjects.size() == 1);
			REQUIRE(linkedObjects[0] == &obj2A);
		}
		{
			std::vector<RuntimeObject*> linkedObjects = manager.GetObjectsLinkedWith(&obj2A);
			REQUIRE(linkedObjects.size() == 1);
			REQUIRE(linkedObjects[0] == &obj1A);
		}

		//Link more objects
		manager.LinkObjects(&obj1A, &obj2A); //Including the same objects as before
		manager.LinkObjects(&obj1A, &obj2B);
		manager.LinkObjects(&obj1A, &obj2C);
		{
			std::vector<RuntimeObject*> linkedObjects = manager.GetObjectsLinkedWith(&obj1A);
			REQUIRE(linkedObjects.size() == 3);
		}
		{
			std::vector<RuntimeObject*> linkedObjects = manager.GetObjectsLinkedWith(&obj2C);
			REQUIRE(linkedObjects.size() == 1);
			REQUIRE(linkedObjects[0] == &obj1A);
		}

		//Remove all links
		manager.LinkObjects(&obj2B, &obj2C);
		manager.RemoveAllLinksOf(&obj1A);
		manager.RemoveAllLinksOf(&obj1A);
		{
			std::vector<RuntimeObject*> linkedObjects = manager.GetObjectsLinkedWith(&obj1A);
			REQUIRE(linkedObjects.size() == 0);
		}
		{
			std::vector<RuntimeObject*> linkedObjects = manager.GetObjectsLinkedWith(&obj2A);
			REQUIRE(linkedObjects.size() == 0);
		}
		{
			std::vector<RuntimeObject*> linkedObjects = manager.GetObjectsLinkedWith(&obj2C);
			REQUIRE(linkedObjects.size() == 1);
			REQUIRE(linkedObjects[0] == &obj2B);
		}

	}
}
