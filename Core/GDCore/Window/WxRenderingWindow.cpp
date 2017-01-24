#include "GDCore/Window/WxRenderingWindow.h"

#include <wx/dcbuffer.h>

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

namespace gd
{

WxRenderingWindow::WxRenderingWindow(wxWindow * parent, sf::Vector2u renderingSize, wxWindowID id, const wxPoint & pos, const wxSize & size, long style, const wxString & name) :
    wxPanel(parent, id, pos, size, style|wxWANTS_CHARS, name)
{
    if(renderingSize == sf::Vector2u(-1, -1))
        automaticSize = true;
    else
        automaticSize = false;

    texture.create(
        automaticSize ? size.GetWidth() : renderingSize.x,
        automaticSize ? size.GetHeight() : renderingSize.y,
        true);

    Connect(wxEVT_PAINT, wxPaintEventHandler(WxRenderingWindow::OnPaint), NULL, this);
	Connect(wxEVT_ERASE_BACKGROUND, (wxObjectEventFunction)& WxRenderingWindow::OnEraseBackground);
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
    Refresh();
}

bool WxRenderingWindow::PollEvent(sf::Event & event)
{
    return false;
}

sf::Vector2i WxRenderingWindow::GetPosition() const
{
    return sf::Vector2i(
        wxPanel::GetScreenPosition().x,
        wxPanel::GetScreenPosition().y);
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
    if(size == sf::Vector2u(-1, -1))
    {
        automaticSize = true;
        texture.create(wxPanel::GetSize().GetWidth(), wxPanel::GetSize().GetHeight(), true);
    }
    else
    {
        automaticSize = false;
        texture.create(size.x, size.y, true);
    }
}

bool WxRenderingWindow::SetActive(bool active)
{
    texture.setActive(active);
}

void WxRenderingWindow::OnPaint(wxPaintEvent& event)
{
    wxAutoBufferedPaintDC dc(this);

    sf::Image sfImage = texture.getTexture().copyToImage();
    wxImage image(sfImage.getSize().x, sfImage.getSize().y, false);

    for(std::size_t x = 0; x < sfImage.getSize().x; ++x)
    {
        for(std::size_t y = 0; y < sfImage.getSize().y; ++y)
        {
            sf::Color pixel = sfImage.getPixel(x, y);
            image.SetRGB(x, y, pixel.r, pixel.g, pixel.b);
            image.SetAlpha(x, y, pixel.a);
        }
    }

    wxBitmap bitmap(image);

    dc.DrawBitmap(bitmap, 0, 0, false);
}

void WxRenderingWindow::OnEraseBackground(wxEraseEvent& event)
{

}

}

#endif
