#ifndef GROUPEVENTDIALOG_H
#define GROUPEVENTDIALOG_H
#include "GDCoreDialogs.h"
namespace gd { class GroupEvent; }

class GroupEventDialog : public BaseGroupEventDialog
{
public:
    GroupEventDialog(wxWindow* parent, gd::GroupEvent & event);
    virtual ~GroupEventDialog();
protected:
    virtual void onCancelBtClick(wxCommandEvent& event);
    virtual void onChooseBackgroundBtClick(wxCommandEvent& event);
    virtual void onOkBtClick(wxCommandEvent& event);

    gd::GroupEvent & event;
};
#endif // GROUPEVENTDIALOG_H
