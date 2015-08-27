/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "GDCore/Tools/Localization.h"
//(*InternalHeaders(SpriteObjectEditor)
#include <wx/bitmap.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/settings.h>
#include <wx/dcclient.h>
#include <wx/dcmemory.h>
#include <wx/dcbuffer.h>
#include <wx/richtooltip.h>
#include <wx/config.h>
#include <wx/textdlg.h>
#include <wx/msgdlg.h>
#include <wx/filedlg.h>
#include <vector>
#include <algorithm>
#include "GDCore/Tools/Log.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/IDE/CommonBitmapManager.h"
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/IDE/SkinHelper.h"
#include "GDCore/IDE/wxTools/TreeItemStringData.h"
#include "GDCore/PlatformDefinition/ResourcesManager.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/IDE/Dialogs/ResourcesEditor.h"
#include "GDCore/CommonTools.h"
#include "GDCore/BuiltinExtensions/SpriteExtension/SpriteObject.h"
#include "GDCore/BuiltinExtensions/SpriteExtension/Animation.h"
#include "GDCore/BuiltinExtensions/SpriteExtension/Direction.h"
#include "SpriteObjectEditor.h"
#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#include <wx/msw/uxtheme.h>
#endif
namespace gd { class MainFrameWrapper; }

using namespace std;

namespace { //Some private tools functions

wxBitmap Rescale(wxBitmap bmp, int max_width, int max_height) {

    if ( !bmp.IsOk() ) return bmp;

    float xFactor = max_width/static_cast<float>(bmp.GetWidth());
    float yFactor = max_height/static_cast<float>(bmp.GetHeight());
    float factor = std::min(xFactor, yFactor);
    if ( factor > 1 ) factor = 1;

    wxImage img = bmp.ConvertToImage();
    wxBitmap result = wxBitmap(img.Rescale((int)(bmp.GetWidth()*factor), (int)(bmp.GetHeight()*factor), wxIMAGE_QUALITY_HIGH));

    wxBitmap resizedBitmap(max_width,max_height);
    {
        wxMemoryDC dc;
        dc.SelectObject(resizedBitmap);
        dc.SetBrush(*wxWHITE_BRUSH);
        dc.Clear();
        dc.DrawBitmap(result, 0,0, true);
    }

    return resizedBitmap;
}

}

namespace gd {

//(*IdInit(SpriteObjectEditor)
const long SpriteObjectEditor::ID_MASKITEM = wxNewId();
const long SpriteObjectEditor::ID_POINTSITEM = wxNewId();
const long SpriteObjectEditor::ID_AUITOOLBARITEM4 = wxNewId();
const long SpriteObjectEditor::ID_AUITOOLBARITEM2 = wxNewId();
const long SpriteObjectEditor::ID_AUITOOLBAR1 = wxNewId();
const long SpriteObjectEditor::ID_PANEL6 = wxNewId();
const long SpriteObjectEditor::ID_PANEL4 = wxNewId();
const long SpriteObjectEditor::ID_SCROLLBAR1 = wxNewId();
const long SpriteObjectEditor::ID_SCROLLBAR2 = wxNewId();
const long SpriteObjectEditor::ID_STATICTEXT1 = wxNewId();
const long SpriteObjectEditor::ID_PANEL1 = wxNewId();
const long SpriteObjectEditor::ID_AUITOOLBARITEM5 = wxNewId();
const long SpriteObjectEditor::ID_AUITOOLBARITEM8 = wxNewId();
const long SpriteObjectEditor::ID_TOOLLOOP = wxNewId();
const long SpriteObjectEditor::ID_AUITOOLBARITEM10 = wxNewId();
const long SpriteObjectEditor::ID_AUITOOLBAR4 = wxNewId();
const long SpriteObjectEditor::ID_PANEL11 = wxNewId();
const long SpriteObjectEditor::ID_TREECTRL1 = wxNewId();
const long SpriteObjectEditor::ID_PANEL3 = wxNewId();
const long SpriteObjectEditor::ID_LISTCTRL1 = wxNewId();
const long SpriteObjectEditor::ID_PANEL2 = wxNewId();
const long SpriteObjectEditor::ID_AUITOOLBARITEM9 = wxNewId();
const long SpriteObjectEditor::ID_AUITOOLBARITEM11 = wxNewId();
const long SpriteObjectEditor::ID_AUITOOLBARITEM7 = wxNewId();
const long SpriteObjectEditor::ID_AUITOOLBARITEM1 = wxNewId();
const long SpriteObjectEditor::ID_MASKAPPLYWHOLEANIMITEM = wxNewId();
const long SpriteObjectEditor::ID_AUITOOLBAR3 = wxNewId();
const long SpriteObjectEditor::ID_PANEL9 = wxNewId();
const long SpriteObjectEditor::ID_TREELISTCTRL1 = wxNewId();
const long SpriteObjectEditor::ID_PANEL8 = wxNewId();
const long SpriteObjectEditor::ID_AUITOOLBARITEM3 = wxNewId();
const long SpriteObjectEditor::ID_DELETEPOINTITEM = wxNewId();
const long SpriteObjectEditor::ID_POINTAPPLYWHOLEANIMITEM = wxNewId();
const long SpriteObjectEditor::ID_AUITOOLBAR2 = wxNewId();
const long SpriteObjectEditor::ID_PANEL7 = wxNewId();
const long SpriteObjectEditor::ID_LISTCTRL3 = wxNewId();
const long SpriteObjectEditor::ID_PANEL5 = wxNewId();
const long SpriteObjectEditor::ID_PANEL10 = wxNewId();
const long SpriteObjectEditor::ID_MENUITEM5 = wxNewId();
const long SpriteObjectEditor::ID_MENUITEM6 = wxNewId();
const long SpriteObjectEditor::ID_MENUITEM4 = wxNewId();
const long SpriteObjectEditor::ID_MENUTIMEBETWEENFRAMES = wxNewId();
const long SpriteObjectEditor::ID_MENULOOP = wxNewId();
const long SpriteObjectEditor::ID_MENUITEM1 = wxNewId();
const long SpriteObjectEditor::ID_MENUITEM2 = wxNewId();
const long SpriteObjectEditor::ID_MENUITEM3 = wxNewId();
const long SpriteObjectEditor::ID_MENUITEM7 = wxNewId();
const long SpriteObjectEditor::ID_MENUITEM11 = wxNewId();
const long SpriteObjectEditor::ID_MENUITEM8 = wxNewId();
const long SpriteObjectEditor::ID_MENUITEM9 = wxNewId();
const long SpriteObjectEditor::ID_MENUITEM10 = wxNewId();
const long SpriteObjectEditor::ID_POSITIONMASKITEM = wxNewId();
const long SpriteObjectEditor::ID_MOVEPOLYGONITEM = wxNewId();
const long SpriteObjectEditor::ID_MENUITEM14 = wxNewId();
const long SpriteObjectEditor::ID_TIMER1 = wxNewId();
const long SpriteObjectEditor::ID_MENUITEM12 = wxNewId();
const long SpriteObjectEditor::ID_MENUITEM13 = wxNewId();
//*)

BEGIN_EVENT_TABLE(SpriteObjectEditor,wxDialog)
	//(*EventTable(SpriteObjectEditor)
	//*)
END_EVENT_TABLE()

SpriteObjectEditor::SpriteObjectEditor(wxWindow* parent, gd::Project & game_, SpriteObject & object_, gd::MainFrameWrapper & mainFrameWrapper_) :
    game(game_),
    object(object_),
    selectedAnimation(0),
    selectedDirection(0),
    selectedImage(0),
    spritePosX(0),
    spritePosY(0),
    editingMask(false),
    editingPoint(false),
    deletingMaskTreeItems(false),
    polygonEditionHelper(),
    previewElapsedTime(0),
    previewCurrentSprite(0),
    mainFrameWrapper(mainFrameWrapper_)
{
	//(*Initialize(SpriteObjectEditor)
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer7;
	wxFlexGridSizer* FlexGridSizer8;
	wxFlexGridSizer* FlexGridSizer6;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, _("Edit the Sprite object"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER|wxMAXIMIZE_BOX, _T("wxID_ANY"));
	mgr = new wxAuiManager(this, wxAUI_MGR_DEFAULT);
	centerPanel = new wxPanel(this, ID_PANEL1, wxPoint(107,155), wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	FlexGridSizer3 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer3->AddGrowableCol(0);
	FlexGridSizer3->AddGrowableRow(1);
	FlexGridSizer8 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer8->AddGrowableCol(0);
	FlexGridSizer8->AddGrowableRow(0);
	toolbarPanel = new wxPanel(centerPanel, ID_PANEL6, wxDefaultPosition, wxSize(-1,25), wxTAB_TRAVERSAL, _T("ID_PANEL6"));
	AuiManager1 = new wxAuiManager(toolbarPanel, wxAUI_MGR_DEFAULT);
	toolbar = new wxAuiToolBar(toolbarPanel, ID_AUITOOLBAR1, wxDefaultPosition, wxDefaultSize, wxAUI_TB_DEFAULT_STYLE);
	toolbar->AddTool(ID_MASKITEM, _("Edit the collision masks (hitbox)"), gd::CommonBitmapManager::Get()->maskEdit16, wxNullBitmap, wxITEM_CHECK, _("Edit the collision masks (hitbox)"), wxEmptyString, NULL);
	toolbar->AddTool(ID_POINTSITEM, _("Edit the image\'s point"), gd::CommonBitmapManager::Get()->pointEdit16, wxNullBitmap, wxITEM_CHECK, _("Edit the image\'s point"), wxEmptyString, NULL);
	toolbar->AddSeparator();
	toolbar->AddTool(ID_AUITOOLBARITEM4, _("Preview"), gd::SkinHelper::GetIcon("preview", 16), wxNullBitmap, wxITEM_NORMAL, _("Preview"), wxEmptyString, NULL);
	toolbar->AddSeparator();
	toolbar->AddTool(ID_AUITOOLBARITEM2, _("Help"), gd::SkinHelper::GetIcon("help", 16), wxNullBitmap, wxITEM_NORMAL, _("Preview"), wxEmptyString, NULL);
	toolbar->Realize();
	AuiManager1->AddPane(toolbar, wxAuiPaneInfo().Name(_T("PaneName")).ToolbarPane().Caption(_("Pane caption")).Layer(10).Top().DockFixed().Dockable(false).Movable(false).Gripper(false));
	AuiManager1->Update();
	FlexGridSizer8->Add(toolbarPanel, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3->Add(FlexGridSizer8, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer4 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer4->AddGrowableCol(0);
	FlexGridSizer4->AddGrowableRow(0);
	imagePanel = new wxPanel(centerPanel, ID_PANEL4, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL4"));
	FlexGridSizer4->Add(imagePanel, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	yScrollBar = new wxScrollBar(centerPanel, ID_SCROLLBAR1, wxDefaultPosition, wxDefaultSize, wxSB_VERTICAL, wxDefaultValidator, _T("ID_SCROLLBAR1"));
	yScrollBar->SetScrollbar(0, 1, 10, 1);
	yScrollBar->SetMinSize(wxSize(16,0));
	FlexGridSizer4->Add(yScrollBar, 0, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	xScrollBar = new wxScrollBar(centerPanel, ID_SCROLLBAR2, wxDefaultPosition, wxDefaultSize, wxSB_HORIZONTAL, wxDefaultValidator, _T("ID_SCROLLBAR2"));
	xScrollBar->SetScrollbar(0, 1, 10, 1);
	FlexGridSizer4->Add(xScrollBar, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer7 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer7->AddGrowableCol(0);
	statusTxt = new wxStaticText(centerPanel, ID_STATICTEXT1, wxEmptyString, wxDefaultPosition, wxDefaultSize, wxALIGN_LEFT, _T("ID_STATICTEXT1"));
	FlexGridSizer7->Add(statusTxt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3->Add(FlexGridSizer7, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	centerPanel->SetSizer(FlexGridSizer3);
	FlexGridSizer3->Fit(centerPanel);
	FlexGridSizer3->SetSizeHints(centerPanel);
	mgr->AddPane(centerPanel, wxAuiPaneInfo().Name(_T("centerPane")).DefaultPane().Caption(_("Pane caption")).CaptionVisible(false).Center().DockFixed());
	animationsPanel = new wxPanel(this, ID_PANEL3, wxPoint(352,456), wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL3"));
	FlexGridSizer2 = new wxFlexGridSizer(2, 1, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	FlexGridSizer2->AddGrowableRow(1);
	Panel2 = new wxPanel(animationsPanel, ID_PANEL11, wxDefaultPosition, wxSize(-1,25), wxTAB_TRAVERSAL, _T("ID_PANEL11"));
	AuiManager4 = new wxAuiManager(Panel2, wxAUI_MGR_DEFAULT);
	animationToolbar = new wxAuiToolBar(Panel2, ID_AUITOOLBAR4, wxDefaultPosition, wxDefaultSize, wxAUI_TB_DEFAULT_STYLE);
	animationToolbar->AddTool(ID_AUITOOLBARITEM5, _("Item label"), gd::SkinHelper::GetIcon("add", 16), wxNullBitmap, wxITEM_NORMAL, _("Add an animation"), wxEmptyString, NULL);
	animationToolbar->AddTool(ID_AUITOOLBARITEM8, _("Item label"), gd::SkinHelper::GetIcon("remove", 16), wxNullBitmap, wxITEM_NORMAL, _("Delete an animation"), wxEmptyString, NULL);
	animationToolbar->AddSeparator();
	animationToolbar->AddTool(ID_TOOLLOOP, _("De/activate loop"), wxBitmap(wxImage(_T("res/repeat.png"))), wxNullBitmap, wxITEM_CHECK, _("De/activate loop"), wxEmptyString, NULL);
	animationToolbar->AddTool(ID_AUITOOLBARITEM10, _("Item label"), wxBitmap(wxImage(_T("res/time16.png"))), wxNullBitmap, wxITEM_NORMAL, _("Time between each images"), wxEmptyString, NULL);
	animationToolbar->Realize();
	AuiManager4->AddPane(animationToolbar, wxAuiPaneInfo().Name(_T("PaneName")).ToolbarPane().Caption(_("Pane caption")).Layer(10).Top().DockFixed().Dockable(false).Movable(false).Gripper(false));
	AuiManager4->Update();
	FlexGridSizer2->Add(Panel2, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 0);
	animationsTree = new wxTreeCtrl(animationsPanel, ID_TREECTRL1, wxDefaultPosition, wxDefaultSize, wxTR_HIDE_ROOT|wxTR_DEFAULT_STYLE, wxDefaultValidator, _T("ID_TREECTRL1"));
	animationsTree->SetMinSize(wxSize(200,-1));
	FlexGridSizer2->Add(animationsTree, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	animationsPanel->SetSizer(FlexGridSizer2);
	FlexGridSizer2->Fit(animationsPanel);
	FlexGridSizer2->SetSizeHints(animationsPanel);
	mgr->AddPane(animationsPanel, wxAuiPaneInfo().Name(_T("animationsPane")).DefaultPane().Caption(_("Animations")).CaptionVisible().CloseButton(false).Left());
	imagesPanel = new wxPanel(this, ID_PANEL2, wxPoint(356,449), wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL2"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(0);
	imagesList = new wxListCtrl(imagesPanel, ID_LISTCTRL1, wxDefaultPosition, wxDefaultSize, wxLC_ICON|wxLC_SINGLE_SEL, wxDefaultValidator, _T("ID_LISTCTRL1"));
	imagesList->SetMinSize(wxSize(300,200));
	FlexGridSizer1->Add(imagesList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	imagesPanel->SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(imagesPanel);
	FlexGridSizer1->SetSizeHints(imagesPanel);
	mgr->AddPane(imagesPanel, wxAuiPaneInfo().Name(_T("imagePane")).DefaultPane().Caption(_("Images")).CaptionVisible().CloseButton(false).Bottom());
	maskPanel = new wxPanel(this, ID_PANEL8, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL8"));
	FlexGridSizer6 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer6->AddGrowableCol(0);
	FlexGridSizer6->AddGrowableRow(1);
	Panel3 = new wxPanel(maskPanel, ID_PANEL9, wxDefaultPosition, wxSize(-1,25), wxTAB_TRAVERSAL, _T("ID_PANEL9"));
	AuiManager3 = new wxAuiManager(Panel3, wxAUI_MGR_DEFAULT);
	maskToolbar = new wxAuiToolBar(Panel3, ID_AUITOOLBAR3, wxDefaultPosition, wxDefaultSize, wxAUI_TB_DEFAULT_STYLE);
	maskToolbar->AddTool(ID_AUITOOLBARITEM9, _("Item label"), wxBitmap(wxImage(_T("res/addquad.png"))), wxNullBitmap, wxITEM_NORMAL, wxEmptyString, wxEmptyString, NULL);
	maskToolbar->AddSeparator();
	maskToolbar->AddTool(ID_AUITOOLBARITEM11, _("Item label"), wxBitmap(wxImage(_T("res/addvertice.png"))), wxNullBitmap, wxITEM_NORMAL, wxEmptyString, wxEmptyString, NULL);
	maskToolbar->AddSeparator();
	maskToolbar->AddTool(ID_AUITOOLBARITEM7, _("Item label"), gd::SkinHelper::GetIcon("remove", 16), wxNullBitmap, wxITEM_NORMAL, wxEmptyString, wxEmptyString, NULL);
	maskToolbar->AddSeparator();
	maskToolbar->AddTool(ID_AUITOOLBARITEM1, _("Go back to default mask"), gd::CommonBitmapManager::Get()->defaultMask16, wxNullBitmap, wxITEM_NORMAL, _("Go back to default mask"), wxEmptyString, NULL);
	maskToolbar->AddSeparator();
	maskToolbar->AddTool(ID_MASKAPPLYWHOLEANIMITEM, _("Item label"), gd::SkinHelper::GetIcon("copy", 16), wxNullBitmap, wxITEM_CHECK, wxEmptyString, wxEmptyString, NULL);
	maskToolbar->Realize();
	AuiManager3->AddPane(maskToolbar, wxAuiPaneInfo().Name(_T("PaneName")).ToolbarPane().Caption(_("Pane caption")).Layer(10).Top().DockFixed().Dockable(false).Movable(false).Gripper(false));
	AuiManager3->Update();
	FlexGridSizer6->Add(Panel3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	maskTree = new wxTreeListCtrl(maskPanel,ID_TREELISTCTRL1,wxDefaultPosition,wxDefaultSize,0,_T("ID_TREELISTCTRL1"));
	FlexGridSizer6->Add(maskTree, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	maskPanel->SetSizer(FlexGridSizer6);
	FlexGridSizer6->Fit(maskPanel);
	FlexGridSizer6->SetSizeHints(maskPanel);
	mgr->AddPane(maskPanel, wxAuiPaneInfo().Name(_T("maskPane")).DefaultPane().Caption(_("Collision masks ( Hit boxes )")).CaptionVisible().Right());
	pointsPanel = new wxPanel(this, ID_PANEL5, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL5"));
	FlexGridSizer5 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer5->AddGrowableCol(0);
	FlexGridSizer5->AddGrowableRow(1);
	Panel1 = new wxPanel(pointsPanel, ID_PANEL7, wxDefaultPosition, wxSize(-1,25), wxTAB_TRAVERSAL, _T("ID_PANEL7"));
	AuiManager2 = new wxAuiManager(Panel1, wxAUI_MGR_DEFAULT);
	pointToolbar = new wxAuiToolBar(Panel1, ID_AUITOOLBAR2, wxDefaultPosition, wxDefaultSize, wxAUI_TB_DEFAULT_STYLE);
	pointToolbar->AddTool(ID_AUITOOLBARITEM3, _("Item label"), gd::SkinHelper::GetIcon("add", 16), wxNullBitmap, wxITEM_NORMAL, wxEmptyString, wxEmptyString, NULL);
	pointToolbar->AddTool(ID_DELETEPOINTITEM, _("Item label"), gd::SkinHelper::GetIcon("remove", 16), wxNullBitmap, wxITEM_NORMAL, wxEmptyString, wxEmptyString, NULL);
	pointToolbar->AddSeparator();
	pointToolbar->AddTool(ID_POINTAPPLYWHOLEANIMITEM, _("Apply the changes to the whole animation"), gd::SkinHelper::GetIcon("copy", 16), wxNullBitmap, wxITEM_CHECK, _("Apply changes to the whole animation"), wxEmptyString, NULL);
	pointToolbar->Realize();
	AuiManager2->AddPane(pointToolbar, wxAuiPaneInfo().Name(_T("PaneName")).ToolbarPane().Caption(_("Pane caption")).Layer(10).Top().DockFixed().Dockable(false).Movable(false).Gripper(false));
	AuiManager2->Update();
	FlexGridSizer5->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	pointsList = new wxListCtrl(pointsPanel, ID_LISTCTRL3, wxDefaultPosition, wxDefaultSize, wxLC_REPORT|wxLC_EDIT_LABELS, wxDefaultValidator, _T("ID_LISTCTRL3"));
	FlexGridSizer5->Add(pointsList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	pointsPanel->SetSizer(FlexGridSizer5);
	FlexGridSizer5->Fit(pointsPanel);
	FlexGridSizer5->SetSizeHints(pointsPanel);
	mgr->AddPane(pointsPanel, wxAuiPaneInfo().Name(_T("pointsPane")).DefaultPane().Caption(_("Points")).CaptionVisible().Right());
	previewPanel = new wxPanel(this, ID_PANEL10, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL10"));
	mgr->AddPane(previewPanel, wxAuiPaneInfo().Name(_T("previewPane")).DefaultPane().Caption(_("Preview")).CaptionVisible().Left());
	mgr->Update();
	MenuItem2 = new wxMenu();
	automaticRotationItem = new wxMenuItem(MenuItem2, ID_MENUITEM5, _("Automatic rotation"), wxEmptyString, wxITEM_RADIO);
	MenuItem2->Append(automaticRotationItem);
	multipleDirectionsItem = new wxMenuItem(MenuItem2, ID_MENUITEM6, _("8 Directions"), wxEmptyString, wxITEM_RADIO);
	MenuItem2->Append(multipleDirectionsItem);
	animationsMenu.Append(ID_MENUITEM4, _("Type"), MenuItem2, wxEmptyString);
	MenuItem7 = new wxMenuItem((&animationsMenu), ID_MENUTIMEBETWEENFRAMES, _("Time between each image :"), wxEmptyString, wxITEM_NORMAL);
	animationsMenu.Append(MenuItem7);
	MenuItem8 = new wxMenuItem((&animationsMenu), ID_MENULOOP, _("Loop the animation"), wxEmptyString, wxITEM_CHECK);
	animationsMenu.Append(MenuItem8);
	animationsMenu.AppendSeparator();
	MenuItem1 = new wxMenuItem((&animationsMenu), ID_MENUITEM1, _("Add an animation"), wxEmptyString, wxITEM_NORMAL);
	MenuItem1->SetBitmap(gd::SkinHelper::GetIcon("add", 16));
	animationsMenu.Append(MenuItem1);
	animationsMenu.AppendSeparator();
	deleteItem = new wxMenuItem((&animationsMenu), ID_MENUITEM2, _("Delete"), wxEmptyString, wxITEM_NORMAL);
	deleteItem->SetBitmap(gd::SkinHelper::GetIcon("remove", 16));
	animationsMenu.Append(deleteItem);
	MenuItem3 = new wxMenuItem((&animationsMenu), ID_MENUITEM3, _("Rename"), wxEmptyString, wxITEM_NORMAL);
	animationsMenu.Append(MenuItem3);
	MenuItem4 = new wxMenuItem((&imagesMenu), ID_MENUITEM7, _("Add an image from a file"), wxEmptyString, wxITEM_NORMAL);
	MenuItem4->SetBitmap(gd::SkinHelper::GetIcon("add", 16));
	imagesMenu.Append(MenuItem4);
	MenuItem9 = new wxMenuItem((&imagesMenu), ID_MENUITEM11, _("Add from the image bank"), wxEmptyString, wxITEM_NORMAL);
	imagesMenu.Append(MenuItem9);
	imagesMenu.AppendSeparator();
	removeImageItem = new wxMenuItem((&imagesMenu), ID_MENUITEM8, _("Remove\tDEL"), wxEmptyString, wxITEM_NORMAL);
	imagesMenu.Append(removeImageItem);
	moveLeftItem = new wxMenuItem((&imagesMenu), ID_MENUITEM9, _("Move left\tJ"), wxEmptyString, wxITEM_NORMAL);
	moveLeftItem->SetBitmap(gd::SkinHelper::GetIcon("left", 16));
	imagesMenu.Append(moveLeftItem);
	moveRightItem = new wxMenuItem((&imagesMenu), ID_MENUITEM10, _("Move right\tK"), wxEmptyString, wxITEM_NORMAL);
	moveRightItem->SetBitmap(gd::SkinHelper::GetIcon("right", 16));
	imagesMenu.Append(moveRightItem);
	MenuItem5 = new wxMenuItem((&maskMenu), ID_POSITIONMASKITEM, _("Position"), wxEmptyString, wxITEM_NORMAL);
	maskMenu.Append(MenuItem5);
	maskMenu.AppendSeparator();
	MenuItem6 = new wxMenuItem((&maskMenu), ID_MOVEPOLYGONITEM, _("Move the entire polygon"), wxEmptyString, wxITEM_NORMAL);
	maskMenu.Append(MenuItem6);
	MenuItem12 = new wxMenuItem((&maskMenu), ID_MENUITEM14, _("Rotate the entire polygon"), wxEmptyString, wxITEM_NORMAL);
	maskMenu.Append(MenuItem12);
	previewTimer.SetOwner(this, ID_TIMER1);
	previewTimer.Start(50, false);
	MenuItem10 = new wxMenuItem((&emptyImagesMenu), ID_MENUITEM12, _("Add an image from a file"), wxEmptyString, wxITEM_NORMAL);
	MenuItem10->SetBitmap(gd::SkinHelper::GetIcon("add", 16));
	emptyImagesMenu.Append(MenuItem10);
	MenuItem11 = new wxMenuItem((&emptyImagesMenu), ID_MENUITEM13, _("Add from the image bank"), wxEmptyString, wxITEM_NORMAL);
	emptyImagesMenu.Append(MenuItem11);

	Connect(ID_MASKITEM,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&SpriteObjectEditor::OnMaskEditClick);
	Connect(ID_POINTSITEM,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&SpriteObjectEditor::OnPointEditClick);
	Connect(ID_AUITOOLBARITEM4,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&SpriteObjectEditor::OnPreviewClick);
	Connect(ID_AUITOOLBARITEM2,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&SpriteObjectEditor::OnHelpClick);
	imagePanel->Connect(wxEVT_PAINT,(wxObjectEventFunction)&SpriteObjectEditor::OnimagePanelPaint,0,this);
	imagePanel->Connect(wxEVT_ERASE_BACKGROUND,(wxObjectEventFunction)&SpriteObjectEditor::OnimagePanelEraseBackground,0,this);
	imagePanel->Connect(wxEVT_LEFT_DOWN,(wxObjectEventFunction)&SpriteObjectEditor::OnimagePanelLeftDown,0,this);
	imagePanel->Connect(wxEVT_LEFT_UP,(wxObjectEventFunction)&SpriteObjectEditor::OnimagePanelLeftUp,0,this);
	imagePanel->Connect(wxEVT_MOTION,(wxObjectEventFunction)&SpriteObjectEditor::OnimagePanelMouseMove,0,this);
	imagePanel->Connect(wxEVT_SIZE,(wxObjectEventFunction)&SpriteObjectEditor::OnimagePanelResize,0,this);
	Connect(ID_SCROLLBAR1,wxEVT_SCROLL_TOP|wxEVT_SCROLL_BOTTOM|wxEVT_SCROLL_LINEUP|wxEVT_SCROLL_LINEDOWN|wxEVT_SCROLL_PAGEUP|wxEVT_SCROLL_PAGEDOWN|wxEVT_SCROLL_THUMBTRACK|wxEVT_SCROLL_THUMBRELEASE|wxEVT_SCROLL_CHANGED,(wxObjectEventFunction)&SpriteObjectEditor::OnyScrollBarScroll);
	Connect(ID_SCROLLBAR1,wxEVT_SCROLL_CHANGED,(wxObjectEventFunction)&SpriteObjectEditor::OnyScrollBarScroll);
	Connect(ID_SCROLLBAR2,wxEVT_SCROLL_TOP|wxEVT_SCROLL_BOTTOM|wxEVT_SCROLL_LINEUP|wxEVT_SCROLL_LINEDOWN|wxEVT_SCROLL_PAGEUP|wxEVT_SCROLL_PAGEDOWN|wxEVT_SCROLL_THUMBTRACK|wxEVT_SCROLL_THUMBRELEASE|wxEVT_SCROLL_CHANGED,(wxObjectEventFunction)&SpriteObjectEditor::OnxScrollBarScroll);
	Connect(ID_SCROLLBAR2,wxEVT_SCROLL_CHANGED,(wxObjectEventFunction)&SpriteObjectEditor::OnxScrollBarScroll);
	Connect(ID_AUITOOLBARITEM5,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&SpriteObjectEditor::OnAddAnimationSelected);
	Connect(ID_AUITOOLBARITEM8,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&SpriteObjectEditor::OnDeleteAnimationSelected);
	Connect(ID_TOOLLOOP,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&SpriteObjectEditor::OnToolLoopClick);
	Connect(ID_AUITOOLBARITEM10,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&SpriteObjectEditor::OnTimeBetweenFramesSelected);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_RIGHT_CLICK,(wxObjectEventFunction)&SpriteObjectEditor::OnanimationsTreeItemRightClick);
	Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&SpriteObjectEditor::OnanimationsTreeSelectionChanged);
	Connect(ID_LISTCTRL1,wxEVT_COMMAND_LIST_ITEM_SELECTED,(wxObjectEventFunction)&SpriteObjectEditor::OnimagesListItemSelect);
	Connect(ID_LISTCTRL1,wxEVT_COMMAND_LIST_ITEM_RIGHT_CLICK,(wxObjectEventFunction)&SpriteObjectEditor::OnimagesListItemRClick);
	Connect(ID_LISTCTRL1,wxEVT_COMMAND_LIST_KEY_DOWN,(wxObjectEventFunction)&SpriteObjectEditor::OnimagesListKeyDown);
	Connect(ID_AUITOOLBARITEM9,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&SpriteObjectEditor::OnAddMaskClick);
	Connect(ID_AUITOOLBARITEM11,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&SpriteObjectEditor::OnAddVerticeClick);
	Connect(ID_AUITOOLBARITEM7,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&SpriteObjectEditor::OnDeleteMaskClick);
	Connect(ID_AUITOOLBARITEM1,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&SpriteObjectEditor::OnDefaultMaskClick);
	Connect(ID_MASKAPPLYWHOLEANIMITEM,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&SpriteObjectEditor::OnPointEditClick);
	Connect(ID_AUITOOLBARITEM3,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&SpriteObjectEditor::OnAddPointClick);
	Connect(ID_DELETEPOINTITEM,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&SpriteObjectEditor::OnDeletePointClick);
	Connect(ID_LISTCTRL3,wxEVT_COMMAND_LIST_BEGIN_LABEL_EDIT,(wxObjectEventFunction)&SpriteObjectEditor::OnpointsListBeginLabelEdit);
	Connect(ID_LISTCTRL3,wxEVT_COMMAND_LIST_END_LABEL_EDIT,(wxObjectEventFunction)&SpriteObjectEditor::OnpointsListEndLabelEdit);
	Connect(ID_LISTCTRL3,wxEVT_COMMAND_LIST_ITEM_SELECTED,(wxObjectEventFunction)&SpriteObjectEditor::OnpointsListItemSelect);
	Connect(ID_LISTCTRL3,wxEVT_COMMAND_LIST_ITEM_ACTIVATED,(wxObjectEventFunction)&SpriteObjectEditor::OnpointsListItemActivated);
	previewPanel->Connect(wxEVT_PAINT,(wxObjectEventFunction)&SpriteObjectEditor::OnpreviewPanelPaint,0,this);
	previewPanel->Connect(wxEVT_ERASE_BACKGROUND,(wxObjectEventFunction)&SpriteObjectEditor::OnpreviewPanelEraseBackground,0,this);
	previewPanel->Connect(wxEVT_SIZE,(wxObjectEventFunction)&SpriteObjectEditor::OnpreviewPanelResize,0,this);
	mgr->Connect(wxEVT_AUI_PANE_CLOSE,(wxObjectEventFunction)&SpriteObjectEditor::OnmgrPaneClose,0,this);
	Connect(ID_MENUITEM5,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SpriteObjectEditor::OnautomaticRotationItemSelected);
	Connect(ID_MENUITEM6,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SpriteObjectEditor::OnmultipleDirectionsItemSelected);
	Connect(ID_MENUTIMEBETWEENFRAMES,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SpriteObjectEditor::OnTimeBetweenFramesSelected);
	Connect(ID_MENULOOP,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SpriteObjectEditor::OnMenuLoopSelected);
	Connect(ID_MENUITEM1,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SpriteObjectEditor::OnAddAnimationSelected);
	Connect(ID_MENUITEM2,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SpriteObjectEditor::OnDeleteAnimationSelected);
	Connect(ID_MENUITEM7,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SpriteObjectEditor::OnAddImageFromFileSelected);
	Connect(ID_MENUITEM11,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SpriteObjectEditor::OnAddFromImageBankSelected);
	Connect(ID_MENUITEM8,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SpriteObjectEditor::OnremoveImageItemSelected);
	Connect(ID_MENUITEM9,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SpriteObjectEditor::OnMoveLeftSelected);
	Connect(ID_MENUITEM10,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SpriteObjectEditor::OnMoveRightSelected);
	Connect(ID_POSITIONMASKITEM,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SpriteObjectEditor::OnPositionMaskSelected);
	Connect(ID_MOVEPOLYGONITEM,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SpriteObjectEditor::OnMovePolygonSelected);
	Connect(ID_MENUITEM14,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SpriteObjectEditor::OnRotatePolygonSelected);
	Connect(ID_TIMER1,wxEVT_TIMER,(wxObjectEventFunction)&SpriteObjectEditor::OnpreviewTimerTrigger);
	Connect(ID_MENUITEM12,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SpriteObjectEditor::OnAddImageFromFileSelected);
	Connect(ID_MENUITEM13,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SpriteObjectEditor::OnAddFromImageBankSelected);
	//*)
	imagesList->Connect(wxEVT_RIGHT_UP,(wxObjectEventFunction)&SpriteObjectEditor::OnimagesListRightClick,0,this);
	Connect(ID_TREELISTCTRL1,wxEVT_COMMAND_TREELIST_ITEM_ACTIVATED,(wxObjectEventFunction)&SpriteObjectEditor::OnmaskTreeItemActivated);
	Connect(ID_TREELISTCTRL1,wxEVT_COMMAND_TREELIST_ITEM_CONTEXT_MENU,(wxObjectEventFunction)&SpriteObjectEditor::OnmaskTreeItemRClick);
	Connect(ID_TREELISTCTRL1,wxEVT_COMMAND_TREELIST_SELECTION_CHANGED,(wxObjectEventFunction)&SpriteObjectEditor::OnmaskTreeSelectionChanged);
    Connect(ID_SCROLLBAR1,wxEVT_SCROLL_THUMBTRACK,(wxObjectEventFunction)&SpriteObjectEditor::OnyScrollBarScroll);
    Connect(ID_SCROLLBAR2,wxEVT_SCROLL_THUMBTRACK,(wxObjectEventFunction)&SpriteObjectEditor::OnxScrollBarScroll);

    wxImageList * iconList = new wxImageList(16,16);
    iconList->Add(gd::CommonBitmapManager::Get()->pointEdit16);
    pointsList->AssignImageList(iconList, wxIMAGE_LIST_SMALL);
    pointsList->InsertColumn(0, _("Name"));
    pointsList->InsertColumn(1, _("X"), wxLIST_FORMAT_LEFT, 35);
    pointsList->InsertColumn(2, _("Y"), wxLIST_FORMAT_LEFT, 35);

    wxImageList * maskIconList = new wxImageList(16,16);
    maskIconList->Add(wxBitmap("res/triangle.png",wxBITMAP_TYPE_ANY));
    maskIconList->Add(wxBitmap("res/rectangle.png",wxBITMAP_TYPE_ANY));
    maskIconList->Add(wxBitmap("res/polygon.png",wxBITMAP_TYPE_ANY));
    maskIconList->Add(wxBitmap("res/vertice.png",wxBITMAP_TYPE_ANY));
    maskIconList->Add(wxBitmap("res/warning.png",wxBITMAP_TYPE_ANY));
    maskTree->AssignImageList(maskIconList);
    maskTree->AppendColumn(_("Shape"));
    maskTree->AppendColumn(_("X"), 35);
    maskTree->AppendColumn(_("Y"), 35);

    maskToolbar->ToggleTool(ID_MASKAPPLYWHOLEANIMITEM, true);
    pointToolbar->ToggleTool(ID_POINTAPPLYWHOLEANIMITEM, true);

    resourcesEditorPnl = new ResourcesEditor( this, game, mainFrameWrapper );
    resourcesEditorPnl->Refresh();
    mgr->AddPane( resourcesEditorPnl, wxAuiPaneInfo().Name( "ResourcesEditor" ).Right().CloseButton( false ).Caption( _( "Images bank's editor" ) ).MaximizeButton( true ).MinimizeButton( false ).CaptionVisible(true).MinSize(50, 50).BestSize(230,100).Show(true) );

    #if defined(__WXMSW__) //Offer nice look to controls
    wxUxThemeEngine* theme =  wxUxThemeEngine::GetIfActive();
    if(theme) theme->SetWindowTheme((HWND) animationsTree->GetHWND(), L"EXPLORER", NULL);
    if(theme) theme->SetWindowTheme((HWND) imagesList->GetHWND(), L"EXPLORER", NULL);
    #endif

    statusTxt->SetLabel(_("Drag an image from the image bank to the area below to add it to the animation."));

    imagesList->SetDropTarget(new DndTextSpriteObjectEditor(*this));

    animationsMenu.Delete(ID_MENUITEM3); //Rename option is unimplemented for now

    //Add a default animation if the object has none.
    if ( object.HasNoAnimations() )
    {
        Animation newAnimation;
        newAnimation.SetDirectionsCount(1);
        object.AddAnimation(newAnimation);
    }

    //Offer nice background color to toolbar area.
    AuiManager1->GetArtProvider()->SetColour(wxAUI_DOCKART_BACKGROUND_COLOUR, wxSystemSettings::GetColour(wxSYS_COLOUR_MENU));
    gd::SkinHelper::ApplyCurrentSkin(*mgr);
    gd::SkinHelper::ApplyCurrentSkin(*toolbar);
    gd::SkinHelper::ApplyCurrentSkin(*animationToolbar);
    gd::SkinHelper::ApplyCurrentSkin(*pointToolbar);

	RefreshAll();

	//Load perspective
	mgr->GetPane(imagesPanel).MinSize(400,150).Show(true);
	mgr->GetPane(resourcesEditorPnl).MinSize(200,150).Show(true);
	mgr->GetPane(animationsPanel).MinSize(200,75).Show(true);
	mgr->GetPane(maskPanel).MinSize(200,150).Show(false).Float();
	mgr->GetPane(pointsPanel).MinSize(200,150).Show(false).Float();
	mgr->GetPane(previewPanel).MinSize(150,150).Show(false).Float();
    wxString perspective;
	wxConfigBase::Get()->Read("/SpriteObjectEditor/LastWorkspace", &perspective);
	mgr->LoadPerspective(perspective);

	//Ensure some options remains whatever the perspective loaded
	mgr->GetPane(imagesPanel).Dock();
	mgr->GetPane(resourcesEditorPnl).Dock();
	mgr->GetPane(animationsPanel).Dock();
	mgr->GetPane(maskPanel).Show(false);
	mgr->GetPane(pointsPanel).Show(false);
	mgr->GetPane(previewPanel).Show(false);
	#if !defined(WINDOWS)
	mgr->GetPane(maskPanel).Dock(); //On linux, floating panes are somewhat freezed
	mgr->GetPane(pointsPanel).Dock(); //so be sure to dock them by default so that
	mgr->GetPane(previewPanel).Dock(); //they are usable.
	#endif
	mgr->Update();
	Layout();
	SetSize(900,600);

	toolbar->Realize(); //Toolbars need to be realized again under Linux.
	animationToolbar->Realize();
	maskToolbar->Realize();
	pointToolbar->Realize();
	resourcesEditorPnl->toolbar->Realize();
}

void SpriteObjectEditor::OnimagesListRightClick(wxMouseEvent& event)
{
    PopupMenu(&emptyImagesMenu);
}

void SpriteObjectEditor::RefreshAll()
{
    RefreshAnimationTree();
    RefreshAnimationToolbar();
    RefreshImagesList();
    RefreshImageAndControls();
}

void SpriteObjectEditor::RefreshAnimationTree()
{
    wxImageList * iconList = new wxImageList(16,16);
    animationsTree->AssignImageList(iconList);
    iconList->Add(gd::CommonBitmapManager::Get()->animation16);
    iconList->Add(gd::CommonBitmapManager::Get()->rightdir16);
    iconList->Add(gd::CommonBitmapManager::Get()->rightdowndir16);
    iconList->Add(gd::CommonBitmapManager::Get()->downdir16);
    iconList->Add(gd::CommonBitmapManager::Get()->leftdowndir16);
    iconList->Add(gd::CommonBitmapManager::Get()->leftdir16);
    iconList->Add(gd::CommonBitmapManager::Get()->leftupdir16);
    iconList->Add(gd::CommonBitmapManager::Get()->updir16);
    iconList->Add(gd::CommonBitmapManager::Get()->rightupdir16);

    animationsTree->DeleteAllItems();
    wxTreeItemId root = animationsTree->AddRoot(_("All animations"));
    for (std::size_t i = 0;i<object.GetAnimationsCount();++i)
    {
        Animation & animation = object.GetAnimation(i);
        wxTreeItemId animationItem = animationsTree->AppendItem(root, _("Animation ") + gd::String::From(i), 0, -1,
        	new gd::TreeItemStringData(gd::String::From(i), ""));

        if ( animation.useMultipleDirections )
        {
            for (std::size_t j = 0;j<animation.GetDirectionsCount();++j)
            {
                animationsTree->AppendItem(animationItem, _("Direction ")+gd::String::From(j), j+1, -1,
                	new gd::TreeItemStringData(gd::String::From(i), gd::String::From(j)));

            }
        }

        if ( selectedAnimation == i ) animationsTree->SetFocusedItem(animationItem);
    }
}

void SpriteObjectEditor::RefreshImagesList()
{
    imagesList->DeleteAllItems();

    wxImageList * thumbnailList = new wxImageList(48,48);
    imagesList->AssignImageList(thumbnailList, wxIMAGE_LIST_NORMAL);

    if ( selectedAnimation < object.GetAnimationsCount() &&
         selectedDirection < object.GetAnimation(selectedAnimation).GetDirectionsCount() )
    {
        const Direction & direction = object.GetAnimation(selectedAnimation).GetDirection(selectedDirection);
        for (std::size_t i = 0;i<direction.GetSpritesCount();++i)
        {
            const Sprite & sprite = direction.GetSprite(i);
            wxBitmap spriteBitmap;
            if ( game.GetResourcesManager().HasResource(sprite.GetImageName()) )
            {
                spriteBitmap = GetwxBitmapFromImageResource(game.GetResourcesManager().GetResource(sprite.GetImageName()));
                spriteBitmap = Rescale(spriteBitmap, 48, 48);
            }

            if ( spriteBitmap.IsOk() )
                thumbnailList->Add(spriteBitmap);
            else
                thumbnailList->Add(gd::CommonBitmapManager::Get()->error48);
            imagesList->InsertItem(imagesList->GetItemCount(), gd::String::From(i), i);
        }
    }
}

void SpriteObjectEditor::RefreshImageAndControls()
{
    imagePanel->Refresh();
    imagePanel->Update();

    RefreshPoints();
    RefreshCollisionMasks();
}

wxBitmap SpriteObjectEditor::GetwxBitmapFromImageResource(gd::Resource & resource)
{
    try
    {
        gd::ImageResource & image = dynamic_cast<gd::ImageResource&>(resource);

        if ( wxFileExists(image.GetAbsoluteFile(game)) )
        {
        	wxLogNull noLogPlease;
            wxBitmap bmp( image.GetAbsoluteFile(game), wxBITMAP_TYPE_ANY);
            return bmp;
        }
    }
    catch(...)
    {
        //Resource is probably not an image.
    }

    return gd::CommonBitmapManager::Get()->error48;
}

SpriteObjectEditor::~SpriteObjectEditor()
{
	//(*Destroy(SpriteObjectEditor)
	//*)
	AuiManager1->UnInit();
	AuiManager2->UnInit();
	AuiManager3->UnInit();
	AuiManager4->UnInit();

	wxConfigBase::Get()->Write("/SpriteObjectEditor/LastWorkspace", mgr->SavePerspective());
	mgr->UnInit();
}
void SpriteObjectEditor::OnimagePanelEraseBackground(wxEraseEvent& event)
{
    //Prevent flickering
}
void SpriteObjectEditor::OnpreviewPanelEraseBackground(wxEraseEvent& event)
{
    //Prevent flickering
}

void SpriteObjectEditor::OnimagePanelResize(wxSizeEvent& event)
{
    imagePanel->Refresh();
    imagePanel->Update();
}
void SpriteObjectEditor::OnpreviewPanelResize(wxSizeEvent& event)
{
    previewPanel->Refresh();
    previewPanel->Update();
}


void SpriteObjectEditor::OnimagePanelPaint(wxPaintEvent& event)
{
    imagePanel->SetBackgroundStyle( wxBG_STYLE_PAINT );
    wxBufferedPaintDC dc( imagePanel );
    wxSize size = imagePanel->GetSize();

    //Checkerboard background
    dc.SetBrush(gd::CommonBitmapManager::Get()->transparentBg);
    dc.DrawRectangle(0,0, imagePanel->GetSize().GetWidth(), imagePanel->GetSize().GetHeight());

    if ( selectedAnimation < object.GetAnimationsCount() &&
         selectedDirection < object.GetAnimation(selectedAnimation).GetDirectionsCount() &&
         selectedImage < object.GetAnimation(selectedAnimation).GetDirection(selectedDirection).GetSpritesCount() )
    {
        //Draw the sprite
        const Sprite & sprite = object.GetAnimation(selectedAnimation).GetDirection(selectedDirection).GetSprite(selectedImage);
        wxBitmap bmp = GetwxBitmapFromImageResource(game.GetResourcesManager().GetResource(sprite.GetImageName()));

        xScrollBar->SetScrollbar(xScrollBar->GetThumbPosition(),size.GetWidth(), bmp.GetWidth(),size.GetWidth());
        yScrollBar->SetScrollbar(yScrollBar->GetThumbPosition(), size.GetHeight(), bmp.GetHeight(), size.GetHeight());

        spritePosX = (size.GetWidth() - bmp.GetWidth() - xScrollBar->GetThumbPosition()) / 2;
        spritePosY = (size.GetHeight() - bmp.GetHeight() - yScrollBar->GetThumbPosition()) / 2;
        spriteWidth = bmp.GetWidth();
        spriteHeight = bmp.GetHeight();

        //Draw border rectangle and the sprite
        dc.SetBrush(*wxTRANSPARENT_BRUSH);
        dc.SetPen(wxPen(wxColour(100,100,100)));
        dc.DrawRectangle(spritePosX, spritePosY, bmp.GetWidth(), bmp.GetHeight());
        dc.DrawBitmap(bmp, spritePosX, spritePosY, /*useMask=*/true);

        //Draw the point if needed
        if ( editingPoint )
        {
            long pointIndex = pointsList->GetNextItem(-1,wxLIST_NEXT_ALL, wxLIST_STATE_SELECTED);
            int pointX = 0;
            int pointY = 0;

            if ( pointIndex == 0 )
            { pointX = sprite.GetOrigin().GetX(); pointY = sprite.GetOrigin().GetY(); }
            else if ( pointIndex == 1 && sprite.IsDefaultCenterPoint() )
            { pointX = bmp.GetWidth()/2; pointY = bmp.GetHeight()/2; }
            else if ( pointIndex == 1 && !sprite.IsDefaultCenterPoint() )
            { pointX = sprite.GetCenter().GetX(); pointY = sprite.GetCenter().GetY(); }
            else if ( pointIndex != -1 )
            {
                pointX = sprite.GetPoint(pointsList->GetItemText(pointIndex)).GetX();
                pointY = sprite.GetPoint(pointsList->GetItemText(pointIndex)).GetY();
            }

            dc.DrawBitmap(gd::CommonBitmapManager::Get()->point,
                          spritePosX+pointX-gd::CommonBitmapManager::Get()->point.GetWidth()/2,
                          spritePosY+pointY-gd::CommonBitmapManager::Get()->point.GetHeight()/2,
                          /*useMask=*/true);
        }

        //Display hit boxes
        if ( editingMask )
        {
            if ( !sprite.IsCollisionMaskAutomatic() )
            {
                std::vector<Polygon2d> mask = sprite.GetCollisionMask();
                polygonEditionHelper.OnPaint(mask, dc, wxPoint(spritePosX, spritePosY));
            }
            else //When no custom mask is set, the mask is a bounding box.
            {
                dc.SetBrush(wxBrush(wxColour(128,128,128), wxBRUSHSTYLE_FDIAGONAL_HATCH));
                dc.DrawRectangle(spritePosX, spritePosY, bmp.GetWidth(), bmp.GetHeight());
            }
        }
    }

}

void SpriteObjectEditor::OnpreviewPanelPaint(wxPaintEvent& event)
{
    previewPanel->SetBackgroundStyle( wxBG_STYLE_PAINT );
    wxBufferedPaintDC dc( previewPanel );
    wxSize size = previewPanel->GetSize();

    //Checkerboard background
    dc.SetBrush(gd::CommonBitmapManager::Get()->transparentBg);
    dc.DrawRectangle(0,0, previewPanel->GetSize().GetWidth(), previewPanel->GetSize().GetHeight());

    if ( selectedAnimation < object.GetAnimationsCount() &&
         selectedDirection < object.GetAnimation(selectedAnimation).GetDirectionsCount() &&
         previewCurrentSprite < object.GetAnimation(selectedAnimation).GetDirection(selectedDirection).GetSpritesCount() )
    {
        //Draw the sprite
        const Sprite & sprite = object.GetAnimation(selectedAnimation).GetDirection(selectedDirection).GetSprite(previewCurrentSprite);
        wxBitmap bmp = GetwxBitmapFromImageResource(game.GetResourcesManager().GetResource(sprite.GetImageName()));

        spritePosX = (size.GetWidth() - bmp.GetWidth()) / 2;
        spritePosY = (size.GetHeight() - bmp.GetHeight()) / 2;

        //Draw border rectangle and the sprite
        dc.DrawBitmap(bmp, spritePosX, spritePosY, /*useMask=*/true);
    }
}


void SpriteObjectEditor::RefreshPoints()
{
    long selectedPointIndex = pointsList->GetNextItem(-1,wxLIST_NEXT_ALL, wxLIST_STATE_SELECTED);
    pointsList->DeleteAllItems();

    if ( selectedAnimation < object.GetAnimationsCount() &&
         selectedDirection < object.GetAnimation(selectedAnimation).GetDirectionsCount() &&
         selectedImage < object.GetAnimation(selectedAnimation).GetDirection(selectedDirection).GetSpritesCount() )
    {
        const Sprite & sprite = object.GetAnimation(selectedAnimation).GetDirection(selectedDirection).GetSprite(selectedImage);
        wxBitmap bmp = GetwxBitmapFromImageResource(game.GetResourcesManager().GetResource(sprite.GetImageName()));

        pointsList->InsertItem(pointsList->GetItemCount(), "Origin", 0);
        pointsList->SetItem(pointsList->GetItemCount()-1, 1, gd::String::From(sprite.GetOrigin().GetX()));
        pointsList->SetItem(pointsList->GetItemCount()-1, 2, gd::String::From(sprite.GetOrigin().GetY()));

        pointsList->InsertItem(pointsList->GetItemCount(), "Centre", 0);
        if ( sprite.IsDefaultCenterPoint() ) //Center point is a special case as most of the time it is automatically computed at runtime
        {
            pointsList->SetItem(pointsList->GetItemCount()-1, 1, gd::String::From(bmp.GetWidth()/2));
            pointsList->SetItem(pointsList->GetItemCount()-1, 2, gd::String::From(bmp.GetHeight()/2));
        }
        else
        {
            pointsList->SetItem(pointsList->GetItemCount()-1, 1, gd::String::From(sprite.GetCenter().GetX()));
            pointsList->SetItem(pointsList->GetItemCount()-1, 2, gd::String::From(sprite.GetCenter().GetY()));
        }

        const std::vector<Point> & points = sprite.GetAllNonDefaultPoints();
        for (std::size_t i = 0;i<points.size();++i)
        {
            pointsList->InsertItem(pointsList->GetItemCount(), points[i].GetName(), 0);
            pointsList->SetItem(pointsList->GetItemCount()-1, 1, gd::String::From(points[i].GetX()));
            pointsList->SetItem(pointsList->GetItemCount()-1, 2, gd::String::From(points[i].GetY()));
        }

    }

    //Make sure selection is not forgot.
    if ( selectedPointIndex != -1 ) pointsList->SetItemState(selectedPointIndex, wxLIST_STATE_SELECTED, wxLIST_STATE_SELECTED);
}

void SpriteObjectEditor::RefreshCollisionMasks()
{
	deletingMaskTreeItems = false; //See OnmaskTreeSelectionChanged
    maskTree->DeleteAllItems();
    deletingMaskTreeItems = true;

    if ( selectedAnimation < object.GetAnimationsCount() &&
         selectedDirection < object.GetAnimation(selectedAnimation).GetDirectionsCount() &&
         selectedImage < object.GetAnimation(selectedAnimation).GetDirection(selectedDirection).GetSpritesCount() )
    {
        const Sprite & sprite = object.GetAnimation(selectedAnimation).GetDirection(selectedDirection).GetSprite(selectedImage);

        if ( !sprite.IsCollisionMaskAutomatic() )
        {
            std::vector<Polygon2d> mask = sprite.GetCollisionMask();
            for (std::size_t i = 0;i<mask.size();++i)
            {
                wxTreeListItem polygonItem;
                if ( mask[i].vertices.size() == 3)
                    polygonItem = maskTree->AppendItem(maskTree->GetRootItem(), _("Triangle"), 0, 0);
                else if ( mask[i].vertices.size() == 4)
                    polygonItem = maskTree->AppendItem(maskTree->GetRootItem(), _("Quad"), 1, 1);
                else
                    polygonItem = maskTree->AppendItem(maskTree->GetRootItem(), _("Polygon"), 2, 2);

                //Associate with the item the polygon #
                maskTree->SetItemData(polygonItem, new wxStringClientData(gd::String::From(i)));

                if ( !mask[i].IsConvex() )
                {
                    maskTree->SetItemImage(polygonItem, 4, 4);
                    maskTree->SetItemText(polygonItem, maskTree->GetItemText(polygonItem)+" "+_("( INVALID : The polygon is not convex )"));
                }

                for (std::size_t j = 0;j<mask[i].vertices.size();++j)
                {
                    wxTreeListItem pointItem = maskTree->AppendItem(polygonItem, _("Vertice"), 3,3);
                    maskTree->SetItemText(pointItem, 1, gd::String::From(mask[i].vertices[j].x));
                    maskTree->SetItemText(pointItem, 2, gd::String::From(mask[i].vertices[j].y));

                    //Associate with the item the point #
                    maskTree->SetItemData(pointItem, new wxStringClientData(gd::String::From(j)));
                }

                maskTree->Expand(polygonItem);
            }
        }
        else
        {
            maskTree->AppendItem(maskTree->GetRootItem(), _("Default"));
        }

    }
}

void SpriteObjectEditor::OnimagesListItemSelect(wxListEvent& event)
{
    std::size_t newImage = event.GetIndex();

    if ( newImage != selectedImage )
    {
        selectedImage = newImage;

        RefreshImageAndControls();
    }
}

void SpriteObjectEditor::OnanimationsTreeSelectionChanged(wxTreeEvent& event)
{
    if ( gd::TreeItemStringData * itemData = dynamic_cast<gd::TreeItemStringData*>(animationsTree->GetItemData(event.GetItem())) )
    {
        std::size_t newAnimation = itemData->GetString().To<int>();
        std::size_t newDirection = itemData->GetSecondString().empty() ? 0 : itemData->GetSecondString().To<int>();

        if ( newAnimation != selectedAnimation || newDirection != selectedDirection )
        {
            selectedAnimation = newAnimation;
            selectedDirection = newDirection;
            selectedImage = 0;

            RefreshImagesList();
            RefreshImageAndControls();
            RefreshAnimationToolbar();
            ResetPreview();

        }
    }
}

void SpriteObjectEditor::RefreshAnimationToolbar()
{
    //Refresh also the toolbar
    if ( selectedAnimation < object.GetAnimationsCount() &&
         selectedDirection < object.GetAnimation(selectedAnimation).GetDirectionsCount() )
    {
        animationToolbar->ToggleTool(ID_TOOLLOOP, object.GetAnimation(selectedAnimation).GetDirection(selectedDirection).IsLooping());
        animationToolbar->Refresh();
        animationToolbar->Update();
    }
}

void SpriteObjectEditor::OnAddAnimationSelected(wxCommandEvent& event)
{
    Animation newAnimation;
    newAnimation.SetDirectionsCount(1);
    object.AddAnimation(newAnimation);
    selectedAnimation = object.GetAnimationsCount()-1;
    selectedDirection = 0;
    selectedImage = 0;

    RefreshAll();
}

void SpriteObjectEditor::OnDeleteAnimationSelected(wxCommandEvent& event)
{
    if ( selectedAnimation < object.GetAnimationsCount())
        object.RemoveAnimation(selectedAnimation);

    if ( selectedAnimation > 0 ) selectedAnimation--;
    RefreshAll();
}

void SpriteObjectEditor::OnanimationsTreeItemRightClick(wxTreeEvent& event)
{
    OnanimationsTreeSelectionChanged(event);

    //Setup context menu
    if ( selectedAnimation < object.GetAnimationsCount() )
    {
        automaticRotationItem->Check(!object.GetAnimation(selectedAnimation).useMultipleDirections);
        multipleDirectionsItem->Check(object.GetAnimation(selectedAnimation).useMultipleDirections);
    }
    animationsMenu.Enable(deleteItem->GetId(), object.GetAnimationsCount() > 1);

    if ( selectedAnimation < object.GetAnimationsCount() &&
         selectedDirection < object.GetAnimation(selectedAnimation).GetDirectionsCount() )
    {
        Direction & direction = object.GetAnimation(selectedAnimation).GetDirection(selectedDirection);

        if ( gd::TreeItemStringData * itemData = dynamic_cast<gd::TreeItemStringData*>(animationsTree->GetItemData(event.GetItem())) )
        {
            //Deactivate some buttons when no direction is selected
            if (itemData->GetSecondString().empty() && object.GetAnimation(selectedAnimation).useMultipleDirections)
            {
                animationsMenu.Enable(ID_MENULOOP, false);
                animationsMenu.Enable(ID_MENUTIMEBETWEENFRAMES, false);
                animationsMenu.SetLabel(ID_MENUTIMEBETWEENFRAMES, _("Time between each images"));
            }
            else
            {
                animationsMenu.Enable(ID_MENULOOP, true);
                animationsMenu.Enable(ID_MENUTIMEBETWEENFRAMES, true);
                animationsMenu.Check(ID_MENULOOP, direction.IsLooping());
                animationsMenu.SetLabel(ID_MENUTIMEBETWEENFRAMES, _("Time between each images: ") +
                	gd::String::From(direction.GetTimeBetweenFrames()) + _("s"));
            }
        }
    }

    PopupMenu(&animationsMenu);
}

void SpriteObjectEditor::OnautomaticRotationItemSelected(wxCommandEvent& event)
{
    if ( selectedAnimation < object.GetAnimationsCount() )
    {
        object.GetAnimation(selectedAnimation).useMultipleDirections = false;
        RefreshAnimationTree();
    }
}

void SpriteObjectEditor::OnmultipleDirectionsItemSelected(wxCommandEvent& event)
{
    if ( selectedAnimation < object.GetAnimationsCount() )
    {
        object.GetAnimation(selectedAnimation).useMultipleDirections = true;
        object.GetAnimation(selectedAnimation).SetDirectionsCount(8);
        RefreshAnimationTree();
    }
}

void SpriteObjectEditor::OnimagesListItemRClick(wxListEvent& event)
{
    OnimagesListItemSelect(event);

    if ( selectedAnimation < object.GetAnimationsCount() &&
         selectedDirection < object.GetAnimation(selectedAnimation).GetDirectionsCount() )
    {
        const Direction & direction = object.GetAnimation(selectedAnimation).GetDirection(selectedDirection);
        imagesMenu.Enable(removeImageItem->GetId(), direction.GetSpritesCount() > 1);

        imagesMenu.Enable(moveLeftItem->GetId(), selectedImage > 0);
        imagesMenu.Enable(moveRightItem->GetId(), selectedImage < direction.GetSpritesCount()-1);

        PopupMenu(&imagesMenu);
    }
}

void SpriteObjectEditor::OnremoveImageItemSelected(wxCommandEvent& event)
{
    if ( selectedAnimation < object.GetAnimationsCount() &&
         selectedDirection < object.GetAnimation(selectedAnimation).GetDirectionsCount() )
    {
        Direction & direction = object.GetAnimation(selectedAnimation).GetDirection(selectedDirection);
        if ( selectedImage < direction.GetSpritesCount() )
            direction.RemoveSprite(selectedImage);

        if ( selectedImage > 0 ) selectedImage--;

        RefreshImagesList();
        RefreshImageAndControls();
    }
}
void SpriteObjectEditor::AddImageToCurrentAnimation(wxString image, bool refresh)
{
    if ( selectedAnimation < object.GetAnimationsCount() &&
         selectedDirection < object.GetAnimation(selectedAnimation).GetDirectionsCount() )
    {
        Direction & direction = object.GetAnimation(selectedAnimation).GetDirection(selectedDirection);
        Sprite newSprite;
        newSprite.SetImageName(image);

        direction.AddSprite(newSprite);
        if ( refresh )
        {
	        RefreshImagesList();
	        RefreshImageAndControls();
        }
    }
}

bool DndTextSpriteObjectEditor::OnDropText(wxCoord x, wxCoord y, const wxString& text)
{
    gd::String fullCommand = text;
    std::vector<gd::String> command = fullCommand.Split(U';');

	//"Normal" drop of one or more images.
    if (command.size() >= 2 && command[0] == "NORMAL") {
    	for (std::size_t i = 1;i<command.size();++i)
    		editor.AddImageToCurrentAnimation(command[i], /*refresh=*/i == command.size()-1);
    }
	//This is a "special" drop coming from the resource library dialog
    else if (command.size() >= 3 && command[0] == "COPYANDADDRESOURCES")
    {
    	if (!editor.resourcesEditorPnl) return true;

    	//Add ressources dragged from the library dialog to the project.
        std::vector<gd::String> files;
        for (std::size_t i = 2;i<command.size();++i) files.push_back(command[i]);
        std::vector<gd::String> names = editor.resourcesEditorPnl->CopyAndAddResources(files, command[1]);

    	//And add them as usual to the animation.
        for (std::size_t i = 0;i<names.size();++i)
    		editor.AddImageToCurrentAnimation(names[i], /*refresh=*/i == names.size()-1);
    }
	else
		std::cout << "Drop was triggered but the command was not understood" << std::endl;

    return true;
}

void SpriteObjectEditor::OnMoveLeftSelected(wxCommandEvent& event)
{
    if ( selectedAnimation < object.GetAnimationsCount() &&
         selectedDirection < object.GetAnimation(selectedAnimation).GetDirectionsCount() )
    {
        Direction & direction = object.GetAnimation(selectedAnimation).GetDirection(selectedDirection);
        if ( selectedImage > 0 )
        {
            direction.SwapSprites(selectedImage, selectedImage-1);
            RefreshImagesList();
            imagesList->SetItemState(selectedImage-1, wxLIST_STATE_SELECTED, wxLIST_STATE_SELECTED);
        }
    }
}

void SpriteObjectEditor::OnMoveRightSelected(wxCommandEvent& event)
{
    if ( selectedAnimation < object.GetAnimationsCount() &&
         selectedDirection < object.GetAnimation(selectedAnimation).GetDirectionsCount() )
    {
        Direction & direction = object.GetAnimation(selectedAnimation).GetDirection(selectedDirection);
        if ( selectedImage < direction.GetSpritesCount()-1 )
        {
            direction.SwapSprites(selectedImage, selectedImage+1);
            RefreshImagesList();
            imagesList->SetItemState(selectedImage+1, wxLIST_STATE_SELECTED, wxLIST_STATE_SELECTED);
        }
    }
}

void SpriteObjectEditor::OnMaskEditClick(wxCommandEvent& event)
{
    if ( toolbar->GetToolToggled(ID_MASKITEM) )
    {
        editingMask = true;
        editingPoint = false;
        toolbar->ToggleTool(ID_POINTSITEM, false);
        toolbar->Update();

        mgr->GetPane(maskPanel).Show(true);
        mgr->GetPane(pointsPanel).Show(false);
        mgr->Update();
    }
}

void SpriteObjectEditor::OnPointEditClick(wxCommandEvent& event)
{
    if ( toolbar->GetToolToggled(ID_POINTSITEM) )
    {
        editingPoint = true;
        editingMask = false;
        toolbar->ToggleTool(ID_MASKITEM, false);
        toolbar->Update();

        mgr->GetPane(maskPanel).Show(false);
        mgr->GetPane(pointsPanel).Show(true);
        mgr->Update();
    }
}

void SpriteObjectEditor::OnmgrPaneClose(wxAuiManagerEvent& event)
{
    if ( event.GetPane()->window == pointsPanel )
    {
        toolbar->ToggleTool(ID_POINTSITEM, false);
        toolbar->Update();
        editingPoint = false;
    }
    else if ( event.GetPane()->window == maskPanel )
    {
        //Check that all polygons of the collision mask are convex
        bool aPolygonIsNotConvex = false;
        if ( selectedAnimation < object.GetAnimationsCount() &&
             selectedDirection < object.GetAnimation(selectedAnimation).GetDirectionsCount() &&
             selectedImage < object.GetAnimation(selectedAnimation).GetDirection(selectedDirection).GetSpritesCount() )
        {
            const Sprite & sprite = object.GetAnimation(selectedAnimation).GetDirection(selectedDirection).GetSprite(selectedImage);

            if ( !sprite.IsCollisionMaskAutomatic() )
            {
                std::vector<Polygon2d> mask = sprite.GetCollisionMask();
                for (std::size_t i = 0;i<mask.size();++i)
                {
                    if ( !mask[i].IsConvex() ) aPolygonIsNotConvex = true;
                }
            }
        }

        if ( !aPolygonIsNotConvex )
        {
            toolbar->ToggleTool(ID_MASKITEM, false);
            toolbar->Update();
            editingMask = false;
        }
        else
        {
            gd::LogMessage(_("One or more polygons from the collision mask are not convex ( They have a hole ).\nPlease modify these polygons before continuing."));
            event.Veto();
        }

    }
}

void SpriteObjectEditor::OnpointsListBeginLabelEdit(wxListEvent& event)
{
    if ( event.GetIndex() == 0 || event.GetIndex() == 1 )
    {
        event.Veto();
        return;
    }

    renamedPointOldName = pointsList->GetItemText(event.GetIndex());
}

void SpriteObjectEditor::OnpointsListEndLabelEdit(wxListEvent& event)
{
    std::vector < Sprite * > sprites = GetSpritesToModify();
    if ( sprites.empty() || sprites[0]->HasPoint(event.GetLabel()) )
        event.Veto();

    for(std::size_t i = 0;i<sprites.size();++i)
    {
        if ( !sprites[i]->HasPoint(event.GetLabel()) )
            sprites[i]->GetPoint(renamedPointOldName).SetName(event.GetLabel());
    }
}

void SpriteObjectEditor::OnimagePanelLeftUp(wxMouseEvent& event)
{
    std::vector < Sprite * > sprites = GetSpritesToModify();

    for (std::size_t i = 0;i<sprites.size();++i)
    {
        Sprite & sprite = *sprites[i];
        if ( editingPoint )
        {
            //Move selected point
            wxSize size = imagePanel->GetSize();
            wxBitmap bmp = GetwxBitmapFromImageResource(game.GetResourcesManager().GetResource(sprite.GetImageName()));
            int spritePosX = (size.GetWidth() - bmp.GetWidth() - xScrollBar->GetThumbPosition()) / 2;
            int spritePosY = (size.GetHeight() - bmp.GetHeight() - yScrollBar->GetThumbPosition()) / 2;

            long pointIndex = pointsList->GetNextItem(-1,wxLIST_NEXT_ALL, wxLIST_STATE_SELECTED);

            if ( pointIndex == 0 )
                sprite.GetOrigin().SetXY(event.GetX() - spritePosX, event.GetY() - spritePosY);
            else if ( pointIndex == 1 )
            {
                sprite.SetDefaultCenterPoint(false);
                sprite.GetCenter().SetXY(event.GetX() - spritePosX, event.GetY() - spritePosY);
            }
            else if ( pointIndex != -1 )
            {
                gd::String pointName = pointsList->GetItemText(pointIndex);

                if ( !sprite.HasPoint(pointName) )
                {
                    Point point(pointName);
                    sprite.AddPoint(point);
                }

                sprite.GetPoint(pointName).SetXY(event.GetX() - spritePosX, event.GetY() - spritePosY);
            }
        }
    }
    if ( editingPoint ) RefreshPoints();

    polygonEditionHelper.OnMouseLeftUp(event);

    imagePanel->Refresh();
    imagePanel->Update();
}

void SpriteObjectEditor::OnpointsListItemSelect(wxListEvent& event)
{
    toolbar->EnableTool(ID_DELETEPOINTITEM, event.GetIndex() != 0 && event.GetIndex() != 1);

    imagePanel->Refresh();
    imagePanel->Update();
}

std::vector < Sprite * > SpriteObjectEditor::GetSpritesToModify()
{
    std::vector < Sprite * > result;

    if ( selectedAnimation < object.GetAnimationsCount() &&
         selectedDirection < object.GetAnimation(selectedAnimation).GetDirectionsCount() &&
         selectedImage < object.GetAnimation(selectedAnimation).GetDirection(selectedDirection).GetSpritesCount() )
    {
        result.push_back(&object.GetAnimation(selectedAnimation).GetDirection(selectedDirection).GetSprite(selectedImage));
    }

    //If "Apply to whole animation" is checked, the vector will contains all the sprite of the direction
    if ( (editingPoint && pointToolbar->GetToolToggled(ID_POINTAPPLYWHOLEANIMITEM)) ||
         (editingMask && maskToolbar->GetToolToggled(ID_MASKAPPLYWHOLEANIMITEM)) )
    {
        if ( selectedAnimation < object.GetAnimationsCount() &&
             selectedDirection < object.GetAnimation(selectedAnimation).GetDirectionsCount() )
        {
            Direction & direction = object.GetAnimation(selectedAnimation).GetDirection(selectedDirection);
            for (std::size_t i = 0;i<direction.GetSpritesCount();++i)
            {
                if ( i != selectedImage ) //Sprite at index "selectedImage" is already in the vector
                    result.push_back(&direction.GetSprite(i));
            }
        }
    }

    return result;
}

void SpriteObjectEditor::OnDeletePointClick(wxCommandEvent& event)
{
    if ( !editingPoint ) return;

    long pointIndex = pointsList->GetNextItem(-1,wxLIST_NEXT_ALL, wxLIST_STATE_SELECTED);
    gd::String pointName = pointsList->GetItemText(pointIndex);

    std::vector < Sprite * > sprites = GetSpritesToModify();
    for (std::size_t i = 0;i<sprites.size();++i)
        sprites[i]->DelPoint(pointName);

    pointsList->DeleteItem(pointIndex);
}

void SpriteObjectEditor::OnAddPointClick(wxCommandEvent& event)
{
    std::vector < Sprite * > sprites = GetSpritesToModify();
    if ( sprites.empty() ) return;

    //Find a new name for the point
    Point point(_("NewPoint"));
    unsigned int i = 2;
    while ( sprites[0]->HasPoint(point.GetName()) )
    {
        point.SetName(_("NewPoint") + gd::String::From(i));
        ++i;
    }

    //Add the point to the sprite(s)
    for (std::size_t i = 0;i<sprites.size();++i)
    {
        if ( !sprites[i]->HasPoint(point.GetName()) ) sprites[i]->AddPoint(point);
    }

    RefreshPoints();
    pointsList->EditLabel(pointsList->GetItemCount()-1);
}

void SpriteObjectEditor::OnpointsListItemActivated(wxListEvent& event)
{
    std::vector < Sprite * > sprites = GetSpritesToModify();
    if ( sprites.empty() ) return;

    long pointIndex = pointsList->GetNextItem(-1,wxLIST_NEXT_ALL, wxLIST_STATE_SELECTED);
    gd::String pointName = pointsList->GetItemText(pointIndex);

    if ( pointName == "Centre" ) //Center point can be automatically positioned.
    {
        if (wxMessageBox(_("The point \"Centre\" can be automatically placed by GDevelop at the center.\nDo you really want to modify the point\?\nClick on yes to modify it, click on no so as let GDevelop place it."),
                       _("Position of the point \"Centre\""), wxYES_NO ) == wxNO)
        {
            for (std::size_t i = 0;i<sprites.size();++i) sprites[i]->SetDefaultCenterPoint(true);
            RefreshPoints();
            imagePanel->Refresh();
            imagePanel->Update();
            return;
        } else {
        	for (std::size_t i = 0;i<sprites.size();++i) sprites[i]->SetDefaultCenterPoint(false);
        }
    }

    Point & point = sprites[0]->GetPoint(pointName);

    gd::String x_str = wxGetTextFromUser(_("Enter the X position of the point (relative to the image)."), "X position of the point", gd::String::From(point.GetX()));
    gd::String y_str = wxGetTextFromUser(_("Enter the Y position of the point (relative to the image)."), "Y position of the point", gd::String::From(point.GetY()));

    point.SetX(x_str.To<int>());
    point.SetY(y_str.To<int>());

    //Apply the change to others images if needed
    for (std::size_t i = 1;i<sprites.size();++i)
    {
        if ( sprites[i]->HasPoint(pointName) ) sprites[i]->GetPoint(pointName) = point;
    }

    RefreshPoints();
}

void SpriteObjectEditor::OnimagePanelLeftDown(wxMouseEvent& event)
{
    std::vector < Sprite * > sprites = GetSpritesToModify();
    if ( sprites.empty() ) return;

    if ( editingMask )
    {
        std::vector<Polygon2d> mask = sprites[0]->GetCollisionMask();
        polygonEditionHelper.OnMouseLeftDown(mask, event, wxPoint(spritePosX, spritePosY));

        //Select the item in the treeview
        wxTreeListItem polygonItem = maskTree->GetFirstChild(maskTree->GetRootItem());
        std::size_t polyId = 0;
        while ( polygonItem.IsOk() && polyId != polygonEditionHelper.GetSelectedPolygon() )
        {
            polygonItem = maskTree->GetNextSibling(polygonItem);
            polyId++;
        }
        if ( polygonItem.IsOk() )
        {
            wxTreeListItem verticeItem = maskTree->GetFirstChild(polygonItem);
            std::size_t verticeId = 0;
            while ( verticeItem.IsOk() && verticeId != polygonEditionHelper.GetSelectedPoint() )
            {
                verticeItem = maskTree->GetNextSibling(verticeItem);
                verticeId++;
            }

            if ( verticeItem.IsOk()) maskTree->Select(verticeItem);
        }
    }
}

void SpriteObjectEditor::OnimagePanelMouseMove(wxMouseEvent& event)
{
    std::vector < Sprite * > sprites = GetSpritesToModify();
    if ( sprites.empty() ) return;

    if ( editingMask && polygonEditionHelper.IsMovingPoint())
    {
        std::vector<Polygon2d> mask = sprites[0]->GetCollisionMask();
        polygonEditionHelper.OnMouseMove(mask, event, wxPoint(spritePosX, spritePosY), 0.f, 0.f, spriteWidth, spriteHeight);

    	sprites[0]->SetCollisionMaskAutomatic(false);
        sprites[0]->SetCustomCollisionMask(mask);

        //Apply changes to other sprites if necessary
        for (std::size_t i = 0;i<sprites.size();++i)
        {
            sprites[i]->SetCollisionMaskAutomatic(false);
            sprites[i]->SetCustomCollisionMask(mask);
        }

        imagePanel->Refresh();
        imagePanel->Update();
        RefreshCollisionMasks();
    }
}

void SpriteObjectEditor::OnAddMaskClick(wxCommandEvent& event)
{
    std::vector < Sprite * > sprites = GetSpritesToModify();
    if ( sprites.empty() ) return;

    std::vector<Polygon2d> mask = sprites[0]->GetCollisionMask();
    if ( sprites[0]->IsCollisionMaskAutomatic() ) mask.clear();

    float width = gd::String(wxGetTextFromUser(_("Enter the width of the rectangle"), _("New rectangle"), "32")).To<float>();
    float height = gd::String(wxGetTextFromUser(_("Enter the height of the rectangle"), _("New rectangle"), "32")).To<float>();
    float angle = gd::String(wxGetTextFromUser(_("Enter the angle of the rotation of the rectangle ( in degrees )"), _("New rectangle"), "0")).To<float>();

    Polygon2d newRectangle = Polygon2d::CreateRectangle(width, height);
    newRectangle.Rotate(angle*3.14159/180);
    newRectangle.Move(spriteWidth/2.0, spriteHeight/2.0);
    mask.push_back(newRectangle);

    for (std::size_t i = 0;i<sprites.size();++i)
    {
        sprites[i]->SetCollisionMaskAutomatic(false);
        sprites[i]->SetCustomCollisionMask(mask);
    }

    RefreshImageAndControls();
}

void SpriteObjectEditor::OnAddPolygonMaskClick(wxCommandEvent& event)
{
}

void SpriteObjectEditor::OnAddVerticeClick(wxCommandEvent& event)
{
    std::vector < Sprite * > sprites = GetSpritesToModify();
    if ( sprites.empty() ) return;

    std::vector<Polygon2d> mask = sprites[0]->GetCollisionMask();
    if ( polygonEditionHelper.GetSelectedPolygon() < mask.size() )
    {
        if ( polygonEditionHelper.GetSelectedPoint() < mask[polygonEditionHelper.GetSelectedPolygon()].vertices.size() )
        {
            if ( polygonEditionHelper.GetSelectedPoint() < 1 )
            	polygonEditionHelper.SetSelectedPoint(1);
            if ( polygonEditionHelper.GetSelectedPoint() >= mask[polygonEditionHelper.GetSelectedPolygon()].vertices.size() )
            	polygonEditionHelper.SetSelectedPoint(mask[polygonEditionHelper.GetSelectedPolygon()].vertices.size()-1);
            if ( mask[polygonEditionHelper.GetSelectedPolygon()].vertices.size() < 2 )
            	return;

            sf::Vector2f newPoint = (mask[polygonEditionHelper.GetSelectedPolygon()].vertices[polygonEditionHelper.GetSelectedPoint()]
            	+ mask[polygonEditionHelper.GetSelectedPolygon()].vertices[polygonEditionHelper.GetSelectedPoint()-1]);
            newPoint.x /= 2.0f;
            newPoint.y /= 2.0f;
            mask[polygonEditionHelper.GetSelectedPolygon()].vertices.insert(mask[polygonEditionHelper.GetSelectedPolygon()].vertices.begin()+polygonEditionHelper.GetSelectedPoint(), newPoint);
        }
        else
        {
            size_t verticeCount = mask[polygonEditionHelper.GetSelectedPolygon()].vertices.size();
            sf::Vector2f newPoint = mask[polygonEditionHelper.GetSelectedPolygon()].vertices[verticeCount-1]
            	+ mask[polygonEditionHelper.GetSelectedPolygon()].vertices[verticeCount-2];
            newPoint.x /= 2.0f;
            newPoint.y /= 2.0f;
            mask[polygonEditionHelper.GetSelectedPolygon()].vertices.insert(mask[polygonEditionHelper.GetSelectedPolygon()].vertices.begin()+verticeCount-1, newPoint);
        }
    }

    for (std::size_t i = 0;i<sprites.size();++i)
    {
        sprites[i]->SetCollisionMaskAutomatic(false);
        sprites[i]->SetCustomCollisionMask(mask);
    }

    RefreshImageAndControls();
}

void SpriteObjectEditor::OnmaskTreeSelectionChanged(wxTreeListEvent& event)
{
	//The event is called event when we are deleting items (with DeleteAllItems)
	//on GTK, so do nothing in this case, otherwise we get crashs with GetItemData.
	if (!deletingMaskTreeItems)
		return;

    wxTreeListItem selectedItem = maskTree->GetSelection();
    if (!selectedItem.IsOk() || selectedItem == maskTree->GetRootItem())
    	return; //Be careful, nothing could be selected (e.g: when clearing the tree).
    if(polygonEditionHelper.IsMovingPoint()) //Do not select a point when we are currently moving another point
    	return;

    if ( maskTree->GetItemParent(selectedItem) == maskTree->GetRootItem() )
    {
        //A polygon is selected
        wxStringClientData * data = dynamic_cast<wxStringClientData *>(maskTree->GetItemData(selectedItem));
        polygonEditionHelper.SetSelectedPolygon(data ? gd::String(data->GetData()).To<int>() : gd::String::npos);
        polygonEditionHelper.SetSelectedPoint(gd::String::npos);
    }
    else
    {
        //A point is selected
        wxStringClientData * data = dynamic_cast<wxStringClientData *>(maskTree->GetItemData(selectedItem));
        polygonEditionHelper.SetSelectedPoint(data ? gd::String(data->GetData()).To<int>() : gd::String::npos);
        wxStringClientData * parentData = dynamic_cast<wxStringClientData *>(maskTree->GetItemData(maskTree->GetItemParent(selectedItem)));
        polygonEditionHelper.SetSelectedPolygon(parentData ? gd::String(parentData->GetData()).To<int>() : gd::String::npos);
    }

    imagePanel->Refresh();
    imagePanel->Update();
}

void SpriteObjectEditor::OnDeleteMaskClick(wxCommandEvent& event)
{
    std::vector < Sprite * > sprites = GetSpritesToModify();
    if ( sprites.empty() ) return;

    std::vector<Polygon2d> mask = sprites[0]->GetCollisionMask();
    if ( polygonEditionHelper.GetSelectedPolygon() < mask.size() )
    {
        if ( polygonEditionHelper.GetSelectedPoint() < mask[polygonEditionHelper.GetSelectedPolygon()].vertices.size() )
        {
            //Make sure not to delete a vertice if the polygon has 3 vertices
            if ( mask[polygonEditionHelper.GetSelectedPolygon()].vertices.size() <= 3 )
            {
                if (wxMessageBox(_("A polygon can not have less than 3 vertices.\nDo you want to delete the entire polygon\?"), _("Delete the polygon\?"), wxYES_NO|wxICON_EXCLAMATION ) == wxYES)
                {
                    mask.erase(mask.begin()+polygonEditionHelper.GetSelectedPolygon());
                }
                else
                    return;
            }

            mask[polygonEditionHelper.GetSelectedPolygon()].vertices.erase(mask[polygonEditionHelper.GetSelectedPolygon()].vertices.begin()+polygonEditionHelper.GetSelectedPoint());
        }
        else
            mask.erase(mask.begin()+polygonEditionHelper.GetSelectedPolygon());
    }

    for (std::size_t i = 0;i<sprites.size();++i)
    {
        sprites[i]->SetCollisionMaskAutomatic(false);
        sprites[i]->SetCustomCollisionMask(mask);
    }

    RefreshImageAndControls();
}

void SpriteObjectEditor::OnDefaultMaskClick(wxCommandEvent& event)
{
    if (wxMessageBox(_("Go back to the default mask will erase any custom hit boxes.\nAre you sure you want to continue\?"),
                   _("Caution"), wxYES_NO | wxNO_DEFAULT ) == wxNO)
    {
        return;
    }

    std::vector < Sprite * > sprites = GetSpritesToModify();
    for (std::size_t i = 0;i<sprites.size();++i)
    {
        sprites[i]->SetCollisionMaskAutomatic(true);
    }

    RefreshImageAndControls();
}

void SpriteObjectEditor::OnPositionMaskSelected(wxCommandEvent& event)
{
    std::vector < Sprite * > sprites = GetSpritesToModify();
    if ( sprites.empty() ) return;

    std::vector<Polygon2d> mask = sprites[0]->GetCollisionMask();
    std::size_t selectedPolygon = polygonEditionHelper.GetSelectedPolygon();
    std::size_t selectedPolygonPoint = polygonEditionHelper.GetSelectedPoint();
    if ( selectedPolygon < mask.size() && selectedPolygonPoint < mask[selectedPolygon].vertices.size() )
    {
        mask[selectedPolygon].vertices[selectedPolygonPoint].x = gd::String(wxGetTextFromUser(_("Enter the X position of the vertice"), _("Positioning"),
        	gd::String::From(mask[selectedPolygon].vertices[selectedPolygonPoint].x))).To<float>();
        mask[selectedPolygon].vertices[selectedPolygonPoint].y = gd::String(wxGetTextFromUser(_("Enter the Y position of the vertice"), _("Positioning"),
        	gd::String::From(mask[selectedPolygon].vertices[selectedPolygonPoint].y))).To<float>();
    }

    for (std::size_t i = 0;i<sprites.size();++i)
    {
        sprites[i]->SetCollisionMaskAutomatic(false);
        sprites[i]->SetCustomCollisionMask(mask);
    }

    RefreshImageAndControls();
}


void SpriteObjectEditor::OnMovePolygonSelected(wxCommandEvent& event)
{
    std::vector < Sprite * > sprites = GetSpritesToModify();
    if ( sprites.empty() ) return;

    std::vector<Polygon2d> mask = sprites[0]->GetCollisionMask();
    std::size_t selectedPolygon = polygonEditionHelper.GetSelectedPolygon();
    if ( selectedPolygon < mask.size() )
    {
        float xOffset = gd::String(wxGetTextFromUser(_("Enter the displacement offset on X axis."), _("Displacement"), "0")).To<float>();
        float yOffset = gd::String(wxGetTextFromUser(_("Enter the displacement offset on Y axis."), _("Displacement"), "0")).To<float>();

        mask[selectedPolygon].Move(xOffset, yOffset);
    }

    for (std::size_t i = 0;i<sprites.size();++i)
    {
        sprites[i]->SetCollisionMaskAutomatic(false);
        sprites[i]->SetCustomCollisionMask(mask);
    }

    RefreshImageAndControls();
}

void SpriteObjectEditor::OnRotatePolygonSelected(wxCommandEvent& event)
{
    std::vector < Sprite * > sprites = GetSpritesToModify();
    if ( sprites.empty() ) return;

    std::vector<Polygon2d> mask = sprites[0]->GetCollisionMask();
    std::size_t selectedPolygon = polygonEditionHelper.GetSelectedPolygon();
    if ( selectedPolygon < mask.size() )
    {
        float angle = gd::String(wxGetTextFromUser(_("Enter the angle of the rotation, in degrees"),
        	_("Rotation of the polygon"), "0")).To<float>()*3.14159/180;

        mask[selectedPolygon].Rotate(angle);
    }

    for (std::size_t i = 0;i<sprites.size();++i)
    {
        sprites[i]->SetCollisionMaskAutomatic(false);
        sprites[i]->SetCustomCollisionMask(mask);
    }

    RefreshImageAndControls();
}


void SpriteObjectEditor::OnmaskTreeItemActivated(wxTreeListEvent& event)
{
    std::vector < Sprite * > sprites = GetSpritesToModify();

    if ( !sprites.empty() && !sprites[0]->IsCollisionMaskAutomatic())
    {
        wxCommandEvent uselessEvent;
        OnPositionMaskSelected(uselessEvent);
    }
}

void SpriteObjectEditor::OnmaskTreeItemRClick(wxTreeListEvent& event)
{
    std::vector < Sprite * > sprites = GetSpritesToModify();

    maskMenu.Enable(ID_POSITIONMASKITEM, !sprites.empty() && !sprites[0]->IsCollisionMaskAutomatic());

    PopupMenu(&maskMenu);
}

void SpriteObjectEditor::OnMenuLoopSelected(wxCommandEvent& event)
{
    if ( selectedAnimation < object.GetAnimationsCount() &&
         selectedDirection < object.GetAnimation(selectedAnimation).GetDirectionsCount() )
    {
        Direction & direction = object.GetAnimation(selectedAnimation).GetDirection(selectedDirection);
        direction.SetLoop(animationsMenu.IsChecked(ID_MENULOOP));
        RefreshAnimationToolbar();
    }
}

void SpriteObjectEditor::OnToolLoopClick(wxCommandEvent& event)
{
    if ( selectedAnimation < object.GetAnimationsCount() &&
         selectedDirection < object.GetAnimation(selectedAnimation).GetDirectionsCount() )
    {
        Direction & direction = object.GetAnimation(selectedAnimation).GetDirection(selectedDirection);
        direction.SetLoop(animationToolbar->GetToolToggled(ID_TOOLLOOP));
    }
}

void SpriteObjectEditor::OnTimeBetweenFramesSelected(wxCommandEvent& event)
{
    if ( selectedAnimation < object.GetAnimationsCount() &&
         selectedDirection < object.GetAnimation(selectedAnimation).GetDirectionsCount() )
    {
        Direction & direction = object.GetAnimation(selectedAnimation).GetDirection(selectedDirection);
        gd::String newTime = wxGetTextFromUser(_("Enter time between each image (in seconds)"),
			_("Time between each images"), gd::String::From(direction.GetTimeBetweenFrames()));

        if ( newTime.empty() ) return;
        direction.SetTimeBetweenFrames(newTime.To<float>());
    }
}

void SpriteObjectEditor::OnpreviewTimerTrigger(wxTimerEvent& event)
{
    previewElapsedTime += previewTimer.GetInterval();
    if ( selectedAnimation < object.GetAnimationsCount() &&
         selectedDirection < object.GetAnimation(selectedAnimation).GetDirectionsCount() )
    {
        const Direction & direction = object.GetAnimation(selectedAnimation).GetDirection(selectedDirection);
        if ( previewElapsedTime > direction.GetTimeBetweenFrames()*1000.0f )
        {
            previewElapsedTime = 0;
            previewCurrentSprite++;
            if ( previewCurrentSprite >= direction.GetSpritesCount() )
            {
                if (direction.IsLooping())
                    previewCurrentSprite = 0;
                else
                    previewCurrentSprite = direction.GetSpritesCount()-1;
            }

            previewPanel->Refresh();
            previewPanel->Update();
        }
    }
}

void SpriteObjectEditor::ResetPreview()
{
    previewElapsedTime = 0;
    previewCurrentSprite = 0;

    previewPanel->Refresh();
    previewPanel->Update();
}

void SpriteObjectEditor::OnPreviewClick(wxCommandEvent& event)
{
    ResetPreview();
    mgr->GetPane(previewPanel).Show(true);
    mgr->Update();
}

void SpriteObjectEditor::OnimagesListKeyDown(wxListEvent& event)
{
    switch(event.GetKeyCode()) {
        case 'J':
        {
            wxCommandEvent useless;
            OnMoveLeftSelected(useless);
            break;
        }
        case 'K':
        {
            wxCommandEvent useless;
            OnMoveRightSelected(useless);
            break;
        }
        case WXK_BACK:
        case WXK_DELETE:
        {
            wxCommandEvent useless;
            OnremoveImageItemSelected(useless);
            break;
        }
        default:
            break;
    }
}

void SpriteObjectEditor::OnAddImageFromFileSelected(wxCommandEvent& event)
{
    if ( selectedAnimation < object.GetAnimationsCount() &&
         selectedDirection < object.GetAnimation(selectedAnimation).GetDirectionsCount() )
    {
        Direction & direction = object.GetAnimation(selectedAnimation).GetDirection(selectedDirection);
        wxFileDialog FileDialog( this, _("Choose one or more images to add"), "", "", _("Supported image files|*.jpg;*.png|All files|*.*"), wxFD_MULTIPLE|wxFD_PREVIEW );
        wxString projectDirectory = wxFileName::FileName(game.GetProjectFile()).GetPath();

        if ( FileDialog.ShowModal() == wxID_OK )
        {
            wxArrayString files;
            FileDialog.GetPaths(files);
            files.Sort(); //Ensure that the order of insertion is alphabetical.

            std::vector < gd::String > filenames;
            for ( std::size_t i = 0; i < files.GetCount();++i )
                filenames.push_back(files[i]);

            for ( std::size_t i = 0; i < filenames.size();++i )
            {
                wxFileName file = wxFileName::FileName(filenames[i]);
                if (!projectDirectory.empty())  //If game is not saved, we keep absolute filenames
                    file.MakeRelativeTo(projectDirectory);

                gd::String name = file.GetFullName();

                //Add the resource if it does not exist or if it is not the same resource
                if ( !game.GetResourcesManager().HasResource(name) || !(game.GetResourcesManager().GetResource(name).GetFile() == gd::String(file.GetFullPath())) )
                {
                    //Find a new unique name for the resource
                    unsigned int uniqueID = 2;
                    while ( game.GetResourcesManager().HasResource(name) )
                    {
                        name = file.GetFullName()+gd::String::From(uniqueID);
                        uniqueID++;
                    }

                    gd::ImageResource image;
                    image.SetFile(file.GetFullPath());
                    image.SetName(name);
                    image.SetUserAdded(false);

                    game.GetResourcesManager().AddResource(image);
                    for ( std::size_t j = 0; j < game.GetUsedPlatforms().size();++j)
                        game.GetUsedPlatforms()[j]->GetChangesNotifier().OnResourceModified(game, name);
                }

                Sprite sprite;
                sprite.SetImageName(name);
                direction.AddSprite(sprite);
            }
        }

        RefreshImagesList();
        RefreshImageAndControls();
        resourcesEditorPnl->Refresh();
    }
}

void SpriteObjectEditor::OnAddFromImageBankSelected(wxCommandEvent& event)
{
    gd::LogMessage(_("Drag images from the image bank to add them to the animation."));
}

void SpriteObjectEditor::OnHelpClick(wxCommandEvent& event)
{
    gd::HelpFileAccess::Get()->OpenURL(_("http://wiki.compilgames.net/doku.php/en/game_develop/documentation/manual/built_sprite"));
}

void SpriteObjectEditor::OnyScrollBarScroll(wxScrollEvent& event)
{
	imagePanel->Refresh();
	imagePanel->Update();
}

void SpriteObjectEditor::OnxScrollBarScroll(wxScrollEvent& event)
{
	imagePanel->Refresh();
	imagePanel->Update();
}

}
#endif
