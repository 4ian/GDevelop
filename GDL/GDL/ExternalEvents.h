/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef EXTERNALEVENTS_H
#define EXTERNALEVENTS_H
#include <string>
#include "GDL/Event.h"

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
        inline string GetName() const {return name;};

        /**
         * Change external events name
         */
        inline void SetName(string name_) {name = name_;};

        vector < BaseEventSPtr > events; ///< List of events

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
struct ExternalEventsHasName : public std::binary_function<boost::shared_ptr<ExternalEvents>, string, bool> {
    bool operator()(const boost::shared_ptr<ExternalEvents> & externalEvents, string name) const { return externalEvents->GetName() == name; }
};

#endif // EXTERNALEVENTS_H
