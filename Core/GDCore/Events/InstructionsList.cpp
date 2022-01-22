/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "InstructionsList.h"

#include "GDCore/Events/Instruction.h"
#include "GDCore/Project/Project.h"
#include "Serialization.h"

namespace gd {

void InstructionsList::InsertInstructions(const InstructionsList& list,
                                          size_t begin,
                                          size_t end,
                                          size_t position) {
  if (begin >= list.size()) return;
  if (end < begin) return;
  if (end >= list.size()) end = list.size() - 1;

  for (std::size_t insertPos = 0; insertPos <= (end - begin); insertPos++) {
    const Instruction& instruction = *list.elements[begin + insertPos];
    std::shared_ptr<Instruction> copiedInstruction =
        std::make_shared<Instruction>(instruction);
    if (position != (size_t)-1 && position + insertPos < elements.size())
      elements.insert(elements.begin() + position + insertPos,
                      copiedInstruction);
    else
      elements.push_back(copiedInstruction);
  }
}

void InstructionsList::RemoveAfter(const size_t position) {
  elements.resize(position);
}

void InstructionsList::SerializeTo(SerializerElement& element) const {
  EventsListSerialization::SerializeInstructionsTo(*this, element);
}

void InstructionsList::UnserializeFrom(gd::Project& project,
                                       const SerializerElement& element) {
  EventsListSerialization::UnserializeInstructionsFrom(project, *this, element);
}

}  // namespace gd
