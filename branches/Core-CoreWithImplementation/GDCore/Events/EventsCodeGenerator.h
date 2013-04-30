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
    static void PreprocessEventList( gd::Project & game, gd::Layout & scene, std::vector < gd::BaseEventSPtr > & listEvent );

    /**
     * \brief Construct a code generator for the specified platform/project/layout.
     */
    EventsCodeGenerator(const gd::Project & project_, const gd::Layout & layout, const gd::Platform & platform_) : project(project_), scene(layout), platform(platform_), errorOccurred(false), compilationForRuntime(false) {};
    virtual ~EventsCodeGenerator() {};

    /**
     * Generate code for executing an event list
     *
     * \param events std::vector of events
     * \param context Context used for generation
     * \return C++ code
     */
    std::string GenerateEventsListCode(std::vector < gd::BaseEventSPtr > & events, const EventsCodeGenerationContext & context);

    /**
     * Generate code for executing a condition list
     *
     * \param game Game used
     * \param scene Scene used
     * \param conditions std::vector of conditions
     * \param context Context used for generation
     * \return C++ code. Boolean containing conditions result are name conditionXIsTrue, with X = the number of the condition, starting from 0.
     */
    std::string GenerateConditionsListCode(std::vector < gd::Instruction > & conditions, EventsCodeGenerationContext & context);

    /**
     * Generate code for executing an action list
     *
     * \param game Game used
     * \param scene Scene used
     * \param actions std::vector of actions
     * \param context Context used for generation
     * \return C++ code
     */
    std::string GenerateActionsListCode(std::vector < gd::Instruction > & actions, EventsCodeGenerationContext & context);

    /**
     * Generate the code for a parameter of an action/condition/expression.
     *
     * \param scene Scene used
     * \param parameters std::vector of actual parameters.
     * \param parametersInfo std::vector of information about parameters
     * \param context Context used for generation
     * \param supplementaryParametersTypes Optional std::vector of new parameters types ( std::vector of pair<std::string,std::string>("type", "valueToBeInserted") )
     *
     * Supported parameters type, and how they are used in C++ code:
     *
     * - object : Object name. (std::string)
     * - expression : Mathematical expression. (double)
     * - string : %Text expression. (std::string)
     * - layer, color, file, joyaxis : Same as string
     * - relationalOperator : Used to make a comparison between the function resturn value and value of the parameter preceding the relationOperator parameter. (std::string)
     * - operator : Used to update a value using a setter and a getter. (std::string)
     * - key, mouse, objectvar, scenevar, globalvar, password, musicfile, soundfile, police: (std::string)
     * - trueorfalse, yesorno : (bool)
     *
     * <br><br>
     * "Code only" parameters types:
     * - currentScene: Reference to the current runtime scene ( RuntimeScene& )
     * - inlineCode: supplementary information associated with the parameter is directly pasted in the C++ code without change.
     * - mapOfObjectListsOfParameter : a std::map containing lists of objects which are specified by the object name in another parameter. (std::map <std::string, std::vector<RuntimeObject*> *>) Example:
     * \code
        AddExpression("Count", _("Object count"), _("Count the number of picked objects"), _("Objects"), "res/conditions/nbObjet.png")
        .AddParameter("object", _("Object"))
        .AddCodeOnlyParameter("mapOfObjectListsOfParameter", "0")
        .codeExtraInformation.SetFunctionName("PickedObjectsCount").SetIncludeFile("GDL/BuiltinExtensions/ObjectTools.h");

     * \endcode
     * - mapOfObjectListsOfParameterWithoutPicking : Same as mapOfObjectListsOfParameter but do not pick object if they are not already picked.
     * - ptrToObjectOfParameter : Return a pointer to object specified by the object name in another parameter ( RuntimeObject * ). Example:
     * \code
    .AddParameter("object", _("Object"))
    .AddParameter("object", _("Target object"))
    .AddCodeOnlyParameter("ptrToObjectOfParameter", "1") //The called function will be called with this signature : Function(std::string, std::string, RuntimeObject*)
     * \endcode
     */
    virtual std::vector<std::string> GenerateParametersCodes(std::vector < gd::Expression > parameters, const std::vector < gd::ParameterMetadata > & parametersInfo, EventsCodeGenerationContext & context, std::vector < std::pair<std::string, std::string> > * supplementaryParametersTypes = 0);

    /**
     * Generate code for a single condition
     *
     * \param scene Scene used
     * \param condition gd::Instruction of the condition
     * \param returnBoolean The name of the C++ boolean that will contains the condition result.
     * \param context Context used for generation
     * \return C++ code
     */
    std::string GenerateConditionCode(gd::Instruction & condition, std::string returnBoolean, EventsCodeGenerationContext & context);

    /**
     * Generate code for a single action
     *
     * \param scene Scene used
     * \param action gd::Instruction of the action
     * \param context Context used for generation
     * \return C++ code
     */
    std::string GenerateActionCode(gd::Instruction & action, EventsCodeGenerationContext & context);

    /**
     * Generate code for declaring objects lists.
     *
     * \param context The context to be used.
     */
    std::string GenerateObjectsDeclarationCode(EventsCodeGenerationContext & context);

    /**
     * Convert a plain string ( with line feed, quotes ) to a C++ string ( adding backslash ).
     *
     * Usage example :
     * \code
        cppCode += "std::string(\""+EventsCodeGenerator::ConvertToCppString(name)+"\")";
     / \endcode
     *
     * \param plainString The string to convert
     * \return plainString which can be included in a C++ code.
     */
    std::string ConvertToCppString(std::string plainString);

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
    const gd::Project & GetProject() const { return project; }

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

    virtual std::string GenerateScopeBegin() const { return "{\n"; };
    virtual std::string GenerateScopeEnd() const { return "}\n"; };
    virtual std::string GenerateNegatedPredicat(const std::string & predicat) const { return "!("+predicat+")"; };
    virtual std::string GenerateReferenceToBoolean(const std::string & referenceName, const std::string & referencedBoolean) { return "bool & "+referenceName+" = "+referencedBoolean+";\n";}
    virtual std::string GenerateBooleanInitializationToFalse(const std::string & boolName) { return "bool "+boolName+" = false;\n";}

    virtual std::string GenerateObjectListObjectCondition(const std::string & objectName,
                                                            const gd::ObjectMetadata & objInfo,
                                                            const std::vector<std::string> & arguments,
                                                            const gd::InstructionMetadata & instrInfos,
                                                            const std::string & returnBoolean,
                                                            bool conditionInverted);

    virtual std::string GenerateObjectListAutomatismCondition(const std::string & objectName,
                                                                const std::string & automatismName,
                                                                const gd::AutomatismMetadata & autoInfo,
                                                                const std::vector<std::string> & arguments,
                                                                const gd::InstructionMetadata & instrInfos,
                                                                const std::string & returnBoolean,
                                                                bool conditionInverted);

    virtual std::string GenerateObjectListObjectAction(const std::string & objectName,
                                                        const gd::ObjectMetadata & objInfo,
                                                        const std::vector<std::string> & arguments,
                                                        const gd::InstructionMetadata & instrInfos);

    virtual std::string GenerateObjectListAutomatismAction(const std::string & objectName,
                                                            const std::string & automatismName,
                                                            const gd::AutomatismMetadata & autoInfo,
                                                            const std::vector<std::string> & arguments,
                                                            const gd::InstructionMetadata & instrInfos);


    std::string GenerateRelationalOperatorCall(const gd::InstructionMetadata & instrInfos, const std::vector<std::string> & arguments, const std::string & callStartString, unsigned int startFromArgument = 0);
    std::string GenerateOperatorCall(const gd::InstructionMetadata & instrInfos, const std::vector<std::string> & arguments, const std::string & callStartString, const std::string & getterStartString, unsigned int startFromArgument = 0);
    std::string GenerateCompoundOperatorCall(const gd::InstructionMetadata & instrInfos, const std::vector<std::string> & arguments, const std::string & callStartString, unsigned int startFromArgument = 0);

    const gd::Project & project;
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
