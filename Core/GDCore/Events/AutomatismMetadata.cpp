/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#include "AutomatismMetadata.h"
#include "GDCore/Events/InstructionMetadata.h"
#include "GDCore/Events/ExpressionMetadata.h"
#include "GDCore/PlatformDefinition/Automatism.h"
#include "GDCore/PlatformDefinition/AutomatismsSharedData.h"
#include <wx/file.h>
#include <wx/bitmap.h>

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
    SetFullName(std::string(fullname_));
    SetDescription(std::string(description_));
    SetDefaultName(std::string(defaultName_));
    SetGroup(group_);
    cppClassName = className_;
    if ( wxFile::Exists(icon24x24_) )
    {
        SetBitmapIcon(wxBitmap(icon24x24_, wxBITMAP_TYPE_ANY));
    } else { SetBitmapIcon(wxBitmap(24,24));}

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
    std::string nameWithNamespace = extensionNamespace.empty() ? name : extensionNamespace+name;
    conditionsInfos[nameWithNamespace] = InstructionMetadata(extensionNamespace, nameWithNamespace, fullname, description, sentence, group, icon, smallicon);
    return conditionsInfos[nameWithNamespace];
}

gd::InstructionMetadata & AutomatismMetadata::AddAction(const std::string & name,
                                       const std::string & fullname,
                                       const std::string & description,
                                       const std::string & sentence,
                                       const std::string & group,
                                       const std::string & icon,
                                       const std::string & smallicon)
{
    std::string nameWithNamespace = extensionNamespace.empty() ? name : extensionNamespace+name;
    actionsInfos[nameWithNamespace] = InstructionMetadata(extensionNamespace, nameWithNamespace, fullname, description, sentence, group, icon, smallicon);
    return actionsInfos[nameWithNamespace];
}

gd::ExpressionMetadata & AutomatismMetadata::AddExpression(const std::string & name,
                                       const std::string & fullname,
                                       const std::string & description,
                                       const std::string & group,
                                       const std::string & smallicon)
{
    std::string nameWithNamespace = extensionNamespace.empty() ? name : extensionNamespace+name;
    expressionsInfos[nameWithNamespace] = ExpressionMetadata(extensionNamespace, nameWithNamespace, fullname, description, group, smallicon);
    return expressionsInfos[nameWithNamespace];
}

gd::StrExpressionMetadata & AutomatismMetadata::AddStrExpression(const std::string & name,
                                       const std::string & fullname,
                                       const std::string & description,
                                       const std::string & group,
                                       const std::string & smallicon)
{
    std::string nameWithNamespace = extensionNamespace.empty() ? name : extensionNamespace+name;
    strExpressionsInfos[nameWithNamespace] = StrExpressionMetadata(extensionNamespace, nameWithNamespace, fullname, description, group, smallicon);
    return strExpressionsInfos[nameWithNamespace];
}


}
