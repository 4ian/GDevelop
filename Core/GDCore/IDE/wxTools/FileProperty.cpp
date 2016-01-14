/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include <iostream>
#include "FileProperty.h"
#include <wx/filedlg.h>

namespace gd
{

bool FileProperty::OnButtonClick( wxPropertyGrid* propGrid, wxString& value )
{
    wxFileDialog dialog(propGrid->GetPanel(),
                        dialogTitle,
                        basePath,
                        "",
                        wildcard,
                        wxFD_DEFAULT_STYLE,
                        wxDefaultPosition);

    if ( dialog.ShowModal() == wxID_OK )
    {
        wxFileName file = wxFileName::FileName(dialog.GetPath());
        file.MakeRelativeTo(basePath);

        value = file.GetFullPath();
        return true;
    }
    return false;
}

bool FileProperty::DoSetAttribute( const wxString& name, wxVariant& value )
{
    // Return false on some occasions to make sure those attribs will get
    // stored in m_attributes.
    if ( name == wxPG_FILE_WILDCARD )
    {
        wildcard = value.GetString();
    }
    else if ( name == wxPG_FILE_SHOW_RELATIVE_PATH )
    {
        basePath = value.GetString();
    }
    else if ( name == wxPG_FILE_INITIAL_PATH )
    {
        initialPath = value.GetString();
        return true;
    }
    else if ( name == wxPG_FILE_DIALOG_TITLE )
    {
        dialogTitle = value.GetString();
        return true;
    }
    return false;
}

}
#endif
