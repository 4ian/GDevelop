/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef SCENENAMEMANGLER_H
#define SCENENAMEMANGLER_H
#include <unordered_map>
#include "GDCore/String.h"

namespace gd {

/**
 * \brief Mangle the name of a scene, so that it can be used in code or file
 * names.
 *
 * \ingroup IDE
 */
class GD_CORE_API SceneNameMangler {
 public:
  /**
   * \brief Mangle the name of a scene, replacing all characters that are not
   * 0-9, a-z or A-Z by "_"+UnicodeCodePointOfTheCharacter. The first character
   * must be a letter, otherwise it is also replaced in the same manner.
   *
   * The mangled name is memoized as this is intensively used during project
   * export and events code generation.
   */
  const gd::String& GetMangledSceneName(const gd::String& sceneName);

  static SceneNameMangler* Get();
  static void DestroySingleton();

 private:
  SceneNameMangler(){};
  virtual ~SceneNameMangler(){};
  static SceneNameMangler* _singleton;

  std::unordered_map<gd::String, gd::String>
      mangledSceneNames;  ///< Memoized results of mangling
};

}  // namespace gd

#endif  // SCENENAMEMANGLER_H
