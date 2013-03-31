#include "PlatformExtension.h"
#include "GDCore/Events/InstructionMetadata.h"
#include "GDCore/Events/ExpressionMetadata.h"

namespace gd
{

std::map<std::string, gd::InstructionMetadata > PlatformExtension::badConditionsMetadata;
std::map<std::string, gd::InstructionMetadata > PlatformExtension::badActionsMetadata;
std::map<std::string, gd::ExpressionMetadata > PlatformExtension::badExpressionsMetadata;
std::map<std::string, gd::StrExpressionMetadata > PlatformExtension::badStrExpressionsMetadata;


PlatformExtension::PlatformExtension()
{
    //ctor
}

PlatformExtension::~PlatformExtension()
{
    //dtor
}

}
