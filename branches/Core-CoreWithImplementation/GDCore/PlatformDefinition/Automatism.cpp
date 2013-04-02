#include <iostream>
#include "GDCore/PlatformDefinition/Automatism.h"

namespace gd
{

Automatism::Automatism(const std::string & automatismTypeName) :
activated(true),
type(automatismTypeName)
{
}

Automatism::~Automatism()
{
};

}
