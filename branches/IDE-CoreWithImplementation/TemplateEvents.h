/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef TEMPLATEEVENTS_H
#define TEMPLATEEVENTS_H

#include "GDCore/Events/Event.h"

#include <string>
#include <vector>

using namespace std;

/**
 * Class representing an events template
 */
class TemplateEvents
{
    public:
        TemplateEvents() {};
        TemplateEvents(const TemplateEvents & other);
        virtual ~TemplateEvents() {};

        TemplateEvents& operator=(const TemplateEvents & other);

        vector < gd::BaseEventSPtr > events;
        vector < string > parameters;
        string name;
        string desc;

    private:

        void Init(const TemplateEvents & other);
};

#endif // TEMPLATEEVENTS_H

