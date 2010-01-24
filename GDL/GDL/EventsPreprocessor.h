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

        static void PreprocessEvents(const RuntimeScene & scene, vector < Event > & events);
        static void DeleteUselessEvents(vector < Event > & events);

    protected:
    private:
        /** Default constructor */
        EventsPreprocessor();
        /** Default destructor */
        virtual ~EventsPreprocessor();
};

#endif // EventsPreprocessor_H
