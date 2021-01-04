#include "GDCpp/Extensions/Builtin/MouseTools.h"
#include <SFML/Graphics.hpp>
#include "GDCpp/Runtime/RuntimeLayer.h"
#include "GDCpp/Runtime/RuntimeScene.h"

void GD_API CenterCursor(RuntimeScene &scene) {
  sf::Mouse::setPosition(sf::Vector2i(scene.renderWindow->getSize().x / 2,
                                      scene.renderWindow->getSize().y / 2),
                         *scene.renderWindow);
}

void GD_API CenterCursorHorizontally(RuntimeScene &scene) {
  sf::Mouse::setPosition(
      sf::Vector2i(scene.renderWindow->getSize().x / 2,
                   scene.GetInputManager().GetMousePosition().y),
      *scene.renderWindow);
}

void GD_API CenterCursorVertically(RuntimeScene &scene) {
  sf::Mouse::setPosition(
      sf::Vector2i(scene.GetInputManager().GetMousePosition().x,
                   scene.renderWindow->getSize().y / 2),
      *scene.renderWindow);
}

void GD_API SetCursorPosition(RuntimeScene &scene, float newX, float newY) {
  sf::Mouse::setPosition(sf::Vector2i(newX, newY), *scene.renderWindow);
}

void GD_API HideCursor(RuntimeScene &scene) {
  scene.renderWindow->setMouseCursorVisible(false);
}

void GD_API ShowCursor(RuntimeScene &scene) {
  scene.renderWindow->setMouseCursorVisible(true);
}

double GD_API GetCursorXPosition(RuntimeScene &scene,
                                 const gd::String &layer,
                                 std::size_t camera) {
  if (scene.GetRuntimeLayer(layer).GetCameraCount() == 0) return 0;
  if (camera >= scene.GetRuntimeLayer(layer).GetCameraCount()) camera = 0;

  // Get view, and compute mouse position
  const sf::View &view =
      scene.GetRuntimeLayer(layer).GetCamera(camera).GetSFMLView();
  return scene.renderWindow
      ->mapPixelToCoords(scene.GetInputManager().GetMousePosition(), view)
      .x;
}

double GD_API GetCursorYPosition(RuntimeScene &scene,
                                 const gd::String &layer,
                                 std::size_t camera) {
  if (scene.GetRuntimeLayer(layer).GetCameraCount() == 0) return 0;
  if (camera >= scene.GetRuntimeLayer(layer).GetCameraCount()) camera = 0;

  // Get view, and compute mouse position
  const sf::View &view =
      scene.GetRuntimeLayer(layer).GetCamera(camera).GetSFMLView();
  return scene.renderWindow
      ->mapPixelToCoords(scene.GetInputManager().GetMousePosition(), view)
      .y;
}

bool GD_API MouseButtonPressed(RuntimeScene &scene, const gd::String &button) {
  return scene.GetInputManager().IsMouseButtonPressed(button);
}

bool GD_API MouseButtonReleased(RuntimeScene &scene, const gd::String &button) {
  return scene.GetInputManager().IsMouseButtonReleased(button);
}

int GD_API GetMouseWheelDelta(RuntimeScene &scene) {
  return scene.GetInputManager().GetMouseWheelDelta();
}

bool GD_API IsMouseWheelScrollingUp(RuntimeScene &scene) {
  return scene.GetInputManager().IsScrollingUp();
}

bool GD_API IsMouseWheelScrollingDown(RuntimeScene &scene) {
  return scene.GetInputManager().IsScrollingDown();
}
