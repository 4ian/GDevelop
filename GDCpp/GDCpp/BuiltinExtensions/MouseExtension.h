/*
 * GDevelop C++ Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

#ifndef MOUSEEXTENSION_H
#define MOUSEEXTENSION_H

#include "GDCpp/ExtensionBase.h"

/**
 * \brief Internal built-in extension providing mouse features.
 *
 * \ingroup BuiltinExtensions
 */
class MouseExtension : public ExtensionBase
{
    public:
        MouseExtension();
        virtual ~MouseExtension() {};
    protected:
    private:
};

#endif // MOUSEEXTENSION_H

