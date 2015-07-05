/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#ifndef FILEEXTENSION_H
#define FILEEXTENSION_H

#include "GDCpp/ExtensionBase.h"

/**
 * \brief Standard extension providing files features.
 *
 * \ingroup FileExtension
 */
class FileExtension : public ExtensionBase
{
public:
    FileExtension();
    virtual ~FileExtension() {};

    #if defined(GD_IDE_ONLY)
    bool HasDebuggingProperties() const { return true; };
    void GetPropertyForDebugger(RuntimeScene & scene, unsigned int propertyNb, gd::String & name, gd::String & value) const;
    bool ChangeProperty(RuntimeScene & scene, unsigned int propertyNb, gd::String newValue);
    unsigned int GetNumberOfProperties(RuntimeScene & scene) const;
    #endif
};

#endif // FILEEXTENSION_H

