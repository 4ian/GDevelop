/*
 * GDevelop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
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
std::map<std::string, gd::PropertyDescriptor> Automatism::GetProperties(gd::Project & project) const
{
	std::map<std::string, gd::PropertyDescriptor> nothing;
	return nothing;
}
#endif

}
