/**

GDevelop - Anchor Behavior Extension
Copyright (c) 2016 Victor Levasseur (victorlevasseur52@gmail.com)
This project is released under the MIT License.
*/

#include "AnchorRuntimeBehavior.h"
#include <SFML/Window.hpp>
#include <algorithm>
#include <cmath>
#include <iostream>
#include <memory>
#include <set>
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/Localization.h"
#include "GDCpp/Extensions/Builtin/MathematicalTools.h"
#include "GDCpp/Runtime/CommonTools.h"
#include "GDCpp/Runtime/Project/Layout.h"
#include "GDCpp/Runtime/RuntimeGame.h"
#include "GDCpp/Runtime/RuntimeObject.h"
#include "GDCpp/Runtime/RuntimeScene.h"
#include "GDCpp/Runtime/Serialization/SerializerElement.h"
#if defined(GD_IDE_ONLY)
#include <map>
#include "GDCore/Project/PropertyDescriptor.h"
#endif

AnchorRuntimeBehavior::AnchorRuntimeBehavior(
    const gd::SerializerElement& behaviorContent)
    : RuntimeBehavior(behaviorContent),
      m_relativeToOriginalWindowSize(true),
      m_leftEdgeAnchor(ANCHOR_HORIZONTAL_NONE),
      m_rightEdgeAnchor(ANCHOR_HORIZONTAL_NONE),
      m_topEdgeAnchor(ANCHOR_VERTICAL_NONE),
      m_bottomEdgeAnchor(ANCHOR_VERTICAL_NONE),
      m_invalidDistances(true),
      m_leftEdgeDistance(0.f),
      m_rightEdgeDistance(0.f),
      m_topEdgeDistance(0.f),
      m_bottomEdgeDistance(0.f) {
  m_relativeToOriginalWindowSize =
      behaviorContent.GetBoolAttribute("relativeToOriginalWindowSize");
  m_leftEdgeAnchor = static_cast<HorizontalAnchor>(
      behaviorContent.GetIntAttribute("leftEdgeAnchor"));
  m_rightEdgeAnchor = static_cast<HorizontalAnchor>(
      behaviorContent.GetIntAttribute("rightEdgeAnchor"));
  m_topEdgeAnchor = static_cast<VerticalAnchor>(
      behaviorContent.GetIntAttribute("topEdgeAnchor"));
  m_bottomEdgeAnchor = static_cast<VerticalAnchor>(
      behaviorContent.GetIntAttribute("bottomEdgeAnchor"));
}

void AnchorRuntimeBehavior::OnActivate() { m_invalidDistances = true; }

namespace {
sf::Vector2f mapFloatPixelToCoords(const sf::Vector2f& point,
                                   const sf::RenderTarget& target,
                                   const sf::View& view) {
  // First, convert from viewport coordinates to homogeneous coordinates
  sf::Vector2f normalized;
  sf::IntRect viewport = target.getViewport(view);
  normalized.x = -1.f + 2.f * (point.x - static_cast<float>(viewport.left)) /
                            static_cast<float>(viewport.width);
  normalized.y = 1.f - 2.f * (point.y - static_cast<float>(viewport.top)) /
                           static_cast<float>(viewport.height);

  // Then transform by the inverse of the view matrix
  return view.getInverseTransform().transformPoint(normalized);
}

sf::Vector2f mapCoordsToFloatPixel(const sf::Vector2f& point,
                                   const sf::RenderTarget& target,
                                   const sf::View& view) {
  // Note: almost the same as RenderTarget::mapCoordsToPixel except that the
  // result is sf::Vector2f

  // First, transform the point by the view matrix
  sf::Vector2f normalized = view.getTransform().transformPoint(point);

  // Then convert to viewport coordinates
  sf::Vector2f pixel;
  sf::IntRect viewport = target.getViewport(view);
  pixel.x = (normalized.x + 1.f) / 2.f * static_cast<float>(viewport.width) +
            static_cast<float>(viewport.left);
  pixel.y = (-normalized.y + 1.f) / 2.f * static_cast<float>(viewport.height) +
            static_cast<float>(viewport.top);

  return pixel;
}
}  // namespace

void AnchorRuntimeBehavior::DoStepPreEvents(RuntimeScene& scene) {}

void AnchorRuntimeBehavior::DoStepPostEvents(RuntimeScene& scene) {
  const RuntimeLayer& layer = scene.GetRuntimeLayer(object->GetLayer());
  const RuntimeCamera& firstCamera = layer.GetCamera(0);

  if (m_invalidDistances) {
    sf::Vector2u windowSize =
        m_relativeToOriginalWindowSize
            ? sf::Vector2u(scene.game->getWindowOriginalWidth(),
                           scene.game->getWindowOriginalHeight())
            : scene.renderWindow->getSize();

    // Calculate the distances from the window's bounds.
    sf::Vector2f topLeftPixel = mapCoordsToFloatPixel(
        sf::Vector2f(object->GetDrawableX(), object->GetDrawableY()),
        *(scene.renderWindow),
        firstCamera.GetSFMLView());

    sf::Vector2f bottomRightPixel = mapCoordsToFloatPixel(
        sf::Vector2f(object->GetDrawableX() + object->GetWidth(),
                     object->GetDrawableY() + object->GetHeight()),
        *(scene.renderWindow),
        firstCamera.GetSFMLView());

    // Left edge
    if (m_leftEdgeAnchor == ANCHOR_HORIZONTAL_WINDOW_LEFT)
      m_leftEdgeDistance = topLeftPixel.x;
    else if (m_leftEdgeAnchor == ANCHOR_HORIZONTAL_WINDOW_RIGHT)
      m_leftEdgeDistance = static_cast<float>(windowSize.x) - topLeftPixel.x;
    else if (m_leftEdgeAnchor == ANCHOR_HORIZONTAL_PROPORTIONAL)
      m_leftEdgeDistance = topLeftPixel.x / windowSize.x;

    // Right edge
    if (m_rightEdgeAnchor == ANCHOR_HORIZONTAL_WINDOW_LEFT)
      m_rightEdgeDistance = bottomRightPixel.x;
    else if (m_rightEdgeAnchor == ANCHOR_HORIZONTAL_WINDOW_RIGHT)
      m_rightEdgeDistance =
          static_cast<float>(windowSize.x) - bottomRightPixel.x;
    else if (m_rightEdgeAnchor == ANCHOR_HORIZONTAL_PROPORTIONAL)
      m_rightEdgeDistance = bottomRightPixel.x / windowSize.x;

    // Top edge
    if (m_topEdgeAnchor == ANCHOR_VERTICAL_WINDOW_TOP)
      m_topEdgeDistance = topLeftPixel.y;
    else if (m_topEdgeAnchor == ANCHOR_VERTICAL_WINDOW_BOTTOM)
      m_topEdgeDistance = static_cast<float>(windowSize.y) - topLeftPixel.y;
    else if (m_topEdgeAnchor == ANCHOR_VERTICAL_PROPORTIONAL)
      m_topEdgeDistance = topLeftPixel.y / static_cast<float>(windowSize.y);

    // Bottom edge
    if (m_bottomEdgeAnchor == ANCHOR_VERTICAL_WINDOW_TOP)
      m_bottomEdgeDistance = bottomRightPixel.y;
    else if (m_bottomEdgeAnchor == ANCHOR_VERTICAL_WINDOW_BOTTOM)
      m_bottomEdgeDistance =
          static_cast<float>(windowSize.y) - bottomRightPixel.y;
    else if (m_bottomEdgeAnchor == ANCHOR_VERTICAL_PROPORTIONAL)
      m_bottomEdgeDistance =
          bottomRightPixel.y / static_cast<float>(windowSize.y);

    m_invalidDistances = false;
  } else {
    sf::Vector2u windowSize = scene.renderWindow->getSize();

    // Move and resize the object if needed
    sf::Vector2f topLeftPixel;
    sf::Vector2f bottomRightPixel;

    // Left edge
    if (m_leftEdgeAnchor == ANCHOR_HORIZONTAL_WINDOW_LEFT)
      topLeftPixel.x = m_leftEdgeDistance;
    else if (m_leftEdgeAnchor == ANCHOR_HORIZONTAL_WINDOW_RIGHT)
      topLeftPixel.x = static_cast<float>(windowSize.x) - m_leftEdgeDistance;
    else if (m_leftEdgeAnchor == ANCHOR_HORIZONTAL_PROPORTIONAL)
      topLeftPixel.x = m_leftEdgeDistance * static_cast<float>(windowSize.x);

    // Top edge
    if (m_topEdgeAnchor == ANCHOR_VERTICAL_WINDOW_TOP)
      topLeftPixel.y = m_topEdgeDistance;
    else if (m_topEdgeAnchor == ANCHOR_VERTICAL_WINDOW_BOTTOM)
      topLeftPixel.y = static_cast<float>(windowSize.y) - m_topEdgeDistance;
    else if (m_topEdgeAnchor == ANCHOR_VERTICAL_PROPORTIONAL)
      topLeftPixel.y = m_topEdgeDistance * static_cast<float>(windowSize.y);

    // Right edge
    if (m_rightEdgeAnchor == ANCHOR_HORIZONTAL_WINDOW_LEFT)
      bottomRightPixel.x = m_rightEdgeDistance;
    else if (m_rightEdgeAnchor == ANCHOR_HORIZONTAL_WINDOW_RIGHT)
      bottomRightPixel.x =
          static_cast<float>(windowSize.x) - m_rightEdgeDistance;
    else if (m_rightEdgeAnchor == ANCHOR_HORIZONTAL_PROPORTIONAL)
      bottomRightPixel.x =
          m_rightEdgeDistance * static_cast<float>(windowSize.x);

    // Bottom edge
    if (m_bottomEdgeAnchor == ANCHOR_VERTICAL_WINDOW_TOP)
      bottomRightPixel.y = m_bottomEdgeDistance;
    else if (m_bottomEdgeAnchor == ANCHOR_VERTICAL_WINDOW_BOTTOM)
      bottomRightPixel.y =
          static_cast<float>(windowSize.y) - m_bottomEdgeDistance;
    else if (m_bottomEdgeAnchor == ANCHOR_VERTICAL_PROPORTIONAL)
      bottomRightPixel.y =
          m_bottomEdgeDistance * static_cast<float>(windowSize.y);

    sf::Vector2f topLeftCoord = mapFloatPixelToCoords(
        topLeftPixel, (*scene.renderWindow), firstCamera.GetSFMLView());
    sf::Vector2f bottomRightCoord = mapFloatPixelToCoords(
        bottomRightPixel, (*scene.renderWindow), firstCamera.GetSFMLView());

    // Move and resize the object according to the anchors
    if (m_rightEdgeAnchor != ANCHOR_HORIZONTAL_NONE)
      object->SetWidth(bottomRightCoord.x - topLeftCoord.x);
    if (m_bottomEdgeAnchor != ANCHOR_VERTICAL_NONE)
      object->SetHeight(bottomRightCoord.y - topLeftCoord.y);
    if (m_leftEdgeAnchor != ANCHOR_HORIZONTAL_NONE)
      object->SetX(topLeftCoord.x + object->GetX() - object->GetDrawableX());
    if (m_topEdgeAnchor != ANCHOR_VERTICAL_NONE)
      object->SetY(topLeftCoord.y + object->GetY() - object->GetDrawableY());
  }
}
