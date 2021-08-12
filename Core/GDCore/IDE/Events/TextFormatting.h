/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef TEXTFORMATTING_H
#define TEXTFORMATTING_H
#include "GDCore/String.h"

namespace gd {

/**
 * \brief Represents the style of a text displayed in the events editor.
 *
 * \see EventsRenderingHelper
 * \ingroup IDEDialogsEventsEditor
 */
class GD_CORE_API TextFormatting {
 public:
  TextFormatting() : userData(gd::String::npos) {}
  ~TextFormatting() {}

  /**
   * Return the data (an integer) associated with the text formatting.
   * Used to store the parameter when rendering instructions.
   */
  size_t GetUserData() const { return userData; }

  size_t userData;
};

}  // namespace gd

#endif  // TEXTFORMATTING_H
