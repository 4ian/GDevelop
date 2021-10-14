/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef TRANSLATEACTION_H
#define TRANSLATEACTION_H
#include <map>
#include <utility>
#include <vector>
#include "GDCore/String.h"
#include "GDCore/Events/Instruction.h"
#include "GDCore/IDE/Events/TextFormatting.h"
namespace gd {
class InstructionMetadata;
}

namespace gd {

/**
 * \brief Generate user friendly sentences and information from an action or
 * condition metadata.
 */
class GD_CORE_API InstructionSentenceFormatter {
 public:
  /**
   * \brief Create a formatted sentence from an instruction and its metadata.
   */
  std::vector<std::pair<gd::String, gd::TextFormatting> > GetAsFormattedText(
      const gd::Instruction &instr, const gd::InstructionMetadata &metadata);

  static InstructionSentenceFormatter *Get() {
    if (NULL == _singleton) {
      _singleton = new InstructionSentenceFormatter;
    }

    return (static_cast<InstructionSentenceFormatter *>(_singleton));
  }

  gd::String GetFullText(const gd::Instruction &instr,
                         const gd::InstructionMetadata &metadata);

  static void DestroySingleton() {
    if (NULL != _singleton) {
      delete _singleton;
      _singleton = NULL;
    }
  }

  virtual ~InstructionSentenceFormatter(){};

 private:
  InstructionSentenceFormatter(){};
  static InstructionSentenceFormatter *_singleton;
};

}  // namespace gd
#endif  // TRANSLATEACTION_H
