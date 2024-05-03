/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_EVENTSCODEGENERATOR_H
#define GDCORE_EVENTSCODEGENERATOR_H

#include <set>
#include <utility>
#include <vector>

#include "GDCore/Events/Event.h"
#include "GDCore/Events/Instruction.h"
#include "GDCore/Project/ProjectScopedContainers.h"
#include "GDCore/String.h"
namespace gd {
class EventsList;
class Expression;
class Project;
class Layout;
class ObjectsContainer;
class ObjectsContainersList;
class ExternalEvents;
class ParameterMetadata;
class ObjectMetadata;
class BehaviorMetadata;
class InstructionMetadata;
class EventsCodeGenerationContext;
class ExpressionCodeGenerationInformation;
class InstructionMetadata;
class Platform;
}  // namespace gd

namespace gd {

/**
 * \brief Internal class used to generate code from events
 */
class GD_CORE_API EventsCodeGenerator {
  friend class ExpressionCodeGenerator;

 public:
  /**
   * \brief Remove non executable events from the event list.
   */
  static void DeleteUselessEvents(gd::EventsList& events);

  /**
   * \brief Construct a code generator for the specified
   * platform/project/layout.
   */
  EventsCodeGenerator(const gd::Project& project_,
                      const gd::Layout& layout,
                      const gd::Platform& platform_);

  /**
   * \brief Construct a code generator for the specified
   * objects/groups and platform
   */
  EventsCodeGenerator(
      const gd::Platform& platform,
      const gd::ProjectScopedContainers& projectScopedContainers_);
  virtual ~EventsCodeGenerator(){};

  /**
   * \brief Preprocess an events list (replacing for example links with the
   * linked events).
   *
   * This should be called before any code generation.
   */
  void PreprocessEventList(gd::EventsList& listEvent);

  /**
   * \brief Generate code for executing an event list
   *
   * \param events std::vector of events
   * \param context Context used for generation
   * \return Code
   */
  virtual gd::String GenerateEventsListCode(
      gd::EventsList& events, EventsCodeGenerationContext& context);

  /**
   * \brief Generate code for executing a condition list
   *
   * The default implementation create the condition calls using C-style ifs and
   * booleans.
   *
   * \param game Game used
   * \param scene Scene used
   * \param conditions std::vector of conditions
   * \param context Context used for generation
   * \return Code. Boolean containing conditions result are name
   * conditionXIsTrue, with X = the number of the condition, starting from 0.
   */
  virtual gd::String GenerateConditionsListCode(
      gd::InstructionsList& conditions, EventsCodeGenerationContext& context);

  /**
   * \brief Generate code for executing an action list
   *
   * The default implementation just calls repeatedly GenerateActionCode.
   *
   * \param game Game used
   * \param scene Scene used
   * \param actions std::vector of actions
   * \param context Context used for generation
   * \return Code
   */
  virtual gd::String GenerateActionsListCode(
      gd::InstructionsList& actions, EventsCodeGenerationContext& context);

  /**
   * \brief Generate the code for a parameter of an action/condition/expression.
   *
   * This method uses GenerateParameterCodes to generate the parameters code.
   *
   * \param scene Scene used
   * \param parameters std::vector of actual parameters.
   * \param parametersInfo std::vector of information about parameters
   * \param context Context used for generation
   * \param supplementaryParametersTypes Optional std::vector of new parameters
   * types ( std::vector of pair<gd::String,gd::String>("type",
   * "valueToBeInserted") )
   *
   */
  std::vector<gd::String> GenerateParametersCodes(
      const std::vector<gd::Expression>& parameters,
      const std::vector<gd::ParameterMetadata>& parametersInfo,
      EventsCodeGenerationContext& context,
      std::vector<std::pair<gd::String, gd::String> >*
          supplementaryParametersTypes = 0);

  /**
   * \brief Generate code for a single condition.
   *
   * The generation is really done in
   * GenerateFreeCondition/GenerateObjectCondition or GenerateBehaviorCondition.
   *
   * \param condition instruction to be done.
   * \param returnBoolean The name of the boolean that must contains the
   * condition result. \param context Context used for generation \return Code
   */
  gd::String GenerateConditionCode(gd::Instruction& condition,
                                   gd::String returnBoolean,
                                   EventsCodeGenerationContext& context);

  /**
   * \brief Generate code for a single action
   *
   * The generation is really done in GenerateFreeAction/GenerateObjectAction or
   * GenerateBehaviorAction.
   *
   * \param condition instruction to be done.
   * \param context Context used for generation
   * \return Code
   */
  gd::String GenerateActionCode(
      gd::Instruction& action,
      EventsCodeGenerationContext& context,
      const gd::String& optionalAsyncCallbackName = "");

  struct CallbackDescriptor {
    CallbackDescriptor(const gd::String functionName_,
                       const gd::String argumentsList_,
                       const std::set<gd::String> requiredObjects_)
        : functionName(functionName_),
          argumentsList(argumentsList_),
          requiredObjects(requiredObjects_){};
    /**
     * The name by which the function can be invoked.
     */
    const gd::String functionName;
    /**
     * The comma separated list of arguments that the function takes.
     */
    const gd::String argumentsList;
    /**
     * A set of all objects that need to be backed up to be passed to the
     * callback code.
     */
    const std::set<gd::String> requiredObjects;
  };

  /**
   * \brief Generates actions and events as a callback.
   *
   * This is used by asynchronous functions to run the code out of the normal
   * events flow.
   *
   * \returns A set with all objects required by the callback code.
   * The caller must take care of backing them up in a LongLivedObjectsList,
   * and to pass it to the callback function as the last argument.
   */
  virtual const CallbackDescriptor GenerateCallback(
      const gd::String& callbackFunctionName,
      gd::EventsCodeGenerationContext& parentContext,
      gd::InstructionsList& actions,
      gd::EventsList* subEvents = nullptr);

  /**
   * \brief Generates the parameters list of an event's generated function.
   */
  const gd::String GenerateEventsParameters(
      const gd::EventsCodeGenerationContext& context);

  /**
   * \brief Generate code for declaring objects lists.
   *
   * This method is used for each event.
   *
   * \param context The context to be used.
   */
  virtual gd::String GenerateObjectsDeclarationCode(
      EventsCodeGenerationContext& context);

  /**
   * \brief Must convert a plain string ( with line feed, quotes ) to a string
   that can be inserted into code.
   *
   * \note It is the caller responsibility to add proper code need to create a
   full string.
   *
   * Usage example :
   * \code
      code += "gd::String(\""+codeGenerator.ConvertToString(name)+"\")";
   / \endcode
   *
   * \param plainString The string to convert
   * \return plainString which can be included into the generated code.
   */
  static gd::String ConvertToString(gd::String plainString);

  /**
   * \brief Convert a plain string (with line feed, quotes) to a string that
   can be inserted into code.
   * The string construction must be explicit: for example, quotes must be
   added if the target language need quotes.
   *
   * Usage example :
   \code
      code += codeGenerator.ConvertToStringExplicit(name);
   \endcode
   *
   * \note The default implementation simply call ConvertToString and add quotes
   *
   * \param plainString The string to convert
   * \return plainString which can be included into the generated code.
   */
  static gd::String ConvertToStringExplicit(gd::String plainString);

  /**
   * \brief Declare an include file to be added
   * \note The way includes files are used may vary depending on the platform:
   *  - On GD C++ Platform, the includes files are added in the #include
   * directives of the generated code.
   *  - On GD JS Platform, the includes files are added in the list of JS files
   * in the index file.
   */
  void AddIncludeFile(gd::String file) {
    if (!file.empty()) includeFiles.insert(file);
  };

  /**
   * \brief Declare a list of include files to be added
   * \see gd::EventsCodeGenerator::AddIncludeFile
   */
  void AddIncludeFiles(std::vector<gd::String> files) {
    for (std::size_t i = 0; i < files.size(); ++i) AddIncludeFile(files[i]);
  };

  /**
   * \brief Add a declaration which will be inserted after includes
   */
  void AddGlobalDeclaration(gd::String declaration) {
    customGlobalDeclarations.insert(declaration);
  };

  /**
   * \brief Add some code before events outside the main function.
   */
  void AddCustomCodeOutsideMain(gd::String code) {
    customCodeOutsideMain += code;
  };

  /** \brief Get the set containing the include files.
   */
  const std::set<gd::String>& GetIncludeFiles() const { return includeFiles; }

  /** \brief Get the custom code to be inserted outside main.
   */
  const gd::String& GetCustomCodeOutsideMain() const {
    return customCodeOutsideMain;
  }

  /** \brief Get the custom declaration to be inserted after includes.
   */
  const std::set<gd::String>& GetCustomGlobalDeclaration() const {
    return customGlobalDeclarations;
  }

  /**
   * \brief Return true if code generation is made for runtime only.
   */
  bool GenerateCodeForRuntime() { return compilationForRuntime; }

  /**
   * \brief Set if the code generated is meant to be used for runtime only and
   * not in the IDE.
   */
  void SetGenerateCodeForRuntime(bool compilationForRuntime_) {
    compilationForRuntime = compilationForRuntime_;
  }

  /**
   * \brief Report that an error occurred during code generation ( Event code
   * won't be generated )
   */
  void ReportError();

  /**
   * \brief Return true if an error has occurred during code generation (in
   * this case, generated code is not usable).
   *
   * \todo TODO: This is actually not used and should be moved to a more
   * complete error reporting.
   */
  bool ErrorOccurred() const { return errorOccurred; };

  const gd::ObjectsContainersList& GetObjectsContainersList() const {
    return projectScopedContainers.GetObjectsContainersList();
  };

  const gd::ProjectScopedContainers& GetProjectScopedContainers() const {
    return projectScopedContainers;
  }

  /**
   * \brief Return true if the code generation is done for a given project and
   * layout. If not, this means that the code is generated for a function.
   */
  bool HasProjectAndLayout() const { return hasProjectAndLayout; }

  /**
   * \brief Get the project the code is being generated for.
   * \warning This is only valid if HasProjectAndLayout() is true.
   */
  const gd::Project& GetProject() const { return *project; }

  /**
   * \brief Get the layout the code is being generated for.
   * \warning This is only valid if HasProjectAndLayout() is true.
   */
  const gd::Layout& GetLayout() const { return *scene; }

  /**
   * \brief Get the platform the code is being generated for.
   */
  const gd::Platform& GetPlatform() const { return platform; }

  /**
   * \brief Get the maximum depth of custom conditions reached during code
   * generation.
   */
  size_t GetMaxCustomConditionsDepth() const {
    return maxCustomConditionsDepth;
  }

  /**
   * \brief Get the maximum size of a list of conditions.
   */
  size_t GetMaxConditionsListsSize() const { return maxConditionsListsSize; }

  /**
   * \brief Generate the full name for accessing to a boolean variable used for
   * conditions.
   *
   * Default implementation just returns the boolean name passed as argument.
   */
  virtual gd::String GenerateBooleanFullName(
      const gd::String& boolName,
      const gd::EventsCodeGenerationContext& context) {
    return boolName;
  }

  /**
   * \brief Generate the full name for accessing to a boolean variable used for
   * conditions.
   *
   * Default implementation just returns the boolean name passed as argument.
   */
  virtual gd::String GenerateUpperScopeBooleanFullName(
      const gd::String& boolName,
      const gd::EventsCodeGenerationContext& context) {
    return boolName;
  }

  /**
   * \brief Must create a boolean. Its value must be false.
   *
   * The default implementation generates C-style code.
   */
  virtual gd::String GenerateBooleanInitializationToFalse(
      const gd::String& boolName,
      const gd::EventsCodeGenerationContext& context) {
    return "bool " + boolName + " = false;\n";
  }

  /**
   * \brief Get the full name for accessing to a list of objects
   *
   * Default implementation simply returns the name mangled using
   * gd::EventsCodeNameMangler.
   */
  virtual gd::String GetObjectListName(
      const gd::String& name, const gd::EventsCodeGenerationContext& context);

  /**
   * \brief Generate the code to notify the profiler of the beginning of a
   * section.
   */
  virtual gd::String GenerateProfilerSectionBegin(const gd::String& section) {
    return "";
  };

  /**
   * \brief Generate the code to notify the profiler of the end of a section.
   */
  virtual gd::String GenerateProfilerSectionEnd(const gd::String& section) {
    return "";
  };

  /**
   * \brief Get the namespace to be used to store code generated
   * objects/values/functions, with the extra "dot" at the end to be used to
   * access to a property/member.
   *
   * Example: "gdjs.something."
   */
  virtual gd::String GetCodeNamespaceAccessor() { return ""; };

  /**
   * \brief Get the namespace to be used to store code generated
   * objects/values/functions.
   *
   * Example: "gdjs.something"
   */
  virtual gd::String GetCodeNamespace() { return ""; };

  enum VariableScope { LAYOUT_VARIABLE = 0, PROJECT_VARIABLE, OBJECT_VARIABLE };

  /**
   * Generate a single unique number for the specified instruction.
   *
   * This is useful for instructions that need to identify themselves in the
   * generated code like the "Trigger Once" conditions. The id is stable across
   * code generations if the instructions are the same objects in memory.
   *
   * Note that if this function is called multiple times with the same
   * instruction, the unique number returned will be *different*. This is
   * because a single instruction might appear at multiple places in events due
   * to the usage of links.
   */
  size_t GenerateSingleUsageUniqueIdFor(const gd::Instruction* instruction);

  /**
   * Generate a single unique number for an events list.
   *
   * This is useful to create unique function names for events list, that are
   * stable across code generation given the exact same list of events. They are
   * *not* stable if events are moved/reorganized.
   */
  size_t GenerateSingleUsageUniqueIdForEventsList();

  virtual gd::String GenerateRelationalOperation(
      const gd::String& relationalOperator,
      const gd::String& lhs,
      const gd::String& rhs);

 protected:
  virtual const gd::String GenerateRelationalOperatorCodes(
      const gd::String& operatorString);

  /**
   * \brief Generate the code for a single parameter.
   *
   * Standard supported parameters type, and how they are used in code:
   *
   * - object : Object name -> string
   * - expression : Mathematical expression -> number (double)
   * - string : %Text expression -> string
   * - layer, color, file, stringWithSelector : Same as string
   * - relationalOperator : Used to make a comparison between the function
  return value and value of the parameter preceding the relationOperator
  parameter -> string
   * - operator : Used to update a value using a setter and a getter -> string
   * - key, mouse, objectvar, scenevar, globalvar, password, musicfile,
  soundfile, police -> string
   * - trueorfalse, yesorno -> boolean ( See GenerateTrue/GenerateFalse ).
   *
   * <br><br>
   * "Code only" parameters types:
   * - inlineCode: supplementary information associated with the parameter is
  directly pasted in the code without change.
   *
   * <br><br>
   * Other standard parameters type that should be implemented by platforms:
   * - currentScene: Reference to the current runtime scene.
   * - objectList : a map containing lists of objects which are specified by the
  object name in another parameter.
   * - objectListOrEmptyIfJustDeclared : Same as `objectList` but do not pick
  object if they are not already picked.
   * - objectPtr: Return a reference to the object specified by the object name
  in another parameter. Example:
   * \code
  .AddParameter("object", _("Object"))
  .AddParameter("objectPtr", _("Target object"))
   * \endcode
   */
  virtual gd::String GenerateParameterCodes(
      const gd::Expression& parameter,
      const gd::ParameterMetadata& metadata,
      gd::EventsCodeGenerationContext& context,
      const gd::String& lastObjectName,
      std::vector<std::pair<gd::String, gd::String> >*
          supplementaryParametersTypes);

  /**
   * \brief Generate the code to get a variable.
   */
  virtual gd::String GenerateGetVariable(
      const gd::String& variableName,
      const VariableScope& scope,
      gd::EventsCodeGenerationContext& context,
      const gd::String& objectName) {
    if (scope == LAYOUT_VARIABLE) {
      return "getLayoutVariable(" + variableName + ")";

    } else if (scope == PROJECT_VARIABLE) {
      return "getProjectVariable(" + variableName + ")";
    }

    return "getVariableForObject(" + objectName + ", " + variableName + ")";
  }

  /**
   * \brief Generate the code to get the child of a variable.
   */
  virtual gd::String GenerateVariableAccessor(gd::String childName) {
    return ".getChild(" + ConvertToStringExplicit(childName) + ")";
  };

  virtual gd::String GenerateVariableValueAs(const gd::String& type) {
    return type == "number|string" ? ".getAsNumberOrString()"
           : type == "string"      ? ".getAsString()"
                                   : ".getAsNumber()";
  }

  /**
   * \brief Generate the code to get the child of a variable,
   * using generated the expression.
   */
  virtual gd::String GenerateVariableBracketAccessor(
      gd::String expressionCode) {
    return ".getChild(" + expressionCode + ")";
  };

  /**
   * \brief Generate the code to reference a variable which is
   * in an empty/null state.
   */
  virtual gd::String GenerateBadVariable() { return "fakeBadVariable"; }

  /**
   * \brief Generate the code to reference an object.
   * \param objectName the name of the object.
   * \param type what is the expected type (object, objectPtr...) in which the
   * object must be generated.
   * \param context The context for code generation
   */
  virtual gd::String GenerateObject(const gd::String& objectName,
                                    const gd::String& type,
                                    gd::EventsCodeGenerationContext& context) {
    return "fakeObjectListOf_" + objectName;
  }

  virtual gd::String GeneratePropertyGetter(
      const gd::PropertiesContainer& propertiesContainer,
      const gd::NamedPropertyDescriptor& property,
      const gd::String& type,
      gd::EventsCodeGenerationContext& context);

  virtual gd::String GenerateParameterGetter(
      const gd::ParameterMetadata& parameter,
      const gd::String& type,
      gd::EventsCodeGenerationContext& context);

  /**
   * \brief Generate the code to reference an object which is
   * in an empty/null state.
   */
  virtual gd::String GenerateBadObject() { return "fakeNullObject"; }

  /**
   * \brief Call a function of the current object.
   * \note The current object is the object being manipulated by a condition or
   * an action.
   *
   * \param objectListName The full name of the object list being used
   * \param objMetadata Metadata about the object being used.
   * \param functionCallName The function to be called on this object.
   * \param parametersStr The parameters of the function
   * \param context The context : May be used to get information about the
   * current scope.
   */
  virtual gd::String GenerateObjectFunctionCall(
      gd::String objectListName,
      const ObjectMetadata& objMetadata,
      const gd::ExpressionCodeGenerationInformation& codeInfo,
      gd::String parametersStr,
      gd::String defaultOutput,
      gd::EventsCodeGenerationContext& context);

  /**
   * \brief Call a function of a behavior of the current object.
   * \note The current object is the object being manipulated by a condition or
   * an action.
   *
   * \param objectListName The full name of the object list being used
   * \param behaviorName The full name of the behavior to be used
   * \param objMetadata Metadata about the behavior being used.
   * \param functionCallName The function to be called on this object.
   * \param parametersStr The parameters of the function
   * \param context The context : May be used to get information about the
   * current scope.
   */
  virtual gd::String GenerateObjectBehaviorFunctionCall(
      gd::String objectListName,
      gd::String behaviorName,
      const gd::BehaviorMetadata& autoInfo,
      const gd::ExpressionCodeGenerationInformation& codeInfo,
      gd::String parametersStr,
      gd::String defaultOutput,
      gd::EventsCodeGenerationContext& context);

  /**
   * \brief Called when a new scope must be entered.
   * \param context The context : Internal events of the scope have been
   * generated, but GenerateObjectsDeclarationCode was not called. \param
   * extraVariable An optional supplementary variable that should be inherited
   * from the parent scope.
   */
  virtual gd::String GenerateScopeBegin(
      gd::EventsCodeGenerationContext& context,
      const gd::String& extraVariable = "") {
    return "{\n";
  };

  /**
   * \brief Called when a new must be ended.
   * \param context The context : Internal events of the scope have been
   * generated, but GenerateObjectsDeclarationCode was not called. \param
   * extraVariable An optional supplementary variable that should be inherited
   * from the parent scope.
   */
  virtual gd::String GenerateScopeEnd(gd::EventsCodeGenerationContext& context,
                                      const gd::String& extraVariable = "") {
    return "}\n";
  };

  /**
   * \brief Must negate a predicate.
   *
   * The default implementation generates C-style code : It wraps the predicate
   * inside parenthesis and add a !.
   */
  virtual gd::String GenerateNegatedPredicate(
      const gd::String& predicate) const {
    return "!(" + predicate + ")";
  };

  virtual gd::String GenerateFreeCondition(
      const std::vector<gd::String>& arguments,
      const gd::InstructionMetadata& instrInfos,
      const gd::String& returnBoolean,
      bool conditionInverted,
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

  virtual gd::String GenerateFreeAction(
      const gd::String& functionCallName,
      const std::vector<gd::String>& arguments,
      const gd::InstructionMetadata& instrInfos,
      gd::EventsCodeGenerationContext& context,
      const gd::String& optionalAsyncCallbackName = "");

  virtual gd::String GenerateObjectAction(
      const gd::String& objectName,
      const gd::ObjectMetadata& objInfo,
      const gd::String& functionCallName,
      const std::vector<gd::String>& arguments,
      const gd::InstructionMetadata& instrInfos,
      gd::EventsCodeGenerationContext& context,
      const gd::String& optionalAsyncCallbackName = "");

  virtual gd::String GenerateBehaviorAction(
      const gd::String& objectName,
      const gd::String& behaviorName,
      const gd::BehaviorMetadata& autoInfo,
      const gd::String& functionCallName,
      const std::vector<gd::String>& arguments,
      const gd::InstructionMetadata& instrInfos,
      gd::EventsCodeGenerationContext& context,
      const gd::String& optionalAsyncCallbackName = "");

  gd::String GenerateRelationalOperatorCall(
      const gd::InstructionMetadata& instrInfos,
      const std::vector<gd::String>& arguments,
      const gd::String& callStartString,
      std::size_t startFromArgument = 0);

  gd::String GenerateOperatorCall(const gd::InstructionMetadata& instrInfos,
                                  const std::vector<gd::String>& arguments,
                                  const gd::String& callStartString,
                                  const gd::String& getterStartString,
                                  std::size_t startFromArgument = 0);
  gd::String GenerateCompoundOperatorCall(
      const gd::InstructionMetadata& instrInfos,
      const std::vector<gd::String>& arguments,
      const gd::String& callStartString,
      std::size_t startFromArgument = 0);
  gd::String GenerateMutatorCall(const gd::InstructionMetadata& instrInfos,
                                 const std::vector<gd::String>& arguments,
                                 const gd::String& callStartString,
                                 std::size_t startFromArgument = 0);

  /**
   * \brief Return the "true" keyword in the target language.
   */
  gd::String GenerateTrue() const { return "true"; };

  /**
   * \brief Return the "false" keyword in the target language.
   */
  gd::String GenerateFalse() const { return "false"; };

  /**
   * \brief Generate the list of comma-separated arguments to be used to call a
   * function.
   *
   * \param arguments The code already generated for the arguments
   * \param startFrom Index of the first argument, the previous will be ignored.
   */
  virtual gd::String GenerateArgumentsList(
      const std::vector<gd::String>& arguments, size_t startFrom = 0);

  /**
   * Generate the getter to get the name of the specified behavior.
   */
  virtual gd::String GenerateGetBehaviorNameCode(
      const gd::String& behaviorName);

  const gd::Platform& platform;  ///< The platform being used.

  gd::ProjectScopedContainers projectScopedContainers;

  bool hasProjectAndLayout;  ///< true only if project and layout are valid
                             ///< references. If false, they should not be used.
  const gd::Project* project;  ///< The project being used.
  const gd::Layout* scene;     ///< The scene being generated.

  bool errorOccurred;          ///< Must be set to true if an error occurred.
  bool compilationForRuntime;  ///< Is set to true if the code generation is
                               ///< made for runtime only.

  std::set<gd::String>
      includeFiles;  ///< List of headers files used by instructions. A (shared)
                     ///< pointer is used so as context created from another one
                     ///< can share the same list.
  gd::String customCodeOutsideMain;  ///< Custom code inserted before events (
                                     ///< and not in events function )
  std::set<gd::String>
      customGlobalDeclarations;     ///< Custom global C++ declarations inserted
                                    ///< after includes
  size_t maxCustomConditionsDepth;  ///< The maximum depth value for all the
                                    ///< custom conditions created.
  size_t maxConditionsListsSize;  ///< The maximum size of a list of conditions.

  std::set<size_t>
      instructionUniqueIds;  ///< The unique ids generated for instructions.
  size_t eventsListNextUniqueId;  ///< The next identifier to use for an events
                                  ///< list function name.
};

}  // namespace gd

#endif  // GDCORE_EVENTSCODEGENERATOR_H
