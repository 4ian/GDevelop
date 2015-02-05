/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if !defined(GD_NO_WX_GUI)
#include <wx/file.h>
#include <wx/bitmap.h>
#endif
#include "InstructionMetadata.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/Localization.h"

namespace gd
{
InstructionMetadata::InstructionMetadata() :
    sentence(gd::ToString(_("Unknown or unsupported instruction"))),
    canHaveSubInstructions(false),
    hidden(true)
{
}

InstructionMetadata::InstructionMetadata(const std::string & extensionNamespace_,
                        const std::string & name_,
                        const std::string & fullname_,
                        const std::string & description_,
                        const std::string & sentence_,
                        const std::string & group_,
                        const std::string & icon_,
                        const std::string & smallIcon_) :
fullname(fullname_),
description(description_),
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

InstructionMetadata & InstructionMetadata::AddParameter(const std::string & type, const std::string & description, const std::string & optionalObjectType, bool parameterIsOptional)
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

InstructionMetadata & InstructionMetadata::AddCodeOnlyParameter(const std::string & type, const std::string & supplementaryInformation)
{
    ParameterMetadata info;
    info.type = type;
    info.codeOnly = true;
    info.supplementaryInformation = supplementaryInformation;

    parameters.push_back(info);
    return *this;
}

}







