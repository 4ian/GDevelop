/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY)
#ifndef CHANGESNOTIFIER_H
#define CHANGESNOTIFIER_H
#include "GDCore/Project/ChangesNotifier.h"

/**
 * \brief Internal class used to trigger some custom works after changes have been made.
 *
 * It notably relaunch compilation when some changes have been made or take care of updating
 * behaviors shared data.
 *
 * \ingroup IDE
 */
class ChangesNotifier : public gd::ChangesNotifier
{
public:
    ChangesNotifier() : gd::ChangesNotifier() {};
    virtual ~ChangesNotifier() {};

    /** \name Specialization of gd::ChangesNotifier members
     * See gd::ChangesNotifier documentation for more information about what these members functions should do.
     */
    ///@{

    virtual void OnLayoutAdded(gd::Project & project, gd::Layout & layout) const;
    virtual void OnLayoutRenamed(gd::Project & project, gd::Layout & layout, const gd::String & oldName) const;
    virtual void OnLayoutDeleted(gd::Project & project, const gd::String deletedLayout) const;
    virtual void OnVariablesModified(gd::Project & project, gd::Layout * layout = NULL) const;
    virtual void OnObjectEdited(gd::Project & project, gd::Layout * layout, gd::Object & object) const;
    virtual void OnObjectAdded(gd::Project & project, gd::Layout * layout, gd::Object & object) const;
    virtual void OnObjectRenamed(gd::Project & project, gd::Layout * layout, gd::Object & object, const gd::String & oldName) const;
    virtual void OnObjectsDeleted(gd::Project & project, gd::Layout * layout, const std::vector<gd::String> & deletedObjects) const;
    virtual void OnObjectVariablesChanged(gd::Project & project, gd::Layout * layout, gd::Object & object) const;
    virtual void OnBehaviorEdited(gd::Project & project, gd::Layout * layout, gd::Object & object, gd::Behavior & behavior) const;
    virtual void OnBehaviorAdded(gd::Project & project, gd::Layout * layout, gd::Object & object, gd::Behavior & behavior) const;
    virtual void OnBehaviorRenamed(gd::Project & project, gd::Layout * layout, gd::Object & object, gd::Behavior & behavior, const gd::String & oldName) const;
    virtual void OnBehaviorDeleted(gd::Project & project, gd::Layout * layout, gd::Object & object, const gd::String & behaviorName) const;
    virtual void OnObjectGroupAdded(gd::Project & project, gd::Layout * layout, const gd::String & groupName) const;
    virtual void OnObjectGroupEdited(gd::Project & project, gd::Layout * layout, const gd::String & groupName) const;
    virtual void OnObjectGroupRenamed(gd::Project & project, gd::Layout * layout, const gd::String & groupName, const gd::String & oldName) const;
    virtual void OnObjectGroupDeleted(gd::Project & project, gd::Layout * layout, const gd::String & groupName) const;
    virtual void OnEventsModified(gd::Project & project, gd::Layout & layout, bool indirectChange = false, gd::String sourceOfTheIndirectChange = "") const;
    virtual void OnEventsModified(gd::Project & project, gd::ExternalEvents & externalEvents, bool indirectChange = false, gd::String sourceOfTheIndirectChange = "") const;
    virtual void OnResourceModified(gd::Project & project, const gd::String & resourceName) const;
    virtual void OnExternalEventsAdded(gd::Project & project, gd::ExternalEvents & events) const;
    virtual void OnExternalEventsRenamed(gd::Project & project, gd::ExternalEvents & events, const gd::String & oldName) const;
    virtual void OnExternalEventsDeleted(gd::Project & project, const gd::String deletedLayout) const;

    ///@}

private:

    /**
     * A common task when a changes have been made is to request the events of the scene
     * to be compiled, as well as its dependencies.
     */
    void RequestFullRecompilation(gd::Project & project, gd::Layout * layout) const;
};

#endif // CHANGESNOTIFIER_H
#endif

