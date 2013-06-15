#ifndef WINDOWEXTENSION_H
#define WINDOWEXTENSION_H
#include "GDCore/PlatformDefinition/PlatformExtension.h"

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

#endif // WINDOWEXTENSION_H
