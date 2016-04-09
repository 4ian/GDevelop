/**

GDevelop - Common Dialogs Extension
Copyright (c) 2008-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include <vector>
#include <string>
#include <iostream>
#include <sstream>
#include <vector>
#include <algorithm>

#include "GDCpp/Runtime/Project/Object.h"
#include "GDCpp/Runtime/RuntimeScene.h"
#include "GDCpp/Runtime/Project/Variable.h"

//Windows build uses native windows-dialogs
#if defined(WINDOWS)
#define UNICODE
#include <windows.h>
#include <Commdlg.h>
#include <unistd.h>
#endif

//Linux build uses dlib for dialogs
#if defined(LINUX) || defined(MACOS)
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
void GD_EXTENSION_API ShowMessageBox( RuntimeScene & scene, const gd::String & message, const gd::String & title )
{
    sf::Clock timeSpent;

    //Display the box
    #if defined(WINDOWS)
    MessageBoxW(NULL, message.ToWide().c_str(), title.ToWide().c_str(), MB_ICONINFORMATION);
    #endif
    #if defined(LINUX) || defined(MACOS)
    nw::MsgBox msgBox(title.ToLocale(), message.ToLocale());
    msgBox.wait_until_closed();
    #endif

    scene.GetTimeManager().NotifyPauseWasMade(timeSpent.getElapsedTime().asMicroseconds());//Don't take the time spent in this function in account.
}

/**
 * Display an "open file" dialog
 */
void GD_EXTENSION_API ShowOpenFile( RuntimeScene & scene, gd::Variable & variable, const gd::String & title, gd::String filters )
{
    sf::Clock timeSpent;

    gd::String result;

    //Display the dialog
    #if defined(WINDOWS)
    //Process filters to match windows dialogs filters style.
    filters.Raw() = filters.Raw()+'\0';
    std::replace(filters.Raw().begin(), filters.Raw().end(), '|', '\0');

    OPENFILENAMEW toGetFileName; //Struct for the dialog
    wchar_t filePath[MAX_PATH];
    _wgetcwd(filePath, MAX_PATH);

    ZeroMemory(&toGetFileName, sizeof(OPENFILENAMEW));
    toGetFileName.lStructSize = sizeof(OPENFILENAMEW);
    toGetFileName.hwndOwner = NULL;
    toGetFileName.lpstrFile = filePath;
    toGetFileName.nMaxFile = MAX_PATH;
    toGetFileName.lpstrFilter = filters == "\0" ? NULL : filters.ToWide().c_str();
    toGetFileName.nFilterIndex = 1;
    toGetFileName.Flags = OFN_PATHMUSTEXIST | OFN_NOCHANGEDIR;;

    if(GetOpenFileNameW(&toGetFileName) == TRUE)
        result = gd::String::FromWide(filePath);
    #endif
    #if defined(LINUX) || defined(MACOS)
    std::string strResult;
    nw::OpenFile * dialog = new nw::OpenFile(title.ToLocale(), true, strResult);
    dialog->wait_until_closed();
    result = gd::String::FromLocale(strResult);
    #endif

    scene.GetTimeManager().NotifyPauseWasMade(timeSpent.getElapsedTime().asMicroseconds());//Don't take the time spent in this function in account.

    //Update the variable
    variable.SetString(result);
}

/**
 * Show a message box with Yes/No buttons
 */
void GD_EXTENSION_API ShowYesNoMsgBox( RuntimeScene & scene, gd::Variable & variable, const gd::String & message, const gd::String & title )
{
    sf::Clock timeSpent;

    gd::String result;

    //Display the box
    #if defined(WINDOWS)
    if( MessageBoxW(NULL, message.ToWide().c_str(), title.ToWide().c_str(), MB_ICONQUESTION | MB_YESNO) == IDYES)
        result = "yes";
    else
        result = "no";
    #endif
    #if defined(LINUX) || defined(MACOS)
    nw::YesNoMsgBox dialog(title.ToLocale(), message.ToLocale(), result.Raw());
    dialog.wait_until_closed();
    #endif

    scene.GetTimeManager().NotifyPauseWasMade(timeSpent.getElapsedTime().asMicroseconds());//Don't take the time spent in this function in account.

    //Update the variable
    variable.SetString(result); //Can only be "yes" or "no", no need to encode in UTF8
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
	LPWSTR Text;
    BOOL DoModal(LPCWSTR szCaption, LPCWSTR szPrompt);

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

	WNDCLASSEXW wcex;

	if (!GetClassInfoExW(hInst, L"InputBox", &wcex))
	{
		wcex.cbSize = sizeof(WNDCLASSEXW);

		wcex.style			= CS_HREDRAW | CS_VREDRAW;
		wcex.lpfnWndProc	= (WNDPROC)WndProc;
		wcex.cbClsExtra		= 0;
		wcex.cbWndExtra		= 0;
		wcex.hInstance		= hInst;
		wcex.hIcon			= NULL;//LoadIcon(hInst, (LPCTSTR)IDI_MYINPUTBOX);
		wcex.hCursor		= LoadCursor(NULL, IDC_ARROW);
		wcex.hbrBackground	= (HBRUSH)(COLOR_WINDOW);
		wcex.lpszMenuName	= NULL;
		wcex.lpszClassName	= L"InputBox";
		wcex.hIconSm		= NULL;

		if (RegisterClassExW(&wcex) == 0)
			MessageBoxW(NULL, L"Can't create CInputBox!", L"Error", MB_OK);
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
    LOGFONTW lfont;

	switch (message)
	{
		case WM_CREATE:
            // font
            memset(&lfont, 0, sizeof(lfont));
            lstrcpy(lfont.lfFaceName, L"Arial");
            lfont.lfHeight = 16;
            lfont.lfWeight = FW_NORMAL;//FW_BOLD;
            lfont.lfItalic = FALSE;
            lfont.lfCharSet = DEFAULT_CHARSET;
            lfont.lfOutPrecision = OUT_DEFAULT_PRECIS;
            lfont.lfClipPrecision = CLIP_DEFAULT_PRECIS;
            lfont.lfQuality = DEFAULT_QUALITY;
            lfont.lfPitchAndFamily = DEFAULT_PITCH;
	        m_hFont = CreateFontIndirectW(&lfont);

	        m_hInst = GetModuleHandle(NULL);

			// creating Edit
			m_hWndEdit = CreateWindowExW(WS_EX_STATICEDGE,
				L"edit",L"",
				WS_VISIBLE | WS_CHILD  | WS_TABSTOP | ES_AUTOHSCROLL,
				5, INPUTBOX_HEIGHT - 50, INPUTBOX_WIDTH - 16, 20,
				hWnd,
				NULL,
				m_hInst,
				NULL);

            // setting font
			SendMessage(m_hWndEdit, WM_SETFONT, (WPARAM)m_hFont, 0);

            // button OK
			m_hWndOK = CreateWindowExW(WS_EX_STATICEDGE,
				L"button",L"OK",
				WS_VISIBLE | WS_CHILD | WS_TABSTOP,
				INPUTBOX_WIDTH - 100, 10, 90, 25,
				hWnd,
				NULL,
				m_hInst,
				NULL);

            // setting font
            SendMessage(m_hWndOK, WM_SETFONT, (WPARAM)m_hFont, 0);

            // button Cancel
			m_hWndCancel = CreateWindowExW(WS_EX_STATICEDGE,
				L"button",L"Cancel",
				WS_VISIBLE | WS_CHILD | WS_TABSTOP,
				INPUTBOX_WIDTH - 100, 40, 90, 25,
				hWnd,
				NULL,
				m_hInst,
				NULL);

            // setting font
            SendMessage(m_hWndCancel, WM_SETFONT, (WPARAM)m_hFont, 0);

            // static Propmpt
			m_hWndPrompt = CreateWindowExW(WS_EX_STATICEDGE,
				L"static",L"",
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
BOOL CInputBox::DoModal(LPCWSTR szCaption, LPCWSTR szPrompt)
{
	RECT r;
	GetWindowRect(GetDesktopWindow(), &r);

	m_hWndInputBox = CreateWindowExW(WS_EX_TOOLWINDOW,
                L"InputBox",
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


    SetWindowTextW(m_hWndPrompt, szPrompt);

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
                int nCount = GetWindowTextLengthW(m_hWndEdit);
                nCount++;
                if (Text)
                {
                    delete[] Text;
                    Text = NULL;
                }
                Text = new WCHAR[nCount];
                GetWindowTextW(m_hWndEdit, Text, nCount);
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
bool GD_EXTENSION_API ShowTextInput( RuntimeScene & scene, gd::Variable & variable, const gd::String & message, const gd::String & title )
{
    sf::Clock timeSpent;
    gd::String result;

    //Display the box
    #if defined(WINDOWS)
    CInputBox ibox(NULL);
    if (ibox.DoModal(title.ToWide().c_str(), message.ToWide().c_str()))
        result = gd::String::FromWide(ibox.Text);
    #endif
    #if defined(LINUX) || defined(MACOS)
    std::string strResult;
    nw::TextInput dialog(title.ToLocale(), message.ToLocale(), strResult);
    dialog.wait_until_closed();
    result = gd::String::FromLocale(strResult); //Convert from locale
    #endif

    scene.GetTimeManager().NotifyPauseWasMade(timeSpent.getElapsedTime().asMicroseconds());//Don't take the time spent in this function in account.

    //Update the variable
    variable.SetString(result);

    return true;
}

}
} //namespace GDpriv
