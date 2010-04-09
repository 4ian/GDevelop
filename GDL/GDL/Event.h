/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef EVENT_H
#define EVENT_H

#include <iostream>
#include <vector>
#include <string>
#include <cmath>
#include "GDL/Log.h"
#include "GDL/Instruction.h"
class RuntimeScene;
class ObjectsConcerned;
class Instruction;
class Evaluateur;
class TiXmlElement;
class Game;

class BaseEvent;
typedef boost::shared_ptr<BaseEvent> BaseEventSPtr;

/**
 * @brief An event is an item of an event list.
 * Events are not instance of Base Event, but instance of a derived class.
 */
class GD_API BaseEvent
{
    public:
        BaseEvent();
        virtual ~BaseEvent() {};
        virtual BaseEventSPtr Clone() { return boost::shared_ptr<BaseEvent>(new BaseEvent(*this));}

        /**
         * Call when the event has to be executed. Redefined by derived class.
         */
        virtual void Execute( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Evaluateur & eval ) {return;};

        /**
         * Derived class have to redefine this function, so as to return true, if they are executable.
         */
        virtual bool IsExecutable() const {return false;};

        /**
         * Derived class have to redefine this function, so as to return true, if they have sub events.
         */
        virtual bool CanHaveSubEvents() const {return false;}

        /**
         * Return the sub events, if applicable.
         */
        virtual const vector < BaseEventSPtr > & GetSubEvents() const {return badSubEvents;};

        /**
         * Return the sub events, if applicable.
         */
        virtual vector < BaseEventSPtr > & GetSubEvents() {return badSubEvents;};

        /**
         * Event must be able to return all conditions vector they have.
         * Used to preprocess the conditions.
         */
        virtual vector < vector<Instruction>* > GetAllConditionsVectors() { vector < vector<Instruction>* > noConditions; return noConditions; };

        /**
         * Event must be able to return all actions vector they have.
         * Used to preprocess the actions.
         */
        virtual vector < vector<Instruction>* > GetAllActionsVectors() { vector < vector<Instruction>* > noActions; return noActions; };

        /**
         * Event must be able to return all expressions they have.
         * Used to preprocess the expressions.
         */
        virtual vector < GDExpression* > GetAllExpressions() { vector < GDExpression* > noExpr; return noExpr;};

        /**
         * Save event to XML
         */
        virtual void SaveToXml(TiXmlElement * eventElem) const {}

        /**
         * Load event from XML
         */
        virtual void LoadFromXml(const TiXmlElement * eventElem) {}

        /**
         * Called when a scene is loaded.
         */
        virtual void Preprocess(const Game & game, RuntimeScene & scene, std::vector < BaseEventSPtr > & eventList, unsigned int indexOfTheEventInThisList) {};

#ifdef GDE
        mutable bool conditionsHeightNeedUpdate;
        mutable unsigned int conditionsHeight;
        mutable bool actionsHeightNeedUpdate;
        mutable unsigned int actionsHeight;
        bool selected;
#endif

        std::string GetType() const { return type; };
        void SetType(std::string type_) { type = type_; };

    private:
        string type; ///<Type of the event. Must be assigned at the creation. Used for saving the event for instance.

        static vector <BaseEventSPtr> badSubEvents;
};



#endif // EVENT_H
