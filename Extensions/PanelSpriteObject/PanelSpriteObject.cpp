/**

GDevelop - Panel Sprite Extension
Copyright (c) 2012-2016 Victor Levasseur (victorlevasseur01@orange.fr)
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
#include "PanelSpriteObject.h"

#if defined(GD_IDE_ONLY)
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#endif

using namespace std;

PanelSpriteObject::PanelSpriteObject(gd::String name_)
    : Object(name_),
      textureName(""),
      width(32),
      height(32),
      leftMargin(0),
      topMargin(0),
      rightMargin(0),
      bottomMargin(0) {}

PanelSpriteObject::~PanelSpriteObject() {}

void PanelSpriteObject::DoUnserializeFrom(
    gd::Project& project, const gd::SerializerElement& element) {
  textureName = element.GetStringAttribute("texture");
  width = element.GetIntAttribute("width", 32);
  height = element.GetIntAttribute("height", 32);
  leftMargin = element.GetIntAttribute("leftMargin");
  topMargin = element.GetIntAttribute("topMargin");
  rightMargin = element.GetIntAttribute("rightMargin");
  bottomMargin = element.GetIntAttribute("bottomMargin");
  tiled = element.GetBoolAttribute("tiled");
}

#if defined(GD_IDE_ONLY)
void PanelSpriteObject::DoSerializeTo(gd::SerializerElement& element) const {
  element.SetAttribute("texture", textureName);
  element.SetAttribute("width", width);
  element.SetAttribute("height", height);
  element.SetAttribute("leftMargin", leftMargin);
  element.SetAttribute("topMargin", topMargin);
  element.SetAttribute("rightMargin", rightMargin);
  element.SetAttribute("bottomMargin", bottomMargin);
  element.SetAttribute("tiled", tiled);
}
#endif

RuntimePanelSpriteObject::RuntimePanelSpriteObject(
    RuntimeScene& scene, const PanelSpriteObject& panelSpriteObject)
    : RuntimeObject(scene, panelSpriteObject), width(32), height(32), angle(0) {
  SetRightMargin(panelSpriteObject.GetRightMargin());
  SetLeftMargin(panelSpriteObject.GetLeftMargin());
  SetBottomMargin(panelSpriteObject.GetBottomMargin());
  SetTopMargin(panelSpriteObject.GetTopMargin());
  SetWidth(panelSpriteObject.GetWidth());
  SetHeight(panelSpriteObject.GetHeight());

  textureName = panelSpriteObject.textureName;
  ChangeAndReloadImage(textureName, scene);
}

/**
 * Render object at runtime
 */
bool RuntimePanelSpriteObject::Draw(sf::RenderTarget& window) {
  // Don't draw anything if hidden
  if (hidden) return true;
  if (!texture) return true;

  sf::Vector2f centerPosition =
      sf::Vector2f(GetX() + GetCenterX(), GetY() + GetCenterY());

  float imageWidth = texture->texture.getSize().x;
  float imageHeight = texture->texture.getSize().y;

  sf::Vertex centerVertices[] = {
      sf::Vertex(sf::Vector2f(-width / 2 + leftMargin, -height / 2 + topMargin),
                 sf::Vector2f(leftMargin, topMargin)),
      sf::Vertex(
          sf::Vector2f(+width / 2 - rightMargin, -height / 2 + topMargin),
          sf::Vector2f(imageWidth - rightMargin, topMargin)),
      sf::Vertex(
          sf::Vector2f(-width / 2 + leftMargin, +height / 2 - bottomMargin),
          sf::Vector2f(leftMargin, imageHeight - bottomMargin)),
      sf::Vertex(
          sf::Vector2f(+width / 2 - rightMargin, +height / 2 - bottomMargin),
          sf::Vector2f(imageWidth - rightMargin, imageHeight - bottomMargin)),
  };

  sf::Vertex topVertices[] = {
      // Top-left
      sf::Vertex(sf::Vector2f(-width / 2, -height / 2), sf::Vector2f(0, 0)),
      sf::Vertex(sf::Vector2f(-width / 2, -height / 2 + topMargin),
                 sf::Vector2f(0, topMargin)),
      sf::Vertex(sf::Vector2f(-width / 2 + leftMargin, -height / 2),
                 sf::Vector2f(leftMargin, 0)),
      sf::Vertex(sf::Vector2f(-width / 2 + leftMargin, -height / 2 + topMargin),
                 sf::Vector2f(leftMargin, topMargin)),

      // Top
      sf::Vertex(sf::Vector2f(+width / 2 - rightMargin, -height / 2),
                 sf::Vector2f(imageWidth - rightMargin, 0)),
      sf::Vertex(
          sf::Vector2f(+width / 2 - rightMargin, -height / 2 + topMargin),
          sf::Vector2f(imageWidth - rightMargin, topMargin)),

      // Top-right
      sf::Vertex(sf::Vector2f(+width / 2, -height / 2),
                 sf::Vector2f(imageWidth, 0)),
      sf::Vertex(sf::Vector2f(+width / 2, -height / 2 + topMargin),
                 sf::Vector2f(imageWidth, topMargin)),
  };

  sf::Vertex rightVertices[] = {
      sf::Vertex(
          sf::Vector2f(+width / 2 - rightMargin, -height / 2 + topMargin),
          sf::Vector2f(imageWidth - rightMargin, topMargin)),
      sf::Vertex(sf::Vector2f(+width / 2, -height / 2 + topMargin),
                 sf::Vector2f(imageWidth, topMargin)),
      sf::Vertex(
          sf::Vector2f(+width / 2 - rightMargin, +height / 2 - bottomMargin),
          sf::Vector2f(imageWidth - rightMargin, imageHeight - bottomMargin)),
      sf::Vertex(sf::Vector2f(+width / 2, +height / 2 - bottomMargin),
                 sf::Vector2f(imageWidth, imageHeight - bottomMargin))};

  sf::Vertex bottomVertices[] = {
      // Bottom-left
      sf::Vertex(sf::Vector2f(-width / 2, +height / 2 - bottomMargin),
                 sf::Vector2f(0, imageHeight - bottomMargin)),
      sf::Vertex(sf::Vector2f(-width / 2, +height / 2),
                 sf::Vector2f(0, imageHeight)),
      sf::Vertex(
          sf::Vector2f(-width / 2 + leftMargin, +height / 2 - bottomMargin),
          sf::Vector2f(leftMargin, imageHeight - bottomMargin)),
      sf::Vertex(sf::Vector2f(-width / 2 + leftMargin, +height / 2),
                 sf::Vector2f(leftMargin, imageHeight)),

      // Bottom
      sf::Vertex(
          sf::Vector2f(+width / 2 - rightMargin, +height / 2 - bottomMargin),
          sf::Vector2f(imageWidth - rightMargin, imageHeight - bottomMargin)),
      sf::Vertex(sf::Vector2f(+width / 2 - rightMargin, +height / 2),
                 sf::Vector2f(imageWidth - rightMargin, imageHeight)),

      // Bottom-right
      sf::Vertex(sf::Vector2f(+width / 2, +height / 2 - bottomMargin),
                 sf::Vector2f(imageWidth, imageHeight - bottomMargin)),
      sf::Vertex(sf::Vector2f(+width / 2, +height / 2),
                 sf::Vector2f(imageWidth, imageHeight))};

  sf::Vertex leftVertices[] = {
      sf::Vertex(sf::Vector2f(-width / 2, -height / 2 + topMargin),
                 sf::Vector2f(0, topMargin)),
      sf::Vertex(sf::Vector2f(-width / 2 + leftMargin, -height / 2 + topMargin),
                 sf::Vector2f(leftMargin, topMargin)),
      sf::Vertex(sf::Vector2f(-width / 2, +height / 2 - bottomMargin),
                 sf::Vector2f(0, imageHeight - bottomMargin)),
      sf::Vertex(
          sf::Vector2f(-width / 2 + leftMargin, +height / 2 - bottomMargin),
          sf::Vector2f(leftMargin, imageHeight - bottomMargin))};

  sf::Transform matrix;
  matrix.translate(centerPosition);
  matrix.rotate(angle);

  sf::RenderStates states;
  states.transform = matrix;
  states.texture = &texture->texture;

  window.draw(centerVertices, 4, sf::TrianglesStrip, states);
  window.draw(leftVertices, 4, sf::TrianglesStrip, states);
  window.draw(rightVertices, 4, sf::TrianglesStrip, states);
  window.draw(topVertices, 8, sf::TrianglesStrip, states);
  window.draw(bottomVertices, 8, sf::TrianglesStrip, states);

  return true;
}

#if defined(GD_IDE_ONLY)
void PanelSpriteObject::ExposeResources(gd::ArbitraryResourceWorker& worker) {
  worker.ExposeImage(textureName);
}

void RuntimePanelSpriteObject::GetPropertyForDebugger(std::size_t propertyNb,
                                                      gd::String& name,
                                                      gd::String& value) const {
  if (propertyNb == 0) {
    name = _("Width");
    value = gd::String::From(width);
  } else if (propertyNb == 1) {
    name = _("Height");
    value = gd::String::From(height);
  } else if (propertyNb == 2) {
    name = _("Left Margin");
    value = gd::String::From(leftMargin);
  } else if (propertyNb == 3) {
    name = _("Top Margin");
    value = gd::String::From(topMargin);
  } else if (propertyNb == 4) {
    name = _("Right Margin");
    value = gd::String::From(rightMargin);
  } else if (propertyNb == 5) {
    name = _("Bottom Margin");
    value = gd::String::From(bottomMargin);
  }
}

bool RuntimePanelSpriteObject::ChangeProperty(std::size_t propertyNb,
                                              gd::String newValue) {
  if (propertyNb == 0) {
    width = newValue.To<float>();
  } else if (propertyNb == 1) {
    height = newValue.To<float>();
  } else if (propertyNb == 2) {
    leftMargin = newValue.To<float>();
  } else if (propertyNb == 3) {
    topMargin = newValue.To<float>();
  } else if (propertyNb == 4) {
    rightMargin = newValue.To<float>();
  } else if (propertyNb == 5) {
    bottomMargin = newValue.To<float>();
  }

  return true;
}

std::size_t RuntimePanelSpriteObject::GetNumberOfProperties() const {
  return 6;
}
#endif

void RuntimePanelSpriteObject::ChangeAndReloadImage(const gd::String& txtName,
                                                    const RuntimeScene& scene) {
  textureName = txtName;
  texture = scene.GetImageManager()->GetSFMLTexture(textureName);
}
