/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include <iostream>
#include "GDCore/PlatformDefinition/Automatism.h"
#include "GDCore/IDE/Dialogs/PropertyDescriptor.h"

namespace gd
{

Automatism::~Automatism()
{
};

#if defined(GD_IDE_ONLY)
std::map<gd::String, gd::PropertyDescriptor> Automatism::GetProperties(gd::Project & project) const
{
	std::map<gd::String, gd::PropertyDescriptor> nothing;
	return nothing;
}
#endif

}
