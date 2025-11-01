/**

GDevelop - Top-down movement Behavior Extension
Copyright (c) 2010-present Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#pragma once

#include <vector>
#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/Object.h"

namespace gd {
class SerializerElement;
}  // namespace gd

/**
 * \brief Allow to move an object in 4 or 8 directions.
 */
class GD_EXTENSION_API TopDownMovementBehavior : public gd::Behavior {
 public:
  TopDownMovementBehavior(){};
  virtual ~TopDownMovementBehavior(){};
  virtual std::unique_ptr<gd::Behavior> Clone() const override {
    return gd::make_unique<TopDownMovementBehavior>(*this);
  }

  virtual std::map<gd::String, gd::PropertyDescriptor> GetProperties(
      const gd::SerializerElement& behaviorContent) const override;
  virtual bool UpdateProperty(gd::SerializerElement& behaviorContent,
                              const gd::String& name,
                              const gd::String& value) override;

  /**
   * \brief Serialize the behavior
   */
  virtual void InitializeContent(
      gd::SerializerElement& behaviorContent) override;

 private:
};
