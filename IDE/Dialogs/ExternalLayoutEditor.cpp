/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#include "ExternalLayoutEditor.h"

//(*InternalHeaders(ExternalLayoutEditor)
#include <wx/bitmap.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/config.h>
#include "GDL/ExternalLayout.h"
#include "../InitialPositionBrowserDlg.h"
#include "../EditorLayers.h"
#include "../EditorObjets.h"
#include "../SceneCanvas.h"
#include "../MainFrame.h"
#include "GDCore/IDE/wxTools/SkinHelper.h"

//(*IdInit(ExternalLayoutEditor)
const long ExternalLayoutEditor::ID_STATICTEXT1 = wxNewId();
const long ExternalLayoutEditor::ID_COMBOBOX1 = wxNewId();
const long ExternalLayoutEditor::ID_PANEL1 = wxNewId();
const long ExternalLayoutEditor::ID_SCROLLBAR2 = wxNewId();
const long ExternalLayoutEditor::ID_SCROLLBAR1 = wxNewId();
const long ExternalLayoutEditor::ID_CUSTOM1 = wxNewId();
const long ExternalLayoutEditor::ID_PANEL5 = wxNewId();
const long ExternalLayoutEditor::ID_STATICTEXT2 = wxNewId();
const long ExternalLayoutEditor::ID_STATICBITMAP1 = wxNewId();
const long ExternalLayoutEditor::ID_PANEL3 = wxNewId();
const long ExternalLayoutEditor::ID_PANEL2 = wxNewId();
//*)

BEGIN_EVENT_TABLE(ExternalLayoutEditor,wxPanel)
	//(*EventTable(ExternalLayoutEditor)
	//*)
END_EVENT_TABLE()

ExternalLayoutEditor::ExternalLayoutEditor(wxWindow* parent, RuntimeGame & game_, gd::ExternalLayout & externalLayout_, const gd::MainFrameWrapper & mainFrameWrapper_) :
sceneCanvas(NULL),
externalLayout(externalLayout_),
game(game_),
mainFrameWrapper(mainFrameWrapper_)
{
    //TODO
    try
    {
        InitialInstancesContainer & instanceContainer = dynamic_cast<InitialInstancesContainer&>(externalLayout.GetInitialInstances());
    }
    catch(...)
    {
        std::cout << "ERROR: ExternalLayoutEditor is not ready for arbitrary Platform. GD will crash";
    }

    InitialInstancesContainer & instanceContainer = dynamic_cast<InitialInstancesContainer&>(externalLayout.GetInitialInstances());

	//Prepare pane manager
    m_mgr.SetManagedWindow( this );

	//(*Initialize(ExternalLayoutEditor)
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* helpSizer;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("wxID_ANY"));
	SetBackgroundColour(wxColour(255,255,255));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(0);
	corePanel = new wxPanel(this, ID_PANEL2, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL2"));
	corePanel->SetBackgroundColour(wxColour(255,255,255));
	FlexGridSizer4 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer4->AddGrowableCol(0);
	FlexGridSizer4->AddGrowableRow(1);
	contextPanel = new wxPanel(corePanel, ID_PANEL1, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	contextPanel->SetBackgroundColour(wxColour(255,255,255));
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer2->AddGrowableCol(1);
	FlexGridSizer2->AddGrowableRow(0);
	StaticText1 = new wxStaticText(contextPanel, ID_STATICTEXT1, _("Edit as if the objects were included to scene :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer2->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	parentSceneComboBox = new wxComboBox(contextPanel, ID_COMBOBOX1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, 0, 0, wxDefaultValidator, _T("ID_COMBOBOX1"));
	parentSceneComboBox->SetSelection( parentSceneComboBox->Append(_("No scene")) );
	FlexGridSizer2->Add(parentSceneComboBox, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 3);
	contextPanel->SetSizer(FlexGridSizer2);
	FlexGridSizer2->Fit(contextPanel);
	FlexGridSizer2->SetSizeHints(contextPanel);
	FlexGridSizer4->Add(contextPanel, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer3->AddGrowableCol(0);
	FlexGridSizer3->AddGrowableRow(0);
	FlexGridSizer3->AddGrowableRow(1);
	scenePanel = new wxPanel(corePanel, ID_PANEL5, wxDefaultPosition, wxDefaultSize, wxNO_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL5"));
	scenePanel->SetBackgroundColour(wxColour(255,255,255));
	scrollBar2 = new wxScrollBar(scenePanel, ID_SCROLLBAR2, wxDefaultPosition, wxDefaultSize, wxSB_VERTICAL, wxDefaultValidator, _T("ID_SCROLLBAR2"));
	scrollBar2->SetScrollbar(2500, 10, 5000, 10);
	scrollBar1 = new wxScrollBar(scenePanel, ID_SCROLLBAR1, wxDefaultPosition, wxDefaultSize, wxSB_HORIZONTAL, wxDefaultValidator, _T("ID_SCROLLBAR1"));
	scrollBar1->SetScrollbar(2500, 10, 5000, 10);
	sceneCanvas = new SceneCanvas(scenePanel, game, emptyScene, instanceContainer, externalLayout.GetAssociatedSettings(), mainFrameWrapper, false);
	FlexGridSizer3->Add(scenePanel, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	helpPanel = new wxPanel(corePanel, ID_PANEL3, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL3"));
	helpPanel->SetBackgroundColour(wxColour(255,255,255));
	helpSizer = new wxFlexGridSizer(0, 3, 0, 0);
	helpSizer->AddGrowableRow(0);
	StaticText2 = new wxStaticText(helpPanel, ID_STATICTEXT2, _("Choose the scene to be used as a base for editing the external layout"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	helpSizer->Add(StaticText2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBitmap1 = new wxStaticBitmap(helpPanel, ID_STATICBITMAP1, wxBitmap(wxImage(_T("res/up.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP1"));
	helpSizer->Add(StaticBitmap1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	helpPanel->SetSizer(helpSizer);
	helpSizer->Fit(helpPanel);
	helpSizer->SetSizeHints(helpPanel);
	FlexGridSizer3->Add(helpPanel, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer4->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	corePanel->SetSizer(FlexGridSizer4);
	FlexGridSizer4->Fit(corePanel);
	FlexGridSizer4->SetSizeHints(corePanel);
	FlexGridSizer1->Add(corePanel, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_COMBOBOX1,wxEVT_COMMAND_COMBOBOX_SELECTED,(wxObjectEventFunction)&ExternalLayoutEditor::OnparentSceneComboBoxSelected);
	Connect(ID_SCROLLBAR2,wxEVT_SCROLL_TOP|wxEVT_SCROLL_BOTTOM|wxEVT_SCROLL_LINEUP|wxEVT_SCROLL_LINEDOWN|wxEVT_SCROLL_PAGEUP|wxEVT_SCROLL_PAGEDOWN|wxEVT_SCROLL_THUMBTRACK|wxEVT_SCROLL_THUMBRELEASE|wxEVT_SCROLL_CHANGED,(wxObjectEventFunction)&ExternalLayoutEditor::OnscrollBar2Scroll);
	Connect(ID_SCROLLBAR1,wxEVT_SCROLL_TOP|wxEVT_SCROLL_BOTTOM|wxEVT_SCROLL_LINEUP|wxEVT_SCROLL_LINEDOWN|wxEVT_SCROLL_PAGEUP|wxEVT_SCROLL_PAGEDOWN|wxEVT_SCROLL_THUMBTRACK|wxEVT_SCROLL_THUMBRELEASE|wxEVT_SCROLL_CHANGED,(wxObjectEventFunction)&ExternalLayoutEditor::OnscrollBar1Scroll);
	sceneCanvas->Connect(wxEVT_SET_FOCUS,(wxObjectEventFunction)&ExternalLayoutEditor::OnsceneCanvasSetFocus,0,this);
	scenePanel->Connect(wxEVT_SIZE,(wxObjectEventFunction)&ExternalLayoutEditor::OnscenePanelResize,0,this);
	Connect(wxEVT_SIZE,(wxObjectEventFunction)&ExternalLayoutEditor::OnResize);
	//*)
	Connect(ID_COMBOBOX1,wxEVT_COMMAND_COMBOBOX_DROPDOWN,(wxObjectEventFunction)&ExternalLayoutEditor::OnparentSceneComboBoxDropDown);

    //For now, just create a basic Scene canvas as no associated scene has been chosen.
    sceneCanvas->SetParentPanelAndDockManager( scenePanel, &m_mgr );
    sceneCanvas->SetScrollbars(scrollBar1, scrollBar2);
    sceneCanvas->Reload();

    m_mgr.AddPane( corePanel, wxAuiPaneInfo().Name( wxT( "LayoutPanel" ) ).Center().CloseButton( false ).Caption( _( "Scene's editor" ) ).MaximizeButton( true ).MinimizeButton( false ).CaptionVisible(false) );

    gd::SkinHelper::ApplyCurrentSkin(m_mgr);

    //If the
    vector< boost::shared_ptr<Scene> >::iterator sceneFound =
        find_if(game.GetLayouts().begin(), game.GetLayouts().end(), bind2nd(SceneHasName(), externalLayout.GetAssociatedSettings().associatedLayout));

    if ( sceneFound != game.GetLayouts().end() )
        SetupForScene(*(*sceneFound));
    else
        SetupForScene(emptyScene);
}

ExternalLayoutEditor::~ExternalLayoutEditor()
{
	//(*Destroy(ExternalLayoutEditor)
	//*)

    //Save the configuration
    if ( &sceneCanvas->GetEditedScene() != &emptyScene ) wxConfigBase::Get()->Write("/ExternalLayoutEditor/LastWorkspace", m_mgr.SavePerspective());
	m_mgr.UnInit();
}

void ExternalLayoutEditor::OnResize(wxSizeEvent& event)
{
    Layout();

    //We're managing ourselves the size:
    contextPanel->SetSize(GetSize().GetWidth(), contextPanel->GetSize().GetHeight());
    scenePanel->SetPosition(wxPoint(0,contextPanel->GetSize().GetHeight()));
    scenePanel->SetSize(GetSize().GetWidth(),GetSize().GetHeight()-contextPanel->GetSize().GetHeight());
}

void ExternalLayoutEditor::OnscenePanelResize(wxSizeEvent& event)
{
    //Manual resizing of scene's panel
    sceneCanvas->UpdateSize();

    scrollBar1->SetSize(0, scenePanel->GetSize().GetHeight()-scrollBar1->GetSize().GetHeight(), scenePanel->GetSize().GetWidth()-scrollBar2->GetSize().GetWidth(), scrollBar1->GetSize().GetHeight());
    scrollBar2->SetSize(scenePanel->GetSize().GetWidth()-scrollBar2->GetSize().GetWidth(), 0, scrollBar2->GetSize().GetWidth(), scenePanel->GetSize().GetHeight()-scrollBar1->GetSize().GetHeight());
}

void ExternalLayoutEditor::OnscrollBar2Scroll(wxScrollEvent& event)
{
    int position = event.GetPosition();

    int newY = position-(scrollBar2->GetRange()/2)+(sceneCanvas->getSize().y/2);
    sceneCanvas->GetEditionView().setCenter( sceneCanvas->GetEditionView().getCenter().x, newY);

    sceneCanvas->ManualRefresh();
}

void ExternalLayoutEditor::OnscrollBar1Scroll(wxScrollEvent& event)
{
    int position = event.GetPosition();

    int newX = position-(scrollBar1->GetRange()/2)+(sceneCanvas->getSize().x/2);
    sceneCanvas->GetEditionView().setCenter( newX,  sceneCanvas->GetEditionView().getCenter().y);

    sceneCanvas->ManualRefresh();
}

void ExternalLayoutEditor::ForceRefreshRibbonAndConnect()
{
    sceneCanvas->CreateToolsBar(mainFrameWrapper.GetRibbonSceneEditorButtonBar(), sceneCanvas->IsEditing());
    mainFrameWrapper.GetRibbon()->SetActivePage(2);
    sceneCanvas->ConnectEvents();
}

void ExternalLayoutEditor::OnsceneCanvasSetFocus(wxFocusEvent& event)
{
    sceneCanvas->CreateToolsBar(mainFrameWrapper.GetRibbonSceneEditorButtonBar(), sceneCanvas->IsEditing());
    mainFrameWrapper.GetRibbon()->SetActivePage(2);
    sceneCanvas->ConnectEvents();
}

void ExternalLayoutEditor::SetupForScene(Scene & scene)
{
    if ( &scene == &emptyScene )
    {
        scenePanel->Hide();
        helpPanel->Show();
    }
    else
    {
        scenePanel->Show();
        helpPanel->Hide();

        try
        {
            InitialInstancesContainer & instanceContainer = dynamic_cast<InitialInstancesContainer&>(externalLayout.GetInitialInstances());

            //Check if external editors already have been created
            bool creatingEditorsForFirsttime = (sceneCanvas->GetObjectsEditor() == boost::shared_ptr<EditorObjets>() ||
                                                 sceneCanvas->GetLayersEditor() == boost::shared_ptr<EditorLayers>() ||
                                                 sceneCanvas->GetInitialPositionBrowser() == boost::shared_ptr<InitialPositionBrowserDlg>());

            //(Re)create scene canvas
            if ( sceneCanvas ) delete sceneCanvas;
            sceneCanvas = new SceneCanvas(scenePanel, game, scene, instanceContainer, externalLayout.GetAssociatedSettings(), mainFrameWrapper, false);
            sceneCanvas->SetParentPanelAndDockManager( scenePanel, &m_mgr );
            sceneCanvas->SetScrollbars(scrollBar1, scrollBar2);

            //Creating external editors and linking them to the scene canvas
            boost::shared_ptr<EditorObjets> objectsEditor = boost::shared_ptr<EditorObjets>(new EditorObjets(this, game, scene, mainFrameWrapper));
            boost::shared_ptr<EditorLayers> layersEditor = boost::shared_ptr<EditorLayers>(new EditorLayers(this, game, scene, mainFrameWrapper) );
            boost::shared_ptr<InitialPositionBrowserDlg> browserEditor = boost::shared_ptr<InitialPositionBrowserDlg>(new InitialPositionBrowserDlg(this, instanceContainer, *sceneCanvas) );
            sceneCanvas->SetObjectsEditor(objectsEditor);
            sceneCanvas->SetLayersEditor(layersEditor);
            sceneCanvas->SetInitialPositionBrowser(browserEditor);
            sceneCanvas->Reload();

            //Display editors in panes
            if ( creatingEditorsForFirsttime )
            {
                if ( !m_mgr.GetPane("ObjectsEditor").IsOk() )
                    m_mgr.AddPane( sceneCanvas->GetObjectsEditor().get(), wxAuiPaneInfo().Name( wxT( "ObjectsEditor" ) ).Right().CloseButton( true ).Caption( _( "Objects' editor" ) ).MaximizeButton( true ).MinimizeButton( false ).CaptionVisible(true).MinSize(208, 100) );
                if ( !m_mgr.GetPane("LayersEditor").IsOk() )
                    m_mgr.AddPane( sceneCanvas->GetLayersEditor().get(), wxAuiPaneInfo().Name( wxT( "LayersEditor" ) ).Right().CloseButton( true ).Caption( _( "Layers' editor" ) ).MaximizeButton( true ).MinimizeButton( false ).CaptionVisible(true).MinSize(208, 100) );
                if ( !m_mgr.GetPane("InstancesBrowser").IsOk() )
                    m_mgr.AddPane( sceneCanvas->GetInitialPositionBrowser().get(), wxAuiPaneInfo().Name( wxT( "InstancesBrowser" ) ).Float().CloseButton( true ).Caption( _( "Initial positions of objects" ) ).MaximizeButton( true ).MinimizeButton( false ).CaptionVisible(true).MinSize(200, 100).Show(false) );

                wxString perspective;
                wxConfigBase::Get()->Read("/ExternalLayoutEditor/LastWorkspace", &perspective);
                m_mgr.LoadPerspective(perspective);
            }
            else
            {
                m_mgr.GetPane("ObjectsEditor").Window(sceneCanvas->GetObjectsEditor().get());
                m_mgr.GetPane("LayersEditor").Window(sceneCanvas->GetLayersEditor().get());
                m_mgr.GetPane("InstancesBrowser").Window(sceneCanvas->GetInitialPositionBrowser().get());
            }

            m_mgr.Update();
            ForceRefreshRibbonAndConnect();
        }
        catch(...)
        {
            std::cout << "ERROR: ExternalLayoutEditor is not ready for arbitrary Platform. GD will crash";
        }
    }

    //Save the choice
    externalLayout.GetAssociatedSettings().associatedLayout = scene.GetName();
    if(parentSceneComboBox->GetValue() != scene.GetName()) parentSceneComboBox->SetValue(scene.GetName());
}

void ExternalLayoutEditor::OnparentSceneComboBoxSelected(wxCommandEvent& event)
{
    vector< boost::shared_ptr<Scene> >::iterator sceneFound =
        find_if(game.GetLayouts().begin(), game.GetLayouts().end(), bind2nd(SceneHasName(), ToString(parentSceneComboBox->GetValue())));

    Scene * scene = NULL;

    if ( sceneFound != game.GetLayouts().end() )
        scene = (*sceneFound).get();
    else if ( parentSceneComboBox->GetSelection() == 0 ) //0 i.e. "No scene"
        scene = &emptyScene;
    else
    {
        wxLogWarning(_("Scene not found."));
        return;
    }

    SetupForScene(*scene);
}

/**
 * Update scene list.
 */
void ExternalLayoutEditor::OnparentSceneComboBoxDropDown(wxCommandEvent& event)
{
    parentSceneComboBox->Clear();
    parentSceneComboBox->Append(_("No scene"));

    for (unsigned int i = 0;i<game.GetLayoutCount();++i)
    	parentSceneComboBox->Append(game.GetLayout(i).GetName());
}

gd::Layout & ExternalLayoutEditor::GetAssociatedLayout()
{
    return sceneCanvas->GetEditedScene();
}

