/*
 * Game Develop JS Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef UPLOADONLINEDIALOG_H
#define UPLOADONLINEDIALOG_H
#include "GDJSDialogs.h"

/**
 * \brief Dialog used to upload a game to www.gamedevshare.com
 */
class UploadOnlineDialog : public BaseUploadOnlineDialog
{
public:
    UploadOnlineDialog(wxWindow* parent, wxString gameName, wxString packageLocation);
    virtual ~UploadOnlineDialog();
protected:
    virtual void OnCloseBtClicked(wxCommandEvent& event);
};
#endif // UPLOADONLINEDIALOG_H
#endif