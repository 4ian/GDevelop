#ifndef AUDIOEXTENSION_H
#define AUDIOEXTENSION_H
#include "GDCore/PlatformDefinition/PlatformExtension.h"

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

#endif // AUDIOEXTENSION_H
