/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef REPEATEVENT_H
#define REPEATEVENT_H
#include <boost/shared_ptr.hpp>
#include "Event.h"
class RuntimeScene;
class ObjectsConcerned;
class Instruction;
class Evaluateur;
class TiXmlElement;

/**
 * Repeat event is a standard event repeat a number of times
 */
class RepeatEvent : public BaseEvent
{
    public:
        RepeatEvent() : repeatNumberExpression("") {};
        RepeatEvent(const RepeatEvent & event);
        virtual ~RepeatEvent() {};

        RepeatEvent& operator=(const RepeatEvent & event);
        virtual BaseEventSPtr Clone() { return boost::shared_ptr<BaseEvent>(new RepeatEvent(*this));}

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
        void Init(const RepeatEvent & event);
        bool ExecuteConditions( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Evaluateur & eval );
        void ExecuteActions( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Evaluateur & eval );

        GDExpression repeatNumberExpression;
        vector < Instruction > conditions;
        vector < Instruction > actions;
        vector < BaseEventSPtr > events;
};

#endif // REPEATEVENT_H
