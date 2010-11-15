#if defined(GDE)

#include "GDL/EditorImages.h"
#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif

//(*InternalHeaders(EditorImages)
#include <wx/bitmap.h>
#include <wx/settings.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/toolbar.h>
#include <wx/config.h>
#include <wx/aui/aui.h>
#include <wx/log.h>
#include <wx/filedlg.h>
#include <wx/image.h>
#include <wx/imaglist.h>
#include <wx/textdlg.h>
#include <wx/help.h>
#include <wx/file.h>
#include <wx/dcbuffer.h>
#include <wx/dnd.h>
#include <wx/ribbon/bar.h>
#include <wx/ribbon/buttonbar.h>
#include <wx/ribbon/gallery.h>
#include <wx/ribbon/toolbar.h>
#include "GDL/HelpFileAccess.h"

#include "GDL/Game.h"
#include "GDL/CommonTools.h"
#include "GDL/MemTrace.h"
#include "GDL/ChoixDossier.h"
#include "GDL/PropImage.h"
#include "GDL/BitmapGUIManager.h"

#ifdef __WXGTK__
#include <gtk/gtk.h>
#endif

//(*IdInit(EditorImages)
const long EditorImages::ID_PANEL2 = wxNewId();
const long EditorImages::ID_TREECTRL1 = wxNewId();
const long EditorImages::ID_PANEL3 = wxNewId();
const long EditorImages::ID_SPLITTERWINDOW1 = wxNewId();
const long EditorImages::ID_PANEL1 = wxNewId();
const long EditorImages::idMenuModProp = wxNewId();
const long EditorImages::idMenuMod = wxNewId();
const long EditorImages::idMenuModFile = wxNewId();
const long EditorImages::idMenuAjouter = wxNewId();
const long EditorImages::idMenuDel = wxNewId();
const long EditorImages::idMenuAddDossier = wxNewId();
const long EditorImages::idMenuRemoveDossier = wxNewId();
const long EditorImages::idMoveUp = wxNewId();
const long EditorImages::idMoveDown = wxNewId();
//*)
const long EditorImages::ID_BITMAPBUTTON1 = wxNewId();
const long EditorImages::ID_BITMAPBUTTON5 = wxNewId();
const long EditorImages::ID_BITMAPBUTTON4 = wxNewId();
const long EditorImages::ID_BITMAPBUTTON2 = wxNewId();
const long EditorImages::ID_BITMAPBUTTON3 = wxNewId();
const long EditorImages::ID_BITMAPBUTTON6 = wxNewId();
const long EditorImages::idRibbonAdd = wxNewId();
const long EditorImages::idRibbonModProp= wxNewId();
const long EditorImages::idRibbonMod= wxNewId();
const long EditorImages::idRibbonModFile= wxNewId();
const long EditorImages::idRibbonDel= wxNewId();
const long EditorImages::idRibbonAddDossier= wxNewId();
const long EditorImages::idRibbonRemoveDossier= wxNewId();
const long EditorImages::idRibbonUp= wxNewId();
const long EditorImages::idRibbonDown= wxNewId();
const long EditorImages::idRibbonDirectories= wxNewId();
const long EditorImages::idRibbonPaintProgram= wxNewId();
const long EditorImages::idRibbonSearch= wxNewId();
const long EditorImages::idRibbonHelp= wxNewId();
const long EditorImages::idRibbonRefresh = wxNewId();

BEGIN_EVENT_TABLE( EditorImages, wxPanel )
    //(*EventTable(EditorImages)
    //*)
END_EVENT_TABLE()


////////////////////////////////////////////////////////////
/// Constructeur
///
/// A utiliser par défaut
////////////////////////////////////////////////////////////
EditorImages::EditorImages( wxWindow* parent, Game & game_, MainEditorCommand & mainEditorCommand_, bool useRibbon_ ) :
game(game_),
mainEditorCommand(mainEditorCommand_),
useRibbon(useRibbon_),
dossierId(-1),
toolbar(NULL)
{
    //(*Initialize(EditorImages)
    wxFlexGridSizer* FlexGridSizer4;
    wxMenuItem* MenuItem2;
    wxMenuItem* MenuItem1;
    wxFlexGridSizer* FlexGridSizer2;
    wxMenuItem* MenuItem3;
    wxMenuItem* editMenuItem;
    wxFlexGridSizer* FlexGridSizer1;

    Create(parent, wxID_ANY, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("wxID_ANY"));
    FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer2->AddGrowableCol(0);
    FlexGridSizer2->AddGrowableRow(0);
    Core = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL1"));
    FlexGridSizer4 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer4->AddGrowableCol(0);
    FlexGridSizer4->AddGrowableRow(1);
    FlexGridSizer1 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer1->AddGrowableCol(0);
    FlexGridSizer1->AddGrowableRow(0);
    toolbarPanel = new wxPanel(Core, ID_PANEL2, wxDefaultPosition, wxSize(-1,25), wxTAB_TRAVERSAL, _T("ID_PANEL2"));
    toolbarPanel->SetBackgroundColour(wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOW));
    if ( useRibbon ) toolbarPanel->SetSize(-1, 0);
    FlexGridSizer1->Add(toolbarPanel, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer4->Add(FlexGridSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    SplitterWindow1 = new wxSplitterWindow(Core, ID_SPLITTERWINDOW1, wxDefaultPosition, wxSize(239,271), wxSP_3D, _T("ID_SPLITTERWINDOW1"));
    SplitterWindow1->SetMinSize(wxSize(10,10));
    SplitterWindow1->SetMinimumPaneSize(10);
    BanqueImageList = new wxTreeCtrl(SplitterWindow1, ID_TREECTRL1, wxDefaultPosition, wxSize(200,170), wxTR_EDIT_LABELS|wxTR_DEFAULT_STYLE, wxDefaultValidator, _T("ID_TREECTRL1"));
    BanqueImageList->SetToolTip(_("Clic droit sur une image pour accéder aux options"));
    apercuPanel = new wxPanel(SplitterWindow1, ID_PANEL3, wxDefaultPosition, wxSize(200,120), wxSUNKEN_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL3"));
    SplitterWindow1->SplitVertically(BanqueImageList, apercuPanel);
    FlexGridSizer4->Add(SplitterWindow1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    Core->SetSizer(FlexGridSizer4);
    FlexGridSizer4->Fit(Core);
    FlexGridSizer4->SetSizeHints(Core);
    FlexGridSizer2->Add(Core, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    SetSizer(FlexGridSizer2);
    editMenuItem = new wxMenuItem((&ContextMenu), idMenuModProp, _("Modifier les propriétés de l\'image"), wxEmptyString, wxITEM_NORMAL);
    editMenuItem->SetBitmap(wxBitmap(wxImage(_T("res/editpropicon.png"))));
    ContextMenu.Append(editMenuItem);
    #ifdef __WXMSW__
    ContextMenu.Remove(editMenuItem);
     wxFont boldFont(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_NORMAL,wxBOLD,false,wxEmptyString,wxFONTENCODING_DEFAULT);
     editMenuItem->SetFont(boldFont);
     ContextMenu.Append(editMenuItem);
    #endif
    MenuItem3 = new wxMenuItem((&ContextMenu), idMenuMod, _("Modifier le nom de l\'image"), wxEmptyString, wxITEM_NORMAL);
    MenuItem3->SetBitmap(wxBitmap(wxImage(_T("res/editnom.png"))));
    ContextMenu.Append(MenuItem3);
    MenuItem4 = new wxMenuItem((&ContextMenu), idMenuModFile, _("Modifier le fichier de l\'image"), wxEmptyString, wxITEM_NORMAL);
    MenuItem4->SetBitmap(wxBitmap(wxImage(_T("res/openicon.png"))));
    ContextMenu.Append(MenuItem4);
    ContextMenu.AppendSeparator();
    MenuItem1 = new wxMenuItem((&ContextMenu), idMenuAjouter, _("Ajouter une image"), wxEmptyString, wxITEM_NORMAL);
    MenuItem1->SetBitmap(wxBitmap(wxImage(_T("res/addicon.png"))));
    ContextMenu.Append(MenuItem1);
    MenuItem2 = new wxMenuItem((&ContextMenu), idMenuDel, _("Supprimer l\'image"), wxEmptyString, wxITEM_NORMAL);
    MenuItem2->SetBitmap(wxBitmap(wxImage(_T("res/deleteicon.png"))));
    ContextMenu.Append(MenuItem2);
    ContextMenu.AppendSeparator();
    MenuItem5 = new wxMenuItem((&ContextMenu), idMenuAddDossier, _("Ajouter une image déjà existante au dossier"), wxEmptyString, wxITEM_NORMAL);
    MenuItem5->SetBitmap(wxBitmap(wxImage(_T("res/addicon.png"))));
    ContextMenu.Append(MenuItem5);
    MenuItem6 = new wxMenuItem((&ContextMenu), idMenuRemoveDossier, _("Supprimer l\'image du dossier"), wxEmptyString, wxITEM_NORMAL);
    MenuItem6->SetBitmap(wxBitmap(wxImage(_T("res/remove.png"))));
    ContextMenu.Append(MenuItem6);
    ContextMenu.AppendSeparator();
    MenuItem7 = new wxMenuItem((&ContextMenu), idMoveUp, _("Déplacer vers le haut\tCtrl-P"), _("Déplacer l\'image vers le haut dans la liste"), wxITEM_NORMAL);
    MenuItem7->SetBitmap(wxBitmap(wxImage(_T("res/up.png"))));
    ContextMenu.Append(MenuItem7);
    MenuItem8 = new wxMenuItem((&ContextMenu), idMoveDown, _("Déplacer vers le bas"), _("Déplacer l\'image vers le bas dans la liste"), wxITEM_NORMAL);
    MenuItem8->SetBitmap(wxBitmap(wxImage(_T("res/down.png"))));
    ContextMenu.Append(MenuItem8);
    FlexGridSizer2->Fit(this);
    FlexGridSizer2->SetSizeHints(this);

    Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_BEGIN_LABEL_EDIT,(wxObjectEventFunction)&EditorImages::OnBanqueImageListBeginLabelEdit);
    Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_END_LABEL_EDIT,(wxObjectEventFunction)&EditorImages::OnBanqueImageListEndLabelEdit);
    Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_ACTIVATED,(wxObjectEventFunction)&EditorImages::OnBanqueImageListItemActivated1);
    Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&EditorImages::OnBanqueImageListSelectionChanged);
    Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_MENU,(wxObjectEventFunction)&EditorImages::OnBanqueImageListItemMenu);
    apercuPanel->Connect(wxEVT_PAINT,(wxObjectEventFunction)&EditorImages::OnapercuPanelPaint,0,this);
    Core->Connect(wxEVT_SIZE,(wxObjectEventFunction)&EditorImages::OnResize,0,this);
    Connect(idMenuModProp,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorImages::OnModPropSelected);
    Connect(idMenuMod,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorImages::OnModNameImageBtClick);
    Connect(idMenuModFile,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorImages::OnModFileImage);
    Connect(idMenuAjouter,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorImages::OnAddImageBtClick);
    Connect(idMenuDel,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorImages::OnDelImageBtClick);
    Connect(idMenuAddDossier,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorImages::OnMenuItem5Selected);
    Connect(idMenuRemoveDossier,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorImages::OnMenuItem6Selected);
    Connect(idMoveUp,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorImages::OnMoveUpSelected);
    Connect(idMoveDown,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorImages::OnMoveDownSelected);
    //*)

    m_NomItem = "";

    BanqueImageList->AddRoot( _( "Toutes les images" ) );
    MenuItem5->Enable(false);
    MenuItem6->Enable(false);

    //EditorImages can be used without ribbon
    if ( !useRibbon )
        CreateToolbar();
    else
    {
        ConnectEvents();
    }


    Connect(ID_BITMAPBUTTON1,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&EditorImages::OnRefreshBtClick);
    Connect(ID_BITMAPBUTTON5,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&EditorImages::OnOpenPaintProgramClick);
    Connect(ID_BITMAPBUTTON6,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&EditorImages::OnMoreOptions);
    Connect(ID_BITMAPBUTTON4,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&EditorImages::DossierBt);
    Connect(ID_BITMAPBUTTON2,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&EditorImages::OnChercherBtClick);
    Connect(ID_BITMAPBUTTON3,wxEVT_COMMAND_TOOL_CLICKED,(wxObjectEventFunction)&EditorImages::OnAideBtClick);

    Refresh();

    SplitterWindow1->Unsplit(BanqueImageList);
    SplitterWindow1->Unsplit(apercuPanel);
    if ( GetSize().GetWidth() > 350 )
        SplitterWindow1->SplitVertically(BanqueImageList, apercuPanel);
    else
        SplitterWindow1->SplitHorizontally(BanqueImageList, apercuPanel);
}

/**
 * Adapt splitterwindow and toolbar when resizing
 */
void EditorImages::OnResize(wxSizeEvent& event)
{
    if ( !useRibbon )
    {
        toolbarPanel->SetSize(event.GetSize().GetWidth(), toolbar->GetSize().GetHeight());
        toolbar->SetSize(toolbarPanel->GetSize().x, -1);
    }

    SplitterWindow1->Unsplit(BanqueImageList);
    SplitterWindow1->Unsplit(apercuPanel);
    if ( GetSize().GetWidth() > 350 )
        SplitterWindow1->SplitVertically(BanqueImageList, apercuPanel);
    else
        SplitterWindow1->SplitHorizontally(BanqueImageList, apercuPanel);

    SplitterWindow1->SetSize(event.GetSize());
}

EditorImages::~EditorImages()
{
    //(*Destroy(EditorImages)
    //*)
}

void EditorImages::ConnectEvents()
{
    if ( !useRibbon ) return;

    mainEditorCommand.GetMainEditor()->Connect(idRibbonAdd, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorImages::OnAddImageBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonDel, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorImages::OnDelImageBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonModProp, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorImages::OnModPropSelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonMod, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorImages::OnModNameImageBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonModFile, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorImages::OnModFileImage, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonAddDossier, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorImages::OnMenuItem5Selected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonRemoveDossier, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorImages::OnMenuItem6Selected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonUp, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorImages::OnMoveUpSelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonDown, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorImages::OnMoveDownSelected, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonDirectories, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorImages::DossierBt, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonPaintProgram, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorImages::OnOpenPaintProgramClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonSearch, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorImages::OnChercherBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonHelp, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorImages::OnAideBtClick, NULL, this);
    mainEditorCommand.GetMainEditor()->Connect(idRibbonRefresh, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, (wxObjectEventFunction)&EditorImages::OnRefreshBtClick, NULL, this);
}

/**
 * Static method for creating the ribbon's page used by Images Editors
 */
void EditorImages::CreateRibbonPage(wxRibbonPage * page)
{
    wxConfigBase *pConfig = wxConfigBase::Get();
    bool hideLabels = false;
    pConfig->Read( _T( "/Skin/HideLabels" ), &hideLabels );

    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Liste d'images"), wxBitmap("res/list24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonAdd, !hideLabels ? _("Ajouter une image") : "", wxBitmap("res/add24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonDel, !hideLabels ? _("Supprimer") : "", wxBitmap("res/delete24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonUp, !hideLabels ? _("Déplacer vers le haut") : "", wxBitmap("res/up24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonDown, !hideLabels ? _("Déplacer vers le bas") : "", wxBitmap("res/down24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonSearch, !hideLabels ? _("Rechercher") : "", wxBitmap("res/search24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonRefresh, !hideLabels ? _("Rafraichir") : "", wxBitmap("res/refreshicon24.png", wxBITMAP_TYPE_ANY));
    }

    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Image sélectionnée"), wxBitmap("res/edit24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonMod, !hideLabels ? _("Nom") : "", wxBitmap("res/editname24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonModFile, !hideLabels ? _("Modifier le fichier") : "", wxBitmap("res/openicon24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonModProp, !hideLabels ? _("Propriétés") : "", wxBitmap("res/editprop24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonPaintProgram, !hideLabels ? _("Editer") : "", wxBitmap("res/paint24.png", wxBITMAP_TYPE_ANY));
    }

    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Dossiers"), wxBitmap("res/dossier24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonDirectories, !hideLabels ? _("Choisir") : "", wxBitmap("res/dossier24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonAddDossier, !hideLabels ? _("Ajouter au dossier") : "", wxBitmap("res/add24.png", wxBITMAP_TYPE_ANY));
        ribbonBar->AddButton(idRibbonRemoveDossier, !hideLabels ? _("Enlever") : "", wxBitmap("res/remove24.png", wxBITMAP_TYPE_ANY));
    }

    {
        wxRibbonPanel *ribbonPanel = new wxRibbonPanel(page, wxID_ANY, _("Aide"), wxBitmap("res/helpicon24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *ribbonBar = new wxRibbonButtonBar(ribbonPanel, wxID_ANY);
        ribbonBar->AddButton(idRibbonHelp, !hideLabels ? _("Aide") : "", wxBitmap("res/helpicon24.png", wxBITMAP_TYPE_ANY));
    }

}

////////////////////////////////////////////////////////////
/// Création de la toolbar
////////////////////////////////////////////////////////////
void EditorImages::CreateToolbar()
{
    //Barre d'outils
    toolbar = new wxToolBar( toolbarPanel, -1, wxDefaultPosition, wxDefaultSize,
                                    wxTB_FLAT /*| wxTB_NODIVIDER*/ );

    toolbar->SetToolBitmapSize( wxSize( 16, 16 ) );
    toolbar->AddTool( ID_BITMAPBUTTON1, wxT( "Rafraichir" ), wxBitmap( wxImage( "res/refreshicon.png" ) ), _("Rafraichir la liste d'images") );
    toolbar->AddSeparator();
    toolbar->AddTool( idMenuAjouter, wxT( "Ajouter une image" ), wxBitmap( wxImage( "res/addicon.png" ) ), _("Ajouter une image") );
    toolbar->AddTool( idMenuDel, wxT( "Supprimer l'image selectionnée" ), wxBitmap( wxImage( "res/deleteicon.png" ) ), _("Supprimer l'image selectionnée") );
    toolbar->AddTool( idMenuModProp, wxT( "Modifier les propriétés de l'image" ), wxBitmap( wxImage( "res/editpropicon.png" ) ), _("Modifier les propriétés de l'image") );
    toolbar->AddTool( ID_BITMAPBUTTON6, wxT( "Plus d'options d'édition ( clic droit sur la liste )" ), wxBitmap( wxImage( "res/moreicon.png" ) ), _("Plus d'options d'édition ( clic droit sur la liste )") );
    toolbar->AddSeparator();
    toolbar->AddTool( ID_BITMAPBUTTON5, wxT( "Ouvrir l'image avec un éditeur" ), wxBitmap( wxImage( "res/paint.png" ) ), _("Ouvrir l'image avec un éditeur") );
    toolbar->AddTool( ID_BITMAPBUTTON4, wxT( "Naviguer dans les dossiers" ), wxBitmap( wxImage( "res/dossier.png" ) ), _("Naviguer dans les dossiers") );
    toolbar->AddTool( ID_BITMAPBUTTON2, wxT( "Rechercher une image" ), wxBitmap( wxImage( "res/searchicon.png" ) ), _("Rechercher une image") );
    toolbar->AddSeparator();
    toolbar->AddTool( ID_BITMAPBUTTON3, wxT( "Aide de l'éditeur de la banque d'images" ), wxBitmap( wxImage( "res/helpicon.png" ) ), _("Aide de l'éditeur de la banque d'images") );
    toolbar->Realize();

    wxConfigBase * pConfig = wxConfigBase::Get();

    bool result = false;
    pConfig->Read("/ModeSimple", &result);

    if ( result )
    {
        toolbar->EnableTool(ID_BITMAPBUTTON1, false);
        toolbar->EnableTool(ID_BITMAPBUTTON6, false);
        toolbar->EnableTool(ID_BITMAPBUTTON4, false);
        toolbar->EnableTool(ID_BITMAPBUTTON2, false);
    }

    //Obligatoire avec wxGTK, sinon la toolbar ne s'affiche pas
#ifdef __WXGTK__
    wxSize tbSize = toolbar->GetSize();
    gtk_widget_set_usize( toolbar->m_widget, tbSize.GetWidth(), tbSize.GetHeight() );
#endif
}


////////////////////////////////////////////////////////////
/// Ajouter une nouvelle image vierge
////////////////////////////////////////////////////////////
void EditorImages::OnAddImageBtClick( wxCommandEvent& event )
{
    //Les vector contenant les nouvelles images
    vector <string> newFile;
    vector <string> newName;

    //Le treeCtrl
    wxTreeItemId rootId = BanqueImageList->GetRootItem();

    //Boite de dialogue d'ajout d'une image
    wxFileDialog FileDialog( this, "Choisissez une ou plusieurs images à ajouter", "", "", "Images supportées|*.bmp;*.gif;*.jpg;*.png;*.tga;*.dds|Tous les fichiers|*.*", wxFD_MULTIPLE );

    //Si c'est ok
    if ( FileDialog.ShowModal() == wxID_OK )
    {
        wxLogStatus( _( "Ajout des images" ) );

        wxArrayString Fichiers;
        wxArrayString names;
        FileDialog.GetFilenames( names );
        FileDialog.GetPaths( Fichiers );
        string imageNonAjoutees;

        for ( unsigned int i = 0; i < Fichiers.GetCount();i++ )
        {
            wxString Status = _( "Ajout de l'image " );
            wxLogStatus( Status + names[i] );

            //Vérifier que l'image n'est pas déjà dans la liste
            if ( FindImage(game.images, string(names[i])) == -1 )
            {
                //On ajoute l'image
                Image image;

                image.file = ( string ) Fichiers[i];
                image.nom = ( string ) names[i];

                game.images.push_back(image);
                game.imagesChanged.push_back(image.nom);
                Dossier::Add( &game.dossierImages, (string)names[i], dossierId );

                BanqueImageList->AppendItem( rootId, names[i] );
            }
            else
                imageNonAjoutees += "\n"+string(names[i].mb_str());

        }

        if ( imageNonAjoutees != "" )
        {
            wxLogMessage(wxString(_("Des images portant le même nom sont déjà dans la liste, et n'ont pas été ajoutées :")+imageNonAjoutees));
        }

        //Fin du processus, nécessitée de mettre à jour les scènes.
        wxLogStatus( _( "L'image a été correctement ajoutée à la banque d'image" ) );
    }

}

////////////////////////////////////////////////////////////
/// Supprimer une image de la liste
////////////////////////////////////////////////////////////
void EditorImages::OnDelImageBtClick( wxCommandEvent& event )
{
    wxTreeItemId Item = m_itemSelected;
    wxTreeItemId ItemNul = NULL;
    if ( Item != ItemNul && BanqueImageList->GetRootItem() != Item )
    {
        int i = FindImage( game.images, ( string ) BanqueImageList->GetItemText( Item ) );
        if ( i != -1 )
        {
            //On enlève l'image
            game.imagesChanged.push_back(game.images[i].nom);
            game.images.erase( game.images.begin() + i );
            Dossier::RemoveImage(&game.dossierImages, ( string ) BanqueImageList->GetItemText( Item ));
        }

        BanqueImageList->Delete( Item );

        return;

    }
    else
    {
        wxLogStatus( _( "Aucune image sélectionnée" ) );
    }
}

////////////////////////////////////////////////////////////
/// Modification d'une image déjà existante
////////////////////////////////////////////////////////////
void EditorImages::OnModNameImageBtClick( wxCommandEvent& event )
{
    wxTreeItemId Item = m_itemSelected;
    wxTreeItemId ItemNul = NULL;
    if ( Item != ItemNul && BanqueImageList->GetChildrenCount( m_itemSelected ) == 0 )
    {
        BanqueImageList->EditLabel( m_itemSelected );
    }
    else
    {
        wxLogStatus( _( "Aucune image sélectionnée" ) );
    }
}

////////////////////////////////////////////////////////////
/// Affichage du menu
////////////////////////////////////////////////////////////
void EditorImages::OnBanqueImageListItemMenu( wxTreeEvent& event )
{
    //Editor have focus
    wxFocusEvent unusedEvent;
    OnSetFocus(unusedEvent);

    PopupMenu( &ContextMenu );
}

////////////////////////////////////////////////////////////
/// Affichage du menu ( plus d'options )
////////////////////////////////////////////////////////////
void EditorImages::OnMoreOptions( wxCommandEvent& event )
{
    PopupMenu( &ContextMenu );
}

////////////////////////////////////////////////////////////
/// Clic sur le bouton de rafraichissement
////////////////////////////////////////////////////////////
void EditorImages::OnRefreshBtClick( wxCommandEvent& event )
{
    Refresh();
}

////////////////////////////////////////////////////////////
/// Selection d'une image
////////////////////////////////////////////////////////////
void EditorImages::OnBanqueImageListSelectionChanged( wxTreeEvent& event )
{
    //Editor have focus
    wxFocusEvent unusedEvent;
    OnSetFocus(unusedEvent);

    string nom = ( string ) BanqueImageList->GetItemText( event.GetItem() );
    //Changement de l'item sélectionné
    m_itemSelected = event.GetItem();

    if ( BanqueImageList->GetChildrenCount( m_itemSelected ) == 0)
    {
        //Zone d'aperçu de l'image
        int i = FindImage( game.images, nom );
        if ( i != -1 )
        {
            fileImageSelected = game.images.at( i ).file;
            apercuPanel->Refresh();
            apercuPanel->Update();
        }
    }

}

////////////////////////////////////////////////////////////
/// Edition du nom d'une image : 2-> Passage du nom original au nouveau
////////////////////////////////////////////////////////////
void EditorImages::OnBanqueImageListEndLabelEdit( wxTreeEvent& event )
{
    if ( !event.IsEditCancelled() )
    {
        std::string newName = string(event.GetLabel().mb_str());

        //Si le nom n'existe pas
        if ( FindImage( game.images, newName ) != -1 )
        {
            wxLogWarning( _( "Impossible de renommer l'image : une autre image porte déjà ce nom." ) );
            Refresh();
            return;
        }
        else
        {
            int i = FindImage( game.images, m_NomItem );
            if ( i != -1 )
            {
                game.imagesChanged.push_back(game.images.at( i ).nom);
                game.imagesChanged.push_back(newName);

                game.images.at( i ).nom = newName;
                Dossier::ReplaceNomImage(&game.dossierImages, m_NomItem, newName);

                BanqueImageList->SetItemText( event.GetItem(), event.GetLabel() );

                return;
            }
        }
    }
}

////////////////////////////////////////////////////////////
/// Edition du nom d'une image : 1-> Nom original
////////////////////////////////////////////////////////////
void EditorImages::OnBanqueImageListBeginLabelEdit( wxTreeEvent& event )
{
    if ( BanqueImageList->GetItemText( event.GetItem() ) != _( "Toutes les images" ) )
    {
        m_NomItem = BanqueImageList->GetItemText( event.GetItem() );
    }
    else
    {
        //On ne touche pas au dossier "Toutes les images"
        BanqueImageList->EndEditLabel( event.GetItem(), true );
    }
}

////////////////////////////////////////////////////////////
/// Recréer le TreeCtrl
////////////////////////////////////////////////////////////
void EditorImages::Refresh()
{
    BanqueImageList->DeleteAllItems();

    //On vérifie bien la validité de dossierId, car on a très bien pu changer
    //de jeu entre son choix et le rafraichissement
    if ( dossierNom != "" && dossierId >= 0 && static_cast<unsigned>(dossierId) < game.dossierImages.size())
    {
        BanqueImageList->AddRoot( dossierNom );
        if ( !game.dossierImages.at(dossierId).contenu.empty() )
        {
            for ( unsigned int i = 0;i < game.dossierImages.at(dossierId).contenu.size();i++ )
            {
                wxString nom = game.dossierImages.at(dossierId).contenu.at( i );

                //Ajout à la liste
                BanqueImageList->AppendItem( BanqueImageList->GetRootItem(), nom );
            }
        }

        return;
    }

    BanqueImageList->AddRoot( _( "Toutes les images" ) );

    if ( !game.images.empty() )
    {
        for ( unsigned int i = 0;i < game.images.size();i++ )
        {
            wxString nom = game.images.at( i ).nom;

            //Ajout à la liste
            BanqueImageList->AppendItem( BanqueImageList->GetRootItem(), nom );

        }
    }
    BanqueImageList->Expand( BanqueImageList->GetRootItem() );
}

////////////////////////////////////////////////////////////
/// Modifier le fichier d'une image
////////////////////////////////////////////////////////////
void EditorImages::OnModFileImage( wxCommandEvent& event )
{
    int i = FindImage( game.images, ( string ) BanqueImageList->GetItemText( m_itemSelected ) );
    if ( i == -1 )
    {
        wxLogStatus( _( "L'image à modifier n'a pas été trouvée." ) );
        return;
    }

    //Boite de dialogue d'ajout d'une image
    wxFileDialog FileDialog( this, _( "Choisissez le fichier de l'image" ), "", "", "Images supportées|*.bmp;*.gif;*.jpg;*.png;*.tga;*.dds|Tous les fichiers|*.*", wxFD_OPEN );
    if ( FileDialog.ShowModal() == wxID_OK )
    {
        wxLogStatus( _( "Changement du fichier de l'image..." ) );

        string newFile = string(FileDialog.GetPath().mb_str());

        game.images.at( i ).file = newFile;
        //Ne concerne pas les dossiers

        game.imagesChanged.push_back(game.images.at( i ).nom);
        wxLogStatus( _( "Changement du fichier de l'image effectué" ) );
    }

}

void EditorImages::OnChercherBtClick( wxCommandEvent& event )
{
    string name = static_cast<string>( wxGetTextFromUser( _( "Entrez le nom de l'image à rechercher" ), _( "Chercher une image" ) ) );
    if ( name == "" ) return;

    int i = FindImage( game.images, name );
    if ( i != -1 )
    {
        //On en a trouvé un, on le sélectionne.
        void * rien;
        wxTreeItemId item = BanqueImageList->GetFirstChild( BanqueImageList->GetRootItem(), rien );
        while ( BanqueImageList->GetItemText( item ) != name )
        {
            item = BanqueImageList->GetNextSibling( item );
        }

        BanqueImageList->SelectItem( item );

        return;
    }
    else { wxLogMessage( "Aucune image de ce nom trouvée !" ); }
}

void EditorImages::OnAideBtClick( wxCommandEvent& event )
{
    HelpFileAccess * helpFileAccess = HelpFileAccess::getInstance();
    helpFileAccess->DisplaySection(9);
}

void EditorImages::DossierBt( wxCommandEvent& event )
{
    ChoixDossier Dialog( this, &game.dossierImages );
    int returnValue = Dialog.ShowModal();
    if ( returnValue == 1 )
    {
        dossierNom = Dialog.dossierNom;
        dossierId = -1;

        for ( unsigned int i = 0;i < game.dossierImages.size() ;i++ )
        {
            if ( game.dossierImages.at( i ).nom == dossierNom )
            {
                dossierId = i;
            }
        }

        if ( dossierId == -1 )
        {
            wxLogWarning( _( "N'a pas pu localiser le dossier" ) );
        }
        MenuItem5->Enable(true);
        MenuItem6->Enable(true);

        Refresh();
        return;
    }
    else if ( returnValue == 2 )
    {
        dossierNom = "";
        dossierId = -1;

        MenuItem5->Enable(false);
        MenuItem6->Enable(false);

        Refresh();
        return;
    }
}


/**
 * Add an image to the folder
 */
void EditorImages::OnMenuItem5Selected(wxCommandEvent& event)
{
    string name = static_cast<string>( wxGetTextFromUser( _( "Entrez le nom de l'image à ajouter" ), _( "Ajouter une image au dossier" ) ) );
    if ( name == "" ) return;

    bool trouve = false;
    for (unsigned int i = 0;i<game.images.size();i++)
    {
    	if ( name == game.images.at(i).nom )
            trouve = true;
    }

    if ( !trouve )
    {
        wxLogWarning(_("L'image n'existe pas."));
        return;
    }

    Dossier::Add(&game.dossierImages, name, dossierId);
    BanqueImageList->AppendItem(BanqueImageList->GetRootItem(), name);
}

/**
 * Suppress an image only from the current folder
 */
void EditorImages::OnMenuItem6Selected(wxCommandEvent& event)
{
    wxTreeItemId Item = m_itemSelected;
    wxTreeItemId ItemNul = NULL;
    if ( Item != ItemNul && BanqueImageList->GetChildrenCount( m_itemSelected ) == 0 )
    {
        Dossier::RemoveImage(&game.dossierImages, ( string ) BanqueImageList->GetItemText( Item ), dossierId);

        BanqueImageList->Delete( Item );

        return;

    }
    else
    {
        wxLogStatus( _( "Aucune image sélectionnée" ) );
    }
}

/**
 * Modify image properties
 */
void EditorImages::OnModPropSelected(wxCommandEvent& event)
{
    int i = FindImage( game.images, static_cast< string > ( BanqueImageList->GetItemText( m_itemSelected ) ));
    if ( i == -1 )
    {
        wxLogStatus( _( "L'image à modifier n'a pas été trouvée." ) );
        return;
    }

    PropImage dialog(this, game.images.at(i));
    if ( dialog.ShowModal() == 1 )
        game.imagesChanged.push_back(game.images.at(i).nom);
}
void EditorImages::OnBanqueImageListItemActivated1(wxTreeEvent& event)
{
    wxFocusEvent unusedEvent;
    OnSetFocus(unusedEvent);

    wxCommandEvent eventUseless;
    OnModPropSelected( eventUseless );
}

/**
 * Open an external image edition program
 */
void EditorImages::OnOpenPaintProgramClick(wxCommandEvent& event)
{

    wxConfigBase *pConfig = wxConfigBase::Get();
    wxString result;
    pConfig->Read( _T( "/EditeursExternes/Image" ), &result );

    if ( result == "" )
    {
        wxFileDialog dialog(this, _("Choisissez le programme d'édition d'images ( fichier exe )"), "", "", "Programmes (*.exe)|*.exe");
        dialog.ShowModal();

        pConfig->Write( _T( "/EditeursExternes/Image" ), dialog.GetPath() );
        pConfig->Read( _T( "/EditeursExternes/Image" ), &result );
    }

    if ( result != "" )
    {
        int i = FindImage( game.images, static_cast< string > ( BanqueImageList->GetItemText( m_itemSelected ) ));
        if ( i == -1 )
        {
            wxExecute(result);
            return;
        }

        wxExecute(result+" \""+game.images.at(i).file+"\"");
    }
}

/**
 * Display a preview of the selected image
 */
void EditorImages::OnapercuPanelPaint(wxPaintEvent& event)
{
    wxPaintDC dc( apercuPanel ); //Création obligatoire du wxBufferedPaintDC

    wxSize size = apercuPanel->GetSize();

    BitmapGUIManager * bitmapGUIManager = BitmapGUIManager::getInstance();

    //Fond en damier
    dc.SetBrush(bitmapGUIManager->transparentBg);
    dc.DrawRectangle(0,0, size.GetWidth(), size.GetHeight());

    if ( !wxFile::Exists(fileImageSelected) )
        return;

    wxBitmap bmp( fileImageSelected, wxBITMAP_TYPE_ANY);
    if ( bmp.GetWidth() > 120 || bmp.GetHeight() > 120 )
    {
        //Réduction à l'échelle
        int max = bmp.GetWidth() > bmp.GetHeight() ? bmp.GetWidth() : bmp.GetHeight();
        float factor = 120.f/max;

        wxImage image = bmp.ConvertToImage();
        bmp = wxBitmap(image.Scale(bmp.GetWidth()*factor, bmp.GetHeight()*factor));
    }

    //Affichage au centre de l'image
    dc.DrawBitmap(bmp,
                  (size.GetWidth() - bmp.GetWidth()) / 2,
                  (size.GetHeight() - bmp.GetHeight()) / 2,
                  true /* use mask */);
}

/**
 * Move up an image
 */
void EditorImages::OnMoveUpSelected(wxCommandEvent& event)
{
    string name = static_cast< string > ( BanqueImageList->GetItemText( m_itemSelected ));

    if ( dossierId == -1 )
    {
        int i = FindImage( game.images, name );
        if ( i == -1 )
        {
            wxLogStatus( _( "L'image à déplacer n'a pas été trouvée." ) );
            return;
        }
        else if ( i-1 >= 0 )
        {
            //On déplace l'image
            Image image = game.images[i];
            game.images.erase(game.images.begin() + i );
            game.images.insert(game.images.begin()+i-1, image);

            Refresh();

            //On la reselectionne
            wxTreeItemId item = BanqueImageList->GetLastChild(BanqueImageList->GetRootItem());
            while ( item.IsOk() )
            {
                if ( BanqueImageList->GetItemText( item ) == name )
                {
                    BanqueImageList->SelectItem(item);
                    return;
                }
                item = BanqueImageList->GetPrevSibling(item);
            }

        }
    }
    //Un dossier
    else if ( dossierId >= 0 && static_cast<unsigned>(dossierId) < game.dossierImages.size())
    {
        int imageId = -1;
        for (unsigned int i =0;i<game.dossierImages[dossierId].contenu.size();++i)
        {
        	if ( game.dossierImages[dossierId].contenu[i] == name )
                imageId = i;
        }
        if ( imageId == -1 )
        {
            wxLogStatus( _( "L'image à déplacer n'a pas été trouvée." ) );
            return;
        }
        else if ( imageId-1 >= 0)
        {
            //On déplace l'image
            string image = game.dossierImages[dossierId].contenu[imageId];
            game.dossierImages[dossierId].contenu.erase( game.dossierImages[dossierId].contenu.begin()+imageId );
            game.dossierImages[dossierId].contenu.insert( game.dossierImages[dossierId].contenu.begin()+imageId-1, image);

            Refresh();

            //On la reselectionne
            wxTreeItemId item = BanqueImageList->GetLastChild(BanqueImageList->GetRootItem());
            while ( item.IsOk() )
            {
                if ( BanqueImageList->GetItemText( item ) == name )
                {
                    BanqueImageList->SelectItem(item);
                    return;
                }
                item = BanqueImageList->GetPrevSibling(item);
            }

        }
    }
}

/**
 * Move down an image
 */
void EditorImages::OnMoveDownSelected(wxCommandEvent& event)
{
    string name = static_cast< string > ( BanqueImageList->GetItemText( m_itemSelected ));

    //Toutes les images
    if ( dossierId == -1 )
    {
        int i = FindImage( game.images, name );
        if ( i == -1 )
        {
            wxLogStatus( _( "L'image à déplacer n'a pas été trouvée." ) );
            return;
        }
        else if ( static_cast<unsigned>(i+1) < game.images.size() )
        {
            //On déplace l'image
            Image image = game.images[i];
            game.images.erase(game.images.begin() + i );
            game.images.insert(game.images.begin()+i+1, image);

            Refresh();

            //On la reselectionne
            wxTreeItemId item = BanqueImageList->GetLastChild(BanqueImageList->GetRootItem());
            while ( item.IsOk() )
            {
                if ( BanqueImageList->GetItemText( item ) == name )
                {
                    BanqueImageList->SelectItem(item);
                    return;
                }
                item = BanqueImageList->GetPrevSibling(item);
            }

        }
    }
    //Un dossier
    else if ( dossierId >= 0 && static_cast<unsigned>(dossierId) < game.dossierImages.size())
    {
        int imageId = -1;
        for (unsigned int i =0;i<game.dossierImages[dossierId].contenu.size();++i)
        {
        	if ( game.dossierImages[dossierId].contenu[i] == name )
                imageId = i;
        }
        if ( imageId == -1 )
        {
            wxLogStatus( _( "L'image à déplacer n'a pas été trouvée." ) );
            return;
        }
        else if ( static_cast<unsigned>(imageId+1) < game.dossierImages[dossierId].contenu.size())
        {
            //On déplace l'image
            string image = game.dossierImages[dossierId].contenu[imageId];
            game.dossierImages[dossierId].contenu.erase( game.dossierImages[dossierId].contenu.begin()+imageId );
            game.dossierImages[dossierId].contenu.insert( game.dossierImages[dossierId].contenu.begin()+imageId+1, image);

            Refresh();

            //On la reselectionne
            wxTreeItemId item = BanqueImageList->GetLastChild(BanqueImageList->GetRootItem());
            while ( item.IsOk() )
            {
                if ( BanqueImageList->GetItemText( item ) == name )
                {
                    BanqueImageList->SelectItem(item);
                    return;
                }
                item = BanqueImageList->GetPrevSibling(item);
            }

        }
    }
}

/**
 * Begin dragging image ( can be dropped in a Objects Editor so as to create easily an object )
 */
void EditorImages::OnBanqueImageListBeginDrag(wxTreeEvent& event)
{
    if ( event.GetItem().IsOk() && event.GetItem() != BanqueImageList->GetRootItem() )
    {
        wxTextDataObject name(BanqueImageList->GetItemText(event.GetItem()));
        wxDropSource dragSource( this );
        dragSource.SetData( name );
        dragSource.DoDragDrop( true );
    }
}

/**
 * Show appropriate ribbon page when get focus.
 */
void EditorImages::OnSetFocus(wxFocusEvent& event)
{
    ForceRefreshRibbonAndConnect();
}

void EditorImages::ForceRefreshRibbonAndConnect()
{
    if ( useRibbon )
    {
        mainEditorCommand.GetRibbon()->SetActivePage(2);
        ConnectEvents();
    }
}

#endif
