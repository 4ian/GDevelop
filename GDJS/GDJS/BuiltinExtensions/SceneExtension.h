/*
 * Game Develop JS Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#ifndef SCENEEXTENSION_H
#define SCENEEXTENSION_H
#include "GDCore/PlatformDefinition/PlatformExtension.h"

namespace gdjs
{

/**
 * \brief Built-in extension providing common functions.
 *
 * \ingroup BuiltinExtensions
 */
class SceneExtension : public gd::PlatformExtension
{
    public :

    SceneExtension();
    virtual ~SceneExtension() {};
};

}
#endif // SCENEEXTENSION_H
