/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "GDCore/IDE/Events/InstructionSentenceFormatter.h"
#include <algorithm>
#include <iostream>
#include <map>
#include <sstream>
#include <utility>
#include <vector>
#include "GDCore/CommonTools.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/String.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/Log.h"

using namespace std;

namespace gd {

InstructionSentenceFormatter *InstructionSentenceFormatter::_singleton = NULL;

std::vector<std::pair<gd::String, gd::TextFormatting> >
InstructionSentenceFormatter::GetAsFormattedText(
    const Instruction &instr, const gd::InstructionMetadata &metadata) {
  std::vector<std::pair<gd::String, gd::TextFormatting> > formattedStr;

  gd::String sentence = metadata.GetSentence();
  std::replace(sentence.Raw().begin(), sentence.Raw().end(), '\n', ' ');

  size_t loopCount = 0;
  bool parse = true;
  while (parse) {
    if (loopCount > 40) {
      break;
    }
    loopCount++;

    // Search first parameter
    parse = false;
    size_t firstParamPosition = gd::String::npos;
    size_t firstParamIndex = gd::String::npos;
    for (std::size_t i = 0; i < metadata.parameters.size(); ++i) {
      size_t paramPosition =
          sentence.find("_PARAM" + gd::String::From(i) + "_");
      if (paramPosition < firstParamPosition) {
        firstParamPosition = paramPosition;
        firstParamIndex = i;
        parse = true;
      }
    }

    // When a parameter is found, complete formatted gd::String.
    if (parse) {
      if (firstParamPosition !=
          0)  // Add constant text before the parameter if any
      {
        TextFormatting format;
        formattedStr.push_back(
            std::make_pair(sentence.substr(0, firstParamPosition), format));
      }

      // Add the parameter
      TextFormatting format;
      format.userData = firstParamIndex;

      gd::String text = instr.GetParameter(firstParamIndex).GetPlainString();
      std::replace(text.Raw().begin(),
                   text.Raw().end(),
                   '\n',
                   ' ');  // Using the raw std::string inside gd::String (no
                          // problems because it's only ANSI characters)

      formattedStr.push_back(std::make_pair(text, format));
      gd::String placeholder =
          "_PARAM" + gd::String::From(firstParamIndex) + "_";
      sentence = sentence.substr(firstParamPosition + placeholder.length());
    } else if (!sentence.empty())  // No more parameter found: Add the end of
                                   // the sentence
    {
      TextFormatting format;
      formattedStr.push_back(std::make_pair(sentence, format));
    }
  }

  return formattedStr;
}

gd::String InstructionSentenceFormatter::GetFullText(
    const gd::Instruction &instr, const gd::InstructionMetadata &metadata)
{
  const std::vector<std::pair<gd::String, gd::TextFormatting> > formattedText =
      GetAsFormattedText(instr, metadata);

  gd::String completeSentence = "";

  for (std::size_t id = 0; id < formattedText.size(); ++id) {
    completeSentence += formattedText.at(id).first;
  }

  return completeSentence;
}

}  // namespace gd
