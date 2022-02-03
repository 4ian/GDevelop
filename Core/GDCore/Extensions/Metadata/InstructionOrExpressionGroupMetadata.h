/*
 * GDevelop Core
 * Copyright 2008-2022 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once
#include "GDCore/String.h"

namespace gd {
/**
 * \brief Contains information about how to display a group of instructions
 * to the user.
 */
class GD_CORE_API InstructionOrExpressionGroupMetadata {
 public:
  InstructionOrExpressionGroupMetadata(){};

  /**
   * \brief Sets the icon shown to users.
   */
  InstructionOrExpressionGroupMetadata& SetIcon(const gd::String& icon_) {
    icon = icon_;
    return *this;
  };

  const gd::String& GetIcon() const { return icon; };

 private:
  gd::String icon;
};
}  // namespace gd
