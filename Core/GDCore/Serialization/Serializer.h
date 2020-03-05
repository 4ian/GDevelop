/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef GDCORE_SERIALIZER_H
#define GDCORE_SERIALIZER_H
#include <string>
#include "GDCore/Serialization/SerializerElement.h"
class TiXmlElement;

namespace gd {

/**
 * \brief The class used to save/load projects and GDCore classes
 * from/to XML or JSON.
 */
class GD_CORE_API Serializer {
 public:
/** \name XML serialization.
 * Serialize a SerializerElement from/to XML.
 */
///@{
#if !defined(EMSCRIPTEN)
  static void ToXML(SerializerElement& element, TiXmlElement* xmlElement);
  static void FromXML(SerializerElement& element,
                      const TiXmlElement* xmlElement);
#endif
  /**
   * \brief Escape a string for inclusion in a XML tag
   */
  static gd::String ToEscapedXMLString(const gd::String& str);
  ///@}

  /** \name JSON serialization.
   * Serialize a SerializerElement from/to JSON.
   */
  ///@{
  /**
   * \brief Serialize a gd::SerializerElement to a JSON string.
   */
  static gd::String ToJSON(const SerializerElement& element);

  static SerializerElement FromJSON(const std::string& json);

  /**
   * \brief Parse a JSON string and returns a gd::SerializerElement for it.
   */
  static SerializerElement FromJSON(const gd::String& json) {
    return FromJSON(json.ToUTF8());
  }
  ///@}

  virtual ~Serializer(){};

 private:
  Serializer(){};
};

}  // namespace gd

#endif
