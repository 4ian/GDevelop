/*
 * GDevelop Core
 * Copyright 2008-2021 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef GDCORE_UNFILLEDREQUIREDBEHAVIORPROPERTYPROBLEM_H
#define GDCORE_UNFILLEDREQUIREDBEHAVIORPROPERTYPROBLEM_H
#include "GDCore/String.h"

namespace gd {
class Project;
class Object;
class Behavior;
}  // namespace gd

namespace gd {

/**
 * \brief A problem when a required behavior property is not fill correctly.
 */
class GD_CORE_API UnfilledRequiredBehaviorPropertyProblem {
 public:
  UnfilledRequiredBehaviorPropertyProblem(
      const gd::Project& sourceProject_,
      gd::Object& sourceObject_,
      gd::Behavior& sourceBehavior_,
      const gd::String& sourcePropertyName_,
      const gd::String& expectedBehaviorTypeName_)
      : sourceProject(sourceProject_),
      sourceObject(sourceObject_),
      sourceBehavior(sourceBehavior_),
      sourcePropertyName(sourcePropertyName_),
      expectedBehaviorTypeName(expectedBehaviorTypeName_){};
  virtual ~UnfilledRequiredBehaviorPropertyProblem();

  /**
   * \brief Return the project where the problem appears
   */
  virtual const gd::Project& GetSourceProject() const { return sourceProject; }

  /**
   * \brief Return the object where the problem appears.
   */
  virtual gd::Object& GetSourceObject() const { return sourceObject; }

  /**
   * \brief Return the behavior where the problem appears.
   */
  virtual gd::Behavior& GetSourceBehaviorContent() const {
    return sourceBehavior;
  }

  /**
   * \brief Return the property where the problem appears.
   */
  virtual const gd::String& GetSourcePropertyName() const {
    return sourcePropertyName;
  }

  /**
   * \brief Return the behavior type name that is expected for the required
   * behavior property.
   */
  virtual const gd::String& GetExpectedBehaviorTypeName() const {
    return expectedBehaviorTypeName;
  }

 private:
  const gd::Project& sourceProject;
  gd::Object& sourceObject;
  gd::Behavior& sourceBehavior;
  const gd::String sourcePropertyName;

  const gd::String expectedBehaviorTypeName;
};

}  // namespace gd

#endif  // GDCORE_UNFILLEDREQUIREDBEHAVIORPROPERTYPROBLEM_H
