/**
GDevelop - Anchor Behavior Extension
Copyright (c) 2016 Victor Levasseur (victorlevasseur52@gmail.com)
This project is released under the MIT License.
*/
#ifndef ANCHORBEHAVIOR_H
#define ANCHORBEHAVIOR_H
#include <vector>
#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/Object.h"
namespace gd {
class SerializerElement;
class Project;
}  // namespace gd

/**
 * \brief Allow to anchor objects to the window's bounds.
 */
class GD_EXTENSION_API AnchorBehavior : public gd::Behavior {
 public:
  enum HorizontalAnchor {
    ANCHOR_HORIZONTAL_NONE = 0,
    ANCHOR_HORIZONTAL_WINDOW_LEFT = 1,
    ANCHOR_HORIZONTAL_WINDOW_RIGHT = 2,
    ANCHOR_HORIZONTAL_PROPORTIONAL = 3
  };

  enum VerticalAnchor {
    ANCHOR_VERTICAL_NONE = 0,
    ANCHOR_VERTICAL_WINDOW_TOP = 1,
    ANCHOR_VERTICAL_WINDOW_BOTTOM = 2,
    ANCHOR_VERTICAL_PROPORTIONAL = 3
  };

  AnchorBehavior() {};
  virtual ~AnchorBehavior(){};
  virtual Behavior* Clone() const override { return new AnchorBehavior(*this); }

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

#endif  // ANCHORBEHAVIOR_H
