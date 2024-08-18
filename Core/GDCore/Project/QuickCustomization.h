#pragma once

namespace gd {
class QuickCustomization {
 public:
  enum Visibility {
    /** Visibility based on the parent or editor heuristics (probably visible). */
    Default,
    /** Visible in the quick customization editor. */
    Visible,
    /** Not visible in the quick customization editor. */
    Hidden
  };
};

}  // namespace gd