/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#include "ObjectMetadata.h"
#include "GDCore/Events/InstructionMetadata.h"
#include "GDCore/Events/ExpressionMetadata.h"
#include <wx/file.h>
#include <wx/bitmap.h>

namespace gd
{

ObjectMetadata::ObjectMetadata(const std::string & extensionNamespace_,
                   const std::string & name_,
                   const std::string & fullname_,
                   const std::string & informations_,
                   const std::string & icon24x24_,
                   CreateFunPtr createFunPtrP,
                   DestroyFunPtr destroyFunPtrP,
                   const std::string & cppClassName_)
{
    name = name_;
    SetFullName(std::string(fullname_));
    SetDescription(std::string(informations_));
    SetBitmapIcon(wxBitmap(icon24x24_, wxBITMAP_TYPE_ANY));
    createFunPtr = createFunPtrP;
    destroyFunPtr = destroyFunPtrP;
    cppClassName = cppClassName_;
}

gd::InstructionMetadata & ObjectMetadata::AddCondition(const std::string & name,
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

gd::InstructionMetadata & ObjectMetadata::AddAction(const std::string & name,
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

gd::ExpressionMetadata & ObjectMetadata::AddExpression(const std::string & name,
                                       const std::string & fullname,
                                       const std::string & description,
                                       const std::string & group,
                                       const std::string & smallicon)
{
    std::string nameWithNamespace = extensionNamespace.empty() ? name : extensionNamespace+name;
    expressionsInfos[nameWithNamespace] = ExpressionMetadata(extensionNamespace, nameWithNamespace, fullname, description, group, smallicon);
    return expressionsInfos[nameWithNamespace];
}

gd::StrExpressionMetadata & ObjectMetadata::AddStrExpression(const std::string & name,
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
