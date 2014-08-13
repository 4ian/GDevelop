/*
 * Game Develop IDE
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License.
 */

#include "TemplateEvents.h"

/**
 * Initialize from another TemplateEvents.
 * Used by copy ctor and assignement operator
 */
void TemplateEvents::Init(const TemplateEvents & other)
{
    events = other.events;
    name = other.name;
    desc = other.desc;
    parameters = other.parameters;
}

/**
 * Custom copy operator
 */
TemplateEvents::TemplateEvents(const TemplateEvents & other)
{
    Init(other);
}

/**
 * Custom assignement operator
 */
TemplateEvents& TemplateEvents::operator=(const TemplateEvents & other)
{
    if ( this != &other )
    {
        Init(other);
    }

    return *this;
}

