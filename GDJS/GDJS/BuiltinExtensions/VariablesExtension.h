/*
 * Game Develop JS Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#ifndef VARIABLESEXTENSION_H
#define VARIABLESEXTENSION_H
#include "GDCore/PlatformDefinition/PlatformExtension.h"

namespace gdjs
{

/**
 * \brief Built-in extension providing actions/conditions and expressions for scene variables.
 *
 * \ingroup BuiltinExtensions
 */
class VariablesExtension : public gd::PlatformExtension
{
    public :

    VariablesExtension();
    virtual ~VariablesExtension() {};
};

}
#endif // VARIABLESEXTENSION_H
