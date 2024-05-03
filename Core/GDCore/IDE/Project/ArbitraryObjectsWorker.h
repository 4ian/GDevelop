/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef ARBITRARYOBJECTSWORKER_H
#define ARBITRARYOBJECTSWORKER_H

#include <map>
#include <memory>
#include <vector>

#include "GDCore/String.h"
namespace gd {
class Object;
class ObjectsContainer;
class Behavior;
}  // namespace gd

namespace gd {

/**
 * \brief ArbitraryObjectsWorker is an abstract class used to browse objects
 * (and behaviors) and do some work on them. Can be used to implement
 * refactoring for example.
 *
 * \ingroup IDE
 */
class GD_CORE_API ArbitraryObjectsWorker {
 public:
  ArbitraryObjectsWorker(){};
  virtual ~ArbitraryObjectsWorker();

  /**
   * \brief Launch the worker on the specified object container.
   */
  void Launch(gd::ObjectsContainer& objects) { VisitObjectContainer(objects); };

 private:
  void VisitObjectContainer(gd::ObjectsContainer& objects);
  void VisitObject(gd::Object& object);
  void VisitBehavior(gd::Behavior& behavior);

  /**
   * Called to do some work on an object container.
   */
  virtual void DoVisitObjectContainer(gd::ObjectsContainer& objects){};

  /**
   * Called to do some work on an object.
   */
  virtual void DoVisitObject(gd::Object& object){};

  /**
   * Called to do some work on a behavior.
   */
  virtual void DoVisitBehavior(gd::Behavior& behavior){};
};

}  // namespace gd

#endif  // ARBITRARYOBJECTSWORKER_H
