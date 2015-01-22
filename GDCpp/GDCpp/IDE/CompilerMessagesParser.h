/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY)

#ifndef COMPILERERRORSPARSER_H
#define COMPILERERRORSPARSER_H
#include <string>
#include <vector>

namespace GDpriv
{

/**
 * \brief Internal class representing a compiler output
 */
class GD_API CompilerMessage
{
public:
    CompilerMessage() : line(std::string::npos), column(std::string::npos) {};

    std::string file;
    size_t line;
    size_t column;
    std::string message;
    enum MessageType
    {
        simple,
        error
    } messageType;
};

/**
 * \brief Internal class to parse compiler raw output to a CompilerMessage
 */
class GD_API CompilerMessagesParser
{
    public:
        CompilerMessagesParser() {};
        virtual ~CompilerMessagesParser() {};

        void ParseOutput(std::string output);

        std::vector < CompilerMessage > parsedMessages;

    private:
};

}

#endif // COMPILERERRORSPARSER_H

#endif

