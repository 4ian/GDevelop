/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef GDCORE_TreeItemExpressionMetadata_H
#define GDCORE_TreeItemExpressionMetadata_H
#include "GDCore/Events/ExpressionMetadata.h"
#include <string>
#include <wx/treectrl.h>

namespace gd
{


/**
 * \brief Internal class used by gd::EditExpressionDialog and gd::EditStrExpressionDialog.
 *
 * This class can be used by wxTreeCtrl, to attach information
 * (a gd::ExpressionMetadata and the name of the expression) to an item.
 *
 * \see gd::EditExpressionDialog
 * \see gd::EditStrExpressionDialog
 */
class GD_CORE_API TreeItemExpressionMetadata : public wxTreeItemData
{
public:
    TreeItemExpressionMetadata(const std::string & name_, const gd::ExpressionMetadata & info_) : name(name_), info(info_) { };
    virtual ~TreeItemExpressionMetadata() {};

    const std::string & GetName() const { return name; }
    const gd::ExpressionMetadata & GetExpressionMetadata() const { return info; }

private:
    std::string name;
    gd::ExpressionMetadata info;
};

}

#endif // GDCORE_TreeItemExpressionMetadata_H
#endif
