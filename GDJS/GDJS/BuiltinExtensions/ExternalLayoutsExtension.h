/*
 * Game Develop JS Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#ifndef EXTERNALLAYOUTSEXTENSION_H
#define EXTERNALLAYOUTSEXTENSION_H
#include "GDCore/PlatformDefinition/PlatformExtension.h"

namespace gdjs
{

/**
 * \brief Built-in extension providing features related to external layouts.
 *
 * \ingroup BuiltinExtensions
 */
class ExternalLayoutsExtension : public gd::PlatformExtension
{
public :

    ExternalLayoutsExtension();
    virtual ~ExternalLayoutsExtension() {};
};

}
#endif // EXTERNALLAYOUTSEXTENSION_H
