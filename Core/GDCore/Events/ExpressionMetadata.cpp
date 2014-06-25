/*
 * Game Develop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#include "ExpressionMetadata.h"
#include "GDCore/CommonTools.h"
#include <string>
#if !defined(GD_NO_WX_GUI)
#include <wx/file.h>
#include <wx/bitmap.h>
#endif

namespace gd
{

ExpressionMetadata::ExpressionMetadata(const std::string & extensionNamespace_,
                        const std::string & name_,
                        const std::string & fullname_,
                        const std::string & description_,
                        const std::string & group_,
                        const std::string & smallicon_) :
fullname(fullname_),
description(description_),
group(group_),
shown(true),
extensionNamespace(extensionNamespace_)
{
#if !defined(GD_NO_WX_GUI)
    if ( wxFile::Exists(smallicon_) )
    {
        smallicon = wxBitmap(smallicon_, wxBITMAP_TYPE_ANY);
    } else { smallicon = wxBitmap(16,16);}
#endif
}

ExpressionMetadata & ExpressionMetadata::SetHidden()
{
    shown = false;
    return *this;
}

StrExpressionMetadata::StrExpressionMetadata(const std::string & extensionNamespace_,
                        const std::string & name_,
                        const std::string & fullname_,
                        const std::string & description_,
                        const std::string & group_,
                        const std::string & smallicon_) :
fullname(fullname_),
description(description_),
group(group_),
shown(true),
extensionNamespace(extensionNamespace_)
{
#if !defined(GD_NO_WX_GUI)
    if ( wxFile::Exists(smallicon_) )
    {
        smallicon = wxBitmap(smallicon_, wxBITMAP_TYPE_ANY);
    } else { smallicon = wxBitmap(16,16);}
#endif
}

StrExpressionMetadata & StrExpressionMetadata::SetHidden()
{
    shown = false;
    return *this;
}

gd::ExpressionMetadata & ExpressionMetadata::AddParameter(const std::string & type, const std::string & description, const std::string & optionalObjectType, bool parameterIsOptional)
{
    gd::ParameterMetadata info;
    info.type = type;
    info.description = gd::ToString(description);
    info.codeOnly = false;
    info.optional = parameterIsOptional;
    info.supplementaryInformation = optionalObjectType.empty() ? "" : extensionNamespace+optionalObjectType;

    parameters.push_back(info);
    return *this;
}

gd::ExpressionMetadata & ExpressionMetadata::AddCodeOnlyParameter(const std::string & type, const std::string & supplementaryInformation)
{
    gd::ParameterMetadata info;
    info.type = type;
    info.codeOnly = true;
    info.supplementaryInformation = supplementaryInformation;

    parameters.push_back(info);
    return *this;
}

gd::StrExpressionMetadata & StrExpressionMetadata::AddParameter(const std::string & type, const std::string & description, const std::string & optionalObjectType, bool parameterIsOptional)
{
    gd::ParameterMetadata info;
    info.type = type;
    info.description = description;
    info.codeOnly = false;
    info.optional = parameterIsOptional;
    info.supplementaryInformation = optionalObjectType.empty() ? "" : extensionNamespace+optionalObjectType;

    parameters.push_back(info);
    return *this;
}

gd::StrExpressionMetadata & StrExpressionMetadata::AddCodeOnlyParameter(const std::string & type, const std::string & supplementaryInformation)
{
    gd::ParameterMetadata info;
    info.type = type;
    info.codeOnly = true;
    info.supplementaryInformation = supplementaryInformation;

    parameters.push_back(info);
    return *this;
}

}
