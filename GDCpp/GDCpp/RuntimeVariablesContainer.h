/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#ifndef RUNTIMEVARIABLESCONTAINER_H
#define RUNTIMEVARIABLESCONTAINER_H
#include <string>
#include <map>
#include <vector>
#include "GDCore/Project/Variable.h"
namespace gd { class VariablesContainer; };
class BadRuntimeVariablesContainer;
class BadVariable;

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
    bool Has(const gd::String & name) const { return variables.find(name) != variables.end(); }

    #if defined(GD_IDE_ONLY)
    /**
     * \brief Return the number of variables in the container.
     */
    std::size_t Count() { return variables.size(); }
    #endif

    /**
     * \brief Return a reference to the variable called \a name.
     */
    virtual gd::Variable & Get(const gd::String & name);

    /**
     * \brief Return a reference to the variable called \a name.
     */
    virtual const gd::Variable & Get(const gd::String & name) const;

    /**
     * \brief Return a reference to the variable at the @ index position in the list.
     * \warning No bound check is made. Please use other overload of gd::VariablesContainer::Get when you do not have any efficiency request.
     * \note This specific overload can used by code generated from events when a variable index is known at the time of the code generation.
     */
    virtual gd::Variable & Get(std::size_t index) { return *variablesArray[index]; }

    /**
     * \brief Return a reference to the variable at the @ index position in the list.
     * \warning No bound check is made. Please use other overload of gd::VariablesContainer::GetVariable when you do not have any efficiency request.
     * \note This specific overload can used by code generated from events when a variable index is known at the time of the code generation.
     */
    virtual const gd::Variable & Get(std::size_t index) const { return *variablesArray[index]; }

    /**
     * \brief Return a "bad" variable that can be used when no other valid variable can be used.
     */
    static gd::Variable & GetBadVariable();

    /**
     * \brief Return a "bad" variables container that can be used when no other valid container can be used.
     */
    static RuntimeVariablesContainer & GetBadVariablesContainer();

    /**
     * \brief Merge the variables from the container with the already existing variables.
     *
     * Already existing variables values are replaced.
     * Newly added variables are available thanks to their index. Be careful: If the container was not empty,
     * the index of the new variables are not the same as their index in the original container.
     */
    virtual void Merge(const gd::VariablesContainer & container);

    /**
     * Get a map containing all variables.
     */
    const std::map < gd::String, gd::Variable* > & DumpAllVariables() { return variables; };

private:

    /**
     * \brief Clear the container.
     */
    void Clear();

    std::vector < gd::Variable* > variablesArray;
    mutable std::map < gd::String, gd::Variable* > variables;
    static BadVariable badVariable;
    static BadRuntimeVariablesContainer badVariablesContainer;
};


/**
 * \brief "Bad" variable, used by events when no other valid variable can be found.
 *
 * This variable has no state and always return 0 or the empty string.
 * \see RuntimeVariablesContainer
 * \see BadRuntimeVariablesContainer
 */
class GD_API BadVariable : public gd::Variable
{
public:
    BadVariable() : gd::Variable() {};
    virtual ~BadVariable() {};

    virtual void SetString(const gd::String &) { };
    virtual void SetValue(double) { };
    virtual bool HasChild(const gd::String & name) const { return false; }
    virtual Variable & GetChild(const gd::String & name) { return RuntimeVariablesContainer::GetBadVariable(); }
    virtual const Variable & GetChild(const gd::String & name) const { return RuntimeVariablesContainer::GetBadVariable(); }
};

/**
 * \brief "Bad" variable container, used by events when no other valid container can be found.
 *
 * This container has no state and always returns the bad variable ( see RuntimeVariablesContainer::GetBadVariable() ).
 * \see RuntimeVariablesContainer
 * \see BadVariable
 */
class GD_API BadRuntimeVariablesContainer : public RuntimeVariablesContainer
{
public:
    BadRuntimeVariablesContainer() : RuntimeVariablesContainer() {};
    virtual ~BadRuntimeVariablesContainer() {};

    virtual gd::Variable & Get(const gd::String & name) { return RuntimeVariablesContainer::GetBadVariable(); }
    virtual const gd::Variable & Get(const gd::String & name) const { return RuntimeVariablesContainer::GetBadVariable(); }
    virtual gd::Variable & Get(std::size_t index) { return RuntimeVariablesContainer::GetBadVariable(); }
    virtual const gd::Variable & Get(std::size_t index) const { return RuntimeVariablesContainer::GetBadVariable(); }
    virtual void Merge(const gd::VariablesContainer & container) {}
};

#endif // RUNTIMEVARIABLESCONTAINER_H
