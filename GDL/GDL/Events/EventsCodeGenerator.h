/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef EventsCodeGenerator_H
#define EventsCodeGenerator_H

#include "GDCore/Events/Event.h"
#include <string>
#include <vector>
#include <set>
#include <utility>
class Scene;
namespace gd { class ParameterMetadata; }
class EventsCodeGenerationContext;
namespace gd { class InstructionMetadata;}

/**
 * \brief Internal class used to prepare events for runtime.
 *
 * \see CallbacksForGeneratingExpressionCode
 */
class GD_API EventsCodeGenerator
{
public:

    static std::string GenerateEventsCompleteCode(Game & game, Scene & scene, std::vector < gd::BaseEventSPtr > & events, bool compilationForRuntime = false);
    static void DeleteUselessEvents(std::vector < gd::BaseEventSPtr > & events);
    static void PreprocessEventList( const Game & game, const Scene & scene, std::vector < gd::BaseEventSPtr > & listEvent );

    EventsCodeGenerator() : errorOccurred(false), compilationForRuntime(false) {};
    virtual ~EventsCodeGenerator() {};

    /**
     * Generate code for executing an event list
     *
     * \param game Game used
     * \param scene Scene used
     * \param events std::vector of events
     * \param context Context used for generation
     * \return C++ code
     */
    std::string GenerateEventsListCode(Game & game, Scene & scene, std::vector < gd::BaseEventSPtr > & events, const EventsCodeGenerationContext & context);

    /**
     * Generate code for executing a condition list
     *
     * \param game Game used
     * \param scene Scene used
     * \param conditions std::vector of conditions
     * \param context Context used for generation
     * \return C++ code. Boolean containing conditions result are name conditionXIsTrue, with X = the number of the condition, starting from 0.
     */
    std::string GenerateConditionsListCode(const Game & game, const Scene & scene, std::vector < gd::Instruction > & conditions, EventsCodeGenerationContext & context);

    /**
     * Generate code for executing an action list
     *
     * \param game Game used
     * \param scene Scene used
     * \param actions std::vector of actions
     * \param context Context used for generation
     * \return C++ code
     */
    std::string GenerateActionsListCode(const Game & game, const Scene & scene, std::vector < gd::Instruction > & actions, EventsCodeGenerationContext & context);

    /**
     * Generate the code for a parameter of an action/condition/expression.
     *
     * \param game Game used
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
     * - mapOfObjectListsOfParameter : a std::map containing lists of objects which are specified by the object name in another parameter. (std::map <std::string, std::vector<Object*> *>) Example:
     * \code
    DECLARE_EXPRESSION("Count", _("Object count"), _("Count the number of picked objects"), _("Objects"), "res/conditions/nbObjet.png")
        instrInfo.AddParameter("object", _("Object"), "", false);
        instrInfo.AddCodeOnlyParameter("mapOfObjectListsOfParameter", "0");

        instrInfo.cppCallingInformation.SetFunctionName("PickedObjectsCount").SetIncludeFile("GDL/BuiltinExtensions/ObjectTools.h");
    DECLARE_END_EXPRESSION()
     * \endcode
     * - mapOfObjectListsOfParameterWithoutPicking : Same as mapOfObjectListsOfParameter but do not pick object if they are not already concerned.
     * - ptrToObjectOfParameter : Return a pointer to object specified by the object name in another parameter ( Object * ). Example:
     * \code
    instrInfo.AddParameter("object", _("Object"), "", false);
    instrInfo.AddParameter("object", _("Target object"), "", false);
    instrInfo.AddCodeOnlyParameter("ptrToObjectOfParameter", "1"); //The called function will be called with this signature : Function(std::string, std::string, Object*)
     * \endcode
     */
    std::vector<std::string> GenerateParametersCodes( const Game & game, const Scene & scene, std::vector < gd::Expression > parameters, const std::vector < gd::ParameterMetadata > & parametersInfo, EventsCodeGenerationContext & context, std::vector < std::pair<std::string, std::string> > * supplementaryParametersTypes = 0);

    /**
     * Generate code for a single condition
     *
     * \param game Game used
     * \param scene Scene used
     * \param condition gd::Instruction of the condition
     * \param returnBoolean The name of the C++ boolean that will contains the condition result.
     * \param context Context used for generation
     * \return C++ code
     */
    std::string GenerateConditionCode(const Game & game, const Scene & scene, gd::Instruction & condition, std::string returnBoolean, EventsCodeGenerationContext & context);

    /**
     * Generate code for a single action
     *
     * \param game Game used
     * \param scene Scene used
     * \param action gd::Instruction of the action
     * \param context Context used for generation
     * \return C++ code
     */
    std::string GenerateActionCode(const Game & game, const Scene & scene, gd::Instruction & action, EventsCodeGenerationContext & context);

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
    static std::string ConvertToCppString(std::string plainString);

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

private:

    std::string GenerateRelationalOperatorCall(const gd::InstructionMetadata & instrInfos, std::vector<std::string> & arguments, const std::string & callStartString, unsigned int startFromArgument = 0);
    std::string GenerateOperatorCall(const gd::InstructionMetadata & instrInfos, std::vector<std::string> & arguments, const std::string & callStartString, const std::string & getterStartString, unsigned int startFromArgument = 0);
    std::string GenerateCompoundOperatorCall(const gd::InstructionMetadata & instrInfos, std::vector<std::string> & arguments, const std::string & callStartString, unsigned int startFromArgument = 0);

    bool errorOccurred;
    bool compilationForRuntime;

    std::set<std::string> includeFiles; ///< List of headers files used by instructions. A (shared) pointer is used so as context created from another one can share the same list.
    std::string customCodeOutsideMain; ///< Custom code inserted before events ( and not in events function )
    std::string customCodeInMain; ///< Custom code inserted before events ( in main function )
    std::set<std::string> customGlobalDeclaration; ///< Custom global C++ declarations inserted after includes
};

#endif // EventsCodeGenerator_H
#endif

