/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
/**
 * @file Tests covering common features of GDevelop C++ Platform.
 */
#include "catch.hpp"
#include "GDCore/CommonTools.h"
#include "GDCore/Project/ClassWithObjects.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Object.h"
#include "GDCpp/Runtime/RuntimeScene.h"
#include "GDCpp/Runtime/RuntimeGame.h"
#include "GDCpp/Runtime/RuntimeObject.h"
#include "GDCpp/Runtime/RuntimeObjectsListsTools.h"
#include "GDCpp/Extensions/Builtin/RuntimeSceneTools.h"

TEST_CASE( "ObjectsListsTools", "[game-engine]" ) {
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
	SECTION("PickObjectsIf") {
		std::map <gd::String, std::vector<RuntimeObject*> *> map;
		std::vector<RuntimeObject*> list1 = {&obj1A, &obj1B, &obj1C};
		map["1"] = &list1;

		REQUIRE(PickObjectsIf(map, false, [](RuntimeObject*){
			return true;
		}) == true);

		REQUIRE(list1.size() == 3);

		REQUIRE(PickObjectsIf(map, true, [](RuntimeObject*){
			return false;
		}) == true);

		REQUIRE(list1.size() == 3);

		REQUIRE(PickObjectsIf(map, false, [&obj1A, &obj1C](RuntimeObject* obj){
			return obj == &obj1A || obj == &obj1C;
		}) == true);

		REQUIRE(list1.size() == 2);

		REQUIRE(PickObjectsIf(map, true, [&obj1C](RuntimeObject* obj){
			return obj == &obj1C;
		}) == true);

		REQUIRE(list1.size() == 1);
		REQUIRE(list1[0] == &obj1A);
	}
	SECTION("TwoObjectListsTest") {

		std::map <gd::String, std::vector<RuntimeObject*> *> map1;
		std::map <gd::String, std::vector<RuntimeObject*> *> map2;
		std::vector<RuntimeObject*> list1 = {&obj1A, &obj1B, &obj1C};
		std::vector<RuntimeObject*> list2 = {&obj2A, &obj2B, &obj2C};
		map1["1"] = &list1;
		map2["2"] = &list2;

		REQUIRE(TwoObjectListsTest(map1, map2, false, [](RuntimeObject*, RuntimeObject*){
			return true;
		}) == true);
		REQUIRE(TwoObjectListsTest(map1, map2, true, [](RuntimeObject*, RuntimeObject*){
			return false;
		}) == true);

		REQUIRE(list1.size() == 3); //Lists should not have been changed.
		REQUIRE(list2.size() == 3);

		REQUIRE( TwoObjectListsTest(map1, map2, true, [&obj1B, &obj2C](RuntimeObject* obj1, RuntimeObject* obj2){
			return obj1 == &obj1B && obj2 == &obj2C;
		}) == true);
		REQUIRE(list1.size() == 2); //obj1B should have been filtered out.
		REQUIRE(list2.size() == 3); //but not obj2C

		REQUIRE( TwoObjectListsTest(map1, map2, false, [&obj1A, &obj2C](RuntimeObject* obj1, RuntimeObject* obj2){
			return obj1 == &obj1A && obj2 == &obj2C;
		}) == true);
		REQUIRE(list1.size() == 1); //All objects but obj1A and obj2C
		REQUIRE(list2.size() == 1); //should have been filtered out
		REQUIRE(list1[0] == &obj1A);
		REQUIRE(list2[0] == &obj2C);
	}
	SECTION("PickNearestObject") {
		std::map <gd::String, std::vector<RuntimeObject*> *> map;
		std::vector<RuntimeObject*> list1 = {&obj1A, &obj1B, &obj1C};
		map["1"] = &list1;
		obj1A.SetX(50);
		obj1A.SetY(50);
		obj1B.SetX(160);
		obj1B.SetY(160);
		obj1C.SetX(100);
		obj1C.SetY(300);

		REQUIRE(PickNearestObject(map, 100, 90, false) == true);
		REQUIRE(list1.size() == 1);
		REQUIRE(list1[0] == &obj1A);

		SECTION("Furthest") {
			std::map <gd::String, std::vector<RuntimeObject*> *> map;
			std::vector<RuntimeObject*> list1 = {&obj1A, &obj1B, &obj1C};
			map["1"] = &list1;


			REQUIRE(PickNearestObject(map, 100, 90, true) == true);
			REQUIRE(list1.size() == 1);
			REQUIRE(list1[0] == &obj1C);
		}
	}
}
