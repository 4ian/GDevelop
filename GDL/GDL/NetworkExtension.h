/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef NETWORKEXTENSION_H
#define NETWORKEXTENSION_H

#include "GDL/ExtensionBase.h"

/**
 * \brief Internal built-in extension providing very basic network features.
 */
class NetworkExtension : public ExtensionBase
{
    public:
        NetworkExtension();
        virtual ~NetworkExtension() {};
    protected:
    private:
};

#endif // NETWORKEXTENSION_H
