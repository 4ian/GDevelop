/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include <iostream>
#include "ObjectMetadata.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/Extensions/Metadata/ExpressionMetadata.h"
#include <algorithm>
#include <iostream>
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "GDCore/IDE/wxTools/SkinHelper.h"
#include <wx/file.h>
#include <wx/bitmap.h>
#endif

namespace gd
{

ObjectMetadata::ObjectMetadata(const gd::String & extensionNamespace_,
                   const gd::String & name_,
                   const gd::String & fullname_,
                   const gd::String & informations_,
                   const gd::String & icon24x24,
                   CreateFunPtr createFunPtrP) :
    extensionNamespace(extensionNamespace_)
{
    name = name_;
#if defined(GD_IDE_ONLY)
    SetFullName(gd::String(fullname_));
    SetDescription(gd::String(informations_));
    iconFilename = icon24x24;
#if !defined(GD_NO_WX_GUI)
    if ( gd::SkinHelper::IconExists(icon24x24, 24) )
        SetBitmapIcon(gd::SkinHelper::GetIcon(icon24x24, 24));
    else if ( wxFile::Exists(icon24x24) )
        SetBitmapIcon(wxBitmap(icon24x24, wxBITMAP_TYPE_ANY));
    else {
        std::cout << "Warning: The icon file for object \"" << name_
            << " was not found in the current skin icons"
            << " and the specified name is not an existing filename.";
        SetBitmapIcon(wxBitmap(24,24));
    }
#endif
#endif
    createFunPtr = createFunPtrP;
}

gd::InstructionMetadata & ObjectMetadata::AddCondition(const gd::String & name,
                                       const gd::String & fullname,
                                       const gd::String & description,
                                       const gd::String & sentence,
                                       const gd::String & group,
                                       const gd::String & icon,
                                       const gd::String & smallicon)
{
#if defined(GD_IDE_ONLY)
    gd::String nameWithNamespace = extensionNamespace.empty() ? name : extensionNamespace+name;
    conditionsInfos[nameWithNamespace] = InstructionMetadata(extensionNamespace, nameWithNamespace, fullname, description, sentence, group, icon, smallicon);
    return conditionsInfos[nameWithNamespace];
#endif
}

gd::InstructionMetadata & ObjectMetadata::AddAction(const gd::String & name,
                                       const gd::String & fullname,
                                       const gd::String & description,
                                       const gd::String & sentence,
                                       const gd::String & group,
                                       const gd::String & icon,
                                       const gd::String & smallicon)
{
#if defined(GD_IDE_ONLY)
    gd::String nameWithNamespace = extensionNamespace.empty() ? name : extensionNamespace+name;
    actionsInfos[nameWithNamespace] = InstructionMetadata(extensionNamespace, nameWithNamespace, fullname, description, sentence, group, icon, smallicon);
    return actionsInfos[nameWithNamespace];
#endif
}

gd::ExpressionMetadata & ObjectMetadata::AddExpression(const gd::String & name,
                                       const gd::String & fullname,
                                       const gd::String & description,
                                       const gd::String & group,
                                       const gd::String & smallicon)
{
#if defined(GD_IDE_ONLY)
    //Be careful, objects expression do not have namespace ( not necessary as objects inherits from only one derived object )
    expressionsInfos[name] = ExpressionMetadata(extensionNamespace, name, fullname, description, group, smallicon);
    return expressionsInfos[name];
#endif
}

gd::ExpressionMetadata & ObjectMetadata::AddStrExpression(const gd::String & name,
                                       const gd::String & fullname,
                                       const gd::String & description,
                                       const gd::String & group,
                                       const gd::String & smallicon)
{
#if defined(GD_IDE_ONLY)
    //Be careful, objects expression do not have namespace ( not necessary as objects inherits from only one derived object )
    strExpressionsInfos[name] = ExpressionMetadata(extensionNamespace, name, fullname, description, group, smallicon);
    return strExpressionsInfos[name];
#endif
}

ObjectMetadata & ObjectMetadata::SetFullName(const gd::String & fullname_)
{
#if defined(GD_IDE_ONLY)
    fullname = fullname_;
#endif
    return *this;
}

ObjectMetadata & ObjectMetadata::SetHelpUrl(const gd::String & helpUrl_)
{
#if defined(GD_IDE_ONLY)
    helpUrl = helpUrl_;
#endif
    return *this;
}

ObjectMetadata & ObjectMetadata::SetDescription(const gd::String & description_)
{
#if defined(GD_IDE_ONLY)
    description = description_;
#endif
    return *this;
}

ObjectMetadata & ObjectMetadata::SetBitmapIcon(const wxBitmap & bitmap_)
{
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
    icon = bitmap_;
#endif
    return *this;
}

ObjectMetadata & ObjectMetadata::SetIncludeFile(const gd::String & includeFile)
{
#if defined(GD_IDE_ONLY)
    includeFiles.clear();
    includeFiles.push_back(includeFile);
#endif
    return *this;
}
ObjectMetadata & ObjectMetadata::AddIncludeFile(const gd::String & includeFile)
{
#if defined(GD_IDE_ONLY)
    if ( std::find(includeFiles.begin(), includeFiles.end(), includeFile) == includeFiles.end())
        includeFiles.push_back(includeFile);
#endif
    return *this;
}

}
