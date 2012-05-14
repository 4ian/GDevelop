/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#include "ExpressionMetadata.h"
#include "GDCore/CommonTools.h"
#include <string>

namespace gd
{

ExpressionMetadata::ExpressionMetadata(std::string extensionNamespace_) :
shown(true),
extensionNamespace(extensionNamespace_)
{
}

ExpressionMetadata & ExpressionMetadata::SetHidden()
{
    shown = false;
    return *this;
}

StrExpressionMetadata::StrExpressionMetadata(std::string extensionNamespace_) :
shown(true),
extensionNamespace(extensionNamespace_)
{
}

StrExpressionMetadata & StrExpressionMetadata::SetHidden()
{
    shown = false;
    return *this;
}

gd::ParameterMetadata & ExpressionMetadata::AddParameter(const std::string & type, const wxString & description, const std::string & optionalObjectType, bool parameterIsOptional)
{
    gd::ParameterMetadata info;
    info.type = type;
    info.description = gd::ToString(description);
    info.codeOnly = false;
    info.optional = parameterIsOptional;
    info.supplementaryInformation = optionalObjectType.empty() ? "" : extensionNamespace+optionalObjectType;

    parameters.push_back(info);
    return parameters.back();
}

gd::ParameterMetadata & ExpressionMetadata::AddCodeOnlyParameter(const std::string & type, const std::string & supplementaryInformation)
{
    gd::ParameterMetadata info;
    info.type = type;
    info.codeOnly = true;
    info.supplementaryInformation = supplementaryInformation;

    parameters.push_back(info);
    return parameters.back();
}

gd::ParameterMetadata & StrExpressionMetadata::AddParameter(const std::string & type, const wxString & description, const std::string & optionalObjectType, bool parameterIsOptional)
{
    gd::ParameterMetadata info;
    info.type = type;
    info.description = gd::ToString(description);
    info.codeOnly = false;
    info.optional = parameterIsOptional;
    info.supplementaryInformation = optionalObjectType.empty() ? "" : extensionNamespace+optionalObjectType;

    parameters.push_back(info);
    return parameters.back();
}

gd::ParameterMetadata & StrExpressionMetadata::AddCodeOnlyParameter(const std::string & type, const std::string & supplementaryInformation)
{
    gd::ParameterMetadata info;
    info.type = type;
    info.codeOnly = true;
    info.supplementaryInformation = supplementaryInformation;

    parameters.push_back(info);
    return parameters.back();
}

}
