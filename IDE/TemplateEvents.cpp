/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#include "TemplateEvents.h"

/**
 * Initialize from another TemplateEvents.
 * Used by copy ctor and assignement operator
 */
void TemplateEvents::Init(const TemplateEvents & other)
{
    events.clear();
    for (unsigned int i =0;i<other.events.size();++i)
    	events.push_back( other.events[i]->Clone() );

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
