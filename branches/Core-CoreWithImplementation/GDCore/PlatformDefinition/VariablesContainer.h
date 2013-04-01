/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GDCORE_VARIABLESCONTAINER_H
#define GDCORE_VARIABLESCONTAINER_H
#include <string>
#include <vector>
#include "GDCore/PlatformDefinition/Variable.h"
class TiXmlElement;

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
class GD_CORE_API VariablesContainer
{
public:
    VariablesContainer();
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
    virtual VariablesContainer * Clone() const { return new gd::VariablesContainer(*this); };

    #if defined(GD_IDE_ONLY)
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
    virtual void Create(const gd::VariablesContainer & source);
    #endif

    /** \name Variables management
     * Members functions related to variables management.
     */
    ///@{

    /**
     * Must return true if variable called "name" exists.
     */
    virtual bool HasVariableNamed(const std::string & name) const
    {
        std::vector < Variable >::const_iterator end = variables.end();
        for (std::vector < Variable >::const_iterator i = variables.begin();i != end;++i)
        {
            if ( i->GetName() == name)
                return true;
        }

        return false;
    }

    /**
     * Must return a reference to the variable called "name".
     */
    virtual Variable & GetVariable(const std::string & name);

    /**
     * Must return a reference to the variable called "name".
     */
    virtual const Variable & GetVariable(const std::string & name) const;

    /**
     * Return a reference to the variable at the @ index position in the list.
     * \warning No bound check is made. Please use other overload of ListVariable::GetVariable when you do not have any efficiency request.
     * \note This specific overload can used by code generated from events when a variable index is known at the time of the code generation.
     */
    inline Variable & GetVariable(unsigned int index) { return variables[index]; }

    /**
     * Return a reference to the variable at the @ index position in the list.
     * \warning No bound check is made. Please use other overload of ListVariable::GetVariable when you do not have any efficiency request.
     * \note This specific overload can used by code generated from events when a variable index is known at the time of the code generation.
     */
    inline const Variable & GetVariable(unsigned int index) const { return variables[index]; }

    #if defined(GD_IDE_ONLY)
    /**
     * Must return the position of the variable called "name" in the variable list
     */
    virtual unsigned int GetVariablePosition(const std::string & name) const;

    /**
     * Must return the number of variables.
     */
    virtual unsigned int GetVariableCount() const;

    /**
     * Must add a new empty variable called "name" at the specified position in the variable list.
     */
    virtual void InsertNewVariable(const std::string & name, unsigned int position);

    /**
     * Must add a new variable constructed from the variable passed as parameter.
     * \note No pointer or reference must be kept on the variable passed as parameter.
     * \param variable The variable that must be copied and inserted into the project
     * \param position Insertion position. Even if the position is invalid, the variable must be inserted at the end of the variable list.
     */
    virtual void InsertVariable(const Variable & variable, unsigned int position);

    /**
     * Must delete variable named "name".
     */
    virtual void RemoveVariable(const std::string & name);

    /**
     * Must swap the position of the specified variables.
     */
    virtual void SwapVariables(unsigned int firstVariableIndex, unsigned int secondVariableIndex);
    #endif

    /**
     * Clear all variables of the list.
     */
    inline void Clear()
    {
        variables.clear();
    }
    ///@}

    /** \name Saving and loading
     * Members functions related to saving and loading the object.
     */
    ///@{

    #if defined(GD_IDE_ONLY)
    /**
     * Called to save the layout to a TiXmlElement.
     */
    virtual void SaveToXml(TiXmlElement * element) const;
    #endif

    /**
     * Called to load the layout from a TiXmlElement.
     */
    virtual void LoadFromXml(const TiXmlElement * element);
    ///@}

    /** \name C++ Platform specific methods
     */
    ///@{

    /**
     * Get the text of a variable
     */
    inline const std::string & GetVariableString(const std::string & varName) const
    {
        for (unsigned int i = 0;i<variables.size();++i)
        {
            if ( variables[i].GetName() == varName)
                return variables[i].GetString();
        }

        return badVariable.GetString();
    }

    /**
     * Get the value of a variable
     */
    inline double GetVariableValue(const std::string & varName) const
    {
        std::vector < Variable >::const_iterator end = variables.end();
        for (std::vector < Variable >::const_iterator i = variables.begin();i != end;++i)
        {
            if ( i->GetName() == varName)
                return i->GetValue();
        }

        return badVariable.GetValue();
    }

    /**
     * Return the internal vector containing the variables.
     */
    inline const std::vector<Variable> & GetVariablesVector() const
    {
        return variables;
    }

    /**
     * Return the internal vector containing the variables.
     */
    inline std::vector<Variable> & GetVariablesVector()
    {
        return variables;
    }

    /**
     * Return a reference to the variable with the name indicated.
     * Add the variable if it doesn't exist.
     */
    inline Variable & ObtainVariable(const std::string & varName)
    {
        std::vector < Variable >::const_iterator end = variables.end();
        for (std::vector < Variable >::iterator i = variables.begin();i != end;++i)
        {
            if ( i->GetName() == varName)
                return *i;
        }

        variables.push_back(Variable(varName));
        return variables.back();
    }
    ///@}

private:

    std::vector < gd::Variable > variables;
    static Variable badVariable;
};

}

#endif // GDCORE_VARIABLESCONTAINER_H
