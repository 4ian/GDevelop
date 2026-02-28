/**
 * GDevelop - Map Extension
 * Copyright (c) 2024 GDevelop Community
 * This project is released under the MIT License.
 */

#pragma once

#include "GDCore/Project/ObjectConfiguration.h"

namespace gd {
class Project;
class PropertyDescriptor;
class InitialInstance;
}  // namespace gd

/**
 * Map Object - displays a map (minimap/worldmap) with tracked objects
 */
class GD_EXTENSION_API MapObject : public gd::ObjectConfiguration {
 public:
  MapObject();
  virtual ~MapObject(){};
  
  virtual std::unique_ptr<gd::ObjectConfiguration> Clone() const override {
    return gd::make_unique<MapObject>(*this);
  }

  virtual std::map<gd::String, gd::PropertyDescriptor> GetProperties()
      const override;
  virtual bool UpdateProperty(const gd::String& name,
                              const gd::String& value) override;

 protected:
  virtual void DoSerializeTo(gd::SerializerElement& element) const override;
  virtual void DoUnserializeFrom(gd::Project& project,
                                  const gd::SerializerElement& element) override;

 public:
  // Getters
  double GetDefaultWidth() const { return defaultWidth; }
  double GetDefaultHeight() const { return defaultHeight; }
  double GetZoom() const { return zoom; }
  bool GetStayOnScreen() const { return stayOnScreen; }
  const gd::String& GetBackgroundImage() const { return backgroundImage; }
  const gd::String& GetFrameImage() const { return frameImage; }
  const gd::String& GetBackgroundColor() const { return backgroundColor; }
  double GetBackgroundOpacity() const { return backgroundOpacity; }
  const gd::String& GetBorderColor() const { return borderColor; }
  double GetBorderWidth() const { return borderWidth; }
  const gd::String& GetPlayerMarkerImage() const { return playerMarkerImage; }
  const gd::String& GetPlayerColor() const { return playerColor; }
  double GetPlayerSize() const { return playerSize; }
  const gd::String& GetEnemyMarkerImage() const { return enemyMarkerImage; }
  const gd::String& GetEnemyColor() const { return enemyColor; }
  double GetEnemySize() const { return enemySize; }
  const gd::String& GetItemMarkerImage() const { return itemMarkerImage; }
  const gd::String& GetItemColor() const { return itemColor; }
  double GetItemSize() const { return itemSize; }
  bool GetShowObstacles() const { return showObstacles; }
  const gd::String& GetObstacleColor() const { return obstacleColor; }
  double GetObstacleOpacity() const { return obstacleOpacity; }
  bool GetUseObjectShape() const { return useObjectShape; }
  bool GetAutoDetectBounds() const { return autoDetectBounds; }
  const gd::String& GetShape() const { return shape; }
  const gd::String& GetMode() const { return mode; }
  // No update rate: map updates every frame

  // Setters
  void SetDefaultWidth(double value) { defaultWidth = value; }
  void SetDefaultHeight(double value) { defaultHeight = value; }
  void SetZoom(double value) { zoom = value; }
  void SetStayOnScreen(bool value) { stayOnScreen = value; }
  void SetBackgroundImage(const gd::String& value) { backgroundImage = value; }
  void SetFrameImage(const gd::String& value) { frameImage = value; }
  void SetBackgroundColor(const gd::String& value) { backgroundColor = value; }
  void SetBackgroundOpacity(double value) { backgroundOpacity = value; }
  void SetBorderColor(const gd::String& value) { borderColor = value; }
  void SetBorderWidth(double value) { borderWidth = value; }
  void SetPlayerMarkerImage(const gd::String& value) { playerMarkerImage = value; }
  void SetPlayerColor(const gd::String& value) { playerColor = value; }
  void SetPlayerSize(double value) { playerSize = value; }
  void SetEnemyMarkerImage(const gd::String& value) { enemyMarkerImage = value; }
  void SetEnemyColor(const gd::String& value) { enemyColor = value; }
  void SetEnemySize(double value) { enemySize = value; }
  void SetItemMarkerImage(const gd::String& value) { itemMarkerImage = value; }
  void SetItemColor(const gd::String& value) { itemColor = value; }
  void SetItemSize(double value) { itemSize = value; }
  void SetShowObstacles(bool value) { showObstacles = value; }
  void SetObstacleColor(const gd::String& value) { obstacleColor = value; }
  void SetObstacleOpacity(double value) { obstacleOpacity = value; }
  void SetUseObjectShape(bool value) { useObjectShape = value; }
  void SetAutoDetectBounds(bool value) { autoDetectBounds = value; }
  void SetShape(const gd::String& value) { shape = value; }
  void SetMode(const gd::String& value) { mode = value; }
  // No update rate setter

 private:
  // Basic Settings
  double defaultWidth;
  double defaultHeight;
  double zoom;
  bool stayOnScreen;
  
  // Visual Customization
  gd::String backgroundImage;
  gd::String frameImage;
  gd::String backgroundColor;
  double backgroundOpacity;
  gd::String borderColor;
  double borderWidth;
  
  // Player Marker
  gd::String playerMarkerImage;
  gd::String playerColor;
  double playerSize;
  
  // Enemy Marker
  gd::String enemyMarkerImage;
  gd::String enemyColor;
  double enemySize;
  
  // Item Marker
  gd::String itemMarkerImage;
  gd::String itemColor;
  double itemSize;
  
  // Obstacle Display
  bool showObstacles;
  gd::String obstacleColor;
  double obstacleOpacity;
  bool useObjectShape;
  
  // Advanced
  bool autoDetectBounds;
  // No update rate storage
  
  // Mode: Minimap or WorldMap
  gd::String mode;
  
  // Shape: Rectangle or Circle
  gd::String shape;
};
