/**

GDevelop - DestroyOutside Behavior Extension
Copyright (c) 2013-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef DESTROYOUTSIDERUNTIMEBEHAVIOR_H
#define DESTROYOUTSIDERUNTIMEBEHAVIOR_H
#include <map>
#include "GDCpp/Runtime/Project/Object.h"
#include "GDCpp/Runtime/RuntimeBehavior.h"
class RuntimeScene;
namespace gd {
class SerializerElement;
}

/**
 * \brief Behavior that allows objects to be dragged with the mouse
 */
class GD_EXTENSION_API DestroyOutsideRuntimeBehavior : public RuntimeBehavior {
 public:
  DestroyOutsideRuntimeBehavior(const gd::SerializerElement& behaviorContent);
  virtual ~DestroyOutsideRuntimeBehavior(){};
  virtual DestroyOutsideRuntimeBehavior* Clone() const {
    return new DestroyOutsideRuntimeBehavior(*this);
  }

  /**
   * \brief Return the value of the extra border.
   */
  bool GetExtraBorder() const { return extraBorder; };

  /**
   * \brief Set the value of the extra border, i.e the supplementary margin that
   * the object must cross before being deleted.
   */
  void SetExtraBorder(float extraBorder_) { extraBorder = extraBorder_; };

 private:
  virtual void DoStepPostEvents(RuntimeScene& scene);

  float extraBorder;  ///< The supplementary margin outside the screen that the
                      ///< object must cross before being deleted.
};

#endif  // DESTROYOUTSIDERUNTIMEBEHAVIOR_H
