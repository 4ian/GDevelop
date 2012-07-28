/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef CPPCODEEVENT_H
#define CPPCODEEVENT_H
#include "GDCore/Events/Event.h"
class RuntimeScene;
namespace gd { class Instruction; }
class TiXmlElement;
class EventsEditorItemsAreas;
class EventsEditorSelection;
class Scene;
namespace gd { class MainFrameWrapper; }
class wxWindow;

/**
 * \brief Builtin internal event that pick an object of a list each time it is repeated
 */
class CppCodeEvent : public gd::BaseEvent
{
    public:
        CppCodeEvent();
        CppCodeEvent(const CppCodeEvent & event);
        virtual ~CppCodeEvent() {};

        CppCodeEvent& operator=(const CppCodeEvent & event);
        virtual gd::BaseEventSPtr Clone() const { return boost::shared_ptr<gd::BaseEvent>(new CppCodeEvent(*this));}

        virtual bool IsExecutable() const {return true;}
        virtual bool CanHaveSubEvents() const {return false;}

        virtual std::string GenerateEventCode(Game & game, Scene & scene, EventsCodeGenerator & codeGenerator, EventsCodeGenerationContext & context);

        std::string GenerateAssociatedFileCode();

        const std::vector<std::string> & GetIncludeFiles() const { return includeFiles; };
        void SetIncludeFiles(const std::vector<std::string> & include_) { includeFiles = include_; };

        const std::string & GetInlineCode() const { return inlineCode; };
        void SetInlineCode(const std::string & code) { inlineCode = code; };

        const std::string & GetFunctionToCall() const { return functionToCall; };
        void SetFunctionToCall(const std::string & functionToCall_) { functionToCall = functionToCall_; };

        const std::string & GetAssociatedGDManagedSourceFile() const { return associatedGDManagedSourceFile; };
        void SetAssociatedGDManagedSourceFile(const std::string & associatedGDManagedSourceFile_) { associatedGDManagedSourceFile = associatedGDManagedSourceFile_; };

        const std::vector<std::string> & GetDependencies() const { return dependencies; };
        void SetDependencies(const std::vector<std::string> & dependencies_) { dependencies = dependencies_; };

        bool GetPassSceneAsParameter() const { return passSceneAsParameter; };
        void SetPassSceneAsParameter(bool passScene) { passSceneAsParameter = passScene; };

        bool GetPassObjectListAsParameter() const { return passObjectListAsParameter; };
        void SetPassObjectListAsParameter(bool passObjectList) { passObjectListAsParameter = passObjectList; };

        std::string GetObjectToPassAsParameter() const { return objectToPassAsParameter; };
        void SetObjectToPassAsParameter(std::string objectName) { objectToPassAsParameter = objectName; };

        bool IsCodeDisplayedInEditor() const { return codeDisplayedInEditor; };
        void EnableCodeDisplayedInEditor(bool enable) { codeDisplayedInEditor = enable; eventHeightNeedUpdate = true; };

        const std::string & GetDisplayedName() const { return displayedName; };
        void SetDisplayedName(const std::string & displayedName_) { displayedName = displayedName_; };

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
        virtual EditEventReturnType EditEvent(wxWindow* parent_, Game & game_, Scene & scene_, gd::MainFrameWrapper & mainFrameWrapper_);

    private:
        void Init(const CppCodeEvent & event);

        std::vector<std::string> includeFiles;
        std::vector<std::string> dependencies; ///< List of source files that must be compiled and loaded at the same time as the C++ event function.
        std::string functionToCall; ///< The name of the function to call ( Typically located in the include file )
        std::string inlineCode;
        std::string associatedGDManagedSourceFile; ///< "Inline" C++ code is simulated by a call to a function containing the code, function located in a separate source file managed by GD.

        bool passSceneAsParameter;
        bool passObjectListAsParameter;
        std::string objectToPassAsParameter;

        bool codeDisplayedInEditor;
        std::string displayedName;

        bool objectsToPickSelected;
};


#endif // CPPCODEEVENT_H

#endif
