#ifndef CLIPBOARD_H
#define CLIPBOARD_H

#include "GDL/Object.h"
#include "GDL/Event.h"
#include "GDL/Scene.h"
#include "GDL/Instruction.h"

//Une macro a été définie quelque part ( windows.h ),
//transformant GetObject en GetObjectA.
//On la désactive.
#undef GetObject

class Clipboard
{
public:
    Clipboard();
    virtual ~Clipboard();
    static Clipboard * getInstance();
    static void kill();

    void SetObject( ObjSPtr object );
    ObjSPtr GetObject();
    bool HasObject();

    void SetEvent( const Event & event );
    Event GetEvent();
    bool HasEvent();

    void SetAction( const Instruction & action );
    Instruction GetAction();
    bool HasAction();

    void SetScene( const Scene & scene );
    Scene GetScene();
    bool HasScene();

    void SetCondition( const Instruction & condition );
    Instruction GetCondition();
    bool HasCondition();

private:
    ObjSPtr objectCopied;
    bool hasObject;

    Event eventCopied;
    bool hasEvent;

    Instruction actionCopied;
    bool hasAction;

    Instruction conditionCopied;
    bool hasCondition;

    Scene sceneCopied;
    bool hasScene;

    static Clipboard *singleton;
};

#endif // CLIPBOARD_H
