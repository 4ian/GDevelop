/*
 * Game Develop JS Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#ifndef ADVANCEDEXTENSION_H
#define ADVANCEDEXTENSION_H
#include "GDCore/PlatformDefinition/PlatformExtension.h"

namespace gdjs
{

/**
 * \brief Built-in extension providing "Always" condition.
 *
 * \ingroup BuiltinExtensions
 */
class AdvancedExtension : public gd::PlatformExtension
{
    public :

    AdvancedExtension();
    virtual ~AdvancedExtension() {};
};

}
#endif // ADVANCEDEXTENSION_H
