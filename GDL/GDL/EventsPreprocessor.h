#ifndef EventsPreprocessor_H
#define EventsPreprocessor_H

#include "GDL/Event.h"
#include <string>
#include <vector>
class RuntimeScene;

using namespace std;

class GD_API EventsPreprocessor
{
    public:
        static void PreprocessEvents(const RuntimeScene & scene, vector < BaseEventSPtr > & events);
        static void PreprocessConditions(const RuntimeScene & scene, vector < Instruction > & conditions, bool & eventHasToBeDeleted);
        static void PreprocessActions(const RuntimeScene & scene, vector < Instruction > & actions);

        static void DeleteUselessEvents(vector < BaseEventSPtr > & events);

    private:
        EventsPreprocessor() {};
        virtual ~EventsPreprocessor() {};
};

#endif // EventsPreprocessor_H
