/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GDCORE_EXTERNALEVENTS_H
#define GDCORE_EXTERNALEVENTS_H
#include <vector>
#include <string>
#include <boost/shared_ptr.hpp>
namespace gd { class BaseEvent; }
namespace gd { class Project; }
class TiXmlElement;

namespace gd
{

/**
 * \brief Contains a list of events not directly linked to a layout.
 *
 * \ingroup PlatformDefinition
 */
class ExternalEvents
{
public:
    ExternalEvents();
    ExternalEvents(const ExternalEvents&);
    virtual ~ExternalEvents() {};
    ExternalEvents& operator=(const ExternalEvents & rhs);

    /**
     * Must return a pointer to a copy of the layout.
     *
     * \note A such method is useful when the IDE must store a copy of a ExternalEvents derived class ( e.g. for Clipboard ) so as to avoid slicing
     *
     * Typical implementation example:
     * \code
     * return new MyExternalEventsClass(*this);
     * \endcode
     */
    virtual ExternalEvents * Clone() const { return new ExternalEvents(*this); };

    /**
     * \brief Get external events name
     */
    virtual const std::string & GetName() const {return name;};

    /**
     * \brief Change external events name
     */
    virtual void SetName(const std::string & name_) {name = name_;};

    /**
     * \brief Get the layout associated with external events.
     *
     * This is used in the IDE to remember the layout used to edit the external events.
     */
    virtual const std::string & GetAssociatedLayout() const {return associatedScene;};

    /**
     * \brief Set the layout associated with external events.
     */
    virtual void SetAssociatedLayout(const std::string & name_) {associatedScene = name_;};

    /**
     * Get the latest time of the build.
     * Used when the IDE found that the external events can be compiled separately from scene's events.
     *
     * \todo This is specific to GD C++ Platform
     */
    time_t GetLastChangeTimeStamp() const { return lastChangeTimeStamp; };

    /**
     * Change the latest time of the build of the external events.
     *
     * \todo This is specific to GD C++ Platform
     */
    void SetLastChangeTimeStamp(time_t newTimeStamp) { lastChangeTimeStamp = newTimeStamp; };

    /**
     * \brief Get the events.
     */
    virtual const std::vector<boost::shared_ptr<gd::BaseEvent> > & GetEvents() const { return events; }

    /**
     * \brief Get the events.
     */
    virtual std::vector<boost::shared_ptr<gd::BaseEvent> > & GetEvents() { return events; }

    /**
     * \brief Load the object from xml
     */
    virtual void LoadFromXml(gd::Project & project, const TiXmlElement * element);

    /**
     * \brief Save the object to xml
     */
    virtual void SaveToXml(TiXmlElement * element) const;

private:

    std::string name;
    std::string associatedScene;
    time_t lastChangeTimeStamp; ///< Time of the last build
    std::vector < boost::shared_ptr<BaseEvent> > events; ///< List of events

    /**
     * Initialize from another ExternalEvents. Used by copy-ctor and assign-op.
     * Don't forget to update me if members were changed !
     */
    void Init(const ExternalEvents & externalEvents);
};

/**
 * \brief Functor testing ExternalEvents' name
 */
struct ExternalEventsHasName : public std::binary_function<boost::shared_ptr<gd::ExternalEvents>, std::string, bool> {
    bool operator()(const boost::shared_ptr<gd::ExternalEvents> & externalEvents, std::string name) const { return externalEvents->GetName() == name; }
};

}

#endif // GDCORE_EXTERNALEVENTS_H
