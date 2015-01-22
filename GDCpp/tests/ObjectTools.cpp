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
#include "GDCore/PlatformDefinition/Object.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/RuntimeGame.h"
#include "GDCpp/RuntimeObject.h"
#include "GDCpp/BuiltinExtensions/ObjectTools.h"

namespace {
	bool AlwaysTrue(RuntimeObject*, RuntimeObject*, const ListsTestFuncExtraParameter &)
	{
		return true;
	}
	bool AlwaysFalse(RuntimeObject*, RuntimeObject*, const ListsTestFuncExtraParameter &)
	{
		return false;
	}

	struct ObjectsExtraParameter : public ListsTestFuncExtraParameter
	{
		ObjectsExtraParameter(RuntimeObject* o1_, RuntimeObject* o2_) : o1(o1_), o2(o2_) {};

		RuntimeObject* o1;
		RuntimeObject* o2;
	};
	bool TrueFor(RuntimeObject* o1, RuntimeObject* o2, const ListsTestFuncExtraParameter & extraParameter)
	{
    	const ObjectsExtraParameter & objects = dynamic_cast<const ObjectsExtraParameter&>(extraParameter);
		return o1 == objects.o1 && o2 == objects.o2;
	}

}

TEST_CASE( "ObjectTools", "[game-engine]" ) {
	SECTION("TwoObjectListsTest") {
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

		std::map <std::string, std::vector<RuntimeObject*> *> map1;
		std::map <std::string, std::vector<RuntimeObject*> *> map2;
		std::vector<RuntimeObject*> list1;
		std::vector<RuntimeObject*> list2;
		list1.push_back(&obj1A);
		list1.push_back(&obj1B);
		list1.push_back(&obj1C);
		list2.push_back(&obj2A);
		list2.push_back(&obj2B);
		list2.push_back(&obj2C);
		map1["1"] = &list1;
		map2["2"] = &list2;

		ListsTestFuncExtraParameter useless;
		REQUIRE( TwoObjectListsTest(map1, map2, false, ::AlwaysTrue, useless) == true);
		REQUIRE( TwoObjectListsTest(map1, map2, true, ::AlwaysFalse, useless) == true);

		REQUIRE(list1.size() == 3); //Lists should not have been changed.
		REQUIRE(list2.size() == 3);

		::ObjectsExtraParameter objects(&obj1B, &obj2C);
		REQUIRE( TwoObjectListsTest(map1, map2, true, ::TrueFor, objects) == true);
		REQUIRE(list1.size() == 2); //obj1B should have been filtered out.
		REQUIRE(list2.size() == 3); //but not obj2C

		::ObjectsExtraParameter objects2(&obj1A, &obj2C);
		REQUIRE( TwoObjectListsTest(map1, map2, false, ::TrueFor, objects2) == true);
		REQUIRE(list1.size() == 1); //All objects but obj1A and obj2C
		REQUIRE(list2.size() == 1); //should have been filtered out
		REQUIRE(list1[0] == &obj1A);
		REQUIRE(list2[0] == &obj2C);
	}
}
