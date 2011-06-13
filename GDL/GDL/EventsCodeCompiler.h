#ifndef EVENTSCODECOMPILER_H
#define EVENTSCODECOMPILER_H
#include <string>

class EventsCodeCompiler
{
    public:
        EventsCodeCompiler();
        virtual ~EventsCodeCompiler();

        static bool CompileEventsFileToBitCode(std::string eventsFile, std::string bitCodeFile);

    private:
};

#endif // EVENTSCODECOMPILER_H
