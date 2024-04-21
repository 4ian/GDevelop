/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_LAYER_H
#define GDCORE_LAYER_H
#include <memory>
#include <vector>

#include "EffectsContainer.h"
#include "GDCore/String.h"

namespace gd {
class Effect;
class Camera;
class SerializerElement;
class EffectsContainer;
}

namespace gd {

/**
 * \brief A camera is used to render a specific area of a layout.
 *
 * \see gd::Layout
 * \ingroup PlatformDefinition
 */
class GD_CORE_API Camera {
 public:
  Camera();
  ~Camera(){};

  /**
   * \brief Change the viewport, i.e the area of the window where the camera
   * will be displayed. \note The coordinates must be between 0 and 1.
   */
  void SetViewport(float x1_, float y1_, float x2_, float y2_) {
    x1 = x1_;
    x2 = x2_;
    y1 = y1_;
    y2 = y2_;
  };
  void SetViewportX1(float x1_) { x1 = x1_; };
  void SetViewportY1(float y1_) { y1 = y1_; };
  void SetViewportX2(float x2_) { x2 = x2_; };
  void SetViewportY2(float y2_) { y2 = y2_; };
  float GetViewportX1() const { return x1; };
  float GetViewportY1() const { return y1; };
  float GetViewportX2() const { return x2; };
  float GetViewportY2() const { return y2; };

  /**
   * \brief Change the size of the rendered area of the scene, in pixels.
   */
  void SetSize(float width_, float height_) {
    width = width_;
    height = height_;
  };
  float GetWidth() const { return width; };
  float GetHeight() const { return height; };

  void SetUseDefaultSize(bool useDefaultSize = true) {
    defaultSize = useDefaultSize;
  };
  bool UseDefaultSize() const { return defaultSize; }

  void SetUseDefaultViewport(bool useDefaultViewport = true) {
    defaultViewport = useDefaultViewport;
  };
  bool UseDefaultViewport() const { return defaultViewport; }

 private:
  bool defaultSize;      ///< True if the camera use the default window size
  bool defaultViewport;  ///< True if the camera use the default viewport size

  float x1;
  float y1;
  float x2;
  float y2;
  float width;   ///< The width of the rendered area
  float height;  ///< The height of the rendered area
};

/**
 * \brief Represents a layer of a layout.
 *
 * \see gd::Layout
 * \ingroup PlatformDefinition
 */
class GD_CORE_API Layer {
 public:
  Layer();
  virtual ~Layer(){};

  /**
   * \brief Change layer name
   */
  void SetName(const gd::String& name_) { name = name_; }

  /**
   * \brief Get layer name
   */
  const gd::String& GetName() const { return name; }

  const gd::String& GetRenderingType() const { return renderingType; }

  void SetRenderingType(const gd::String& renderingType_) {
    renderingType = renderingType_;
  }

  const gd::String& GetCameraType() const { return cameraType; }

  void SetCameraType(const gd::String& cameraType_) {
    cameraType = cameraType_;
  }

  /**
   * \brief Change if layer is displayed or not
   */
  void SetVisibility(bool isVisible_) { isVisible = isVisible_; }

  /**
   * \brief Return true if layer will be displayed at the layout startup.
   */
  bool GetVisibility() const { return isVisible; }

  /**
   * \brief Change if layer can be modified or not.
   */
  void SetLocked(bool isLocked_) { isLocked = isLocked_; }

  /**
   * \brief Return true if layer can't be modified.
   */
  bool IsLocked() const { return isLocked; }

  /**
   * \brief Set if the layer is a lighting layer or not.
   */
  void SetLightingLayer(bool isLightingLayer_) {
    isLightingLayer = isLightingLayer_;
  }

  /**
   * \brief Return true if the layer is a lighting layer.
   */
  bool IsLightingLayer() const { return isLightingLayer; }

  /**
   * \brief Set if the layer automatically follows the base layer or not.
   */
  void SetFollowBaseLayerCamera(bool followBaseLayerCamera_) {
    followBaseLayerCamera = followBaseLayerCamera_;
  }

  /**
   * \brief Return true if the layer follows the base layer.
   */
  bool IsFollowingBaseLayerCamera() const { return followBaseLayerCamera; }

  /** \name 3D
   */
  ///@{
  double GetCamera3DNearPlaneDistance() const {
    return camera3DNearPlaneDistance;
  }
  void SetCamera3DNearPlaneDistance(double distance) {
    camera3DNearPlaneDistance = distance;
  }
  double GetCamera3DFarPlaneDistance() const {
    return camera3DFarPlaneDistance;
  }
  void SetCamera3DFarPlaneDistance(double distance) {
    camera3DFarPlaneDistance = distance;
  }
  double GetCamera3DFieldOfView() const { return camera3DFieldOfView; }
  void SetCamera3DFieldOfView(double angle) { camera3DFieldOfView = angle; }
  ///@}

  /** \name Cameras
   */
  ///@{

  /**
   * \brief Change the number of cameras inside the layer.
   */
  void SetCameraCount(std::size_t n);

  /**
   * \brief Get cameras count.
   */
  inline std::size_t GetCameraCount() const { return cameras.size(); };

  /**
   * \brief Return a reference to a camera
   */
  inline const Camera& GetCamera(std::size_t n) const {
    if (n >= GetCameraCount()) return badCamera;
    return cameras[n];
  }

  /**
   * \brief Return a reference to a camera
   */
  inline Camera& GetCamera(std::size_t n) {
    if (n >= GetCameraCount()) return badCamera;
    return cameras[n];
  }

  /**
   * \brief Delete a specific camera.
   */
  inline void DeleteCamera(std::size_t n) {
    if (n >= GetCameraCount()) return;
    cameras.erase(cameras.begin() + n);
  }

  /**
   * \brief Add an already existing camera.
   */
  inline void AddCamera(const Camera& camera) { cameras.push_back(camera); };

  ///@}

  /**
   * Get the ambient light color red component.
   */
  unsigned int GetAmbientLightColorRed() const { return ambientLightColorR; }

  /**
   * Get the ambient light color green component.
   */
  unsigned int GetAmbientLightColorGreen() const { return ambientLightColorG; }

  /**
   * Get the ambient light color blue component.
   */
  unsigned int GetAmbientLightColorBlue() const { return ambientLightColorB; }

  /**
   * Set the ambient light color.
   */
  void SetAmbientLightColor(unsigned int r, unsigned int g, unsigned int b) {
    ambientLightColorR = r;
    ambientLightColorG = g;
    ambientLightColorB = b;
  }

  /** \name Effects
   */
  ///@{
  /**
   * \brief Return the effects container.
   */
  EffectsContainer& GetEffects();

  /**
   * \brief Return a const reference to the effects container.
   */
  const EffectsContainer& GetEffects() const;
  ///@}

  /**
   * \brief Serialize layer.
   */
  void SerializeTo(SerializerElement& element) const;

  /**
   * \brief Unserialize the layer.
   */
  void UnserializeFrom(const SerializerElement& element);

 private:
  gd::String name;           ///< The name of the layer
  gd::String renderingType;  ///< The rendering type: "" (empty), "2d", "3d" or
                             ///< "2d+3d".
  gd::String cameraType;
  bool isVisible;            ///< True if the layer is visible
  bool isLocked;             ///< True if the layer is locked
  bool isLightingLayer;  ///< True if the layer is used to display lights and
                         ///< renders an ambient light.
  bool followBaseLayerCamera;  ///< True if the layer automatically follows the
                               ///< base layer
  double camera3DNearPlaneDistance;  ///< 3D camera frustum near plan distance
  double camera3DFarPlaneDistance;   ///< 3D camera frustum far plan distance
  double camera3DFieldOfView;        ///< 3D camera field of view (fov) in degrees
  unsigned int ambientLightColorR;   ///< Ambient light color Red component
  unsigned int ambientLightColorG;   ///< Ambient light color Green component
  unsigned int ambientLightColorB;   ///< Ambient light color Blue component
  std::vector<gd::Camera> cameras;   ///< The camera displayed by the layer
  gd::EffectsContainer effectsContainer;  ///< The effects applied to the layer.

  static gd::Camera badCamera;
};

/**
 * \brief Functor testing layer name
 *
 * \see gd::Layer
 */
struct LayerHasName : public std::binary_function<gd::Layer, gd::String, bool> {
  bool operator()(const Layer& layer, const gd::String& name) const {
    return layer.GetName() == name;
  }
};

}  // namespace gd

#endif  // GDCORE_LAYER_H
