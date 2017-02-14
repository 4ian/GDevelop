/*
 * GDevelop IDE
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
 */
#include "EditorScene.h"

//(*InternalHeaders(EditorScene)
#include <wx/bitmap.h>
#include <wx/settings.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/aui/aui.h>
#include <wx/toolbar.h>
#include <wx/config.h>
#include <wx/brush.h>
#include "GDCore/Tools/Log.h"
#include <wx/dcclient.h>
#include <wx/ribbon/bar.h>
#include <wx/ribbon/buttonbar.h>
#include <wx/ribbon/toolbar.h>

#include "GDCore/Project/Layout.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "GDCore/IDE/wxTools/SkinHelper.h"
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/IDE/Dialogs/LayoutEditorCanvas/LayoutEditorCanvas.h"
#include "MainFrame.h"
#include "Dialogs/ObjectsEditor.h"
#include "InitialPositionBrowserDlg.h"
#include "EventsEditor.h"
#include "Dialogs/LayersEditorPanel.h"
#include "Dialogs/LayoutEditorPropertiesPnl.h"

#include "GDCore/IDE/Dialogs/ExternalEditor/ExternalEditor.h"

#include "GDCore/Project/Project.h"
#include "GDCore/Project/Project.h"

//(*IdInit(EditorScene)
const long EditorScene::ID_SCROLLBAR3 = wxNewId();
const long EditorScene::ID_SCROLLBAR4 = wxNewId();
const long EditorScene::ID_CUSTOM3 = wxNewId();
const long EditorScene::ID_PANEL1 = wxNewId();
const long EditorScene::ID_CUSTOM2 = wxNewId();
const long EditorScene::ID_PANEL6 = wxNewId();
const long EditorScene::ID_AUINOTEBOOK1 = wxNewId();
//*)

BEGIN_EVENT_TABLE(EditorScene,wxPanel)
	//(*EventTable(EditorScene)
	//*)
END_EVENT_TABLE()

EditorScene::EditorScene(wxWindow* parent, gd::Project & project_, gd::Layout & layout_, const gd::MainFrameWrapper & mainFrameWrapper_) :
project(project_),
layout(layout_),
mainFrameWrapper(mainFrameWrapper_)
{
	//(*Initialize(EditorScene)
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, wxDefaultPosition, wxDefaultSize, 0, _T("wxID_ANY"));
	SetBackgroundColour(wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOW));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(0);
	notebook = new wxAuiNotebook(this, ID_AUINOTEBOOK1, wxDefaultPosition, wxDefaultSize, wxAUI_NB_TAB_SPLIT|wxAUI_NB_TAB_MOVE|wxAUI_NB_SCROLL_BUTTONS|wxNO_BORDER);
	scenePanel = new wxPanel(notebook, ID_PANEL1, wxDefaultPosition, wxDefaultSize, wxNO_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	scenePanel->SetBackgroundColour(wxColour(255,255,255));
	scenePanel->SetHelpText(_("Edit the layout of the scene"));
	vScrollbar = new wxScrollBar(scenePanel, ID_SCROLLBAR3, wxDefaultPosition, wxDefaultSize, wxSB_VERTICAL, wxDefaultValidator, _T("ID_SCROLLBAR3"));
	vScrollbar->SetScrollbar(2500, 10, 5000, 10);
	hScrollbar = new wxScrollBar(scenePanel, ID_SCROLLBAR4, wxDefaultPosition, wxDefaultSize, wxSB_HORIZONTAL, wxDefaultValidator, _T("ID_SCROLLBAR4"));
	hScrollbar->SetScrollbar(2500, 10, 5000, 10);
	layoutEditorCanvas = new gd::LayoutEditorCanvas(scenePanel, project, layout, layout.GetInitialInstances(), layout.GetAssociatedLayoutEditorCanvasOptions(), mainFrameWrapper);
	eventsPanel = new wxPanel(notebook, ID_PANEL6, wxDefaultPosition, wxDefaultSize, wxNO_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL6"));
	eventsPanel->SetBackgroundColour(wxColour(255,255,255));
	eventsPanel->SetHelpText(_("Edit the events of the scene"));
	FlexGridSizer3 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer3->AddGrowableCol(0);
	FlexGridSizer3->AddGrowableRow(0);
	eventsEditor = new EventsEditor(eventsPanel, project, layout, mainFrameWrapper);
	FlexGridSizer3->Add(eventsEditor, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	eventsPanel->SetSizer(FlexGridSizer3);
	FlexGridSizer3->Fit(eventsPanel);
	FlexGridSizer3->SetSizeHints(eventsPanel);
	notebook->AddPage(scenePanel, _("Scene"), false, gd::SkinHelper::GetIcon("scene", 16));
	notebook->AddPage(eventsPanel, _("Events"), false, gd::SkinHelper::GetIcon("events", 16));
	FlexGridSizer1->Add(notebook, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_SCROLLBAR3,wxEVT_SCROLL_TOP|wxEVT_SCROLL_BOTTOM|wxEVT_SCROLL_LINEUP|wxEVT_SCROLL_LINEDOWN|wxEVT_SCROLL_PAGEUP|wxEVT_SCROLL_PAGEDOWN|wxEVT_SCROLL_THUMBTRACK|wxEVT_SCROLL_THUMBRELEASE|wxEVT_SCROLL_CHANGED,(wxObjectEventFunction)&EditorScene::OnvScrollbarScroll);
	Connect(ID_SCROLLBAR3,wxEVT_SCROLL_THUMBTRACK,(wxObjectEventFunction)&EditorScene::OnvScrollbarScroll);
	Connect(ID_SCROLLBAR3,wxEVT_SCROLL_CHANGED,(wxObjectEventFunction)&EditorScene::OnvScrollbarScroll);
	Connect(ID_SCROLLBAR4,wxEVT_SCROLL_TOP|wxEVT_SCROLL_BOTTOM|wxEVT_SCROLL_LINEUP|wxEVT_SCROLL_LINEDOWN|wxEVT_SCROLL_PAGEUP|wxEVT_SCROLL_PAGEDOWN|wxEVT_SCROLL_THUMBTRACK|wxEVT_SCROLL_THUMBRELEASE|wxEVT_SCROLL_CHANGED,(wxObjectEventFunction)&EditorScene::OnhScrollbarScroll);
	Connect(ID_SCROLLBAR4,wxEVT_SCROLL_THUMBTRACK,(wxObjectEventFunction)&EditorScene::OnhScrollbarScroll);
	Connect(ID_SCROLLBAR4,wxEVT_SCROLL_CHANGED,(wxObjectEventFunction)&EditorScene::OnhScrollbarScroll);
	layoutEditorCanvas->Connect(wxEVT_SET_FOCUS,(wxObjectEventFunction)&EditorScene::OnsceneCanvasSetFocus,0,this);
	scenePanel->Connect(wxEVT_SIZE,(wxObjectEventFunction)&EditorScene::OnscenePanelResize,0,this);
	Connect(ID_AUINOTEBOOK1,wxEVT_COMMAND_AUINOTEBOOK_PAGE_CHANGED,(wxObjectEventFunction)&EditorScene::OnnotebookPageChanged);
	Connect(ID_AUINOTEBOOK1,wxEVT_COMMAND_AUINOTEBOOK_PAGE_CHANGING,(wxObjectEventFunction)&EditorScene::OnnotebookPageChanging);
	//*)
    //Prepare pane manager
    m_mgr.SetManagedWindow( this );

    layoutEditorCanvas->SetParentAuiManager(&m_mgr);
    layoutEditorCanvas->SetScrollbars(hScrollbar, vScrollbar);

    //Create all editors linked to scene canvas.
    objectsEditor = std::make_shared<gd::ObjectsEditor>(this, project, layout, mainFrameWrapper);
    layersEditor =  std::shared_ptr<LayersEditorPanel>(new LayersEditorPanel(this, project, layout, mainFrameWrapper) );
    initialInstancesBrowser = std::make_shared<InitialPositionBrowserDlg>(this, layout.GetInitialInstances(), *layoutEditorCanvas);
    propertiesPnl = std::make_shared<LayoutEditorPropertiesPnl>(this, project, layout, layoutEditorCanvas, mainFrameWrapper);

    //Link some editors together
    layoutEditorCanvas->AddAssociatedEditor(objectsEditor.get());
    layoutEditorCanvas->AddAssociatedEditor(layersEditor.get());
    layoutEditorCanvas->AddAssociatedEditor(propertiesPnl.get());
    layoutEditorCanvas->AddAssociatedEditor(initialInstancesBrowser.get());
    layersEditor->SetAssociatedLayoutEditorCanvas(layoutEditorCanvas);
		layersEditor->SetAssociatedPropertiesPanel(propertiesPnl.get(), &m_mgr);
    eventsEditor->SetAssociatedLayoutCanvas(layoutEditorCanvas);
    objectsEditor->SetAssociatedPropertiesPanel(propertiesPnl.get(), &m_mgr);

    //Display editors in panes
    m_mgr.AddPane( notebook, wxAuiPaneInfo().Name( wxT( "ESCenter" ) ).PaneBorder(false).Center().CloseButton( false ).Caption( _( "Scene's editor" ) ).MaximizeButton( true ).MinimizeButton( false ).CaptionVisible(false) );
    m_mgr.AddPane( objectsEditor.get(), wxAuiPaneInfo().Name( wxT( "EO" ) ).Right().CloseButton( true ).Caption( _( "Objects' editor" ) ).MaximizeButton( true ).MinimizeButton( false ).CaptionVisible(true).MinSize(208, 100) );
    m_mgr.AddPane( layersEditor.get(), wxAuiPaneInfo().Name( wxT( "EL" ) ).Float().CloseButton( true ).Caption( _( "Layers' editor" ) ).MaximizeButton( true ).MinimizeButton( false ).CaptionVisible(true).MinSize(200, 100).Show(false) );
    m_mgr.AddPane( propertiesPnl.get(), wxAuiPaneInfo().Name( wxT( "PROPERTIES" ) ).Float().CloseButton( true ).Caption( _( "Properties" ) ).MaximizeButton( true ).MinimizeButton( false ).CaptionVisible(true).MinSize(50, 50).BestSize(230,200).Show(false) );
    m_mgr.AddPane( initialInstancesBrowser.get(), wxAuiPaneInfo().Name( wxT( "InstancesBrowser" ) ).Float().CloseButton( true ).Caption( _( "Instances list" ) ).MaximizeButton( true ).MinimizeButton( false ).CaptionVisible(true).MinSize(50, 50).BestSize(230,200).Show(false) );

    //Load preferences
    {
        int position = 1;
        wxConfigBase::Get()->Read("/SceneEditor/SceneEventsTab", &position);
        if (position == 0)
        {
            long style = notebook->GetWindowStyleFlag();
            style |= wxAUI_NB_TOP;
            style &= ~wxAUI_NB_BOTTOM;
            notebook->SetWindowStyleFlag(style);
        }
    }

    gd::SkinHelper::ApplyCurrentSkin(m_mgr);
    gd::SkinHelper::ApplyCurrentSkin(*notebook, true);

    mainFrameWrapper.SetRibbonPage(_("Scene"));
    layoutEditorCanvas->ConnectEvents();

    //Load the saved perspective and make sure titles are translated
    wxString perspective;
	wxConfigBase::Get()->Read("/SceneEditor/LastWorkspace", &perspective);
	m_mgr.LoadPerspective(perspective);
    m_mgr.GetPane(objectsEditor.get()).Caption(_( "Objects' editor" ));
    m_mgr.GetPane(layersEditor.get()).Caption(_( "Layers' editor" ));
    m_mgr.GetPane(propertiesPnl.get()).Caption(_( "Properties" ));
    m_mgr.GetPane(initialInstancesBrowser.get()).Caption(_( "Instances list" ));

    m_mgr.Update();

    //TODO: Temporary test
    // externalEventsEditor = std::shared_ptr<gd::ExternalEditor>(new gd::ExternalEditor);
    // externalEventsEditor->OnSendUpdate([this]() {
    //     gd::SerializerElement serializedProject;
    //     project.SerializeTo(serializedProject);
	//
    //     return serializedProject;
    // });
    // externalEventsEditor->OnUpdateReceived([this](gd::SerializerElement object) {
    //     std::cout << "Updating events from the external editor." << std::endl;
    //     this->layout.GetEvents().UnserializeFrom(this->project, object);
    // });
    // externalEventsEditor->Launch("eventseditor");

    //TODO: Temporary test
		std::cout << project.GetProjectFile() << std::endl;
    externalLayoutEditor = std::shared_ptr<gd::ExternalEditor>(new gd::ExternalEditor);
    externalLayoutEditor->OnSendUpdate([this]() {
        gd::SerializerElement serializedProject;
        project.SerializeTo(serializedProject);

        return serializedProject;
    });
    externalLayoutEditor->OnUpdateReceived([this](gd::SerializerElement object) {
        std::cout << "Updating instances from the external editor." << std::endl;
        this->layout.GetInitialInstances().UnserializeFrom(object);
    });
    externalLayoutEditor->Launch("scene-editor", layout.GetName());
}

void EditorScene::OnscenePanelResize(wxSizeEvent& event)
{
    layoutEditorCanvas->UpdateSize();
    hScrollbar->SetSize(0, scenePanel->GetSize().GetHeight()-hScrollbar->GetSize().GetHeight(), scenePanel->GetSize().GetWidth()-vScrollbar->GetSize().GetWidth(), hScrollbar->GetSize().GetHeight());
    vScrollbar->SetSize(scenePanel->GetSize().GetWidth()-vScrollbar->GetSize().GetWidth(), 0, vScrollbar->GetSize().GetWidth(), scenePanel->GetSize().GetHeight()-hScrollbar->GetSize().GetHeight());

		    //TODO: Temporary test
		auto rect = scenePanel->GetScreenRect();
		externalLayoutEditor->SetBounds(rect.GetX(), rect.GetY(), rect.GetWidth(), rect.GetHeight());
}

EditorScene::~EditorScene()
{
	//(*Destroy(EditorScene)
	//*)

	wxConfigBase::Get()->Write("/SceneEditor/LastWorkspace", m_mgr.SavePerspective());
	m_mgr.UnInit();
}

void EditorScene::ForceRefreshRibbonAndConnect()
{
    if ( notebook->GetPageText(notebook->GetSelection()) == _("Scene") )
    {
        layoutEditorCanvas->RecreateRibbonToolbar();
        layoutEditorCanvas->EnableIdleEvents();
        mainFrameWrapper.SetRibbonPage(_("Scene"));
        layoutEditorCanvas->ConnectEvents();
    }
    else if ( notebook->GetPageText(notebook->GetSelection()) == _("Events") )
    {
        mainFrameWrapper.SetRibbonPage(_("Events"));
        layoutEditorCanvas->EnableIdleEvents(false);
        eventsEditor->ConnectEvents();
    }
}

/**
 * Return true if the editor can be closed, false otherwise ( i.e. Scene is being previewed )
 */
bool EditorScene::CanBeClosed()
{
    if ( !layoutEditorCanvas ) return true;

    return layoutEditorCanvas->IsEditing();
}

/**
 * Update ribbon when notebook page has changed
 */
void EditorScene::OnnotebookPageChanged(wxAuiNotebookEvent& event)
{
		externalLayoutEditor->Show();
    ForceRefreshRibbonAndConnect();
}

void EditorScene::OnnotebookPageChanging(wxAuiNotebookEvent& event)
{
    if ( !layoutEditorCanvas->IsEditing() && !layoutEditorCanvas->PreviewPaused() )
        layoutEditorCanvas->PausePreview();
}

void EditorScene::OnsceneCanvasSetFocus(wxFocusEvent& event)
{
    mainFrameWrapper.SetRibbonPage(_("Scene"));
    layoutEditorCanvas->ConnectEvents();
}

void EditorScene::OnvScrollbarScroll(wxScrollEvent& event)
{
    layoutEditorCanvas->OnvScrollbarScroll(event);
}

void EditorScene::OnhScrollbarScroll(wxScrollEvent& event)
{
    layoutEditorCanvas->OnhScrollbarScroll(event);
}
