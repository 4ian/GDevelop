#ifndef GDCORE_EVENTSCODEGENERATOR_H
#define GDCORE_EVENTSCODEGENERATOR_H

#include "GDCore/Events/Event.h"
#include <string>
#include <vector>
#include <set>
#include <utility>
namespace gd { class Project; }
namespace gd { class Layout; }
namespace gd { class ExternalEvents; }
namespace gd { class ParameterMetadata; }
namespace gd { class ObjectMetadata; }
namespace gd { class AutomatismMetadata; }
namespace gd { class InstructionMetadata; }
namespace gd { class EventsCodeGenerationContext; }
namespace gd { class InstructionMetadata;}
namespace gd { class Platform;}

namespace gd
{

/**
 * \brief Internal class used to generate code from events
 * \todo For now, this class generates only C++ code for GD C++ Platform.
 *
 * \see CallbacksForGeneratingExpressionCode
 */
class GD_CORE_API EventsCodeGenerator
{
    friend class CallbacksForGeneratingExpressionCode;
public:
    static void DeleteUselessEvents(std::vector < gd::BaseEventSPtr > & events);

    /**
     * \brief Construct a code generator for the specified platform/project/layout.
     */
    EventsCodeGenerator(gd::Project & project_, const gd::Layout & layout, const gd::Platform & platform_) : project(project_), scene(layout), platform(platform_), errorOccurred(false), compilationForRuntime(false) {};
    virtual ~EventsCodeGenerator() {};

    /**
     * \brief Preprocess an events list ( Replacing for example links with the linked event ).
     *
     * This should be called before any code generation.
     */
    void PreprocessEventList( std::vector < gd::BaseEventSPtr > & listEvent );

    /**
     * \brief Generate code for executing an event list
     *
     * \param events std::vector of events
     * \param context Context used for generation
     * \return C++ code
     */
    std::string GenerateEventsListCode(std::vector < gd::BaseEventSPtr > & events, const EventsCodeGenerationContext & context);

    /**
     * \brief Generate code for executing a condition list
     *
     * The default implementation create the condition calls using C-style ifs and booleans.
     *
     * \param game Game used
     * \param scene Scene used
     * \param conditions std::vector of conditions
     * \param context Context used for generation
     * \return Code. Boolean containing conditions result are name conditionXIsTrue, with X = the number of the condition, starting from 0.
     */
    virtual std::string GenerateConditionsListCode(std::vector < gd::Instruction > & conditions, EventsCodeGenerationContext & context);

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
    virtual std::string GenerateActionsListCode(std::vector < gd::Instruction > & actions, EventsCodeGenerationContext & context);

    /**
     * \brief Generate the code for a parameter of an action/condition/expression.
     *
     * This method uses GenerateParameterCodes to generate the parameters code.
     *
     * \param scene Scene used
     * \param parameters std::vector of actual parameters.
     * \param parametersInfo std::vector of information about parameters
     * \param context Context used for generation
     * \param supplementaryParametersTypes Optional std::vector of new parameters types ( std::vector of pair<std::string,std::string>("type", "valueToBeInserted") )
     *
     */
    std::vector<std::string> GenerateParametersCodes(std::vector < gd::Expression > parameters,
                                                     const std::vector < gd::ParameterMetadata > & parametersInfo,
                                                     EventsCodeGenerationContext & context,
                                                     std::vector < std::pair<std::string, std::string> > * supplementaryParametersTypes = 0);

    /**
     * \brief Generate code for a single condition.
     *
     * The generation is really done in GenerateFreeCondition/GenerateObjectCondition or GenerateAutomatismCondition.
     *
     * \param condition instruction to be done.
     * \param returnBoolean The name of the boolean that must contains the condition result.
     * \param context Context used for generation
     * \return Code
     */
    std::string GenerateConditionCode(gd::Instruction & condition, std::string returnBoolean, EventsCodeGenerationContext & context);

    /**
     * Generate code for a single action
     *
     * The generation is really done in GenerateFreeAction/GenerateObjectAction or GenerateAutomatismAction.
     *
     * \param condition instruction to be done.
     * \param context Context used for generation
     * \return Code
     */
    std::string GenerateActionCode(gd::Instruction & action, EventsCodeGenerationContext & context);

    /**
     * Generate code for declaring objects lists.
     *
     * \param context The context to be used.
     */
    virtual std::string GenerateObjectsDeclarationCode(EventsCodeGenerationContext & context);

    /**
     * \brief Must convert a plain string ( with line feed, quotes ) to a string that can be inserted into code.
     * The string construction can be explicit.
     *
     * Usage example :
     * \code
        code += "std::string(\""+codeGenerator.ConvertToString(name)+"\")";
     / \endcode
     *
     * \param plainString The string to convert
     * \return plainString which can be included into the generated code.
     */
    virtual std::string ConvertToString(std::string plainString);

    /**
     * \brief Convert a plain string ( with line feed, quotes ) to a string that can be inserted into code.
     * The string construction must be explicit : for example, quotes must be added if the target language need quotes.
     *
     * Usage example :
     * \code
        code += codeGenerator.ConvertToStringExplicit(name);
     / \endcode
     *
     * \note The default implementation simply call ConvertToString and add quotes
     *
     * \param plainString The string to convert
     * \return plainString which can be included into the generated code.
     */
    virtual std::string ConvertToStringExplicit(std::string plainString);

    /**
     * Declare an include file to be added
     */
    void AddIncludeFile(std::string file) { if ( !file.empty() ) includeFiles.insert(file); };

    /**
     * Add a declaration which will be inserted after includes
     */
    void AddGlobalDeclaration(std::string declaration) { customGlobalDeclaration.insert(declaration); };

    /**
     * Add some code before events outside main function.
     */
    void AddCustomCodeOutsideMain(std::string code) { customCodeOutsideMain += code; };

    /**
     * Add some code before events in main function.
     */
    void AddCustomCodeInMain(std::string code) { customCodeInMain += code; };

    /** Get the set containing the include files.
     */
    const std::set<std::string> & GetIncludeFiles() const { return includeFiles; }

    /** Get the custom code to be inserted outside main.
     */
    const std::string & GetCustomCodeOutsideMain() const { return customCodeOutsideMain; }

    /** Get the custom code to be inserted inside main.
     */
    const std::string & GetCustomCodeInMain() const { return customCodeInMain; }

    /** Get the custom declaration to be inserted after #includes.
     */
    const std::set<std::string> & GetCustomGlobalDeclaration() const { return customGlobalDeclaration; }

    /**
     * Return true if code generation is made for runtime only.
     */
    bool GenerateCodeForRuntime() { return compilationForRuntime; }

    /**
     * Set if the code generated is meant to be used for runtime only and not in the IDE.
     */
    void SetGenerateCodeForRuntime(bool compilationForRuntime_) { compilationForRuntime = compilationForRuntime_; }

    /**
     * Report that an error occurred during code generation ( Event code won't be generated )
     */
    void ReportError();

    /**
     * Return true if an error has occurred during code generation ( in this case, generated code is not usable )
     */
    bool ErrorOccurred() const { return errorOccurred; };

    /**
     * Get the project the code is being generated for
     */
    gd::Project & GetProject() const { return project; }

    /**
     * Get the layout the code is being generated for
     */
    const gd::Layout & GetLayout() const { return scene; }

    /**
     * Get the platform the code is being generated for
     */
    const gd::Platform & GetPlatform() const { return platform; }

    /**
     * Get a list the "real" objects name when the events refers to \a objectName :<br>
     * If \a objectName if really an object, the list will only contains \a objectName unchanged.<br>
     * If \a objectName is a group, the list will contains all the objects of the group.<br>
     * If \a objectName is the "current" object in the context ( i.e: The object being used for launching an action... ),
     * none of the two rules below apply, and the list will only contains the context "current" object name.
     */
    std::vector<std::string> ExpandObjectsName(const std::string & objectName, const EventsCodeGenerationContext & context) const;

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
     * - relationalOperator : Used to make a comparison between the function resturn value and value of the parameter preceding the relationOperator parameter -> string
     * - operator : Used to update a value using a setter and a getter -> string
     * - key, mouse, objectvar, scenevar, globalvar, password, musicfile, soundfile, police -> string
     * - trueorfalse, yesorno -> boolean ( See GenerateTrue/GenerateFalse ).
     *
     * <br><br>
     * "Code only" parameters types:
     * - inlineCode: supplementary information associated with the parameter is directly pasted in the code without change.
     *
     * <br><br>
     * Other standard parameters type that should be implemented by platforms:
     * - currentScene: Reference to the current runtime scene.
     * - objectList : a map containing lists of objects which are specified by the object name in another parameter. (C++: std::map <std::string, std::vector<RuntimeObject*> *>). Example:
     * \code
        AddExpression("Count", _("Object count"), _("Count the number of picked objects"), _("Objects"), "res/conditions/nbObjet.png")
        .AddParameter("objectList", _("Object"))
        .codeExtraInformation.SetFunctionName("PickedObjectsCount").SetIncludeFile("GDL/BuiltinExtensions/ObjectTools.h");

     * \endcode
     * - objectListWithoutPicking : Same as objectList but do not pick object if they are not already picked.
     * - objectPtr : Return a pointer to object specified by the object name in another parameter ( C++: RuntimeObject * ). Example:
     * \code
    .AddParameter("object", _("Object"))
    .AddParameter("objectPtr", _("Target object"))
    //The called function will be called with this signature on the C++ platform: Function(std::string, RuntimeObject*)
     * \endcode
     */
    virtual std::string GenerateParameterCodes(const std::string & parameter, const gd::ParameterMetadata & metadata,
                                               gd::EventsCodeGenerationContext & context,
                                               const std::vector < gd::Expression > & othersParameters,
                                               std::vector < std::pair<std::string, std::string> > * supplementaryParametersTypes);

    virtual std::string GenerateCurrentObjectFunctionCall(std::string objectListName,
                                                          const ObjectMetadata & objMetadata,
                                                          std::string functionCallName,
                                                          std::string parametersStr);

    virtual std::string GenerateNotPickedObjectFunctionCall(std::string objectListName,
                                                            const ObjectMetadata & objMetadata,
                                                            std::string functionCallName,
                                                            std::string parametersStr,
                                                            std::string defaultOutput);

    virtual std::string GenerateCurrentObjectAutomatismFunctionCall(std::string objectListName,
                                                                      std::string automatismName,
                                                                      const gd::AutomatismMetadata & autoInfo,
                                                                      std::string functionCallName,
                                                                      std::string parametersStr);

    virtual std::string GenerateNotPickedObjectAutomatismFunctionCall(std::string objectListName,
                                                                      std::string automatismName,
                                                                      const gd::AutomatismMetadata & autoInfo,
                                                                      std::string functionCallName,
                                                                      std::string parametersStr,
                                                                      std::string defaultOutput);

    /**
     * \brief Called when a new scope must be entered.
     * \param context The context : Internal events of the scope have been generated, but GenerateObjectsDeclarationCode was not called.
     * \param extraVariable An optional supplementary variable that should be inherited from the parent scope.
     */
    virtual std::string GenerateScopeBegin(gd::EventsCodeGenerationContext & context, const std::string & extraVariable = "") const { return "{\n"; };

    /**
     * \brief Called when a new must be ended.
     * \param context The context : Internal events of the scope have been generated, but GenerateObjectsDeclarationCode was not called.
     * \param extraVariable An optional supplementary variable that should be inherited from the parent scope.
     */
    virtual std::string GenerateScopeEnd(gd::EventsCodeGenerationContext & context, const std::string & extraVariable = "") const { return "}\n"; };
    virtual std::string GenerateNegatedPredicat(const std::string & predicat) const { return "!("+predicat+")"; };
    virtual std::string GenerateReferenceToBoolean(const std::string & referenceName, const std::string & referencedBoolean) { return "bool & "+referenceName+" = "+referencedBoolean+";\n";}
    virtual std::string GenerateBooleanInitializationToFalse(const std::string & boolName) { return "bool "+boolName+" = false;\n";}

    virtual std::string GenerateFreeCondition(const std::vector<std::string> & arguments,
                                              const gd::InstructionMetadata & instrInfos,
                                              const std::string & returnBoolean,
                                              bool conditionInverted);

    virtual std::string GenerateObjectCondition(const std::string & objectName,
                                                            const gd::ObjectMetadata & objInfo,
                                                            const std::vector<std::string> & arguments,
                                                            const gd::InstructionMetadata & instrInfos,
                                                            const std::string & returnBoolean,
                                                            bool conditionInverted);

    virtual std::string GenerateAutomatismCondition(const std::string & objectName,
                                                                const std::string & automatismName,
                                                                const gd::AutomatismMetadata & autoInfo,
                                                                const std::vector<std::string> & arguments,
                                                                const gd::InstructionMetadata & instrInfos,
                                                                const std::string & returnBoolean,
                                                                bool conditionInverted);

    virtual std::string GenerateFreeAction(const std::vector<std::string> & arguments,
                                           const gd::InstructionMetadata & instrInfos);

    virtual std::string GenerateObjectAction(const std::string & objectName,
                                                        const gd::ObjectMetadata & objInfo,
                                                        const std::vector<std::string> & arguments,
                                                        const gd::InstructionMetadata & instrInfos);

    virtual std::string GenerateAutomatismAction(const std::string & objectName,
                                                            const std::string & automatismName,
                                                            const gd::AutomatismMetadata & autoInfo,
                                                            const std::vector<std::string> & arguments,
                                                            const gd::InstructionMetadata & instrInfos);


    std::string GenerateRelationalOperatorCall(const gd::InstructionMetadata & instrInfos, const std::vector<std::string> & arguments, const std::string & callStartString, unsigned int startFromArgument = 0);
    std::string GenerateOperatorCall(const gd::InstructionMetadata & instrInfos, const std::vector<std::string> & arguments, const std::string & callStartString, const std::string & getterStartString, unsigned int startFromArgument = 0);
    std::string GenerateCompoundOperatorCall(const gd::InstructionMetadata & instrInfos, const std::vector<std::string> & arguments, const std::string & callStartString, unsigned int startFromArgument = 0);

    std::string GenerateTrue() const { return "true"; };
    std::string GenerateFalse() const { return "false"; };

    gd::Project & project;
    const gd::Layout & scene;
    const gd::Platform & platform;

    bool errorOccurred;
    bool compilationForRuntime;

    std::set<std::string> includeFiles; ///< List of headers files used by instructions. A (shared) pointer is used so as context created from another one can share the same list.
    std::string customCodeOutsideMain; ///< Custom code inserted before events ( and not in events function )
    std::string customCodeInMain; ///< Custom code inserted before events ( in main function )
    std::set<std::string> customGlobalDeclaration; ///< Custom global C++ declarations inserted after includes
};

}

#endif // GDCORE_EVENTSCODEGENERATOR_H
