/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#ifndef AUDIOEXTENSION_H
#define AUDIOEXTENSION_H
#include "GDCpp/Extensions/ExtensionBase.h"
namespace gd { class Instruction; }
namespace gd {class ArbitraryResourceWorker;}

/**
 * \brief Standard extension providing audio features.
 *
 * \ingroup BuiltinExtensions
 */
class AudioExtension : public ExtensionBase
{
    public:
        AudioExtension();
        virtual ~AudioExtension() {};

        #if defined(GD_IDE_ONLY)
        virtual void ExposeActionsResources(gd::Instruction & action, gd::ArbitraryResourceWorker & worker);

        bool HasDebuggingProperties() const { return true; };
        void GetPropertyForDebugger(RuntimeScene & scene, std::size_t propertyNb, gd::String & name, gd::String & value) const;
        bool ChangeProperty(RuntimeScene & scene, std::size_t propertyNb, gd::String newValue);
        std::size_t GetNumberOfProperties(RuntimeScene & scene) const;
        #endif
};

#endif // AUDIOEXTENSION_H
