/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef EVENT_H
#define EVENT_H

#if defined(GD_IDE_ONLY)
#include <wx/dcbuffer.h> //This include file must be placed first
#include <boost/weak_ptr.hpp>
class Scene;
class Game;
class MainEditorCommand;
class wxWindow;
#endif
#include <iostream>
#include <vector>
#include <string>
#include <cmath>
#include <vector>
#include <boost/shared_ptr.hpp>
#include <boost/tuple/tuple.hpp>
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
        virtual ~BaseEvent();
        virtual BaseEventSPtr Clone() { return boost::shared_ptr<BaseEvent>(new BaseEvent(*this));}

        /**
         * Generate event's code.
         */
        virtual std::string GenerateEventCode(const RuntimeScene & scene) {return "";};

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
         * Set if the event if disabled or not
         */
        void SetDisabled(bool disable = true) { disabled = disable; }

        /**
         * True if event is disabled
         */
        bool IsDisabled() const { return disabled; }

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

        #if defined(GD_IDE_ONLY)
        /**
         * Save event to XML
         */
        virtual void SaveToXml(TiXmlElement * eventElem) const {}
        #endif

        /**
         * Load event from XML
         */
        virtual void LoadFromXml(const TiXmlElement * eventElem) {}

        std::string GetType() const { return type; };
        void SetType(std::string type_) { type = type_; };

#if defined(GD_IDE_ONLY)
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

        boost::weak_ptr<BaseEvent> originalEvent; ///< Pointer only used for profiling events, so as to remember the original event from which it has been copied.
        unsigned long int totalTimeDuringLastSession; ///< Total time used by the event during the last run. Used for profiling.
        float percentDuringLastSession; ///< Total time used by the event during the last run. Used for profiling.

    protected:
        mutable unsigned int    renderedHeight;
#endif

    private:
        bool disabled; ///<True if the event is disabled and must not be executed
        string type; ///<Type of the event. Must be assigned at the creation. Used for saving the event for instance.

        static vector <BaseEventSPtr> badSubEvents;
};

#if defined(GD_IDE_ONLY)
/**
 * Clone an event and insert a reference to the original event into the newly created event.
 * Used for profiling events for example.
 */
BaseEventSPtr CloneRememberingOriginalEvent(BaseEventSPtr event);
#endif

/**
 * Helper function for copying vector of shared_ptr of events
 */
std::vector < BaseEventSPtr > GD_API CloneVectorOfEvents(const vector < BaseEventSPtr > & events);

#endif // EVENT_H
