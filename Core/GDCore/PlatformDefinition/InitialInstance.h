/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#ifndef GDCORE_INITIALINSTANCE_H
#define GDCORE_INITIALINSTANCE_H
#include "GDCore/String.h"
#include <map>
#include "GDCore/PlatformDefinition/VariablesContainer.h"
namespace gd { class PropertyDescriptor; }
namespace gd { class Project; }
namespace gd { class Layout; }
class wxPropertyGrid;
class wxPropertyGridEvent;

namespace gd
{

/**
 * \brief Represents an instance of an object to be created on a layout start up.
 */
class GD_CORE_API InitialInstance
{
public:
    /**
     * \brief Create an initial instance pointing to no object, at position (0,0).
     */
    InitialInstance();
    virtual ~InitialInstance() {};

    /**
     * Must return a pointer to a copy of the object. A such method is needed to do polymorphic copies.
     * Just redefine this method in your derived object class like this:
     * \code
     * return new MyInitialInstanceClass(*this);
     * \endcode
     */
    InitialInstance * Clone() const { return new InitialInstance(*this); }

    /** \name Common properties
     * Members functions related to common properties
     */
    ///@{

    /**
     * \brief Get the name of object instantiated on the layout.
     */
    const gd::String & GetObjectName() const { return objectName; }

    /**
     * \brief Set the name of object instantiated on the layout.
     */
    void SetObjectName(const gd::String & name) { objectName = name; }

    /**
     * \brief Get the X position of the instance
     */
    float GetX() const {return x;}

    /**
     * \brief Set the X position of the instance
     */
    void SetX(float x_) { x = x_; }

    /**
     * \brief Get the Y position of the instance
     */
    float GetY() const {return y;}

    /**
     * \brief Set the Y position of the instance
     */
    void SetY(float y_) { y = y_; }

    /**
     * \brief Get the rotation of the instance, in radians.
     */
    float GetAngle() const {return angle;}

    /**
     * \brief Set the rotation of the instance, in radians.
     */
    void SetAngle(float angle_) {angle = angle_;}

    /**
     * \brief Get the Z order of the instance.
     */
    int GetZOrder() const  {return zOrder;}

    /**
     * \brief Set the Z order of the instance.
     */
    void SetZOrder(int zOrder_) {zOrder = zOrder_;}

    /**
     * \brief Get the layer the instance belongs to.
     */
    const gd::String & GetLayer() const {return layer;}

    /**
     * \brief Set the layer the instance belongs to.
     */
    void SetLayer(const gd::String & layer_) {layer = layer_;}

    /**
     * \brief Return true if the instance has a size which is different from its object default size.
     *
     * \see gd::Object
     */
    bool HasCustomSize() const { return personalizedSize; }

    /**
     * \brief Set whether the instance has a size which is different from its object default size or not.
     *
     * \param hasCustomSize true if the size is different from the object's default size.
     * \see gd::Object
     */
    void SetHasCustomSize(bool hasCustomSize_ ) { personalizedSize = hasCustomSize_; }

    float GetCustomWidth() const { return width; }
    void SetCustomWidth(float width_) { width = width_; }

    float GetCustomHeight() const { return height; }
    void SetCustomHeight(float height_) { height = height_; }

    #if defined(GD_IDE_ONLY)
    /**
     * \brief Return true if the instance is locked and cannot be selected by clicking on it in the IDE.
     */
    bool IsLocked() const { return locked; };

    /**
     * \brief (Un)lock the initial instance.
     *
     * An instance which is locked cannot be selected by clicking on it in a layout editor canvas.
     */
    void SetLocked(bool enable = true) { locked = enable; }
    #endif

    ///@}

    /** \name Variable management
     * Members functions related to initial instance variables management.
     */
    ///@{

    /**
     * Must return a reference to the container storing the instance variables
     * \see gd::VariablesContainer
     */
    const gd::VariablesContainer & GetVariables() const { return initialVariables; }

    /**
     * Must return a reference to the container storing the instance variables
     * \see gd::VariablesContainer
     */
    gd::VariablesContainer & GetVariables() { return initialVariables; }
    ///@}

    #if defined(GD_IDE_ONLY)
    /** \name Others properties management
     * Members functions related to exposing others properties of the instance.
     *
     * \note Extensions writers: Even if we can define new types of object by inheriting from gd::Object class,
     * we cannot define new gd::InitialInstance classes. However, objects can store custom
     * properties for their associated initial instances : These properties can be stored
     * into floatInfos and stringInfos members. When the IDE want to get the custom properties, it
     * will call GetProperties and UpdateProperty methods. These
     * methods are here defined to forward the call to the gd::Object associated to the gd::InitialInstance.
     * ( By looking at the value returned by GetObjectName() ).
     *
     * \see gd::Object
     */
    ///@{
    /**
     * \brief Return a map containing the properties names (as keys) and their values.
     * \note Common properties ( name, position... ) do not need to be inserted in this map
     */
    std::map<gd::String, gd::PropertyDescriptor> GetCustomProperties(gd::Project & project, gd::Layout & layout);

    /**
     * \brief Update the property called \a name with the new \a value.
     *
     * \return false if the property could not be updated.
     */
    bool UpdateCustomProperty(const gd::String & name, const gd::String & value, gd::Project & project, gd::Layout & layout);
    ///@}
    #endif

    //In our implementation, more properties can be stored in floatInfos and stringInfos.
    //These properties are then managed by the Object class.
    std::map < gd::String, float > floatInfos; ///< More data which can be used by the object
    std::map < gd::String, gd::String > stringInfos; ///< More data which can be used by the object
private:

    gd::String objectName; ///< Object name
    float x; ///< Object initial X position
    float y; ///< Object initial Y position
    float angle; ///< Object initial angle
    int zOrder; ///< Object initial Z order
    gd::String layer; ///< Object initial layer
    bool personalizedSize; ///< True if object has a custom size
    float width;  ///< Object custom width
    float height; ///< Object custom height
    gd::VariablesContainer initialVariables; ///< Instance specific variables
    bool locked; ///< True if the instance is locked
};

}

#endif // GDCORE_INITIALINSTANCE_H
