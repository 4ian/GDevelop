/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef SCENECANVASSETTINGS_H
#define SCENECANVASSETTINGS_H
#include "GDCore/String.h"
#include "GDCore/Serialization/SerializerElement.h"

namespace gd {

/**
 * \brief Container for arbitrary serialized data to be used by the editor
 * to store settings.
 *
 * \see Scene
 */
class GD_CORE_API EditorSettings {
 public:
  EditorSettings();
  virtual ~EditorSettings(){};

  /** \name Serialization
   */
  ///@{
  /**
   * \brief Serialize the settings.
   */
  void SerializeTo(SerializerElement& element) const;

  /**
   * \brief Unserialize the settings.
   */
  void UnserializeFrom(const SerializerElement& element);
  ///@}

private:
  gd::SerializerElement content; ///< Arbitrary content, depending on the editor.
};

}  // namespace gd

#endif  // SCENECANVASSETTINGS_H
