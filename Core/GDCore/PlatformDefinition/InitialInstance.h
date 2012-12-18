/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GDCORE_INITIALINSTANCE_H
#define GDCORE_INITIALINSTANCE_H
#include <string>
#include "GDCore/PlatformDefinition/VariablesContainer.h"

namespace gd
{

/**
 * \brief Describe an instance of an object to be created on a layout start up
 */
class GD_CORE_API InitialInstance
{
public:
    InitialInstance() {};
    virtual ~InitialInstance() {};

    /** \name Common properties
     * Members functions related to common properties
     */
    ///@{

    virtual const std::string & GetObjectName() const = 0;
    virtual void SetObjectName(const std::string & name) = 0;

    virtual float GetX() const = 0;
    virtual void SetX(float x) = 0;

    virtual float GetY() const = 0;
    virtual void SetY(float y) = 0;

    virtual float  GetAngle() const = 0;
    virtual void SetAngle(float angle) = 0;

    virtual int GetZOrder() const = 0;
    virtual void SetZOrder(int zOrder) = 0;

    virtual const std::string & GetLayer() const = 0;
    virtual void SetLayer(const std::string & layer) = 0;

    virtual bool HasCustomSize() const = 0;
    virtual void SetHasCustomSize(bool hasCustomSize_ ) = 0;

    virtual float GetCustomWidth() const = 0;
    virtual void SetCustomWidth(float width) = 0;

    virtual float GetCustomHeight() const = 0;
    virtual void SetCustomHeight(float height) = 0;

    ///@}

    /** \name Variable management
     * Members functions related to initial instance variables management.
     */
    ///@{

    /**
     * Must return a reference to the container storing the instance variables
     * \see gd::VariablesContainer
     */
    virtual const gd::VariablesContainer & GetVariables() const =0;

    /**
     * Must return a reference to the container storing the instance variables
     * \see gd::VariablesContainer
     */
    virtual gd::VariablesContainer & GetVariables() =0;
    ///@}
};

}

#endif // GDCORE_INITIALINSTANCE_H
