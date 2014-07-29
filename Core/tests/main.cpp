
#define CATCH_CONFIG_MAIN  // This tells Catch to provide a main() - only do this in one cpp file
#include "catch.hpp"
#include "GDCore/CommonTools.h"
#include "GDCore/PlatformDefinition/Project.h"

TEST_CASE( "Common tools", "[common]" ) {
    REQUIRE( gd::ToInt("1") == 1 );
    REQUIRE( gd::ToString(2) == "2" );
}

TEST_CASE( "Project", "[common]" ) {
	gd::Project project;
	project.SetName("myname");
    REQUIRE( project.GetName() == "myname" );
}