/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef AUDIOEXTENSION_H
#define AUDIOEXTENSION_H
#include "GDCore/Extensions/PlatformExtension.h"

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
