#pragma once
#include <vector>

#include "Variable.h"

namespace gd {
class String;
class Project;
class Layout;
class ObjectsContainer;
class VariablesContainer;
class Object;
}  // namespace gd

namespace gd {

/**
 * \brief A list of objects containers, useful for accessing objects in a
 * scoped way, along with methods to access them.
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

  /**
   * \brief Check if the specified object or group exists.
   */
  bool HasObjectOrGroupNamed(const gd::String& name) const;

  /**
   * \brief Check if the specified object or group has the specified variable in its
   * declared variables.
   */
  bool HasObjectOrGroupWithVariableNamed(const gd::String& objectOrGroupName,
                                  const gd::String& variableName) const;

  /**
   * \brief Check if the specified object or group has the specified variables container.
   */
  bool HasVariablesContainer(const gd::String& objectOrGroupName,
                                const gd::VariablesContainer& variablesContainer) const;

  /**
   * \brief Return the container of the variables for the specified object or group of objects.
   */
  const gd::VariablesContainer* GetObjectOrGroupVariablesContainer(
      const gd::String& objectOrGroupName) const;

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

  /**
   * \brief Return a list containing all objects refered to by the group.
   * If an object name is passed, then only this object name is returned.
   */
  std::vector<gd::String> ExpandObjectName(
      const gd::String& objectOrGroupName) const;

  /** Do not use - should be private but accessible to let Emscripten create a temporary. */
  ObjectsContainersList() {};

 private:
  bool HasObjectNamed(const gd::String& name) const;

  void Add(const gd::ObjectsContainer& objectsContainer) {
    objectsContainers.push_back(&objectsContainer);
  };

  std::vector<const gd::ObjectsContainer*> objectsContainers;
};

}  // namespace gd