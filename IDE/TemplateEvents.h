/*
 * Game Develop IDE
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License.
 */

#ifndef TEMPLATEEVENTS_H
#define TEMPLATEEVENTS_H

#include "GDCore/Events/EventsList.h"
#include "GDCore/Events/Event.h"
#include <string>
#include <vector>

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

    gd::EventsList events;
    std::vector < std::string > parameters;
    std::string name;
    std::string desc;

private:

    void Init(const TemplateEvents & other);
};

#endif // TEMPLATEEVENTS_H

