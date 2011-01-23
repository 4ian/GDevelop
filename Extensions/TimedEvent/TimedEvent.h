/**

Game Develop - Timed Event Extension
Copyright (c) 2011 Florian Rival (Florian.Rival@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/

#ifndef TIMEDEVENT_H
#define TIMEDEVENT_H
#include "GDL/Event.h"
#include <map>
#include "GDL/ManualTimer.h"
class RuntimeScene;
class ObjectsConcerned;
class Instruction;
class Evaluateur;
class TiXmlElement;

#if defined(GD_IDE_ONLY)
class Scene;
class MainEditorCommand;
class wxWindow;
#endif

/**
 * Timed event
 */
class TimedEvent : public BaseEvent
{
    public:
        TimedEvent();
        TimedEvent(const TimedEvent & event);
        virtual ~TimedEvent();

        TimedEvent& operator=(const TimedEvent & event);
        virtual BaseEventSPtr Clone() { return boost::shared_ptr<BaseEvent>(new TimedEvent(*this));}

        virtual bool IsExecutable() const {return true;}
        virtual void Execute( RuntimeScene & scene, ObjectsConcerned & objectsConcerned );

        virtual void Preprocess(const Game & game, RuntimeScene & scene, std::vector < BaseEventSPtr > & eventList, unsigned int indexOfTheEventInThisList);

        static std::map < const Scene* , std::map < std::string, TimedEvent* > > timedEventsList; ///< Static map containing all functions, associated with their game, scene and name
        void UnreferenceEvent();
        void ReferenceEvent(Scene *);

        void Reset() {timer.Reset();};

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

        string GetName() const { return name; };
        void SetName(string name_) { name = name_; };

        string GetTimeoutExpression() const { return timeout.GetPlainString(); };
        void SetTimeoutExpression(std::string timeout_) { timeout = GDExpression(timeout_); };

        virtual vector < vector<Instruction>* > GetAllConditionsVectors();
        virtual vector < vector<Instruction>* > GetAllActionsVectors();
        virtual vector < GDExpression* > GetAllExpressions();

        #if defined(GD_IDE_ONLY)
        virtual void SaveToXml(TiXmlElement * eventElem) const;
        #endif
        virtual void LoadFromXml(const TiXmlElement * eventElem);

#if defined(GD_IDE_ONLY)
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

        /**
         * Called when the user want to edit the event
         */
        virtual void EditEvent(wxWindow* parent_, Game & game_, Scene & scene_, MainEditorCommand & mainEditorCommand_);
#endif

    private:
        void Init(const TimedEvent & event);
        bool ExecuteConditions( RuntimeScene & scene, ObjectsConcerned & objectsConcerned );
        void ExecuteActions( RuntimeScene & scene, ObjectsConcerned & objectsConcerned );

        string name;
        GDExpression timeout;
        ManualTimer timer;
        vector < Instruction > conditions;
        vector < Instruction > actions;
        vector < BaseEventSPtr > events;

#if defined(GD_IDE_ONLY)
        bool nameSelected;
#endif
};

#endif // TIMEDEVENT_H
