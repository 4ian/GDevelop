#include "InstructionMetadata.h"
#include "GDCore/CommonTools.h"

namespace gd
{

InstructionMetadata::InstructionMetadata(std::string instructionNamespace_) :
canHaveSubInstructions(false),
extensionNamespace(instructionNamespace_),
hidden(false)
{
}

ParameterMetadata::ParameterMetadata() :
optional(false),
codeOnly(false)
{
}

ParameterMetadata & InstructionMetadata::AddParameter(const std::string & type, const wxString & description, const std::string & optionalObjectType, bool parameterIsOptional)
{
    ParameterMetadata info;
    info.type = type;
    info.description = gd::ToString(description);
    info.codeOnly = false;
    info.optional = parameterIsOptional;
    info.supplementaryInformation = optionalObjectType.empty() ? "" : extensionNamespace+optionalObjectType;

    parameters.push_back(info);
    return parameters.back();
}

ParameterMetadata & InstructionMetadata::AddCodeOnlyParameter(const std::string & type, const std::string & supplementaryInformation)
{
    ParameterMetadata info;
    info.type = type;
    info.codeOnly = true;
    info.supplementaryInformation = supplementaryInformation;

    parameters.push_back(info);
    return parameters.back();
}

}







