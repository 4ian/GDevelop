/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef GDCORE_CLASSWITHOBJECTS_H
#define GDCORE_CLASSWITHOBJECTS_H
#include <string>
#include <vector>
#include <boost/shared_ptr.hpp>
namespace gd { class Object; }
namespace gd { class Project; }
class TiXmlElement;
#undef GetObject //Disable an annoying macro

namespace gd
{

/**
 * \brief Used as a base class for classes that will own objects (see gd::Object).
 *
 * For example, gd::Project inherits from this class as it have global objects.
 * gd::Layout also inherits from this class as each layout has specific objects.
 *
 * \see gd::Project
 * \see gd::Layout
 * \see gd::Object
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API ClassWithObjects
{
public:
    ClassWithObjects();
    virtual ~ClassWithObjects() {};

    /** \name Objects management
     * Members functions related to objects management.
     */
    ///@{

    /**
     * Must return true if object called "name" exists.
     */
    virtual bool HasObjectNamed(const std::string & name) const;

    /**
     * Must return a reference to the object called "name".
     */
    virtual Object & GetObject(const std::string & name);

    /**
     * Must return a reference to the object called "name".
     */
    virtual const gd::Object & GetObject(const std::string & name) const;

    /**
     * Must return a reference to the object at position "index" in the objects list
     */
    virtual Object & GetObject(unsigned int index);

    /**
     * Must return a reference to the object at position "index" in the objects list
     */
    virtual const gd::Object & GetObject (unsigned int index) const;

    /**
     * Must return the position of the object called "name" in the objects list
     */
    virtual unsigned int GetObjectPosition(const std::string & name) const;

    /**
     * Must return the number of object.
     */
    virtual unsigned int GetObjectsCount() const;

    /**
     * Must add a new empty object of type \a objectType called \a name at the specified position in the layout list.
     */
    virtual void InsertNewObject(gd::Project & project, const std::string & objectType, const std::string & name, unsigned int position);

    /**
     * Must add a new object constructed from the layout passed as parameter.
     * \note No pointer or reference must be kept on the object passed as parameter.
     * \param object The object that must be copied and inserted into the project
     * \param position Insertion position. Even if the position is invalid, the object must be inserted at the end of the objects list.
     */
    virtual void InsertObject(const gd::Object & object, unsigned int position);

    /**
     * Must delete the object named "name".
     */
    virtual void RemoveObject(const std::string & name);

    /**
     * Must swap the position of the specified objects.
     */
    virtual void SwapObjects(unsigned int firstObjectIndex, unsigned int secondObjectIndex);
    ///@}

    /** \name Saving and loading
     * Members functions related to saving and loading the project.
     */
    ///@{
    /**
     * Called to save the layout to a TiXmlElement.
     */
    virtual void SaveObjectsToXml(TiXmlElement * element) const;

    /**
     * Called to load the layout from a TiXmlElement.
     */
    virtual void LoadObjectsFromXml(gd::Project & project, const TiXmlElement * element);
    ///@}

protected:
    std::vector < boost::shared_ptr<gd::Object> > initialObjects; ///< Objects contained.
};

}

#endif // GDCORE_CLASSWITHOBJECTS_H
