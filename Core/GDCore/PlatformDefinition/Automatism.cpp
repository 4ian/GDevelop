#include <iostream>
#include "GDCore/PlatformDefinition/Automatism.h"
#include "GDCore/IDE/Dialogs/PropgridPropertyDescriptor.h"

namespace gd
{

Automatism::~Automatism()
{
};

#if defined(GD_IDE_ONLY)
std::map<std::string, gd::PropgridPropertyDescriptor> Automatism::GetProperties(gd::Project & project) const
{
	std::map<std::string, gd::PropgridPropertyDescriptor> nothing;
	return nothing;
}
#endif

}
