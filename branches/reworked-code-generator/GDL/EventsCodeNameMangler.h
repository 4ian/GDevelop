/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef EVENTSCODENAMEMANGLER_H
#define EVENTSCODENAMEMANGLER_H
#include <string>

/**
 * Manage name mangling, so as to ensure all names used in code are valid.
 */
class GD_API EventsCodeNameMangler
{
public:

    /**
     * Get the mangled name from a name : All characters that are not 0-9, a-z, A-Z or _ are replaced by "_"+AsciiCodeOfTheCharacter.
     */
    std::string GetMangledObjectsListName(const std::string & originalObjectName);

    static EventsCodeNameMangler *GetInstance()
    {
        if ( NULL == _singleton )
        {
            _singleton = new EventsCodeNameMangler;
        }

        return ( static_cast<EventsCodeNameMangler*>( _singleton ) );
    }

    static void DestroySingleton()
    {
        if ( NULL != _singleton )
        {
            delete _singleton;
            _singleton = NULL;
        }
    }
private:
        EventsCodeNameMangler() {};
        virtual ~EventsCodeNameMangler() {};
        static EventsCodeNameMangler *_singleton;
};

/**
 * Shortcut to EventsCodeNameMangler::GetInstance()->GetMangledObjectsListName(objectName).
 * \return Mangled object name
 */
std::string GD_API ManObjListName(const std::string & objectName);

#endif // EVENTSCODENAMEMANGLER_H
