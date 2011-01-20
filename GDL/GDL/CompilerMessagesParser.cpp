
#if !defined(GD_NO_DYNAMIC_EXTENSIONS)
#if defined(GD_IDE_ONLY)

#include "CompilerMessagesParser.h"
#include "GDL/CommonTools.h"
#include <iostream>

void CompilerMessagesParser::ParseOutput(std::vector<std::string> output)
{
    parsedErrors.clear();

    for (unsigned int i = 0;i<output.size();++i)
    {
        CompilerMessage newMessage;

        //std::cout <<  output[i] << std::endl;

        size_t fileEndPos = output[i].find_first_of(':', 2);
        if ( fileEndPos != std::string::npos ) newMessage.file = output[i].substr(0, fileEndPos);

        //std::cout << "d:"<< output[i][fileEndPos+1] << endl;

        size_t lineEndPos = std::string::npos;
        if ( output[i].length()>fileEndPos && isdigit(output[i][fileEndPos+1]) )
        {
            lineEndPos = output[i].find_first_of(':', fileEndPos+1);
            if ( lineEndPos != std::string::npos ) newMessage.line = ToInt(output[i].substr(fileEndPos+1, lineEndPos));
        }

        newMessage.message = output[i].substr(lineEndPos != std::string::npos ? lineEndPos+1 : fileEndPos, output[i].length());

        if ( output[i].find("error") ) newMessage.messageType = CompilerMessage::error;
        else newMessage.messageType = CompilerMessage::simple;

        parsedErrors.push_back(newMessage);
    }
}

#endif
#endif
