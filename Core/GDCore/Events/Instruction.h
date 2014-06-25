/*
 * Game Develop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#ifndef INSTRUCTION_H
#define INSTRUCTION_H
#include <string>
#include <vector>
#include "GDCore/Events/Expression.h"

namespace gd
{

/**
 * \brief An instruction is a member of an event: It can be a condition or an action.
 *
 * An instruction has a type, which define what it does, and some parameters. It can also be set as inverted ( when the instruction is a condition ) and
 * it can have sub instructions.
 * This class does nothing particular except storing these data.
 *
 * \see gd::BaseEvent
 *
 * \ingroup Events
 */
class GD_CORE_API Instruction
{
public:

    /**
     * \brief Default constructor
     * \param type The type of the instruction
     */
    Instruction(std::string type_ = "");

    /**
     * \brief Constructor
     * \param type The type of the instruction
     * \param parameters A vector containing the parameters of the instruction
     * \param inverted true to set the instruction as inverted (used for condition instructions).
     */
    Instruction(std::string type_, const std::vector <gd::Expression> & parameters_, bool inverted = false);

    virtual ~Instruction();

    /**
     * \brief Return the type of the instruction.
     * \return The type of the instruction
     */
    std::string GetType() const { return type; }

    /**
     * \brief Change the instruction type
     * \param val The new type of the instruction
     */
    void SetType(const std::string & newType) { type = newType; }

    /**
     * \brief Return true if the condition is inverted
     * \return true if the condition is inverted
     */
    bool IsInverted() const { return inverted; }

    /**
     * \brief Set if the instruction is inverted or not.
     * \param inverted true if the condition must be set as inverted
     */
    void SetInverted(bool inverted_) { inverted = inverted_; }

    /**
     * \brief Return the number of parameters of the instruction.
     */
    unsigned int GetParametersCount() const { return parameters.size(); }

    /**
     * \brief Change the number of parameter of the instruction.
     *
     * If the new size if larger than the previous, new blank parameters are added.
     */
    void SetParametersCount(unsigned int size);

    /**
     * \brief Get the value of a parameter.
     *
     * Return an empty expression if the parameter requested does not exists.
     * \return The current value of the parameter.
     */
    const gd::Expression & GetParameter(unsigned int index) const;

    /**
     * \brief Get the value of a parameter.
     *
     * Return an empty expression if the parameter requested does not exists.
     * \return The current value of the parameter.
     */
    gd::Expression & GetParameter(unsigned int index);

    /** Change the specified parameter
     * \param nb The parameter number
     * \param val The new value of the parameter
     */
    void SetParameter(unsigned int nb, const gd::Expression & val);

    /** \brief Get a reference to the std::vector containing the parameters.
     * \return A std::vector containing the parameters
     */
    inline const std::vector < gd::Expression > & GetParameters() const { return parameters; }

    /** \brief Replace all the parameters by new ones.
     * \param val A vector containing the new parameters.
     */
    inline void SetParameters(const std::vector < gd::Expression > & val) { parameters = val; }

    /**
     * \brief Return a reference to the vector containing sub instructions
     */
    inline const std::vector < Instruction > & GetSubInstructions() const { return subInstructions; };

    /**
     * \brief Return a reference to the vector containing sub instructions
     */
    inline std::vector < Instruction > & GetSubInstructions() { return subInstructions; };

    /** \name Rendering
     * Members related to the instruction rendering in an event editor.
     */
    ///@{

    mutable bool renderedHeightNeedUpdate; ///< True if the instruction height may have changed and must be computed again.
    mutable unsigned int renderedHeight; ///<Height of the instruction rendered in an event editor.
    mutable bool selected; ///<True if selected in an event editor.

    ///@}

private:

    std::string                             type; ///< Instruction type
    bool                                    inverted; ///< True if the instruction if inverted. Only applicable for instruction used as conditions by events
    mutable std::vector < gd::Expression >    parameters; ///< Vector containing the parameters
    std::vector < Instruction >             subInstructions; ///< Sub instructions, if applicable.

    static gd::Expression badExpression;
};

}

#endif // INSTRUCTION_H







