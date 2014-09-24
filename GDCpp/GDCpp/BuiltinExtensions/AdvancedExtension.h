/*
 * GDevelop C++ Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

#ifndef ADVANCEDEXTENSION_H
#define ADVANCEDEXTENSION_H

#include "GDCpp/ExtensionBase.h"

/**
 * \brief Standard extension providing advanced or special features.
 *
 * \ingroup BuiltinExtensions
 */
class AdvancedExtension : public ExtensionBase
{
public:
    AdvancedExtension();
    virtual ~AdvancedExtension() {};
};

#endif // ADVANCEDEXTENSION_H

