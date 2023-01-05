/*
 * GDevelop Core
 * Copyright 2008-2018 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef GDCORE_WATERMARK_H
#define GDCORE_WATERMARK_H
#include "GDCore/String.h"
namespace gd {
class SerializerElement;
}

namespace gd {

/**
 * \brief Describe the content and set up of the watermark
 *
 * \see gd::Watermark
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API Watermark {
 public:
  Watermark();
  virtual ~Watermark(){};

  /**
   * \brief Return true if the GDevelop logo should be shown while loading
   * assets.
   */
  bool IsGDevelopWatermarkShown() const { return showWatermark; };

  /**
   * \brief Set if the GDevelop logo should be shown while loading assets.
   */
  Watermark& ShowGDevelopWatermark(bool show) {
    showWatermark = show;
    return *this;
  };

  const gd::String& GetPlacement() const { return placement; };

  Watermark& SetPlacement(const gd::String& value) {
    placement = value;
    return *this;
  }

  /** \name Saving and loading
   */
  ///@{
  /**
   * \brief Serialize the loading screen setup.
   */
  void SerializeTo(SerializerElement& element) const;

  /**
   * \brief Unserialize the loading screen setup.
   */
  void UnserializeFrom(const SerializerElement& element);
  ///@}

 private:
  bool showWatermark;
  gd::String placement;
};
}  // namespace gd

#endif  // GDCORE_WATERMARK_H
