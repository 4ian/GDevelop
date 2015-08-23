/*
 * GDevelop IDE
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
 */
#ifndef STARTHEREPAGE_H
#define STARTHEREPAGE_H
#include "GDIDEDialogs.h"
class MainFrame;

class StartHerePage : public BaseStartHerePage
{
public:
    StartHerePage(wxWindow* parent, MainFrame & mainEditor);
    virtual ~StartHerePage();

    void Refresh();
    void RefreshNewsUsingUpdateChecker();

private:
	MainFrame & mainEditor; ///< The editor showing the start here page.
protected:
    virtual void OnLastProject1Click(wxHyperlinkEvent& event);
    virtual void OnLastProject2Click(wxHyperlinkEvent& event);
    virtual void OnLastProject3Click(wxHyperlinkEvent& event);
    void RefreshLastProjectBt(wxHyperlinkCtrl * ctrl, wxString index);
};
#endif // STARTHEREPAGE_H
