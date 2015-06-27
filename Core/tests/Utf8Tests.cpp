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
#include "GDCore/Utf8String.h"
#include "GDCore/Utf8Tools.h"
#include <SFML/System/String.hpp>

TEST_CASE( "Utf8 String", "[common][utf8]") {
	SECTION("Conversion") {
		gd::String str = u8"UTF8 a été testé !";

		sf::String sfStr = str;
		std::u32string u32str = str.ToUTF32();

		REQUIRE( str == gd::String::FromSfString(sfStr) );
		REQUIRE( str == gd::String::FromUTF32(u32str) );
	}

	SECTION("Length") {
		gd::String str = u8"UTF8 a été testé !";

		REQUIRE( str.size() == 18 );
	}

	SECTION("Substring") {
		gd::String str = u8"UTF8 a été testé !";

		REQUIRE( str.substr(5, 7) == u8"a été t" );
		REQUIRE( str.substr(5, gd::String::npos) == u8"a été testé !" );

		REQUIRE_THROWS_AS( str.substr(50, 5), std::out_of_range );
	}

	SECTION("Find") {
		gd::String str = u8"UTF8 a été testé !";

		REQUIRE( str.find( u8"té", 0) == 8);
		REQUIRE( str.find( u8"té", 8) == 8);
		REQUIRE( str.find( u8"té", 9) == 14);
		REQUIRE( str.find( u8"té", 14) == 14);
		REQUIRE( str.find( u8"té", 15) == gd::String::npos);
	}

	SECTION("RFind") {
		gd::String str = u8"UTF8 a été testé !";

		REQUIRE( str.rfind(u8"té", std::string::npos) == 14 );
		REQUIRE( str.rfind(u8"té", 14) == 14 );
		REQUIRE( str.rfind(u8"té", 13) == 8 );
		REQUIRE( str.rfind(u8"té", 8) == 8 );
		REQUIRE( str.rfind(u8"té", 7) == std::string::npos );
	}
}