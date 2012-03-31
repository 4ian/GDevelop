#include "PlatformExtension.h"
#include "GDCore/Events/InstructionMetadata.h"
#include "GDCore/Events/ExpressionMetadata.h"

namespace gd
{

std::map<std::string, InstructionMetadata > PlatformExtension::badConditionsMetadata;
std::map<std::string, InstructionMetadata > PlatformExtension::badActionsMetadata;
std::map<std::string, ExpressionMetadata > PlatformExtension::badExpressionsMetadata;
std::map<std::string, StrExpressionMetadata > PlatformExtension::badStrExpressionsMetadata;


PlatformExtension::PlatformExtension()
{
    //ctor
}

PlatformExtension::~PlatformExtension()
{
    //dtor
}

}
