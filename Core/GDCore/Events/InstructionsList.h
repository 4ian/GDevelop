/*
 * GDevelop Core
 * Copyright 2015 Victor Levasseur (victorlevasseur52@gmail.com)
 * This project is released under the MIT License.
 */

#ifndef GDCORE_INSTRUCTIONSLIST_H
#define GDCORE_INSTRUCTIONSLIST_H
#include "GDCore/Tools/SPtrList.h"
#include <memory>
#include <vector>

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

class InstructionsList : public SPtrList<gd::Instruction> {
public:
  void InsertInstructions(const InstructionsList &list, size_t begin,
                          size_t end, size_t position = (size_t)-1);

  void RemoveAfter(size_t position);

  /** \name Serialization
   */
  ///@{
  /**
   * \brief Serialize the instructions to the specified element
   * \see EventsListSerialization
   */
  void SerializeTo(gd::SerializerElement &element) const;

  /**
   * \brief Load the instructions from the specified element
   * \see EventsListSerialization
   */
  void UnserializeFrom(gd::Project &project,
                       const gd::SerializerElement &element);
  ///@}
};

} // namespace gd

#endif
