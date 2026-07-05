/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
/**
 * @file Tests covering events of GDevelop Core.
 */
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include <memory>
#include "GDCore/CommonTools.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerationContext.h"
#include "GDCore/Extensions/Metadata/ParameterMetadata.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/ParameterMetadataContainer.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Tools/VersionWrapper.h"
#include "catch.hpp"

TEST_CASE("EventsCodeGenerator", "[common][events]") {
  SECTION("Basics") {
    gd::Project project;
    auto& layout = project.InsertNewLayout("Layout 1", 0);
    gd::Platform platform;
    gd::EventsCodeGenerator codeGenerator(project, layout, platform);

    REQUIRE(codeGenerator.ConvertToString(
                "Hello \"world\"!\nThis is a backslash \\") ==
            "Hello \\\"world\\\"!\\nThis is a backslash \\\\");

    REQUIRE(codeGenerator.ConvertToString("{\"hello\": \"world \\\" \"}") ==
            "{\\\"hello\\\": \\\"world \\\\\\\" \\\"}");
    REQUIRE(codeGenerator.ConvertToString("{\"hello\":\r\n\"world \\\" \"}") ==
            "{\\\"hello\\\":\\r\\n\\\"world \\\\\\\" \\\"}");
  }

  SECTION("Optional empty expression parameters use default values") {
    gd::Project project;
    auto& layout = project.InsertNewLayout("Layout 1", 0);
    gd::Platform platform;
    class TestEventsCodeGenerator : public gd::EventsCodeGenerator {
     public:
      TestEventsCodeGenerator(const gd::Project& project_,
                              const gd::Layout& layout_,
                              const gd::Platform& platform_)
          : gd::EventsCodeGenerator(project_, layout_, platform_) {}

      using gd::EventsCodeGenerator::GenerateParameterCodes;
    };
    TestEventsCodeGenerator codeGenerator(project, layout, platform);
    unsigned int maxDepth = 0;
    gd::EventsCodeGenerationContext context(&maxDepth);

    gd::ParameterMetadata optionalString;
    optionalString.SetType("string").SetOptional();
    REQUIRE(codeGenerator.GenerateParameterCodes(gd::Expression(""),
                                                 optionalString,
                                                 context,
                                                 "",
                                                 nullptr) == "\"\"");

    gd::ParameterMetadata optionalNumber;
    optionalNumber.SetType("number").SetOptional();
    REQUIRE(codeGenerator.GenerateParameterCodes(gd::Expression(""),
                                                 optionalNumber,
                                                 context,
                                                 "",
                                                 nullptr) == "0");

    gd::ParameterMetadataContainer parametersInfo;
    parametersInfo.InsertNewParameter("StringWithEmptyDefault", 0)
        .SetType("string")
        .SetOptional();
    parametersInfo.InsertNewParameter("NumberWithEmptyDefault", 1)
        .SetType("number")
        .SetOptional();
    parametersInfo.InsertNewParameter("StringWithExplicitDefault", 2)
        .SetType("string")
        .SetOptional()
        .SetDefaultValue("\"fallback\"");

    std::vector<gd::Expression> parameters;
    parameters.push_back(gd::Expression(""));
    parameters.push_back(gd::Expression(""));
    parameters.push_back(gd::Expression(""));

    std::vector<gd::String> parameterCodes =
        codeGenerator.GenerateParametersCodes(parameters, parametersInfo, context);
    REQUIRE(parameterCodes.size() == 3);
    REQUIRE(parameterCodes[0] == "\"\"");
    REQUIRE(parameterCodes[1] == "0");
    REQUIRE(parameterCodes[2] == "\"fallback\"");
  }
}
