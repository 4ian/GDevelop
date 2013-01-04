/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GDCORE_LAYOUT_H
#define GDCORE_LAYOUT_H
#include <string>
#include <vector>
#include <boost/shared_ptr.hpp>
class TiXmlElement;
#include "GDCore/PlatformDefinition/ObjectGroup.h"
#include "GDCore/PlatformDefinition/ClassWithObjects.h"
namespace gd { class BaseEvent; }
namespace gd { class Object; }
namespace gd { class Project; }
namespace gd { class VariablesContainer; }
namespace gd { class InitialInstancesContainer; }
namespace gd { class Layer; }
#undef GetObject //Disable an annoying macro

namespace gd
{

/**
 * \brief Base class used to represent a layout ( also called a scene ) of a Platform.
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API Layout : public ClassWithObjects
{
public:
    Layout() {};
    virtual ~Layout() {};

    /**
     * Must return a pointer to a copy of the layout.
     * A such method is needed as the IDE may want to store copies of some layouts and so need a way to do polymorphic copies.
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

    /** \name Layout's initial instances
     * Members functions related to initial instances of objects created at the layout start up
     */
    ///@{

    /**
     * Must return the container storing initial instances.
     */
    virtual const InitialInstancesContainer & GetInitialInstances() const =0;

    /**
     * Must return the container storing initial instances.
     */
    virtual InitialInstancesContainer & GetInitialInstances() =0;

    ///@}

    /** \name Layout's events
     * Members functions related to events management.
     */
    ///@{

    /**
     * Must return a reference to the list of events associated to the Layout class.
     */
    virtual const std::vector<boost::shared_ptr<gd::BaseEvent> > & GetEvents() const =0;

    /**
     * Must return a reference to the list of events associated to the Layout class.
     */
    virtual std::vector<boost::shared_ptr<gd::BaseEvent> > & GetEvents() =0;

    /**
     * Called by the IDE when events have been changed.
     */
    virtual void OnEventsModified() {};

    ///@}

    /** \name Layout objects groups management
     * Members functions related to layout objects groups management.
     */
    ///@{

    /**
     * Return a reference to the vector containing the layout's objects groups.
     */
    std::vector <ObjectGroup> & GetObjectGroups() { return objectGroups; }

    /**
     * Return a const reference to the vector containing the layout's objects groups.
     */
    const std::vector <ObjectGroup> & GetObjectGroups() const { return objectGroups; }

    ///@}

    /** \name Variable management
     * Members functions related to layout variables management.
     */
    ///@{

    /**
     * Must return a reference to the container storing the layout variables
     * \see gd::VariablesContainer
     */
    virtual const gd::VariablesContainer & GetVariables() const =0;

    /**
     * Must return a reference to the container storing the layout variables
     * \see gd::VariablesContainer
     */
    virtual gd::VariablesContainer & GetVariables() =0;
    ///@}

    /** \name Layout layers management
     * Members functions related to layout layers management.
     */
    ///@{

    /**
     * Must return true if the layer called "name" exists.
     */
    virtual bool HasLayerNamed(const std::string & name) const =0;

    /**
     * Must return a reference to the layer called "name".
     */
    virtual Layer & GetLayer(const std::string & name) =0;

    /**
     * Must return a reference to the layer called "name".
     */
    virtual const Layer & GetLayer(const std::string & name) const =0;

    /**
     * Must return a reference to the layer at position "index" in the layers list
     */
    virtual Layer & GetLayer(unsigned int index) =0;

    /**
     * Must return a reference to the layer at position "index" in the layers list
     */
    virtual const Layer & GetLayer (unsigned int index) const =0;

    /**
     * Must return the position of the layer called "name" in the layers list
     */
    virtual unsigned int GetLayerPosition(const std::string & name) const =0;

    /**
     * Must return the number of layers.
     */
    virtual unsigned int GetLayersCount() const =0;

    /**
     * Must add a new empty the layer sheet called "name" at the specified position in the layout list.
     */
    virtual void InsertNewLayer(const std::string & name, unsigned int position) =0;

    /**
     * Must add a new the layer constructed from the layout passed as parameter.
     * \note No pointer or reference must be kept on the layer passed as parameter.
     * \param theLayer The the layer that must be copied and inserted into the project
     * \param position Insertion position. Even if the position is invalid, the layer must be inserted at the end of the layers list.
     */
    virtual void InsertLayer(const Layer & theLayer, unsigned int position) =0;

    /**
     * Must delete the layer named "name".
     */
    virtual void RemoveLayer(const std::string & name) =0;

    /**
     * Must swap the position of the specified layers.
     */
    virtual void SwapLayers(unsigned int firstLayerIndex, unsigned int secondLayerIndex) =0;
    ///@}

    /** \name Saving and loading
     * Members functions related to saving and loading the object.
     */
    ///@{

    /**
     * Called to save the layout to a TiXmlElement.
     */
    virtual void SaveToXml(TiXmlElement * element) const;

    /**
     * Called to load the layout from a TiXmlElement.
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
