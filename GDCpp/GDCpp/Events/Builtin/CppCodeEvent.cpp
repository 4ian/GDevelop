/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
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
#include "GDCpp/Runtime/RuntimeScene.h"
#include "GDCore/Events/Serialization.h"
#include "GDCpp/Runtime/TinyXml/tinyxml.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/Events/CodeGeneration/ExpressionsCodeGeneration.h"
#include "GDCore/Events/Tools/EventsCodeNameMangler.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerationContext.h"
#include "GDCore/IDE/Dialogs/EventsEditor/EventsRenderingHelper.h"
#include "GDCpp/IDE/Dialogs/EditCppCodeEvent.h"
#include "GDCore/IDE/Dialogs/EventsEditor/EventsEditorItemsAreas.h"
#include "GDCore/IDE/Dialogs/EventsEditor/EventsEditorSelection.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCpp/IDE/CodeCompiler.h"
#include "GDCore/Project/SourceFile.h"
#include "GDCpp/Runtime/CommonTools.h"

using namespace std;

void CppCodeEvent::EnsureAssociatedSourceFileIsUpToDate(gd::Project & project) const
{
#if !defined(GD_NO_WX_GUI)
    gd::String outputFile(CodeCompiler::Get()->GetOutputDirectory()+"GD"+gd::String::From(this)+"SourceFile.cpp");

    gd::SourceFile * sourceFile;
    //First check if the associated source file exists in the GD project.
    if (project.HasSourceFile(associatedGDManagedSourceFile, "C++"))
        sourceFile = &project.GetSourceFile(associatedGDManagedSourceFile);
    else
    {
        //If there is no associated source file existing, then create a new one
        sourceFile = &project.InsertNewSourceFile(outputFile, "C++");
        sourceFile->SetGDManaged(true);
    }

    //Then check if the associated source file is up to date
    associatedGDManagedSourceFile = outputFile;
    if ( sourceFile->GetFileName() != outputFile )
    {
        sourceFile->SetFileName(outputFile);
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
    file.open( outputFile.ToLocale().c_str() );
    file << GenerateAssociatedFileCode();
    file.close();
#else
    gd::LogError("BAD USE: C++ Code event not supported when wxWidgets support is disabled");
#endif
}

gd::String CppCodeEvent::GenerateAssociatedFileCode() const
{
#if !defined(GD_NO_WX_GUI)
    gd::String functionPrototype = "void "+GetFunctionToCall()+"("+ (passSceneAsParameter ? "RuntimeScene & scene" :"") +((passSceneAsParameter && passObjectListAsParameter) ? ", ":"")+ (passObjectListAsParameter ? "std::vector<RuntimeObject*> objectsList" :"") + ")";
    gd::String output;
    if (passSceneAsParameter ) output += "#include \"GDCpp/Runtime/RuntimeScene.h\"\n";
    if (passObjectListAsParameter ) output += "#include \"GDCpp/Runtime/Project/Object.h\"\n";
    for (std::size_t i = 0;i<includeFiles.size();++i) output += "#include "+includeFiles[i]+"\n";

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
    gd::EventsRenderingHelper * renderingHelper = gd::EventsRenderingHelper::Get();
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
        gd::EventsRenderingHelper * renderingHelper = gd::EventsRenderingHelper::Get();
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

void CppCodeEvent::SerializeTo(gd::SerializerElement & element) const
{
    element.SetAttribute("functionToCall", functionToCall);
    element.SetAttribute("functionNameAutogenerated", functionNameAutogenerated);
    element.SetAttribute("inlineCode", inlineCode);
    element.SetAttribute("associatedGDManagedSourceFile", associatedGDManagedSourceFile);

    element.SetAttribute("passSceneAsParameter", passSceneAsParameter);
    element.SetAttribute("passObjectListAsParameter", passObjectListAsParameter);
    element.SetAttribute("objectToPassAsParameter", objectToPassAsParameter);

    element.SetAttribute("codeDisplayedInEditor", codeDisplayedInEditor);
    element.SetAttribute("displayedName", displayedName);
    element.SetAttribute("lastChangeTimeStamp", (int)lastChangeTimeStamp);

    gd::SerializerElement & includesElement = element.AddChild("includes");
    includesElement.ConsiderAsArrayOf("include");
    for ( std::size_t i = 0;i < includeFiles.size();++i)
        includesElement.AddChild("include").SetValue(includeFiles[i]);

    gd::SerializerElement & dependenciesElement = element.AddChild("dependencies");
    dependenciesElement.ConsiderAsArrayOf("dependency");
    for ( std::size_t i = 0;i < dependencies.size();++i)
        dependenciesElement.AddChild("dependency").SetAttribute("sourceFile", dependencies[i]);

}

void CppCodeEvent::UnserializeFrom(gd::Project & project, const gd::SerializerElement & element)
{
    functionToCall = element.GetStringAttribute("functionToCall", "", "FunctionToCall");
    functionNameAutogenerated = element.GetBoolAttribute("functionNameAutogenerated", false, "FunctionNameAutogenerated"),
    inlineCode = element.GetStringAttribute("inlineCode", "", "InlineCode");
    associatedGDManagedSourceFile = element.GetStringAttribute("associatedGDManagedSourceFile", "", "AssociatedGDManagedSourceFile");

    passSceneAsParameter = element.GetBoolAttribute("passSceneAsParameter", false, "PassSceneAsParameter");
    passObjectListAsParameter = element.GetBoolAttribute("passObjectListAsParameter", false, "PassObjectListAsParameter");
    objectToPassAsParameter = element.GetStringAttribute("objectToPassAsParameter", "", "ObjectToPassAsParameter");

    codeDisplayedInEditor = element.GetBoolAttribute("codeDisplayedInEditor", true, "CodeDisplayedInEditor");
    displayedName = element.GetStringAttribute("displayedName", "", "DisplayedName");
    lastChangeTimeStamp = element.GetIntAttribute("lastChangeTimeStamp");

    includeFiles.clear();
    gd::SerializerElement & includesElement = element.GetChild("includes", 0, "Includes");
    includesElement.ConsiderAsArrayOf("include", "Include");
    for ( std::size_t i = 0;i < includesElement.GetChildrenCount();++i)
        includeFiles.push_back(includesElement.GetChild(i).GetValue().GetString());

    dependencies.clear();
    gd::SerializerElement & dependenciesElement = element.GetChild("dependencies", 0, "Dependencies");
    dependenciesElement.ConsiderAsArrayOf("dependency", "Dependency");
    for ( std::size_t i = 0;i < dependenciesElement.GetChildrenCount();++i)
        dependencies.push_back(dependenciesElement.GetChild(i).GetStringAttribute("sourceFile"));
}

void CppCodeEvent::AutogenerateFunctionName() const
{
    std::shared_ptr<gd::BaseEvent> event = originalEvent.lock();
    if ( !functionNameAutogenerated ) return;

    if( event != std::shared_ptr<gd::BaseEvent>() )
        functionToCall = "GDCppCode"+gd::String::From(event.get()); //The name refers to the original event being in the original scene.
    else
        functionToCall = "GDCppCode"+gd::String::From(this); //We are the original event: Create the name using our address.
}

const gd::String & CppCodeEvent::GetFunctionToCall() const
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
    includeFiles.push_back("\"GDCpp/Runtime/CommonTools.h\"");
}

#endif
