/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef CLIPBOARD_H
#define CLIPBOARD_H

namespace gd { class Layout; }
namespace gd { class ExternalEvents; }
namespace gd { class ExternalLayout; }
#include "GDCore/Events/Event.h"
#include "GDCore/Events/Instruction.h"
#include "GDCore/PlatformDefinition/ObjectGroup.h"
#include "GDCore/PlatformDefinition/Object.h"
#include "GDL/Position.h"
#undef GetObject //Undefining an annoying macro changing GetObject in GetObjectA or GetObjectW

/**
 * \brief The IDE singleton class managing the clipboard.
 */
class Clipboard
{
public:
    static Clipboard * GetInstance();
    static void DestroySingleton();

    void SetObject( const gd::Object * object );
    gd::Object * GetObject();
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

    void SetExternalLayout( const gd::ExternalLayout * layout );
    gd::ExternalLayout * GetExternalLayout();
    bool HasExternalLayout() { return hasExternalLayout; };

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

    gd::Object * objectCopied;
    bool hasObject;

    std::vector<gd::BaseEventSPtr> eventsCopied;
    bool hasEvents;

    std::vector<gd::Instruction> instructionsCopied;
    bool hasInstructions;
    bool instructionsAreConditions;

    gd::ExternalEvents * externalEventsCopied;
    bool hasExternalEvents;

    gd::ExternalLayout * externalLayoutCopied;
    bool hasExternalLayout;

    gd::Layout * layoutCopied;
    bool hasLayout;

    gd::ObjectGroup objectGroupCopied;
    bool hasObjectGroup;

    std::vector < InitialPosition > positionsSelection;
    bool hasPositionsSelection;

    static Clipboard *singleton;
};

#endif // CLIPBOARD_H

