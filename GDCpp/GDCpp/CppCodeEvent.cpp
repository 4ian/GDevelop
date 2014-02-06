/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#include "CppCodeEvent.h"
#include <iostream>
#include <fstream>
#if !defined(GD_NO_WX_GUI)
#include <wx/filename.h>
#include <wx/dcmemory.h>
#endif
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/Log.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCore/Events/Serialization.h"
#include "GDCpp/tinyxml/tinyxml.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/Events/ExpressionsCodeGeneration.h"
#include "GDCore/Events/EventsCodeNameMangler.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/Events/EventsCodeGenerationContext.h"
#include "GDCore/IDE/EventsRenderingHelper.h"
#include "GDCpp/IDE/Dialogs/EditCppCodeEvent.h"
#include "GDCore/IDE/EventsEditorItemsAreas.h"
#include "GDCore/IDE/EventsEditorSelection.h"
#include "GDCpp/IDE/CodeCompiler.h"
#include "GDCore/PlatformDefinition/SourceFile.h"
#include "GDCpp/XmlMacros.h"
#include "GDCpp/CommonTools.h"

using namespace std;

void CppCodeEvent::EnsureAssociatedSourceFileIsUpToDate(gd::Project & parentGame) const
{
#if !defined(GD_NO_WX_GUI)
    std::string outputFile(CodeCompiler::GetInstance()->GetOutputDirectory()+"GD"+ToString(this)+"SourceFile.cpp");

    vector< boost::shared_ptr<gd::SourceFile> >::const_iterator sourceFileIter =
        find_if(parentGame.externalSourceFiles.begin(), parentGame.externalSourceFiles.end(), bind2nd(gd::ExternalSourceFileHasName(), associatedGDManagedSourceFile));

    boost::shared_ptr<gd::SourceFile> sourceFile;
    if ( sourceFileIter != parentGame.externalSourceFiles.end() ) sourceFile = *sourceFileIter;

    //First check if the associated source file exists in the GD project.
    if ( sourceFile == boost::shared_ptr<gd::SourceFile>() )
    {
        //If there is no associated source file existing, then create a new one
        boost::shared_ptr<gd::SourceFile> associatedSourceFile(new gd::SourceFile);
        associatedSourceFile->SetGDManaged(true);

        parentGame.externalSourceFiles.push_back(associatedSourceFile);
        sourceFile = parentGame.externalSourceFiles.back();
    }

    if (sourceFile == boost::shared_ptr<gd::SourceFile>() )
    {
        gd::LogError(_("Unable to create a virtual source file for a C++ Code event.\nPlease report this error to Game Develop developer."));
        return;
    }

    //Then check if the associated source file is up to date
    if ( sourceFile->GetFileName() != outputFile )
    {
        sourceFile->SetFileName(outputFile);
        associatedGDManagedSourceFile = outputFile;
    }
    else if ( wxFileExists(outputFile) )
    {
        wxFileName sourceFileInfo(outputFile);
        if ( sourceFileInfo.GetModificationTime().GetTicks() >= lastChangeTimeStamp )
            return;
    }

    //The associated source file is non existing or not up to date: Regenerate it.
    //It will be compiled ( see CodeCompilationHelpers ) as it will be detected ( by DependenciesAnalyzer )
    //as a SourceFile dependency which is not up to date.
    std::ofstream file;
    file.open( outputFile.c_str() );
    file << GenerateAssociatedFileCode();
    file.close();
#else
    gd::LogError("BAD USE: C++ Code event not supported when wxWidgets support is disabled");
#endif
}

std::string CppCodeEvent::GenerateAssociatedFileCode() const
{
#if !defined(GD_NO_WX_GUI)
    std::string functionPrototype = "void "+GetFunctionToCall()+"("+ (passSceneAsParameter ? "RuntimeScene & scene" :"") +((passSceneAsParameter && passObjectListAsParameter) ? ", ":"")+ (passObjectListAsParameter ? "std::vector<RuntimeObject*> objectsList" :"") + ")";
    std::string output;
    if (passSceneAsParameter ) output += "#include \"GDCpp/RuntimeScene.h\"\n";
    if (passObjectListAsParameter ) output += "#include \"GDCpp/Object.h\"\n";
    for (unsigned int i = 0;i<includeFiles.size();++i) output += "#include "+includeFiles[i]+"\n";

    output += functionPrototype+"\n";
    output += "{\n";
    output += inlineCode;
    output += "}\n";

    return output;
#else
    gd::LogError("BAD USE: C++ Code event not supported when wxWidgets support is disabled");
    return "";
#endif
}

/**
 * Render the event in the bitmap
 */
void CppCodeEvent::Render(wxDC & dc, int x, int y, unsigned int width, gd::EventsEditorItemsAreas & areas, gd::EventsEditorSelection & selection, const gd::Platform & platform)
{
#if !defined(GD_NO_WX_GUI)
    gd::EventsRenderingHelper * renderingHelper = gd::EventsRenderingHelper::GetInstance();
    const int titleTextHeight = 20;

    //Draw header rectangle
    wxRect headerRect(x, y, width, GetRenderedHeight(width, platform));
    renderingHelper->DrawNiceRectangle(dc, headerRect);

    //Header
    dc.SetFont( renderingHelper->GetNiceFont().Bold()  );
    dc.SetTextForeground(wxColour(0,0,0));
    dc.DrawText( (displayedName.empty() ? _("C++ code") : _("C++ code:")) + displayedName, x + 4, y + 3 );

    if ( codeDisplayedInEditor )
    {
        dc.SetFont( renderingHelper->GetFont() );
        dc.SetBrush(renderingHelper->GetActionsRectangleFillBrush());
        dc.SetPen(renderingHelper->GetActionsRectangleOutlinePen());

        dc.DrawRectangle(wxRect(x + 4, y + 3 + titleTextHeight + 2, width-8, GetRenderedHeight(width, platform)-(3 + titleTextHeight + 5)));
        dc.DrawLabel( inlineCode, wxNullBitmap, wxRect(x + 4, y + 3 + titleTextHeight + 4, width-2, GetRenderedHeight(width, platform)));
    }
#endif
}

unsigned int CppCodeEvent::GetRenderedHeight(unsigned int width, const gd::Platform & platform) const
{
#if !defined(GD_NO_WX_GUI)
    if ( eventHeightNeedUpdate )
    {
        gd::EventsRenderingHelper * renderingHelper = gd::EventsRenderingHelper::GetInstance();
        renderedHeight = 20;

        if ( codeDisplayedInEditor )
        {
            wxMemoryDC fakeDC;
            fakeDC.SetFont(renderingHelper->GetFont());
            renderedHeight += fakeDC.GetMultiLineTextExtent(inlineCode).GetHeight();
            renderedHeight += 15; //Borders
        }
        eventHeightNeedUpdate = false;
    }

    return renderedHeight;
#else
    return 0;
#endif
}

gd::BaseEvent::EditEventReturnType CppCodeEvent::EditEvent(wxWindow* parent_, gd::Project & game_, gd::Layout & scene_, gd::MainFrameWrapper & mainFrameWrapper_)
{
#if !defined(GD_NO_WX_GUI)
    EditCppCodeEvent dialog(parent_, *this, game_, scene_);
    int returned = dialog.ShowModal();

    if ( returned == 0 )
        return Cancelled;
    else
    {
        //Force recreation of the assocaited source file
        wxFileName outputFile(associatedGDManagedSourceFile);
        outputFile.MakeAbsolute(wxFileName::FileName(game_.GetProjectFile()).GetPath());
        if ( wxFileExists(outputFile.GetFullPath()) ) wxRemoveFile(outputFile.GetFullPath());

        EnsureAssociatedSourceFileIsUpToDate(game_);

        if (returned == 2)
            return ChangesMadeButNoNeedForEventsRecompilation;
        else
            return ChangesMade;
    }
#else
    return ChangesMade;
#endif
}

void CppCodeEvent::SaveToXml(TiXmlElement * elem) const
{
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_STRING("FunctionToCall", functionToCall);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_BOOL("FunctionNameAutogenerated", functionNameAutogenerated);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_STRING("InlineCode", inlineCode);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_STRING("AssociatedGDManagedSourceFile", associatedGDManagedSourceFile);

    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_BOOL("PassSceneAsParameter", passSceneAsParameter);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_BOOL("PassObjectListAsParameter", passObjectListAsParameter);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_STRING("ObjectToPassAsParameter", objectToPassAsParameter);

    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_BOOL("CodeDisplayedInEditor", codeDisplayedInEditor);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_STRING("DisplayedName", displayedName);

    TiXmlElement * includesElem = new TiXmlElement( "Includes" );
    elem->LinkEndChild( includesElem );
    for ( unsigned int i = 0;i < includeFiles.size();++i)
    {
        TiXmlElement * includeElem = new TiXmlElement( "Include" );
        includesElem->LinkEndChild( includeElem );

        includeElem->SetAttribute("value", includeFiles[i].c_str());
    }

    TiXmlElement * dependenciesElem = new TiXmlElement( "Dependencies" );
    elem->LinkEndChild( dependenciesElem );
    for ( unsigned int i = 0;i < dependencies.size();++i)
    {
        TiXmlElement * dependencyElem = new TiXmlElement( "Dependency" );
        dependenciesElem->LinkEndChild( dependencyElem );

        dependencyElem->SetAttribute("sourceFile", dependencies[i].c_str());
    }
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE("lastChangeTimeStamp", lastChangeTimeStamp);
}

void CppCodeEvent::LoadFromXml(gd::Project & project, const TiXmlElement * elem)
{
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_STRING("FunctionToCall", functionToCall);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("FunctionNameAutogenerated", functionNameAutogenerated);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_STRING("InlineCode", inlineCode);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_STRING("AssociatedGDManagedSourceFile", associatedGDManagedSourceFile);

    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("PassSceneAsParameter", passSceneAsParameter);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("PassObjectListAsParameter", passObjectListAsParameter);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_STRING("ObjectToPassAsParameter", objectToPassAsParameter);

    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("CodeDisplayedInEditor", codeDisplayedInEditor);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_STRING("DisplayedName", displayedName);

    includeFiles.clear();
    const TiXmlElement * includesElem = elem->FirstChildElement( "Includes" );
    if ( includesElem != NULL)
    {
        const TiXmlElement * includeElem = includesElem->FirstChildElement();
        while(includeElem)
        {
            includeFiles.push_back(includeElem->Attribute("value") != NULL ? includeElem->Attribute("value") : "");

            includeElem = includeElem->NextSiblingElement();
        }
    }

    dependencies.clear();
    const TiXmlElement * dependenciesElem = elem->FirstChildElement( "Dependencies" );
    if ( dependenciesElem != NULL)
    {
        const TiXmlElement * dependencyElem = dependenciesElem->FirstChildElement();
        while(dependencyElem)
        {
            dependencies.push_back(dependencyElem->Attribute("sourceFile") != NULL ? dependencyElem->Attribute("sourceFile") : "");

            dependencyElem = dependencyElem->NextSiblingElement();
        }
    }

    int ilastChangeTimeStamp = lastChangeTimeStamp;
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_INT("lastChangeTimeStamp", ilastChangeTimeStamp);
    lastChangeTimeStamp = ilastChangeTimeStamp;
}

void CppCodeEvent::AutogenerateFunctionName() const
{
    boost::shared_ptr<gd::BaseEvent> event = originalEvent.lock();
    if ( !functionNameAutogenerated ) return;

    if( event != boost::shared_ptr<gd::BaseEvent>() )
        functionToCall = "GDCppCode"+ToString(event.get()); //The name refers to the original event being in the original scene.
    else
        functionToCall = "GDCppCode"+ToString(this); //We are the original event: Create the name using our address.
}

const std::string & CppCodeEvent::GetFunctionToCall() const
{
    if ( functionNameAutogenerated && functionToCall.empty() )
        AutogenerateFunctionName();

    return functionToCall;
};

/**
 * Initialize from another CppCodeEvent.
 * Used by copy ctor and assignement operator
 */
void CppCodeEvent::Init(const CppCodeEvent & event)
{
    includeFiles = event.includeFiles;
    dependencies = event.dependencies;
    functionToCall = event.functionToCall;
    functionNameAutogenerated = event.functionNameAutogenerated;
    inlineCode = event.inlineCode;
    associatedGDManagedSourceFile = event.associatedGDManagedSourceFile;
    lastChangeTimeStamp = 0;

    passSceneAsParameter = event.passSceneAsParameter;
    passObjectListAsParameter = event.passObjectListAsParameter;
    objectToPassAsParameter = event.objectToPassAsParameter;

    codeDisplayedInEditor = event.codeDisplayedInEditor;
    displayedName = event.displayedName;
}

/**
 * Custom copy operator
 */
CppCodeEvent::CppCodeEvent(const CppCodeEvent & event) :
BaseEvent(event)
{
    Init(event);
}

/**
 * Custom assignement operator
 */
CppCodeEvent& CppCodeEvent::operator=(const CppCodeEvent & event)
{
    if ( this != &event )
    {
        BaseEvent::operator=(event);
        Init(event);
    }

    return *this;
}

CppCodeEvent::CppCodeEvent() :
BaseEvent(),
functionNameAutogenerated(true),
inlineCode("scene.SetBackgroundColor(100,100,240);\n"),
lastChangeTimeStamp(0),
passSceneAsParameter(true),
passObjectListAsParameter(false),
codeDisplayedInEditor(true)
{
    includeFiles.push_back("<iostream>");
    includeFiles.push_back("\"GDCpp/CommonTools.h\"");
}

#endif