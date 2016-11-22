/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
/**
 * @file Tests covering common features of GDevelop C++ Platform.
 */
#include "catch.hpp"
#include "GDCpp/Runtime/StringFormatter.h"

TEST_CASE( "FormatString", "[string]" ) {
	SECTION("{ and } escaping") {
		REQUIRE( FormatString("test{{aaa}} }}") == "test{aaa} }" );
		REQUIRE( FormatString("this is {{a test}}}} }}") == "this is {a test}} }" );

		REQUIRE_THROWS( FormatString("this {ll}!") );
		REQUIRE_THROWS( FormatString("this }!") );
		REQUIRE_THROWS( FormatString("this {1") );
	}

	SECTION("String arguments") {
		REQUIRE( FormatString("{1} is {0} great {2}", "a", "This", "sentence") == "This is a great sentence" );

		REQUIRE( FormatString("{11} is {10} great {12}", //Testing with two digit indexes
			"", "", "", "", "", "", "", "", "", "",
			"a", "This", "sentence") == "This is a great sentence"
		);
	}

	SECTION("Numeric arguments") {
		REQUIRE( FormatString("{0} is less than {1}.", -2, 53.5f) == "-2 is less than 53.5." );
	}
}
