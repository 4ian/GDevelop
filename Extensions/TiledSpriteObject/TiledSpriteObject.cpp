/**

GDevelop - Tiled Sprite Extension
Copyright (c) 2012-2016 Victor Levasseur (victorlevasseur01@orange.fr)
Copyright (c) 2014-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include <SFML/Graphics.hpp>
#include "GDCore/Tools/Localization.h"
#include "GDCpp/Runtime/CommonTools.h"
#include "GDCpp/Runtime/FontManager.h"
#include "GDCpp/Runtime/ImageManager.h"
#include "GDCpp/Runtime/Polygon2d.h"
#include "GDCpp/Runtime/Project/InitialInstance.h"
#include "GDCpp/Runtime/Project/Object.h"
#include "GDCpp/Runtime/Project/Project.h"
#include "GDCpp/Runtime/RuntimeGame.h"
#include "GDCpp/Runtime/RuntimeScene.h"
#include "GDCpp/Runtime/Serialization/SerializerElement.h"
#include "TiledSpriteObject.h"

#if defined(GD_IDE_ONLY)
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#endif

using namespace std;

TiledSpriteObject::TiledSpriteObject(gd::String name_)
    : Object(name_), textureName(""), width(32), height(32) {}

void TiledSpriteObject::DoUnserializeFrom(
    gd::Project& project, const gd::SerializerElement& element) {
  textureName = element.GetStringAttribute("texture");
  width = element.GetDoubleAttribute("width", 128);
  height = element.GetDoubleAttribute("height", 128);
}

#if defined(GD_IDE_ONLY)
void TiledSpriteObject::DoSerializeTo(gd::SerializerElement& element) const {
  element.SetAttribute("texture", textureName);
  element.SetAttribute("width", width);
  element.SetAttribute("height", height);
}
#endif

namespace {
sf::Vector2f RotatePoint(sf::Vector2f point, float angle) {
  float t, cosa = cos(-angle),
           sina = sin(-angle);  // We want a clockwise rotation

  t = point.x;
  point.x = t * cosa + point.y * sina;
  point.y = -t * sina + point.y * cosa;

  return point;
}
}  // namespace

RuntimeTiledSpriteObject::RuntimeTiledSpriteObject(
    RuntimeScene& scene, const TiledSpriteObject& tiledSpriteObject)
    : RuntimeObject(scene, tiledSpriteObject),
      width(32),
      height(32),
      xOffset(0),
      yOffset(),
      angle(0) {
  SetWidth(tiledSpriteObject.GetWidth());
  SetHeight(tiledSpriteObject.GetHeight());

  textureName = tiledSpriteObject.textureName;
  ChangeAndReloadImage(textureName, scene);
}

void RuntimeTiledSpriteObject::ChangeAndReloadImage(const gd::String& txtName,
                                                    const RuntimeScene& scene) {
  textureName = txtName;
  texture = scene.GetImageManager()->GetSFMLTexture(textureName);
}

/**
 * Render object at runtime
 */
bool RuntimeTiledSpriteObject::Draw(sf::RenderTarget& window) {
  // Don't draw anything if hidden
  if (hidden) return true;
  if (!texture) return true;

#if defined(ANDROID)
  const unsigned int textureWidth = texture->texture.getSize().x;
  const unsigned int textureHeight = texture->texture.getSize().y;
  std::vector<sf::Vertex> vertices;
  vertices.resize((static_cast<std::size_t>(GetWidth() / textureWidth) + 1u) *
                  (static_cast<std::size_t>(GetHeight() / textureHeight) + 1u) *
                  6);
  for (unsigned int i = 0;
       i < (static_cast<std::size_t>(GetWidth() / textureWidth) + 1u);
       i++) {
    for (unsigned int j = 0;
         j < (static_cast<std::size_t>(GetHeight() / textureHeight) + 1u);
         j++) {
      // Create the four vertices
      sf::Vector2f textureEndPosition(
          (i < static_cast<std::size_t>(GetWidth() / textureWidth))
              ? textureWidth
              : (GetWidth() - i * textureWidth),
          (j < static_cast<std::size_t>(GetHeight() / textureHeight))
              ? textureHeight
              : (GetHeight() - j * textureHeight));

      sf::Vertex topLeftCorner(
          sf::Vector2f(i * textureWidth, j * textureHeight),
          sf::Vector2f(0.f, 0.f));
      sf::Vertex topRightCorner(
          sf::Vector2f(i * textureWidth + textureEndPosition.x,
                       j * textureHeight),
          sf::Vector2f(textureEndPosition.x, 0.f));
      sf::Vertex bottomRightCorner(
          sf::Vector2f(i * textureWidth + textureEndPosition.x,
                       j * textureHeight + textureEndPosition.y),
          sf::Vector2f(textureEndPosition.x, textureEndPosition.y));
      sf::Vertex bottomLeftCorner(
          sf::Vector2f(i * textureWidth,
                       j * textureHeight + textureEndPosition.y),
          sf::Vector2f(0.f, textureEndPosition.y));

      // Insert them to create two triangles
      const unsigned int firstVerticePos =
          (j * (static_cast<std::size_t>(GetWidth() / textureWidth) + 1u) + i) *
          6;
      vertices[firstVerticePos] = topLeftCorner;
      vertices[firstVerticePos + 1u] = topRightCorner;
      vertices[firstVerticePos + 2u] = bottomRightCorner;
      vertices[firstVerticePos + 3u] = topLeftCorner;
      vertices[firstVerticePos + 4u] = bottomRightCorner;
      vertices[firstVerticePos + 5u] = bottomLeftCorner;
    }
  }

  sf::Transform transform;
  transform.translate(-GetWidth() / 2.f, -GetHeight() / 2.f);
  transform.rotate(angle);
  transform.translate(GetX() + GetWidth() / 2.f, GetY() + GetHeight() / 2.f);

  window.draw(
      vertices.data(),
      vertices.size(),
      sf::Triangles,
      sf::RenderStates(sf::BlendAlpha, transform, &texture->texture, nullptr));
#else
  sf::Vector2f centerPosition =
      sf::Vector2f(GetX() + GetCenterX(), GetY() + GetCenterY());
  float angleInRad = angle * 3.14159 / 180.0;

  texture->texture.setRepeated(true);
  sf::Vertex vertices[] = {
      sf::Vertex(
          centerPosition +
              RotatePoint(sf::Vector2f(-width / 2, -height / 2), angleInRad),
          sf::Vector2f(0 + xOffset, 0 + yOffset)),
      sf::Vertex(
          centerPosition +
              RotatePoint(sf::Vector2f(+width / 2, -height / 2), angleInRad),
          sf::Vector2f(width + xOffset, 0 + yOffset)),
      sf::Vertex(
          centerPosition +
              RotatePoint(sf::Vector2f(-width / 2, +height / 2), angleInRad),
          sf::Vector2f(0 + xOffset, height + yOffset)),
      sf::Vertex(
          centerPosition +
              RotatePoint(sf::Vector2f(+width / 2, +height / 2), angleInRad),
          sf::Vector2f(width + xOffset, height + yOffset))};

  window.draw(vertices, 4, sf::TrianglesStrip, &texture->texture);
  texture->texture.setRepeated(false);
#endif

  return true;
}

#if defined(GD_IDE_ONLY)
void TiledSpriteObject::ExposeResources(gd::ArbitraryResourceWorker& worker) {
  worker.ExposeImage(textureName);
}

void RuntimeTiledSpriteObject::GetPropertyForDebugger(std::size_t propertyNb,
                                                      gd::String& name,
                                                      gd::String& value) const {
  if (propertyNb == 0) {
    name = _("Width");
    value = gd::String::From(width);
  } else if (propertyNb == 1) {
    name = _("Height");
    value = gd::String::From(height);
  } else if (propertyNb == 2) {
    name = _("Angle");
    value = gd::String::From(angle);
  }
}

bool RuntimeTiledSpriteObject::ChangeProperty(std::size_t propertyNb,
                                              gd::String newValue) {
  if (propertyNb == 0) {
    width = newValue.To<float>();
  } else if (propertyNb == 1) {
    height = newValue.To<float>();
  } else if (propertyNb == 2) {
    angle = newValue.To<float>();
  }

  return true;
}

std::size_t RuntimeTiledSpriteObject::GetNumberOfProperties() const {
  return 3;
}
#endif
