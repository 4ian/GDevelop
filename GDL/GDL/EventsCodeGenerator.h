/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

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

        static std::string GenerateEventsListCode(const Game & game, const Scene & scene, std::vector < BaseEventSPtr > & events, const EventsCodeGenerationContext & context);
        static std::string GenerateConditionsListCode(const Game & game, const Scene & scene, std::vector < Instruction > & conditions, EventsCodeGenerationContext & context);
        static std::string GenerateActionsListCode(const Game & game, const Scene & scene, std::vector < Instruction > & actions, EventsCodeGenerationContext & context);

        /**
         * Generate the code for a parameter of an action/condition/expression.
         *
         * \param Game used
         * \param Scene used
         * \param Vector of actual parameters.
         * \param Vector of information about parameters
         * \param Context used for generation
         * \param Optional vector of new parameters types ( vector of pair<std::string,std::string>("type", "valueToBeInserted") )
         */
        static std::vector<std::string> GenerateParametersCodes( const Game & game, const Scene & scene, std::vector < GDExpression > parameters, const std::vector < ParameterInfo > & parametersInfo, EventsCodeGenerationContext & context, std::vector < std::pair<std::string, std::string> > * supplementaryParametersTypes = 0);

        static std::string GenerateConditionCode(const Game & game, const Scene & scene, Instruction & condition, std::string returnBoolean, EventsCodeGenerationContext & context);
        static std::string GenerateActionCode(const Game & game, const Scene & scene, Instruction & action, EventsCodeGenerationContext & context);

        static void DeleteUselessEvents(std::vector < BaseEventSPtr > & events);
        static void PreprocessEventList( const Game & game, const Scene & scene, vector < BaseEventSPtr > & listEvent );

        /**
         * Convert a plain string ( with line feed, quotes ) to a C++ string ( adding backslash ).
         */
        static std::string ConvertToCppString(std::string plainString);

    private:
        EventsCodeGenerator() {};
        virtual ~EventsCodeGenerator() {};
};

#endif // EventsCodeGenerator_H
