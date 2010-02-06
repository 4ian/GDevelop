#ifndef GDTREEITEMSTRINGDATA_H
#define GDTREEITEMSTRINGDATA_H

#include <string>
#include <wx/treectrl.h>

class gdTreeItemStringData : public wxTreeItemData
{
public:
    gdTreeItemStringData(const std::string & str_) : str(str_), str2("") { };
    gdTreeItemStringData(const std::string & str_, const std::string & str2_) : str(str_), str2(str2_) { };
    virtual ~gdTreeItemStringData() {};

    const std::string & GetString() const { return str; }
    const std::string & GetSecondString() const { return str2; }

private:
    std::string str;
    std::string str2;
};

#endif // GDTREEITEMSTRINGDATA_H
