#include "GDCore/Window/RenderingWindow.h"

#include <SFML/Window/Mouse.hpp>

namespace gd
{

sf::Vector2i RenderingWindow::GetMousePosition()
{
    return sf::Mouse::getPosition();
}

sf::Vector2i RenderingWindow::GetMousePosition(const RenderingWindow & window)
{
    return sf::Mouse::getPosition() - window.GetPosition();
}

void RenderingWindow::SetMousePosition(const sf::Vector2i & position)
{
    sf::Mouse::setPosition(position);
}

void RenderingWindow::SetMousePosition(const sf::Vector2i & position, const RenderingWindow & window)
{
    sf::Mouse::setPosition(position + window.GetPosition());
}

}
