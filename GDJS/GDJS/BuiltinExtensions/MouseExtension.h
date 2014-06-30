/*
 * Game Develop JS Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#ifndef MOUSEEXTENSION_H
#define MOUSEEXTENSION_H
#include "GDCore/PlatformDefinition/PlatformExtension.h"

namespace gdjs
{

/**
 * \brief Built-in extension providing functions related the mouse
 *
 * \ingroup BuiltinExtensions
 */
class MouseExtension : public gd::PlatformExtension
{
public :

    MouseExtension();
    virtual ~MouseExtension() {};
};

}
#endif // MOUSEEXTENSION_H
