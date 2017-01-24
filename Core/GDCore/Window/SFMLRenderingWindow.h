#ifndef GDCORE_SFMLRENDERINGWINDOW_H
#define GDCORE_SFMLRENDERINGWINDOW_H

#include "GDCore/Window/RenderingWindow.h"

#include <SFML/Graphics/RenderWindow.hpp>

namespace gd
{

class SFMLRenderingWindow : public RenderingWindow
{
public:
    SFMLRenderingWindow(sf::VideoMode mode, const gd::String & title, sf::Uint32 style = sf::Style::Default, const sf::ContextSettings & settings = sf::ContextSettings());

    virtual const sf::RenderTarget & GetRenderingTarget() const;
    virtual sf::RenderTarget & GetRenderingTarget();

    virtual void Display();

    virtual void Close();

    virtual bool PollEvent(sf::Event & event);

    virtual sf::Vector2i GetPosition() const;
    virtual void SetPosition(const sf::Vector2i & pos);

    virtual sf::Vector2u GetSize() const;
    virtual void SetSize(const sf::Vector2u & size);

    virtual void SetFullScreen(bool fullscreen);

    virtual void SetTitle(const gd::String & title);

    virtual void SetVerticalSyncEnabled(bool enabled);

    virtual void SetKeyRepeatEnabled(bool enabled);

    virtual void SetFramerateLimit(unsigned int limit);

    virtual void SetMouseCursorVisible(bool visible);

    virtual bool SetActive(bool active = true);

    bool IsOpen() const;

private:
    sf::RenderWindow window;

    sf::VideoMode mode;
    gd::String title;
    sf::Uint32 style;
};

}

#endif
