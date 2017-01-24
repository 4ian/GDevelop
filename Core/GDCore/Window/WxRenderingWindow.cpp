#include "GDCore/Window/WxRenderingWindow.h"

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

#include <wx/dcbuffer.h>
#include <wx/rawbmp.h>

namespace
{

    /**
     * Thanks to https://forums.wxwidgets.org/viewtopic.php?t=20074
     */
    typedef wxAlphaPixelData PixelData;
    wxBitmap * RGBAtoBitmap(const unsigned char *rgba, int w, int h)
    {
        wxBitmap * bitmap = new wxBitmap(w, h, 32);
        if(!bitmap->Ok())
        {
            delete bitmap;
            return NULL;
        }

        PixelData bmdata(*bitmap);
        if(bmdata == NULL)
        {
            delete bitmap;
            return NULL;
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

sf::Texture WxRenderingWindow::CaptureAsTexture() const
{
    return sf::Texture(texture.getTexture());
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
    /*wxImage image(sfImage.getSize().x, sfImage.getSize().y, false);

    for(std::size_t x = 0; x < sfImage.getSize().x; ++x)
    {
        for(std::size_t y = 0; y < sfImage.getSize().y; ++y)
        {
            sf::Color pixel = sfImage.getPixel(x, y);
            image.SetRGB(x, y, pixel.r, pixel.g, pixel.b);
            image.SetAlpha(x, y, pixel.a);
        }
    }

    wxBitmap bitmap(image);*/

    wxBitmap * bitmap = RGBAtoBitmap(sfImage.getPixelsPtr(), sfImage.getSize().x, sfImage.getSize().y);
    dc.DrawBitmap(*bitmap, 0, 0, false);
    delete bitmap;
}

void WxRenderingWindow::OnEraseBackground(wxEraseEvent& event)
{

}

}

#endif
