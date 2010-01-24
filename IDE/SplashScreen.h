#ifndef SPLASHSCREEN_H
#define SPLASHSCREEN_H

#ifdef DEBUG
#include "nommgr.h"
#endif

#include <wx/bitmap.h>
#include <wx/dc.h>
#include <wx/timer.h>
#include <wx/frame.h>

#ifdef DEBUG

#endif

class SplashScreen : public wxFrame
{
  private:
    wxBitmap m_label;
    wxRegion r;
    wxTimer m_timer;
  public:
    // A value of -1 for timeout makes it stay forever (you need to close it manually)
    SplashScreen(wxBitmap &label, long timeout, wxWindow *parent, wxWindowID id, long style = wxSTAY_ON_TOP | wxNO_BORDER | wxFRAME_NO_TASKBAR | wxFRAME_SHAPED);
    ~SplashScreen();

    bool timeUp;

  private:
    void DoPaint(wxDC &dc);
    void OnPaint(wxPaintEvent &);
    void OnEraseBackground(wxEraseEvent &);
    void OnTimer(wxTimerEvent &);
    void OnCloseWindow(wxCloseEvent &);
    void OnChar(wxKeyEvent &);
    void OnMouseEvent(wxMouseEvent &event);

  DECLARE_EVENT_TABLE()
};

#endif // SPLASHSCREEN_H
