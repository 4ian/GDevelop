/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef LISTVARIABLE_H
#define LISTVARIABLE_H

#include <vector>
#include <string>
#include "GDL/Variable.h"
class TiXmlElement;
#if defined(GD_IDE_ONLY)
#include "GDCore/PlatformDefinition/VariablesContainer.h"
#endif

/**
 * \brief A container for Game Develop variables.
 *
 * A container containing Game Develop variables. Used by objects, games and scenes.
 *
 * \ingroup GameEngine
 * \ingroup PlatformDefinition
 */
class GD_API ListVariable
#if defined(GD_IDE_ONLY)
 : public gd::VariablesContainer
#endif
{
public:
    ListVariable() {};
    virtual ~ListVariable() {};

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

    /**
     * Check for existence of a variable in the list.
     */
    inline bool HasVariableNamed(const std::string & varName) const
    {
        std::vector < Variable >::const_iterator end = variables.end();
        for (std::vector < Variable >::const_iterator i = variables.begin();i != end;++i)
        {
            if ( i->GetName() == varName)
                return true;
        }

        return false;
    }

    /**
     * Clear all variables of the list.
     */
    inline void Clear()
    {
        variables.clear();
    }

    #if defined(GD_IDE_ONLY)
    /** \name Specialization of gd::VariablesContainer members
     * See gd::VariablesContainer documentation for more information about what these members functions should do.
     */
    ///@{
    virtual ListVariable * Clone() const { return new ListVariable(*this); };
    virtual void Create(const gd::VariablesContainer & source);

    virtual Variable & GetVariable(const std::string & name);
    virtual const Variable & GetVariable(const std::string & name) const;
    virtual unsigned int GetVariablePosition(const std::string & name) const;
    virtual unsigned int GetVariableCount() const;
    virtual void InsertNewVariable(const std::string & name, unsigned int position);
    virtual void InsertVariable(const gd::Variable & variable, unsigned int position);
    virtual void RemoveVariable(const std::string & name);
    virtual void SwapVariables(unsigned int firstVariableIndex, unsigned int secondVariableIndex);
    ///@}
    #endif

    /** \name Serialization
     * See gd::VariablesContainer documentation for more information about what these members functions should do.
     */
    ///@{
    virtual void LoadFromXml(const TiXmlElement * element);
    #if defined(GD_IDE_ONLY)
    virtual void SaveToXml(TiXmlElement * element) const;
    #endif
    ///@}

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

private:
    std::vector < Variable > variables;

    static Variable badVariable;
};

#endif // LISTVARIABLE_H

