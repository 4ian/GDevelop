#ifndef MP3OGG_H
#define MP3OGG_H

//(*Headers(mp3ogg)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)

class mp3ogg: public wxDialog
{
	public:

		mp3ogg(wxWindow* parent);
		virtual ~mp3ogg();

		//(*Declarations(mp3ogg)
		wxStaticText* StaticText2;
		wxButton* FermerBt;
		wxButton* EncoderWAVBt;
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxStaticLine* StaticLine2;
		wxStaticLine* StaticLine1;
		wxButton* EncoderBt;
		wxStaticText* StaticText4;
		wxStaticBitmap* StaticBitmap3;
		//*)

	protected:

		//(*Identifiers(mp3ogg)
		static const long ID_STATICBITMAP3;
		static const long ID_STATICTEXT1;
		static const long ID_PANEL1;
		static const long ID_STATICLINE1;
		static const long ID_STATICTEXT3;
		static const long ID_BUTTON1;
		static const long ID_STATICTEXT4;
		static const long ID_BUTTON3;
		static const long ID_STATICTEXT2;
		static const long ID_STATICLINE2;
		static const long ID_BUTTON2;
		//*)

	private:

		//(*Handlers(mp3ogg)
		void OnFermerBtClick(wxCommandEvent& event);
		void OnEncoderBtClick(wxCommandEvent& event);
		void OnEncoderWAVBtClick(wxCommandEvent& event);
		//*)

		DECLARE_EVENT_TABLE()
};

#endif
