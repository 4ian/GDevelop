#ifndef EXTERNALEVENTS_H
#define EXTERNALEVENTS_H
#include <string>
#include "GDL/Event.h"

class GD_API ExternalEvents
{
    public:
        ExternalEvents();
        ExternalEvents(const ExternalEvents&);
        virtual ~ExternalEvents() {};
        ExternalEvents& operator=(const ExternalEvents & rhs);

        inline string GetName() const {return name;};
        inline void SetName(string name_) {name = name_;};

        vector < BaseEventSPtr > events;

    protected:
    private:

        std::string name;

        /**
         * Initialize from another ExternalEvents. Used by copy-ctor and assign-op.
         * Don't forget to update me if members were changed !
         */
        void Init(const ExternalEvents & externalEvents);

        friend class boost::serialization::access;

        template<class Archive>
        void serialize(Archive& ar, const unsigned int version){
            ar  & BOOST_SERIALIZATION_NVP(name)
                & BOOST_SERIALIZATION_NVP(events);
        }
};

//"Tool" Functions

/**
 * Functor testing ExternalEvents' name
 */
struct ExternalEventsHasName : public std::binary_function<boost::shared_ptr<ExternalEvents>, string, bool> {
    bool operator()(const boost::shared_ptr<ExternalEvents> & externalEvents, string name) const { return externalEvents->GetName() == name; }
};

#endif // EXTERNALEVENTS_H
