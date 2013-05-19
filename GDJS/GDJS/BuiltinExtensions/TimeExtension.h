#ifndef TIMEEXTENSION_H
#define TIMEEXTENSION_H
#include "GDCore/PlatformDefinition/PlatformExtension.h"

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

#endif // TIMEEXTENSION_H
