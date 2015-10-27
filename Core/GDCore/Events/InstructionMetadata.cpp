/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if !defined(GD_NO_WX_GUI)
#include <wx/file.h>
#include <wx/bitmap.h>
#endif
#include <algorithm>
#include "InstructionMetadata.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/Localization.h"

namespace gd
{
InstructionMetadata::InstructionMetadata() :
    sentence(_("Unknown or unsupported instruction")),
    canHaveSubInstructions(false),
    hidden(true)
{
}

InstructionMetadata::InstructionMetadata(const gd::String & extensionNamespace_,
                        const gd::String & name_,
                        const gd::String & fullname_,
                        const gd::String & description_,
                        const gd::String & sentence_,
                        const gd::String & group_,
                        const gd::String & icon_,
                        const gd::String & smallIcon_) :
fullname(fullname_),
description(description_),
helpPage(),
sentence(sentence_),
group(group_),
iconFilename(icon_),
smallIconFilename(smallIcon_),
canHaveSubInstructions(false),
extensionNamespace(extensionNamespace_),
hidden(false),
usageComplexity(5)
{
#if !defined(GD_NO_WX_GUI)
    if ( wxFile::Exists(icon_) )
    {
        icon = wxBitmap(icon_, wxBITMAP_TYPE_ANY);
    } else { icon = wxBitmap(24,24);}
    if ( wxFile::Exists(smallIcon_) )
    {
        smallicon = wxBitmap(smallIcon_, wxBITMAP_TYPE_ANY);
    } else { smallicon = wxBitmap(16,16);}
#endif
}

ParameterMetadata::ParameterMetadata() :
optional(false),
codeOnly(false)
{
}

InstructionMetadata & InstructionMetadata::AddParameter(const gd::String & type, const gd::String & description, const gd::String & optionalObjectType, bool parameterIsOptional)
{
    ParameterMetadata info;
    info.type = type;
    info.description = description;
    info.codeOnly = false;
    info.optional = parameterIsOptional;
    info.supplementaryInformation = optionalObjectType.empty() ? "" : extensionNamespace+optionalObjectType;

    parameters.push_back(info);
    return *this;
}

InstructionMetadata & InstructionMetadata::AddCodeOnlyParameter(const gd::String & type, const gd::String & supplementaryInformation)
{
    ParameterMetadata info;
    info.type = type;
    info.codeOnly = true;
    info.supplementaryInformation = supplementaryInformation;

    parameters.push_back(info);
    return *this;
}

}
