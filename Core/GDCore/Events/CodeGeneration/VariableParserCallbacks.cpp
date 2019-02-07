/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY)
#include "VariableParserCallbacks.h"
#include <string>
#include <vector>
#include "GDCore/Events/CodeGeneration/EventsCodeGenerationContext.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/Events/CodeGeneration/ExpressionCodeGenerator.h"
#include "GDCore/Events/Parsers/VariableParser.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Metadata/ObjectMetadata.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"

using namespace std;

namespace gd {

VariableCodeGenerationCallbacks::VariableCodeGenerationCallbacks(
    gd::String& output_,
    gd::EventsCodeGenerator& codeGenerator_,
    gd::EventsCodeGenerationContext& context_,
    const gd::EventsCodeGenerator::VariableScope& scope_)
    : output(output_),
      codeGenerator(codeGenerator_),
      context(context_),
      scope(scope_) {
  if (scope == gd::EventsCodeGenerator::OBJECT_VARIABLE) {
    std::cout << "ERROR: Initializing VariableCodeGenerationCallbacks with "
                 "OBJECT_VARIABLE without object.";
  }
}

VariableCodeGenerationCallbacks::VariableCodeGenerationCallbacks(
    gd::String& output_,
    gd::EventsCodeGenerator& codeGenerator_,
    gd::EventsCodeGenerationContext& context_,
    const gd::String& object_)
    : output(output_),
      codeGenerator(codeGenerator_),
      context(context_),
      scope(gd::EventsCodeGenerator::OBJECT_VARIABLE),
      object(object_) {}

void VariableCodeGenerationCallbacks::OnRootVariable(gd::String variableName) {
  output += codeGenerator.GenerateGetVariable(variableName, scope, context, object);
}

void VariableCodeGenerationCallbacks::OnChildVariable(gd::String variableName) {
  output += codeGenerator.GenerateVariableAccessor(variableName);
}

void VariableCodeGenerationCallbacks::OnChildSubscript(
    gd::String stringExpression) {
  gd::String argumentCode = gd::ExpressionCodeGenerator::GenerateExpressionCode(
      codeGenerator, context, "string", stringExpression);

  output += codeGenerator.GenerateVariableBracketAccessor(argumentCode);
}

}
#endif
