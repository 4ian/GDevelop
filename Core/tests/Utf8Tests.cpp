/*
 * GDevelop Core
 * Copyright 2015 Victor Levasseur (victorlevasseur52@gmail.com)
 * This project is released under the MIT License.
 */
/**
 * @file Tests covering utf8 features from GDevelop Core.
 */

#include <exception>
#include <iostream>
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

	SECTION("Replace") {
		//Testing the interval version of replace
		gd::String str = u8"UTF8 a été testé !";

		REQUIRE( str.replace(11, 5, u8"vérifié") == u8"UTF8 a été vérifié !" );
		REQUIRE( str.replace(11, gd::String::npos, u8"vraiment très testé !")
			== u8"UTF8 a été vraiment très testé !" );

		REQUIRE_THROWS_AS( str.replace(50, 5, u8"Cela va planter."),
			std::out_of_range );

		//Testing the iterator version of replace
		gd::String str2 = u8"UTF8 a été testé !";

		gd::String::iterator i1 = str2.begin();
		std::advance(i1, 11);
		gd::String::iterator i2 = i1;
		std::advance(i2, 5);

		REQUIRE( str2.replace(i1, i2, u8"vérifié") == u8"UTF8 a été vérifié !" );

		gd::String::iterator i3 = str2.begin();
		std::advance(i3, 11);

		REQUIRE( str2.replace(i3, str2.end(), u8"vraiment très testé !")
			== u8"UTF8 a été vraiment très testé !" );
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
		REQUIRE( str.rfind(u8"té !", gd::String::npos) == 14 );
		REQUIRE( str.rfind(u8"té", gd::String::npos) == 14 );
		REQUIRE( str.rfind(u8"té", 14) == 14 );
		REQUIRE( str.rfind(u8"té", 13) == 8 );
		REQUIRE( str.rfind(u8"té", 8) == 8 );
		REQUIRE( str.rfind(u8"té", 7) == std::string::npos );
	}
}
