#include "ConvertJRC.h"

//(*InternalHeaders(ConvertJRC)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include <string>
#include <vector>
#include <wx/log.h>

#include "GDL/Game.h"
#include "tinyxml.h"
#include <wx/filedlg.h>

using namespace std;

//(*IdInit(ConvertJRC)
const long ConvertJRC::ID_STATICTEXT1 = wxNewId();
const long ConvertJRC::ID_STATICTEXT2 = wxNewId();
const long ConvertJRC::ID_BUTTON1 = wxNewId();
const long ConvertJRC::ID_GAUGE1 = wxNewId();
const long ConvertJRC::ID_STATICTEXT3 = wxNewId();
const long ConvertJRC::ID_BUTTON2 = wxNewId();
const long ConvertJRC::ID_BUTTON3 = wxNewId();
const long ConvertJRC::ID_BUTTON4 = wxNewId();
//*)

BEGIN_EVENT_TABLE( ConvertJRC, wxDialog )
    //(*EventTable(ConvertJRC)
    //*)
END_EVENT_TABLE()

ConvertJRC::ConvertJRC( wxWindow* parent, Game * pJeu ) :
        jeu( pJeu )
{
    //(*Initialize(ConvertJRC)
    wxStaticBoxSizer* StaticBoxSizer2;
    wxFlexGridSizer* FlexGridSizer4;
    wxFlexGridSizer* FlexGridSizer3;
    wxFlexGridSizer* FlexGridSizer2;
    wxStaticBoxSizer* StaticBoxSizer3;
    wxStaticBoxSizer* StaticBoxSizer1;
    wxFlexGridSizer* FlexGridSizer1;

    Create(parent, wxID_ANY, _("Convertir un jeu JRC 3.1.60 vers Game Develop"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
    FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
    StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Cet outil va convertir un jeu crée avec Jeu de Rôle Creator 3.1.60\nen un jeu éditable avec Game Develop"), wxDefaultPosition, wxDefaultSize, wxALIGN_CENTRE, _T("ID_STATICTEXT1"));
    FlexGridSizer1->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Jeu à convertir"));
    FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer2->AddGrowableCol(1);
    StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _("Aucun jeu choisi"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
    FlexGridSizer2->Add(StaticText2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    ChoisirJeuBt = new wxButton(this, ID_BUTTON1, _("Choisir"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
    FlexGridSizer2->Add(ChoisirJeuBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer1->Add(FlexGridSizer2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer1->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer2 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Avancement de la conversion"));
    FlexGridSizer3 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer3->AddGrowableCol(0);
    AvancementGauge = new wxGauge(this, ID_GAUGE1, 100, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_GAUGE1"));
    FlexGridSizer3->Add(AvancementGauge, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticText3 = new wxStaticText(this, ID_STATICTEXT3, _("Aucune information sur l\'avancement"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
    FlexGridSizer3->Add(StaticText3, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer2->Add(FlexGridSizer3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer1->Add(StaticBoxSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer3 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Lancement"));
    ConvertirBt = new wxButton(this, ID_BUTTON2, _("Lancer la conversion"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
    StaticBoxSizer3->Add(ConvertirBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer1->Add(StaticBoxSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer4 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer4->AddGrowableCol(0);
    AideBt = new wxButton(this, ID_BUTTON3, _("Aide"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
    FlexGridSizer4->Add(AideBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    FermerBt = new wxButton(this, ID_BUTTON4, _("Fermer"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON4"));
    FlexGridSizer4->Add(FermerBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer1->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    SetSizer(FlexGridSizer1);
    FlexGridSizer1->Fit(this);
    FlexGridSizer1->SetSizeHints(this);

    Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ConvertJRC::OnChoisirJeuBtClick);
    Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ConvertJRC::OnConvertirBtClick);
    Connect(ID_BUTTON4,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ConvertJRC::OnFermerBtClick);
    //*)
}

ConvertJRC::~ConvertJRC()
{
    //(*Destroy(ConvertJRC)
    //*)
}


void ConvertJRC::OnFermerBtClick( wxCommandEvent& event )
{
    EndModal( 0 );
}

void ConvertJRC::OnChoisirJeuBtClick(wxCommandEvent& event)
{
    wxFileDialog open(this, _("Choisissez un jeu créé avec Jeu de Rôle Creator 3.1.60"), "", "", "*.jrc");
    open.ShowModal();

    file = open.GetPath();
}

void ConvertJRC::OnConvertirBtClick(wxCommandEvent& event)
{/*
    bool pub = false;
    string nomSave;
    string dossierSave;

    int i = 0;
    //Ouverture
    TiXmlDocument doc(file.c_str());
    if (!doc.LoadFile())
    {
        // Impossible de charger
        wxLogError(_("Chargement d'un fichier"), _("Ouverture impossible"), NULL);
        return;
    }

    try
    {
        //Chargement des infos sur le jeu
        TiXmlHandle hdl(&doc);

        TiXmlElement *elem = hdl.FirstChildElement().FirstChildElement().Element();
        int version = atoi(elem->Attribute("value"));

            elem = hdl.FirstChildElement().FirstChildElement("Info").FirstChildElement().Element();
            while (elem)
            {
                if (i == 0)
                {
                    jeu->name = elem->Attribute("value");
                }
                if (i == 1)
                {
                    jeu->author = elem->Attribute("value");
                }
                if (i == 3)
                {
                    Image image;
                    image.file = elem->Attribute("value");
                    image.nom = "MMButton";

                    jeu->images.push_back(image);
                }
                if (i == 4)
                {
                    Image image;
                    image.file = elem->Attribute("value");
                    image.nom = "Button";

                    jeu->images.push_back(image);
                }
                if (i == 5)
                {
                    Image image;
                    image.file = elem->Attribute("value");
                    image.nom = "Box";

                    jeu->images.push_back(image);
                }
                if (i == 6)
                {
                    Image image;
                    image.file = elem->Attribute("value");
                    image.nom = "ButtonSave";

                    jeu->images.push_back(image);
                }
                if (i == 7)
                {
                    if ( elem->Attribute("value") == "true" )
                    {
                        pub = true;
                    }
                }
                if (i == 8)
                {
                    nomSave = elem->Attribute("value");
                }
                if (i == 9)
                {
                    dossierSave = elem->Attribute("value");
                }
                if (i == 11)
                {
                    if( elem->Attribute("value") == "portable" )
                    {
                        wxLogError(_("Le jeu est en version portable. Ouvrez le d'abord avec Jeu de Rôle Creator et ré-enregistrez le normalement."));
                        return;
                    }
                }
                elem = elem->NextSiblingElement(); // iteration
                i++;
            }

            //Chargement des infos menu
            i=0;

            //La scène par défaut
            Scene sceneMM;
            sceneMM.name = "Menu";

            Object fond;
            fond.name = "fond";
            {
            Animation AnimToAdd( NB_DIRECTION );
            AnimToAdd.typeNormal = true;
            AnimToAdd.images.push_back( "FondMM" );
            AnimToAdd.m_TempsEntre.push_back( 0 );
            AnimToAdd.boucle.push_back( false );
            fond.Animations.push_back( AnimToAdd );
            }

            Object JouerBt; JouerBt.name = "JouerBt";
            Object QuitterBt; QuitterBt.name = "QuitterBt";
            Object ProposBt; ProposBt.name = "ProposBt";
            Object ChargerBt; ChargerBt.name = "ChargerBt";
            {
           Animation AnimToAdd( NB_DIRECTION );
            AnimToAdd.typeNormal = true;
            AnimToAdd.images.push_back( "MMButton" );
            AnimToAdd.m_TempsEntre.push_back( 0 );
            AnimToAdd.boucle.push_back( false );
            JouerBt.Animations.push_back( AnimToAdd );
            QuitterBt.Animations.push_back( AnimToAdd );
            ProposBt.Animations.push_back( AnimToAdd );
            ChargerBt.Animations.push_back( AnimToAdd );
            }

            string titre;
            string posx;
            string posy;
            string color;
            string police;
            string music;

            Position FondPos;
            FondPos.x = 0; FondPos.y = 0; FondPos.animation = 0;FondPos.direction = 0;FondPos.nom = "fond";

            Position JouerPos;
            JouerPos.x = 0; JouerPos.y = 0; JouerPos.animation = 0;JouerPos.direction = 0;JouerPos.nom = "JouerBt";
            Position QuitterPos;
            QuitterPos.x = 0; QuitterPos.y = 0; QuitterPos.animation = 0;QuitterPos.direction = 0;QuitterPos.nom = "QuitterBt";
            Position ProposPos;
            ProposPos.x = 0; ProposPos.y = 0; ProposPos.animation = 0;ProposPos.direction = 0;ProposPos.nom = "ProposBt";
            Position ChargerPos;
            ChargerPos.x = 0; ChargerPos.y = 0; ChargerPos.animation = 0;ChargerPos.direction = 0;ChargerPos.nom = "ProposBt";

            elem = hdl.FirstChildElement().FirstChildElement("MainMenu").FirstChildElement().Element();
            while (elem)
            {
                if (i == 0)
                {
                    titre = elem->Attribute("value");
                }
                if (i == 1)
                {
                    posx = elem->Attribute("value");
                }
                if (i == 2)
                {
                    posy = elem->Attribute("value");
                }
                if (i == 3)
                {
                    color = elem->Attribute("value");
                }
                if (i == 4)
                {
                    police = elem->Attribute("value");
                }
                if (i == 5)
                {
                    Image image;
                    image.file = elem->Attribute("value");
                    image.nom = "FondMM";

                    jeu->images.push_back(image);
                }
                if (i == 6)
                {
                    music = elem->Attribute("value");
                }
                if (i == 7)
                {
                    //MainMenuOpen->fondu = elem->Attribute("value");
                }
                if (i == 8)
                {
                    JouerPos.x = atoi(elem->Attribute("value"));
                }
                if (i == 9)
                {
                    JouerPos.y = atoi(elem->Attribute("value"));
                }
                if (i == 10)
                {
                    ProposPos.x = atoi(elem->Attribute("value"));
                }
                if (i == 11)
                {
                    ProposPos.y = atoi(elem->Attribute("value"));
                }
                if (i == 12)
                {
                    QuitterPos.x = atoi(elem->Attribute("value"));
                }
                if (i == 13)
                {
                    QuitterPos.y = atoi(elem->Attribute("value"));
                }
                if (i == 14)
                {
                    ChargerPos.x = atoi(elem->Attribute("value"));
                }
                if (i == 15)
                {
                    ChargerPos.y = atoi(elem->Attribute("value"));
                }

                elem = elem->NextSiblingElement(); // iteration
                i++;
            }

            sceneMM.initialObjectsPositions.push_back(FondPos);
            sceneMM.initialObjectsPositions.push_back(JouerPos);
            sceneMM.initialObjectsPositions.push_back(QuitterPos);
            sceneMM.initialObjectsPositions.push_back(ChargerPos);
            sceneMM.initialObjectsPositions.push_back(ProposPos);
            sceneMM.initialObjects.push_back(fond);
            sceneMM.initialObjects.push_back(JouerBt);
            sceneMM.initialObjects.push_back(QuitterBt);
            sceneMM.initialObjects.push_back(ChargerBt);
            sceneMM.initialObjects.push_back(ProposBt);

            {
                Event event;

                event.m_cType.push_back("SourisSurObjet");
                {
                    vector < string > param;
                    param.push_back("JouerBt");
                    event.m_cParametres.push_back(param);
                }
                event.m_cLoc.push_back(false);

                event.m_cType.push_back("SourisBouton");
                {
                    vector < string > param;
                    param.push_back("Left");
                    event.m_cParametres.push_back(param);
                }
                event.m_cLoc.push_back(false);

                vector < string > paramA;
                event.m_aType.push_back("Scene");
                paramA.push_back("Scene1");
                event.m_aParametres.push_back(paramA);
                event.m_aLoc.push_back(true);

                sceneMM.events.push_back(event);
            }
            {
                Event event;

                event.m_cType.push_back("SourisSurObjet");
                {
                    vector < string > param;
                    param.push_back("QuitterBt");
                    event.m_cParametres.push_back(param);
                }
                event.m_cLoc.push_back(false);

                event.m_cType.push_back("SourisBouton");
                {
                    vector < string > param;
                    param.push_back("Left");
                    event.m_cParametres.push_back(param);
                }
                event.m_cLoc.push_back(false);

                vector < string > paramA;
                event.m_aType.push_back("Quit");
                paramA.push_back("");
                event.m_aParametres.push_back(paramA);
                event.m_aLoc.push_back(true);

                sceneMM.events.push_back(event);
            }

            jeu->m_scenes.push_back(sceneMM);*/

/*
            i=0;
        elem = hdl.FirstChildElement().FirstChildElement("Scenes").FirstChildElement().Element();
        EcrireLog("Ouverture","Scenes");

        while (elem && i <1001)
        {
            std::ostringstream renvoinum;
            renvoinum << i;
            std::string renvoistr = renvoinum.str();
            EcrireLog("Ouverture",renvoistr);
            infoavance.Update(i);

            ScenesOpen[i].Nom = elem->FirstChildElement("Nom")->Attribute("value");
            ScenesOpen[i].Type = elem->FirstChildElement("Type")->Attribute("value");
            ScenesOpen[i].A1 = elem->FirstChildElement("A1")->Attribute("value");
            ScenesOpen[i].C1 = elem->FirstChildElement("C1")->Attribute("value");
            ScenesOpen[i].T1 = elem->FirstChildElement("T1")->Attribute("value");
            ScenesOpen[i].A2 = elem->FirstChildElement("A2")->Attribute("value");
            ScenesOpen[i].C2 = elem->FirstChildElement("C2")->Attribute("value");
            ScenesOpen[i].T2 = elem->FirstChildElement("T2")->Attribute("value");
            ScenesOpen[i].A3 = elem->FirstChildElement("A3")->Attribute("value");
            ScenesOpen[i].C3 = elem->FirstChildElement("C3")->Attribute("value");
            ScenesOpen[i].T3 = elem->FirstChildElement("T3")->Attribute("value");
            ScenesOpen[i].A4 = elem->FirstChildElement("A4")->Attribute("value");
            ScenesOpen[i].C4 = elem->FirstChildElement("C4")->Attribute("value");
            ScenesOpen[i].T4 = elem->FirstChildElement("T4")->Attribute("value");
            ScenesOpen[i].A5 = elem->FirstChildElement("A5")->Attribute("value");
            ScenesOpen[i].C5 = elem->FirstChildElement("C5")->Attribute("value");
            ScenesOpen[i].T5 = elem->FirstChildElement("T5")->Attribute("value");
            ScenesOpen[i].image = elem->FirstChildElement("Image")->Attribute("value");
            ScenesOpen[i].music = elem->FirstChildElement("Music")->Attribute("value");
            if ( version >= 3100)
            {
                    ScenesOpen[i].music2 = elem->FirstChildElement("Music2")->Attribute("value");
                    ScenesOpen[i].music3 = elem->FirstChildElement("Music3")->Attribute("value");
                    ScenesOpen[i].music4 = elem->FirstChildElement("Music4")->Attribute("value");
                    ScenesOpen[i].music5 = elem->FirstChildElement("Music5")->Attribute("value");
            }
            ScenesOpen[i].animboucle = elem->FirstChildElement("AnimBoucle")->Attribute("value");
            ScenesOpen[i].animvitesse = elem->FirstChildElement("AnimVitesse")->Attribute("value");
            ScenesOpen[i].fondu = elem->FirstChildElement("Fondu")->Attribute("value");
            ScenesOpen[i].Texte = elem->FirstChildElement("Texte")->Attribute("value");
            ScenesOpen[i].postextx = elem->FirstChildElement("PosTextX")->Attribute("value");
            ScenesOpen[i].postexty = elem->FirstChildElement("PosTextY")->Attribute("value");
            ScenesOpen[i].police = elem->FirstChildElement("Police")->Attribute("value");
            ScenesOpen[i].colortext = elem->FirstChildElement("ColorTexte")->Attribute("value");
            ScenesOpen[i].minutage = elem->FirstChildElement("Minutage")->Attribute("value");

            ScenesOpen[i].B1 = elem->FirstChildElement("B1")->Attribute("value");
            ScenesOpen[i].B2 = elem->FirstChildElement("B2")->Attribute("value");
            ScenesOpen[i].B3 = elem->FirstChildElement("B3")->Attribute("value");
            ScenesOpen[i].B4 = elem->FirstChildElement("B4")->Attribute("value");
            ScenesOpen[i].B5 = elem->FirstChildElement("B5")->Attribute("value");
            ScenesOpen[i].B6 = elem->FirstChildElement("B6")->Attribute("value");
            ScenesOpen[i].B7 = elem->FirstChildElement("B7")->Attribute("value");
            ScenesOpen[i].B8 = elem->FirstChildElement("B8")->Attribute("value");
            ScenesOpen[i].B9 = elem->FirstChildElement("B9")->Attribute("value");
            ScenesOpen[i].B10 = elem->FirstChildElement("B10")->Attribute("value");
            ScenesOpen[i].B11 = elem->FirstChildElement("B11")->Attribute("value");
            ScenesOpen[i].B12 = elem->FirstChildElement("B12")->Attribute("value");
            ScenesOpen[i].B13 = elem->FirstChildElement("B13")->Attribute("value");
            ScenesOpen[i].B14 = elem->FirstChildElement("B14")->Attribute("value");
            ScenesOpen[i].B15 = elem->FirstChildElement("B15")->Attribute("value");
            ScenesOpen[i].B16 = elem->FirstChildElement("B16")->Attribute("value");
            ScenesOpen[i].B17 = elem->FirstChildElement("B17")->Attribute("value");
            ScenesOpen[i].B18 = elem->FirstChildElement("B18")->Attribute("value");
            ScenesOpen[i].B19 = elem->FirstChildElement("B19")->Attribute("value");
            ScenesOpen[i].B20 = elem->FirstChildElement("B20")->Attribute("value");
            ScenesOpen[i].Save = elem->FirstChildElement("Save")->Attribute("value");
            if ( version >= 3123)
            {
                ScenesOpen[i].typeChargement = elem->FirstChildElement("typeChargement")->Attribute("value");
            }

            elem = elem->NextSiblingElement(); // iteration

            i++;

        }
    }
    catch (...)
    {
        GestionError(_("Chargement d'un fichier"), _("Decryptage du fichier : Le fichier est peut être corrompu"), NULL);

        return false;
    }

    //Adaptation depuis version portable si besoin est.
    if ( GameInfoOpen->version=="portable")
    {
            //Menu principal
            MainMenuOpen->image=path+MainMenuOpen->image;
            MainMenuOpen->police=path+MainMenuOpen->police;
            MainMenuOpen->music=path+MainMenuOpen->music;
            GameInfoOpen->box=path+GameInfoOpen->box;
            GameInfoOpen->buttonMM=path+GameInfoOpen->buttonMM;
            GameInfoOpen->button=path+GameInfoOpen->button;
            GameInfoOpen->buttonSave=path+GameInfoOpen->buttonSave;

        //Traitement des scènes
        for (int j=0;j<1001;j++)
        {
            if ( ScenesOpen[j].music != "" )
            {
                ScenesOpen[j].music = path + ScenesOpen[j].music;
            }
            if ( ScenesOpen[j].music2 != "" )
            {
                ScenesOpen[j].music2 = path + ScenesOpen[j].music2;
            }
            if ( ScenesOpen[j].music3 != "" )
            {
                ScenesOpen[j].music3 = path + ScenesOpen[j].music3;
            }
            if ( ScenesOpen[j].music4 != "" )
            {
                ScenesOpen[j].music4 = path + ScenesOpen[j].music4;
            }
            if ( ScenesOpen[j].music5 != "" )
            {
                ScenesOpen[j].music5 = path + ScenesOpen[j].music5;
            }
            if ( ScenesOpen[j].police != "" )
            {
                ScenesOpen[j].police = path + ScenesOpen[j].police;
            }
            if ( ScenesOpen[j].image != "" )
            {
                string Images[101];
                Spliter(Images, ScenesOpen[j].image, ';');
                ScenesOpen[j].image="";
                for ( int k=0;k<101;k++)
                {
                    if ( Images[k]!="")
                    {
                        Images[k] = path + Images[k];
                        ScenesOpen[j].image+=Images[k]+";";
                    }
                }

            }
        }

            //Version normale
            GameInfoOpen->version="";

    }
*//*
    }
    catch ( ... )
    {
        wxLogError(_("Erreur"));
    }

    return;
*/
}
