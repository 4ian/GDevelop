/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GDCORE_LAYOUT_H
#define GDCORE_LAYOUT_H
#include <string>
#include <vector>
#include <map>
#include <boost/shared_ptr.hpp>
#include "GDCore/PlatformDefinition/ObjectGroup.h"
#include "GDCore/PlatformDefinition/ClassWithObjects.h"
#include "GDCore/PlatformDefinition/AutomatismsSharedData.h"
#include "GDCore/PlatformDefinition/VariablesContainer.h"
#include "GDCore/PlatformDefinition/InitialInstancesContainer.h"
#include "GDCore/PlatformDefinition/Layer.h"
#if defined(GD_IDE_ONLY)
#include "GDCore/IDE/Dialogs/LayoutEditorCanvasOptions.h"
namespace gd { class BaseEvent; }
namespace gd { typedef boost::shared_ptr<BaseEvent> BaseEventSPtr; }
#endif
namespace gd { class BaseEvent; }
namespace gd { class Object; }
namespace gd { class Project; }
namespace gd { class InitialInstancesContainer; }
class TiXmlElement;
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
    Layout();
    Layout(const Layout&);
    virtual ~Layout();
    Layout& operator=(const Layout & rhs);

    /**
     * Must return a pointer to a copy of the layout.
     * A such method is needed as the IDE may want to store copies of some layouts and so need a way to do polymorphic copies.
     *
     * Typical implementation example:
     * \code
     * return new MyLayout(*this);
     * \endcode
     */
    virtual Layout * Clone() const { return new Layout(*this); };

    /** \name Common properties
     * Members functions related to common properties of layouts
     */
    ///@{

    /**
     * Change the name of the layout with the name passed as parameter.
     */
    virtual void SetName(const std::string & name_) {name = name_;};

    /**
     * Return the name of the layout.
     */
    virtual const std::string & GetName() const {return name;};

    /**
     * Set the background color
     */
    virtual void SetBackgroundColor(unsigned int r, unsigned int g, unsigned int b) { backgroundColorR = r; backgroundColorG = g; backgroundColorB = b; }

    /**
     * Get the background color red component
     */
    virtual unsigned int GetBackgroundColorRed() const { return backgroundColorR; }

    /**
     * Get the background color green component
     */
    virtual unsigned int GetBackgroundColorGreen() const { return backgroundColorG; }

    /**
     * Get the background color blue component
     */
    virtual unsigned int GetBackgroundColorBlue() const { return backgroundColorB; }

    /**
     * Get scene window default title
     */
    virtual const std::string & GetWindowDefaultTitle() const {return title;};

    /**
     * Set scene window default title
     */
    virtual void SetWindowDefaultTitle(const std::string & title_) {title = title_;};

    ///@}

    /** \name Layout's initial instances
     * Members functions related to initial instances of objects created at the layout start up
     */
    ///@{
    /**
     * Return the container storing initial instances.
     */
    virtual const gd::InitialInstancesContainer & GetInitialInstances() const { return initialInstances; }

    /**
     * Return the container storing initial instances.
     */
    virtual gd::InitialInstancesContainer & GetInitialInstances() { return initialInstances; }
    ///@}

    /** \name Layout's events
     * Members functions related to events management.
     */
    ///@{

    /**
     * Get the events of the layout
     */
    virtual const std::vector<boost::shared_ptr<gd::BaseEvent> > & GetEvents() const { return events; }

    /**
     * Get the events of the layout
     */
    virtual std::vector<boost::shared_ptr<gd::BaseEvent> > & GetEvents() { return events; }

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
     * Provide access to the gd::VariablesContainer member containing the layout variables
     * \see gd::VariablesContainer
     */
    inline const gd::VariablesContainer & GetVariables() const { return variables; }

    /**
     * Provide access to the gd::VariablesContainer member containing the layout variables
     * \see gd::VariablesContainer
     */
    inline gd::VariablesContainer & GetVariables() { return variables; }

    ///@}

    /** \name Layout layers management
     * Members functions related to layout layers management.
     */
    ///@{

    /**
     * Must return true if the layer called "name" exists.
     */
    virtual bool HasLayerNamed(const std::string & name) const;

    /**
     * Must return a reference to the layer called "name".
     */
    virtual Layer & GetLayer(const std::string & name);

    /**
     * Must return a reference to the layer called "name".
     */
    virtual const Layer & GetLayer(const std::string & name) const;

    /**
     * Must return a reference to the layer at position "index" in the layers list
     */
    virtual Layer & GetLayer(unsigned int index);

    /**
     * Must return a reference to the layer at position "index" in the layers list
     */
    virtual const Layer & GetLayer (unsigned int index) const;

    /**
     * Must return the position of the layer called "name" in the layers list
     */
    virtual unsigned int GetLayerPosition(const std::string & name) const;

    /**
     * Must return the number of layers.
     */
    virtual unsigned int GetLayersCount() const;

    /**
     * Must add a new empty the layer sheet called "name" at the specified position in the layout list.
     */
    virtual void InsertNewLayer(const std::string & name, unsigned int position);

    /**
     * Must add a new the layer constructed from the layout passed as parameter.
     * \note No pointer or reference must be kept on the layer passed as parameter.
     * \param theLayer The the layer that must be copied and inserted into the project
     * \param position Insertion position. Even if the position is invalid, the layer must be inserted at the end of the layers list.
     */
    virtual void InsertLayer(const Layer & theLayer, unsigned int position);

    /**
     * Must delete the layer named "name".
     */
    virtual void RemoveLayer(const std::string & name);

    /**
     * Must swap the position of the specified layers.
     */
    virtual void SwapLayers(unsigned int firstLayerIndex, unsigned int secondLayerIndex);
    ///@}

    /**
     * Make sure that the scene had an instance of shared data for
     * every automatism of every object that can be used on the scene
     * ( i.e. the objects of the scene and the global objects )
     *
     * Must be called when an automatism have been added/deleted
     * or when a scene have been added to a project.
     */
    void UpdateAutomatismsSharedData(gd::Project & project);

    /**
     * Return the settings associated to the layout.
     * \see gd::LayoutEditorCanvasOptions
     */
    const gd::LayoutEditorCanvasOptions & GetAssociatedLayoutEditorCanvasOptions() const { return associatedSettings; }

    /**
     * Return the settings associated to the layout.
     * \see gd::LayoutEditorCanvasOptions
     */
    gd::LayoutEditorCanvasOptions & GetAssociatedLayoutEditorCanvasOptions() { return associatedSettings; }


    /** \name Other properties
     */
    ///@{
    /**
     * Set if the input must be disabled when window lost focus.
     */
    void DisableInputWhenFocusIsLost(bool disable = true) { disableInputWhenNotFocused = disable; }

    /**
     * Return true if the input must be disabled when window lost focus.
     */
    bool IsInputDisabledWhenFocusIsLost() { return disableInputWhenNotFocused; }

    /**
     * Set if the objects z-order are sorted using the standard method
     */
    void SetStandardSortMethod(bool enable = true) { standardSortMethod = enable; }

    /**
     * Return true if the objects z-order are sorted using the standard method
     */
    bool StandardSortMethod() const { return standardSortMethod; }

    /**
     * Set if the scene must stop all the sounds being played when it is launched.
     */
    void SetStopSoundsOnStartup(bool enable = true) { stopSoundsOnStartup = enable; }

    /**
     * Return true if the scene must stop all the sounds being played when it is launched
     */
    bool StopSoundsOnStartup() const { return stopSoundsOnStartup; }

    /**
     * Set OpenGL default field of view
     */
    void SetOpenGLFOV(float oglFOV_) { oglFOV = oglFOV_; }

    /**
     * Get OpenGL default field of view
     */
    float GetOpenGLFOV() const { return oglFOV; }

    /**
     * Set OpenGL near clipping plan
     */
    void SetOpenGLZNear(float oglZNear_) { oglZNear = oglZNear_; }

    /**
     * Get OpenGL near clipping plan
     */
    float GetOpenGLZNear() const { return oglZNear; }

    /**
     * Set OpenGL far clipping plan
     */
    void SetOpenGLZFar(float oglZFar_) { oglZFar = oglZFar_; }

    /**
     * Get OpenGL far clipping plan
     */
    float GetOpenGLZFar() const { return oglZFar; }
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
    virtual void LoadFromXml(gd::Project & project, const TiXmlElement * element);
    ///@}

    //TODO: Send this to private part.
    std::map < std::string, boost::shared_ptr<gd::AutomatismsSharedData> > automatismsInitialSharedDatas; ///< Initial shared datas of automatisms

private:
    std::string                                 name; ///< Scene name
    unsigned int                                backgroundColorR; ///< Background color Red component
    unsigned int                                backgroundColorG; ///< Background color Green component
    unsigned int                                backgroundColorB; ///< Background color Blue component
    std::string                                 title; ///< Title displayed in the window
    gd::VariablesContainer                      variables; ///< Variables list
    gd::InitialInstancesContainer               initialInstances; ///< Initial instances
    std::vector < gd::Layer >                   initialLayers; ///< Initial layers
    std::vector<ObjectGroup>                    objectGroups; ///< Objects groups
    bool                                        stopSoundsOnStartup; ///< True to make the scene stop all sounds at startup.
    bool                                        standardSortMethod; ///< True to sort objects using standard sort.
    float                                       oglFOV; ///< OpenGL Field Of View value
    float                                       oglZNear; ///< OpenGL Near Z position
    float                                       oglZFar; ///< OpenGL Far Z position
    bool                                        disableInputWhenNotFocused; /// If set to true, the input must be disabled when the window do not have the focus.
    static gd::Layer                            badLayer; ///< Null object, returned when GetLayer can not find an appropriate layer.
    #if defined(GD_IDE_ONLY)
    std::vector < gd::BaseEventSPtr >           events; ///< Scene events
    gd::LayoutEditorCanvasOptions               associatedSettings;
    #endif

    /**
     * Initialize from another layout. Used by copy-ctor and assign-op.
     * Don't forget to update me if members were changed !
     */
    void Init(const gd::Layout & other);
};

/**
 * \brief Functor testing layout name.
 * \see gd::Layout
 */
struct LayoutHasName : public std::binary_function<boost::shared_ptr<Layout>, std::string, bool> {
    bool operator()(const boost::shared_ptr<Layout> & layout, std::string name) const { return layout->GetName() == name; }
};

/**
 * \brief Get a type from an object/group name.
 * \note If a group contains only objects of a same type, then the group has this type. Otherwise, it is considered as an object without any specific type.
 *
 * @return Type of the object/group.
 */
std::string GD_CORE_API GetTypeOfObject(const Project & game, const Layout & layout, std::string objectName, bool searchInGroups = true);

/**
 * \brief Get a type from an automatism name
 * @return Type of the automatism.
 */
std::string GD_CORE_API GetTypeOfAutomatism(const Project & game, const Layout & layout, std::string automatismName, bool searchInGroups = true);

/**
 * \brief Get automatisms of an object/group
 * \note The automatisms of a group are the automatisms which are found in common when looking all the objects of the group.
 *
 * @return Vector containing names of automatisms
 */
std::vector < std::string > GD_CORE_API GetAutomatismsOfObject(const Project & game, const Layout & layout, std::string objectName, bool searchInGroups = true);

}

#endif // GDCORE_LAYOUT_H
