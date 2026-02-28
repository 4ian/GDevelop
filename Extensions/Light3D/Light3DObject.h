/**
 
 GDevelop - Light3D Object Extension
 Copyright (c) 2024 GDevelop Team
 This project is released under the MIT License.
 */

#pragma once

#include "GDCore/Project/ObjectConfiguration.h"

namespace gd {
class Project;
class Object;
class InitialInstance;
}  // namespace gd

/**
 * Light3D Object
 */
class GD_EXTENSION_API Light3DObject : public gd::ObjectConfiguration {
 public:
  Light3DObject();
  virtual ~Light3DObject();
  virtual std::unique_ptr<gd::ObjectConfiguration> Clone() const override {
    return gd::make_unique<Light3DObject>(*this);
  }

  virtual std::map<gd::String, gd::PropertyDescriptor> GetProperties()
      const override;

  virtual bool UpdateProperty(const gd::String& name,
                              const gd::String& value) override;

  // Light type getters/setters
  inline void SetLightType(const gd::String& lightType_) { lightType = lightType_; };
  inline const gd::String& GetLightType() const { return lightType; };

  inline void SetEnabled(bool enabled_) { enabled = enabled_; };
  inline bool IsEnabled() const { return enabled; };

  inline void SetColor(const gd::String& color_) { color = color_; };
  inline const gd::String& GetColor() const { return color; };

  inline void SetIntensity(double intensity_) { intensity = intensity_; };
  inline double GetIntensity() const { return intensity; };

  inline void SetDistance(double distance_) { distance = distance_; };
  inline double GetDistance() const { return distance; };

  inline void SetDecay(double decay_) { decay = decay_; };
  inline double GetDecay() const { return decay; };

  inline void SetAngle(double angle_) { angle = angle_; };
  inline double GetAngle() const { return angle; };

  inline void SetPenumbra(double penumbra_) { penumbra = penumbra_; };
  inline double GetPenumbra() const { return penumbra; };

  // Shadow properties
  inline void SetCastShadow(bool castShadow_) { castShadow = castShadow_; };
  inline bool GetCastShadow() const { return castShadow; };

  inline void SetShadowMapSize(double shadowMapSize_) { shadowMapSize = shadowMapSize_; };
  inline double GetShadowMapSize() const { return shadowMapSize; };

  inline void SetShadowBias(double shadowBias_) { shadowBias = shadowBias_; };
  inline double GetShadowBias() const { return shadowBias; };

  inline void SetShadowNormalBias(double shadowNormalBias_) { shadowNormalBias = shadowNormalBias_; };
  inline double GetShadowNormalBias() const { return shadowNormalBias; };

  inline void SetShadowRadius(double shadowRadius_) { shadowRadius = shadowRadius_; };
  inline double GetShadowRadius() const { return shadowRadius; };

  inline void SetShadowNear(double shadowNear_) { shadowNear = shadowNear_; };
  inline double GetShadowNear() const { return shadowNear; };

  inline void SetShadowFar(double shadowFar_) { shadowFar = shadowFar_; };
  inline double GetShadowFar() const { return shadowFar; };

  inline void SetShadowFocus(double shadowFocus_) { shadowFocus = shadowFocus_; };
  inline double GetShadowFocus() const { return shadowFocus; };

  // Flicker properties
  inline void SetFlickerEnabled(bool flickerEnabled_) { flickerEnabled = flickerEnabled_; };
  inline bool GetFlickerEnabled() const { return flickerEnabled; };

  inline void SetFlickerSpeed(double flickerSpeed_) { flickerSpeed = flickerSpeed_; };
  inline double GetFlickerSpeed() const { return flickerSpeed; };

  // Z position
  inline void SetZ(double z_) { z = z_; };
  inline double GetZ() const { return z; };

 private:
  virtual void DoUnserializeFrom(gd::Project& project,
                                 const gd::SerializerElement& element) override;
  virtual void DoSerializeTo(gd::SerializerElement& element) const override;

  gd::String lightType;
  bool enabled;
  gd::String color;
  double intensity;
  double distance;
  double decay;
  double angle;
  double penumbra;
  bool castShadow;
  double shadowMapSize;
  double shadowBias;
  double shadowNormalBias;
  double shadowRadius;
  double shadowNear;
  double shadowFar;
  double shadowFocus;
  bool flickerEnabled;
  double flickerSpeed;
  double z;
};
