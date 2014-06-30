/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

#include "JsCodeEvent.h"
#include <iostream>
#include <fstream>
#if !defined(GD_NO_WX_GUI)
#include <wx/filename.h>
#include <wx/dcmemory.h>
#endif
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/Log.h"
#include "GDCore/Events/Serialization.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/Events/ExpressionsCodeGeneration.h"
#include "GDCore/Events/EventsCodeNameMangler.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/Events/EventsCodeGenerationContext.h"
#include "GDCore/IDE/EventsRenderingHelper.h"
#include "GDCore/IDE/EventsEditorItemsAreas.h"
#include "GDCore/IDE/EventsEditorSelection.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/PlatformDefinition/SourceFile.h"
#include "GDCore/CommonTools.h"

using namespace std;

namespace gdjs
{

void JsCodeEvent::EnsureAssociatedSourceFileIsUpToDate(gd::Project & project, std::string outputDir) const
{
#if !defined(GD_NO_WX_GUI)
    std::string outputFile("GD"+ToString(this)+"SourceFile.cpp"); //TODOTODOTODO

    vector< boost::shared_ptr<gd::SourceFile> >::const_iterator sourceFileIter =
        find_if(project.externalSourceFiles.begin(), project.externalSourceFiles.end(), bind2nd(gd::ExternalSourceFileHasName(), associatedGDManagedSourceFile));

    boost::shared_ptr<gd::SourceFile> sourceFile;
    if ( sourceFileIter != project.externalSourceFiles.end() ) sourceFile = *sourceFileIter;

    //First check if the associated source file exists in the GD project.
    if ( sourceFile == boost::shared_ptr<gd::SourceFile>() )
    {
        //If there is no associated source file existing, then create a new one
        boost::shared_ptr<gd::SourceFile> associatedSourceFile(new gd::SourceFile);
        associatedSourceFile->SetGDManaged(true);
        associatedSourceFile->SetLanguage("Javascript");

        project.externalSourceFiles.push_back(associatedSourceFile);
        sourceFile = project.externalSourceFiles.back();
    }

    if (sourceFile == boost::shared_ptr<gd::SourceFile>() )
    {
        gd::LogError(_("Unable to create a virtual source file for a JsCode event.\nPlease report this error to Game Develop developer."));
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
    gd::LogError("BAD USE: JsCodeEvent file generation not supported when wxWidgets support is disabled");
#endif
}

std::string JsCodeEvent::GenerateAssociatedFileCode() const
{
    std::string output;

    output += "gdjs.customCode = gdjs.customCode || {};\n";
    output += "gdjs.customCode."+GetFunctionToCall()+" = function(";
    if (passSceneAsParameter) output += "scene";
    if (passObjectListAsParameter) output += std::string(passSceneAsParameter ? ", " : "") + "objectsList";

    output += ") {\n";
    output += inlineCode;
    output += "};\n\n";

    return output;
}

/**
 * Render the event in the bitmap
 */
void JsCodeEvent::Render(wxDC & dc, int x, int y, unsigned int width, gd::EventsEditorItemsAreas & areas, gd::EventsEditorSelection & selection, const gd::Platform & platform)
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
    dc.DrawText( (displayedName.empty() ? _("Javascript code") : _("Javascript code:")) + displayedName, x + 4, y + 3 );

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

unsigned int JsCodeEvent::GetRenderedHeight(unsigned int width, const gd::Platform & platform) const
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

gd::BaseEvent::EditEventReturnType JsCodeEvent::EditEvent(wxWindow* parent_, gd::Project & game_, gd::Layout & scene_, gd::MainFrameWrapper & mainFrameWrapper_)
{
#if !defined(GD_NO_WX_GUI)
    //TODOTODOTODO
    /*EditJsCodeEvent dialog(parent_, *this, game_, scene_);
    int returned = dialog.ShowModal();

    if ( returned == 0 )
        return Cancelled;*/
#else
    return ChangesMade;
#endif
}

void JsCodeEvent::SerializeTo(gd::SerializerElement & element) const
{
    element.AddChild("functionToCall").SetValue(functionToCall);
    element.AddChild("inlineCode").SetValue(inlineCode);

    element.AddChild("passSceneAsParameter").SetValue(passSceneAsParameter);
    element.AddChild("passObjectListAsParameter").SetValue(passObjectListAsParameter);
    element.AddChild("objectToPassAsParameter").SetValue(objectToPassAsParameter);

    element.AddChild("codeDisplayedInEditor").SetValue(codeDisplayedInEditor);
    element.AddChild("displayedName").SetValue(displayedName);

    gd::SerializerElement & includesElement = element.AddChild("includes");
    includesElement.ConsiderAsArrayOf("include");
    for ( unsigned int i = 0;i < includeFiles.size();++i)
        includesElement.AddChild("include").SetValue(includeFiles[i]);
}

void JsCodeEvent::UnserializeFrom(gd::Project & project, const gd::SerializerElement & element)
{
    functionToCall = element.GetChild("functionToCall").GetValue().GetString();
    inlineCode = element.GetChild("inlineCode").GetValue().GetString();

    passSceneAsParameter = element.GetChild("passSceneAsParameter").GetValue().GetBool();
    passObjectListAsParameter = element.GetChild("passObjectListAsParameter").GetValue().GetBool();
    objectToPassAsParameter = element.GetChild("objectToPassAsParameter").GetValue().GetString();

    codeDisplayedInEditor = element.GetChild("codeDisplayedInEditor").GetValue().GetBool();
    displayedName = element.GetChild("displayedName").GetValue().GetString();

    includeFiles.clear();
    gd::SerializerElement & includesElement = element.GetChild("includes", 0, "Includes");
    includesElement.ConsiderAsArrayOf("include", "Include");
    for ( unsigned int i = 0;i < includesElement.GetChildrenCount();++i)
        includeFiles.push_back(includesElement.GetChild(i).GetValue().GetString());
}

void JsCodeEvent::AutogenerateFunctionName() const
{
    boost::shared_ptr<gd::BaseEvent> event = originalEvent.lock();

    if( event != boost::shared_ptr<gd::BaseEvent>() )
        functionToCall = "gdjs.customJsCode"+ToString(event.get()); //The name refers to the original event being in the original scene.
    else
        functionToCall = "gdjs.customJsCode"+ToString(this); //We are the original event: Create the name using our address.
}

const std::string & JsCodeEvent::GetFunctionToCall() const
{
    if ( functionToCall.empty() )
        AutogenerateFunctionName();

    return functionToCall;
};

/**
 * Initialize from another JsCodeEvent.
 * Used by copy ctor and assignement operator
 */
void JsCodeEvent::Init(const JsCodeEvent & event)
{
    includeFiles = event.includeFiles;
    functionToCall = event.functionToCall;
    inlineCode = event.inlineCode;

    passSceneAsParameter = event.passSceneAsParameter;
    passObjectListAsParameter = event.passObjectListAsParameter;
    objectToPassAsParameter = event.objectToPassAsParameter;

    codeDisplayedInEditor = event.codeDisplayedInEditor;
    displayedName = event.displayedName;
}

/**
 * Custom copy operator
 */
JsCodeEvent::JsCodeEvent(const JsCodeEvent & event) :
BaseEvent(event)
{
    Init(event);
}

/**
 * Custom assignement operator
 */
JsCodeEvent& JsCodeEvent::operator=(const JsCodeEvent & event)
{
    if ( this != &event )
    {
        BaseEvent::operator=(event);
        Init(event);
    }

    return *this;
}

JsCodeEvent::JsCodeEvent() :
    BaseEvent(),
    inlineCode("scene.setBackgroundColor(100,100,240);\n"),
    passSceneAsParameter(true),
    passObjectListAsParameter(false),
    codeDisplayedInEditor(true)
{
}

}