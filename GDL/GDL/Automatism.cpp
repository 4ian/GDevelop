#include "Automatism.h"

Automatism::Automatism(std::string automatismTypeName) :
activated(true),
type(automatismTypeName)
{
}

void Automatism::SetName(const std::string & name_)
{
    name = name_;
}
