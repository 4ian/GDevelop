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
 * Convert a gd::SerializerElement from/to XML.
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
   * Convert a gd::SerializerElement from/to JSON.
   * This uses RapidJSON for fast parsing and stringification.
   * See https://github.com/miloyip/nativejson-benchmark
   */
  ///@{
  /**
   * \brief Serialize a gd::SerializerElement to a JSON string.
   */
  static gd::String ToJSON(const SerializerElement& element);

  /**
   * \brief Construct a gd::SerializerElement from a JSON string.
   */
  static SerializerElement FromJSON(const char* json);

  /**
   * \brief Construct a gd::SerializerElement from a JSON string.
   */
  static SerializerElement FromJSON(const gd::String& json) {
    return FromJSON(json.c_str());
  }
  ///@}

  virtual ~Serializer(){};

 private:
  Serializer(){};
};

}  // namespace gd

#endif
