/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GDCORE_LAYOUT_H
#define GDCORE_LAYOUT_H
#include <string>
#include <vector>
#include <boost/shared_ptr.hpp>
class BaseEvent;
class TiXmlElement;

namespace gd
{

/**
 * \brief Base class used to represent a layout ( also called a scene ) of a Platform.
 */
class GD_CORE_API Layout
{
public:
    Layout();
    virtual ~Layout();

    /**
     * Must return a pointer to a copy of the layout.
     *
     * Typical implementation example:
     * \code
     * return new MyLayout(*this);
     * \endcode
     */
    virtual Layout * Clone() const =0;

    /**
     * Must change the name of the layout with the name passed as parameter.
     */
    virtual void SetName(const std::string & name) =0;

    /**
     * Must return the name of the layout.
     */
    virtual const std::string & GetName() const =0;

    /**
     * Set the background color
     */
    virtual void SetBackgroundColor(unsigned int r, unsigned int g, unsigned int b) =0;

    /**
     * Get the background color red component
     */
    virtual unsigned int GetBackgroundColorRed() const =0;

    /**
     * Get the background color green component
     */
    virtual unsigned int GetBackgroundColorGreen() const =0;

    /**
     * Get the background color blue component
     */
    virtual unsigned int GetBackgroundColorBlue() const =0;

    virtual const std::string & GetWindowDefaultTitle() const =0;
    virtual void SetWindowDefaultTitle(const std::string & title_) =0;

    /**
     * Must return a reference to the list of events associated to the Layout class.
     */
    virtual const std::vector<boost::shared_ptr<BaseEvent> > & GetEvents() const =0;

    /**
     * Must return a reference to the list of events associated to the Layout class.
     */
    virtual std::vector<boost::shared_ptr<BaseEvent> > & GetEvents() =0;

    /**
     * Called by the IDE when events have been changed.
     */
    virtual void OnEventsModified() {};

    /**
     * Redefine this method so as to save everything related to the scene.
     */
    virtual void SaveToXml(TiXmlElement * eventElem) const {} //TODO

    /**
     * Redefine this method so as to load everything related to the scene.
     */
    virtual void LoadFromXml(const TiXmlElement * eventElem) {}

private:
};

}

#endif // GDCORE_LAYOUT_H
