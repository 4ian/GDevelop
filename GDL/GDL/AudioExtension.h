#ifndef AUDIOEXTENSION_H
#define AUDIOEXTENSION_H
#include "GDL/ExtensionBase.h"
class Instruction;
class ResourcesMergingHelper;

class AudioExtension : public ExtensionBase
{
    public:
        AudioExtension();
        virtual ~AudioExtension() {};

        #if defined(GD_IDE_ONLY)
        virtual void PrepareActionsResourcesForMerging(Instruction & action, ResourcesMergingHelper & resourcesMergingHelper);
        #endif
};

#endif // AUDIOEXTENSION_H
