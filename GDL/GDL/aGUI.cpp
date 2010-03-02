#include "GDL/aGUI.h"
#include <vector>
#include <string>
#include "GDL/Object.h"
#include "GDL/Event.h"
#include <iostream>
#include <sstream>
#include "GDL/Chercher.h"
#include "GDL/Access.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/nwidgets/MessageBox.h"
#include "GDL/nwidgets/YesNoMsgBox.h"
#include "GDL/nwidgets/OpenFile.h"
#include "GDL/nwidgets/TextInput.h"
#include <string>
#include <vector>

#if defined(WINDOWS)
#include <windows.h>
#include <Commdlg.h>
#endif

using namespace std;

////////////////////////////////////////////////////////////
/// Affiche une boite de dialogue
///
/// Type : ShowMsgBox
/// Paramètre 1 : Message
/// Paramètre 2 : Titre
////////////////////////////////////////////////////////////
bool ActShowMsgBox( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    sf::Clock timeSpent;

    //Affichage du message
    #if defined(WINDOWS)
    MessageBox(NULL, eval.EvalTxt(action.GetParameter(0)).c_str(), eval.EvalTxt(action.GetParameter(1)).c_str(), MB_ICONINFORMATION);
    #endif
    #if defined(LINUX)
    nw::MsgBox msgBox(eval.EvalTxt(action.GetParameter(1)), eval.EvalTxt(action.GetParameter(0)));
    msgBox.wait_until_closed();
    #endif

    scene->pauseTime += timeSpent.GetElapsedTime();

    return true;
}

////////////////////////////////////////////////////////////
/// Affiche une boite de dialogue d'ouverture de fichier
///
/// Type : ShowOpenFile
/// Paramètre 1 : Variable de la scène où enregistrer le fichier
/// Paramètre 2 : Titre
////////////////////////////////////////////////////////////
bool ActShowOpenFile( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    sf::Clock timeSpent;

    string result;

    #if defined(WINDOWS)
    OPENFILENAME toGetFileName; //Struct for the dialog
    char filePath[MAX_PATH] = "";

    ZeroMemory(&toGetFileName, sizeof(OPENFILENAME));
    toGetFileName.lStructSize = sizeof(OPENFILENAME);
    toGetFileName.hwndOwner = NULL;
    toGetFileName.lpstrFile = filePath;
    toGetFileName.nMaxFile = MAX_PATH;
    toGetFileName.lpstrFilter = "*.*";
    toGetFileName.nFilterIndex = 1;
    toGetFileName.Flags = OFN_PATHMUSTEXIST;

    if(GetOpenFileName(&toGetFileName) == TRUE)
        result = filePath;
    #endif
    #if defined(LINUX)
    //Affichage de la fenêtre de choix de fichier
    nw::OpenFile * dialog = new nw::OpenFile(eval.EvalTxt(action.GetParameter(1)), true, result);
    dialog->wait_until_closed();
    #endif

    scene->pauseTime += timeSpent.GetElapsedTime();

    //On cherche la variable
    int ID = scene->variables.FindVariable( action.GetParameter( 0 ).GetPlainString() );
    if ( ID == -1 )
    {
        //Si elle n'existe pas, on la créé
        scene->variables.variables.push_back( Variable(action.GetParameter( 0 ).GetPlainString()) );
        ID = scene->variables.variables.size() - 1; //On reprend l'identifiant
    }

    scene->variables.variables.at( ID ) = result;

    return true;
}

////////////////////////////////////////////////////////////
/// Affiche une boite de dialogue oui/non
///
/// Type : ShowYesNoMsgBox
/// Paramètre 1 : Variable de la scène où enregistrer la réponse
/// Paramètre 2 : Message
/// Paramètre 3 : Titre
////////////////////////////////////////////////////////////
bool ActShowYesNoMsgBox( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    sf::Clock timeSpent;

    string result;

    #if defined(WINDOWS)
    if( MessageBox(NULL, eval.EvalTxt(action.GetParameter(1)).c_str(), eval.EvalTxt(action.GetParameter(2)).c_str(), MB_ICONQUESTION | MB_YESNO) == IDYES)
        result = "yes";
    else
        result = "no";
    #endif
    #if defined(LINUX)
    //Affichage de la fenêtre de choix de fichier
    nw::YesNoMsgBox dialog(eval.EvalTxt(action.GetParameter(2)), eval.EvalTxt(action.GetParameter(1)), result);
    dialog.wait_until_closed();
    #endif

    scene->pauseTime += timeSpent.GetElapsedTime();

    //On cherche la variable
    int ID = scene->variables.FindVariable( action.GetParameter( 0 ).GetPlainString() );
    if ( ID == -1 )
    {
        //Si elle n'existe pas, on la créé
        scene->variables.variables.push_back( Variable(action.GetParameter( 0 ).GetPlainString()) );
        ID = scene->variables.variables.size() - 1; //On reprend l'identifiant
    }

    scene->variables.variables.at( ID ) = result;

    return true;
}


#if defined(WINDOWS)

#define INPUTBOX_WIDTH 400
#define INPUTBOX_HEIGHT 125

/*
Author      : mah
Date        : 13.06.2002
Description :
    similar to Visual Basic InputBox
*/
class CInputBox
{
    static HFONT m_hFont;
    static HWND  m_hWndInputBox;
    static HWND  m_hWndParent;
    static HWND  m_hWndEdit;
    static HWND  m_hWndOK;
    static HWND  m_hWndCancel;
    static HWND  m_hWndPrompt;

    static HINSTANCE m_hInst;

    static LRESULT CALLBACK WndProc(HWND hWnd, UINT message, WPARAM wParam, LPARAM lParam);
public:
    // text from InputBox
	LPTSTR Text;
    BOOL DoModal(LPCTSTR szCaption, LPCTSTR szPrompt);

	CInputBox(HWND hWndParent);
	virtual ~CInputBox();

};

HFONT CInputBox::m_hFont = NULL;
HWND  CInputBox::m_hWndInputBox = NULL;
HWND  CInputBox::m_hWndParent = NULL;
HWND  CInputBox::m_hWndEdit = NULL;
HWND  CInputBox::m_hWndOK = NULL;
HWND  CInputBox::m_hWndCancel = NULL;
HWND  CInputBox::m_hWndPrompt = NULL;

HINSTANCE CInputBox::m_hInst = NULL;


//////////////////////////////////////////////////////////////////////
// CInputBox Class
//////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////
// Construction/Destruction
//////////////////////////////////////////////////////////////////////

/*
Author      : mah
Date        : 13.06.2002
Description :
    Constructs window class InputBox
*/
CInputBox::CInputBox(HWND hWndParent)
{
	HINSTANCE hInst = GetModuleHandle(NULL);

	WNDCLASSEX wcex;

	if (!GetClassInfoEx(hInst, "InputBox", &wcex))
	{
		wcex.cbSize = sizeof(WNDCLASSEX);

		wcex.style			= CS_HREDRAW | CS_VREDRAW;
		wcex.lpfnWndProc	= (WNDPROC)WndProc;
		wcex.cbClsExtra		= 0;
		wcex.cbWndExtra		= 0;
		wcex.hInstance		= hInst;
		wcex.hIcon			= NULL;//LoadIcon(hInst, (LPCTSTR)IDI_MYINPUTBOX);
		wcex.hCursor		= LoadCursor(NULL, IDC_ARROW);
		wcex.hbrBackground	= (HBRUSH)(COLOR_WINDOW);
		wcex.lpszMenuName	= NULL;
		wcex.lpszClassName	= "InputBox";
		wcex.hIconSm		= NULL;

		if (RegisterClassEx(&wcex) == 0)
			MessageBox(NULL, "Can't create CInputBox!", "Error", MB_OK);
	}

    m_hWndParent = hWndParent;

    Text = NULL;

}

CInputBox::~CInputBox()
{
    if (Text) delete[] Text;
}

/*
Author      : mah
Date        : 13.06.2002
Description : Window procedure
*/
LRESULT CALLBACK CInputBox::WndProc(HWND hWnd, UINT message, WPARAM wParam, LPARAM lParam)
{
    LOGFONT lfont;

	switch (message)
	{
		case WM_CREATE:
            // font
            memset(&lfont, 0, sizeof(lfont));
            lstrcpy(lfont.lfFaceName, _T("Arial"));
            lfont.lfHeight = 16;
            lfont.lfWeight = FW_NORMAL;//FW_BOLD;
            lfont.lfItalic = FALSE;
            lfont.lfCharSet = DEFAULT_CHARSET;
            lfont.lfOutPrecision = OUT_DEFAULT_PRECIS;
            lfont.lfClipPrecision = CLIP_DEFAULT_PRECIS;
            lfont.lfQuality = DEFAULT_QUALITY;
            lfont.lfPitchAndFamily = DEFAULT_PITCH;
	        m_hFont = CreateFontIndirect(&lfont);

	        m_hInst = GetModuleHandle(NULL);

			// creating Edit
			m_hWndEdit = CreateWindowEx(WS_EX_STATICEDGE,
				"edit","",
				WS_VISIBLE | WS_CHILD  | WS_TABSTOP | ES_AUTOHSCROLL,
				5, INPUTBOX_HEIGHT - 50, INPUTBOX_WIDTH - 16, 20,
				hWnd,
				NULL,
				m_hInst,
				NULL);

            // setting font
			SendMessage(m_hWndEdit, WM_SETFONT, (WPARAM)m_hFont, 0);

            // button OK
			m_hWndOK = CreateWindowEx(WS_EX_STATICEDGE,
				"button","OK",
				WS_VISIBLE | WS_CHILD | WS_TABSTOP,
				INPUTBOX_WIDTH - 100, 10, 90, 25,
				hWnd,
				NULL,
				m_hInst,
				NULL);

            // setting font
            SendMessage(m_hWndOK, WM_SETFONT, (WPARAM)m_hFont, 0);

            // button Cancel
			m_hWndCancel = CreateWindowEx(WS_EX_STATICEDGE,
				"button","Cancel",
				WS_VISIBLE | WS_CHILD | WS_TABSTOP,
				INPUTBOX_WIDTH - 100, 40, 90, 25,
				hWnd,
				NULL,
				m_hInst,
				NULL);

            // setting font
            SendMessage(m_hWndCancel, WM_SETFONT, (WPARAM)m_hFont, 0);

            // static Propmpt
			m_hWndPrompt = CreateWindowEx(WS_EX_STATICEDGE,
				"static","",
				WS_VISIBLE | WS_CHILD,
				5, 10, INPUTBOX_WIDTH - 110, INPUTBOX_HEIGHT - 70,
				hWnd,
				NULL,
				m_hInst,
				NULL);

            // setting font
            SendMessage(m_hWndPrompt, WM_SETFONT, (WPARAM)m_hFont, 0);

            SetFocus(m_hWndEdit);
			break;
		case WM_DESTROY:

			DeleteObject(m_hFont);


			EnableWindow(m_hWndParent, TRUE);
			SetForegroundWindow(m_hWndParent);
			DestroyWindow(hWnd);
			PostQuitMessage(0);

			break;
        case WM_COMMAND:
            switch (HIWORD(wParam))
            {
                case BN_CLICKED:
                    if ((HWND)lParam == m_hWndOK)
                        PostMessage(m_hWndInputBox, WM_KEYDOWN, VK_RETURN, 0);
                    if ((HWND)lParam == m_hWndCancel)
                        PostMessage(m_hWndInputBox, WM_KEYDOWN, VK_ESCAPE, 0);
                    break;
            }
            break;

		default:
			return DefWindowProc(hWnd, message, wParam, lParam);
   }
   return 0;
}

/*
Author      : mah
Date        : 13.06.2002
Description :
        Constructs InputBox window
*/
BOOL CInputBox::DoModal(LPCTSTR szCaption, LPCTSTR szPrompt)
{
	RECT r;
	GetWindowRect(GetDesktopWindow(), &r);

	m_hWndInputBox = CreateWindowEx(WS_EX_TOOLWINDOW,
                "InputBox",
                szCaption,
                WS_POPUPWINDOW | WS_CAPTION | WS_TABSTOP,
                (r.right - INPUTBOX_WIDTH) / 2, (r.bottom - INPUTBOX_HEIGHT) / 2,
                INPUTBOX_WIDTH, INPUTBOX_HEIGHT,
                m_hWndParent,
                NULL,
                m_hInst,
                NULL);
    if(m_hWndInputBox == NULL)
        return FALSE;


    SetWindowText(m_hWndPrompt, szPrompt);

    SetForegroundWindow(m_hWndInputBox);

	EnableWindow(m_hWndParent, FALSE);

    ShowWindow(m_hWndInputBox, SW_SHOW);
    UpdateWindow(m_hWndInputBox);

    BOOL ret = 0;

	MSG msg;

    HWND hWndFocused;

    while (GetMessage(&msg, NULL, 0, 0))
    {
		if (msg.message == WM_KEYDOWN)
		{
			if (msg.wParam == VK_ESCAPE)
            {
				SendMessage(m_hWndInputBox, WM_DESTROY, 0, 0);
                ret = 0;
            }
			if (msg.wParam == VK_RETURN)
            {
                int nCount = GetWindowTextLength(m_hWndEdit);
                nCount++;
                if (Text)
                {
                    delete[] Text;
                    Text = NULL;
                }
                Text = new TCHAR[nCount];
                GetWindowText(m_hWndEdit, Text, nCount);
			    SendMessage(m_hWndInputBox, WM_DESTROY, 0, 0);
                ret = 1;
            }
			if (msg.wParam == VK_TAB)
            {
                hWndFocused = GetFocus();
                if (hWndFocused == m_hWndEdit) SetFocus(m_hWndOK);
                if (hWndFocused == m_hWndOK) SetFocus(m_hWndCancel);
                if (hWndFocused == m_hWndCancel) SetFocus(m_hWndEdit);
            }

		}
        TranslateMessage(&msg);
		DispatchMessage(&msg);
    }

	return ret;
}

#undef INPUTBOX_WIDTH
#undef INPUTBOX_HEIGHT
#endif

////////////////////////////////////////////////////////////
/// Affiche une boite de dialogue pour entrer un texte
///
/// Type : ShowTextInput
/// Paramètre 1 : Variable de la scène où enregistrer le texte
/// Paramètre 2 : Message
/// Paramètre 3 : Titre
////////////////////////////////////////////////////////////
bool ActShowTextInput( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    sf::Clock timeSpent;
    string result;

    #if defined(WINDOWS)
    CInputBox ibox(NULL);
    if (ibox.DoModal(eval.EvalTxt(action.GetParameter(2)).c_str(), eval.EvalTxt(action.GetParameter(1)).c_str()))
        result = ibox.Text;
    #endif
    #if defined(LINUX)
    //Affichage de la fenêtre pour entrer un texte
    nw::TextInput dialog(eval.EvalTxt(action.GetParameter(2)), eval.EvalTxt(action.GetParameter(1)), result);
    dialog.wait_until_closed();
    #endif

    scene->pauseTime += timeSpent.GetElapsedTime();

    //On cherche la variable
    int ID = scene->variables.FindVariable( action.GetParameter( 0 ).GetPlainString() );
    if ( ID == -1 )
    {
        //Si elle n'existe pas, on la créé
        scene->variables.variables.push_back( Variable(action.GetParameter( 0 ).GetPlainString()) );
        ID = scene->variables.variables.size() - 1; //On reprend l'identifiant
    }

    scene->variables.variables.at( ID ) = result;

    return true;
}
