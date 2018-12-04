#ifndef GDCORE_EVENTSCODEGENERATOR_H
#define GDCORE_EVENTSCODEGENERATOR_H

#include <set>
#include <utility>
#include <vector>
#include "GDCore/Events/Event.h"
#include "GDCore/Events/Instruction.h"
#include "GDCore/String.h"
namespace gd {
class EventsList;
class Expression;
class Project;
class Layout;
class ObjectsContainer;
class ExternalEvents;
class ParameterMetadata;
class ObjectMetadata;
class BehaviorMetadata;
class InstructionMetadata;
class EventsCodeGenerationContext;
class ExpressionCodeGenerationInformation;
class InstructionMetadata;
class Platform;
}

namespace gd {

/**
 * \brief Internal class used to generate code from events
 * \todo For now, this class generates only C++ code for GD C++ Platform.
 *
 * \see CallbacksForGeneratingExpressionCode
 */
class GD_CORE_API EventsCodeGenerator {
  friend class CallbacksForGeneratingExpressionCode;
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
  EventsCodeGenerator(gd::Project& project_,
                      const gd::Layout& layout,
                      const gd::Platform& platform_);

  /**
   * \brief Construct a code generator for the specified
   * objects/groups and platform
   */
  EventsCodeGenerator(const gd::Platform& platform, 
  gd::ObjectsContainer & globalObjectsAndGroups_,
  const gd::ObjectsContainer & objectsAndGroups_);
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
      gd::EventsList& events, const EventsCodeGenerationContext& context);

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
      std::vector<gd::Expression> parameters,
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
  gd::String GenerateActionCode(gd::Instruction& action,
                                EventsCodeGenerationContext& context);

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
  virtual gd::String ConvertToString(gd::String plainString);

  /**
   * \brief Convert a plain string ( with line feed, quotes ) to a string that
   can be inserted into code.
   * The string construction must be explicit : for example, quotes must be
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
  virtual gd::String ConvertToStringExplicit(gd::String plainString);

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

  /**
   * \brief Add some code before events in the main function.
   */
  void AddCustomCodeInMain(gd::String code) { customCodeInMain += code; };

  /** \brief Get the set containing the include files.
   */
  const std::set<gd::String>& GetIncludeFiles() const { return includeFiles; }

  /** \brief Get the custom code to be inserted outside main.
   */
  const gd::String& GetCustomCodeOutsideMain() const {
    return customCodeOutsideMain;
  }

  /** \brief Get the custom code to be inserted inside main function.
   */
  const gd::String& GetCustomCodeInMain() const { return customCodeInMain; }

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
   * \brief Return true if an error has occurred during code generation ( in
   * this case, generated code is not usable )
   */
  bool ErrorOccurred() const { return errorOccurred; };

  /**
   * \brief Get the global objects/groups used for code generation.
   */
  gd::ObjectsContainer& GetGlobalObjectsAndGroups() const { return globalObjectsAndGroups; }

  /**
   * \brief Get the objects/groups used for code generation.
   */
  const gd::ObjectsContainer& GetObjectsAndGroups() const { return objectsAndGroups; }

  /**
   * \brief Return true if the code generation is done for a given project and layout.
   */
  bool HasProjectAndLayout() const { return hasProjectAndLayout; }

  /**
   * \brief Get the project the code is being generated for.
   * \warning This is only valid if HasProjectAndLayout() is true.
   */
  gd::Project& GetProject() const { return *project; }

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
   * \brief Convert a group name to the full list of objects contained in the
   * group.
   *
   * Get a list containing the "real" objects name when the events refers to \a
   * objectName :<br> If \a objectName if really an object, the list will only
   * contains \a objectName unchanged.<br> If \a objectName is a group, the list
   * will contains all the objects of the group.<br> If \a objectName is the
   * "current" object in the context ( i.e: The object being used for launching
   * an action... ), none of the two rules below apply, and the list will only
   * contains the context "current" object name.
   */
  std::vector<gd::String> ExpandObjectsName(
      const gd::String& objectName,
      const EventsCodeGenerationContext& context) const;

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
  virtual gd::String GenerateProfilerSectionBegin(const gd::String& section) { return ""; };

  /**
   * \brief Generate the code to notify the profiler of the end of a section.
   */
  virtual gd::String GenerateProfilerSectionEnd(const gd::String& section) { return ""; };

  /**
   * \brief Get the namespace to be used to store code generated objects/values/functions,
   * with the extra "dot" at the end to be used to access to a property/member.
   *
   * Example: "gdjs.something."
   */
  virtual gd::String GetCodeNamespaceAccessor() { return ""; };

  /**
   * \brief Get the namespace to be used to store code generated objects/values/functions.
   *
   * Example: "gdjs.something"
   */
  virtual gd::String GetCodeNamespace() { return ""; };
 protected:
  /**
   * \brief Generate the code for a single parameter.
   *
   * Standard supported parameters type, and how they are used in code:
   *
   * - object : Object name -> string
   * - expression : Mathematical expression -> number (double)
   * - string : %Text expression -> string
   * - layer, color, file, joyaxis : Same as string
   * - relationalOperator : Used to make a comparison between the function
  resturn value and value of the parameter preceding the relationOperator
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
  object name in another parameter. (C++: std::map <gd::String,
  std::vector<RuntimeObject*> *>). Example:
   * \code
      AddExpression("Count", _("Object count"), _("Count the number of picked
  objects"), _("Objects"), "res/conditions/nbObjet.png")
      .AddParameter("objectList", _("Object"))
      .SetFunctionName("PickedObjectsCount").SetIncludeFile("GDCpp/Extensions/Builtin/ObjectTools.h");

   * \endcode
   * - objectListWithoutPicking : Same as objectList but do not pick object if
  they are not already picked.
   * - objectPtr : Return a pointer to object specified by the object name in
  another parameter ( C++: RuntimeObject* ). Example:
   * \code
  .AddParameter("object", _("Object"))
  .AddParameter("objectPtr", _("Target object"))
  //The called function will be called with this signature on the C++ platform:
  Function(gd::String, RuntimeObject*)
   * \endcode
   */
  virtual gd::String GenerateParameterCodes(
      const gd::String& parameter,
      const gd::ParameterMetadata& metadata,
      gd::EventsCodeGenerationContext& context,
      const gd::String& previousParameter,
      std::vector<std::pair<gd::String, gd::String> >*
          supplementaryParametersTypes);

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
   * \brief Must negate a predicat.
   *
   * The default implementation generates C-style code : It wraps the predicat
   * inside parenthesis and add a !.
   */
  virtual gd::String GenerateNegatedPredicat(const gd::String& predicat) const {
    return "!(" + predicat + ")";
  };

  /**
   * \brief Must create a boolean which is a reference to a boolean declared in
   * the parent scope.
   *
   * The default implementation generates C-style code.
   */
  virtual gd::String GenerateReferenceToUpperScopeBoolean(
      const gd::String& referenceName,
      const gd::String& referencedBoolean,
      gd::EventsCodeGenerationContext& context) {
    return "bool & " + referenceName + " = " + referencedBoolean + ";\n";
  }

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
      const std::vector<gd::String>& arguments,
      const gd::InstructionMetadata& instrInfos,
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
   * \brief Must return an expression whose value is true.
   */
  gd::String GenerateTrue() const { return "true"; };

  /**
   * \brief Must return an expression whose value is false.
   */
  gd::String GenerateFalse() const { return "false"; };

  /**
   * \brief Generate the list of comma-separated arguments to be used to call a
   * function. \param arguments The code already generated for the arguments
   * \param startFrom Index of the first argument, the previous will be ignored.
   */
  virtual gd::String GenerateArgumentsList(
      const std::vector<gd::String>& arguments, size_t startFrom = 0);

  const gd::Platform& platform;  ///< The platform being used.
  
  gd::ObjectsContainer & globalObjectsAndGroups; 
  const gd::ObjectsContainer & objectsAndGroups;

  bool hasProjectAndLayout;      ///< true only if project and layout are valid references. If false, they should not be used.
  gd::Project* project;          ///< The project being used.
  const gd::Layout* scene;       ///< The scene being generated.

  bool errorOccurred;          ///< Must be set to true if an error occured.
  bool compilationForRuntime;  ///< Is set to true if the code generation is
                               ///< made for runtime only.

  std::set<gd::String>
      includeFiles;  ///< List of headers files used by instructions. A (shared)
                     ///< pointer is used so as context created from another one
                     ///< can share the same list.
  gd::String customCodeOutsideMain;  ///< Custom code inserted before events (
                                     ///< and not in events function )
  gd::String customCodeInMain;  ///< Custom code inserted before events ( in
                                ///< main function )
  std::set<gd::String>
      customGlobalDeclarations;      ///< Custom global C++ declarations inserted
                                    ///< after includes
  size_t maxCustomConditionsDepth;  ///< The maximum depth value for all the
                                    ///< custom conditions created.
  size_t maxConditionsListsSize;  ///< The maximum size of a list of conditions.
};

}  // namespace gd

#endif  // GDCORE_EVENTSCODEGENERATOR_H
