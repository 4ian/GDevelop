/**

GDevelop - Top-down movement Behavior Extension
Copyright (c) 2010-present Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef TOPDOWNMOVEMENTBEHAVIOR_H
#define TOPDOWNMOVEMENTBEHAVIOR_H
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
  virtual Behavior* Clone() const override { return new TopDownMovementBehavior(*this); }

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
#endif  // TOPDOWNMOVEMENTBEHAVIOR_H
