/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_NEWNAMEGENERATOR_H
#define GDCORE_NEWNAMEGENERATOR_H
#include <functional>
namespace gd {
class String;
}

namespace gd {

/**
 * \brief Generate unique names.
 */
class GD_CORE_API NewNameGenerator {
 public:
  /**
   * \brief Generate a unique name, using the specified name and prefix as a
   * first attempt.
   */
  static gd::String Generate(const gd::String &name,
                             const gd::String &prefix,
                             std::function<bool(const gd::String &)> exists);

  /**
   * \brief Generate a unique name, using the specified name as a first attempt.
   */
  static gd::String Generate(const gd::String &name,
                             std::function<bool(const gd::String &)> exists);

 private:
  NewNameGenerator();
  ~NewNameGenerator();
};

}  // namespace gd

#endif  // GDCORE_NEWNAMEGENERATOR_H
