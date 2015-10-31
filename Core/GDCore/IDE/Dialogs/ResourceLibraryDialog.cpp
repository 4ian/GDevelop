/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "ResourceLibraryDialog.h"

//(*InternalHeaders(ResourceLibraryDialog)
#include "GDCore/Tools/Localization.h"
#include <wx/string.h>
//*)
#include <wx/treelist.h>
#include <wx/dir.h>
#include <wx/dcmemory.h>
#include "GDCore/Tools/Log.h"
#include <wx/filename.h>
#include <wx/dnd.h>
#include <iostream>
#include "GDCore/IDE/wxTools/CommonBitmapProvider.h"
#include "GDCore/CommonTools.h"

namespace gd
{

//(*IdInit(ResourceLibraryDialog)
const long ResourceLibraryDialog::ID_STATICTEXT1 = wxNewId();
const long ResourceLibraryDialog::ID_PANEL1 = wxNewId();
const long ResourceLibraryDialog::ID_STATICLINE1 = wxNewId();
const long ResourceLibraryDialog::ID_LISTCTRL1 = wxNewId();
const long ResourceLibraryDialog::ID_STATICTEXT3 = wxNewId();
const long ResourceLibraryDialog::ID_STATICTEXT2 = wxNewId();
const long ResourceLibraryDialog::ID_TEXTCTRL1 = wxNewId();
const long ResourceLibraryDialog::ID_STATICLINE2 = wxNewId();
const long ResourceLibraryDialog::ID_BUTTON1 = wxNewId();
//*)

BEGIN_EVENT_TABLE(ResourceLibraryDialog,wxDialog)
	//(*EventTable(ResourceLibraryDialog)
	//*)
END_EVENT_TABLE()

ResourceLibraryDialog::ResourceLibraryDialog(wxWindow* parent,wxWindowID id,const wxPoint& pos,const wxSize& size)
{
	//(*Initialize(ResourceLibraryDialog)
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer2;
	wxBoxSizer* BoxSizer1;
	wxFlexGridSizer* FlexGridSizer6;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, id, _("Resources library"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER|wxMAXIMIZE_BOX, _T("id"));
	SetClientSize(wxDefaultSize);
	Move(wxDefaultPosition);
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(2);
	FlexGridSizer4 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer4->AddGrowableCol(0);
	FlexGridSizer4->AddGrowableRow(0);
	Panel1 = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	Panel1->SetBackgroundColour(wxColour(255,255,255));
	FlexGridSizer5 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticText1 = new wxStaticText(Panel1, ID_STATICTEXT1, _("Drag images to add them to your project images bank."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer5->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	Panel1->SetSizer(FlexGridSizer5);
	FlexGridSizer5->Fit(Panel1);
	FlexGridSizer5->SetSizeHints(Panel1);
	FlexGridSizer4->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	BoxSizer1 = new wxBoxSizer(wxHORIZONTAL);
	listCtrl = new wxListCtrl(this, ID_LISTCTRL1, wxDefaultPosition, wxSize(454,340), wxLC_ICON, wxDefaultValidator, _T("ID_LISTCTRL1"));
	BoxSizer1->Add(listCtrl, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(BoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer6 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticText3 = new wxStaticText(this, ID_STATICTEXT3, _("Images are copied into the project folder when you drag and drop them in the\nimage bank. You can choose a specific subfolder:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	FlexGridSizer6->Add(StaticText3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer6, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer3->AddGrowableCol(1);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _("Sub folder where copy images:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer3->Add(StaticText2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	insertionFolderEdit = new wxTextCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	insertionFolderEdit->SetToolTip(_("The file is relative to the folder of the project"));
	FlexGridSizer3->Add(insertionFolderEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
	FlexGridSizer1->Add(StaticLine2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	closeBt = new wxButton(this, ID_BUTTON1, _("Close"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer2->Add(closeBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_LISTCTRL1,wxEVT_COMMAND_LIST_BEGIN_DRAG,(wxObjectEventFunction)&ResourceLibraryDialog::OnlistCtrlBeginDrag);
	Connect(ID_LISTCTRL1,wxEVT_COMMAND_LIST_ITEM_ACTIVATED,(wxObjectEventFunction)&ResourceLibraryDialog::OnlistCtrlItemActivated);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ResourceLibraryDialog::OncloseBtClick);
	//*)

    currentDir = wxGetCwd()+"/Free resources";
    ConstructList();
}

ResourceLibraryDialog::~ResourceLibraryDialog()
{
	//(*Destroy(ResourceLibraryDialog)
	//*)
}

namespace { //Some private tools functions

wxBitmap Rescale(wxBitmap bmp, int max_width, int max_height) {

    float xFactor = max_width/static_cast<float>(bmp.GetWidth());
    float yFactor = max_height/static_cast<float>(bmp.GetHeight());
    float factor = std::min(xFactor, yFactor);
    if ( factor > 1 ) factor = 1;

    wxImage img = bmp.ConvertToImage();
    wxBitmap result = wxBitmap(img.Rescale((int)(bmp.GetWidth()*factor), (int)(bmp.GetHeight()*factor), wxIMAGE_QUALITY_HIGH));

    wxBitmap result2(max_width,max_height);
    {
        wxMemoryDC dc;
        dc.SelectObject(result2);
        dc.SetBrush(*wxWHITE_BRUSH);
        dc.Clear();
        dc.DrawBitmap(result, 0,0);
    }

    return result2; // finally, return the resized bitmap
}

void PasteBitmap(wxBitmap & srcBmp, wxBitmap pastedBmp, int x, int y)
{
    wxMemoryDC dc;
    dc.SelectObject(srcBmp);
    dc.DrawBitmap(pastedBmp, x,y, true);
}

}

void ResourceLibraryDialog::ConstructList()
{
    wxLogNull noLogPlease;
    listCtrl->ClearAll();

    wxImageList * imageList = new wxImageList(40,40);
    imageList->Add(gd::CommonBitmapProvider::Get()->parentFolder40);

    //If we are in the root path, do not display Parent folder item
    wxFileName currentDirPath(currentDir);
    currentDirPath.Normalize();
    wxFileName rootPath(wxGetCwd()+"/Free resources/");
    rootPath.Normalize();
    if ( currentDirPath.GetFullPath() != rootPath.GetFullPath() )
        listCtrl->InsertItem(0, _("Parent folder"), 0);

    //Browse file and directories
    wxDir dir(currentDir);
    wxString filename;
    bool cont = dir.GetFirst(&filename, "", wxDIR_DEFAULT);
    while ( cont )
    {
        if ( wxDirExists(currentDir+"/"+filename) )
        {
            //Only add a directory if there is a GDLibrary.txt file inside it.
            if ( wxFileExists(currentDir+"/"+filename+"/GDLibrary.txt") )
            {
                wxBitmap folderBmp = gd::CommonBitmapProvider::Get()->folder40;
                if ( wxFileExists(currentDir+"/"+filename+"/GDLibraryIcon.png") )
                    PasteBitmap(folderBmp, wxBitmap(currentDir+"/"+filename+"/GDLibraryIcon.png", wxBITMAP_TYPE_ANY), 20,20 );

                imageList->Add(folderBmp);
                listCtrl->InsertItem(1, filename, imageList->GetImageCount()-1);
            }
        }
        else
        {
            //Do not display the library icon
            if ( filename != "GDLibraryIcon.png" )
            {
                wxLogNull noLogPlease;

                wxBitmap bmp(currentDir+"/"+filename, wxBITMAP_TYPE_ANY);
                if ( bmp.IsOk() )
                {
                    wxBitmap resizedBmp = Rescale(bmp,40,40);
                    imageList->Add(resizedBmp);
                    listCtrl->InsertItem(listCtrl->GetItemCount(), filename, imageList->GetImageCount()-1);
                }
            }
        }


        cont = dir.GetNext(&filename);
    }
    listCtrl->AssignImageList(imageList, wxIMAGE_LIST_NORMAL);
}

void ResourceLibraryDialog::OnlistCtrlItemActivated(wxListEvent& event)
{
    if ( event.GetLabel() == _("Parent folder") && event.GetIndex() == 0 )
    {
        wxFileName dir = wxFileName::DirName(currentDir+"/..");
        currentDir = dir.GetPath();
        ConstructList();
    }
    else if (wxDirExists(currentDir+"/"+event.GetLabel()))
    {
        wxFileName filename = wxFileName::FileName(currentDir+"/"+event.GetLabel());
        filename.Normalize();
        currentDir = filename.GetFullPath();
        ConstructList();
    }
}

void ResourceLibraryDialog::OncloseBtClick(wxCommandEvent& event)
{
    Hide();
}

void ResourceLibraryDialog::OnlistCtrlBeginDrag(wxListEvent& event)
{
    wxString fullList = "COPYANDADDRESOURCES;"+insertionFolderEdit->GetValue()+";"; //The resource editor is expecting a specifically formatted string
    long itemIndex = -1;

    for (;;)
    {
        itemIndex = listCtrl->GetNextItem(itemIndex,  wxLIST_NEXT_ALL, wxLIST_STATE_SELECTED);
        if (itemIndex == -1) break;

        if ( (listCtrl->GetItemText(itemIndex) == _("Parent folder") && itemIndex == 0) || wxDirExists(currentDir+"/"+listCtrl->GetItemText(itemIndex)) )
        {
            //Folder: Do nothing
        }
        else
            fullList += currentDir+"/"+listCtrl->GetItemText(itemIndex)+";";
    }

    wxTextDataObject data(fullList);
    wxDropSource dragSource( this );
    dragSource.SetData( data );
    dragSource.DoDragDrop( true );
}

}
#endif
