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
#include <vector>
#include <boost/shared_ptr.hpp>
/*#include <boost/serialization/vector.hpp>
#include <boost/serialization/shared_ptr.hpp>
#include <boost/serialization/nvp.hpp>
#include <boost/serialization/export.hpp>*/
#include "GDL/Log.h"
#include "GDL/Instruction.h"
class RuntimeScene;
class ObjectsConcerned;
class Instruction;
class Evaluateur;
class TiXmlElement;
class Game;

#if defined(GDE)
#include <wx/dcbuffer.h>
class Scene;
class Game;
class MainEditorCommand;
class wxWindow;
#endif

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
        virtual void Execute( RuntimeScene & scene, ObjectsConcerned & objectsConcerned ) {return;};

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

        std::string GetType() const { return type; };
        void SetType(std::string type_) { type = type_; };

#if defined(GDE)
        /**
         * Called by event editor to draw the event.
         */
        virtual void Render(wxBufferedPaintDC & dc, int x, int y, unsigned int width) const {return;}

        /**
         * Must return the height of the event when rendered
         */
        virtual unsigned int GetRenderedHeight(unsigned int width) const {return 0;};

        /**
         * Called when user click on the event
         */
        virtual void OnSingleClick(int x, int y, vector < boost::tuple< vector < BaseEventSPtr > *, unsigned int, vector < Instruction > *, unsigned int > > & eventsSelected,
                                 bool & conditionsSelected, bool & instructionsSelected) {};

        /**
         * Called when the user want to edit the event
         */
        virtual void EditEvent(wxWindow* parent_, Game & game_, Scene & scene_, MainEditorCommand & mainEditorCommand_) {};

        bool            selected;
        mutable bool    eventHeightNeedUpdate; ///<Automatically set to true/false by the events editor

    protected:
        mutable unsigned int    renderedHeight;
#endif

    private:
        string type; ///<Type of the event. Must be assigned at the creation. Used for saving the event for instance.

        static vector <BaseEventSPtr> badSubEvents;

        friend class boost::serialization::access;

        /**
         * Serialize
         */
        template<class Archive>
        void serialize(Archive& ar, const unsigned int version){
            ar & BOOST_SERIALIZATION_NVP(type);
        }
};

/*BOOST_SERIALIZATION_SHARED_PTR(BaseEvent)
BOOST_CLASS_EXPORT_KEY(BaseEvent)*/

/**
 * Helper function for copying vector of shared_ptr of events
 */
std::vector < BaseEventSPtr > GD_API CloneVectorOfEvents(const vector < BaseEventSPtr > & events);

#endif // EVENT_H
