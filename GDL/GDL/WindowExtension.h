#ifndef WINDOWEXTENSION_H
#define WINDOWEXTENSION_H

#include "GDL/ExtensionBase.h"

class WindowExtension : public ExtensionBase
{
    public:
        WindowExtension();
        virtual ~WindowExtension() {};

        virtual void PrepareActionsResourcesForMerging(Instruction & action, ResourcesMergingHelper & resourcesMergingHelper);
};

#endif // WINDOWEXTENSION_H
