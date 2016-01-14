/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef GDCORE_FILEPROPERTY_H
#define GDCORE_FILEPROPERTY_H
#include <wx/control.h>
#include <wx/propgrid/propgrid.h>
#include <wx/propgrid/props.h>
#include <wx/propgrid/property.h>

namespace gd
{

/**
 * \brief Property for wxPropertyGrid displaying its value with a button triggering a file selector.
 *
 * Compared to wxFileProperty, this class allows to use relative filenames: If a base path is specified
 * ( property->SetAttribute(wxPG_FILE_SHOW_RELATIVE_PATH, myBasePath) ), the value returned by the file
 * selector will be relative to this path.
 *
 * Supports wxPG_FILE_WILDCARD, wxPG_FILE_SHOW_RELATIVE_PATH, wxPG_FILE_INITIAL_PATH, wxPG_FILE_DIALOG_TITLE attributes.
 *
 * \ingroup IDE
 * \ingroup wxTools
 */
class GD_CORE_API FileProperty : public wxLongStringProperty
{
public:
    FileProperty(const wxString& label = wxPG_LABEL,
                 const wxString& name = wxPG_LABEL,
                 const wxString& value = wxEmptyString )
        : wxLongStringProperty(label, name, value)
    {};
    virtual ~FileProperty() {};

    virtual bool DoSetAttribute( const wxString& name, wxVariant& value );
    virtual bool OnButtonClick( wxPropertyGrid* propGrid, wxString& value );

private:
    wxString basePath;
    wxString initialPath;
    wxString wildcard;
    wxString dialogTitle;
};

}

#endif // GDCORE_FILEPROPERTY_H
#endif
