#ifndef FUNCTIONEVENT_H
#define FUNCTIONEVENT_H

#include <boost/shared_ptr.hpp>
#include "GDL/Event.h"
class RuntimeScene;
class ObjectsConcerned;
class Instruction;
class Evaluateur;
class TiXmlElement;

#if defined(GDE)
class Scene;
class MainEditorCommand;
class wxWindow;
#endif

/**
 * Foreach event is a standard event that pick an object of a list each time it is repeated
 */
class FunctionEvent : public BaseEvent
{
    public:
        FunctionEvent();
        FunctionEvent(const FunctionEvent & event);
        virtual ~FunctionEvent();

        FunctionEvent& operator=(const FunctionEvent & event);
        virtual BaseEventSPtr Clone() { return boost::shared_ptr<BaseEvent>(new FunctionEvent(*this));}

        virtual bool IsExecutable() const {return true;}
        virtual void Execute( RuntimeScene & scene, ObjectsConcerned & objectsConcerned ) {}; //Execute does not do anything, as function are launched by actions

        virtual void Preprocess(const Game & game, RuntimeScene & scene, std::vector < BaseEventSPtr > & eventList, unsigned int indexOfTheEventInThisList);
        virtual void Launch( RuntimeScene & scene, ObjectsConcerned & objectsConcerned );

        static std::map < const Game*, std::map < const Scene* , std::map < std::string, FunctionEvent* > > > functionsList; ///< Static map containing all functions, associated with their game, scene and name
        void UnreferenceFunction();
        void ReferenceFunction(const Game *, Scene *);

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
        string GetName() { return name; };
        void SetName(string name_) { name = name_; };

        virtual vector < vector<Instruction>* > GetAllConditionsVectors();
        virtual vector < vector<Instruction>* > GetAllActionsVectors();

        virtual void SaveToXml(TiXmlElement * eventElem) const;
        virtual void LoadFromXml(const TiXmlElement * eventElem);

#if defined(GDE)
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
        void Init(const FunctionEvent & event);
        bool ExecuteConditions( RuntimeScene & scene, ObjectsConcerned & objectsConcerned );
        void ExecuteActions( RuntimeScene & scene, ObjectsConcerned & objectsConcerned );

        string name;
        vector < Instruction > conditions;
        vector < Instruction > actions;
        vector < BaseEventSPtr > events;

#ifdef GDE
        virtual void RenderInBitmap() const;
        bool nameSelected;
#endif
};

#endif // FUNCTIONEVENT_H
