/*
 * Game Develop JS Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#ifndef WINDOWEXTENSION_H
#define WINDOWEXTENSION_H
#include "GDCore/PlatformDefinition/PlatformExtension.h"

namespace gdjs
{

/**
 * \brief Built-in extension providing common functions related to the window/canvas.
 *
 * \ingroup BuiltinExtensions
 */
class WindowExtension : public gd::PlatformExtension
{
public :

    WindowExtension();
    virtual ~WindowExtension() {};

    virtual void ExposeActionsResources(gd::Instruction & action, gd::ArbitraryResourceWorker & worker);
};

}
#endif // WINDOWEXTENSION_H
