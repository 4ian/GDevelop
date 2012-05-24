/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GDCORE_VARIABLESCONTAINER_H
#define GDCORE_VARIABLESCONTAINER_H
#include <string>
class TiXmlElement;
namespace gd {class Variable;}

namespace gd
{

/**
 * \brief Class defining a container for variables
 * \see gd::Variable
 *
 * \see gd::Project
 * \see gd::Layout
 * \see gd::Object
 *
 * \ingroup PlatformDefinition
 */
class VariablesContainer
{
public:
    VariablesContainer() {};
    virtual ~VariablesContainer() {};

    /**
     * Must return a pointer to a copy of the container.
     * A such method is needed as the IDE may want to store copies of some variables container and so need a way to do polymorphic copies.
     *
     * Typical implementation example:
     * \code
     * return new MyContainer(*this);
     * \endcode
     */
    virtual VariablesContainer * Clone() const =0;

    /**
     * Must construct the class from the source
     * A such method is needed as the IDE may want to store copies of some variables container and so need a way to do polymorphic copies.
     *
     * Typical implementation example:
     * \code
     * try
     * {
     *     const MyContainer & castedSource = dynamic_cast<const MyContainer&>(source);
     *     operator=(castedSource);
     * }
     * catch(...) { std::cout << "WARNING: Tried to create a MyContainer object from an object which is not a MyContainer"; }
     * \endcode
     */
    virtual void Create(const gd::VariablesContainer & source) =0;

    /** \name Variables management
     * Members functions related to variables management.
     */
    ///@{

    /**
     * Must return true if variable called "name" exists.
     */
    virtual bool HasVariableNamed(const std::string & name) const =0;

    /**
     * Must return a reference to the variable called "name".
     */
    virtual Variable & GetVariable(const std::string & name) =0;

    /**
     * Must return a reference to the variable called "name".
     */
    virtual const Variable & GetVariable(const std::string & name) const =0;

    /**
     * Must return a reference to the variable at position "index" in the variable list
     */
    virtual Variable & GetVariable(unsigned int index) =0;

    /**
     * Must return a reference to the variable at position "index" in the variable list
     */
    virtual const Variable & GetVariable (unsigned int index) const =0;

    /**
     * Must return the position of the variable called "name" in the variable list
     */
    virtual unsigned int GetVariablePosition(const std::string & name) const =0;

    /**
     * Must return the number of variables.
     */
    virtual unsigned int GetVariableCount() const =0;

    /**
     * Must add a new empty variable called "name" at the specified position in the variable list.
     */
    virtual void InsertNewVariable(const std::string & name, unsigned int position) =0;

    /**
     * Must add a new variable constructed from the variable passed as parameter.
     * \note No pointer or reference must be kept on the variable passed as parameter.
     * \param variable The variable that must be copied and inserted into the project
     * \param position Insertion position. Even if the position is invalid, the variable must be inserted at the end of the variable list.
     */
    virtual void InsertVariable(const Variable & variable, unsigned int position) =0;

    /**
     * Must delete variable named "name".
     */
    virtual void RemoveVariable(const std::string & name) =0;

    /**
     * Must swap the position of the specified variables.
     */
    virtual void SwapVariables(unsigned int firstVariableIndex, unsigned int secondVariableIndex) =0;

    ///@}

    /** \name Saving and loading
     * Members functions related to saving and loading the object.
     */
    ///@{

    /**
     * Called to save the layout to a TiXmlElement.
     */
    virtual void SaveToXml(TiXmlElement * element) const {};

    /**
     * Called to load the layout from a TiXmlElement.
     */
    virtual void LoadFromXml(const TiXmlElement * element) {};
    ///@}

private:
};

}

#endif // GDCORE_VARIABLESCONTAINER_H
