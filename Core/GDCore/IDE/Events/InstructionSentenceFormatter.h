/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY)
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
   * \brief Create a sentence from an instruction and its metadata.
   *
   * Sentence is provided in the gd::InstructionMetadata passed as parameter.
   * Parameters placeholders ("_PARAMx_", x being the parameter index) are
   * replaced by their values stored in the isntruction passed as parameter.
   */
  gd::String Translate(const gd::Instruction &instr,
                       const gd::InstructionMetadata &metadata);

  /**
   * \brief Create a formatted sentence from an instruction and its metadata.
   */
  std::vector<std::pair<gd::String, gd::TextFormatting> > GetAsFormattedText(
      const gd::Instruction &instr, const gd::InstructionMetadata &metadata);

  /**
   * \brief Return the TextFormatting object associated to the \a type.
   */
  TextFormatting GetFormattingFromType(const gd::String &type);

  /**
   * \brief Return the label of a parameter type
   */
  gd::String LabelFromType(const gd::String &type);

  /**
   * \brief Load the configuration from the default configuration.
   */
  void LoadTypesFormattingFromConfig();

  std::map<gd::String, gd::TextFormatting> typesFormatting;

  static InstructionSentenceFormatter *Get() {
    if (NULL == _singleton) {
      _singleton = new InstructionSentenceFormatter;
    }

    return (static_cast<InstructionSentenceFormatter *>(_singleton));
  }

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
#endif
