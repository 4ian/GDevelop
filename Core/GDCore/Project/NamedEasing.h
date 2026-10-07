/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include "GDCore/String.h"

namespace gd {
class SerializerElement;
}

namespace gd {

/**
 * \brief A named cubic-bezier easing curve attached to a project or an events
 * based extension.
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API NamedEasing {
 public:
  NamedEasing();
  virtual ~NamedEasing(){};

  NamedEasing* Clone() const { return new NamedEasing(*this); };

  const gd::String& GetName() const { return name; };
  void SetName(const gd::String& name_) { name = name_; };

  double GetX1() const { return x1; };
  void SetX1(double x1_) { x1 = x1_; };
  double GetY1() const { return y1; };
  void SetY1(double y1_) { y1 = y1_; };
  double GetX2() const { return x2; };
  void SetX2(double x2_) { x2 = x2_; };
  double GetY2() const { return y2; };
  void SetY2(double y2_) { y2 = y2_; };

  void SerializeTo(SerializerElement& element) const;
  void UnserializeFrom(const SerializerElement& element);

 private:
  gd::String name;
  double x1 = 0;
  double y1 = 0;
  double x2 = 1;
  double y2 = 1;
};

}  // namespace gd
