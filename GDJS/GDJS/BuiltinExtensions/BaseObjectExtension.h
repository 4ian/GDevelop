/*
 * Game Develop JS Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#ifndef BASEOBJECTEXTENSION_H
#define BASEOBJECTEXTENSION_H
#include "GDCore/PlatformDefinition/PlatformExtension.h"

namespace gdjs
{

/**
 * \brief Built-in extension providing functions for all objects
 *
 * \ingroup BuiltinExtensions
 */
class BaseObjectExtension : public gd::PlatformExtension
{
public :

    BaseObjectExtension();
    virtual ~BaseObjectExtension() {};
};

}
#endif // BASEOBJECTEXTENSION_H
