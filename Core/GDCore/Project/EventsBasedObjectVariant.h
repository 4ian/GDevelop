/*
 * GDevelop Core
 * Copyright 2008-2025 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include "GDCore/Project/InitialInstancesContainer.h"
#include "GDCore/Project/LayersContainer.h"
#include "GDCore/Project/ObjectsContainer.h"
#include "GDCore/String.h"
#include <vector>

namespace gd {
class SerializerElement;
class Project;
} // namespace gd

namespace gd {
/**
 * \brief Represents a variation of style of an events-based object.
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API EventsBasedObjectVariant {
public:
  EventsBasedObjectVariant();
  virtual ~EventsBasedObjectVariant();

  /**
   * \brief Return a pointer to a new EventsBasedObjectVariant constructed from
   * this one.
   */
  EventsBasedObjectVariant *Clone() const {
    return new EventsBasedObjectVariant(*this);
  };

  /**
   * \brief Get the name of the variant.
   */
  const gd::String &GetName() const { return name; };

  /**
   * \brief Set the name of the variant.
   */
  EventsBasedObjectVariant &SetName(const gd::String &name_) {
    name = name_;
    return *this;
  }

  /** \name Layers
   */
  ///@{
  /**
   * \brief Get the layers of the variant.
   */
  const gd::LayersContainer &GetLayers() const { return layers; }

  /**
   * \brief Get the layers of the variant.
   */
  gd::LayersContainer &GetLayers() { return layers; }
  ///@}

  /** \name Child objects
   */
  ///@{
  /**
   * \brief Get the objects of the variant.
   */
  gd::ObjectsContainer &GetObjects() { return objectsContainer; }

  /**
   * \brief Get the objects of the variant.
   */
  const gd::ObjectsContainer &GetObjects() const { return objectsContainer; }
  ///@}

  /** \name Instances
   */
  ///@{
  /**
   * \brief Get the instances of the variant.
   */
  gd::InitialInstancesContainer &GetInitialInstances() {
    return initialInstances;
  }

  /**
   * \brief Get the instances of the variant.
   */
  const gd::InitialInstancesContainer &GetInitialInstances() const {
    return initialInstances;
  }

  /**
   * \brief Get the left bound of the variant.
   *
   * This is used only if there is any initial instances.
   *
   * \see EventsBasedObjectVariant::GetInitialInstances
   */
  int GetAreaMinX() const { return areaMinX; }

  /**
   * \brief Set the left bound of the variant.
   */
  void SetAreaMinX(int areaMinX_) { areaMinX = areaMinX_; }

  /**
   * \brief Get the top bound of the variant.
   *
   * This is used only if there is any initial instances.
   *
   * \see EventsBasedObjectVariant::GetInitialInstances
   */
  int GetAreaMinY() const { return areaMinY; }

  /**
   * \brief Set the top bound of the variant.
   */
  void SetAreaMinY(int areaMinY_) { areaMinY = areaMinY_; }

  /**
   * \brief Get the min Z bound of the variant.
   *
   * This is used only if there is any initial instances.
   *
   * \see EventsBasedObjectVariant::GetInitialInstances
   */
  int GetAreaMinZ() const { return areaMinZ; }

  /**
   * \brief Set the min Z bound of the variant.
   */
  void SetAreaMinZ(int areaMinZ_) { areaMinZ = areaMinZ_; }

  /**
   * \brief Get the right bound of the variant.
   *
   * This is used only if there is any initial instances.
   *
   * \see EventsBasedObjectVariant::GetInitialInstances
   */
  int GetAreaMaxX() const { return areaMaxX; }

  /**
   * \brief Set the right bound of the variant.
   */
  void SetAreaMaxX(int areaMaxX_) { areaMaxX = areaMaxX_; }

  /**
   * \brief Get the bottom bound of the variant.
   *
   * This is used only if there is any initial instances.
   *
   * \see EventsBasedObjectVariant::GetInitialInstances
   */
  int GetAreaMaxY() const { return areaMaxY; }

  /**
   * \brief Set the bottom bound of the variant.
   */
  void SetAreaMaxY(int areaMaxY_) { areaMaxY = areaMaxY_; }

  /**
   * \brief Get the max Z bound of the variant.
   *
   * This is used only if there is any initial instances.
   *
   * \see EventsBasedObjectVariant::GetInitialInstances
   */
  int GetAreaMaxZ() const { return areaMaxZ; }

  /**
   * \brief Set the bottom bound of the variant.
   */
  void SetAreaMaxZ(int areaMaxZ_) { areaMaxZ = areaMaxZ_; }
  ///@}

  /** \brief Change the object asset store id of this variant.
   */
  void SetAssetStoreAssetId(const gd::String &assetStoreId_) {
    assetStoreAssetId = assetStoreId_;
  };

  /** \brief Return the object asset store id of this variant.
   */
  const gd::String &GetAssetStoreAssetId() const { return assetStoreAssetId; };

  /** \brief Change the original name of the variant in the asset.
   */
  void SetAssetStoreOriginalName(const gd::String &assetStoreOriginalName_) {
    assetStoreOriginalName = assetStoreOriginalName_;
  };

  /** \brief Return the original name of the variant in the asset.
   */
  const gd::String &GetAssetStoreOriginalName() const {
    return assetStoreOriginalName;
  };

  void SerializeTo(SerializerElement &element) const;

  void UnserializeFrom(gd::Project &project, const SerializerElement &element);

private:
  gd::String name;
  gd::InitialInstancesContainer initialInstances;
  gd::LayersContainer layers;
  gd::ObjectsContainer objectsContainer;
  double areaMinX;
  double areaMinY;
  double areaMinZ;
  double areaMaxX;
  double areaMaxY;
  double areaMaxZ;
  /**
   * The ID of the asset if the object comes from the store.
   */
  gd::String assetStoreAssetId;
  /**
   * The original name of the variant in the asset if the object comes from the
   * store.
   */
  gd::String assetStoreOriginalName;
};

} // namespace gd
