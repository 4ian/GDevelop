/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "TemplateEvents.h"

/**
 * Initialize from another TemplateEvents.
 * Used by copy ctor and assignement operator
 */
void TemplateEvents::Init(const TemplateEvents & other)
{
    events = CloneVectorOfEvents(other.events);

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
