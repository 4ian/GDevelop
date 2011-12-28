/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef AUDIOEXTENSION_H
#define AUDIOEXTENSION_H
#include "GDL/ExtensionBase.h"
class Instruction;
class ArbitraryResourceWorker;

/**
 * \brief Internal builtin extension providing audio features.
 */
class AudioExtension : public ExtensionBase
{
    public:
        AudioExtension();
        virtual ~AudioExtension() {};

        #if defined(GD_IDE_ONLY)
        virtual void ExposeActionsResources(Instruction & action, ArbitraryResourceWorker & worker);

        bool HasDebuggingProperties() const { return true; };
        void GetPropertyForDebugger(RuntimeScene & scene, unsigned int propertyNb, std::string & name, std::string & value) const;
        bool ChangeProperty(RuntimeScene & scene, unsigned int propertyNb, std::string newValue);
        unsigned int GetNumberOfProperties(RuntimeScene & scene) const;
        #endif
};

#endif // AUDIOEXTENSION_H
