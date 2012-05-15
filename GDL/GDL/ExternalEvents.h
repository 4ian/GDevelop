/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef EXTERNALEVENTS_H
#define EXTERNALEVENTS_H
#include <string>
#include <vector>
#include "GDCore/PlatformDefinition/ExternalEvents.h"
#include "GDCore/Events/Event.h"

/**
 * \brief Contains a list of events not directly linked to a scene.
 *
 * \ingroup PlatformDefinition
 */
class GD_API ExternalEvents
#if defined(GD_IDE_ONLY)
: public gd::ExternalEvents
#endif
{
public:
    ExternalEvents();
    ExternalEvents(const ExternalEvents&);
    virtual ~ExternalEvents() {};
    ExternalEvents& operator=(const ExternalEvents & rhs);

    /**
     * Return a pointer to a new ExternalEvents constructed from this one.
     */
    virtual ExternalEvents * Clone() const { return new ExternalEvents(*this); };

    /**
     * Get external events name
     */
    virtual const std::string & GetName() const {return name;};

    /**
     * Change external events name
     */
    virtual void SetName(const std::string & name_) {name = name_;};

    /**
     * Return a reference to the list of events associated to the ExternalEvents class.
     */
    virtual const std::vector<boost::shared_ptr<gd::BaseEvent> > & GetEvents() const { return events; }

    /**
     * Return a reference to the list of events associated to the ExternalEvents class.
     */
    virtual std::vector<boost::shared_ptr<gd::BaseEvent> > & GetEvents() { return events; }

private:

    std::string name;
    std::vector < gd::BaseEventSPtr > events; ///< List of events

    /**
     * Initialize from another ExternalEvents. Used by copy-ctor and assign-op.
     * Don't forget to update me if members were changed !
     */
    void Init(const ExternalEvents & externalEvents);
};

//"Tool" Functions

/**
 * \brief Functor testing ExternalEvents' name
 */
struct ExternalEventsHasName : public std::binary_function<boost::shared_ptr<ExternalEvents>, std::string, bool> {
    bool operator()(const boost::shared_ptr<ExternalEvents> & externalEvents, std::string name) const { return externalEvents->GetName() == name; }
};

#endif // EXTERNALEVENTS_H
#endif
