/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef GDCORE_CLASSWITHOBJECTS_H
#define GDCORE_CLASSWITHOBJECTS_H
#include <string>
namespace gd { class Object; }
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
class ClassWithObjects
{
public:
    ClassWithObjects() {};
    virtual ~ClassWithObjects() {};

    /** \name Objects management
     * Members functions related to objects management.
     */
    ///@{

    /**
     * Must return true if object called "name" exists.
     */
    virtual bool HasObjectNamed(const std::string & name) const =0;

    /**
     * Must return a reference to the object called "name".
     */
    virtual Object & GetObject(const std::string & name) =0;

    /**
     * Must return a reference to the object called "name".
     */
    virtual const Object & GetObject(const std::string & name) const =0;

    /**
     * Must return a reference to the object at position "index" in the objects list
     */
    virtual Object & GetObject(unsigned int index) =0;

    /**
     * Must return a reference to the object at position "index" in the objects list
     */
    virtual const Object & GetObject (unsigned int index) const =0;

    /**
     * Must return the position of the object called "name" in the objects list
     */
    virtual unsigned int GetObjectPosition(const std::string & name) const =0;

    /**
     * Must return the number of object.
     */
    virtual unsigned int GetObjectsCount() const =0;

    /**
     * Must add a new empty object of type \a objectType called \a name at the specified position in the layout list.
     */
    virtual void InsertNewObject(const std::string & objectType, const std::string & name, unsigned int position) =0;

    /**
     * Must add a new object constructed from the layout passed as parameter.
     * \note No pointer or reference must be kept on the object passed as parameter.
     * \param object The object that must be copied and inserted into the project
     * \param position Insertion position. Even if the position is invalid, the object must be inserted at the end of the objects list.
     */
    virtual void InsertObject(const Object & object, unsigned int position) =0;

    /**
     * Must delete the object named "name".
     */
    virtual void RemoveObject(const std::string & name) =0;

    /**
     * Must swap the position of the specified objects.
     */
    virtual void SwapObjects(unsigned int firstObjectIndex, unsigned int secondObjectIndex) =0;
    ///@}
};

}

#endif // GDCORE_CLASSWITHOBJECTS_H
