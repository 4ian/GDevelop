#ifndef WINDOWEXTENSION_H
#define WINDOWEXTENSION_H

#include "GDL/ExtensionBase.h"

class WindowExtension : public ExtensionBase
{
    public:
        WindowExtension();
        virtual ~WindowExtension() {};

        #if defined(GD_IDE_ONLY)
        virtual void PrepareActionsResourcesForMerging(Instruction & action, ResourcesMergingHelper & resourcesMergingHelper);
        #endif
};

#endif // WINDOWEXTENSION_H
