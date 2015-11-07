/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef CLIPBOARD_H
#define CLIPBOARD_H

namespace gd { class Layout; }
namespace gd { class ExternalEvents; }
namespace gd { class ExternalLayout; }
#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Events/Instruction.h"
#include "GDCore/Project/ObjectGroup.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/InitialInstance.h"
#undef GetObject //Undefining an annoying macro changing GetObject in GetObjectA or GetObjectW

namespace gd
{

/**
 * \brief Singleton class which can be used by the IDE and the editors to access to a (fake) clipboard.
 *
 * All objects stored in this clipboard are stored by copy. Getter returns a copy of the stored objects,
 * and can only be called if "Has" method returns true (otherwise, behavior is undefined).
 */
class GD_CORE_API Clipboard
{
public:
    /**
     * \brief Return the unique clipboard instance.
     */
    static Clipboard * Get();

    /**
     * @brief Destroy the unique clipboard instance.
     *
     * No need to call this method except at the end of the application.
     */
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

    void SetExternalEvents( const gd::ExternalEvents & events );
    gd::ExternalEvents GetExternalEvents();
    bool HasExternalEvents() { return hasExternalEvents; };

    void SetExternalLayout( const gd::ExternalLayout & layout );
    gd::ExternalLayout GetExternalLayout();
    bool HasExternalLayout() { return hasExternalLayout; };

    void SetConditions( const gd::InstructionsList & conditions );
    void SetActions( const gd::InstructionsList & actions );

    bool HasCondition() { return hasInstructions && instructionsAreConditions; };
    bool HasAction() { return hasInstructions && !instructionsAreConditions; };
    gd::InstructionsList GetInstructions() const { return instructionsCopied; };

    void SetObjectGroup( const gd::ObjectGroup & group );
    gd::ObjectGroup GetObjectGroup();
    bool HasObjectGroup() { return hasObjectGroup; };
    void ForgetObjectGroup() { hasObjectGroup = false; };

    void SetInstances( std::vector < std::shared_ptr<InitialInstance> > instances );
    std::vector < std::shared_ptr<InitialInstance> > Gets() { return instancesCopied; };
    bool HasInstances() { return hasInstances; };

private:
    Clipboard();
    virtual ~Clipboard();

    gd::Object * objectCopied;
    bool hasObject;

    gd::EventsList eventsCopied;
    bool hasEvents;

    gd::InstructionsList instructionsCopied;
    bool hasInstructions;
    bool instructionsAreConditions;

    gd::ExternalEvents * externalEventsCopied; ///< Stored using a pointer to avoid including the full header file.
    bool hasExternalEvents;

    gd::ExternalLayout * externalLayoutCopied; ///< Stored using a pointer to avoid including the full header file.
    bool hasExternalLayout;

    gd::Layout * layoutCopied; ///< Stored using a pointer to avoid including the full header file.
    bool hasLayout;

    gd::ObjectGroup objectGroupCopied;
    bool hasObjectGroup;

    std::vector < std::shared_ptr<gd::InitialInstance> > instancesCopied;
    bool hasInstances;

    static Clipboard *singleton;
};

}

#endif // CLIPBOARD_H
