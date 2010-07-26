/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef STANDARDEVENT_H
#define STANDARDEVENT_H
#if defined(GDE)
#include <wx/bitmap.h>
#include <wx/dcbuffer.h>
#include <wx/html/htmprint.h>
#endif
/*#include <boost/shared_ptr.hpp>
#include <boost/serialization/export.hpp>
#include <boost/serialization/vector.hpp>
#include <boost/serialization/shared_ptr.hpp>
#include <boost/serialization/nvp.hpp>*/
#include "Event.h"
class RuntimeScene;
class ObjectsConcerned;
class Instruction;
class Evaluateur;
class TiXmlElement;

class GD_API StandardEvent : public BaseEvent
{
    public:
        StandardEvent();
        StandardEvent(const StandardEvent & event);
        virtual ~StandardEvent() {};

        StandardEvent& operator=(const StandardEvent & event);
        virtual BaseEventSPtr Clone() { return boost::shared_ptr<BaseEvent>(new StandardEvent(*this));}

        virtual bool IsExecutable() const {return true;}
        virtual void Execute( RuntimeScene & scene, ObjectsConcerned & objectsConcerned );

        virtual bool CanHaveSubEvents() const {return true;}
        virtual const vector < BaseEventSPtr > & GetSubEvents() const {return events;};
        virtual vector < BaseEventSPtr > & GetSubEvents() {return events;};
        void SetSubEvents(vector < BaseEventSPtr > & subEvents_) {events = subEvents_;};

        const vector < Instruction > & GetConditions() const { return conditions; };
        vector < Instruction > & GetConditions() { return conditions; };
        void SetConditions(vector < Instruction > & conditions_) { conditions = conditions_; };
        const vector < Instruction > & GetActions() const { return actions; };
        vector < Instruction > & GetActions() { return actions; };
        void SetActions(vector < Instruction > & actions_) { actions = actions_; };

        virtual vector < vector<Instruction>* > GetAllConditionsVectors();
        virtual vector < vector<Instruction>* > GetAllActionsVectors();

        #if defined(GDE)
        virtual void SaveToXml(TiXmlElement * eventElem) const;
        #endif
        virtual void LoadFromXml(const TiXmlElement * eventElem);

#if defined(GDE)
        /**
         * Called by event editor to draw the event.
         */
        virtual void Render(wxBufferedPaintDC & dc, int x, int y, unsigned int width) const;

        /**
         * Must return the height of the event when rendered
         */
        virtual unsigned int GetRenderedHeight(unsigned int width) const;

        /**
         * Called when user click on the event
         */
        virtual void OnSingleClick(int x, int y, vector < boost::tuple< vector < BaseEventSPtr > *, unsigned int, vector < Instruction > *, unsigned int > > & eventsSelected,
                                 bool & conditionsSelected, bool & instructionsSelected);
#endif

    private:
        void Init(const StandardEvent & event);
        bool ExecuteConditions( RuntimeScene & scene, ObjectsConcerned & objectsConcerned );
        void ExecuteActions( RuntimeScene & scene, ObjectsConcerned & objectsConcerned );

        vector < Instruction > conditions;
        vector < Instruction > actions;
        vector < BaseEventSPtr > events;

        friend class boost::serialization::access;

        /**
         * Serialize
         */
        template<class Archive>
        void serialize(Archive& ar, const unsigned int version);
};

/*BOOST_SERIALIZATION_SHARED_PTR(StandardEvent)
BOOST_CLASS_EXPORT_KEY(StandardEvent)*/


#endif // STANDARDEVENT_H
