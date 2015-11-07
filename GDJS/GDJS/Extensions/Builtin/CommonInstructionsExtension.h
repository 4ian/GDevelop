/*
 * GDevelop JS Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef COMMONINSTRUCTIONSEXTENSION_H
#define COMMONINSTRUCTIONSEXTENSION_H
#include "GDCore/Extensions/PlatformExtension.h"

namespace gdjs
{

/**
 * \brief Built-in extension providing SpriteObject objects.
 *
 * \ingroup BuiltinExtensions
 */
class CommonInstructionsExtension : public gd::PlatformExtension
{
    public :

    CommonInstructionsExtension();
    virtual ~CommonInstructionsExtension() {};
};

}
#endif // COMMONINSTRUCTIONSEXTENSION_H
