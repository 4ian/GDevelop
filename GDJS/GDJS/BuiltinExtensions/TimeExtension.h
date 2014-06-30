/*
 * Game Develop JS Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#ifndef TIMEEXTENSION_H
#define TIMEEXTENSION_H
#include "GDCore/PlatformDefinition/PlatformExtension.h"

namespace gdjs
{

/**
 * \brief Built-in extension providing functions related to time management
 *
 * \ingroup BuiltinExtensions
 */
class TimeExtension : public gd::PlatformExtension
{
public :

    TimeExtension();
    virtual ~TimeExtension() {};
};

}
#endif // TIMEEXTENSION_H
