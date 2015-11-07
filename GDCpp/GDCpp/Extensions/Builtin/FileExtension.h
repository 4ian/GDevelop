/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#ifndef FILEEXTENSION_H
#define FILEEXTENSION_H

#include "GDCpp/Extensions/ExtensionBase.h"

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
    void GetPropertyForDebugger(RuntimeScene & scene, std::size_t propertyNb, gd::String & name, gd::String & value) const;
    bool ChangeProperty(RuntimeScene & scene, std::size_t propertyNb, gd::String newValue);
    std::size_t GetNumberOfProperties(RuntimeScene & scene) const;
    #endif
};

#endif // FILEEXTENSION_H
