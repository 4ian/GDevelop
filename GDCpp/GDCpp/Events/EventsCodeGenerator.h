/*
 * GDevelop C++ Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

#if defined(GD_IDE_ONLY)

#ifndef EventsCodeGenerator_H
#define EventsCodeGenerator_H
#include <vector>
#include <string>
#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsCodeGenerator.h"
namespace gd { class ObjectMetadata; }
namespace gd { class AutomatismMetadata; }
namespace gd { class InstructionMetadata; }
namespace gd { class ExpressionCodeGenerationInformation; }

class GD_API EventsCodeGenerator : public gd::EventsCodeGenerator
{
  friend class VariableCodeGenerationCallbacks;
public:

    /**
     * Generate complete C++ file for compiling events of a scene
     *
     * \param project Game used
     * \param scene Scene used
     * \param events events of the scene
     * \param compilationForRuntime Set this to true if the code is generated for runtime.
     * \return C++ code
     */
    static std::string GenerateSceneEventsCompleteCode(gd::Project & project, gd::Layout & scene, gd::EventsList & events, bool compilationForRuntime = false);

    /**
     * Generate complete C++ file for compiling external events.
     * \note If events.AreCompiled() == false, no code is generated.
     *
     * \param project Game used
     * \param events External events used.
     * \param compilationForRuntime Set this to true if the code is generated for runtime.
     * \return C++ code
     */
    static std::string GenerateExternalEventsCompleteCode(gd::Project & project, gd::ExternalEvents & events, bool compilationForRuntime = false);

    /**
     * \brief GD C++ Platform has a specific processing function so as to handle profiling.
     */
    void PreprocessEventList( gd::EventsList & listEvent );

protected:
    virtual std::string GenerateParameterCodes(const std::string & parameter, const gd::ParameterMetadata & metadata,
                                               gd::EventsCodeGenerationContext & context,
                                               const std::string & previousParameter,
                                               std::vector < std::pair<std::string, std::string> > * supplementaryParametersTypes);

    virtual std::string GenerateObjectFunctionCall(std::string objectListName,
                                                          const gd::ObjectMetadata & objMetadata,
                                                          const gd::ExpressionCodeGenerationInformation & codeInfo,
                                                          std::string parametersStr,
                                                          std::string defaultOutput,
                                                          gd::EventsCodeGenerationContext & context);

    virtual std::string GenerateObjectAutomatismFunctionCall(std::string objectListName,
                                                                      std::string automatismName,
                                                                      const gd::AutomatismMetadata & autoInfo,
                                                                      const gd::ExpressionCodeGenerationInformation & codeInfo,
                                                                      std::string parametersStr,
                                                                      std::string defaultOutput,
                                                                      gd::EventsCodeGenerationContext & context);

    virtual std::string GenerateObjectCondition(const std::string & objectName,
                                                            const gd::ObjectMetadata & objInfo,
                                                            const std::vector<std::string> & arguments,
                                                            const gd::InstructionMetadata & instrInfos,
                                                            const std::string & returnBoolean,
                                                            bool conditionInverted,
                                                            gd::EventsCodeGenerationContext & context);

    virtual std::string GenerateAutomatismCondition(const std::string & objectName,
                                                                const std::string & automatismName,
                                                                const gd::AutomatismMetadata & autoInfo,
                                                                const std::vector<std::string> & arguments,
                                                                const gd::InstructionMetadata & instrInfos,
                                                                const std::string & returnBoolean,
                                                                bool conditionInverted,
                                                                gd::EventsCodeGenerationContext & context);

    virtual std::string GenerateObjectAction(const std::string & objectName,
                                                        const gd::ObjectMetadata & objInfo,
                                                        const std::vector<std::string> & arguments,
                                                        const gd::InstructionMetadata & instrInfos,
                                                        gd::EventsCodeGenerationContext & context);

    virtual std::string GenerateAutomatismAction(const std::string & objectName,
                                                            const std::string & automatismName,
                                                            const gd::AutomatismMetadata & autoInfo,
                                                            const std::vector<std::string> & arguments,
                                                            const gd::InstructionMetadata & instrInfos,
                                                            gd::EventsCodeGenerationContext & context);

    /**
     * \brief Construct a code generator for the specified project and layout.
     */
    EventsCodeGenerator(gd::Project & project, const gd::Layout & layout);
    virtual ~EventsCodeGenerator();
};

#endif // EventsCodeGenerator_H
#endif
