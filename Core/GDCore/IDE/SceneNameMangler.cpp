/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "SceneNameMangler.h"
#include "GDCore/CommonTools.h"
#include "GDCore/String.h"

namespace gd {

SceneNameMangler *SceneNameMangler::_singleton = nullptr;

const gd::String &SceneNameMangler::GetMangledSceneName(
    const gd::String &sceneName) {
  auto it = mangledSceneNames.find(sceneName);
  if (it != mangledSceneNames.end()) {
    return it->second;
  }

  gd::String partiallyMangledName = sceneName;
  static const gd::String alwaysAllowedCharacters =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  static const gd::String allowedExceptFirstCharacters = "0123456789";

  for (size_t i = 0; i < partiallyMangledName.size();
       ++i)  // Replace all unallowed letter by an underscore and the unicode
             // code point of the letter
  {
    if (alwaysAllowedCharacters.find_first_of(
            std::u32string(1, partiallyMangledName[i])) == gd::String::npos &&
        (i == 0 ||
         allowedExceptFirstCharacters.find(
             std::u32string(1, partiallyMangledName[i])) == gd::String::npos)) {
      char32_t unallowedChar = partiallyMangledName[i];
      partiallyMangledName.replace(i, 1, "_" + gd::String::From(unallowedChar));
    }
  }

  mangledSceneNames[sceneName] = partiallyMangledName;
  return mangledSceneNames[sceneName];
}

SceneNameMangler *SceneNameMangler::Get() {
  if (nullptr == _singleton) _singleton = new SceneNameMangler;

  return (static_cast<SceneNameMangler *>(_singleton));
}

void SceneNameMangler::DestroySingleton() {
  if (nullptr != _singleton) {
    delete _singleton;
    _singleton = nullptr;
  }
}

}  // namespace gd
