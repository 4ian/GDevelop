#ifndef CLIPBOARD_H
#define CLIPBOARD_H

#include "GDL/Object.h"
#include "GDL/Event.h"
#include "GDL/Scene.h"
#include "GDL/Instruction.h"
#include "GDL/ExternalEvents.h"

//Undefining an annoying macro changing GetObject in GetObjectA
#undef GetObject

class Clipboard
{
public:
    static Clipboard * getInstance();
    static void kill();

    void SetObject( ObjSPtr object );
    ObjSPtr GetObject();
    bool HasObject() { return hasObject; };

    void SetEvent( BaseEventSPtr event );
    BaseEventSPtr GetEvent();
    bool HasEvent() { return hasEvent; };

    void SetAction( const Instruction & action );
    Instruction GetAction();
    bool HasAction() { return hasAction; };

    void SetScene( const Scene & scene );
    Scene GetScene();
    bool HasScene() { return hasScene; };

    void SetExternalEvents( const ExternalEvents & events );
    ExternalEvents GetExternalEvents();
    bool HasExternalEvents() { return hasExternalEvents; };

    void SetCondition( const Instruction & condition );
    Instruction GetCondition();
    bool HasCondition() { return hasCondition; };

    void SetObjectGroup( const ObjectGroup & group );
    ObjectGroup GetObjectGroup();
    bool HasObjectGroup() { return hasObjectGroup; };

    void SetPositionsSelection( vector < InitialPosition > positionsSelection_ );
    vector < InitialPosition > GetPositionsSelection() { return positionsSelection; };
    bool HasPositionsSelection() { return hasPositionsSelection; };

private:
    Clipboard();
    virtual ~Clipboard();

    ObjSPtr objectCopied;
    bool hasObject;

    BaseEventSPtr eventCopied;
    bool hasEvent;

    ExternalEvents externalEventsCopied;
    bool hasExternalEvents;

    Instruction actionCopied;
    bool hasAction;

    Instruction conditionCopied;
    bool hasCondition;

    Scene sceneCopied;
    bool hasScene;

    ObjectGroup objectGroupCopied;
    bool hasObjectGroup;

    vector < InitialPosition > positionsSelection;
    bool hasPositionsSelection;

    static Clipboard *singleton;
};

#endif // CLIPBOARD_H
