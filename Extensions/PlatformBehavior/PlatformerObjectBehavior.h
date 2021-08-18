/**

GDevelop - Platform Behavior Extension
Copyright (c) 2013-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef PLATFORMEROBJECTBEHAVIOR_H
#define PLATFORMEROBJECTBEHAVIOR_H
#include <map>

#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/Object.h"
namespace gd {
class SerializerElement;
}

/**
 * \brief Allows objects to jump and stand on platforms.
 */
class GD_EXTENSION_API PlatformerObjectBehavior : public gd::Behavior {
 public:
  PlatformerObjectBehavior(){};
  virtual ~PlatformerObjectBehavior(){};
  virtual Behavior* Clone() const override {
    return new PlatformerObjectBehavior(*this);
  }

#if defined(GD_IDE_ONLY)
  virtual std::map<gd::String, gd::PropertyDescriptor> GetProperties(
      const gd::SerializerElement& behaviorContent) const override;
  virtual bool UpdateProperty(gd::SerializerElement& behaviorContent,
                              const gd::String& name,
                              const gd::String& value) override;
#endif
  /**
   * \brief Serialize the behavior
   */
  virtual void InitializeContent(
      gd::SerializerElement& behaviorContent) override;

 private:
};
#endif  // PLATFORMEROBJECTBEHAVIOR_H
