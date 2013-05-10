/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
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

class GD_API EventsCodeGenerator : public gd::EventsCodeGenerator
{
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
    static std::string GenerateSceneEventsCompleteCode(gd::Project & project, gd::Layout & scene, std::vector < gd::BaseEventSPtr > & events, bool compilationForRuntime = false);

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
    void PreprocessEventList( std::vector < gd::BaseEventSPtr > & listEvent );

protected:
    virtual std::string GenerateParameterCodes(const std::string & parameter, const gd::ParameterMetadata & metadata,
                                               gd::EventsCodeGenerationContext & context,
                                               const std::vector < gd::Expression > & othersParameters,
                                               std::vector < std::pair<std::string, std::string> > * supplementaryParametersTypes);

    virtual std::string GenerateCurrentObjectFunctionCall(std::string objectListName,
                                                          const gd::ObjectMetadata & objMetadata,
                                                          std::string functionCallName,
                                                          std::string parametersStr);
    virtual std::string GenerateNotPickedObjectFunctionCall(std::string objectListName,
                                                            const gd::ObjectMetadata & objMetadata,
                                                            std::string functionCallName,
                                                            std::string parametersStr,
                                                            std::string defaultOutput);

    virtual std::string GenerateCurrentObjectAutomatismFunctionCall(std::string objectListName,
                                                                      std::string automatismName,
                                                                      const gd::AutomatismMetadata & autoInfo,
                                                                      std::string functionCallName,
                                                                      std::string parametersStr);

    virtual std::string GenerateNotPickedObjectAutomatismFunctionCall(std::string objectListName,
                                                                      std::string automatismName,
                                                                      const gd::AutomatismMetadata & autoInfo,
                                                                      std::string functionCallName,
                                                                      std::string parametersStr,
                                                                      std::string defaultOutput);

    virtual std::string GenerateObjectCondition(const std::string & objectName,
                                                            const gd::ObjectMetadata & objInfo,
                                                            const std::vector<std::string> & arguments,
                                                            const gd::InstructionMetadata & instrInfos,
                                                            const std::string & returnBoolean,
                                                            bool conditionInverted);

    virtual std::string GenerateAutomatismCondition(const std::string & objectName,
                                                                const std::string & automatismName,
                                                                const gd::AutomatismMetadata & autoInfo,
                                                                const std::vector<std::string> & arguments,
                                                                const gd::InstructionMetadata & instrInfos,
                                                                const std::string & returnBoolean,
                                                                bool conditionInverted);

    virtual std::string GenerateObjectAction(const std::string & objectName,
                                                        const gd::ObjectMetadata & objInfo,
                                                        const std::vector<std::string> & arguments,
                                                        const gd::InstructionMetadata & instrInfos);

    virtual std::string GenerateAutomatismAction(const std::string & objectName,
                                                            const std::string & automatismName,
                                                            const gd::AutomatismMetadata & autoInfo,
                                                            const std::vector<std::string> & arguments,
                                                            const gd::InstructionMetadata & instrInfos);

    /**
     * \brief Construct a code generator for the specified project and layout.
     */
    EventsCodeGenerator(gd::Project & project, const gd::Layout & layout);
    virtual ~EventsCodeGenerator();
};

#endif // EventsCodeGenerator_H
#endif
