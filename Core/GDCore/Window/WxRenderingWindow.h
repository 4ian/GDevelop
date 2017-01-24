#ifndef GDCORE_WXRENDERINGWINDOW
#define GDCORE_WXRENDERINGWINDOW

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

#include <wx/panel.h>
#include <SFML/Graphics/RenderTexture.hpp>

#include "GDCore/Window/RenderingWindow.h"

namespace gd
{

class GD_CORE_API WxRenderingWindow : public wxPanel, public RenderingWindow
{
public:
 	WxRenderingWindow(wxWindow * parent, sf::Vector2u renderingSize = sf::Vector2u(-1, -1), wxWindowID id = wxID_ANY, const wxPoint & pos = wxDefaultPosition, const wxSize & size = wxDefaultSize, long style = wxWANTS_CHARS, const wxString & name = wxPanelNameStr);

    virtual const sf::RenderTarget & GetRenderingTarget() const;
    virtual sf::RenderTarget & GetRenderingTarget();

    virtual void Display();

    virtual sf::Texture CaptureAsTexture() const;

    virtual void Close() {}

    virtual bool PollEvent(sf::Event & event);

    virtual sf::Vector2i GetPosition() const;
    virtual void SetPosition(const sf::Vector2i & pos);

    virtual sf::Vector2u GetSize() const;
    virtual void SetSize(const sf::Vector2u & size);

    virtual void SetFullScreen(bool fullscreen) {}

    virtual void SetTitle(const gd::String & title) {}

    virtual void SetVerticalSyncEnabled(bool enabled) {}

    virtual void SetKeyRepeatEnabled(bool enabled) {}

    virtual void SetFramerateLimit(unsigned int limit) {}

    virtual void SetMouseCursorVisible(bool visible) {}

    virtual bool SetActive(bool active = true);

    bool IsOpen() const { return true; }

    virtual void OnPaint(wxPaintEvent& event);
    virtual void OnEraseBackground(wxEraseEvent& event);

private:
    sf::RenderTexture texture;

    bool automaticSize;
};

}

#endif

#endif
