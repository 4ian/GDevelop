/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef EventsCodeGenerator_H
#define EventsCodeGenerator_H
#include <vector>
#include "GDCore/Events/Event.h"

class GD_API EventsCodeGenerator
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
    static std::string GenerateSceneEventsCompleteCode(const gd::Platform & platform, gd::Project & project, gd::Layout & scene, std::vector < gd::BaseEventSPtr > & events, bool compilationForRuntime = false);

    /**
     * Generate complete C++ file for compiling external events.
     * \note If events.AreCompiled() == false, no code is generated.
     *
     * \param project Game used
     * \param events External events used.
     * \param compilationForRuntime Set this to true if the code is generated for runtime.
     * \return C++ code
     */
    static std::string GenerateExternalEventsCompleteCode(const gd::Platform & platform, gd::Project & project, gd::ExternalEvents & events, bool compilationForRuntime = false);

    /**
     * \brief GD C++ Platform has a specific processing function so as to handle profiling.
     */
    static void PreprocessEventList( gd::Project & project, gd::Layout & scene, std::vector < gd::BaseEventSPtr > & listEvent );
};

#endif // EventsCodeGenerator_H
#endif
