/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef BEHAVIORSSHAREDDATA_H
#define BEHAVIORSSHAREDDATA_H

#include <map>
#include <memory>
#include "GDCore/String.h"
class BehaviorsRuntimeSharedData;
namespace gd {
class SerializerElement;
class PropertyDescriptor;
class Project;
class Layout;
}  // namespace gd

namespace gd {

/**
 * \brief Base class for defining data shared by behaviors having the same type
 * and name.
 *
 * Behaviors can use shared data, as if they were extending the gd::Layout
 * class.
 *
 * \ingroup GameEngine
 */
class GD_CORE_API BehaviorsSharedData {
 public:
  BehaviorsSharedData(){};
  virtual ~BehaviorsSharedData();
  virtual gd::BehaviorsSharedData* Clone() const {
    return new BehaviorsSharedData(*this);
  }

  /**
   * \brief Return the name identifying the type of the behavior
   */
  gd::String GetTypeName() { return type; }

  /**
   * \brief Change name identifying the type of the behavior.
   */
  void SetTypeName(const gd::String& type_) { type = type_; };

#if defined(GD_IDE_ONLY)
  /**
   * \brief Called when the IDE wants to know about the properties of the shared
   data.
   *
   * Usage example:
   \code
      std::map<gd::String, gd::PropertyDescriptor> properties;
      properties[_("Initial speed")].SetValue(gd::String::From(initialSpeed));

      return properties;
   \endcode
   *
   * \return a std::map with properties names as key.
   * \see gd::PropertyDescriptor
   */
  virtual std::map<gd::String, gd::PropertyDescriptor> GetProperties(
      const gd::SerializerElement& behaviorSharedDataContent) const;

  /**
   * \brief Called when the IDE wants to update a property of the shared data
   *
   * \return false if the new value cannot be set
   * \see gd::InitialInstance
   */
  virtual bool UpdateProperty(gd::SerializerElement& behaviorSharedDataContent,
                              const gd::String& name,
                              const gd::String& value) {
    return false;
  };
#endif

  virtual void InitializeContent(
      gd::SerializerElement& behaviorSharedDataContent){};

 private:
  gd::String type;  ///< The type indicate of which type is the behavior.
};

}  // namespace gd

#endif  // BEHAVIORSSHAREDDATA_H
