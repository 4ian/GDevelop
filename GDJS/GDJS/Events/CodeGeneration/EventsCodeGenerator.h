/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef EVENTSCODEGENERATOR_H
#define EVENTSCODEGENERATOR_H
#include <set>
#include <string>
#include <vector>

#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Events/InstructionsList.h"
namespace gd {
class ObjectsContainer;
class EventsFunctionsContainer;
class EventsFunction;
class EventsBasedBehavior;
class EventsBasedObject;
class ObjectMetadata;
class BehaviorMetadata;
class InstructionMetadata;
class ExpressionCodeGenerationInformation;
class EventsCodeGenerationContext;
class ProjectScopedContainers;
}  // namespace gd

namespace gdjs {

/**
 * \brief The class being responsible for generating JavaScript code from
 * events.
 *
 * See also gd::EventsCodeGenerator.
 */
class EventsCodeGenerator : public gd::EventsCodeGenerator {
 public:
  /**
   * Generate JavaScript for executing events of a scene
   *
   * \param project Project the scene belongs to.
   * \param scene The scene to generate the code for.
   * \param includeFiles Will be filled with the necessary include files.
   * \param compilationForRuntime Set this to true if the code is generated for
   * runtime.
   *
   * \return JavaScript code
   */
  static gd::String GenerateLayoutCode(const gd::Project& project,
                                       const gd::Layout& scene,
                                       const gd::String& codeNamespace,
                                       std::set<gd::String>& includeFiles,
                                       bool compilationForRuntime = false);

  /**
   * Generate JavaScript for executing events of an events based function.
   *
   * \param project Project used.
   * \param functionsContainer The container of the compiled event function.
   * \param eventsFunction The events function to be compiled.
   * \param codeNamespace Where to store the context used by the function.
   * \param includeFiles Will be filled with the necessary include files.
   * \param compilationForRuntime Set this to true if the code is generated for
   * runtime.
   *
   * \return JavaScript code
   */
  static gd::String GenerateEventsFunctionCode(
      gd::Project& project,
      const gd::EventsFunctionsContainer& functionsContainer,
      const gd::EventsFunction& eventsFunction,
      const gd::String& codeNamespace,
      std::set<gd::String>& includeFiles,
      bool compilationForRuntime = false);

  /**
   * Generate JavaScript for executing events of a events based behavior
   * function.
   *
   * \param project Project used.
   * \param eventsFunction The events function to be compiled.
   * \param codeNamespace Where to store the context used by the function.
   * \param fullyQualifiedFunctionName The function name with its namespace.
   * \param onceTriggersVariable The code to access the variable holding
   * OnceTriggers.
   * \param preludeCode The code to run just before the events
   * generated code.
   * \param includeFiles Will be filled with the necessary include files.
   * \param compilationForRuntime Set this to true if the code
   * is generated for runtime.
   *
   * \return JavaScript code
   */
  static gd::String GenerateBehaviorEventsFunctionCode(
      gd::Project& project,
      const gd::EventsBasedBehavior& eventsBasedBehavior,
      const gd::EventsFunction& eventsFunction,
      const gd::String& codeNamespace,
      const gd::String& fullyQualifiedFunctionName,
      const gd::String& onceTriggersVariable,
      const gd::String& preludeCode,
      std::set<gd::String>& includeFiles,
      bool compilationForRuntime = false);

  /**
   * Generate JavaScript for executing events of a events based object
   * function.
   *
   * \param project Project used.
   * \param eventsBasedObject The object that contains the function to be compiled.
   * \param eventsFunction The events function to be compiled.
   * \param codeNamespace Where to store the context used by the function.
   * \param fullyQualifiedFunctionName The function name with its namespace.
   * \param onceTriggersVariable The code to access the variable holding
   * OnceTriggers.
   * \param preludeCode The code to run right before the events
   * generated code.
   * \param endingCode The code to run right after the events
   * generated code.
   * \param includeFiles Will be filled with the necessary include files.
   * \param compilationForRuntime Set this to true if the code
   * is generated for runtime.
   *
   * \return JavaScript code
   */
  static gd::String GenerateObjectEventsFunctionCode(
      gd::Project& project,
      const gd::EventsBasedObject& eventsBasedObject,
      const gd::EventsFunction& eventsFunction,
      const gd::String& codeNamespace,
      const gd::String& fullyQualifiedFunctionName,
      const gd::String& onceTriggersVariable,
      const gd::String& preludeCode,
      const gd::String& endingCode,
      std::set<gd::String>& includeFiles,
      bool compilationForRuntime = false);

  /**
   * \brief Generate code for executing an event list
   * \note To reduce the stress on JS engines, the code is generated inside
   * a separate JS function (see
   * gd::EventsCodeGenerator::AddCustomCodeOutsideMain). This method will return
   * the code to call this separate function.
   *
   * \param events std::vector of events
   * \param context Context used for generation
   * \return Code
   */
  virtual gd::String GenerateEventsListCode(
      gd::EventsList& events, gd::EventsCodeGenerationContext& context) override;

  /**
   * Generate code for executing a condition list
   *
   * \param game Game used
   * \param scene Scene used
   * \param conditions std::vector of conditions
   * \param context Context used for generation
   * \return JS code.
   */
  virtual gd::String GenerateConditionsListCode(
      gd::InstructionsList& conditions,
      gd::EventsCodeGenerationContext& context) override;

  /**
   * \brief Generate the full name for accessing to a boolean variable used for
   * conditions.
   */
  virtual gd::String GenerateBooleanFullName(
      const gd::String& boolName,
      const gd::EventsCodeGenerationContext& context) override;

  /**
   * \brief Generate the full name for accessing to a boolean variable used for
   * conditions.
   */
  virtual gd::String GenerateUpperScopeBooleanFullName(
      const gd::String& boolName,
      const gd::EventsCodeGenerationContext& context) override;

  /**
   * \brief Set a boolean to false.
   */
  virtual gd::String GenerateBooleanInitializationToFalse(
      const gd::String& boolName,
      const gd::EventsCodeGenerationContext& context) override;

  /**
   * \brief Get the full name for accessing to a list of objects
   */
  virtual gd::String GetObjectListName(
      const gd::String& name, const gd::EventsCodeGenerationContext& context) override;

  /**
   * \brief Get the namespace to be used to store code generated
   * objects/values/functions, with the extra "dot" at the end to be used to
   * access to a property/member.
   *
   * Example: "gdjs.something."
   */
  virtual gd::String GetCodeNamespaceAccessor() override {
    return GetCodeNamespace() + ".";
  };

  /**
   * \brief Get the namespace to be used to store code generated
   * objects/values/functions.
   *
   * Example: "gdjs.something"
   */
  virtual gd::String GetCodeNamespace() override { return codeNamespace; };

  /**
   * \brief Specify the code namespace to use, useful for functions as it is not
   * autogenerated.
   *
   * Example: "gdjs.something"
   */
  void SetCodeNamespace(const gd::String& codeNamespace_) {
    codeNamespace = codeNamespace_;
  };

 protected:
  virtual gd::String GenerateParameterCodes(
      const gd::Expression& parameter,
      const gd::ParameterMetadata& metadata,
      gd::EventsCodeGenerationContext& context,
      const gd::String& lastObjectName,
      std::vector<std::pair<gd::String, gd::String> >*
          supplementaryParametersTypes) override;

  virtual gd::String GenerateObjectFunctionCall(
      gd::String objectListName,
      const gd::ObjectMetadata& objMetadata,
      const gd::ExpressionCodeGenerationInformation& codeInfo,
      gd::String parametersStr,
      gd::String defaultOutput,
      gd::EventsCodeGenerationContext& context) override;

  virtual gd::String GenerateObjectBehaviorFunctionCall(
      gd::String objectListName,
      gd::String behaviorName,
      const gd::BehaviorMetadata& autoInfo,
      const gd::ExpressionCodeGenerationInformation& codeInfo,
      gd::String parametersStr,
      gd::String defaultOutput,
      gd::EventsCodeGenerationContext& context) override;

  virtual gd::String GenerateFreeCondition(
      const std::vector<gd::String>& arguments,
      const gd::InstructionMetadata& instrInfos,
      const gd::String& returnBoolean,
      bool conditionInverted,
      gd::EventsCodeGenerationContext& context) override;

  virtual gd::String GenerateObjectCondition(
      const gd::String& objectName,
      const gd::ObjectMetadata& objInfo,
      const std::vector<gd::String>& arguments,
      const gd::InstructionMetadata& instrInfos,
      const gd::String& returnBoolean,
      bool conditionInverted,
      gd::EventsCodeGenerationContext& context) override;

  virtual gd::String GenerateBehaviorCondition(
      const gd::String& objectName,
      const gd::String& behaviorName,
      const gd::BehaviorMetadata& autoInfo,
      const std::vector<gd::String>& arguments,
      const gd::InstructionMetadata& instrInfos,
      const gd::String& returnBoolean,
      bool conditionInverted,
      gd::EventsCodeGenerationContext& context) override;

  virtual gd::String GenerateObjectAction(
      const gd::String& objectName,
      const gd::ObjectMetadata& objInfo,
      const gd::String& functionCallName,
      const std::vector<gd::String>& arguments,
      const gd::InstructionMetadata& instrInfos,
      gd::EventsCodeGenerationContext& context,
      const gd::String& optionalAsyncCallbackName = "") override;

  virtual gd::String GenerateBehaviorAction(
      const gd::String& objectName,
      const gd::String& behaviorName,
      const gd::BehaviorMetadata& autoInfo,
      const gd::String& functionCallName,
      const std::vector<gd::String>& arguments,
      const gd::InstructionMetadata& instrInfos,
      gd::EventsCodeGenerationContext& context,
      const gd::String& optionalAsyncCallbackName = "") override;

  virtual gd::String GenerateGetBehaviorNameCode(
      const gd::String& behaviorName) override;

  virtual gd::String GenerateGetVariable(
      const gd::String& variableName,
      const VariableScope& scope,
      gd::EventsCodeGenerationContext& context,
      const gd::String& objectName) override;

  virtual gd::String GenerateVariableAccessor(gd::String childName) override {
    // This could be probably optimised by using `getChildNamed`.
    return ".getChild(" + ConvertToStringExplicit(childName) + ")";
  };

  virtual gd::String GenerateVariableBracketAccessor(
      gd::String expressionCode) override {
    // This uses `getChild` which allows to access a child
    // with a number (an index, for an array) or a string (for a structure).
    // This could be optimised, if the type of the accessed variable AND the type of the index is known,
    // so that `getChildAt` (for an array, with an index) or `getChildNamed` (for a structure, with a name)
    // is used instead.
    return ".getChild(" + expressionCode + ")";
  };

  virtual gd::String GenerateBadVariable() override {
    return "gdjs.VariablesContainer.badVariable";
  }

  virtual gd::String GeneratePropertyGetter(const gd::PropertiesContainer& propertiesContainer,
                                            const gd::NamedPropertyDescriptor& property,
                                            const gd::String& type,
                                            gd::EventsCodeGenerationContext& context) override;

  virtual gd::String GenerateParameterGetter(const gd::ParameterMetadata& parameter,
                                             const gd::String& type,
                                             gd::EventsCodeGenerationContext& context) override;

  virtual gd::String GenerateBadObject() override { return "null"; }

  virtual gd::String GenerateObject(const gd::String& objectName,
                                    const gd::String& type,
                                    gd::EventsCodeGenerationContext& context) override;

  virtual gd::String GenerateNegatedPredicate(const gd::String& predicate) const override {
    return "!(" + predicate + ")";
  };

  virtual gd::String GenerateObjectsDeclarationCode(
      gd::EventsCodeGenerationContext& context) override;

  virtual gd::String GenerateAllInstancesGetterCode(
      const gd::String& objectName, gd::EventsCodeGenerationContext& context);

  virtual gd::String GenerateProfilerSectionBegin(const gd::String& section) override;
  virtual gd::String GenerateProfilerSectionEnd(const gd::String& section) override;

  virtual gd::String GenerateRelationalOperation(
    const gd::String& relationalOperator,
    const gd::String& lhs,
    const gd::String& rhs) override;

 private:
  static gd::String GenerateEventsListCompleteFunctionCode(
      gdjs::EventsCodeGenerator& codeGenerator,
      gd::String fullyQualifiedFunctionName,
      gd::String functionArgumentsCode,
      gd::String functionPreEventsCode,
      const gd::EventsList& events,
      gd::String functionPostEventsCode,
      gd::String functionReturnCode);

  /**
   * \brief Generate the declarations of all the booleans required to run
   * events.
   *
   * This should be called after generating events list code, so that the code
   * generator knows all the booleans to be declared.
   */
  gd::String GenerateAllConditionsBooleanDeclarations();

  /**
   * \brief Generate the declarations of all the objects list arrays.
   *
   * This should be called after generating events list code, with the maximum
   * depth reached by events.
   */
  std::pair<gd::String, gd::String> GenerateAllObjectsDeclarationsAndResets(
      unsigned int maxDepthLevelReached);

  /**
   * \brief Generate the list of parameters of a function.
   *
   * \note runtimeScene is always added as the first parameter, and
   * parentEventsFunctionContext as the last parameter.
   */
  gd::String GenerateEventsFunctionParameterDeclarationsList(
      const std::vector<gd::ParameterMetadata>& parameters,
      int firstParameterIndex,
      bool addsSceneParameter);

  /**
   * \brief Generate the "eventsFunctionContext" object that allow a free
   * function to provides access objects, object creation and access to
   * arguments from the rest of the events.
   */
  gd::String GenerateFreeEventsFunctionContext(
      const std::vector<gd::ParameterMetadata>& parameters,
      const gd::String& onceTriggersVariable,
      bool isAsync);

  /**
   * \brief Generate the "eventsFunctionContext" object that allow a behavior
   * function to provides access objects, object creation and access to
   * arguments from the rest of the events.
   */
  gd::String GenerateBehaviorEventsFunctionContext(
      const gd::EventsBasedBehavior& eventsBasedBehavior,
      const std::vector<gd::ParameterMetadata>& parameters,
      const gd::String& onceTriggersVariable,
      bool isAsync,
      const gd::String& thisObjectName,
      const gd::String& thisBehaviorName);

  /**
   * \brief Generate the "eventsFunctionContext" object that allow an object
   * function to provides access objects, object creation and access to
   * arguments from the rest of the events.
   */
  gd::String GenerateObjectEventsFunctionContext(
      const gd::EventsBasedObject& eventsBasedObject,
      const std::vector<gd::ParameterMetadata>& parameters,
      const gd::String& onceTriggersVariable,
      bool isAsync,
      const gd::String& thisObjectName);

  gd::String GenerateEventsFunctionReturn(
      const gd::EventsFunction& eventFunction);

  /**
   * \brief Construct a code generator for the specified project and layout.
   */
  EventsCodeGenerator(const gd::Project& project, const gd::Layout& layout);

  /**
   * \brief Construct a code generator for the specified containers.
   */
  EventsCodeGenerator(const gd::ProjectScopedContainers& projectScopedContainers);
  virtual ~EventsCodeGenerator();

  gd::String codeNamespace;  ///< Optional namespace for the generated code,
                             ///< used when generating events function.
 private:
  /**
   * \brief Generate the "eventsFunctionContext" object that allow a function
   * to provides access objects, object creation and access to arguments from
   * the rest of the events.
   */
  gd::String GenerateEventsFunctionContext(
      const std::vector<gd::ParameterMetadata>& parameters,
      const gd::String& onceTriggersVariable,
      gd::String& objectsGettersMap,
      gd::String& objectArraysMap,
      gd::String& behaviorNamesMap,
      bool isAsync,
      const gd::String& thisObjectName = "",
      const gd::String& thisBehaviorName = "");
};

}  // namespace gdjs
#endif  // EVENTSCODEGENERATOR_H
