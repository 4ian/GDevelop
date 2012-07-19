/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef GDCORE_LAYER_H
#define GDCORE_LAYER_H
#include <string>

namespace gd
{

/**
 * \brief Base class used to represent a layer of a layout.
 *
 * \see gd::Layout
 * \ingroup PlatformDefinition
 */
class GD_CORE_API Layer
{
public:
    Layer() {};
    virtual ~Layer() {};

    /**
     * Must change the name of the layout with the name passed as parameter.
     */
    virtual void SetName(const std::string & name) =0;

    /**
     * Must return the name of the layout.
     */
    virtual const std::string & GetName() const =0;

    /**
     * Must change the visibility of the layer
     */
    virtual void SetVisibility(bool isVisible_) =0;

    /**
     * Must return true if the layer is visible
     */
    virtual bool GetVisibility() const =0;
};

}

#endif // GDCORE_LAYER_H
