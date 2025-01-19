/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include <vector>
#include "GDCore/Project/AbstractEventsBasedEntity.h"
#include "GDCore/Project/ObjectsContainer.h"
#include "GDCore/Project/InitialInstancesContainer.h"
#include "GDCore/Project/LayersContainer.h"
#include "GDCore/String.h"
namespace gd {
class SerializerElement;
class Project;
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
  EventsBasedObject& SetName(const gd::String& name_) {
    AbstractEventsBasedEntity::SetName(name_);
    return *this;
  }

  /**
   * \brief Set the name of the object, to be displayed in the editor.
   */
  EventsBasedObject& SetFullName(const gd::String& fullName_) {
    AbstractEventsBasedEntity::SetFullName(fullName_);
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

  /** \name Layers
   */
  ///@{
  /**
   * \brief Get the layers of the custom object.
   */
  const gd::LayersContainer& GetLayers() const { return layers; }

  /**
   * \brief Get the layers of the custom object.
   */
  gd::LayersContainer& GetLayers() { return layers; }
  ///@}

  /** \name Child objects
   */
  ///@{
  /**
   * \brief Get the objects of the custom object.
   */
  gd::ObjectsContainer& GetObjects() {
    return objectsContainer;
  }

  /**
   * \brief Get the objects of the custom object.
   */
  const gd::ObjectsContainer& GetObjects() const {
    return objectsContainer;
  }
  ///@}

  /** \name Instances
   */
  ///@{
  /**
   * \brief Get the instances of the custom object.
   */
  gd::InitialInstancesContainer& GetInitialInstances() {
    return initialInstances;
  }

  /**
   * \brief Get the instances of the custom object.
   */
  const gd::InitialInstancesContainer& GetInitialInstances() const {
    return initialInstances;
  }

  /**
   * \brief Get the left bound of the custom object.
   * 
   * This is used only if there is any initial instances.
   * 
   * \see EventsBasedObject::GetInitialInstances
   */
  int GetAreaMinX() const {
    return areaMinX;
  }

  /**
   * \brief Set the left bound of the custom object.
   */
  void SetAreaMinX(int areaMinX_) {
    areaMinX = areaMinX_;
  }

  /**
   * \brief Get the top bound of the custom object.
   * 
   * This is used only if there is any initial instances.
   * 
   * \see EventsBasedObject::GetInitialInstances
   */
  int GetAreaMinY() const {
    return areaMinY;
  }

  /**
   * \brief Set the top bound of the custom object.
   */
  void SetAreaMinY(int areaMinY_) {
    areaMinY = areaMinY_;
  }

  /**
   * \brief Get the min Z bound of the custom object.
   * 
   * This is used only if there is any initial instances.
   * 
   * \see EventsBasedObject::GetInitialInstances
   */
  int GetAreaMinZ() const {
    return areaMinZ;
  }

  /**
   * \brief Set the min Z bound of the custom object.
   */
  void SetAreaMinZ(int areaMinZ_) {
    areaMinZ = areaMinZ_;
  }

  /**
   * \brief Get the right bound of the custom object.
   * 
   * This is used only if there is any initial instances.
   * 
   * \see EventsBasedObject::GetInitialInstances
   */
  int GetAreaMaxX() const {
    return areaMaxX;
  }

  /**
   * \brief Set the right bound of the custom object.
   */
  void SetAreaMaxX(int areaMaxX_) {
    areaMaxX = areaMaxX_;
  }

  /**
   * \brief Get the bottom bound of the custom object.
   * 
   * This is used only if there is any initial instances.
   * 
   * \see EventsBasedObject::GetInitialInstances
   */
  int GetAreaMaxY() const {
    return areaMaxY;
  }

  /**
   * \brief Set the bottom bound of the custom object.
   */
  void SetAreaMaxY(int areaMaxY_) {
    areaMaxY = areaMaxY_;
  }

  /**
   * \brief Get the max Z bound of the custom object.
   * 
   * This is used only if there is any initial instances.
   * 
   * \see EventsBasedObject::GetInitialInstances
   */
  int GetAreaMaxZ() const {
    return areaMaxZ;
  }

  /**
   * \brief Set the bottom bound of the custom object.
   */
  void SetAreaMaxZ(int areaMaxZ_) {
    areaMaxZ = areaMaxZ_;
  }
  ///@}

  void SerializeTo(SerializerElement& element) const override;

  void UnserializeFrom(gd::Project& project,
                       const SerializerElement& element) override;

 private:
  gd::String defaultName;
  bool isRenderedIn3D;
  bool isAnimatable;
  bool isTextContainer;
  bool isInnerAreaFollowingParentSize;
  bool isUsingLegacyInstancesRenderer;
  gd::InitialInstancesContainer initialInstances;
  gd::LayersContainer layers;
  gd::ObjectsContainer objectsContainer;
  double areaMinX;
  double areaMinY;
  double areaMinZ;
  double areaMaxX;
  double areaMaxY;
  double areaMaxZ;
};

}  // namespace gd
