#ifndef GDTREEITEMGAMEDATA_H
#define GDTREEITEMGAMEDATA_H

#include <string>
class Game;
#include <wx/treectrl.h>

/**
 * This class can be used by wxTreeCtrl, to attach
 * information ( two string and a pointer to a game ) to an item
 */
class gdTreeItemGameData : public wxTreeItemData
{
public:
    gdTreeItemGameData(const std::string & str_, const std::string & str2_ = "", Game * ptr_ = NULL) : str(str_), str2(str2_), ptr(ptr_) { };
    virtual ~gdTreeItemGameData() {};

    const std::string & GetString() const { return str; }
    const std::string & GetSecondString() const { return str2; }
    Game * GetGamePointer() const { return ptr; }

private:
    std::string str;
    std::string str2;
    Game *      ptr;
};

#endif // GDTREEITEMGAMEDATA_H

