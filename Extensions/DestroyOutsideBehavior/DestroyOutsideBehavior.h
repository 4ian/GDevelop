/**

GDevelop - DestroyOutside Behavior Extension
Copyright (c) 2013-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef DESTROYOUTSIDEBEHAVIOR_H
#define DESTROYOUTSIDEBEHAVIOR_H
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
  virtual Behavior* Clone() const override { return new DestroyOutsideBehavior(*this); }

#if defined(GD_IDE_ONLY)
  virtual std::map<gd::String, gd::PropertyDescriptor> GetProperties(
      const gd::SerializerElement& behaviorContent) const override;
  virtual bool UpdateProperty(gd::SerializerElement& behaviorContent,
                              const gd::String& name,
                              const gd::String& value) override;
#endif

  virtual void InitializeContent(
      gd::SerializerElement& behaviorContent) override;
};

#endif  // DESTROYOUTSIDEBEHAVIOR_H
