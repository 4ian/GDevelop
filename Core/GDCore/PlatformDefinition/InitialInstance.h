/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
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

    /** \name Others properties management
     * Members functions related to exposing others properties of the instance
     */
    ///@{
    /**
     * Must return a map containing the properties names (as keys) and their values.
     * \note Common properties do not need to be inserted in this map
     */
    virtual std::map<std::string, std::string> GetCustomProperties(gd::Project & project, gd::Layout & layout) {std::map<std::string, std::string> nothing; return nothing;}

    /**
     * Must update the property called \a name with the new \a value.
     *
     * \return false if the property could not be updated.
     */
    virtual bool UpdateCustomProperty(const std::string & name, const std::string & value, gd::Project & project, gd::Layout & layout) {return false;};
    ///@}
};

}

#endif // GDCORE_INITIALINSTANCE_H
