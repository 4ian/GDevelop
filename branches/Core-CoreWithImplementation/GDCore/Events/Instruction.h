/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
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
     * Default constructor: Construct an empty instruction
     */
    Instruction(std::string type_ = "");

    /**
     * Main constructor
     */
    Instruction(std::string type_, const std::vector <gd::Expression> & parameters_, bool inverted = false);

    virtual ~Instruction();

    /**
     * Return the type of the instruction. The type is used
     * \return The type of the instruction
     */
    std::string GetType() const { return type; }

    /** Change the instruction type
     * \param val New value to set
     */
    void SetType(const std::string & newType) { type = newType; }

    /**
     * Return true if the condition is inverted
     * \return true if the condition is inverted
     */
    bool IsInverted() const { return inverted; }

    /** Set if the instruction is inverted or not.
     * \param inverted true if the condition must be set as inverted
     */
    void SetInverted(bool inverted_) { inverted = inverted_; }

    /** Access a parameter. Return a bad expression if the parameter requested does not exists.
     * \return The current value of the parameter
     */
    const gd::Expression & GetParameter(unsigned int index) const;

    /** Access a parameter. Return a bad expression if the parameter requested does not exists.
     * \return The current value of the parameter
     */
    gd::Expression & GetParameter(unsigned int index);

    /** Get a reference to the std::vector containing the parameters.
     * \return A std::vector of string containing parameters
     */
    inline const std::vector < gd::Expression > & GetParameters() const { return parameters; }

    /** Replace all the parameters by new ones.
     * \param val A std::vector of string containing the parameters
     */
    inline void SetParameters(const std::vector < gd::Expression > & val) { parameters = val; }

    /** Change a particular parameter
     * \param nb The parameter number
     * \param val The new value of the parameter
     */
    void SetParameter(unsigned int nb, const gd::Expression & val);

    /**
     * Return a reference to the vector containing sub instructions
     */
    inline const std::vector < Instruction > & GetSubInstructions() const { return subInstructions; };

    /**
     * Return a reference to the vector containing sub instructions
     */
    inline std::vector < Instruction > & GetSubInstructions() { return subInstructions; };

    /**
     * Change sub instructions
     */
    inline void SetSubInstructions(const std::vector < Instruction > & subInstructions_) { subInstructions = subInstructions_; };

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







