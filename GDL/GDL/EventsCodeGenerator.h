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
