/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef GDCORE_CHANGESNOTIFIER_H
#define GDCORE_CHANGESNOTIFIER_H
#include <string>
#include <vector>
#include <iostream>
namespace gd { class Project; }
namespace gd { class Layout; }
namespace gd { class Object; }
namespace gd { class Automatism; }

namespace gd
{

/**
 * \brief Allow implementations to do specific work when some changes have been made in the IDE.
 *
 * \see gd::ClassWithObjects
 *
 * \ingroup IDE
 */
class ChangesNotifier
{
public:
    ChangesNotifier() {};
    virtual ~ChangesNotifier() {};

    /** \name Events
     * Members functions called by the IDE so as to notify changes have been made
     */
    ///@{
    /**
     * Called when the events of a layout have been modified.
     * \param project Related project
     * \param layout Layout
     * \param indirectChange true if the changes have been made "indirectly" by modifying for example some external events used by a layout
     */
    virtual void OnEventsModified(gd::Project & project, gd::Layout & layout, bool indirectChange = false) const {std::cout << "AAA";};
    ///@}

    /** \name Objects and automatisms notifications
     * Members functions called by the IDE so as to notify changes have been made
     */
    ///@{

    /**
     * Called when an object has been edited
     * \param project Related project
     * \param layout Related layout ( can be NULL )
     * \param object Object
     */
    virtual void OnObjectEdited(gd::Project & project, gd::Layout * layout, gd::Object & object) const {};

    /**
     * Called when an object has been edited
     * \param project Related project
     * \param layout Related layout ( can be NULL )
     * \param object Object
     */
    virtual void OnObjectAdded(gd::Project & project, gd::Layout * layout, gd::Object & object) const {};

    /**
     * Called when an object has been renamed
     * \param project Related project
     * \param layout Related layout ( can be NULL )
     * \param object Object
     * \param oldName Object old name
     */
    virtual void OnObjectRenamed(gd::Project & project, gd::Layout * layout, gd::Object & object, const std::string & oldName) const {};

    /**
     * Called when one or more objects have been deleted
     * \param project Related project
     * \param layout Related layout ( can be NULL )
     * \param objectName The name of the object removed
     */
    virtual void OnObjectsDeleted(gd::Project & project, gd::Layout * layout, const std::vector<std::string> & deletedObjects) const {};

    /**
     * Called when an object's variables have been changed
     * \param project Related project
     * \param layout Related layout ( can be NULL )
     * \param object Object
     */
    virtual void OnObjectVariablesChanged(gd::Project & project, gd::Layout * layout, gd::Object & object) const {};

    /**
     * Called when an automatism have been edited
     * \param project Related project
     * \param layout Related layout ( can be NULL )
     * \param object Related object
     * \param automatism Automatism
     */
    virtual void OnAutomatismEdited(gd::Project & project, gd::Layout * layout, gd::Object & object, gd::Automatism & automatism) const {};

    /**
     * Called when an automatism have been added
     * \param project Related project
     * \param layout Related layout ( can be NULL )
     * \param object Related object
     * \param automatism Automatism
     */
    virtual void OnAutomatismAdded(gd::Project & project, gd::Layout * layout, gd::Object & object, gd::Automatism & automatism) const {};

    /**
     * Called when an automatism have been renamed
     * \param project Related project
     * \param layout Related layout ( can be NULL )
     * \param object Related object
     * \param automatism Automatism
     * \param oldName Automatism old name
     */
    virtual void OnAutomatismRenamed(gd::Project & project, gd::Layout * layout, gd::Object & object, gd::Automatism & automatism, const std::string & oldName) const {};

    /**
     * Called when an automatism have been deleted
     * \param project Related project
     * \param layout Related layout ( can be NULL )
     * \param object Related object
     * \param automatismName The name of the automatism removed
     */
    virtual void OnAutomatismDeleted(gd::Project & project, gd::Layout * layout, gd::Object & object, const std::string & automatismName) const {};

    ///@}
};

}

#endif // GDCORE_CHANGESNOTIFIER_H
