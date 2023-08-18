#pragma once
#include <vector>

#include "Variable.h"

namespace gd {
class String;
class Project;
class Layout;
class ObjectsContainer;
class Object;
}  // namespace gd

namespace gd {

/**
 * \brief A list of objects containers, useful for accessing objects in a
 * scoped way, along with methods to access them.
 *
 * TODO: add comments for each method, as there is a bit of logic in them.
 *
 * \see gd::Object
 * \see gd::ObjectsContainer
 * \see gd::Project
 * \see gd::Layout
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API ObjectsContainersList {
 public:
  virtual ~ObjectsContainersList(){};

  static ObjectsContainersList MakeNewObjectsContainersListForProjectAndLayout(
      const gd::Project& project, const gd::Layout& layout);

  static ObjectsContainersList MakeNewObjectsContainersListForContainers(
      const gd::ObjectsContainer& globalObjectsContainer,
      const gd::ObjectsContainer& objectsContainer);

  bool HasObjectOrGroupNamed(const gd::String& name) const;

  bool HasObjectOrGroupWithVariableNamed(const gd::String& objectOrGroupName,
                                  const gd::String& variableName) const;

  const gd::Variable& GetObjectOrGroupVariable(
      const gd::String& objectOrGroupName,
      const gd::String& variableName) const;

  /**
   * \brief Get a type from an object/group name.
   * \note If a group contains only objects of a same type, then the group has
   * this type. Otherwise, it is considered as an object without any specific
   * type.
   *
   * @return Type of the object/group.
   */
  gd::String GetTypeOfObject(const gd::String& objectName) const;

  /**
   * \brief Check if an object or all object of a group has a behavior.
   */
  bool HasBehaviorInObjectOrGroup(const gd::String& objectOrGroupName,
                                  const gd::String& behaviorName) const;

  /**
   * \brief Get a type from a behavior name
   * @return Type of the behavior.
   * @deprecated - Use GetTypeOfBehaviorInObjectOrGroup instead.
   */
  gd::String GetTypeOfBehavior(const gd::String& behaviorName) const;

  std::vector<gd::String> ExpandObjectName(
      const gd::String& objectOrGroupName) const;

 private:
  ObjectsContainersList() {};

  bool HasObjectNamed(const gd::String& name) const;

  void Add(const gd::ObjectsContainer& objectsContainer) {
    objectsContainers.push_back(&objectsContainer);
  };

  std::vector<const gd::ObjectsContainer*> objectsContainers;
  static gd::Variable badVariable;
};

}  // namespace gd