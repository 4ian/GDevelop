/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
/**
 * @file Tests covering common features of GDevelop Core.
 */
#include "catch.hpp"
#include "GDCore/String.h"
#include "GDCore/Events/Parsers/VariableParser.h"

namespace
{
    class TestVariableParserCallbacks : public gd::VariableParserCallbacks
    {
    public:
        TestVariableParserCallbacks(gd::String &debugStr) : VariableParserCallbacks(), debugStr(debugStr) {}

        virtual void OnRootVariable(gd::String variableName)
        {
            debugStr += "OnRootVariable(" + variableName + ")\n";
        }

        virtual void OnChildVariable(gd::String variableName)
        {
            debugStr += "OnChildVariable(" + variableName + ")\n";
        }

        virtual void OnChildSubscript(gd::String stringExpression)
        {
            debugStr += "OnChildSubscript(" + stringExpression + ")\n";
        }

    private:
        gd::String &debugStr;
    };
}

TEST_CASE( "VariableParser", "[common][events]" ) {
    SECTION("Basics") {
        {
            gd::String str;
            TestVariableParserCallbacks callbacks(str);
            gd::VariableParser parser("myVar");
            parser.Parse(callbacks);

            REQUIRE( str == "OnRootVariable(myVar)\n" );
        }
        {
            gd::String str;
            TestVariableParserCallbacks callbacks(str);
            gd::VariableParser parser("myVar.child1.child2");
            parser.Parse(callbacks);

            REQUIRE( str == "OnRootVariable(myVar)\nOnChildVariable(child1)\nOnChildVariable(child2)\n" );
        }
        {
            gd::String str;
            TestVariableParserCallbacks callbacks(str);
            gd::VariableParser parser("myVar[ToString(i) + \"é\"].child");
            parser.Parse(callbacks);

            REQUIRE( str == "OnRootVariable(myVar)\nOnChildSubscript(ToString(i) + \"é\")\nOnChildVariable(child)\n" );
        }
    }
}
