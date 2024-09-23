#pragma once

#include "GDCore/String.h"

namespace gd {
class QuickCustomization {
 public:
  enum Visibility {
    /** Visibility based on the parent or editor heuristics (probably visible).
     */
    Default,
    /** Visible in the quick customization editor. */
    Visible,
    /** Not visible in the quick customization editor. */
    Hidden
  };

  static Visibility StringAsVisibility(const gd::String& str) {
    if (str == "visible")
      return Visibility::Visible;
    else if (str == "hidden")
      return Visibility::Hidden;

    return Visibility::Default;
  }

  static gd::String VisibilityAsString(Visibility visibility) {
    if (visibility == Visibility::Visible)
      return "visible";
    else if (visibility == Visibility::Hidden)
      return "hidden";

    return "default";
  }
};

}  // namespace gd