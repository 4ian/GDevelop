/*
 * GDevelop Core
 * Copyright 2008-2026 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#pragma once

#include <memory>
#include "GDCore/String.h"
namespace gd {
class SerializerElement;
class Project;
}

namespace gd {

/**
 * \brief A cinematic sequence allows to store keyframes, tracks and orchestrate
 * an animation or a cutscene that can be then read and played at runtime.
 */
class GD_CORE_API CinematicSequence {
 public:
  CinematicSequence(){};
  virtual ~CinematicSequence(){};

  /**
   * \brief Return a pointer to a new CinematicSequence constructed from this one.
   */
  CinematicSequence* Clone() const { return new CinematicSequence(*this); };

  /**
   * \brief Return the name of the cinematic sequence.
   */
  const gd::String& GetName() const { return name; }

  /**
   * \brief Change the name of the cinematic sequence.
   */
  void SetName(const gd::String& name_) { name = name_; }

  /**
   * \brief Get the serialized content of the sequence (JSON format)
   * managed by the IDE.
   */
  const gd::String& GetSequenceData() const { return sequenceData; }

  /**
   * \brief Change the serialized content of the sequence.
   */
  void SetSequenceData(const gd::String& data) { sequenceData = data; }

  /**
   * \brief Get the name of the layout last used to preview the cinematic sequence.
   */
  const gd::String& GetAssociatedLayout() const { return associatedLayout; }

  /**
   * \brief Set the name of the layout used to preview the cinematic sequence.
   */
  void SetAssociatedLayout(const gd::String& name) { associatedLayout = name; }

  /** \name Serialization
   */
  ///@{
  /**
   * \brief Serialize cinematic sequence.
   */
  void SerializeTo(SerializerElement& element) const;

  /**
   * \brief Unserialize the cinematic sequence.
   */
  void UnserializeFrom(gd::Project &project, const SerializerElement& element);
  ///@}

 private:
  gd::String name;
  gd::String sequenceData;    // JSON representation of Tracks/Keyframes
  gd::String associatedLayout; // Used to know in which layout we preview
};

}  // namespace gd
