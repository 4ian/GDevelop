#include "InstructionMetadata.h"
#include "GDCore/CommonTools.h"
#include <wx/file.h>
#include <wx/bitmap.h>
#include <wx/intl.h>

namespace gd
{
InstructionMetadata::InstructionMetadata() :
    sentence(gd::ToString(_("Unknown or unsupported instruction")))
{
}

InstructionMetadata::InstructionMetadata(const std::string & extensionNamespace_,
                        const std::string & name_,
                        const std::string & fullname_,
                        const std::string & description_,
                        const std::string & sentence_,
                        const std::string & group_,
                        const std::string & icon_,
                        const std::string & smallicon_) :
fullname(fullname_),
description(description_),
sentence(sentence_),
group(group_),
canHaveSubInstructions(false),
extensionNamespace(extensionNamespace_),
hidden(false)
{
    if ( wxFile::Exists(icon_) )
    {
        icon = wxBitmap(icon_, wxBITMAP_TYPE_ANY);
    } else { icon = wxBitmap(24,24);}
    if ( wxFile::Exists(smallicon_) )
    {
        smallicon = wxBitmap(smallicon_, wxBITMAP_TYPE_ANY);
    } else { smallicon = wxBitmap(16,16);}
}

ParameterMetadata::ParameterMetadata() :
optional(false),
codeOnly(false)
{
}

InstructionMetadata & InstructionMetadata::AddParameter(const std::string & type, const wxString & description, const std::string & optionalObjectType, bool parameterIsOptional)
{
    ParameterMetadata info;
    info.type = type;
    info.description = gd::ToString(description);
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







