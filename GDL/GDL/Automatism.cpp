#include "Automatism.h"

Automatism::Automatism(std::string automatismTypeName) :
activated(true),
type(automatismTypeName)
{
}

void Automatism::SetName(std::string name_)
{
    name = name_;
}
