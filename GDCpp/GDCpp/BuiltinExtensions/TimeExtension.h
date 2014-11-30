/*
 * GDevelop C++ Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#ifndef TIMEEXTENSION_H
#define TIMEEXTENSION_H

#include "GDCpp/ExtensionBase.h"

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
        void GetPropertyForDebugger(RuntimeScene & scene, unsigned int propertyNb, std::string & name, std::string & value) const;
        bool ChangeProperty(RuntimeScene & scene, unsigned int propertyNb, std::string newValue);
        unsigned int GetNumberOfProperties(RuntimeScene & scene) const;
        #endif

    private:
};

#endif // TIMEEXTENSION_H

