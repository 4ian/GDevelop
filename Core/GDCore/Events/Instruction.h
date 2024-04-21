/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef INSTRUCTION_H
#define INSTRUCTION_H
#include <memory>
#include <vector>

#include "GDCore/Events/Expression.h"
#include "GDCore/Events/InstructionsList.h"
#include "GDCore/String.h"

namespace gd {

/**
 * \brief An instruction is a member of an event: It can be a condition or an
 * action.
 *
 * An instruction has a type, which define what it does, and some parameters. It
 * can also be set as inverted (when the instruction is a condition) and it
 * can have sub instructions. This class does nothing particular except storing
 * these data.
 *
 * \see gd::BaseEvent
 *
 * \ingroup Events
 */
class GD_CORE_API Instruction {
 public:
  /**
   * \brief Default constructor
   * \param type The type of the instruction
   */
  Instruction(gd::String type_ = "");

  /**
   * \brief Constructor
   * \param type The type of the instruction
   * \param parameters A vector containing the parameters of the instruction
   * \param inverted true to set the instruction as inverted (used for condition
   * instructions).
   */
  Instruction(gd::String type_,
              const std::vector<gd::Expression>& parameters_,
              bool inverted = false);

  virtual ~Instruction(){};

  /**
   * \brief Return the type of the instruction.
   * \return The type of the instruction
   */
  const gd::String& GetType() const { return type; }

  /**
   * \brief Change the instruction type
   * \param val The new type of the instruction
   */
  void SetType(const gd::String& newType) { type = newType; }

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
   * \brief Return true if the async instruction should be awaited.
   * This is not relevant if the instruction is not optionally asynchronous.
   *
   * \return true if the instruction is to be awaited
   */
  bool IsAwaited() const { return awaitAsync; }

  /**
   * \brief Set if the async instruction is to be awaited or not.
   * This is not relevant if the instruction is not optionally asynchronous.
   *
   * \param inverted true if the instruction must be awaited
   */
  void SetAwaited(bool awaited) { awaitAsync = awaited; }

  /**
   * \brief Return the number of parameters of the instruction.
   */
  std::size_t GetParametersCount() const { return parameters.size(); }

  /**
   * \brief Change the number of parameter of the instruction.
   *
   * If the new size if larger than the previous, new blank parameters are
   * added.
   */
  void SetParametersCount(std::size_t size);

  /**
   * \brief Get the value of a parameter.
   *
   * Return an empty expression if the parameter requested does not exists.
   * \return The current value of the parameter.
   */
  const gd::Expression& GetParameter(std::size_t index) const;

  /**
   * \brief Get the value of a parameter.
   *
   * Return an empty expression if the parameter requested does not exists.
   * \return The current value of the parameter.
   */
  gd::Expression& GetParameter(std::size_t index);

  /** Change the specified parameter
   * \param nb The parameter number
   * \param val The new value of the parameter
   */
  void SetParameter(std::size_t nb, const gd::Expression& val);

  /** Add a parameter at the end
   * \param val The new value of the parameter
   */
  void AddParameter(const gd::Expression& val);

  /** \brief Get a reference to the std::vector containing the parameters.
   * \return A std::vector containing the parameters
   */
  inline const std::vector<gd::Expression>& GetParameters() const {
    return parameters;
  }

  /** \brief Replace all the parameters by new ones.
   * \param val A vector containing the new parameters.
   */
  inline void SetParameters(const std::vector<gd::Expression>& val) {
    parameters = val;
  }

  /**
   * \brief Return a reference to the vector containing sub instructions
   */
  inline const gd::InstructionsList& GetSubInstructions() const {
    return subInstructions;
  };

  /**
   * \brief Return a reference to the vector containing sub instructions
   */
  inline gd::InstructionsList& GetSubInstructions() { return subInstructions; };

  /**
   * \brief Return the original instruction this instruction was copied from.
   *
   * Useful to get reference to the original instruction in memory during code
   * generation, to ensure stable unique identifiers.
   */
  std::weak_ptr<Instruction> GetOriginalInstruction() {
    return originalInstruction;
  };

  friend std::shared_ptr<Instruction> CloneRememberingOriginalElement(
      std::shared_ptr<Instruction> instruction);

 private:
  gd::String type;  ///< Instruction type
  bool inverted;  ///< True if the instruction if inverted. Only applicable for
                  ///< instruction used as conditions by events
  bool awaitAsync =
      false;  ///< Tells the code generator whether the optionally asynchronous
              ///< instruction should be generated as asynchronous (awaited) or not.
  mutable std::vector<gd::Expression>
      parameters;                        ///< Vector containing the parameters
  gd::InstructionsList subInstructions;  ///< Sub instructions, if applicable.

  std::weak_ptr<Instruction>
      originalInstruction;  ///< Pointer used to remember which gd::Instruction
                            ///< this instruction was copied from. Useful to
                            ///< ensure the stability of code generation (as
                            ///< some part of code generation uses the pointer
                            ///< to the instruction as a unique identifier).

  static gd::Expression badExpression;
};

/**
 * Clone the given instruction, returning an instruction for which
 * `GetOriginalInstruction()` returns the originally copied instruction.
 */
std::shared_ptr<Instruction> GD_CORE_API
CloneRememberingOriginalElement(std::shared_ptr<Instruction> instruction);

}  // namespace gd

#endif  // INSTRUCTION_H
