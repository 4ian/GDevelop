#include "EventsCodeGenerationContext.h"
#include <set>

using namespace std;

void EventsCodeGenerationContext::InheritsFrom(const EventsCodeGenerationContext & parent)
{
    objectsAlreadyDeclared = parent.objectsToBeDeclared;
    includeFiles = parent.includeFiles;
    currentObject = parent.currentObject;
}

std::string EventsCodeGenerationContext::GenerateObjectsDeclarationCode()
{
    std::string declarationsCode;

    for ( set<string>::iterator it = objectsToBeDeclared.begin() ; it != objectsToBeDeclared.end(); ++it )
    {
        if ( objectsAlreadyDeclared.find(*it) == objectsAlreadyDeclared.end() )
        {
            declarationsCode += "std::vector<Object*> "+*it+"objects = runtimeContext->GetObjectsRawPointers(\""+*it+"\");\n";
            objectsAlreadyDeclared.insert(*it);
        }
        else
            declarationsCode += "std::vector<Object*> "+*it+"objects = "+*it+"objects;\n";
    }
    for ( set<string>::iterator it = objectsListsToBeDeclaredEmpty.begin() ; it != objectsListsToBeDeclaredEmpty.end(); ++it )
    {
        if ( objectsAlreadyDeclared.find(*it) == objectsAlreadyDeclared.end() )
        {
            declarationsCode += "std::vector<Object*> "+*it+"objects;\n";
            objectsAlreadyDeclared.insert(*it);
        }
        else
            declarationsCode += "std::vector<Object*> "+*it+"objects = "+*it+"objects;\n";
    }

    return declarationsCode;
}
