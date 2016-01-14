/*
 * GDevelop IDE
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
 */
#ifndef CREDITS_H
#define CREDITS_H

//(*Headers(Credits)
#include <wx/bmpbuttn.h>
#include <wx/dialog.h>
#include <wx/sizer.h>
#include <wx/notebook.h>
#include <wx/button.h>
#include <wx/hyperlink.h>
#include <wx/panel.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/statbmp.h>
#include <wx/html/htmlwin.h>
//*)

/**
 * \brief Internal class used to display an html window with links redirected to the default system browser.
 */
class CustomHtmlWindow: public wxHtmlWindow
{
public:
	CustomHtmlWindow(wxWindow *parent, wxWindowID id = -1,
		const wxPoint& pos = wxDefaultPosition, const wxSize& size = wxDefaultSize,
		long style = wxHW_SCROLLBAR_AUTO, const wxString& name = _T("htmlWindow"))
    : wxHtmlWindow(parent, id, pos, size, style, name)
    {
    }

	void OnLinkClicked(const wxHtmlLinkInfo& link)
    {
        wxLaunchDefaultBrowser(link.GetHref());
    }
};

/**
 * \brief The window showing information about GDevelop, technologies and contributors.
 */
class Credits: public wxDialog
{
public:

	Credits(wxWindow* parent);
	virtual ~Credits();

	//(*Declarations(Credits)
	wxBitmapButton* BitmapButton2;
	wxBitmapButton* BitmapButton8;
	wxPanel* Panel1;
	wxBitmapButton* BitmapButton3;
	wxHyperlinkCtrl* florianRival;
	wxBitmapButton* BitmapButton10;
	wxStaticText* StaticText1;
	wxHyperlinkCtrl* HyperlinkCtrl1;
	wxPanel* Panel2;
	wxStaticText* StaticText3;
	wxPanel* Panel4;
	CustomHtmlWindow* HtmlWindow1;
	wxStaticText* StaticText8;
	wxBitmapButton* BitmapButton5;
	wxBitmapButton* BitmapButton4;
	wxPanel* Panel3;
	wxTextCtrl* TextCtrl1;
	wxStaticText* StaticText4;
	wxStaticText* StaticText5;
	wxNotebook* Notebook1;
	wxStaticBitmap* StaticBitmap1;
	wxBitmapButton* BitmapButton7;
	wxButton* OkBt;
	wxStaticText* StaticText6;
	wxBitmapButton* BitmapButton1;
	wxStaticBitmap* StaticBitmap2;
	//*)

protected:

	//(*Identifiers(Credits)
	static const long ID_STATICBITMAP1;
	static const long ID_STATICTEXT1;
	static const long ID_STATICTEXT4;
	static const long ID_HYPERLINKCTRL1;
	static const long ID_STATICBITMAP2;
	static const long ID_STATICTEXT5;
	static const long ID_HYPERLINKCTRL2;
	static const long ID_PANEL1;
	static const long ID_TEXTCTRL1;
	static const long ID_PANEL2;
	static const long ID_HTMLWINDOW1;
	static const long ID_PANEL3;
	static const long ID_STATICTEXT3;
	static const long ID_BITMAPBUTTON8;
	static const long ID_BITMAPBUTTON9;
	static const long ID_BITMAPBUTTON10;
	static const long ID_STATICTEXT8;
	static const long ID_BITMAPBUTTON11;
	static const long ID_BITMAPBUTTON12;
	static const long ID_BITMAPBUTTON3;
	static const long ID_STATICTEXT6;
	static const long ID_BITMAPBUTTON1;
	static const long ID_BITMAPBUTTON5;
	static const long ID_PANEL4;
	static const long ID_NOTEBOOK1;
	static const long ID_BUTTON1;
	//*)

private:

	//(*Handlers(Credits)
	void OnOkBtClick(wxCommandEvent& event);
	void OnCppBtClick(wxCommandEvent& event);
	void OnGccBtClick(wxCommandEvent& event);
	void OnCBBtClick(wxCommandEvent& event);
	void OnSFMLBtClick(wxCommandEvent& event);
	void OnWxBtClick(wxCommandEvent& event);
	void OnCompilGamesBtClick(wxCommandEvent& event);
	void OnDonBtClick(wxCommandEvent& event);
	void OnTextCtrl1Text(wxCommandEvent& event);
	void OnLLVMBtClick(wxCommandEvent& event);
	void OnTinyXmlBtClick(wxCommandEvent& event);
	void OnBoostBtClick(wxCommandEvent& event);
	void OnJSBtClick(wxCommandEvent& event);
	void OnJQueryBtClick(wxCommandEvent& event);
	void OnPixiJsBtClick(wxCommandEvent& event);
	//*)
    void OpenLink(wxString link);

	DECLARE_EVENT_TABLE()
};

#endif

