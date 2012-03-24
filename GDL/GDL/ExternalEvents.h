/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef EXTERNALEVENTS_H
#define EXTERNALEVENTS_H
#include <string>
#include <vector>
#include "GDCore/Events/Event.h"

/**
 * \brief Contains a list of events not directly linked to a scene.
 */
class GD_API ExternalEvents
{
    public:
        ExternalEvents();
        ExternalEvents(const ExternalEvents&);
        virtual ~ExternalEvents() {};
        ExternalEvents& operator=(const ExternalEvents & rhs);

        /**
         * Get external events name
         */
        inline std::string GetName() const {return name;};

        /**
         * Change external events name
         */
        inline void SetName(std::string name_) {name = name_;};

        std::vector < BaseEventSPtr > events; ///< List of events

    private:

        std::string name;

        /**
         * Initialize from another ExternalEvents. Used by copy-ctor and assign-op.
         * Don't forget to update me if members were changed !
         */
        void Init(const ExternalEvents & externalEvents);
};

//"Tool" Functions

/**
 * \brief Functor testing ExternalEvents' name
 */
struct ExternalEventsHasName : public std::binary_function<boost::shared_ptr<ExternalEvents>, std::string, bool> {
    bool operator()(const boost::shared_ptr<ExternalEvents> & externalEvents, std::string name) const { return externalEvents->GetName() == name; }
};

#endif // EXTERNALEVENTS_H
#endif
