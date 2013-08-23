/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef RUNTIMEVARIABLESCONTAINER_H
#define RUNTIMEVARIABLESCONTAINER_H
#include <string>
#include <map>
#include <vector>
#include "GDCore/PlatformDefinition/Variable.h"
namespace gd { class VariablesContainer; };

/**
 * \brief Container for gd::Variable used at by games at runtime
 *
 * See gd::VariablesContainer for the container used for storage.
 *
 * \see gd::VariablesContainer
 * \see RuntimeScene
 * \see RuntimeObject
 *
 * \ingroup GameEngine
 */
class GD_API RuntimeVariablesContainer
{
public:
    /**
     * \brief Construct a RuntimeVariablesContainer from a gd::VariablesContainer.
     *
     * Variables contained in the original container will be accessible thanks to their
     * index.
     */
    RuntimeVariablesContainer(const gd::VariablesContainer & container);

    /**
     * \brief Construct an empty container.
     */
    RuntimeVariablesContainer() {};

    /**
     * \brief Initialize a RuntimeVariablesContainer from a gd::VariablesContainer.
     *
     * Variables contained in the original container will be accessible thanks to their
     * index.<br>
     * Already existing variables will be erased.
     */
    RuntimeVariablesContainer& operator=(const gd::VariablesContainer & container);

    /**
     * \brief Destructor: Properly clear the container.
     */
    virtual ~RuntimeVariablesContainer() {Clear();};

    /**
     * \brief Return true if the specified variable is in the container
     */
    bool Has(const std::string & name) const { return variables.find(name) != variables.end(); }

    #if defined(GD_IDE_ONLY)
    /** 
     * \brief Return the number of variables in the container.
     */
    unsigned int Count() { return variables.size(); }
    #endif

    /**
     * \brief Return a reference to the variable called \a name.
     */
    gd::Variable & Get(const std::string & name);

    /**
     * \brief Return a reference to the variable called \a name.
     */
    const gd::Variable & Get(const std::string & name) const;

    /**
     * variablesArrayReturn a reference to the variable at the @ index position in the list.
     * \warning No bound check is made. Please use other overload of gd::VariablesContainer::Get when you do not have any efficiency request.
     * \note This specific overload can used by code generated from events when a variable index is known at the time of the code generation.
     */
    inline gd::Variable & Get(unsigned int index) { return *variablesArray[index]; }

    /**
     * variablesArrayReturn a reference to the variable at the @ index position in the list.
     * \warning No bound check is made. Please use other overload of gd::VariablesContainer::GetVariable when you do not have any efficiency request.
     * \note This specific overload can used by code generated from events when a variable index is known at the time of the code generation.
     */
    inline const gd::Variable & Get(unsigned int index) const { return *variablesArray[index]; }

    /**
     * \brief Shortcut for Get(varName).GetString()
     */
    inline const std::string & GetVariableString(const std::string & varName) const
    {
        return Get(varName).GetString();
    }

    /**
     * \brief Shortcut for Get(varName).GetValue()
     */
    inline double GetVariableValue(const std::string & varName) const
    {
        return Get(varName).GetValue();
    }

    /**
     * \brief Merge the variables from the container with the already existing variables.
     *
     * Already existing variables values are replaced.
     * Newly added variables are available thanks to their index. Be careful: If the container was not empty,
     * the index of the new variables are not the same as their index in the original container.
     */
    void Merge(const gd::VariablesContainer & container);

    /**
     * Get a map containing all variables.
     */
    const std::map < std::string, gd::Variable* > & DumpAllVariables() { return variables; };

private:

    /**
     * \brief Clear the container.
     */
    void Clear();

    std::vector < gd::Variable* > variablesArray;
    mutable std::map < std::string, gd::Variable* > variables;
    static gd::Variable badVariable;
};

#endif // RUNTIMEVARIABLESCONTAINER_H