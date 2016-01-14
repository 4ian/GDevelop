/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#ifndef NETWORKEXTENSION_H
#define NETWORKEXTENSION_H

#include "GDCpp/Extensions/ExtensionBase.h"

/**
 * \brief Internal built-in extension providing very basic network features.
 *
 * \ingroup BuiltinExtensions
 */
class NetworkExtension : public ExtensionBase
{
    public:
        NetworkExtension();
        virtual ~NetworkExtension() {};
    protected:
    private:
};

#endif // NETWORKEXTENSION_H

