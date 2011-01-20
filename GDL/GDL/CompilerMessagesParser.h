
#if !defined(GD_NO_DYNAMIC_EXTENSIONS)
#if defined(GD_IDE_ONLY)

#ifndef COMPILERERRORSPARSER_H
#define COMPILERERRORSPARSER_H
#include <string>
#include <vector>

class GD_API CompilerMessage
{
public:
    CompilerMessage() : line(std::string::npos) {};

    std::string file;
    size_t line;
    std::string message;
    enum MessageType
    {
        simple,
        error
    } messageType;
};

class GD_API CompilerMessagesParser
{
    public:
        CompilerMessagesParser() {};
        virtual ~CompilerMessagesParser() {};

        void ParseOutput(std::vector<std::string> output);

        std::vector < CompilerMessage > parsedErrors;

    private:
};

#endif // COMPILERERRORSPARSER_H

#endif
#endif
