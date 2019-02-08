/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Events/Parsers/ExpressionParser.h"
#include <algorithm>
#include <iostream>
#include "GDCore/CommonTools.h"
#include "GDCore/Events/Expression.h"
#include "GDCore/Extensions/Metadata/ExpressionMetadata.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Tools/Localization.h"

using namespace std;

namespace gd {

gd::String ExpressionParser::parserSeparators = " ,+-*/%.<>=&|;()#^![]{}";

size_t ExpressionParser::GetMinimalParametersNumber(
    const std::vector<gd::ParameterMetadata>& parametersInfos) {
  size_t nb = 0;
  for (std::size_t i = 0; i < parametersInfos.size(); ++i) {
    if (!parametersInfos[i].optional && !parametersInfos[i].codeOnly) nb++;
  }

  return nb;
}

size_t ExpressionParser::GetMaximalParametersNumber(
    const std::vector<gd::ParameterMetadata>& parametersInfos) {
  size_t nb = 0;
  for (std::size_t i = 0; i < parametersInfos.size(); ++i) {
    if (!parametersInfos[i].codeOnly) nb++;
  }

  return nb;
}

/**
 * Add blank parameters when code-only parameters are expected.
 * \param Parameters information
 * \param vector of parameters without code only parameters.
 */
std::vector<gd::Expression> CompleteParameters(
    const std::vector<gd::ParameterMetadata>& parametersInfo,
    const std::vector<gd::Expression>& parameters) {
  std::vector<gd::Expression> completeParameters = parameters;
  for (std::size_t i = 0; i < parametersInfo.size();
       ++i)  // Code only parameters are not included in expressions parameters.
  {
    if (parametersInfo[i].codeOnly) {
      if (i > completeParameters.size()) {
        cout << "Bad parameter count in expression.";
      }

      if (i >= completeParameters.size())
        completeParameters.push_back(gd::Expression(""));
      else
        completeParameters.insert(completeParameters.begin() + i,
                                  gd::Expression(""));
    } else {
      if (i >= completeParameters.size()) {
        completeParameters.push_back(gd::Expression(""));
      }
    }
  }
  return completeParameters;
}

bool ExpressionParser::ValidSyntax(const gd::String& str) {
  static const gd::String numerics = "0123456789.e";
  static const gd::String operators = "+/*-%";

  size_t parenthesisLevel = 0;
  gd::String lastOperator;

  bool parsingNumber = false;
  bool parsingScientificNotationNumber = false;
  bool parsingDecimalNumber = false;
  bool requestNumber = false;
  gd::String lastNumber;
  bool numberWasParsedLast = false;

  for (auto it = str.begin(); it != str.end(); ++it) {
    char32_t currentChar = *it;
    if (currentChar == U' ' || currentChar == U'\n') {
      if (requestNumber) {
        firstErrorStr = _("Number expected");

        return false;
      }

      if (parsingNumber) {
        parsingNumber = false;
        parsingScientificNotationNumber = false;
        parsingDecimalNumber = false;
        requestNumber = false;
        lastNumber.clear();
        numberWasParsedLast = true;
      }
    } else if (numerics.find(currentChar) != gd::String::npos) {
      requestNumber = false;

      if (currentChar == U'.') {
        if (!parsingNumber) {
          firstErrorStr = _("Syntax error");

          return false;
        }

        if (parsingDecimalNumber) {
          firstErrorStr = _("Syntax error in a number.");

          return false;
        }

        parsingDecimalNumber = true;
      }

      if (currentChar == U'e') {
        if (parsingScientificNotationNumber) {
          firstErrorStr = _("Syntax error in a number.");

          return false;
        }

        parsingScientificNotationNumber = true;
        requestNumber = true;
      }

      if (numberWasParsedLast) {
        firstErrorStr = _("Operator missing before a number");

        return false;
      }

      parsingNumber = true;
      lastNumber += currentChar;
    } else if (currentChar == U')') {
      if (requestNumber) {
        firstErrorStr = _("Number expected");

        return false;
      }

      if (parsingNumber) {
        parsingNumber = false;
        parsingScientificNotationNumber = false;
        parsingDecimalNumber = false;
        lastNumber.clear();
        numberWasParsedLast = true;
      }

      if (!numberWasParsedLast) {
        firstErrorStr = _("Superfluous operator before a paranthesis");

        return false;
      }

      if (parenthesisLevel > 0)
        parenthesisLevel--;
      else {
        firstErrorStr = _("Bad closing paranthesis");

        return false;
      }

      auto previousIt = it;
      --previousIt;
      if (*previousIt == U'(') {
        firstErrorStr = _("Empty paranthesis");

        return false;
      }
    } else if (currentChar == U'(') {
      if (requestNumber) {
        firstErrorStr = _("Number expected");

        return false;
      }

      if (parsingNumber) {
        parsingNumber = false;
        parsingScientificNotationNumber = false;
        parsingDecimalNumber = false;
        lastNumber.clear();
        numberWasParsedLast = true;
      }

      if (numberWasParsedLast) {
        firstErrorStr = _("Operator missing before a paranthesis");

        return false;
      }

      parenthesisLevel++;
      numberWasParsedLast = false;
    } else if (operators.find(currentChar) != gd::String::npos) {
      if (currentChar == U'-' && parsingNumber &&
          parsingScientificNotationNumber) {
        lastNumber += currentChar;
        requestNumber = true;
      } else {
        if (requestNumber) {
          firstErrorStr = _("Number expected");

          return false;
        }

        if (parsingNumber) {
          parsingNumber = false;
          parsingScientificNotationNumber = false;
          parsingDecimalNumber = false;
          lastNumber.clear();
          numberWasParsedLast = true;
        }

        if (currentChar != U'-' && currentChar != U'+' &&
            !numberWasParsedLast) {
          firstErrorStr = _("Operators without any number between them");

          return false;
        }

        numberWasParsedLast = false;
      }
    } else {
      firstErrorStr = _("Syntax error");

      return false;
    }
  }

  if (parsingNumber) {
    parsingNumber = false;
    parsingScientificNotationNumber = false;
    parsingDecimalNumber = false;
    lastNumber.clear();
    numberWasParsedLast = true;
  } else if (requestNumber) {
    firstErrorStr = _("Number expected");

    return false;
  }

  if (parenthesisLevel != 0) {
    firstErrorStr = _("Paranthesis mismatch");

    return false;
  }

  if (!numberWasParsedLast) {
    firstErrorStr = _("Alone operator at the end of the expression");

    return false;
  }

  return true;
}

bool ExpressionParser::ParseMathExpression(const gd::Platform& platform,
                                           const gd::ObjectsContainer& project,
                                           const gd::ObjectsContainer& layout,
                                           gd::ParserCallbacks& callbacks) {
  callbacks.SetReturnType("expression");
  gd::String expression = expressionPlainString;

  size_t parsePosition = 0;

  size_t firstPointPos = expression.find(".");
  size_t firstParPos = expression.find("(");

  gd::String expressionWithoutFunctions;
  gd::String nonFunctionToken;
  size_t nonFunctionTokenStartPos = gd::String::npos;

  while (firstPointPos != string::npos || firstParPos != string::npos) {
    // Identify name
    size_t nameEnd = firstPointPos < firstParPos ? firstPointPos : firstParPos;
    size_t nameStart = expression.find_last_of(parserSeparators, nameEnd - 1);
    nameStart++;

    gd::String nameBefore = expression.substr(nameStart, nameEnd - nameStart);
    gd::String objectName = nameBefore.FindAndReplace("~", " ");

    // Identify function name
    gd::String functionName = nameBefore;
    size_t functionNameEnd = nameEnd;
    vector<gd::Expression> parameters;

    bool nameIsFunction = firstPointPos > firstParPos;
    if (!nameIsFunction) {
      parameters.push_back(gd::Expression(objectName));
      functionNameEnd = expression.find_first_of(" (", nameEnd);
      if (nameEnd + 1 < expression.length())
        functionName =
            expression.substr(nameEnd + 1, functionNameEnd - (nameEnd + 1));
      if (functionNameEnd == string::npos) {
        functionName = "";
        functionNameEnd = expression.length() - 1;
      }
    }

    // Now we're going to identify the expression
    gd::ExpressionMetadata instructionInfos;

    if (functionName.substr(0, functionName.length() - 1)
            .find_first_of(parserSeparators) == string::npos) {
      bool functionFound = false;
      bool staticFunctionFound = false;
      bool objectFunctionFound = false;
      bool behaviorFunctionFound = false;

      // First try to bind to a static expression
      if (nameIsFunction &&
          MetadataProvider::HasExpression(platform, functionName)) {
        functionFound = true;
        staticFunctionFound = true;
        instructionInfos =
            MetadataProvider::GetExpressionMetadata(platform, functionName);
      }
      // Then search in object expression
      else if (!nameIsFunction &&
               MetadataProvider::HasObjectExpression(
                   platform,
                   gd::GetTypeOfObject(project, layout, objectName),
                   functionName)) {
        functionFound = true;
        objectFunctionFound = true;
        instructionInfos = MetadataProvider::GetObjectExpressionMetadata(
            platform,
            gd::GetTypeOfObject(project, layout, objectName),
            functionName);
      }
      // And in behaviors expressions
      else if (!nameIsFunction) {
        size_t firstDoublePoints = functionName.find("::");
        if (firstDoublePoints != string::npos) {
          gd::String autoName = functionName.substr(0, firstDoublePoints);
          if (firstDoublePoints + 2 < functionName.length())
            functionName = functionName.substr(firstDoublePoints + 2,
                                               functionName.length());
          else
            functionName = "";

          if (MetadataProvider::HasBehaviorExpression(
                  platform,
                  gd::GetTypeOfBehavior(project, layout, autoName),
                  functionName)) {
            parameters.push_back(gd::Expression(autoName));
            functionFound = true;
            behaviorFunctionFound = true;

            instructionInfos = MetadataProvider::GetBehaviorExpressionMetadata(
                platform,
                gd::GetTypeOfBehavior(project, layout, autoName),
                functionName);

            // Verify that object has behavior.
            vector<gd::String> behaviors =
                gd::GetBehaviorsOfObject(project, layout, objectName);
            if (find(behaviors.begin(), behaviors.end(), autoName) ==
                behaviors.end()) {
              cout << "Bad behavior requested" << endl;
              functionFound = false;
            }
          }
        }
      }

      if (functionFound)  // Add the function
      {
        // Identify parameters
        size_t parametersEnd = expression.find_first_of("(", functionNameEnd);
        gd::String currentParameterStr;
        char32_t previousChar = '(';
        bool takeSymbolsInAccount = true;
        if (parametersEnd != string::npos) {
          size_t level = 0;
          parametersEnd++;

          while (parametersEnd < expression.length() &&
                 !(expression[parametersEnd] == ')' && level == 0)) {
            // Be sure we are not in quotes
            if (expression[parametersEnd] == U'\"' && previousChar != U'\\')
              takeSymbolsInAccount = !takeSymbolsInAccount;

            // So as to be sure paranthesis don't belong to a parameter
            if (expression[parametersEnd] == U'(' && takeSymbolsInAccount)
              level++;
            if (expression[parametersEnd] == U')' && takeSymbolsInAccount)
              level--;

            // Add the character to the current parameter or terminate the
            // latter
            if ((expression[parametersEnd] == U',' && level == 0) &&
                takeSymbolsInAccount) {
              parameters.push_back(currentParameterStr);
              currentParameterStr.clear();
            } else
              currentParameterStr += expression[parametersEnd];

            previousChar = expression[parametersEnd];
            parametersEnd++;
          }
          if (currentParameterStr.find_first_not_of(" ") !=
              string::npos)  // Add last parameter if needed
          {
            parameters.push_back(currentParameterStr);
          }

          // Testing function call is properly closed
          if (parametersEnd == expression.length() ||
              expression[parametersEnd] != U')') {
            firstErrorStr = _("Paranthesis not closed");
            firstErrorPos = parametersEnd - 1;

            return false;
          }

          // Testing the number of parameters
          if (parameters.size() >
                  GetMaximalParametersNumber(instructionInfos.parameters) ||
              parameters.size() <
                  GetMinimalParametersNumber(instructionInfos.parameters)) {
            firstErrorPos = functionNameEnd;
            firstErrorStr = _("Incorrect number of parameters");
            firstErrorStr += " ";
            firstErrorStr += _("Expected (maximum) :");
            firstErrorStr += gd::String::From(
                GetMaximalParametersNumber(instructionInfos.parameters));

            return false;
          }

          // Preparing parameters
          parameters =
              CompleteParameters(instructionInfos.parameters, parameters);
          for (std::size_t i = 0; i < instructionInfos.parameters.size(); ++i) {
            if (!PrepareParameter(platform,
                                  project,
                                  layout,
                                  callbacks,
                                  parameters[i],
                                  instructionInfos.parameters[i],
                                  functionNameEnd))
              return false;
          }
        } else {
          firstErrorPos = functionNameEnd;
          firstErrorStr = _("Parameters' parenthesis missing");

          return false;
        }

        callbacks.OnConstantToken(
            nonFunctionToken +
            expression.substr(parsePosition, nameStart - parsePosition));
        expressionWithoutFunctions +=
            expression.substr(parsePosition, nameStart - parsePosition);
        nonFunctionToken.clear();
        nonFunctionTokenStartPos = gd::String::npos;

        if (objectFunctionFound)
          callbacks.OnObjectFunction(
              functionName, parameters, instructionInfos);
        else if (behaviorFunctionFound)
          callbacks.OnObjectBehaviorFunction(
              functionName, parameters, instructionInfos);
        else if (staticFunctionFound)
          callbacks.OnStaticFunction(
              functionName, parameters, instructionInfos);

        if (objectFunctionFound || behaviorFunctionFound || staticFunctionFound)
          expressionWithoutFunctions += "0";

        parsePosition = parametersEnd + 1;
        firstPointPos = expression.find(".", parametersEnd + 1);
        firstParPos = expression.find("(", parametersEnd + 1);
      } else  // Math function or math constant : Pass it.
      {
        nonFunctionToken += expression.substr(
            parsePosition, functionNameEnd + 1 - parsePosition);
        expressionWithoutFunctions += expression.substr(
            parsePosition, functionNameEnd + 1 - parsePosition);
        nonFunctionTokenStartPos = (nonFunctionTokenStartPos != gd::String::npos
                                        ? nonFunctionTokenStartPos
                                        : parsePosition);
        parsePosition = functionNameEnd + 1;
        firstPointPos = expression.find(".", functionNameEnd + 1);
        firstParPos = expression.find("(", functionNameEnd + 1);
      }
    } else  // Not a function call : Pass it
    {
      nonFunctionToken +=
          expression.substr(parsePosition, nameEnd + 1 - parsePosition);
      expressionWithoutFunctions +=
          expression.substr(parsePosition, nameEnd + 1 - parsePosition);
      nonFunctionTokenStartPos = (nonFunctionTokenStartPos != gd::String::npos
                                      ? nonFunctionTokenStartPos
                                      : parsePosition);
      parsePosition = nameEnd + 1;
      firstPointPos = expression.find(".", nameEnd + 1);
      firstParPos = expression.find("(", nameEnd + 1);
    }
  }

  if (parsePosition < expression.length() || !nonFunctionToken.empty())
    callbacks.OnConstantToken(
        nonFunctionToken +
        expression.substr(parsePosition, expression.length()));

  expressionWithoutFunctions +=
      expression.substr(parsePosition, expression.length());

  return ValidSyntax(expressionWithoutFunctions);
}

bool ExpressionParser::ParseStringExpression(const gd::Platform& platform,
                                             const gd::ObjectsContainer& project,
                                             const gd::ObjectsContainer& layout,
                                             gd::ParserCallbacks& callbacks) {
  callbacks.SetReturnType("string");
  gd::String expression = expressionPlainString;

  size_t parsePosition = 0;

  // Searching for first token.
  size_t firstPointPos = expression.find(".");
  size_t firstParPos = expression.find("(");
  size_t firstQuotePos = expression.find("\"");

  if (firstPointPos == string::npos && firstParPos == string::npos &&
      firstQuotePos == string::npos) {
    firstErrorPos = 0;
    firstErrorStr =
        _("The expression is invalid or empty. Enter a text ( surrounded by "
          "quotes ) or a function.");

    return false;
  }

  while (firstPointPos != string::npos || firstParPos != string::npos ||
         firstQuotePos != string::npos) {
    if (firstQuotePos < firstPointPos &&
        firstQuotePos < firstParPos)  // Adding a constant text
    {
      callbacks.OnConstantToken(
          expression.substr(parsePosition, firstQuotePos - parsePosition));

      // Finding start and end of quotes
      size_t finalQuotePosition = expression.find("\"", firstQuotePos + 1);
      while (finalQuotePosition ==
             expression.find("\\\"", finalQuotePosition - 1) + 1)
        finalQuotePosition = expression.find("\"", finalQuotePosition + 1);

      if (finalQuotePosition == string::npos) {
        firstErrorPos = firstQuotePos;
        firstErrorStr = _("Quotes not closed.");

        return false;
      }

      // Generating final text, by replacing \" by quotes
      gd::String finalText = expression.substr(
          firstQuotePos + 1, finalQuotePosition - (firstQuotePos + 1));

      size_t foundPos = finalText.find("\\\"");
      while (foundPos != string::npos) {
        if (foundPos != string::npos) finalText.replace(foundPos, 2, "\"");
        foundPos = finalText.find("\\\"", foundPos);
      }

      // Adding constant text instruction
      //(Function without name is considered as a constant text)
      vector<gd::Expression> parameters;
      parameters.push_back(finalText);
      gd::ExpressionMetadata noParametersInfo;

      callbacks.OnStaticFunction("", parameters, noParametersInfo);

      parsePosition = finalQuotePosition + 1;
    } else  // Adding a function
    {
      // Identify name
      size_t nameEnd =
          firstPointPos < firstParPos ? firstPointPos : firstParPos;
      size_t nameStart = expression.find_last_of(parserSeparators, nameEnd - 1);
      nameStart++;

      callbacks.OnConstantToken(
          expression.substr(parsePosition, nameStart - parsePosition));

      gd::String nameBefore = expression.substr(nameStart, nameEnd - nameStart);
      gd::String objectName = nameBefore.FindAndReplace("~", " ");

      // Identify function name
      gd::String functionName = nameBefore;
      size_t functionNameEnd = nameEnd;
      vector<gd::Expression> parameters;

      bool nameIsFunction = firstPointPos > firstParPos;
      if (!nameIsFunction) {
        parameters.push_back(gd::Expression(objectName));
        functionNameEnd = expression.find_first_of("( ", nameEnd);
        if (nameEnd + 1 < expression.length())
          functionName =
              expression.substr(nameEnd + 1, functionNameEnd - (nameEnd + 1));
      }

      // Identify parameters
      size_t parametersEnd = expression.find_first_of("(", functionNameEnd) + 1;
      char32_t previousChar = U'(';
      bool takeSymbolsInAccount = true;
      size_t level = 0;
      gd::String currentParameterStr;
      while (parametersEnd < expression.length() &&
             !(expression[parametersEnd] == U')' && level == 0)) {
        // Be sure we are not in quotes
        if (expression[parametersEnd] == U'\"' && previousChar != U'\\')
          takeSymbolsInAccount = !takeSymbolsInAccount;

        // So as to be sure paranthesis don't belong to a parameter
        if (expression[parametersEnd] == U'(' && takeSymbolsInAccount) level++;
        if (expression[parametersEnd] == U')' && takeSymbolsInAccount) level--;

        // Add the character to the current parameter or terminate the latter
        if ((expression[parametersEnd] == ',' && level == 0) &&
            takeSymbolsInAccount) {
          gd::Expression currentParameter(currentParameterStr);
          parameters.push_back(currentParameter);

          currentParameterStr.clear();
        } else
          currentParameterStr += expression[parametersEnd];

        previousChar = expression[parametersEnd];
        parametersEnd++;
      }

      if (parametersEnd == expression.length() ||
          expression[parametersEnd] != U')') {
        firstErrorPos = parametersEnd - 1;
        firstErrorStr = _("Paranthesis not closed");

        return false;
      }

      if (currentParameterStr.find_first_not_of(" ") !=
          string::npos)  // Add last parameter if needed
      {
        gd::Expression lastParameter(currentParameterStr);
        parameters.push_back(lastParameter);
      }

      bool functionFound = false;

      // First try to bind to a static str expression
      if (nameIsFunction &&
          MetadataProvider::HasStrExpression(platform, functionName)) {
        functionFound = true;
        const gd::ExpressionMetadata& expressionInfo =
            MetadataProvider::GetStrExpressionMetadata(platform, functionName);

        // Testing the number of parameters
        if (parameters.size() >
                GetMaximalParametersNumber(expressionInfo.parameters) ||
            parameters.size() <
                GetMinimalParametersNumber(expressionInfo.parameters)) {
          firstErrorPos = functionNameEnd;
          firstErrorStr = _("Incorrect number of parameters");

          return false;
        }

        // Preparing parameters
        parameters = CompleteParameters(expressionInfo.parameters, parameters);
        for (std::size_t i = 0;
             i < parameters.size() && i < expressionInfo.parameters.size();
             ++i) {
          if (!PrepareParameter(platform,
                                project,
                                layout,
                                callbacks,
                                parameters[i],
                                expressionInfo.parameters[i],
                                functionNameEnd))
            return false;
        }

        callbacks.OnStaticFunction(functionName, parameters, expressionInfo);
      }
      // Then an object member expression
      else if (!nameIsFunction &&
               MetadataProvider::HasObjectStrExpression(
                   platform,
                   gd::GetTypeOfObject(project, layout, objectName),
                   functionName)) {
        functionFound = true;
        const gd::ExpressionMetadata& expressionInfo =
            MetadataProvider::GetObjectStrExpressionMetadata(
                platform,
                gd::GetTypeOfObject(project, layout, nameBefore),
                functionName);

        // Testing the number of parameters
        if (parameters.size() >
                GetMaximalParametersNumber(expressionInfo.parameters) ||
            parameters.size() <
                GetMinimalParametersNumber(expressionInfo.parameters)) {
          firstErrorPos = functionNameEnd;
          firstErrorStr = _("Incorrect number of parameters");

          return false;
        }

        // Preparing parameters
        parameters = CompleteParameters(expressionInfo.parameters, parameters);
        for (std::size_t i = 0;
             i < parameters.size() && i < expressionInfo.parameters.size();
             ++i) {
          if (!PrepareParameter(platform,
                                project,
                                layout,
                                callbacks,
                                parameters[i],
                                expressionInfo.parameters[i],
                                functionNameEnd))
            return false;
        }

        callbacks.OnObjectFunction(functionName, parameters, expressionInfo);
      }
      // And search behaviors expressions
      else {
        size_t firstDoublePoints = functionName.find("::");
        if (firstDoublePoints != string::npos) {
          gd::String autoName = functionName.substr(0, firstDoublePoints);
          if (firstDoublePoints + 2 < functionName.length())
            functionName = functionName.substr(firstDoublePoints + 2,
                                               functionName.length());
          else
            functionName = "";

          if (MetadataProvider::HasBehaviorStrExpression(
                  platform,
                  gd::GetTypeOfBehavior(project, layout, autoName),
                  functionName)) {
            parameters.push_back(gd::Expression(autoName));
            functionFound = true;

            const gd::ExpressionMetadata& expressionInfo =
                MetadataProvider::GetBehaviorStrExpressionMetadata(
                    platform,
                    gd::GetTypeOfBehavior(project, layout, autoName),
                    functionName);

            // Verify that object has behavior.
            vector<gd::String> behaviors =
                gd::GetBehaviorsOfObject(project, layout, objectName);
            if (find(behaviors.begin(), behaviors.end(), autoName) ==
                behaviors.end()) {
              cout << "Bad behavior requested" << endl;
              functionFound = false;
            } else {
              // Testing the number of parameters
              if (parameters.size() >
                      GetMaximalParametersNumber(expressionInfo.parameters) ||
                  parameters.size() <
                      GetMinimalParametersNumber(expressionInfo.parameters)) {
                firstErrorPos = functionNameEnd;
                firstErrorStr = _("Incorrect number of parameters");

                return false;
              }

              // Preparing parameters
              parameters =
                  CompleteParameters(expressionInfo.parameters, parameters);
              for (std::size_t i = 0; i < parameters.size() &&
                                      i < expressionInfo.parameters.size();
                   ++i) {
                if (!PrepareParameter(platform,
                                      project,
                                      layout,
                                      callbacks,
                                      parameters[i],
                                      expressionInfo.parameters[i],
                                      functionNameEnd))
                  return false;
              }

              callbacks.OnObjectBehaviorFunction(
                  functionName, parameters, expressionInfo);
            }
          }
        }
      }

      // Note : _No_ support for implicit conversion from math result to string

      if (!functionFound)  // Function was not found
      {
        firstErrorPos = nameStart;
        firstErrorStr = _("Function not recognized.");

        return false;
      }

      parsePosition = parametersEnd + 1;
    }

    // Searching for next token
    size_t firstPlusPos = expression.find("+", parsePosition);
    firstPointPos = expression.find(".", parsePosition);
    firstParPos = expression.find("(", parsePosition);
    firstQuotePos = expression.find("\"", parsePosition);

    // Checking for a + between token
    if ((firstPointPos != string::npos || firstParPos != string::npos ||
         firstQuotePos != string::npos)) {
      size_t nextTokenPos = firstPointPos;
      if (firstParPos < nextTokenPos) nextTokenPos = firstParPos;
      if (firstQuotePos < nextTokenPos) nextTokenPos = firstQuotePos;

      if (nextTokenPos < firstPlusPos) {
        firstErrorPos = nextTokenPos;
        firstErrorStr = _("Symbol missing between two +.");

        return false;
      } else if (expression.find("+", firstPlusPos + 1) < nextTokenPos) {
        firstErrorPos = firstPlusPos;
        firstErrorStr = _("Symbol missing between two +.");

        return false;
      }
    }
  }

  if (expression.substr(parsePosition, expression.length())
          .find_first_not_of(" \n") != gd::String::npos) {
    firstErrorPos = parsePosition;
    firstErrorStr = _("Bad symbol at the end of the expression.");

    return false;
  }

  return true;
}

bool ExpressionParser::PrepareParameter(
    const gd::Platform& platform,
    const gd::ObjectsContainer& project,
    const gd::ObjectsContainer& layout,
    ParserCallbacks& callbacks,
    gd::Expression& parameter,
    const gd::ParameterMetadata& parametersInfo,
    const size_t positionInExpression) {
  if (ParameterMetadata::IsExpression("number", parametersInfo.type)) {
    if (parametersInfo.optional && parameter.GetPlainString().empty())
      parameter = parametersInfo.defaultValue.empty()
                      ? gd::Expression("0")
                      : gd::Expression(parametersInfo.defaultValue);

    if (!callbacks.OnSubMathExpression(platform, project, layout, parameter)) {
      firstErrorStr = callbacks.firstErrorStr;
      firstErrorPos = callbacks.firstErrorPos + positionInExpression;

      return false;
    }
  } else if (ParameterMetadata::IsExpression("string", parametersInfo.type)) {
    if (parametersInfo.optional && parameter.GetPlainString().empty())
      parameter = parametersInfo.defaultValue.empty()
                      ? gd::Expression("\"\"")
                      : gd::Expression(parametersInfo.defaultValue);

    if (!callbacks.OnSubTextExpression(platform, project, layout, parameter)) {
      firstErrorStr = callbacks.firstErrorStr;
      firstErrorPos = callbacks.firstErrorPos + positionInExpression;

      return false;
    }
  }

  return true;
}

ExpressionParser::ExpressionParser(const gd::String& expressionPlainString_)
    : expressionPlainString(expressionPlainString_) {}

}  // namespace gd
