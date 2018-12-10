/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY)

#ifndef EventsCodeGenerator_H
#define EventsCodeGenerator_H
#include <string>
#include <vector>
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/Events/Event.h"
namespace gd {
class ObjectMetadata;
class BehaviorMetadata;
class InstructionMetadata;
class ExpressionCodeGenerationInformation;
}  // namespace gd

class GD_API EventsCodeGenerator : public gd::EventsCodeGenerator {
  friend class VariableCodeGenerationCallbacks;

 public:
  /**
   * Generate complete C++ file for compiling events of a scene
   *
   * \param project Game used
   * \param scene Scene used
   * \param events events of the scene
   * \param compilationForRuntime Set this to true if the code is generated for
   * runtime. \return C++ code
   */
  static gd::String GenerateSceneEventsCompleteCode(
      gd::Project& project,
      gd::Layout& scene,
      const gd::EventsList& events,
      bool compilationForRuntime = false);

  /**
   * Generate complete C++ file for compiling external events.
   * \note If events.AreCompiled() == false, no code is generated.
   *
   * \param project Game used
   * \param events External events used.
   * \param compilationForRuntime Set this to true if the code is generated for
   * runtime. \return C++ code
   */
  static gd::String GenerateExternalEventsCompleteCode(
      gd::Project& project,
      gd::ExternalEvents& events,
      bool compilationForRuntime = false);

  /**
   * \brief GD C++ Platform has a specific processing function so as to handle
   * profiling.
   */
  void PreprocessEventList(gd::EventsList& listEvent);

  /**
   * \note This is unused for C++ code generation.
   */
  virtual gd::String GetCodeNamespaceAccessor() { return ""; };

  /**
   * \brief Get the namespace to be used to store code generated
   * objects/values/functions. \note This is unused for C++ code generation.
   */
  virtual gd::String GetCodeNamespace() { return ""; };

 protected:
  virtual gd::String GenerateParameterCodes(
      const gd::String& parameter,
      const gd::ParameterMetadata& metadata,
      gd::EventsCodeGenerationContext& context,
      const gd::String& previousParameter,
      std::vector<std::pair<gd::String, gd::String> >*
          supplementaryParametersTypes);

  virtual gd::String GenerateObjectFunctionCall(
      gd::String objectListName,
      const gd::ObjectMetadata& objMetadata,
      const gd::ExpressionCodeGenerationInformation& codeInfo,
      gd::String parametersStr,
      gd::String defaultOutput,
      gd::EventsCodeGenerationContext& context);

  virtual gd::String GenerateObjectBehaviorFunctionCall(
      gd::String objectListName,
      gd::String behaviorName,
      const gd::BehaviorMetadata& autoInfo,
      const gd::ExpressionCodeGenerationInformation& codeInfo,
      gd::String parametersStr,
      gd::String defaultOutput,
      gd::EventsCodeGenerationContext& context);

  virtual gd::String GenerateObjectCondition(
      const gd::String& objectName,
      const gd::ObjectMetadata& objInfo,
      const std::vector<gd::String>& arguments,
      const gd::InstructionMetadata& instrInfos,
      const gd::String& returnBoolean,
      bool conditionInverted,
      gd::EventsCodeGenerationContext& context);

  virtual gd::String GenerateBehaviorCondition(
      const gd::String& objectName,
      const gd::String& behaviorName,
      const gd::BehaviorMetadata& autoInfo,
      const std::vector<gd::String>& arguments,
      const gd::InstructionMetadata& instrInfos,
      const gd::String& returnBoolean,
      bool conditionInverted,
      gd::EventsCodeGenerationContext& context);

  virtual gd::String GenerateObjectAction(
      const gd::String& objectName,
      const gd::ObjectMetadata& objInfo,
      const std::vector<gd::String>& arguments,
      const gd::InstructionMetadata& instrInfos,
      gd::EventsCodeGenerationContext& context);

  virtual gd::String GenerateBehaviorAction(
      const gd::String& objectName,
      const gd::String& behaviorName,
      const gd::BehaviorMetadata& autoInfo,
      const std::vector<gd::String>& arguments,
      const gd::InstructionMetadata& instrInfos,
      gd::EventsCodeGenerationContext& context);

  virtual gd::String GenerateGetVariable(
      gd::String variableName,
      const VariableScope& scope,
      gd::EventsCodeGenerationContext& context,
      gd::String objectName);

  virtual gd::String GenerateVariableAccessor(gd::String childName) {
    return ".GetChild(" + ConvertToStringExplicit(childName) + ")";
  };

  virtual gd::String GenerateVariableBracketAccessor(
      gd::String expressionCode) {
    return ".GetChild(" + expressionCode + ")";
  };

  virtual gd::String GenerateBadVariable() {
    return "runtimeContext->GetGameVariables().GetBadVariable()";
  }

  /**
   * \brief Construct a code generator for the specified project and layout.
   */
  EventsCodeGenerator(gd::Project& project, const gd::Layout& layout);
  virtual ~EventsCodeGenerator();
};

#endif  // EventsCodeGenerator_H
#endif
