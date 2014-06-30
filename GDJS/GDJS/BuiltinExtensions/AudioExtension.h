/*
 * Game Develop JS Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#ifndef AUDIOEXTENSION_H
#define AUDIOEXTENSION_H
#include "GDCore/PlatformDefinition/PlatformExtension.h"

namespace gdjs
{

/**
 * \brief Built-in extension providing audio functions.
 *
 * \ingroup BuiltinExtensions
 */
class AudioExtension : public gd::PlatformExtension
{
public :

    AudioExtension();
    virtual ~AudioExtension() {};

    virtual void ExposeActionsResources(gd::Instruction & action, gd::ArbitraryResourceWorker & worker);
};

}
#endif // AUDIOEXTENSION_H
