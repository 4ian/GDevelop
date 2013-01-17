/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef POSITION_H
#define POSITION_H

#include <string>
#include <map>
#include "GDL/VariableList.h"
#if defined(GD_IDE_ONLY)
#include "GDCore/PlatformDefinition/InitialInstance.h"
#endif

/**
 * \brief Represents an object on a scene at startup.
 *
 * Class used so as to represent objects at their initial states on the scene.
 * During loading of a scene, "real" objects are created from the initial positions.
 *
 * \ingroup GameEngine
 */
class GD_API InitialPosition
#if defined(GD_IDE_ONLY)
: public gd::InitialInstance
#endif
{
public:
    InitialPosition();
    virtual ~InitialPosition() {};

    virtual InitialPosition * Clone() const { return new InitialPosition(*this);}

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
    virtual bool IsLocked() const { return locked; };
    virtual void SetLocked(bool enable = true) { locked = enable; }
    #endif

    ///@}

    /** \name Variable management
     * Members functions related to initial instance variables management.
     */
    ///@{

    /**
     * Must return a reference to the container storing the instance variables
     * \see ListVariable
     */
    virtual const ListVariable & GetVariables() const { return initialVariables; }

    /**
     * Must return a reference to the container storing the instance variables
     * \see ListVariable
     */
    virtual ListVariable & GetVariables() { return initialVariables; }
    ///@}

    /** \name Others properties management
     * Members functions related to exposing others properties of the instance.
     *
     * \note Extensions writers: Even if we can define new types of object by inheriting from Object class,
     * we cannot define new InitialPosition classes. However, objects can store custom
     * properties for their associated initial instances : These properties can be stored
     * into floatInfos and stringInfos. When the IDE want to get the custom properties, it
     * will call GetProperties and UpdateProperty methods ( see GDCore documentation ). These
     * methods are here overloaded to forward the call to the Object associated to the InitialPosition.
     * ( By looking at the value returned by GetObjectName() ).
     *
     * \see Object
     */
    ///@{

    #if defined(GD_IDE_ONLY)
    virtual std::map<std::string, std::string> GetCustomProperties(gd::Project & project, gd::Layout & layout);
    virtual bool UpdateCustomProperty(const std::string & name, const std::string & value, gd::Project & project, gd::Layout & layout);
    #endif

    std::map < std::string, float > floatInfos; ///< More data which can be used by the object
    std::map < std::string, std::string > stringInfos; ///< More data which can be used by the object
    ///@}

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
    ListVariable initialVariables; ///< Instance specific variables
    bool locked; ///< True if the instance is locked

    //In our implementation, more properties can be stored in floatInfos and stringInfos.
    //These properties are then managed by the Object class.
};

#endif // POSITION_H

