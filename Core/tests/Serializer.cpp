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

using namespace gd;

TEST_CASE( "Serializer", "[common]" ) {

    SECTION("JSON basics") {
        std::string originalJSON = "{\"ok\": true,\"hello\": \"world\"}";
        SerializerElement element = Serializer::FromJSON(originalJSON);
        REQUIRE(element.GetChild("ok").GetValue().GetBool() == true);
        REQUIRE(element.GetChild("hello").GetValue().GetString() == "world");

        SECTION("Multiple JSON un/serialization") {
            std::string json = Serializer::ToJSON(element);
            SerializerElement element2 = Serializer::FromJSON(json);
            std::string json2 = Serializer::ToJSON(element2);

            REQUIRE(json == originalJSON);
            REQUIRE(json2 == originalJSON);
        }
    }

    SECTION("Quotes and special characters") {
        std::string originalJSON = "{\"caret-prop\": true,\"hello\": \" \\\"quote\\\" \",\"special\": \"\\b\\f\\n\\r\\t\"}";
        SerializerElement element = Serializer::FromJSON(originalJSON);
        REQUIRE(element.GetChild("caret-prop").GetValue().GetBool() == true);
        REQUIRE(element.GetChild("hello").GetValue().GetString() == " \"quote\" ");
        REQUIRE(element.GetChild("special").GetValue().GetString() == "\b\f\n\r\t");

        SECTION("Multiple JSON un/serialization") {
            std::string json = Serializer::ToJSON(element);
            SerializerElement element2 = Serializer::FromJSON(json);
            std::string json2 = Serializer::ToJSON(element2);

            REQUIRE(json == originalJSON);
            REQUIRE(json2 == originalJSON);
        }
    }

    // SECTION("XML basics") {
    //     std::string originalXML = "<root><ok>true</ok><hello></world></root>";
    //     SerializerElement element = Serializer::FromXML(originalXML);
    //     REQUIRE(element.GetChild("ok").GetValue().GetBool() == true);
    //     REQUIRE(element.GetChild("hello").GetValue().GetString() == "world");

    //     SECTION("Multiple XML un/serialization") {
    //         std::string xml = Serializer::ToXML(element);
    //         SerializerElement element2 = Serializer::FromXML(xml);
    //         std::string xml2 = Serializer::ToXML(element2);

    //         REQUIRE(xml == originalXML);
    //         REQUIRE(json2 == originalXML);
    //     }
    // }
}
