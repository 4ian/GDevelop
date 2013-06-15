#ifndef NETWORKEXTENSION_H
#define NETWORKEXTENSION_H
#include "GDCore/PlatformDefinition/PlatformExtension.h"

/**
 * \brief Built-in extension providing functions related to networking.
 *
 * \ingroup BuiltinExtensions
 */
class NetworkExtension : public gd::PlatformExtension
{
public :

    NetworkExtension();
    virtual ~NetworkExtension() {};
};

#endif // NETWORKEXTENSION_H
