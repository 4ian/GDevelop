/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef CPPCODEEVENT_H
#define CPPCODEEVENT_H
#include "Event.h"
class RuntimeScene;
class Instruction;
class TiXmlElement;
class EventsEditorItemsAreas;
class EventsEditorSelection;
class Scene;
class MainEditorCommand;
class wxWindow;

/**
 * \brief Builtin internal event that pick an object of a list each time it is repeated
 */
class CppCodeEvent : public BaseEvent
{
    public:
        CppCodeEvent();
        CppCodeEvent(const CppCodeEvent & event);
        virtual ~CppCodeEvent() {};

        CppCodeEvent& operator=(const CppCodeEvent & event);
        virtual BaseEventSPtr Clone() { return boost::shared_ptr<BaseEvent>(new CppCodeEvent(*this));}

        virtual bool IsExecutable() const {return true;}
        virtual std::string GenerateEventCode(const Game & game, const Scene & scene, EventsCodeGenerator & codeGenerator, EventsCodeGenerationContext & context);

        virtual bool CanHaveSubEvents() const {return false;}

        const std::vector<std::string> & GetIncludeFiles() const { return includeFiles; };
        void SetIncludeFiles(const std::vector<std::string> & include_) { includeFiles = include_; };

        const std::string & GetAssociatedGDManagedSourceFile() const { return associatedGDManagedSourceFile; };
        void SetAssociatedGDManagedSourceFile(const std::string & associatedGDManagedSourceFile_) { associatedGDManagedSourceFile = associatedGDManagedSourceFile_; };

        virtual void SaveToXml(TiXmlElement * eventElem) const;
        virtual void LoadFromXml(const TiXmlElement * eventElem);

        /**
         * Called by event editor to draw the event.
         */
        virtual void Render(wxDC & dc, int x, int y, unsigned int width, EventsEditorItemsAreas & areas, EventsEditorSelection & selection);

        /**
         * Must return the height of the event when rendered
         */
        virtual unsigned int GetRenderedHeight(unsigned int width) const;

        /**
         * Called when the user want to edit the event
         */
        virtual void EditEvent(wxWindow* parent_, Game & game_, Scene & scene_, MainEditorCommand & mainEditorCommand_);

    private:
        void Init(const CppCodeEvent & event);

        std::vector<std::string> includeFiles;
        std::string functionToCall; ///< The name of the function to call ( Typically located in the include file )
        std::string associatedGDManagedSourceFile; ///< Inline C++ code is simulated by a call to a function containing the code, function located in a separate source file managed by GD.

        bool objectsToPickSelected;
};


#endif // CPPCODEEVENT_H

#endif
