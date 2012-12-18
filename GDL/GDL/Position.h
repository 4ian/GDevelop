/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
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
    ListVariable initialVariables;
};

#endif // POSITION_H

