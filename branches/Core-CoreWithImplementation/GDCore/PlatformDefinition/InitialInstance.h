/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GDCORE_INITIALINSTANCE_H
#define GDCORE_INITIALINSTANCE_H
#include <string>
#include <map>
#include "GDCore/PlatformDefinition/VariablesContainer.h"
namespace gd { class Project; }
namespace gd { class Layout; }
class wxPropertyGrid;
class wxPropertyGridEvent;

namespace gd
{

/**
 * \brief Describe an instance of an object to be created on a layout start up
 */
class GD_CORE_API InitialInstance
{
public:
    InitialInstance();
    virtual ~InitialInstance() {};

    /**
     * Must return a pointer to a copy of the object. A such method is needed to do polymorphic copies.
     * Just redefine this method in your derived object class like this:
     * \code
     * return new MyInitialInstanceClass(*this);
     * \endcode
     */
    virtual InitialInstance * Clone() const { return new InitialInstance(*this); }

    /** \name Common properties
     * Members functions related to common properties
     */
    ///@{

    virtual const std::string & GetObjectName() const { return objectName; }
    virtual void SetObjectName(const std::string & name) { objectName = name; }

    virtual float GetX() const {return x;}
    virtual void SetX(float x_) { x = x_; }

    virtual float GetY() const {return y;}
    virtual void SetY(float y_) { y = y_; }

    virtual float GetAngle() const {return angle;}
    virtual void SetAngle(float angle_) {angle = angle_;}

    virtual int GetZOrder() const  {return zOrder;}
    virtual void SetZOrder(int zOrder_) {zOrder = zOrder_;}

    virtual const std::string & GetLayer() const {return layer;}
    virtual void SetLayer(const std::string & layer_) {layer = layer_;}

    virtual bool HasCustomSize() const { return personalizedSize; }
    virtual void SetHasCustomSize(bool hasCustomSize_ ) { personalizedSize = hasCustomSize_; }

    virtual float GetCustomWidth() const { return width; }
    virtual void SetCustomWidth(float width_) { width = width_; }

    virtual float GetCustomHeight() const { return height; }
    virtual void SetCustomHeight(float height_) { height = height_; }

    #if defined(GD_IDE_ONLY)
    /**
     * Must return true if the instance is locked and cannot be selected by clicking on it.
     */
    virtual bool IsLocked() const { return locked; };

    /**
     * Must (un)lock the initial instance.
     *
     * An instance which is locked cannot be selected by clicking on it in a layout editor canvas.
     */
    virtual void SetLocked(bool enable = true) { locked = enable; }
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
    virtual const gd::VariablesContainer & GetVariables() const { return initialVariables; }

    /**
     * Must return a reference to the container storing the instance variables
     * \see gd::VariablesContainer
     */
    virtual gd::VariablesContainer & GetVariables() { return initialVariables; }
    ///@}

    #if defined(GD_IDE_ONLY)
    /** \name Others properties management
     * Members functions related to exposing others properties of the instance.
     *
     * \note Extensions writers: Even if we can define new types of object by inheriting from Object class,
     * we cannot define new gd::InitialInstance classes. However, objects can store custom
     * properties for their associated initial instances : These properties can be stored
     * into floatInfos and stringInfos. When the IDE want to get the custom properties, it
     * will call GetProperties and UpdateProperty methods ( see GDCore documentation ). These
     * methods are here overloaded to forward the call to the Object associated to the gd::InitialInstance.
     * ( By looking at the value returned by GetObjectName() ).
     *
     * \see Object
     */
    ///@{
    /**
     * Must return a map containing the properties names (as keys) and their values.
     * \note Common properties do not need to be inserted in this map
     */
    virtual std::map<std::string, std::string> GetCustomProperties(gd::Project & project, gd::Layout & layout);

    /**
     * Must update the property called \a name with the new \a value.
     *
     * \return false if the property could not be updated.
     */
    virtual bool UpdateCustomProperty(const std::string & name, const std::string & value, gd::Project & project, gd::Layout & layout);
    ///@}
    #endif

    //TODO : Refactor this:
    std::map < std::string, float > floatInfos; ///< More data which can be used by the object
    std::map < std::string, std::string > stringInfos; ///< More data which can be used by the object

private:

    std::string objectName; ///< Object name
    float x; ///< Object initial X position
    float y; ///< Object initial Y position
    float angle; ///< Object initial angle
    int zOrder; ///< Object initial Z order
    std::string layer; ///< Object initial layer
    bool personalizedSize; ///< True if object has a custom size
    float width;  ///< Object custom width
    float height; ///< Object custom height
    gd::VariablesContainer initialVariables; ///< Instance specific variables
    bool locked; ///< True if the instance is locked

    //In our implementation, more properties can be stored in floatInfos and stringInfos.
    //These properties are then managed by the Object class.
};

}

#endif // GDCORE_INITIALINSTANCE_H
