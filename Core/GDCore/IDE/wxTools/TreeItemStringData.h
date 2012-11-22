/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef GDCORE_TreeItemStringData_H
#define GDCORE_TreeItemStringData_H

#include <string>
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
    TreeItemStringData(const std::string & str_, const std::string & str2_ = "") : str(str_), str2(str2_) { };
    virtual ~TreeItemStringData() {};

    const std::string & GetString() const { return str; }
    const std::string & GetSecondString() const { return str2; }
    void SetString(std::string str_) { str = str_; }
    void SetSecondString(std::string str_) { str2 = str_; }

private:
    std::string str;
    std::string str2;
};

}

#endif // GDCORE_TreeItemStringData_H


