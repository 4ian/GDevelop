/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef PROFILEDLG_H
#define PROFILEDLG_H

//(*Headers(ProfileDlg)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/menu.h>
#include <wx/checkbox.h>
#include <wx/panel.h>
//*)
#include <vector>
#include <deque>
#include "GDCore/Events/Event.h"
#include "GDCpp/IDE/BaseProfiler.h"
class CppLayoutPreviewer;

class GD_API ProfileDlg: public wxPanel, public BaseProfiler
{
public:

    ProfileDlg(wxWindow* parent, CppLayoutPreviewer & associatedCppLayoutPreviewer);
    virtual ~ProfileDlg();

    void ParseProfileEvents();

    //(*Declarations(ProfileDlg)
    wxStaticText* scaleMidTxt;
    wxStaticText* scaleMaxTxt;
    wxMenuItem* MenuItem2;
    wxStaticText* eventsTimeTxt;
    wxMenuItem* objectsCountCheck;
    wxMenu* MenuItem3;
    wxMenuItem* MenuItem1;
    wxCheckBox* activateCheck;
    wxMenuItem* eventsTimeCheck;
    wxPanel* Panel1;
    wxPanel* ratioGraphics;
    wxMenuItem* totalTimeCheck;
    wxPanel* Panel3;
    wxStaticText* objectsCountTxt;
    wxMenu contextMenu;
    wxStaticText* totalTimeTxt;
    wxMenuItem* infiniteDataCheck;
    wxPanel* Panel2;
    //*)
protected:

    //(*Identifiers(ProfileDlg)
    static const long ID_CHECKBOX1;
    static const long ID_STATICTEXT8;
    static const long ID_STATICTEXT9;
    static const long ID_PANEL1;
    static const long ID_PANEL2;
    static const long ID_STATICTEXT2;
    static const long ID_PANEL3;
    static const long ID_STATICTEXT1;
    static const long ID_PANEL4;
    static const long ID_STATICTEXT3;
    static const long ID_MENUITEM1;
    static const long ID_MENUITEM3;
    static const long ID_MENUITEM2;
    //*)

private:

    //(*Handlers(ProfileDlg)
    void OnratioGraphicsPaint(wxPaintEvent& event);
    void OnapplyBtClick(wxCommandEvent& event);
    void OnratioGraphicsResize(wxSizeEvent& event);
    void OnratioGraphicsRightUp(wxMouseEvent& event);
    void OnChangeDurationSelected(wxCommandEvent& event);
    void OnStepTimeSelected(wxCommandEvent& event);
    void OnactivateCheckClick(wxCommandEvent& event);
    //*)

    DECLARE_EVENT_TABLE()

    void ParseProfileEvents(const std::vector < gd::BaseEventSPtr > & events);
    void UpdateGUI();

    std::size_t maxData;
    std::deque <unsigned long int> eventsData;
    std::deque <unsigned long int> totalTimeData;
    std::deque <std::size_t> objectsCountData;

    CppLayoutPreviewer & sceneCanvas;
};

#endif
#endif
