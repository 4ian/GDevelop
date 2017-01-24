#ifndef GDCORE_RENDERINGWINDOW_H
#define GDCORE_RENDERINGWINDOW_H

#include <SFML/System/Vector2.hpp>

#include "GDCore/String.h"

namespace sf { class RenderTarget; }
namespace sf { class Event; }

namespace gd
{

class RenderingWindow
{
public:
    RenderingWindow() {};
    virtual ~RenderingWindow() {}

    virtual const sf::RenderTarget & GetRenderingTarget() const = 0;
    virtual sf::RenderTarget & GetRenderingTarget() = 0;

    virtual void Display() = 0;

    static sf::Vector2i GetMousePosition();
    static sf::Vector2i GetMousePosition(const RenderingWindow & window);

    static void SetMousePosition(const sf::Vector2i & position);
    static void SetMousePosition(const sf::Vector2i & position, const RenderingWindow & window);

    virtual void Close() = 0;

    virtual bool PollEvent(sf::Event & event) = 0;

    virtual sf::Vector2i GetPosition() const = 0;
    virtual void SetPosition(const sf::Vector2i & pos) = 0;

    virtual sf::Vector2u GetSize() const = 0;
    virtual void SetSize(const sf::Vector2u & size) = 0;

    virtual void SetFullScreen(bool fullscreen) = 0;

    virtual void SetTitle(const gd::String & title) = 0;

    virtual void SetVerticalSyncEnabled(bool enabled) = 0;

    virtual void SetKeyRepeatEnabled(bool enabled) = 0;

    virtual void SetFramerateLimit(unsigned int limit) = 0;

    virtual void SetMouseCursorVisible(bool visible) = 0;

    virtual bool SetActive(bool active = true) = 0;
};

}

#endif
