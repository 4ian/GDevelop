/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_OBJECTSCONTAINER_H
#define GDCORE_OBJECTSCONTAINER_H
#include <memory>
#include <vector>
#include "GDCore/String.h"
#include "GDCore/Project/ObjectGroupsContainer.h"
#include "GDCore/Project/ObjectFolderOrObject.h"
namespace gd {
class Object;
class Project;
class SerializerElement;
}  // namespace gd
#undef GetObject  // Disable an annoying macro

namespace gd {

/**
 * \brief Used as a base class for classes that will own objects (see
 * gd::Object).
 *
 * For example, gd::Project inherits from this class as it have global
 * objects.<br> gd::Layout also inherits from this class as each layout has
 * specific objects.
 *
 * \see gd::Project
 * \see gd::Layout
 * \see gd::Object
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API ObjectsContainer {
 public:
  /**
   * \brief Default constructor creating a container without any objects.
   */
  ObjectsContainer();
  virtual ~ObjectsContainer();

  /** \name Objects management
   * Members functions related to objects management.
   */
  ///@{

  /**
   * \brief Return true if object called \a name exists.
   */
  bool HasObjectNamed(const gd::String& name) const;

  /**
   * \brief Return a reference to the object called \a name.
   */
  Object& GetObject(const gd::String& name);

  /**
   * \brief Return a reference to the object called \a name.
   */
  const gd::Object& GetObject(const gd::String& name) const;

  /**
   * \brief Return a reference to the object at position \a index in the objects
   * list
   */
  Object& GetObject(std::size_t index);

  /**
   * \brief Return a reference to the object at position \a index in the objects
   * list.
   */
  const gd::Object& GetObject(std::size_t index) const;

  /**
   * \brief Return the position of the object called \a name in the objects
   * list.
   *
   * \warning This has nothing to do with an object position on a layout.
   * Objects put on layouts are represented thanks to the gd::InitialInstance
   * class.
   */
  std::size_t GetObjectPosition(const gd::String& name) const;

  /**
   * \brief Return the number of object.
   */
  std::size_t GetObjectsCount() const;

  /**
   * \brief Add a new empty object of type \a objectType called \a name at the
   * specified position in the list.<br>
   *
   * \note The object is created using the project's current platform.
   * \return A reference to the object in the list.
   */
  gd::Object& InsertNewObject(const gd::Project& project,
                              const gd::String& objectType,
                              const gd::String& name,
                              std::size_t position);
  /**
   * \brief Add a new empty object of type \a objectType called \a name in the
   * given folder at the specified position.<br>
   *
   * \note The object is created using the project's current platform.
   * \return A reference to the object in the list.
   */
  gd::Object& InsertNewObjectInFolder(
      const gd::Project& project,
      const gd::String& objectType,
      const gd::String& name,
      gd::ObjectFolderOrObject& objectFolderOrObject,
      std::size_t position);

  /**
   * \brief Add a new object to the list
   * \note The object passed by parameter is copied.
   * \param object The object that must be copied and inserted into the project
   * \param position Insertion position. If the position is invalid, the object
   * is inserted at the end of the objects list.
   *
   * \return A reference to the object in the list.
   */
  gd::Object& InsertObject(const gd::Object& object, std::size_t position);

  /**
   * \brief Delete an object.
   * \warning When calling this function, be sure to drop any reference that you
   * might hold to the object - otherwise you'll access deleted memory.
   *
   * \param name The name of the object to be deleted.
   */
  void RemoveObject(const gd::String& name);

  /**
   * Change the position of the specified object.
   */
  void MoveObject(std::size_t oldIndex, std::size_t newIndex);

  /**
   * Move the specified object to another container, removing it from the
   * current one and adding it to the new one at the specified position in the
   * given folder.
   *
   * \note This does not invalidate the references to the object (object is not
   * moved in memory, as referenced by smart pointers internally).
   */
  void MoveObjectFolderOrObjectToAnotherContainerInFolder(
      gd::ObjectFolderOrObject& objectFolderOrObject,
      gd::ObjectsContainer& newContainer,
      gd::ObjectFolderOrObject& newParentFolder,
      std::size_t newPosition);

  /**
   * Provide a raw access to the vector containing the objects
   */
  std::vector<std::unique_ptr<gd::Object> >& GetObjects() {
    return initialObjects;
  }

  /**
   * Provide a raw access to the vector containing the objects
   */
  const std::vector<std::unique_ptr<gd::Object> >& GetObjects() const {
    return initialObjects;
  }
  ///@}

  /**
   * Returns a vector containing all object and folders in this container.
   * Only use this for checking if you hold a valid `ObjectFolderOrObject` -
   * don't use this for rendering or anything else.
   */
  std::vector<const ObjectFolderOrObject*> GetAllObjectFolderOrObjects() const;

  gd::ObjectFolderOrObject& GetRootFolder() {
      return *rootFolder;
  }

  void AddMissingObjectsInRootFolder();

  /** \name Saving and loading
   * Members functions related to saving and loading the objects of the class.
   */
  ///@{
  /**
   * \brief Serialize the objects container.
   */
  void SerializeObjectsTo(SerializerElement& element) const;

  /**
   * \brief Unserialize the objects container.
   */
  void UnserializeObjectsFrom(gd::Project& project,
                              const SerializerElement& element);
  /**
   * \brief Serialize folder structure.
   */
  void SerializeFoldersTo(SerializerElement& element) const;

  /**
   * \brief Unserialize folder structure.
   */
  void UnserializeFoldersFrom(gd::Project& project,
                              const SerializerElement& element);
  ///@}

  /** \name Objects groups management
   * Members functions related to global objects groups management.
   */
  ///@{

  /**
   * \brief Return a reference to the project's objects groups.
   */
  ObjectGroupsContainer& GetObjectGroups() { return objectGroups; }

  /**
   * \brief Return a const reference to the project's objects groups.
   */
  const ObjectGroupsContainer& GetObjectGroups() const { return objectGroups; }

  ///@}

 protected:
  std::vector<std::unique_ptr<gd::Object> >
      initialObjects;  ///< Objects contained.
  gd::ObjectGroupsContainer objectGroups;

 private:
  std::unique_ptr<gd::ObjectFolderOrObject> rootFolder;
};

}  // namespace gd

#endif  // GDCORE_OBJECTSCONTAINER_H
