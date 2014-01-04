/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */
#include <iostream>
#include "ObjectMetadata.h"
#include "GDCore/Events/InstructionMetadata.h"
#include "GDCore/Events/ExpressionMetadata.h"
#if defined(GD_IDE_ONLY)
#include <wx/file.h>
#include <wx/bitmap.h>
#endif

namespace gd
{

ObjectMetadata::ObjectMetadata(const std::string & extensionNamespace_,
                   const std::string & name_,
                   const std::string & fullname_,
                   const std::string & informations_,
                   const std::string & icon24x24_,
                   CreateFunPtr createFunPtrP,
                   DestroyFunPtr destroyFunPtrP) :
    extensionNamespace(extensionNamespace_)
{
    name = name_;
#if defined(GD_IDE_ONLY)
    SetFullName(std::string(fullname_));
    SetDescription(std::string(informations_));
    SetBitmapIcon(wxBitmap(icon24x24_, wxBITMAP_TYPE_ANY));
#endif
    createFunPtr = createFunPtrP;
    destroyFunPtr = destroyFunPtrP;
}

gd::InstructionMetadata & ObjectMetadata::AddCondition(const std::string & name,
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

gd::InstructionMetadata & ObjectMetadata::AddAction(const std::string & name,
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

gd::ExpressionMetadata & ObjectMetadata::AddExpression(const std::string & name,
                                       const std::string & fullname,
                                       const std::string & description,
                                       const std::string & group,
                                       const std::string & smallicon)
{
#if defined(GD_IDE_ONLY)
    //Be careful, objects expression do not have namespace ( not necessary as objects inherits from only one derived object )
    expressionsInfos[name] = ExpressionMetadata(extensionNamespace, name, fullname, description, group, smallicon);
    return expressionsInfos[name];
#endif
}

gd::StrExpressionMetadata & ObjectMetadata::AddStrExpression(const std::string & name,
                                       const std::string & fullname,
                                       const std::string & description,
                                       const std::string & group,
                                       const std::string & smallicon)
{
#if defined(GD_IDE_ONLY)
    //Be careful, objects expression do not have namespace ( not necessary as objects inherits from only one derived object )
    strExpressionsInfos[name] = StrExpressionMetadata(extensionNamespace, name, fullname, description, group, smallicon);
    return strExpressionsInfos[name];
#endif
}

ObjectMetadata & ObjectMetadata::SetFullName(const std::string & fullname_)
{
#if defined(GD_IDE_ONLY)
    fullname = fullname_;
#endif
    return *this;
}

ObjectMetadata & ObjectMetadata::SetDescription(const std::string & description_)
{
#if defined(GD_IDE_ONLY)
    description = description_;
#endif
    return *this;
}

ObjectMetadata & ObjectMetadata::SetBitmapIcon(const wxBitmap & bitmap_)
{
#if defined(GD_IDE_ONLY)
    icon = bitmap_;
#endif
    return *this;
}

ObjectMetadata & ObjectMetadata::SetIncludeFile(const std::string & includeFile)
{
#if defined(GD_IDE_ONLY)
    includeFiles.clear();
    includeFiles.push_back(includeFile);
#endif
    return *this;
}
ObjectMetadata & ObjectMetadata::AddIncludeFile(const std::string & includeFile)
{
#if defined(GD_IDE_ONLY)
    if ( std::find(includeFiles.begin(), includeFiles.end(), includeFile) == includeFiles.end())
        includeFiles.push_back(includeFile);
#endif
    return *this;
}

}
