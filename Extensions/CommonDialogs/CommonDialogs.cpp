/**

Game Develop - Common Dialogs Extension
Copyright (c) 2008-2014 Florian Rival (Florian.Rival@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/

#include <vector>
#include <string>
#include <iostream>
#include <sstream>
#include <vector>
#include <algorithm>

#include "GDCpp/Object.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/Variable.h"

//Windows build uses native windows-dialogs
#if defined(WINDOWS)
#include <windows.h>
#include <Commdlg.h>
#include <unistd.h>
#endif

//Linux build uses dlib for dialogs
#if defined(LINUX) || defined(MAC)
#include "nwidgets/MessageBox.h"
#include "nwidgets/YesNoMsgBox.h"
#include "nwidgets/OpenFile.h"
#include "nwidgets/TextInput.h"
#endif

using namespace std;

namespace GDpriv
{
namespace CommonDialogs
{

/**
 * Display a simple message box.
 */
void GD_EXTENSION_API ShowMessageBox( RuntimeScene & scene, const std::string & message, const std::string & title )
{
    sf::Clock timeSpent;

    //Display the box
    #if defined(WINDOWS)
    MessageBox(NULL, message.c_str(), title.c_str(), MB_ICONINFORMATION);
    #endif
    #if defined(LINUX) || defined(MAC)
    nw::MsgBox msgBox(title, message);
    msgBox.wait_until_closed();
    #endif

    scene.NotifyPauseWasMade(timeSpent.getElapsedTime().asMicroseconds());//Don't take the time spent in this function in account.
}

/**
 * Display an "open file" dialog
 */
void GD_EXTENSION_API ShowOpenFile( RuntimeScene & scene, gd::Variable & variable, const std::string & title, std::string filters )
{
    sf::Clock timeSpent;

    string result;

    //Display the dialog
    #if defined(WINDOWS)
    //Process filters to match windows dialogs filters style.
    filters = filters+'\0';
    std::replace(filters.begin(), filters.end(), '|', '\0');

    OPENFILENAME toGetFileName; //Struct for the dialog
    char filePath[MAX_PATH];
    getcwd(filePath, MAX_PATH);

    ZeroMemory(&toGetFileName, sizeof(OPENFILENAME));
    toGetFileName.lStructSize = sizeof(OPENFILENAME);
    toGetFileName.hwndOwner = NULL;
    toGetFileName.lpstrFile = filePath;
    toGetFileName.nMaxFile = MAX_PATH;
    toGetFileName.lpstrFilter = filters == "\0" ? NULL : filters.c_str();
    toGetFileName.nFilterIndex = 1;
    toGetFileName.Flags = OFN_PATHMUSTEXIST | OFN_NOCHANGEDIR;;

    if(GetOpenFileName(&toGetFileName) == TRUE)
        result = filePath;
    #endif
    #if defined(LINUX) || defined(MAC)
    nw::OpenFile * dialog = new nw::OpenFile(title, true, result);
    dialog->wait_until_closed();
    #endif

    scene.NotifyPauseWasMade(timeSpent.getElapsedTime().asMicroseconds());//Don't take the time spent in this function in account.

    //Update the variable
    variable.SetString(result);
}

/**
 * Show a message box with Yes/No buttons
 */
void GD_EXTENSION_API ShowYesNoMsgBox( RuntimeScene & scene, gd::Variable & variable, const std::string & message, const std::string & title )
{
    sf::Clock timeSpent;

    string result;

    //Display the box
    #if defined(WINDOWS)
    if( MessageBox(NULL, message.c_str(), title.c_str(), MB_ICONQUESTION | MB_YESNO) == IDYES)
        result = "yes";
    else
        result = "no";
    #endif
    #if defined(LINUX) || defined(MAC)
    nw::YesNoMsgBox dialog(title, message, result);
    dialog.wait_until_closed();
    #endif

    scene.NotifyPauseWasMade(timeSpent.getElapsedTime().asMicroseconds());//Don't take the time spent in this function in account.

    //Update the variable
    variable.SetString(result);
}

//Declaration and definition of a simple input box for windows
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
            lstrcpy(lfont.lfFaceName, ("Arial"));
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
    BringWindowToTop(m_hWndInputBox);

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

/**
 * Show a dialog so as to get a text from user
 */
bool GD_EXTENSION_API ShowTextInput( RuntimeScene & scene, gd::Variable & variable, const std::string & message, const std::string & title )
{
    sf::Clock timeSpent;
    string result;

    //Display the box
    #if defined(WINDOWS)
    CInputBox ibox(NULL);
    if (ibox.DoModal(title.c_str(), message.c_str()))
        result = ibox.Text;
    #endif
    #if defined(LINUX) || defined(MAC)
    nw::TextInput dialog(title, message, result);
    dialog.wait_until_closed();
    #endif

    scene.NotifyPauseWasMade(timeSpent.getElapsedTime().asMicroseconds());//Don't take the time spent in this function in account.

    //Update the variable
    variable.SetString(result);

    return true;
}

}
} //namespace GDpriv

