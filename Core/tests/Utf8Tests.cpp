/*
 * GDevelop Core
 * Copyright 2015 Victor Levasseur (victorlevasseur52@gmail.com)
 * This project is released under the MIT License.
 */
/**
 * @file Tests covering utf8 features from GDevelop Core.
 */

#include <string>
#include "catch.hpp"
#include "GDCore/Utf8Tools.h"
#include <SFML/System/String.hpp>

TEST_CASE( "Utf8 Tools", "[common][utf8]") {
	SECTION("Conversion") {
		std::string utf8str = u8"UTF8 a été testé !";

		std::wstring wstr = gd::utf8::ToWString(utf8str);
		sf::String sfstr = gd::utf8::ToSfString(utf8str);

		REQUIRE(utf8str == gd::utf8::FromWString(wstr));
		REQUIRE(utf8str == gd::utf8::FromSfString(sfstr));
	}
}