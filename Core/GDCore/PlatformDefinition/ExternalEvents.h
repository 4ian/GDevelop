/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GDCORE_EXTERNALEVENTS_H
#define GDCORE_EXTERNALEVENTS_H
#include <vector>
#include <string>
#include <boost/shared_ptr.hpp>
namespace gd { class BaseEvent; }

namespace gd
{

/**
 * \brief Contains a list of events not directly linked to a layout.
 */
class ExternalEvents
{
public:
    ExternalEvents() {};
    virtual ~ExternalEvents() {};

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
    virtual ExternalEvents * Clone() const =0;

    /**
     * Must return the name of the external events sheet.
     */
    virtual const std::string & GetName() const = 0;

    /**
     * Must change the name of the external events sheet.
     */
    virtual void SetName(const std::string & name_) = 0;

    /**
     * Must return a reference to the list of events associated to the ExternalEvents class.
     */
    virtual const std::vector<boost::shared_ptr<gd::BaseEvent> > & GetEvents() const =0;

    /**
     * Must return a reference to the list of events associated to the ExternalEvents class.
     */
    virtual std::vector<boost::shared_ptr<gd::BaseEvent> > & GetEvents() =0;

private:
};

}

#endif // GDCORE_EXTERNALEVENTS_H
