#ifndef EventsPreprocessor_H
#define EventsPreprocessor_H

#include "GDL/Event.h"
#include <string>
#include <vector>
class RuntimeScene;

using namespace std;

/**
 * \brief Internal class used to prepare events for runtime.
 */
class GD_API EventsPreprocessor
{
    public:
        static void GenerateEventsCode(const RuntimeScene & scene, vector < BaseEventSPtr > & events, std::string & output);
        static std::string GenerateConditionsListCode(const RuntimeScene & scene, vector < Instruction > & conditions);
        static std::string GenerateActionsListCode(const RuntimeScene & scene, vector < Instruction > & actions);

        static void DeleteUselessEvents(vector < BaseEventSPtr > & events);

    private:
        EventsPreprocessor() {};
        virtual ~EventsPreprocessor() {};
};

#endif // EventsPreprocessor_H
