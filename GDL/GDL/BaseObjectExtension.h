#ifndef BUILTINEXTENSION_H
#define BUILTINEXTENSION_H

#include "GDL/ExtensionBase.h"

class GD_API BaseObjectExtension : public ExtensionBase
{
    public:
        BaseObjectExtension();
        virtual ~BaseObjectExtension() {};
    protected:
    private:

        //Put all in a single file result in a compilation
        //which require large memory.
        void DeclareExtensionFirstPart();
        void DeclareExtensionSecondPart();
};

#endif // BUILTINEXTENSION_H
