/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef EVENTSCODEGENERATIONCONTEXT_H
#define EVENTSCODEGENERATIONCONTEXT_H
#include <map>
#include <memory>
#include <set>
#include "GDCore/String.h"

namespace gd {

/**
 * \brief Used to manage the context when generating code for events.
 *
 * The context refers to :
 * - The objects lists being available.
 * - The "current object", i.e the object being used by an action or a
 * condition.
 * - If conditions are being generated, the context keeps track of the depth of
 * the conditions (see GetCurrentConditionDepth)
 * - You can also get the context depth of the last use of an object list.
 */
class GD_CORE_API EventsCodeGenerationContext {
  friend class EventsCodeGenerator;

 public:
  /**
   * Default constructor. You may want to call InheritsFrom just after.
   * \param maxDepthLevel Optional pointer to an unsigned integer that will be
   * updated to contain the maximal scope depth reached.
   */
  EventsCodeGenerationContext(unsigned int* maxDepthLevel_ = nullptr)
      : contextDepth(0),
        customConditionDepth(0),
        maxDepthLevel(maxDepthLevel_),
        parent(NULL),
        reuseExplicitlyForbidden(false){};
  virtual ~EventsCodeGenerationContext(){};

  /**
   * Call this method to make an EventsCodeGenerationContext as a "child" of
   * another one. The child will then for example not declare again objects
   * already declared by its parent.
   */
  void InheritsFrom(const EventsCodeGenerationContext& parent);

  /**
   * \brief As InheritsFrom, mark the context as being the child of another one,
   * but enabling the child context to use the same object lists.
   *
   * Used for example for optimizing the last event of a list.
   */
  void Reuse(const EventsCodeGenerationContext& parent);

  /**
   * \brief Forbid any optimization that would reuse and modify the object list
   * from this context in children context.
   *
   * Used in while/for each/repeat or any event that have a loop and must ensure
   * that the list of objects stay clean.
   */
  void ForbidReuse() { reuseExplicitlyForbidden = true; }

  /**
   * \brief Return false if the object lists of the context can not be reused in
   * a child context.
   */
  bool CanReuse() const {
    return !reuseExplicitlyForbidden && parent != nullptr;
  }

  /**
   * \brief Returns the depth of the inheritance of the context.
   *
   * A context created from scratch will returns 0, and a context inheriting
   * from a context with depth n will returns n+1.
   */
  size_t GetContextDepth() const { return contextDepth; }

  /**
   * \brief Get the parent context, if any.
   * \return A pointer to the parent context, or NULL if the context has no
   * parent.
   */
  const EventsCodeGenerationContext* GetParentContext() const { return parent; }

  /**
   * Mark the object has being the object being handled by the instruction
   */
  void SetCurrentObject(const gd::String& objectName) {
    currentObject = objectName;
  };

  /**
   * Set that no particular object is being handled by an instruction
   */
  void SetNoCurrentObject() { currentObject = ""; };

  /**
   * Get the object being handled by the instruction
   */
  const gd::String& GetCurrentObject() const { return currentObject; };

  /**
   * \brief Call this when an instruction in the event needs an objects list.
   *
   * The list will be filled with objects from the scene if it is the first time
   * it is requested, unless there is already an object list with this name
   * (i.e. `ObjectAlreadyDeclared(objectName)` returns true).
   */
  void ObjectsListNeeded(const gd::String& objectName);

  /**
   * Call this when an instruction in the event needs an empty objects list
   * or the one already declared, if any.
   *
   * An empty objects list will be declared, without filling it with objects
   * from the scene. If there is already an objects list with this name, no new
   * list will be declared again.
   */
  void ObjectsListWithoutPickingNeeded(const gd::String& objectName);

  /**
   * Call this when an instruction in the event needs an empty object list,
   * even if one is already declared.
   *
   * An empty objects list will be declared, without filling it with objects
   * from the scene. If there is already an object list with this name, it won't
   * be used to initialize the new list, which will remain empty.
   */
  void EmptyObjectsListNeeded(const gd::String& objectName);

  /**
   * Return true if an object list has already been declared (or is going to be
   * declared).
   */
  bool ObjectAlreadyDeclared(const gd::String& objectName) const {
    return (alreadyDeclaredObjectsLists.find(objectName) !=
            alreadyDeclaredObjectsLists.end());
  };

  /**
   * \brief Consider that \a objectName is now declared in the context.
   */
  void SetObjectDeclared(const gd::String& objectName) {
    alreadyDeclaredObjectsLists.insert(objectName);
  }

  /**
   * Return all the objects lists which will be declared by the current context
   * ( the non empty as well as the empty objects lists )
   */
  std::set<gd::String> GetAllObjectsToBeDeclared() const;

  /**
   * Return the objects lists which will be declared by the current context
   */
  const std::set<gd::String>& GetObjectsListsToBeDeclared() const {
    return objectsListsToBeDeclared;
  };

  /**
   * Return the objects lists which will be will be declared, without filling
   * them with objects from the scene.
   */
  const std::set<gd::String>& GetObjectsListsToBeDeclaredWithoutPicking()
      const {
    return objectsListsWithoutPickingToBeDeclared;
  };

  /**
   * Return the objects lists which will be will be declared empty, without
   * filling them with objects from the scene and without copying any previously
   * declared objects list.
   */
  const std::set<gd::String>& GetObjectsListsToBeDeclaredEmpty() const {
    return emptyObjectsListsToBeDeclared;
  };

  /**
   * Return the objects lists which are already declared and can be used in the
   * current context without declaration.
   */
  const std::set<gd::String>& GetObjectsListsAlreadyDeclared() const {
    return alreadyDeclaredObjectsLists;
  };

  /**
   * \brief Get the depth of the context that was in effect when \a objectName
   * was needed.
   *
   * If \a objectName is needed in this context, it will return the depth of
   * this context.
   */
  unsigned int GetLastDepthObjectListWasNeeded(
      const gd::String& objectName) const;

  /**
   * \brief Check if twos context have the same list for an object.
   *
   * This can be the case when a context is reusing the lists of another (see
   * gd::EventsCodeGenerationContext::Reuse).
   */
  bool IsSameObjectsList(const gd::String& objectName,
                         const EventsCodeGenerationContext& otherContext) const;

  /**
   * \brief Called when a custom condition code is generated.
   */
  void EnterCustomCondition() { customConditionDepth++; };

  /**
   * \brief Called when a custom condition code generation is over.
   */
  void LeaveCustomCondition() { customConditionDepth--; };

  /**
   * \brief Get the current condition depth : The depth is increased each time a
   * custom condition code is generated, and decreased when the condition
   * generation is done.
   *
   * This can be useful to generate sub conditions booleans with a different
   * name than the parent's conditions.
   */
  size_t GetCurrentConditionDepth() const { return customConditionDepth; }

  /**
   * \brief Returns true if the given object is already going to be declared
   * (either as a traditional objects list, or one without picking, or one
   * empty).
   *
   */
  bool IsToBeDeclared(const gd::String& objectName) {
    return objectsListsToBeDeclared.find(objectName) !=
               objectsListsToBeDeclared.end() ||
           objectsListsWithoutPickingToBeDeclared.find(objectName) !=
               objectsListsWithoutPickingToBeDeclared.end() ||
           emptyObjectsListsToBeDeclared.find(objectName) !=
               emptyObjectsListsToBeDeclared.end();
  };

 private:
  std::set<gd::String>
      alreadyDeclaredObjectsLists;  ///< Objects lists already needed in a
                                    ///< parent context.
  std::set<gd::String>
      objectsListsToBeDeclared;  ///< Objects lists that will be declared in
                                 ///< this context.
  std::set<gd::String>
      objectsListsWithoutPickingToBeDeclared;  ///< Objects lists that will be
                                               ///< declared in this context,
                                               ///< but not filled with scene's
                                               ///< objects.
  std::set<gd::String>
      emptyObjectsListsToBeDeclared;  ///< Objects lists that will be
                                      ///< declared in this context,
                                      ///< but not filled with scene's
                                      ///< objects and not filled with any
                                      ///< previously existing objects list.
  std::map<gd::String, unsigned int>
      depthOfLastUse;  ///< The context depth when an object was last used.
  gd::String
      currentObject;  ///< The object being used by an action or condition.
  unsigned int contextDepth;  ///< The depth of the context : 0 for a newly
                              ///< created context, n+1 for any context
                              ///< inheriting from context with depth n.
  unsigned int
      customConditionDepth;  ///< The depth of the conditions being generated.
  unsigned int* maxDepthLevel;  ///< A pointer to a unsigned int updated with
                                ///< the maximum depth reached.
  const EventsCodeGenerationContext*
      parent;  ///< The parent of the current context. Can be NULL.
  bool reuseExplicitlyForbidden;  ///< If set to true, forbid children context
                                  ///< to reuse this one without inheriting.
};

}  // namespace gd
#endif  // EVENTSCODEGENERATIONCONTEXT_H
