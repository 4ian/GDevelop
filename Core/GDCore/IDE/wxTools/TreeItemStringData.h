/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef GDCORE_TreeItemStringData_H
#define GDCORE_TreeItemStringData_H

#include "GDCore/String.h"
#include <wx/treectrl.h>

namespace gd
{

/**
 * \brief Tool class which can be used with wxTreeCtrl or others controls to
 * associate one or two strings with items.
 *
 * \ingroup IDE
 * \ingroup wxTools
 */
class GD_CORE_API TreeItemStringData : public wxTreeItemData
{
public:
    TreeItemStringData(const gd::String & str_, const gd::String & str2_ = "") : str(str_), str2(str2_) { };
    virtual ~TreeItemStringData() {};

    const gd::String & GetString() const { return str; }
    const gd::String & GetSecondString() const { return str2; }
    void SetString(gd::String str_) { str = str_; }
    void SetSecondString(gd::String str_) { str2 = str_; }

private:
    gd::String str;
    gd::String str2;
};

}

#endif // GDCORE_TreeItemStringData_H
#endif
