#include "GDCore/Window/WxRenderingWindow.h"

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

#include <memory>

#include <wx/app.h>
#include <wx/dcbuffer.h>
#include <wx/rawbmp.h>

#include "GDCore/Tools/MakeUnique.h"

namespace
{

    /**
     * Adapted from https://forums.wxwidgets.org/viewtopic.php?t=20074
     */
    typedef wxAlphaPixelData PixelData;
    std::unique_ptr<wxBitmap> RGBAtoBitmap(const unsigned char *rgba, int w, int h)
    {
        auto bitmap = gd::make_unique<wxBitmap>(w, h, 32);
        if(!bitmap->Ok())
        {
            return std::unique_ptr<wxBitmap>();
        }

        PixelData bmdata(*bitmap);
        if(!bmdata)
        {
            return std::unique_ptr<wxBitmap>();
        }

        bmdata.UseAlpha();
        PixelData::Iterator dst(bmdata);

        for(int y = 0; y < h; y++)
        {
            dst.MoveTo(bmdata, 0, y);
            for(int x = 0; x < w; x++)
            {
                // wxBitmap contains rgb values pre-multiplied with alpha
                unsigned char a = rgba[3];
                dst.Red() = rgba[0] * a / 255;
                dst.Green() = rgba[1] * a / 255;
                dst.Blue() = rgba[2] * a / 255;
                dst.Alpha() = a;
                dst++;
                rgba += 4;
            }
        }
        return bitmap;
    }

}

namespace gd
{

WxRenderingWindow::WxRenderingWindow(wxWindow * parent, sf::Vector2u renderingSize, wxWindowID id, const wxPoint & pos, const wxSize & size, long style, const wxString & name) :
    wxControl(parent, id, pos, size, style|wxWANTS_CHARS|wxBORDER_NONE, wxDefaultValidator, name),
    idleEventEnabled(true),
    hasRendered(true),
    eventsQueue()
{
    bool automaticSize = (renderingSize == sf::Vector2u(-1, -1));

    texture.create(size.GetWidth(), size.GetHeight(), true);

    Bind(wxEVT_PAINT, &WxRenderingWindow::OnPaint, this);
	Bind(wxEVT_ERASE_BACKGROUND, &WxRenderingWindow::OnEraseBackground, this);
    Bind(wxEVT_IDLE, &WxRenderingWindow::OnIdle, this);
    Bind(wxEVT_SIZE, &WxRenderingWindow::OnSizeChanged, this);
    Bind(wxEVT_CHAR, &WxRenderingWindow::OnCharEntered, this);
    Bind(wxEVT_MOUSEWHEEL, &WxRenderingWindow::OnMouseWheelScrolled, this);
}

const sf::RenderTarget & WxRenderingWindow::GetRenderingTarget() const
{
    return texture;
}

sf::RenderTarget & WxRenderingWindow::GetRenderingTarget()
{
    return texture;
}

void WxRenderingWindow::Display()
{
    texture.display();
}

sf::Texture WxRenderingWindow::CaptureAsTexture() const
{
    return sf::Texture(texture.getTexture());
}

sf::Texture WxRenderingWindow::CaptureAsTexture() const
{
    return sf::Texture(texture.getTexture());
}

bool WxRenderingWindow::PollEvent(sf::Event & event)
{
    if(eventsQueue.empty())
        return false;

    event = eventsQueue.front();
    eventsQueue.pop();
    return true;
}

sf::Vector2i WxRenderingWindow::GetPosition() const
{
    return sf::Vector2i(
        wxControl::GetScreenPosition().x,
        wxControl::GetScreenPosition().y);
}

void WxRenderingWindow::SetPosition(const sf::Vector2i & pos)
{
    //Do nothing
}

sf::Vector2u WxRenderingWindow::GetSize() const
{
    return texture.getSize();
}

void WxRenderingWindow::SetSize(const sf::Vector2u & size)
{
    texture.create(size.x, size.y, true);
    ForceUpdate();
}

bool WxRenderingWindow::SetActive(bool active)
{
    texture.setActive(active);
}

void WxRenderingWindow::EnableIdleEvents(bool enable)
{
    idleEventEnabled = enable;
    ForceUpdate();
}

void WxRenderingWindow::OnPaint(wxPaintEvent& event)
{
    wxAutoBufferedPaintDC dc(this);

    sf::Image sfImage = texture.getTexture().copyToImage();
    auto bitmap = RGBAtoBitmap(sfImage.getPixelsPtr(), sfImage.getSize().x, sfImage.getSize().y);

    dc.DrawBitmap(*bitmap, 0, 0, false);

    hasRendered = true;

    if(idleEventEnabled)
        wxWakeUpIdle(); // Tell wxWidgets to send an idle event
}

void WxRenderingWindow::OnEraseBackground(wxEraseEvent& event)
{

}

void WxRenderingWindow::OnIdle(wxIdleEvent & event)
{
    if(idleEventEnabled)
    {
        // Send a paint message when the control is idle and has rendered the previous frame
        if(hasRendered)
        {
            OnUpdate();
            hasRendered = false; //Prevent another idle event to update the game before the previous frame has been drawn
            Refresh();
        }

        //Note: A new idle event will be required in OnPaint to avoid to process useless idle events
        //      This greatly reduce the CPU load of this panel
    }
}

void WxRenderingWindow::OnSizeChanged(wxSizeEvent & event)
{
    //Do nothing as it causes some troubles on Windows!
}

void WxRenderingWindow::OnCharEntered(wxKeyEvent & event)
{
    if(event.GetUnicodeKey() != WXK_NONE)
    {
        sf::Event textEvent;
        textEvent.type = sf::Event::TextEntered;
        textEvent.text.unicode = static_cast<sf::Uint32>(event.GetUnicodeKey());

        eventsQueue.push(textEvent);
    }
}

void WxRenderingWindow::OnMouseWheelScrolled(wxMouseEvent & event)
{
    // Push the corresponding SFML mouse wheel event
    sf::Event wheelEvent;
    wheelEvent.type = sf::Event::MouseWheelScrolled;
    wheelEvent.mouseWheelScroll.wheel =
        event.GetWheelAxis() == wxMOUSE_WHEEL_VERTICAL ?
            sf::Mouse::Wheel::VerticalWheel :
            sf::Mouse::Wheel::HorizontalWheel;
    wheelEvent.mouseWheelScroll.delta = static_cast<float>(event.GetWheelRotation()) / static_cast<float>(event.GetWheelDelta());
    wheelEvent.mouseWheelScroll.x = GetMousePosition(*this).x;
    wheelEvent.mouseWheelScroll.y = GetMousePosition(*this).y;
    eventsQueue.push(wheelEvent);

    // Also generate the deprecated one
    sf::Event deprecatedEvent;
    deprecatedEvent.type = sf::Event::MouseWheelMoved;
    deprecatedEvent.mouseWheel.delta = static_cast<float>(event.GetWheelRotation()) / static_cast<float>(event.GetWheelDelta());
    deprecatedEvent.mouseWheel.x = GetMousePosition(*this).x;
    deprecatedEvent.mouseWheel.y = GetMousePosition(*this).y;
    eventsQueue.push(deprecatedEvent);
}

void WxRenderingWindow::ForceUpdate()
{
    texture.clear(sf::Color(255, 255, 255, 255));
    hasRendered = true;
    wxWakeUpIdle();
}

}

#endif
