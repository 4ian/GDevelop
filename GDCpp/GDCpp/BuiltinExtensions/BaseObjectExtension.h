#ifndef BUILTINEXTENSION_H
#define BUILTINEXTENSION_H

#include "GDCpp/ExtensionBase.h"

/**
 * \brief Internal builtin extension providing features for all objects
 *
 * \ingroup BuiltinExtensions
 */
class GD_API BaseObjectExtension : public ExtensionBase
{
    public:
        BaseObjectExtension();
        virtual ~BaseObjectExtension() {};
    protected:
    private:

        //Put all in a single file would result in a compilation
        //which requires large memory.
        void DeclareExtensionFirstPart();
        void DeclareExtensionSecondPart();
};

#endif // BUILTINEXTENSION_H

