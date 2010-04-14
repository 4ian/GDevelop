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
#include <boost/shared_ptr.hpp>
#include "Event.h"
class RuntimeScene;
class ObjectsConcerned;
class Instruction;
class Evaluateur;
class TiXmlElement;

class StandardEvent : public BaseEvent
{
    public:
        StandardEvent();
        StandardEvent(const StandardEvent & event);
        virtual ~StandardEvent() {};

        StandardEvent& operator=(const StandardEvent & event);
        virtual BaseEventSPtr Clone() { return boost::shared_ptr<BaseEvent>(new StandardEvent(*this));}

        virtual bool IsExecutable() const {return true;}
        virtual void Execute( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Evaluateur & eval );

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

        virtual void SaveToXml(TiXmlElement * eventElem) const;
        virtual void LoadFromXml(const TiXmlElement * eventElem);

    private:
        void Init(const StandardEvent & event);
        bool ExecuteConditions( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Evaluateur & eval );
        void ExecuteActions( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Evaluateur & eval );

        vector < Instruction > conditions;
        vector < Instruction > actions;
        vector < BaseEventSPtr > events;

#ifdef GDE
        virtual void RenderInBitmap() const;

        int GetConditionsHeight() const;
        int GetActionsHeight() const;
#endif
};

#endif // STANDARDEVENT_H
