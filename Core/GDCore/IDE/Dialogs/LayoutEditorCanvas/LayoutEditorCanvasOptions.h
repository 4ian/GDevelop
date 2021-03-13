/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY)
#ifndef SCENECANVASSETTINGS_H
#define SCENECANVASSETTINGS_H
#include "GDCore/String.h"
namespace gd {
class SerializerElement;
}

namespace gd {

/**
 * \brief Tool class used to store settings of a LayoutEditorCanvas.
 *
 * \see Scene
 */
class GD_CORE_API LayoutEditorCanvasOptions {
 public:
  LayoutEditorCanvasOptions();
  virtual ~LayoutEditorCanvasOptions(){};

  /** \name Serialization
   */
  ///@{

  /**
   * \brief Serialize instances container.
   */
  void SerializeTo(SerializerElement& element) const;

  /**
   * \brief Unserialize the instances container.
   */
  void UnserializeFrom(const SerializerElement& element);
  ///@}

  bool grid;         ///< True if grid activated in editor
  bool snap;         ///< True if snap to grid activated in editor
  int gridWidth;     ///< Grid width in editor
  int gridHeight;    ///< Grid height in editor
  int gridOffsetX;   ///< Grid X offset
  int gridOffsetY;   ///< Grid Y offset
  int gridR;         ///< Grid red color in editor
  int gridG;         ///< Grid green color in editor
  int gridB;         ///< Grid blue color in editor
  double zoomFactor;  ///< Stores the zoom factor
  bool windowMask;   ///< True if window mask displayed in editor
};

}  // namespace gd

#endif  // SCENECANVASSETTINGS_H
#endif
