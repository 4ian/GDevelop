/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */
#if !defined(EMSCRIPTEN)
#ifndef CLIPBOARD_H
#define CLIPBOARD_H

namespace gd { class Layout; }
namespace gd { class ExternalEvents; }
namespace gd { class ExternalLayout; }
#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Events/Instruction.h"
#include "GDCore/PlatformDefinition/ObjectGroup.h"
#include "GDCore/PlatformDefinition/Object.h"
#include "GDCore/PlatformDefinition/InitialInstance.h"
#undef GetObject //Undefining an annoying macro changing GetObject in GetObjectA or GetObjectW

namespace gd
{

/**
 * \brief Singleton class which can be used by the IDE and the editors to access to the clipboard
 */
class GD_CORE_API Clipboard
{
public:
    static Clipboard * GetInstance();
    static void DestroySingleton();

    void SetObject( const gd::Object * object );
    gd::Object * GetObject();
    bool HasObject() { return hasObject; };
    void ForgetObject() { hasObject = false; };

    void SetEvents( const gd::EventsList & event );
    gd::EventsList GetEvents();
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
    void ForgetObjectGroup() { hasObjectGroup = false; };

    void SetInstances( std::vector < boost::shared_ptr<InitialInstance> > instances );
    std::vector < boost::shared_ptr<InitialInstance> > GetInstances() { return instancesCopied; };
    bool HasInstances() { return hasInstances; };

private:
    Clipboard();
    virtual ~Clipboard();

    gd::Object * objectCopied;
    bool hasObject;

    gd::EventsList eventsCopied;
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

    std::vector < boost::shared_ptr<gd::InitialInstance> > instancesCopied;
    bool hasInstances;

    static Clipboard *singleton;
};

}

#endif // CLIPBOARD_H
#endif