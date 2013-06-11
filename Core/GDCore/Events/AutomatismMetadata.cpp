/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#include "AutomatismMetadata.h"
#include "GDCore/Events/InstructionMetadata.h"
#include "GDCore/Events/ExpressionMetadata.h"
#include "GDCore/PlatformDefinition/Automatism.h"
#include "GDCore/PlatformDefinition/AutomatismsSharedData.h"
#if defined(GD_IDE_ONLY)
#include <wx/file.h>
#include <wx/bitmap.h>
#endif

namespace gd
{

AutomatismMetadata::AutomatismMetadata(const std::string & extensionNamespace_,
                       const std::string & name_,
                       const std::string & fullname_,
                       const std::string & defaultName_,
                       const std::string & description_,
                       const std::string & group_,
                       const std::string & icon24x24_,
                       const std::string & className_,
                       boost::shared_ptr<gd::Automatism> instance_,
                       boost::shared_ptr<gd::AutomatismsSharedData> sharedDatasInstance_) :
    extensionNamespace(extensionNamespace_),
    instance(instance_),
    sharedDatasInstance(sharedDatasInstance_)
{
#if defined(GD_IDE_ONLY)
    SetFullName(std::string(fullname_));
    SetDescription(std::string(description_));
    SetDefaultName(std::string(defaultName_));
    SetGroup(group_);
    className = className_;
    if ( wxFile::Exists(icon24x24_) )
    {
        SetBitmapIcon(wxBitmap(icon24x24_, wxBITMAP_TYPE_ANY));
    } else { SetBitmapIcon(wxBitmap(24,24));}
#endif

    if ( instance ) instance->SetTypeName(name_);
    if ( sharedDatasInstance ) sharedDatasInstance->SetTypeName(name_);
}

gd::InstructionMetadata & AutomatismMetadata::AddCondition(const std::string & name,
                                       const std::string & fullname,
                                       const std::string & description,
                                       const std::string & sentence,
                                       const std::string & group,
                                       const std::string & icon,
                                       const std::string & smallicon)
{
#if defined(GD_IDE_ONLY)
    std::string nameWithNamespace = extensionNamespace.empty() ? name : extensionNamespace+name;
    conditionsInfos[nameWithNamespace] = InstructionMetadata(extensionNamespace, nameWithNamespace, fullname, description, sentence, group, icon, smallicon);
    return conditionsInfos[nameWithNamespace];
#endif
}

gd::InstructionMetadata & AutomatismMetadata::AddAction(const std::string & name,
                                       const std::string & fullname,
                                       const std::string & description,
                                       const std::string & sentence,
                                       const std::string & group,
                                       const std::string & icon,
                                       const std::string & smallicon)
{
#if defined(GD_IDE_ONLY)
    std::string nameWithNamespace = extensionNamespace.empty() ? name : extensionNamespace+name;
    actionsInfos[nameWithNamespace] = InstructionMetadata(extensionNamespace, nameWithNamespace, fullname, description, sentence, group, icon, smallicon);
    return actionsInfos[nameWithNamespace];
#endif
}

gd::ExpressionMetadata & AutomatismMetadata::AddExpression(const std::string & name,
                                       const std::string & fullname,
                                       const std::string & description,
                                       const std::string & group,
                                       const std::string & smallicon)
{
#if defined(GD_IDE_ONLY)
    //Be careful, automatisms expression do not have namespace ( not necessary as we refer to the auomatism name in the expression )
    expressionsInfos[name] = ExpressionMetadata(extensionNamespace, name, fullname, description, group, smallicon);
    return expressionsInfos[name];
#endif
}

gd::StrExpressionMetadata & AutomatismMetadata::AddStrExpression(const std::string & name,
                                       const std::string & fullname,
                                       const std::string & description,
                                       const std::string & group,
                                       const std::string & smallicon)
{
#if defined(GD_IDE_ONLY)
    //Be careful, automatisms expression do not have namespace ( not necessary as we refer to the auomatism name in the expression )
    strExpressionsInfos[name] = StrExpressionMetadata(extensionNamespace, name, fullname, description, group, smallicon);
    return strExpressionsInfos[name];
#endif
}

AutomatismMetadata & AutomatismMetadata::SetFullName(const std::string & fullname_)
{
#if defined(GD_IDE_ONLY)
    fullname = fullname_; return *this;
#endif
}
AutomatismMetadata & AutomatismMetadata::SetDefaultName(const std::string & defaultName_)
{
#if defined(GD_IDE_ONLY)
    defaultName = defaultName_; return *this;
#endif
}
AutomatismMetadata & AutomatismMetadata::SetDescription(const std::string & description_)
{
#if defined(GD_IDE_ONLY)
    description = description_; return *this;
#endif
}
AutomatismMetadata & AutomatismMetadata::SetGroup(const std::string & group_)
{
#if defined(GD_IDE_ONLY)
    group = group_; return *this;
#endif
}
AutomatismMetadata & AutomatismMetadata::SetBitmapIcon(const wxBitmap & bitmap_)
{
#if defined(GD_IDE_ONLY)
    icon = bitmap_; return *this;
#endif
}
AutomatismMetadata & AutomatismMetadata::SetIncludeFile(const std::string & includeFile)
{
#if defined(GD_IDE_ONLY)
    optionalIncludeFile = includeFile; return *this;
#endif
}

}
