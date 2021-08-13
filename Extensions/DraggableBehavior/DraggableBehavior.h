/**

GDevelop - Draggable Behavior Extension
Copyright (c) 2013-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef DRAGGABLEBEHAVIOR_H
#define DRAGGABLEBEHAVIOR_H
#include <SFML/System/Vector2.hpp>
#include <map>
#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/Object.h"
class RuntimeScene;
namespace gd {
class SerializerElement;
class Layout;
}

/**
 * \brief Behavior that allows objects to be dragged with the mouse
 */
class GD_EXTENSION_API DraggableBehavior : public gd::Behavior {
 public:
  DraggableBehavior();
  virtual ~DraggableBehavior(){};
  virtual Behavior* Clone() const { return new DraggableBehavior(*this); }

 private:
};

#endif  // DRAGGABLEBEHAVIOR_H
