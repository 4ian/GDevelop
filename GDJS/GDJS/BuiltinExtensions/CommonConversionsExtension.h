/*
 * Game Develop JS Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#ifndef COMMONCONVERSIONSEXTENSION_H
#define COMMONCONVERSIONSEXTENSION_H
#include "GDCore/PlatformDefinition/PlatformExtension.h"

namespace gdjs
{

/**
 * \brief Built-in extension providing common functions for conversion between types.
 *
 * \ingroup BuiltinExtensions
 */
class CommonConversionsExtension : public gd::PlatformExtension
{
public :

    CommonConversionsExtension();
    virtual ~CommonConversionsExtension() {};
};

}
#endif // COMMONCONVERSIONSEXTENSION_H
