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
      : maxDepthLevel(maxDepthLevel_){};
  virtual ~EventsCodeGenerationContext(){};

  /**
   * Call this method to make an EventsCodeGenerationContext as a "child" of
   * another one. The child will then for example not declare again objects
   * already declared by its parent.
   */
  void InheritsFrom(EventsCodeGenerationContext& parent);

  /**
   * Call this method to make an EventsCodeGenerationContext as a "child" of
   * another one, but in the context of an async function.
   */
  void InheritsAsAsyncCallbackFrom(EventsCodeGenerationContext& parent);

  /**
   * \brief As InheritsFrom, mark the context as being the child of another one,
   * but enabling the child context to use the same object lists.
   *
   * Used for example for optimizing the last event of a list.
   */
  void Reuse(EventsCodeGenerationContext& parent);

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
   * Mark the object as being the object being handled by the instruction.
   */
  void SetCurrentObject(const gd::String& objectName) {
    currentObject = objectName;
  };

  /**
   * Set that no particular object is being handled by an instruction.
   */
  void SetNoCurrentObject() { currentObject = ""; };

  /**
   * Get the object being handled by the instruction.
   */
  const gd::String& GetCurrentObject() const { return currentObject; };

  /**
   * \brief Call this when an instruction in the event needs an objects list.
   *
   * The list will be filled with objects from the scene if it is the first time
   * it is requested, unless there is already an object list with this name
   * (i.e. `ObjectAlreadyDeclaredByParents(objectName)` returns true).
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
  void ObjectsListNeededOrEmptyIfJustDeclared(const gd::String& objectName);

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
   * Return true if an object list has already been declared by the parent contexts.
   */
  bool ObjectAlreadyDeclaredByParents(const gd::String& objectName) const {
    return (alreadyDeclaredObjectsLists.find(objectName) !=
            alreadyDeclaredObjectsLists.end());
  };

  /**
   * Return all the objects lists which will be declared by the current context
   * (normal, potentially empty or empty).
   */
  std::set<gd::String> GetAllObjectsToBeDeclared() const;

  /**
   * Return the objects lists which will be declared by the current context.
   */
  const std::set<gd::String>& GetObjectsListsToBeDeclared() const {
    return objectsListsToBeDeclared;
  };

  /**
   * Return the objects lists which will be will be declared, without filling
   * them with objects from the scene.
   */
  const std::set<gd::String>& GetObjectsListsToBeEmptyIfJustDeclared()
      const {
    return objectsListsOrEmptyToBeDeclared;
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
  const std::set<gd::String>& GetObjectsListsAlreadyDeclaredByParents() const {
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
   * \brief Returns the list of all objects declared in this context
   * and subcontexts.
   * \warning Only works on an async callback's context.
   *
   * It is to be used by the Async event code generator to know what objects
   * lists to backup for the async callback and async callbacks after it.
   */
  const std::set<gd::String>& GetAllDeclaredObjectsAcrossChildren() {
    return allObjectsListToBeDeclaredAcrossChildren;
  };

  /**
   * Returns true if an object list should be gotten from a backed up
   * objects list instead of the parent context. This can happen inside an
   * asynchronous callback or a child context of an asynchronous callback (i.e:
   * the `asyncDepth` is not 0).
   */
  bool ShouldUseAsyncObjectsList(const gd::String& objectName) const;

  /**
   * Returns true if the code currently being generated is inside an
   * asynchronous context (either in an asynchronous callback, or in a children of
   * an asynchronous callback).
   */
  bool IsInsideAsync() const { return asyncDepth != 0; };

  /**
   * Returns true if the code currently being generated is an asynchronous
   * callback (but not a child of an asynchronous callback).
   */
  bool IsAsyncCallback() const { return parent != nullptr && parent->asyncDepth != asyncDepth; }

  /**
   * \brief Returns true if the given object is already going to be declared
   * in this context (either as a traditional objects list, or an empty one).
   */
  bool IsToBeDeclared(const gd::String& objectName) {
    return objectsListsToBeDeclared.find(objectName) !=
               objectsListsToBeDeclared.end() ||
           objectsListsOrEmptyToBeDeclared.find(objectName) !=
               objectsListsOrEmptyToBeDeclared.end() ||
           emptyObjectsListsToBeDeclared.find(objectName) !=
               emptyObjectsListsToBeDeclared.end();
  };

 private:
  void NotifyAsyncParentsAboutDeclaredObject(const gd::String& objectName);

  std::set<gd::String>
      alreadyDeclaredObjectsLists;  ///< Objects lists already needed in a
                                    ///< parent context.
  std::set<gd::String>
      objectsListsToBeDeclared;  ///< Objects lists that will be declared in
                                 ///< this context.
  std::set<gd::String>
      objectsListsOrEmptyToBeDeclared;  ///< Objects lists that will be
                                               ///< declared in this context,
                                               ///< but not filled with scene's
                                               ///< objects.
  std::set<gd::String>
      emptyObjectsListsToBeDeclared;  ///< Objects lists that will be
                                      ///< declared in this context,
                                      ///< but not filled with scene's
                                      ///< objects and not filled with any
                                      ///< previously existing objects list.
  std::set<gd::String>
      allObjectsListToBeDeclaredAcrossChildren;  ///< This is only to be used by
                                                 ///< the async callback
                                                 ///< contexts to know all
                                                 ///< objects declared across
                                                 ///< all children, so that the
                                                 ///< necessary objects can be
                                                 ///< backed up.

  std::map<gd::String, unsigned int>
      depthOfLastUse;  ///< The context depth when an object was last used.
  gd::String
      currentObject;  ///< The object being used by an action or condition.
  unsigned int contextDepth = 0;  ///< The depth of the context: 0 for a newly
                                  ///< created context, n+1 for any context
                                  ///< inheriting from context with depth n.
  unsigned int customConditionDepth =
      0;  ///< The depth of the conditions being generated.
  unsigned int asyncDepth =
      0;  ///< If higher than 0, the current context is an asynchronous callback,
          ///< or a child context of an asynchronous callback:
          ///< - If the parent's async depth != the current context async depth,
          ///<   then the current context is an asynchronous callback context.
          ///< - Otherwise, it's a child of an asynchronous callback.
  unsigned int* maxDepthLevel;  ///< A pointer to a unsigned int updated with
                                ///< the maximum depth reached.
  const EventsCodeGenerationContext* parent =
      nullptr;  ///< The parent of the current context. Can be NULL.
  EventsCodeGenerationContext* nearestAsyncParent =
      nullptr;  ///< The nearest parent context that is an async callback
                ///< context.
  bool reuseExplicitlyForbidden =
      false;  ///< If set to true, forbid children contexts
              ///< to reuse this one without inheriting.
};

}  // namespace gd
#endif  // EVENTSCODEGENERATIONCONTEXT_H
