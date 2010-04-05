/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef FOREACHEVENT_H
#define FOREACHEVENT_H
#include <boost/shared_ptr.hpp>
#include "Event.h"
class RuntimeScene;
class ObjectsConcerned;
class Instruction;
class Evaluateur;
class TiXmlElement;

/**
 * Foreach event is a standard event that pick an object of a list each time it is repeated
 */
class ForEachEvent : public BaseEvent
{
    public:
        ForEachEvent() : objectsToPick("") {};
        ForEachEvent(const ForEachEvent & event);
        virtual ~ForEachEvent() {};

        ForEachEvent& operator=(const ForEachEvent & event);
        virtual BaseEventSPtr Clone() { return boost::shared_ptr<BaseEvent>(new ForEachEvent(*this));}

        virtual bool IsExecutable() const {return true;}
        virtual void Execute( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Evaluateur & eval );

        virtual bool CanHaveSubEvents() const {return true;}
        virtual const vector < BaseEventSPtr > & GetSubEvents() const {return events;};
        virtual vector < BaseEventSPtr > & GetSubEvents() {return events;};

        const vector < Instruction > & GetConditions() const { return conditions; };
        vector < Instruction > & GetConditions() { return conditions; };
        const vector < Instruction > & GetActions() const { return actions; };
        vector < Instruction > & GetActions() { return actions; };

        virtual vector < vector<Instruction>* > GetAllConditionsVectors();
        virtual vector < vector<Instruction>* > GetAllActionsVectors();
        virtual vector < GDExpression* > GetAllExpressions();

        virtual void SaveToXml(TiXmlElement * eventElem) const;
        virtual void LoadFromXml(const TiXmlElement * eventElem);

    private:
        void Init(const ForEachEvent & event);
        bool ExecuteConditions( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Evaluateur & eval );
        void ExecuteActions( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Evaluateur & eval );

        GDExpression objectsToPick;
        vector < Instruction > conditions;
        vector < Instruction > actions;
        vector < BaseEventSPtr > events;
};

#endif // FOREACHEVENT_H
