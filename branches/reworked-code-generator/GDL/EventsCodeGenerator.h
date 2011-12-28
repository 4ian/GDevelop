/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef EventsCodeGenerator_H
#define EventsCodeGenerator_H

#include "GDL/Event.h"
#include <string>
#include <vector>
#include <utility>
class Scene;
class ParameterInfo;
class EventsCodeGenerationContext;

/**
 * \brief Internal class used to prepare events for runtime.
 *
 * \see CallbacksForGeneratingExpressionCode
 */
class GD_API EventsCodeGenerator
{
    public:
        static std::string GenerateEventsCompleteCode(const Game & game, const Scene & scene, std::vector < BaseEventSPtr > & events);

        /**
         * Generate code for executing an event list
         *
         * \param game Game used
         * \param scene Scene used
         * \param events Vector of events
         * \param context Context used for generation
         * \return C++ code
         */
        static std::string GenerateEventsListCode(const Game & game, const Scene & scene, std::vector < BaseEventSPtr > & events, const EventsCodeGenerationContext & context);

        /**
         * Generate code for executing a condition list
         *
         * \param game Game used
         * \param scene Scene used
         * \param conditions Vector of conditions
         * \param context Context used for generation
         * \return C++ code. Boolean containing conditions result are name conditionXIsTrue, with X = the number of the condition, starting from 0.
         */
        static std::string GenerateConditionsListCode(const Game & game, const Scene & scene, std::vector < Instruction > & conditions, EventsCodeGenerationContext & context);

        /**
         * Generate code for executing an action list
         *
         * \param game Game used
         * \param scene Scene used
         * \param actions Vector of actions
         * \param context Context used for generation
         * \return C++ code
         */
        static std::string GenerateActionsListCode(const Game & game, const Scene & scene, std::vector < Instruction > & actions, EventsCodeGenerationContext & context);

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
         * - mapOfObjectListsOfParameterWithoutPickingThem : Same as mapOfObjectListsOfParameter but do not pick object if they are not already concerned.
         * - ptrToObjectOfParameter : Return a pointer to object specified by the object name in another parameter ( Object * ). Example:
         * \code
        instrInfo.AddParameter("object", _("Objet"), "", false);
        instrInfo.AddParameter("object", _("Target object"), "", false);
        instrInfo.AddCodeOnlyParameter("ptrToObjectOfParameter", "1"); //The called function will be called with this signature : Function(std::string, std::string, Object*)
         * \endcode
         * - mapOfAllObjectLists : Like mapOfObjectListsOfParameter, but the map contains every object lists which can be used in the scene. Use as few as possible.
         * - listOfAlreadyPickedObjects : Vector of name of objects already concerned ( std::vector<std::string> & ). Use as few as possible.
         */
        static std::vector<std::string> GenerateParametersCodes( const Game & game, const Scene & scene, std::vector < GDExpression > parameters, const std::vector < ParameterInfo > & parametersInfo, EventsCodeGenerationContext & context, std::vector < std::pair<std::string, std::string> > * supplementaryParametersTypes = 0);

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
        static std::string GenerateConditionCode(const Game & game, const Scene & scene, Instruction & condition, std::string returnBoolean, EventsCodeGenerationContext & context);

        /**
         * Generate code for a single action
         *
         * \param game Game used
         * \param scene Scene used
         * \param action Instruction of the action
         * \param context Context used for generation
         * \return C++ code
         */
        static std::string GenerateActionCode(const Game & game, const Scene & scene, Instruction & action, EventsCodeGenerationContext & context);

        static void DeleteUselessEvents(std::vector < BaseEventSPtr > & events);
        static void PreprocessEventList( const Game & game, const Scene & scene, vector < BaseEventSPtr > & listEvent );

        /**
         * Convert a plain string ( with line feed, quotes ) to a C++ string ( adding backslash ).
         *
         * \param plainString The string to convert
         * \return plainString which can be included in a C++ code.
         */
        static std::string ConvertToCppString(std::string plainString);

    private:
        EventsCodeGenerator() {};
        virtual ~EventsCodeGenerator() {};
};

#endif // EventsCodeGenerator_H
#endif
