/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef EXTERNALEVENTS_H
#define EXTERNALEVENTS_H
#include <string>
#include <vector>
#include "GDCore/PlatformDefinition/ExternalEvents.h"
#include "GDCore/Events/Event.h"
class TiXmlElement;

/**
 * \brief Contains a list of events not directly linked to a scene.
 *
 * \ingroup PlatformDefinition
 */
class GD_API ExternalEvents : public gd::ExternalEvents
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
     * Get the scene associated with external events.
     */
    virtual const std::string & GetAssociatedScene() const {return associatedScene;};

    /**
     * Set the scene associated with external events.
     */
    virtual void SetAssociatedScene(const std::string & name_) {associatedScene = name_;};

    /**
     * Get the latest time of the build.
     * Used when the IDE found that the external events can be compiled separately from scene's events.
     */
    time_t GetLastChangeTimeStamp() const { return lastChangeTimeStamp; };

    /**
     * Change the latest time of the build of the external events.
     */
    void SetLastChangeTimeStamp(time_t newTimeStamp) { lastChangeTimeStamp = newTimeStamp; };

    /**
     * Return a reference to the list of events associated to the ExternalEvents class.
     */
    virtual const std::vector<boost::shared_ptr<gd::BaseEvent> > & GetEvents() const { return events; }

    /**
     * Return a reference to the list of events associated to the ExternalEvents class.
     */
    virtual std::vector<boost::shared_ptr<gd::BaseEvent> > & GetEvents() { return events; }

    virtual void LoadFromXml(const TiXmlElement * element);
    virtual void SaveToXml(TiXmlElement * element) const;

private:

    std::string name;
    std::string associatedScene;
    time_t lastChangeTimeStamp; ///< Time of the last build
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

