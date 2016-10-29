/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
/**
 * @file Tests covering FileStream class of GDevelop Core.
 */
#include "catch.hpp"
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/FileStream.h"
#include <fstream>
#include <memory>

TEST_CASE( "FileStream", "[common][fstream]" ) {

	//Creating the test file
	std::ofstream testFile("FileStreamTest.test");
	REQUIRE(testFile.is_open());

	testFile << "this is the first line of the test file!\n";
	testFile << "the last line!";
	testFile.close();

    SECTION("Opening a file") {
		gd::FileStream f;
		f.open("FileStreamTest.test", std::ios_base::in);

		REQUIRE(f.is_open() == true);
		REQUIRE(f.tellg() == 0);

		std::string lineContent;
		REQUIRE(f.eof() == false);
		std::getline(f, lineContent);
		REQUIRE(lineContent == "this is the first line of the test file!");

		REQUIRE(f.eof() == false);
		std::getline(f, lineContent);
		REQUIRE(lineContent == "the last line!");

		REQUIRE(f.eof() == true);
		REQUIRE(f.fail() == false);

		f.close();
		REQUIRE(f.is_open() == false);
		REQUIRE(f.fail() == false);
	}

	SECTION("std::ios_base::ate") {
		gd::FileStream f;
		f.open("FileStreamTest.test", std::ios_base::in|std::ios_base::ate);

		REQUIRE(f.is_open() == true);
		REQUIRE(f.tellg() > 0);
	}
}
