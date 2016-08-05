/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "ExpressionMetadata.h"
#include "GDCore/CommonTools.h"
#include "GDCore/String.h"
#if !defined(GD_NO_WX_GUI)
#include <wx/file.h>
#include <wx/bitmap.h>
#endif

namespace gd
{

ExpressionMetadata::ExpressionMetadata(const gd::String & extensionNamespace_,
                        const gd::String & name_,
                        const gd::String & fullname_,
                        const gd::String & description_,
                        const gd::String & group_,
                        const gd::String & smallicon_) :
fullname(fullname_),
description(description_),
group(group_),
shown(true),
smallIconFilename(smallicon_),
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

gd::ExpressionMetadata & ExpressionMetadata::AddParameter(const gd::String & type, const gd::String & description, const gd::String & optionalObjectType, bool parameterIsOptional)
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

gd::ExpressionMetadata & ExpressionMetadata::AddCodeOnlyParameter(const gd::String & type, const gd::String & supplementaryInformation)
{
    gd::ParameterMetadata info;
    info.type = type;
    info.codeOnly = true;
    info.supplementaryInformation = supplementaryInformation;

    parameters.push_back(info);
    return *this;
}

}
