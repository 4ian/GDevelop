/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef CLIPBOARD_H
#define CLIPBOARD_H

namespace gd { class Layout; }
namespace gd { class ExternalEvents; }
#include "GDCore/Events/Event.h"
#include "GDCore/Events/Instruction.h"
#include "GDCore/PlatformDefinition/ObjectGroup.h"
#include "GDL/Object.h"
#include "GDL/ObjectHelpers.h"

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

    void SetEvents( const std::vector<gd::BaseEventSPtr> & event );
    std::vector<gd::BaseEventSPtr> GetEvents();
    bool HasEvents() { return hasEvents; };

    void SetLayout( const gd::Layout * layout );
    gd::Layout * GetLayout();
    bool HasLayout() { return hasLayout; };

    void SetExternalEvents( const gd::ExternalEvents * events );
    gd::ExternalEvents * GetExternalEvents();
    bool HasExternalEvents() { return hasExternalEvents; };

    void SetConditions( const std::vector<gd::Instruction> & conditions );
    void SetActions( const std::vector<gd::Instruction> & actions );

    bool HasCondition() { return hasInstructions && instructionsAreConditions; };
    bool HasAction() { return hasInstructions && !instructionsAreConditions; };
    std::vector<gd::Instruction> GetInstructions() const { return instructionsCopied; };

    void SetObjectGroup( const gd::ObjectGroup & group );
    gd::ObjectGroup GetObjectGroup();
    bool HasObjectGroup() { return hasObjectGroup; };

    void SetPositionsSelection( std::vector < InitialPosition > positionsSelection_ );
    std::vector < InitialPosition > GetPositionsSelection() { return positionsSelection; };
    bool HasPositionsSelection() { return hasPositionsSelection; };

private:
    Clipboard();
    virtual ~Clipboard();

    ObjSPtr objectCopied;
    bool hasObject;

    std::vector<gd::BaseEventSPtr> eventsCopied;
    bool hasEvents;

    std::vector<gd::Instruction> instructionsCopied;
    bool hasInstructions;
    bool instructionsAreConditions;

    gd::ExternalEvents * externalEventsCopied;
    bool hasExternalEvents;

    gd::Layout * layoutCopied;
    bool hasLayout;

    gd::ObjectGroup objectGroupCopied;
    bool hasObjectGroup;

    std::vector < InitialPosition > positionsSelection;
    bool hasPositionsSelection;

    static Clipboard *singleton;
};

#endif // CLIPBOARD_H
