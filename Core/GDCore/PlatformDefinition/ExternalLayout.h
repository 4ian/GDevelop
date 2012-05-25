/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GDCORE_EXTERNALLAYOUT_H
#define GDCORE_EXTERNALLAYOUT_H
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
     * Must return a pointer to a copy of the layout.
     *
     * \note A such method is useful when the IDE must store a copy of a ExternalLayout derived class ( e.g. for Clipboard ) so as to avoid slicing
     *
     * Typical implementation example:
     * \code
     * return new MyExternalLayoutClass(*this);
     * \endcode
     */
    virtual ExternalLayout * Clone() const =0;

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

#endif // GDCORE_EXTERNALLAYOUT_H
