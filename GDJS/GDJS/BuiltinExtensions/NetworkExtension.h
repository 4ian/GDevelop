/*
 * Game Develop JS Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#ifndef NETWORKEXTENSION_H
#define NETWORKEXTENSION_H
#include "GDCore/PlatformDefinition/PlatformExtension.h"

namespace gdjs
{

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

}
#endif // NETWORKEXTENSION_H
