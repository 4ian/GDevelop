#ifndef EventsCodeGenerator_H
#define EventsCodeGenerator_H

#include "GDL/Event.h"
#include <string>
#include <vector>
class RuntimeScene;
class ParameterInfo;
class EventsCodeGenerationContext;

/**
 * \brief Internal class used to prepare events for runtime.
 */
class GD_API EventsCodeGenerator
{
    public:
        static std::string GenerateEventsCompleteCode(const RuntimeScene & scene, std::vector < BaseEventSPtr > & events);
        static std::string GenerateEventsListCode(const RuntimeScene & scene, std::vector < BaseEventSPtr > & events, const EventsCodeGenerationContext & context);
        static std::string GenerateConditionsListCode(const RuntimeScene & scene, std::vector < Instruction > & conditions, EventsCodeGenerationContext & context);
        static std::string GenerateActionsListCode(const RuntimeScene & scene, std::vector < Instruction > & actions, EventsCodeGenerationContext & context);
        static std::vector<std::string> GenerateParametersCodes( const Game & game, const Scene & scene, const std::vector < GDExpression > & parameters, const std::vector < ParameterInfo > & parametersInfo, EventsCodeGenerationContext & context);

        static void DeleteUselessEvents(std::vector < BaseEventSPtr > & events);

    private:
        EventsCodeGenerator() {};
        virtual ~EventsCodeGenerator() {};
};

#endif // EventsCodeGenerator_H
