/**

GDevelop - DestroyOutside Behavior Extension
Copyright (c) 2013-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#pragma once

#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/Object.h"

class RuntimeScene;
namespace gd {
class SerializerElement;
}

/**
 * \brief Behavior that destroys object outside the screen.
 */
class GD_EXTENSION_API DestroyOutsideBehavior : public gd::Behavior {
 public:
  DestroyOutsideBehavior(){};
  virtual ~DestroyOutsideBehavior(){};
  virtual std::unique_ptr<gd::Behavior> Clone() const override {
    return gd::make_unique<DestroyOutsideBehavior>(*this);
  }

  virtual std::map<gd::String, gd::PropertyDescriptor> GetProperties(
      const gd::SerializerElement& behaviorContent) const override;
  virtual bool UpdateProperty(gd::SerializerElement& behaviorContent,
                              const gd::String& name,
                              const gd::String& value) override;

  virtual void InitializeContent(
      gd::SerializerElement& behaviorContent) override;
};
