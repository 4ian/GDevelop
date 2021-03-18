/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY)
#include "LayoutEditorCanvasOptions.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Serialization/SerializerElement.h"

namespace gd {

LayoutEditorCanvasOptions::LayoutEditorCanvasOptions()
    : grid(false),
      snap(true),
      gridWidth(32),
      gridHeight(32),
      gridOffsetX(0),
      gridOffsetY(0),
      gridType("retangular"),
      gridR(158),
      gridG(180),
      gridB(255),
      zoomFactor(1),
      windowMask(false) {}

void LayoutEditorCanvasOptions::SerializeTo(SerializerElement& element) const {
  element.SetAttribute("grid", grid);
  element.SetAttribute("snap", snap);
  element.SetAttribute("gridWidth", gridWidth);
  element.SetAttribute("gridHeight", gridHeight);
  element.SetAttribute("gridOffsetX", gridOffsetX);
  element.SetAttribute("gridOffsetY", gridOffsetY);
  element.SetAttribute("gridType", gridType);
  element.SetAttribute("gridR", gridR);
  element.SetAttribute("gridG", gridG);
  element.SetAttribute("gridB", gridB);
  element.SetAttribute("zoomFactor", zoomFactor);
  element.SetAttribute("windowMask", windowMask);
}

void LayoutEditorCanvasOptions::UnserializeFrom(
    const SerializerElement& element) {
  grid = element.GetBoolAttribute("grid");
  snap = element.GetBoolAttribute("snap");
  windowMask = element.GetBoolAttribute("windowMask");
  gridWidth = element.GetDoubleAttribute("gridWidth", 32);
  gridHeight = element.GetDoubleAttribute("gridHeight", 32);
  gridOffsetX = element.GetDoubleAttribute("gridOffsetX", 0);
  gridOffsetY = element.GetDoubleAttribute("gridOffsetY", 0);
  gridType = element.GetStringAttribute("gridType", "rectangular");
  gridR = element.GetIntAttribute("gridR", 158);
  gridG = element.GetIntAttribute("gridG", 180);
  gridB = element.GetIntAttribute("gridB", 255);
  zoomFactor = element.GetDoubleAttribute("zoomFactor", 1.0);
}

}  // namespace gd
#endif
