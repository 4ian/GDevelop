#ifndef CLIPBOARD_H
#define CLIPBOARD_H

#include "GDL/Object.h"
#include "GDCore/Events/Event.h"
#include "GDL/Scene.h"
#include "GDCore/Events/Instruction.h"
#include "GDL/ExternalEvents.h"

//Undefining an annoying macro changing GetObject in GetObjectA
#undef GetObject

class Clipboard
{
public:
    static Clipboard * GetInstance();
    static void DestroySingleton();

    void SetObject( ObjSPtr object );
    ObjSPtr GetObject();
    bool HasObject() { return hasObject; };

    void SetEvents( const std::vector<BaseEventSPtr> & event );
    std::vector<BaseEventSPtr> GetEvents();
    bool HasEvents() { return hasEvents; };

    void SetScene( const Scene & scene );
    Scene GetScene();
    bool HasScene() { return hasScene; };

    void SetExternalEvents( const ExternalEvents & events );
    ExternalEvents GetExternalEvents();
    bool HasExternalEvents() { return hasExternalEvents; };

    void SetConditions( const std::vector<Instruction> & conditions );
    void SetActions( const std::vector<Instruction> & actions );

    bool HasCondition() { return hasInstructions && instructionsAreConditions; };
    bool HasAction() { return hasInstructions && !instructionsAreConditions; };
    std::vector<Instruction> GetInstructions() const { return instructionsCopied; };

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

    std::vector<BaseEventSPtr> eventsCopied;
    bool hasEvents;

    std::vector<Instruction> instructionsCopied;
    bool hasInstructions;
    bool instructionsAreConditions;

    ExternalEvents externalEventsCopied;
    bool hasExternalEvents;

    Scene sceneCopied;
    bool hasScene;

    ObjectGroup objectGroupCopied;
    bool hasObjectGroup;

    vector < InitialPosition > positionsSelection;
    bool hasPositionsSelection;

    static Clipboard *singleton;
};

#endif // CLIPBOARD_H
