/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef GDCORE_OBJECT_H
#define GDCORE_OBJECT_H
#include <string>
#include <vector>
namespace gd { class Automatism; }
namespace gd { class Project; }
namespace gd { class VariablesContainer; }
namespace gd { class MainFrameWrapper; }
class wxWindow;
class wxBitmap;

namespace gd
{

/**
 * \brief Base class used to represent an object of a platform
 *
 * \ingroup PlatformDefinition
 */
class Object
{
public:
    Object() {};
    virtual ~Object() {};

    /**
     * Must return a pointer to a copy of the object.
     * A such method is needed as the IDE may want to store copies of some objects and so need a way to do polymorphic copies.
     *
     * Typical implementation example:
     * \code
     * return new MyObject(*this);
     * \endcode
     */
    virtual Object * Clone() const =0;

    /** \name Common properties
     * Members functions related to common properties
     */
    ///@{

    /** Must change the name of the object with the name passed as parameter.
     */
    virtual void SetName(const std::string & name) =0;

    /** Must return the name of the object.
     */
    virtual const std::string & GetName() const =0;

    /** Must return the type of the object.
     */
    virtual const std::string & GetType() const =0;

    /** Must change the type of the object.
     */
    virtual void SetType(const std::string & type_) =0;

    ///@}

    /** \name Automatisms management
     * Members functions related to automatisms management.
     */
    ///@{

    /**
     * Must return a vector containing the names of all the automatisms used by the object
     */
    virtual std::vector < std::string > GetAllAutomatismNames() const =0;

    /**
     * Must return a reference to the automatism called "name".
     */
    virtual Automatism & GetAutomatism(const std::string & name) =0;

    /**
     * Must return a reference to the automatism called "name".
     */
    virtual const Automatism & GetAutomatism(const std::string & name) const =0;

    /**
     * Must return true if object has an automatism called "name".
     */
    virtual bool HasAutomatismNamed(const std::string & name) const =0;

    /**
     * Must remove automatism called "name"
     */
    virtual void RemoveAutomatism(const std::string & name) =0;

    /**
     * Must add the automatism of the specified \a type with the specified \a name.
     */
    virtual void AddNewAutomatism(const std::string & type, const std::string & name) =0;
    ///@}

    /** \name Variable management
     * Members functions related to object variables management.
     */
    ///@{

    /**
     * Must return a reference to the container storing the object variables
     * \see gd::VariablesContainer
     */
    virtual const gd::VariablesContainer & GetVariables() const =0;

    /**
     * Must return a reference to the container storing the object variables
     * \see gd::VariablesContainer
     */
    virtual gd::VariablesContainer & GetVariables() =0;
    ///@}

    /** \name GUI related
     * Members functions related to generating thumbnails and other wxWidgets related tasks
     */
    ///@{
    /**
     * Called when user wants to edit the object.
     */
    virtual void EditObject( wxWindow* parent, gd::Project & project, gd::MainFrameWrapper & mainFrameWrapper_ ) {};

    /**
     * Must update \a thumbnail bitmap with a 24*24 bitmap.
     *
     * \return true if thumbnail was successfully updated.
     */
    virtual bool GenerateThumbnail(const gd::Project & project, wxBitmap & thumbnail) {return false;};
    ///@}
};

}

#endif // GDCORE_OBJECT_H
