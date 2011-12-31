/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef EventsCodeGenerator_H
#define EventsCodeGenerator_H

#include "GDL/Event.h"
#include <string>
#include <vector>
#include <set>
#include <utility>
class Scene;
class ParameterInfo;
class EventsCodeGenerationContext;
class InstructionInfos;

/**
 * \brief Internal class used to prepare events for runtime.
 *
 * \see CallbacksForGeneratingExpressionCode
 */
class GD_API EventsCodeGenerator
{
public:

    static std::string GenerateEventsCompleteCode(const Game & game, const Scene & scene, std::vector < BaseEventSPtr > & events);
    static void DeleteUselessEvents(std::vector < BaseEventSPtr > & events);
    static void PreprocessEventList( const Game & game, const Scene & scene, vector < BaseEventSPtr > & listEvent );

    EventsCodeGenerator() {};
    virtual ~EventsCodeGenerator() {};

    /**
     * Generate code for executing an event list
     *
     * \param game Game used
     * \param scene Scene used
     * \param events Vector of events
     * \param context Context used for generation
     * \return C++ code
     */
    std::string GenerateEventsListCode(const Game & game, const Scene & scene, std::vector < BaseEventSPtr > & events, const EventsCodeGenerationContext & context);

    /**
     * Generate code for executing a condition list
     *
     * \param game Game used
     * \param scene Scene used
     * \param conditions Vector of conditions
     * \param context Context used for generation
     * \return C++ code. Boolean containing conditions result are name conditionXIsTrue, with X = the number of the condition, starting from 0.
     */
    std::string GenerateConditionsListCode(const Game & game, const Scene & scene, std::vector < Instruction > & conditions, EventsCodeGenerationContext & context);

    /**
     * Generate code for executing an action list
     *
     * \param game Game used
     * \param scene Scene used
     * \param actions Vector of actions
     * \param context Context used for generation
     * \return C++ code
     */
    std::string GenerateActionsListCode(const Game & game, const Scene & scene, std::vector < Instruction > & actions, EventsCodeGenerationContext & context);

    /**
     * Generate the code for a parameter of an action/condition/expression.
     *
     * \param game Game used
     * \param scene Scene used
     * \param parameters Vector of actual parameters.
     * \param parametersInfo Vector of information about parameters
     * \param context Context used for generation
     * \param supplementaryParametersTypes Optional vector of new parameters types ( vector of pair<std::string,std::string>("type", "valueToBeInserted") )
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
        instrInfo.AddParameter("object", _("Objet"), "", false);
        instrInfo.AddCodeOnlyParameter("mapOfObjectListsOfParameter", "0");

        instrInfo.cppCallingInformation.SetFunctionName("PickedObjectsCount").SetIncludeFile("GDL/ObjectTools.h");
    DECLARE_END_EXPRESSION()
     * \endcode
     * - mapOfObjectListsOfParameterWithoutPicking : Same as mapOfObjectListsOfParameter but do not pick object if they are not already concerned.
     * - ptrToObjectOfParameter : Return a pointer to object specified by the object name in another parameter ( Object * ). Example:
     * \code
    instrInfo.AddParameter("object", _("Objet"), "", false);
    instrInfo.AddParameter("object", _("Target object"), "", false);
    instrInfo.AddCodeOnlyParameter("ptrToObjectOfParameter", "1"); //The called function will be called with this signature : Function(std::string, std::string, Object*)
     * \endcode
     */
    std::vector<std::string> GenerateParametersCodes( const Game & game, const Scene & scene, std::vector < GDExpression > parameters, const std::vector < ParameterInfo > & parametersInfo, EventsCodeGenerationContext & context, std::vector < std::pair<std::string, std::string> > * supplementaryParametersTypes = 0);

    /**
     * Generate code for a single condition
     *
     * \param game Game used
     * \param scene Scene used
     * \param condition Instruction of the condition
     * \param returnBoolean The name of the C++ boolean that will contains the condition result.
     * \param context Context used for generation
     * \return C++ code
     */
    std::string GenerateConditionCode(const Game & game, const Scene & scene, Instruction & condition, std::string returnBoolean, EventsCodeGenerationContext & context);

    /**
     * Generate code for a single action
     *
     * \param game Game used
     * \param scene Scene used
     * \param action Instruction of the action
     * \param context Context used for generation
     * \return C++ code
     */
    std::string GenerateActionCode(const Game & game, const Scene & scene, Instruction & action, EventsCodeGenerationContext & context);

    /**
     * Convert a plain string ( with line feed, quotes ) to a C++ string ( adding backslash ).
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
     * Report that an error occurred during code generation ( Event code won't be generated )
     */
    void ReportError();

    /**
     * Return true if an error has occurred during code generation ( in this case, generated code is not usable )
     */
    bool ErrorOccurred() const { return errorOccurred; };

private:

    std::string GenerateRelationalOperatorCall(const InstructionInfos & instrInfos, vector<string> & arguments, const string & callStartString, unsigned int startFromArgument = 0);
    std::string GenerateOperatorCall(const InstructionInfos & instrInfos, vector<string> & arguments, const string & callStartString, const string & getterStartString, unsigned int startFromArgument = 0);
    std::string GenerateCompoundOperatorCall(const InstructionInfos & instrInfos, vector<string> & arguments, const string & callStartString, unsigned int startFromArgument = 0);

    bool errorOccurred;

    std::set<std::string> includeFiles; ///< List of headers files used by instructions. A (shared) pointer is used so as context created from another one can share the same list.
    std::string customCodeOutsideMain; ///< Custom code inserted before events ( and not in events function )
    std::string customCodeInMain; ///< Custom code inserted before events ( in main function )
    std::set<std::string> customGlobalDeclaration; ///< Custom global C++ declarations inserted after includes
};

#endif // EventsCodeGenerator_H
#endif
