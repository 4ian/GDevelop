/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef RENDERDIALOG_H
#define RENDERDIALOG_H

//(*Headers(RenderDialog)
#include "wxSFMLCanvas.hpp"
#include <wx/dialog.h>
//*)
class CppLayoutPreviewer;

/**
 * \brief Window used to mimic a sf::RenderWindow inside an IDE.
 */
class GD_API RenderDialog: public wxDialog
{
public:

    RenderDialog(wxWindow* parent, CppLayoutPreviewer * sceneCanvasNotifiedOnClose = NULL);
    virtual ~RenderDialog();

    void SetSizeOfRenderingZone(unsigned int width, unsigned int height);

    //(*Declarations(RenderDialog)
    wxSFMLCanvas* renderCanvas;
    //*)

protected:

    //(*Identifiers(RenderDialog)
    static const long ID_CUSTOM1;
    //*)

private:

    //(*Handlers(RenderDialog)
    void OnClose(wxCloseEvent& event);
    //*)

    CppLayoutPreviewer * toBeNotifiedOnClose; ///< Optional scene canvas that can be notified when the window is closed.

    DECLARE_EVENT_TABLE()
};

#endif
#endif
