/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */
#if defined(GD_IDE_ONLY)
#ifndef EVENTSCODENAMEMANGLER_H
#define EVENTSCODENAMEMANGLER_H
#include <string>

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
    std::string GetMangledObjectsListName(const std::string & originalObjectName);

    /**
     * Get the mangled function name to be used to call external events named \a externalEventsName.
     */
    std::string GetExternalEventsFunctionMangledName(const std::string & externalEventsName);

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
std::string GD_CORE_API ManObjListName(const std::string & objectName);

#endif // EVENTSCODENAMEMANGLER_H
#endif

