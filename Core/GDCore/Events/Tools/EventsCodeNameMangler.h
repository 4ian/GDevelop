/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY)
#ifndef EVENTSCODENAMEMANGLER_H
#define EVENTSCODENAMEMANGLER_H
#include "GDCore/String.h"

/**
 * Manage name mangling, so as to ensure all names used in code are valid.
 *
 * \see ManObjListName
 */
class GD_CORE_API EventsCodeNameMangler
{
public:

    /**
     * Get the mangled name from a name : All characters that are not 0-9, a-z, A-Z or _ are replaced by "_"+AsciiCodeOfTheCharacter.
     */
    gd::String GetMangledObjectsListName(const gd::String & originalObjectName);

    /**
     * Get the mangled function name to be used to call external events named \a externalEventsName.
     */
    gd::String GetExternalEventsFunctionMangledName(const gd::String & externalEventsName);

    static EventsCodeNameMangler *Get();
    static void DestroySingleton();

private:
    EventsCodeNameMangler() {};
    virtual ~EventsCodeNameMangler() {};
    static EventsCodeNameMangler *_singleton;
};

/**
 * Shortcut to EventsCodeNameMangler::Get()->GetMangledObjectsListName(objectName).
 * \see EventsCodeNameMangler
 * \return Mangled object name
 */
gd::String GD_CORE_API ManObjListName(const gd::String & objectName);

#endif // EVENTSCODENAMEMANGLER_H
#endif

