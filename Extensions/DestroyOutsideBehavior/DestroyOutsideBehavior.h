/**

GDevelop - DestroyOutside Behavior Extension
Copyright (c) 2013-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef DRAGGABLEBEHAVIOR_H
#define DRAGGABLEBEHAVIOR_H
#include "GDCpp/Runtime/Project/Behavior.h"
#include "GDCpp/Runtime/Project/Object.h"
class RuntimeScene;
namespace gd {
class SerializerElement;
}

/**
 * \brief Behavior that allows objects to be dragged with the mouse.
 */
class GD_EXTENSION_API DestroyOutsideBehavior : public Behavior {
 public:
  DestroyOutsideBehavior();
  virtual ~DestroyOutsideBehavior(){};
  virtual Behavior* Clone() const { return new DestroyOutsideBehavior(*this); }

 private:
};

#endif  // DRAGGABLEBEHAVIOR_H
