/*
 * GDevelop IDE
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License.
 */
#ifndef gdTreeItemProjectData_H
#define gdTreeItemProjectData_H

#include <string>
namespace gd { class Project; }
#include <wx/treectrl.h>

/**
 * \brief Internal IDE class which can be used by wxTreeCtrl, to attach
 * information (two string and/or a pointer to a project) to an item.
 */
class gdTreeItemProjectData : public wxTreeItemData
{
public:
    gdTreeItemProjectData(const std::string & str_, const std::string & str2_ = "", gd::Project * ptr_ = NULL) : str(str_), str2(str2_), ptr(ptr_) { };
    virtual ~gdTreeItemProjectData() {};

    const std::string & GetString() const { return str; }
    const std::string & GetSecondString() const { return str2; }
    gd::Project * GetGamePointer() const { return ptr; }

private:
    std::string     str;
    std::string     str2;
    gd::Project *   ptr;
};

#endif // gdTreeItemProjectData_H

