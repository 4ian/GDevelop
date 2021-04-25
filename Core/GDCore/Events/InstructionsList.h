/*
 * GDevelop Core
 * Copyright 2015 Victor Levasseur (victorlevasseur52@gmail.com)
 * This project is released under the MIT License.
 */

#ifndef GDCORE_INSTRUCTIONSLIST_H
#define GDCORE_INSTRUCTIONSLIST_H
#include <memory>
#include <vector>

#include "GDCore/Tools/Cacheable.h"
#include "GDCore/Tools/SPtrList.h"

namespace gd {
class Instruction;
}
namespace gd {
class Project;
}
namespace gd {
class SerializerElement;
}

namespace gd {

class InstructionsList : public SPtrList<gd::Instruction>,
                         public gd::Cacheable {
 public:
  // Hook some functions to update the cache
  Instruction& Insert(const Instruction& instruction,
                      size_t position = (size_t)-1) {
    Insert(std::make_shared<Instruction>(instruction), position);
  };

  void Insert(std::shared_ptr<Instruction> instruction,
              size_t position = (size_t)-1) {
    instruction->SetParent(this);
    SPtrList<Instruction>::Insert(instruction, position);
    InvalidateCache();
  };

  void Insert(const SPtrList<Instruction>& list,
              size_t begin,
              size_t end,
              size_t position = (size_t)-1) {
    if (begin >= list.size()) return;
    if (end < begin) return;
    if (end >= list.size()) end = list.size() - 1;

    for (std::size_t insertPos = 0; insertPos <= (end - begin); insertPos++) {
      const Instruction& instruction = list.Get(begin + insertPos);
      std::shared_ptr<Instruction> copiedInstruction =
          std::make_shared<Instruction>(instruction);
      copiedInstruction->SetParent(this);
      if (position != (size_t)-1 && position + insertPos < elements.size())
        elements.insert(elements.begin() + position + insertPos,
                        copiedInstruction);
      else
        elements.push_back(copiedInstruction);
    }

    InvalidateCache();
  };

  void Remove(const Instruction& instruction) {
    SPtrList<Instruction>::Remove(instruction);
    InvalidateCache();
  };

  void Remove(size_t index) {
    SPtrList<Instruction>::Remove(index);
    InvalidateCache();
  };

  void Clear() {
    SPtrList<Instruction>::Clear();
    InvalidateCache();
  };

  void Init(const SPtrList<Instruction>& other) {
    Clear();
    for (size_t i = 0; i < other.GetCount(); ++i)
      Insert(CloneRememberingOriginalElement(
          std::make_shared<Instruction>(other.Get(i))));
  };
  // End of the hooks

  void InsertInstructions(const InstructionsList& list,
                          size_t begin,
                          size_t end,
                          size_t position = (size_t)-1);

  /** \name Serialization
   */
  ///@{
  /**
   * \brief Serialize the instructions to the specified element
   * \see EventsListSerialization
   */
  void SerializeTo(gd::SerializerElement& element) const;

  /**
   * \brief Load the instructions from the specified element
   * \see EventsListSerialization
   */
  void UnserializeFrom(gd::Project& project,
                       const gd::SerializerElement& element);
  ///@}
};

}  // namespace gd

#endif
