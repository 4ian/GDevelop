#if defined(DEACTIVATED)
#ifndef HTMLVIEWERPNL_H
#define HTMLVIEWERPNL_H

//(*Headers(HtmlViewerPnl)
#include <wx/sizer.h>
#include <wx/panel.h>
#include <wx/webview.h>
//*)

class HtmlViewerPnl: public wxPanel
{
	public:

		HtmlViewerPnl(wxWindow* parent,wxWindowID id=wxID_ANY,const wxPoint& pos=wxDefaultPosition,const wxSize& size=wxDefaultSize);
		virtual ~HtmlViewerPnl();

		//(*Declarations(HtmlViewerPnl)
		wxWebView* Custom1;
		//*)

	protected:

		//(*Identifiers(HtmlViewerPnl)
		static const long ID_CUSTOM1;
		//*)

	private:

		//(*Handlers(HtmlViewerPnl)
		//*)

		DECLARE_EVENT_TABLE()
};

#endif
#endif
