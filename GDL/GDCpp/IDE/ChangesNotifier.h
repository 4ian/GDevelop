/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#if defined(GD_IDE_ONLY)
#ifndef CHANGESNOTIFIER_H
#define CHANGESNOTIFIER_H
#include "GDCore/PlatformDefinition/ChangesNotifier.h"

/**
 * \brief Internal class used to trigger some custom works after changes have been made.
 *
 * It notably relaunch compilation when some changes have been made or take care of updating
 * automatisms shared data.
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
    virtual void OnLayoutRenamed(gd::Project & project, gd::Layout & layout, const std::string & oldName) const;
    virtual void OnLayoutDeleted(gd::Project & project, const std::string deletedLayout) const;
    virtual void OnVariablesModified(gd::Project & project, gd::Layout * layout = NULL) const;
    virtual void OnObjectEdited(gd::Project & project, gd::Layout * layout, gd::Object & object) const;
    virtual void OnObjectAdded(gd::Project & project, gd::Layout * layout, gd::Object & object) const;
    virtual void OnObjectRenamed(gd::Project & project, gd::Layout * layout, gd::Object & object, const std::string & oldName) const;
    virtual void OnObjectsDeleted(gd::Project & project, gd::Layout * layout, const std::vector<std::string> & deletedObjects) const;
    virtual void OnObjectVariablesChanged(gd::Project & project, gd::Layout * layout, gd::Object & object) const;
    virtual void OnAutomatismEdited(gd::Project & project, gd::Layout * layout, gd::Object & object, gd::Automatism & automatism) const;
    virtual void OnAutomatismAdded(gd::Project & project, gd::Layout * layout, gd::Object & object, gd::Automatism & automatism) const;
    virtual void OnAutomatismRenamed(gd::Project & project, gd::Layout * layout, gd::Object & object, gd::Automatism & automatism, const std::string & oldName) const;
    virtual void OnAutomatismDeleted(gd::Project & project, gd::Layout * layout, gd::Object & object, const std::string & automatismName) const;
    virtual void OnObjectGroupAdded(gd::Project & project, gd::Layout * layout, const std::string & groupName) const;
    virtual void OnObjectGroupEdited(gd::Project & project, gd::Layout * layout, const std::string & groupName) const;
    virtual void OnObjectGroupRenamed(gd::Project & project, gd::Layout * layout, const std::string & groupName, const std::string & oldName) const;
    virtual void OnObjectGroupDeleted(gd::Project & project, gd::Layout * layout, const std::string & groupName) const;
    virtual void OnEventsModified(gd::Project & project, gd::Layout & layout, bool indirectChange = false, std::string sourceOfTheIndirectChange = "") const;
    virtual void OnEventsModified(gd::Project & project, gd::ExternalEvents & externalEvents, bool indirectChange = false, std::string sourceOfTheIndirectChange = "") const;
    virtual void OnResourceModified(gd::Project & project, const std::string & resourceName) const;
    virtual void OnExternalEventsAdded(gd::Project & project, gd::ExternalEvents & events) const;
    virtual void OnExternalEventsRenamed(gd::Project & project, gd::ExternalEvents & events, const std::string & oldName) const;
    virtual void OnExternalEventsDeleted(gd::Project & project, const std::string deletedLayout) const;

    ///@}

private:

    /**
     * A common task when a changes have been made is to request the events of the scene
     * to be compiled, as well as its dependencies.
     */
    void RequestFullRecompilation(gd::Project & project, gd::Layout * layout) const;

    /**
     * A common task when a changes have been made is to update the shared data of automatisms,
     * which are stored in scenes.
     */
    void RequestAutomatismsSharedDataUpdate(gd::Project & project, gd::Layout * layout) const;
};

#endif // CHANGESNOTIFIER_H
#endif

