/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#ifndef TIMEEXTENSION_H
#define TIMEEXTENSION_H

#include "GDCpp/Extensions/ExtensionBase.h"

/**
 * \brief Internal built-in extension providing time features.
 *
 * \ingroup BuiltinExtensions
 */
class TimeExtension : public ExtensionBase
{
    public:
        TimeExtension();
        virtual ~TimeExtension() {};

        #if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
        bool HasDebuggingProperties() const { return true; };
        void GetPropertyForDebugger(RuntimeScene & scene, std::size_t propertyNb, gd::String & name, gd::String & value) const;
        bool ChangeProperty(RuntimeScene & scene, std::size_t propertyNb, gd::String newValue);
        std::size_t GetNumberOfProperties(RuntimeScene & scene) const;
        #endif

    private:
};

#endif // TIMEEXTENSION_H
