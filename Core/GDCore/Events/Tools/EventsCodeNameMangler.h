/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY)
#ifndef EVENTSCODENAMEMANGLER_H
#define EVENTSCODENAMEMANGLER_H
#include <unordered_map>
#include "GDCore/String.h"

/**
 * \brief Mangle object names, so as to ensure all names used in code are valid.
 *
 * \see ManObjListName
 */
class GD_CORE_API EventsCodeNameMangler {
 public:
  /**
   * Get the mangled name from a name: All characters that are not 0-9, a-z,
   * A-Z or _ are replaced by "_"+AsciiCodeOfTheCharacter.
   *
   * The mangled name is memoized as this is intensively used during project
   * export and events code generation.
   */
  const gd::String &GetMangledObjectsListName(
      const gd::String &originalObjectName);

  /**
   * Get the mangled function name to be used to call external events named \a
   * externalEventsName.
   *
   * The mangled name is memoized as this is intensively used during project
   * export and events code generation.
   */
  const gd::String &GetExternalEventsFunctionMangledName(
      const gd::String &externalEventsName);

  static gd::String GetMangledName(const gd::String &name);

  static EventsCodeNameMangler *Get();
  static void DestroySingleton();

 private:
  EventsCodeNameMangler(){};
  virtual ~EventsCodeNameMangler(){};
  static EventsCodeNameMangler *_singleton;

  // This method is inlined to avoid to copy the returned string.
  static inline gd::String GetMangledNameWithForbiddenUnderscore(const gd::String &name);

  std::unordered_map<gd::String, gd::String>
      mangledObjectNames;  ///< Memoized results of mangling for objects
  std::unordered_map<gd::String, gd::String>
      mangledExternalEventsNames;  ///< Memoized results of mangling for
                                   /// external events
};

/**
 * Shortcut for
 * `EventsCodeNameMangler::Get()->GetMangledObjectsListName(objectName)`.
 *
 * \see EventsCodeNameMangler
 * \return Mangled object name
 */
const gd::String &GD_CORE_API ManObjListName(const gd::String &objectName);

#endif  // EVENTSCODENAMEMANGLER_H
#endif
