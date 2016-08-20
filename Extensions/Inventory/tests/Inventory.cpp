/**

GDevelop - Inventory Extension
Copyright (c) 2011-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
/**
 * @file Tests for the Inventory extension.
 */
#define CATCH_CONFIG_MAIN
#include "catch.hpp"
#include "../Inventory.h"

TEST_CASE( "Inventory", "[game-engine][inventory]" ) {
	SECTION("Inventory") {
		Inventory inventory;

		// Is empty when constructed") {
		REQUIRE(inventory.Has("sword") == false);
		REQUIRE(inventory.Has("soul reaver") == false);

		// Can receive one or more items") {
		REQUIRE(inventory.Add("sword") == true);
		REQUIRE(inventory.Has("sword") == true);
		REQUIRE(inventory.Has("soul reaver") == false);

		REQUIRE(inventory.Add("soul reaver") == true);
		REQUIRE(inventory.Add("sword") == true);
		REQUIRE(inventory.Has("sword") == true);
		REQUIRE(inventory.Has("soul reaver") == true);

		// Can return the number of items") {
		REQUIRE(inventory.Count("sword") == 2);
		REQUIRE(inventory.Count("soul reaver") == 1);

		// Can equip items") {
		REQUIRE(inventory.Equip("soul reaver", true) == true);
		REQUIRE(inventory.IsEquipped("soul reaver") == true);

		REQUIRE(inventory.Equip("sword", true) == true);
		REQUIRE(inventory.IsEquipped("sword") == true);
		REQUIRE(inventory.Equip("sword", false) == true);
		REQUIRE(inventory.IsEquipped("sword") == false);
		REQUIRE(inventory.Equip("sword", true) == true);

		REQUIRE(inventory.Equip("nothing", true) == false);
		REQUIRE(inventory.IsEquipped("nothing") == false);

		// Support removing an item") {
		REQUIRE(inventory.Remove("sword") == true);
		REQUIRE(inventory.Count("sword") == 1);
		REQUIRE(inventory.IsEquipped("sword") == true);

		REQUIRE(inventory.Remove("sword") == true);
		REQUIRE(inventory.Count("sword") == 0);
		REQUIRE(inventory.IsEquipped("sword") == false);

		REQUIRE(inventory.Remove("sword") == false);
		REQUIRE(inventory.Count("sword") == 0);

		REQUIRE(inventory.Count("soul reaver") == 1);
		REQUIRE(inventory.IsEquipped("soul reaver") == true);

		// Can support having a limited number of objects") {
		REQUIRE(inventory.Count("heavy sword") == 0);
		inventory.SetMaximum("heavy sword", 2);
		REQUIRE(inventory.Add("heavy sword") == true);
		REQUIRE(inventory.Count("heavy sword") == 1);
		REQUIRE(inventory.Has("heavy sword") == true);

		REQUIRE(inventory.Add("heavy sword") == true);
		REQUIRE(inventory.Count("heavy sword") == 2);
		REQUIRE(inventory.Add("heavy sword") == false);
		REQUIRE(inventory.Count("heavy sword") == 2);
		inventory.SetUnlimited("heavy sword", true);
		REQUIRE(inventory.Count("heavy sword") == 2);
		REQUIRE(inventory.Add("heavy sword") == true);
		REQUIRE(inventory.Add("heavy sword") == true);
		REQUIRE(inventory.Count("heavy sword") == 4);

		inventory.SetMaximum("never sword", 0);
		REQUIRE(inventory.Add("never sword") == false);
		REQUIRE(inventory.Has("never sword") == false);
		REQUIRE(inventory.Count("never sword") == 0);
	}
}
