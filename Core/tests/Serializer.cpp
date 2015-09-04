/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
/**
 * @file Tests covering serialization to JSON.
 */
#include "catch.hpp"
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/SystemStats.h"
#include "GDCore/Tools/VersionWrapper.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/Variable.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Events/Builtin/StandardEvent.h"
#include "GDCore/Events/Serialization.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Serialization/Splitter.h"

using namespace gd;

TEST_CASE( "Serializer", "[common]" ) {

    SECTION("JSON basics") {
        std::string originalJSON = "{\"ok\": true,\"hello\": \"world\"}";
        SerializerElement element = Serializer::FromJSON(originalJSON);
        REQUIRE(element.GetChild("ok").GetValue().GetBool() == true);
        REQUIRE(element.GetChild("hello").GetValue().GetString() == "world");

        std::string json = Serializer::ToJSON(element);
        REQUIRE(json == originalJSON);
    }

    SECTION("Quotes and special characters") {
        std::string originalJSON = "{\"\\\"hello\\\"\": \" \\\"quote\\\" \",\"caret-prop\": 1,\"special-\\b\\f\\n\\r\\t\\\"\": \"\\b\\f\\n\\r\\t\"}";
        SerializerElement element = Serializer::FromJSON(originalJSON);
        REQUIRE(element.GetChild("caret-prop").GetValue().GetBool() == true);
        REQUIRE(element.GetChild("\"hello\"").GetValue().GetString() == " \"quote\" ");
        REQUIRE(element.GetChild("special-\b\f\n\r\t\"").GetValue().GetString() == "\b\f\n\r\t");

        std::string json = Serializer::ToJSON(element);
        REQUIRE(json == originalJSON);
    }

    SECTION("Splitter") {
        SECTION("Split elements") {
            //Create some elements
            SerializerElement root;
            root.AddChild("a").AddChild("a1").SetValue(gd::String("hello"));
            root.AddChild("b").AddChild("b1").SetValue(gd::String("world"));
            root.AddChild("c").AddChild("c1").SetValue(3);
            auto & layouts = root.AddChild("layouts");
            layouts.ConsiderAsArrayOf("layout");
            for(auto i = 0;i<5;++i) {
                auto & layout = layouts.AddChild("layout");
                layout.SetAttribute("name", "layout" + gd::String::From(i));
                layout.AddChild("child").SetValue(42);
            }

            //And split them
            gd::Splitter splitter;
            auto splitElements = splitter.Split(root, {"/a/a1", "/layouts/layout"});
            REQUIRE(splitElements.size() == 6);
            REQUIRE(splitElements[0].path == "/a/a1");
            REQUIRE(splitElements[1].path == "/layouts/layout");
            REQUIRE(splitElements[1].name == "layout0");
            REQUIRE(Serializer::ToJSON(splitElements[0].element) ==
                "\"hello\""
            );
            REQUIRE(Serializer::ToJSON(splitElements[1].element) ==
                "{\"name\": \"layout0\",\"child\": 42}"
            );
            REQUIRE(Serializer::ToJSON(root) ==
                "{\"a\": {\"a1\": {\"name\": \"\",\"referenceTo\": \"/a/a1\"}},\"b\": {\"b1\": \"world\"},\"c\": {\"c1\": 3},\"layouts\": [{\"name\": \"layout0\",\"referenceTo\": \"/layouts/layout\"},{\"name\": \"layout1\",\"referenceTo\": \"/layouts/layout\"},{\"name\": \"layout2\",\"referenceTo\": \"/layouts/layout\"},{\"name\": \"layout3\",\"referenceTo\": \"/layouts/layout\"},{\"name\": \"layout4\",\"referenceTo\": \"/layouts/layout\"}]}"
            );
        }
        SECTION("Unsplit elements") {
            //Get a JSON with elements being reference to split elements
            std::string originalJSON = "{\"a\": {\"a1\": {\"name\": \"\",\"referenceTo\": \"/a/a1\"}},\"b\": {\"b1\": \"world\"},\"c\": {\"c1\": 3},\"layouts\": [{\"name\": \"layout0\",\"referenceTo\": \"/layouts/layout\"},{\"name\": \"layout1\",\"referenceTo\": \"/layouts/layout\"},{\"name\": \"layout2\",\"referenceTo\": \"/layouts/layout\"},{\"name\": \"layout3\",\"referenceTo\": \"/layouts/layout\"},{\"name\": \"layout4\",\"referenceTo\": \"/layouts/layout\"}]}";
            SerializerElement root = Serializer::FromJSON(originalJSON);

            gd::Splitter splitter;
            splitter.Unsplit(root, [](gd::String path, gd::String name) {
                //Return new elements to replace the split elements
                SerializerElement element;
                element.SetAttribute("path", path);
                element.SetAttribute("name", name);
                element.AddChild("child").SetValue(name == "" ? 41 : 42);

                return element;
            });

            //Check that we can now get elements, with all split elements
            //replaced by the new ones.
            root.GetChild("layouts").ConsiderAsArrayOf("layout");
            REQUIRE(root.GetChild("a").GetChild("a1").GetStringAttribute("name") == "");
            REQUIRE(root.GetChild("a").GetChild("a1").GetChild("child").GetValue().GetInt() == 41);
            REQUIRE(root.GetChild("layouts").GetChild(0).GetStringAttribute("path") == "/layouts/layout");
            REQUIRE(root.GetChild("layouts").GetChild(1).GetStringAttribute("name") == "layout1");
            REQUIRE(root.GetChild("layouts").GetChild(2).GetChild("child").GetValue().GetInt() == 42);
        }
    }
}
