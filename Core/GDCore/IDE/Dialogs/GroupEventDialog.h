/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef GROUPEVENTDIALOG_H
#define GROUPEVENTDIALOG_H
#include "GDCoreDialogs.h"
namespace gd { class GroupEvent; }

/**
 * \brief A small dialog used to change a events group properties.
 * \ingroup IDEDialogs
 */
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
#endif
