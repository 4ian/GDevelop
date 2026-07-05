/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include <vector>
#include "GDCore/Project/AbstractEventsBasedEntity.h"
#include "GDCore/Project/BehaviorsContainer.h"
#include "GDCore/Project/EventsBasedObjectVariant.h"
#include "GDCore/Project/EventsBasedObjectVariantsContainer.h"
#include "GDCore/Project/ObjectsContainer.h"
#include "GDCore/Project/InitialInstancesContainer.h"
#include "GDCore/Project/LayersContainer.h"
#include "GDCore/Project/VariablesContainer.h"
#include "GDCore/String.h"
namespace gd {
class SerializerElement;
class Project;
class Behavior;
}  // namespace gd

namespace gd {
// TODO EBO Add a way to mark some parts of children configuration as readonly.
/**
 * \brief Represents an object that is implemented with events.
 *
 * It's the responsibility of the IDE to run the logic to transform this into a
 * real object, by declaring an extension and running code generation.
 * See `EventsFunctionsExtensionsLoader`.
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API EventsBasedObject: public AbstractEventsBasedEntity {
 public:
  EventsBasedObject();
  virtual ~EventsBasedObject();

  /**
   * \brief Return a pointer to a new EventsBasedObject constructed from
   * this one.
   */
  EventsBasedObject* Clone() const { return new EventsBasedObject(*this); };

  /**
   * \brief Get the default name for created objects.
   */
  const gd::String& GetDefaultName() const { return defaultName; };

  /**
   * \brief Set the default name for created objects.
   */
  EventsBasedObject& SetDefaultName(const gd::String& defaultName_) {
    defaultName = defaultName_;
    return *this;
  }

  EventsBasedObject& SetDescription(const gd::String& description_) override {
    AbstractEventsBasedEntity::SetDescription(description_);
    return *this;
  }

  /**
   * \brief Set the internal name of the object.
   */
  EventsBasedObject& SetName(const gd::String& name_) override {
    AbstractEventsBasedEntity::SetName(name_);
    return *this;
  }

  /**
   * \brief Set the name of the object, to be displayed in the editor.
   */
  EventsBasedObject &SetFullName(const gd::String &fullName_) override {
    AbstractEventsBasedEntity::SetFullName(fullName_);
    return *this;
  }

  EventsBasedObject &
  SetPreviewIconUrl(const gd::String &previewIconUrl_) override {
    AbstractEventsBasedEntity::SetPreviewIconUrl(previewIconUrl_);
    return *this;
  }

  EventsBasedObject &SetIconUrl(const gd::String &iconUrl_) override {
    AbstractEventsBasedEntity::SetIconUrl(iconUrl_);
    return *this;
  }

  /**
   * \brief Set the help path relative to the GDevelop
   * documentation root.
   */
  EventsBasedObject &SetHelpPath(const gd::String &helpPath_) override {
    AbstractEventsBasedEntity::SetHelpPath(helpPath_);
    return *this;
  }

  /**
   * \brief Get the tag from which to choose assets from when creating a new
   * object.
   */
  const gd::String& GetAssetStoreTag() const { return assetStoreTag; }

  /**
   * \brief Set the tag from which to choose assets from when creating a new
   * object.
   */
  EventsBasedObject &SetAssetStoreTag(const gd::String& assetStoreTag_) {
    assetStoreTag = assetStoreTag_;
    return *this;
  }

  /**
   * \brief Set that the object is private - it can't be used outside of its
   * extension.
   */
  EventsBasedObject& SetPrivate(bool isPrivate) {
    AbstractEventsBasedEntity::SetPrivate(isPrivate);
    return *this;
  }

  /**
   * \brief Declare a usage of the 3D renderer.
   */
  EventsBasedObject& MarkAsRenderedIn3D(bool isRenderedIn3D_) {
    isRenderedIn3D = isRenderedIn3D_;
    return *this;
  }

  /**
   * \brief Return true if the object uses the 3D renderer.
   */
  bool IsRenderedIn3D() const { return isRenderedIn3D; }

  /**
   * \brief Declare an Animatable capability.
   */
  EventsBasedObject& MarkAsAnimatable(bool isAnimatable_) {
    isAnimatable = isAnimatable_;
    return *this;
  }

  /**
   * \brief Return true if the object needs an Animatable capability.
   */
  bool IsAnimatable() const { return isAnimatable; }

  /**
   * \brief Declare a TextContainer capability.
   */
  EventsBasedObject &MarkAsTextContainer(bool isTextContainer_) {
    isTextContainer = isTextContainer_;
    return *this;
  }

  /**
   * \brief Declare that the parent scale will always be 1 and children will
   * adapt there size. This is removing the ScalableCapability.
   */
  EventsBasedObject &
  MarkAsInnerAreaFollowingParentSize(bool isInnerAreaExpandingWithParent_) {
    isInnerAreaFollowingParentSize = isInnerAreaExpandingWithParent_;
    return *this;
  }

  /**
   * \brief Return true if objects handle size changes on their own and
   * don't have the ScalableCapability.
   *
   * When the parent dimensions change:
   * - if `false`, the object is stretch proportionally while children local
   *   positions stay the same.
   * - if `true`, the children local positions need to be adapted by events
   *   to follow their parent size.
   */
  bool IsInnerAreaFollowingParentSize() const {
    return isInnerAreaFollowingParentSize;
  }

  /**
   * \brief Declare that custom object are rendered using their child-objects
   * instead of their child-instances.
   */
  EventsBasedObject &
  MakAsUsingLegacyInstancesRenderer(bool isUsingLegacyInstancesRenderer_) {
    isUsingLegacyInstancesRenderer = isUsingLegacyInstancesRenderer_;
    return *this;
  }

  /**
   * \brief Return true if custom object are rendered using their child-objects
   * instead of their child-instances.
   */
  bool IsUsingLegacyInstancesRenderer() const {
    return isUsingLegacyInstancesRenderer;
  }

  /**
   * \brief Return true if the object needs a TextContainer capability.
   */
  bool IsTextContainer() const { return isTextContainer; }

  /**
   * \brief Get the default variant of the custom object.
   */
  const gd::EventsBasedObjectVariant& GetDefaultVariant() const { return defaultVariant; }

  /**
   * \brief Get the default variant of the custom object.
   */
  gd::EventsBasedObjectVariant& GetDefaultVariant() { return defaultVariant; }

  /**
   * \brief Get the variants of the custom object.
   */
  const gd::EventsBasedObjectVariantsContainer& GetVariants() const { return variants; }

  /**
   * \brief Get the variants of the custom object.
   */
  gd::EventsBasedObjectVariantsContainer& GetVariants() { return variants; }

  /** \name Layers
   */
  ///@{
  /**
   * \brief Get the layers of the custom object.
   */
  const gd::LayersContainer& GetLayers() const { return defaultVariant.GetLayers(); }

  /**
   * \brief Get the layers of the custom object.
   */
  gd::LayersContainer& GetLayers() { return defaultVariant.GetLayers(); }
  ///@}

  /** \name Child objects
   */
  ///@{
  /**
   * \brief Get the objects of the custom object.
   */
  gd::ObjectsContainer& GetObjects() {
    return defaultVariant.GetObjects();
  }

  /**
   * \brief Get the objects of the custom object.
   */
  const gd::ObjectsContainer& GetObjects() const {
    return defaultVariant.GetObjects();
  }
  ///@}

  /** \name Variables
   */
  ///@{
  /**
   * \brief Get the variables of the custom object.
   *
   * These variables store state owned by the custom object itself and are
   * available as variables of the "Object" parameter in its events.
   */
  const gd::VariablesContainer& GetVariables() const { return variables; }

  /**
   * \brief Get the variables of the custom object.
   */
  gd::VariablesContainer& GetVariables() { return variables; }
  ///@}

  /** \name Behaviors management
   * Members functions related to behaviors management.
   */
  ///@{

  /**
   * \brief Return a vector containing the names of all the behaviors used by
   * the custom object type.
   */
  std::vector<gd::String> GetAllBehaviorNames() const;

  /**
   * \brief Return a reference to the content of the behavior called \a name.
   */
  gd::Behavior& GetBehavior(const gd::String& name);

  /**
   * \brief Return a reference to the content of the behavior called \a name.
   */
  const gd::Behavior& GetBehavior(const gd::String& name) const;

  /**
   * \brief Return true if the custom object type has a behavior called \a name.
   */
  bool HasBehaviorNamed(const gd::String& name) const;

  /**
   * \brief Remove behavior called \a name.
   */
  void RemoveBehavior(const gd::String& name);

  /**
   * \brief Change the name of behavior called name to newName.
   * \return true if name was successfully changed
   */
  bool RenameBehavior(const gd::String& name, const gd::String& newName);

  /**
   * \brief Add the behavior of the specified \a type with the specified \a
   * name.
   *
   * The project's current platform is used to initialize the content.
   *
   * \return A pointer to the newly added behavior content. NULL if the creation
   * failed.
   */
  gd::Behavior* AddNewBehavior(const gd::Project& project,
                               const gd::String& type,
                               const gd::String& name);
  ///@}

  /** \name Instances
   */
  ///@{
  /**
   * \brief Get the instances of the custom object.
   */
  gd::InitialInstancesContainer& GetInitialInstances() {
    return defaultVariant.GetInitialInstances();
  }

  /**
   * \brief Get the instances of the custom object.
   */
  const gd::InitialInstancesContainer& GetInitialInstances() const {
    return defaultVariant.GetInitialInstances();
  }

  /**
   * \brief Get the left bound of the custom object.
   * 
   * This is used only if there is any initial instances.
   * 
   * \see EventsBasedObject::GetInitialInstances
   */
  int GetAreaMinX() const {
    return defaultVariant.GetAreaMinX();
  }

  /**
   * \brief Set the left bound of the custom object.
   */
  void SetAreaMinX(int areaMinX) {
    defaultVariant.SetAreaMinX(areaMinX);
  }

  /**
   * \brief Get the top bound of the custom object.
   * 
   * This is used only if there is any initial instances.
   * 
   * \see EventsBasedObject::GetInitialInstances
   */
  int GetAreaMinY() const {
    return defaultVariant.GetAreaMinY();
  }

  /**
   * \brief Set the top bound of the custom object.
   */
  void SetAreaMinY(int areaMinY) {
    defaultVariant.SetAreaMinY(areaMinY);
  }

  /**
   * \brief Get the min Z bound of the custom object.
   * 
   * This is used only if there is any initial instances.
   * 
   * \see EventsBasedObject::GetInitialInstances
   */
  int GetAreaMinZ() const {
    return defaultVariant.GetAreaMinZ();
  }

  /**
   * \brief Set the min Z bound of the custom object.
   */
  void SetAreaMinZ(int areaMinZ) {
    defaultVariant.SetAreaMinZ(areaMinZ);
  }

  /**
   * \brief Get the right bound of the custom object.
   * 
   * This is used only if there is any initial instances.
   * 
   * \see EventsBasedObject::GetInitialInstances
   */
  int GetAreaMaxX() const {
    return defaultVariant.GetAreaMaxX();
  }

  /**
   * \brief Set the right bound of the custom object.
   */
  void SetAreaMaxX(int areaMaxX) {
    defaultVariant.SetAreaMaxX(areaMaxX);
  }

  /**
   * \brief Get the bottom bound of the custom object.
   * 
   * This is used only if there is any initial instances.
   * 
   * \see EventsBasedObject::GetInitialInstances
   */
  int GetAreaMaxY() const {
    return defaultVariant.GetAreaMaxY();
  }

  /**
   * \brief Set the bottom bound of the custom object.
   */
  void SetAreaMaxY(int areaMaxY) {
    defaultVariant.SetAreaMaxY(areaMaxY);
  }

  /**
   * \brief Get the max Z bound of the custom object.
   * 
   * This is used only if there is any initial instances.
   * 
   * \see EventsBasedObject::GetInitialInstances
   */
  int GetAreaMaxZ() const {
    return defaultVariant.GetAreaMaxZ();
  }

  /**
   * \brief Set the bottom bound of the custom object.
   */
  void SetAreaMaxZ(int areaMaxZ) {
    defaultVariant.SetAreaMaxZ(areaMaxZ);
  }
  ///@}
  
  /**
   * @brief Serialize the events-based object for an extension in an external file.
   * Variants are not serialized.
   */
  void SerializeToExternal(SerializerElement& element) const;

  void SerializeTo(SerializerElement& element) const override;

  void UnserializeFrom(gd::Project& project,
                       const SerializerElement& element) override;

  void UnserializeDefaultVariantFrom(gd::Project &project,
                                     const SerializerElement &element);

 private:
  gd::String defaultName;
  gd::String assetStoreTag;
  bool isRenderedIn3D;
  bool isAnimatable;
  bool isTextContainer;
  bool isInnerAreaFollowingParentSize;
  bool isUsingLegacyInstancesRenderer;
  gd::EventsBasedObjectVariant defaultVariant;
  gd::EventsBasedObjectVariantsContainer variants;
  gd::BehaviorsContainer behaviors;
  gd::VariablesContainer variables;
};

}  // namespace gd
