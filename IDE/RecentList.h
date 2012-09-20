#ifndef RECENTLIST_H_INCLUDED
#define RECENTLIST_H_INCLUDED

#include "wx/wxprec.h"
#ifndef WX_PRECOMP
    #include "wx/wx.h"
#endif


class RecentList
{
public:
    RecentList();
    virtual ~RecentList();
    void Append(const wxString &sValue);
    void SetLastUsed(const wxString &sValue);
    int GetEntryCount();
    int GetMaxEntries();
    wxString GetEntry(int Index);
    void SetMaxEntries(int iNbEntries);
    void SetAssociatedMenu(wxMenu *Menu);
private:
    void UpdateMenu();
    int p_iMax;
    wxArrayString sEntry;
    wxMenu *p_Menu;
};

#endif // RECENTLIST_H_INCLUDED

