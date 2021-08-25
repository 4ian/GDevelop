/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_NAMEDPROPERTYDESCRIPTOR
#define GDCORE_NAMEDPROPERTYDESCRIPTOR
#include <vector>
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/String.h"
namespace gd {
class SerializerElement;
}

namespace gd {

/**
 * \brief Used to describe a property shown in a property grid.
 * \see gd::Object
 */
class GD_CORE_API NamedPropertyDescriptor : public PropertyDescriptor {
 public:
  /**
   * \brief Empty constructor creating an empty property to be displayed.
   */
  NamedPropertyDescriptor(){};

  virtual ~NamedPropertyDescriptor();

  virtual NamedPropertyDescriptor* Clone() const {
    return new NamedPropertyDescriptor(*this);
  }

  /**
   * \brief Change the name of the property.
   * \note If the property is used in a list/vector, it's better
   * to use any rename method provided by it (as it can ensure uniqueness).
   */
  NamedPropertyDescriptor& SetName(gd::String newName) {
    name = newName;
    return *this;
  }

  /**
   * \brief Get the name of the property.
   */
  const gd::String& GetName() const { return name; }

  /** \name Serialization
   */
  ///@{
  /**
   * \brief Serialize the NamedPropertyDescriptor
   */
  void SerializeTo(SerializerElement& element) const;

  /**
   * \brief Unserialize the NamedPropertyDescriptor.
   */
  void UnserializeFrom(const SerializerElement& element);

  /**
   * \brief Serialize only the value and extra informations of the property.
   */
  virtual void SerializeValuesTo(SerializerElement& element) const;

  /**
   * \brief Unserialize only the value and extra information of the property.
   */
  virtual void UnserializeValuesFrom(const SerializerElement& element);
  ///@}

 private:
  gd::String name;  ///< The name of the property.
};

}  // namespace gd

#endif
