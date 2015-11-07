/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include <iostream>
#include "GDCore/Project/Behavior.h"
#include "GDCore/IDE/Dialogs/PropertyDescriptor.h"

namespace gd
{

Behavior::~Behavior()
{
};

#if defined(GD_IDE_ONLY)
std::map<gd::String, gd::PropertyDescriptor> Behavior::GetProperties(gd::Project & project) const
{
	std::map<gd::String, gd::PropertyDescriptor> nothing;
	return nothing;
}
#endif

}
