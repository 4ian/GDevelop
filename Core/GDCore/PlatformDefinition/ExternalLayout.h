/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef EXTERNALLAYOUT_H
#define EXTERNALLAYOUT_H
#include <string>
#include "GDCore/PlatformDefinition/InitialInstancesContainer.h"

namespace gd
{

class GD_CORE_API ExternalLayout
{
public:
    ExternalLayout() {};
    virtual ~ExternalLayout() {};

    /**
     * Must return the name of the external layout.
     */
    virtual const std::string & GetName() const =0;

    /**
     * Must change the name of the external layout.
     */
    virtual void SetName(const std::string & name_) =0;

    /**
     * Must return the container storing initial instances.
     */
    virtual const InitialInstancesContainer & GetInitialInstances() const =0;

    /**
     * Must return the container storing initial instances.
     */
    virtual InitialInstancesContainer & GetInitialInstances() =0;
};

}

#endif // EXTERNALLAYOUT_H
