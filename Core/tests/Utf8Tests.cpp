/*
 * GDevelop Core
 * Copyright 2015 Victor Levasseur (victorlevasseur52@gmail.com)
 * This project is released under the MIT License.
 */
/**
 * @file Tests covering utf8 features from GDevelop Core.
 */

#include <exception>
#include <string>
#include "catch.hpp"
#include "GDCore/Utf8Tools.h"
#include <SFML/System/String.hpp>

TEST_CASE( "Utf8 Tools", "[common][utf8]") {
	SECTION("Conversion") {
		std::string utf8str = u8"UTF8 a été testé !";

		std::wstring wstr = gd::utf8::ToWString( utf8str );
		sf::String sfstr = gd::utf8::ToSfString( utf8str );

		REQUIRE( utf8str == gd::utf8::FromWString(wstr) );
		REQUIRE( utf8str == gd::utf8::FromSfString(sfstr) );
	}

	SECTION("Length") {
		std::string utf8str = u8"UTF8 a été testé !";

		REQUIRE( gd::utf8::StrLength(utf8str) == 18 );
	}

	SECTION("Substring") {
		std::string utf8str = u8"UTF8 a été testé !";

		REQUIRE( gd::utf8::SubStr(utf8str, 5, 7) == u8"a été t" );
		REQUIRE( gd::utf8::SubStr(utf8str, 5, std::string::npos) == u8"a été testé !" );

		REQUIRE_THROWS_AS( gd::utf8::SubStr(utf8str, 50, 5), std::out_of_range );
	}

	SECTION("Find") {
		std::string utf8str = u8"UTF8 a été testé !";

		REQUIRE( gd::utf8::Find(utf8str, u8"té", 0) == 8);
		REQUIRE( gd::utf8::Find(utf8str, u8"té", 8) == 8);
		REQUIRE( gd::utf8::Find(utf8str, u8"té", 9) == 14);
		REQUIRE( gd::utf8::Find(utf8str, u8"té", 14) == 14);
		REQUIRE( gd::utf8::Find(utf8str, u8"té", 15) == std::string::npos);
	}

	SECTION("RFind") {
		std::string utf8str = u8"UTF8 a été testé !";

		REQUIRE( gd::utf8::RFind(utf8str, u8"té", std::string::npos) == 14 );
		REQUIRE( gd::utf8::RFind(utf8str, u8"té", 14) == 14 );
		REQUIRE( gd::utf8::RFind(utf8str, u8"té", 13) == 8 );
		REQUIRE( gd::utf8::RFind(utf8str, u8"té", 8) == 8 );
		REQUIRE( gd::utf8::RFind(utf8str, u8"té", 7) == std::string::npos );
	}
}