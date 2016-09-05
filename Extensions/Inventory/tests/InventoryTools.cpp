/**

GDevelop - Inventory Extension
Copyright (c) 2011-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "catch.hpp"
#include "../InventoryTools.h"
#include "GDCpp/Runtime/Project/Variable.h"
#include "GDCpp/Runtime/Serialization/Serializer.h"
#include "GDCpp/Runtime/RuntimeScene.h"
#include "GDCpp/Runtime/RuntimeGame.h"

TEST_CASE( "InventoryTools", "[game-engine][inventory-tools]" ) {
	SECTION("InventoryTools") {
		RuntimeGame game;
		RuntimeScene scene(NULL, &game);

		InventoryTools::Add(scene, "MyInventory", "sword");
		InventoryTools::Add(scene, "MyInventory", "sword");
		InventoryTools::Equip(scene, "MyInventory", "sword", true);
		InventoryTools::Add(scene, "MyInventory", "armor");
		InventoryTools::SetMaximum(scene, "MyInventory", "armor", 1);

		gd::Variable variable;
		InventoryTools::SerializeToVariable(scene, "MyInventory", variable);
		InventoryTools::UnserializeFromVariable(scene, "MyInventory2", variable);

		REQUIRE(InventoryTools::Count(scene, "MyInventory2", "sword") == 2);
		REQUIRE(InventoryTools::IsEquipped(scene, "MyInventory2", "sword") == true);
		REQUIRE(InventoryTools::Count(scene, "MyInventory2", "armor") == 1);
		REQUIRE(InventoryTools::Add(scene, "MyInventory2", "armor") == false);
	}
}
