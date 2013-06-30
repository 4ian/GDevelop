/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef NETWORKEXTENSION_H
#define NETWORKEXTENSION_H

#include "GDCpp/ExtensionBase.h"

/**
 * \brief Internal built-in extension providing very basic network features.
 *
 * \ingroup BuiltinExtensions
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

