/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY)

#ifndef COMPILERERRORSPARSER_H
#define COMPILERERRORSPARSER_H
#include <string>
#include <vector>
#include "GDCpp/Runtime/String.h"

namespace GDpriv
{

/**
 * \brief Internal class representing a compiler output
 */
class GD_API CompilerMessage
{
public:
    CompilerMessage() : line(gd::String::npos), column(gd::String::npos) {};

    gd::String file;
    size_t line;
    size_t column;
    gd::String message;
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

        void ParseOutput(gd::String output);

        std::vector < CompilerMessage > parsedMessages;

    private:
};

}

#endif // COMPILERERRORSPARSER_H

#endif
