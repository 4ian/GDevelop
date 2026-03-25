/**
GDevelop - Sticker3D Behavior Extension
Copyright (c) 2024 GDevelop Team
This project is released under the MIT License.
*/
#pragma once

#include <vector>
#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/Object.h"

namespace gd {
class SerializerElement;
class Project;
}  // namespace gd

/**
 * \brief Allow to stick 3D objects together so they move as one.
 */
class GD_EXTENSION_API Sticker3DBehavior : public gd::Behavior {
 public:
  Sticker3DBehavior() {};
  virtual ~Sticker3DBehavior(){};
  
  virtual std::unique_ptr<gd::Behavior> Clone() const override {
    return gd::make_unique<Sticker3DBehavior>(*this);
  }

  virtual std::map<gd::String, gd::PropertyDescriptor> GetProperties(
      const gd::SerializerElement& behaviorContent) const override;
  virtual bool UpdateProperty(gd::SerializerElement& behaviorContent,
                              const gd::String& name,
                              const gd::String& value) override;

  virtual void InitializeContent(
      gd::SerializerElement& behaviorContent) override;
};
