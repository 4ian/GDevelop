/** \file
 *  GDevelop
 *  2008-2016 Florian Rival (Florian.Rival@gmail.com)
 */
#if defined(GD_IDE_ONLY)
#ifndef VARIABLEPARSERCALLBACKS_H
#define VARIABLEPARSERCALLBACKS_H

#include <string>
#include <vector>
#include "GDCore/Events/Parsers/VariableParser.h"
namespace gd {
class EventsCodeGenerator;
class EventsCodeGenerationContext;
}  // namespace gd

namespace gdjs {

// TODO: Replace and remove (ExpressionCodeGenerator)

/**
 * \brief Callbacks called to generate the code for getting a variable.
 *
 * Usage example:
 \code

 \endcode
 */
class VariableCodeGenerationCallbacks : public gd::VariableParserCallbacks {
 public:
  enum VariableScope { LAYOUT_VARIABLE = 0, PROJECT_VARIABLE, OBJECT_VARIABLE };

  /**
   * \brief Default constructor for generating code for a layout/global
   * variable. \param output The string in which the code will be generated.
   * \param codeGenerator The code generator being used.
   * \param context The current code generation context.
   * \param scope The scope of the variable being accessed: LAYOUT_VARIABLE,
   * PROJECT_VARIABLE.
   */
  VariableCodeGenerationCallbacks(gd::String& output,
                                  gd::EventsCodeGenerator& codeGenerator_,
                                  gd::EventsCodeGenerationContext& context_,
                                  const VariableScope& scope_);
  /**

   * \brief Default constructor for generating code for an object variable.
   * \param output The string in which the code will be generated.
   * \param codeGenerator The code generator being used.
   * \param context The current code generation context.
   * \param object The name of the object
   */
  VariableCodeGenerationCallbacks(gd::String& output,
                                  gd::EventsCodeGenerator& codeGenerator_,
                                  gd::EventsCodeGenerationContext& context_,
                                  const gd::String& object);

  /**
   * \brief Called when the first variable has been parsed.
   * \param variableName The variable name.
   */
  virtual void OnRootVariable(gd::String variableName);

  /**
   * \brief Called when accessing the child of a structure variable.
   * \param variableName The child variable name.
   */
  virtual void OnChildVariable(gd::String variableName);

  /**
   * \brief Called when accessing the child of a structure variable using a
   * string expression in square brackets. \param variableName The expression
   * used to access the child variable.
   */
  virtual void OnChildSubscript(gd::String stringExpression);

 private:
  gd::String& output;
  gd::EventsCodeGenerator& codeGenerator;
  gd::EventsCodeGenerationContext& context;
  VariableScope scope;
  const gd::String object;  ///< The object name, when scope == OBJECT_VARIABLE.
};

}  // namespace gdjs

#endif  // VARIABLEPARSERCALLBACKS_H
#endif
