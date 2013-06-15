#ifndef FILEEXTENSION_H
#define FILEEXTENSION_H
#include "GDCore/PlatformDefinition/PlatformExtension.h"

/**
 * \brief Built-in extension providing features related to external layouts.
 *
 * \ingroup BuiltinExtensions
 */
class FileExtension : public gd::PlatformExtension
{
public :

    FileExtension();
    virtual ~FileExtension() {};
};

#endif // FILEEXTENSION_H
