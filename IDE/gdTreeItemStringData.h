#ifndef GDTREEITEMSTRINGDATA_H
#define GDTREEITEMSTRINGDATA_H

#include <string>
#include <wx/treectrl.h>

class gdTreeItemStringData : public wxTreeItemData
{
public:
    gdTreeItemStringData(const std::string & str_) : str(str_) { };
    virtual ~gdTreeItemStringData() {};

    const std::string & GetString() const { return str; }

private:
    std::string str;
};

#endif // GDTREEITEMSTRINGDATA_H
