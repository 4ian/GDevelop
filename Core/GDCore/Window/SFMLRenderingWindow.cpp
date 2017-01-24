#include "GDCore/Window/SFMLRenderingWindow.h"

namespace gd
{

SFMLRenderingWindow::SFMLRenderingWindow(sf::VideoMode mode, const gd::String & title, sf::Uint32 style, const sf::ContextSettings & settings) :
    window(mode, title, style, settings),
    mode(mode),
    title(title),
    style(style)
{

}

const sf::RenderTarget & SFMLRenderingWindow::GetRenderingTarget() const
{
    return window;
}

sf::RenderTarget & SFMLRenderingWindow::GetRenderingTarget()
{
    return window;
}

void SFMLRenderingWindow::Display()
{
    window.display();
}

sf::Texture SFMLRenderingWindow::CaptureAsTexture() const
{
    sf::Texture texture;
    texture.create(window.getSize().x, window.getSize().y);
    texture.update(window);

    return texture;
}

void SFMLRenderingWindow::Close()
{
    window.close();
}

bool SFMLRenderingWindow::PollEvent(sf::Event & event)
{
    return window.pollEvent(event);
}

sf::Vector2i SFMLRenderingWindow::GetPosition() const
{
    return window.getPosition();
}

void SFMLRenderingWindow::SetPosition(const sf::Vector2i & pos)
{
    window.setPosition(pos);
}

sf::Vector2u SFMLRenderingWindow::GetSize() const
{
    return window.getSize();
}

void SFMLRenderingWindow::SetSize(const sf::Vector2u & size)
{
    window.setSize(size);
}

void SFMLRenderingWindow::SetFullScreen(bool fullscreen)
{
    sf::Uint32 newStyle = style;
    if(fullscreen)
        newStyle = newStyle | sf::Style::Fullscreen;
    else
        newStyle = newStyle & (~sf::Style::Fullscreen);

    style = newStyle;
    window.create(mode, title, newStyle, window.getSettings());
}

void SFMLRenderingWindow::SetTitle(const gd::String & title)
{
    window.setTitle(title);
}

void SFMLRenderingWindow::SetVerticalSyncEnabled(bool enabled)
{
    window.setVerticalSyncEnabled(enabled);
}

void SFMLRenderingWindow::SetKeyRepeatEnabled(bool enabled)
{
    window.setKeyRepeatEnabled(enabled);
}

void SFMLRenderingWindow::SetFramerateLimit(unsigned int limit)
{
    window.setFramerateLimit(limit);
}

void SFMLRenderingWindow::SetMouseCursorVisible(bool visible)
{
    window.setMouseCursorVisible(visible);
}

bool SFMLRenderingWindow::SetActive(bool active)
{
    window.setActive(active);
}

bool SFMLRenderingWindow::IsOpen() const
{
    return window.isOpen();
}

}
