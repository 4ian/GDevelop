#if defined(GDE)
#ifndef BOX3DINITIALPOSITIONPANEL_H
#define BOX3DINITIALPOSITIONPANEL_H

//(*Headers(ParticleEmitterInitialPositionPanel)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/panel.h>
//*)

class ParticleEmitterInitialPositionPanel: public wxPanel
{
	public:

		ParticleEmitterInitialPositionPanel(wxWindow* parent,wxWindowID id=wxID_ANY,const wxPoint& pos=wxDefaultPosition,const wxSize& size=wxDefaultSize);
		virtual ~ParticleEmitterInitialPositionPanel();

		//(*Declarations(ParticleEmitterInitialPositionPanel)
		wxTextCtrl* rollEdit;
		wxStaticText* StaticText2;
		wxStaticText* StaticText6;
		wxTextCtrl* yawEdit;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxTextCtrl* zEdit;
		wxStaticText* StaticText5;
		wxStaticText* StaticText7;
		wxTextCtrl* pitchEdit;
		wxStaticText* StaticText4;
		//*)

	protected:

		//(*Identifiers(ParticleEmitterInitialPositionPanel)
		static const long ID_STATICTEXT4;
		static const long ID_TEXTCTRL3;
		static const long ID_STATICTEXT5;
		static const long ID_STATICTEXT2;
		static const long ID_TEXTCTRL2;
		static const long ID_STATICTEXT3;
		static const long ID_STATICTEXT6;
		static const long ID_TEXTCTRL4;
		static const long ID_STATICTEXT7;
		static const long ID_STATICTEXT1;
		static const long ID_TEXTCTRL1;
		//*)

	private:

		//(*Handlers(ParticleEmitterInitialPositionPanel)
		//*)

		DECLARE_EVENT_TABLE()
};

#endif
#endif
