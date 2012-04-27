/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GDCORE_LAYOUT_H
#define GDCORE_LAYOUT_H
#include <string>
#include <vector>
#include <boost/shared_ptr.hpp>
#include "GDCore/PlatformDefinition/ObjectGroup.h"
class BaseEvent;
class TiXmlElement;
namespace gd { class Object; }
namespace gd { class Project; }
#undef GetObject //Disable an annoying macro

namespace gd
{

/**
 * \brief Base class used to represent a layout ( also called a scene ) of a Platform.
 */
class GD_CORE_API Layout
{
public:
    Layout() {};
    virtual ~Layout() {};

    /**
     * Must return a pointer to a copy of the layout.
     *
     * Typical implementation example:
     * \code
     * return new MyLayout(*this);
     * \endcode
     */
    virtual Layout * Clone() const =0;

    /** \name Common properties
     * Members functions related to common properties of layouts
     */
    ///@{

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

    ///@}

    /** \name Layout's events
     * Members functions related to events management.
     */
    ///@{

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

    ///@}

    /** \name Layout objects management
     * Members functions related to layout objects management.
     */
    ///@{

    /**
     * Must return true if the object called "name" exists.
     */
    virtual bool HasObjectNamed(const std::string & name) const =0;

    /**
     * Must return a reference to the object called "name".
     */
    virtual Object & GetObject(const std::string & name) =0;

    /**
     * Must return a reference to the object called "name".
     */
    virtual const Object & GetObject(const std::string & name) const =0;

    /**
     * Must return a reference to the object at position "index" in the objects list
     */
    virtual Object & GetObject(unsigned int index) =0;

    /**
     * Must return a reference to the object at position "index" in the objects list
     */
    virtual const Object & GetObject (unsigned int index) const =0;

    /**
     * Must return the position of the object called "name" in the objects list
     */
    virtual unsigned int GetObjectPosition(const std::string & name) const =0;

    /**
     * Must return the number of the object.
     */
    virtual unsigned int GetObjectsCount() const =0;

    /**
     * Must add a new empty the object sheet called "name" at the specified position in the layout list.
     */
    virtual void InsertNewObject(std::string & name, unsigned int position) =0;

    /**
     * Must add a new the object constructed from the layout passed as parameter.
     * \note No pointer or reference must be kept on the object passed as parameter.
     * \param theObject The the object that must be copied and inserted into the project
     * \param position Insertion position. Even if the position is invalid, the object must be inserted at the end of the objects list.
     */
    virtual void InsertObject(const Object & theObject, unsigned int position) =0;

    /**
     * Must delete the object named "name".
     */
    virtual void RemoveObject(const std::string & name) =0;

    /**
     * Return a reference to the vector containing the layout's objects groups.
     */
    std::vector <ObjectGroup> & GetObjectGroups() { return objectGroups; }

    /**
     * Return a const reference to the vector containing the layout's objects groups.
     */
    const std::vector <ObjectGroup> & GetObjectGroups() const { return objectGroups; }

    ///@}

    /** \name Saving and loading
     * Members functions related to saving and loading the object.
     */
    ///@{

    /**
     * This method take care of saving everything that could be accessed from the gd::Layout base class ( Layout name, default title, background color... )
     * If your gd::Layout derived class has new members to be saved, you can redefine this method to save your class specific members.
     * \note When redefining this method, do not forget to call this method by calling gd::Layout::SaveToXml(element);
     */
    virtual void SaveToXml(TiXmlElement * element) const;

    /**
     * This method take care of loading everything that could be accessed from the gd::Layout base class ( Layout name, default title, background color... )
     * If your gd::Layout derived class has new members to be loaded, you can redefine this method to load your class specific members.
     * \note When redefining this method, do not forget to call this method by calling gd::Layout::LoadFromXml(element);
     */
    virtual void LoadFromXml(const TiXmlElement * element);

    ///@}

private:
    std::vector<ObjectGroup> objectGroups; ///< Objects groups
};

/**
 * \brief Get a type from an object/group name.
 * \note If a group contains only objects of a same type, then the group has this type. Otherwise, it is considered as an object without any specific type.
 *
 * @return Type of the object/group.
 */
std::string GD_CORE_API GetTypeOfObject(const Project & game, const Layout & scene, std::string objectName, bool searchInGroups = true);

/**
 * \brief Get a type from an automatism name
 * @return Type of the automatism.
 */
std::string GD_CORE_API GetTypeOfAutomatism(const Project & game, const Layout & scene, std::string automatismName, bool searchInGroups = true);

/**
 * \brief Get automatisms of an object/group
 * \note The automatisms of a group are the automatisms which are found in common when looking all the objects of the group.
 *
 * @return Vector containing names of automatisms
 */
std::vector < std::string > GD_CORE_API GetAutomatismsOfObject(const Project & game, const Layout & scene, std::string objectName, bool searchInGroups = true);

}

#endif // GDCORE_LAYOUT_H
