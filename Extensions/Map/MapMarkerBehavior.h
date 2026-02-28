/**
 * GDevelop - Map Extension
 * Copyright (c) 2024 GDevelop Community
 * This project is released under the MIT License.
 */

#pragma once

#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/Object.h"

namespace gd {
class SerializerElement;
class PropertyDescriptor;
class Project;
class Layout;
}  // namespace gd

/**
 * MapMarker Behavior - marks objects to be tracked on the map
 */
class GD_EXTENSION_API MapMarkerBehavior : public gd::Behavior {
 public:
  MapMarkerBehavior();
  virtual ~MapMarkerBehavior(){};
  
  virtual std::unique_ptr<gd::Behavior> Clone() const override {
    return gd::make_unique<MapMarkerBehavior>(*this);
  }

  virtual std::map<gd::String, gd::PropertyDescriptor> GetProperties(
      const gd::SerializerElement& behaviorContent) const override;
  virtual bool UpdateProperty(gd::SerializerElement& behaviorContent,
                              const gd::String& name,
                              const gd::String& value) override;
  
  virtual void InitializeContent(
      gd::SerializerElement& behaviorContent) override;
};
