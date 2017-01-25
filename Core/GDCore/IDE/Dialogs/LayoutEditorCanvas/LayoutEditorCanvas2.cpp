/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "LayoutEditorCanvas.h"
#include <cmath>
#include <wx/wx.h>
#include <wx/config.h>
#include <wx/filename.h>
#include <wx/ribbon/bar.h>
#include <wx/ribbon/page.h>
#include <wx/ribbon/buttonbar.h>
#include <wx/aui/aui.h>
#include "GDCore/IDE/Dialogs/LayoutEditorCanvas/LayoutEditorCanvasAssociatedEditor.h"
#include "GDCore/IDE/Dialogs/LayoutEditorCanvas/LayoutEditorCanvasTextDnd.h"
#include "GDCore/IDE/Dialogs/LayoutEditorCanvas/LayoutEditorCanvasOptions.h"
#include "GDCore/IDE/Dialogs/ChooseObjectTypeDialog.h"
#include "GDCore/IDE/Dialogs/InstancesAdvancedPasteDialog.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "GDCore/IDE/Dialogs/GridSetupDialog.h"
#include "GDCore/IDE/wxTools/GUIContentScaleFactor.h"
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/IDE/Clipboard.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/ImageManager.h"
#include "GDCore/Project/InitialInstance.h"
#include "GDCore/Project/InitialInstancesContainer.h"
#include "GDCore/Project/Object.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/OpenGLTools.h"
#if !defined(ANDROID) && !defined(MACOS)
#include <GL/glu.h>
#endif

using namespace std;

namespace gd
{

void LayoutEditorCanvas::OnUpdate()
{
    if (!editing)
    {
        if ( currentPreviewer ) currentPreviewer->OnUpdate();
    }
    else
    {
        if ( mainFrameWrapper.GetIDEWorkingDirectory() != wxGetCwd() ) //Force the correct working directory.
            wxSetWorkingDirectory(mainFrameWrapper.GetIDEWorkingDirectory());

        //First reload some images if necessary.
        if ( !project.imagesChanged.empty() )
        {
            if ( wxDirExists(wxFileName::FileName(project.GetProjectFile()).GetPath()))
                wxSetWorkingDirectory(wxFileName::FileName(project.GetProjectFile()).GetPath()); //Resources loading stuff incoming: Switch current work dir.

            for (std::size_t i = 0;i<project.imagesChanged.size();++i)
                project.GetImageManager()->ReloadImage(project.imagesChanged[i]);

            project.GetImageManager()->LoadPermanentImages();
            project.imagesChanged.clear();
            layout.SetRefreshNeeded();

            wxSetWorkingDirectory(mainFrameWrapper.GetIDEWorkingDirectory()); //Go back to the IDE cwd.
        }
        if ( firstRefresh )
        {
            firstRefresh = false;
            ReloadResources();
        }

        //Then display the layout
        RenderEdittime();
        if (vScrollbar && hScrollbar && !hScrollbar->HasFocus() && !vScrollbar->HasFocus())
            UpdateScrollbars();

    }

    Display();
}

void LayoutEditorCanvas::DrawSelectionRectangleGuiElement(std::vector < std::shared_ptr<sf::Shape> > & target, const sf::FloatRect & rectangle )
{
    //Create the shapes
    std::shared_ptr<sf::Shape> selection = std::make_shared<sf::RectangleShape>(sf::Vector2f(rectangle.width, rectangle.height));
    selection->setPosition(rectangle.left, rectangle.top);
    selection->setFillColor(sf::Color( 0, 0, 200, 40 ));
    selection->setOutlineColor(sf::Color( 0, 0, 255, 128 ));
    selection->setOutlineThickness(1);

    //Add the shape to be drawn
    target.push_back(selection);
}

void LayoutEditorCanvas::DrawAngleButtonGuiElement(std::vector < std::shared_ptr<sf::Shape> > & target, const sf::Vector2f & position, float angle )
{
    //Create the shapes
    std::shared_ptr<sf::Shape> centerShape = std::make_shared<sf::CircleShape>(3);
    centerShape->setPosition(position);
    centerShape->setOutlineColor(sf::Color( 0, 0, 255, 128 ));
    centerShape->setOutlineThickness(1);
    centerShape->setFillColor(sf::Color( 0, 0, 200, 40 ));
    centerShape->setOrigin(sf::Vector2f(3,3));

    std::shared_ptr<sf::Shape> angleButton = std::make_shared<sf::RectangleShape>(sf::Vector2f(smallButtonSize, smallButtonSize));
    angleButton->setPosition(position+sf::Vector2f(25.0*cos(angle/180.0*3.14159), 25.0*sin(angle/180.0*3.14159)));
    angleButton->setOutlineColor(sf::Color( 0, 0, 0, 255 ));
    angleButton->setOutlineThickness(1);
    angleButton->setOrigin(sf::Vector2f(smallButtonSize/2.0, smallButtonSize/2.0));

    std::shared_ptr<sf::Shape> line = std::make_shared<sf::RectangleShape>(sf::Vector2f(26, 1));
    line->setPosition(position+sf::Vector2f(3.0*cos(angle/180.0*3.14159), 3.0*sin(angle/180.0*3.14159)));
    line->setRotation(angle);
    line->setFillColor(sf::Color( 0, 0, 200, 128 ));
    line->setOutlineThickness(0);

    //Declare the angle button as a gui element
    gd::LayoutEditorCanvasGuiElement guiElement;
    guiElement.name = "angle";
    guiElement.area = wxRect(angleButton->getPosition().x-smallButtonSize/2.0, angleButton->getPosition().y-smallButtonSize/2.0, smallButtonSize, smallButtonSize);
    guiElements.push_back(guiElement);
    if ( !guiElement.area.Contains(wxPoint(gd::RenderingWindow::GetMousePosition(*this).x, gd::RenderingWindow::GetMousePosition(*this).y)) )
        angleButton->setFillColor(sf::Color( 220, 220, 220, 255 ));
    else
        angleButton->setFillColor(sf::Color( 255, 255, 255, 255 ));

    angleButtonCenter = position; //Save the position of the center to calculate the new angle when we'll be dragging the button ( See OnMoving method )

    //Add the shape to be drawn
    target.push_back(line);
    target.push_back(centerShape);
    target.push_back(angleButton);
}

void LayoutEditorCanvas::DrawHighlightRectangleGuiElement(std::vector < std::shared_ptr<sf::Shape> > & target, const sf::FloatRect & rectangle )
{
    std::shared_ptr<sf::Shape> highlight = std::make_shared<sf::RectangleShape>(sf::Vector2f(rectangle.width, rectangle.height));
    highlight->setPosition(rectangle.left, rectangle.top);
    highlight->setFillColor(sf::Color( 230, 230, 230, 20 ));
    highlight->setOutlineColor(sf::Color( 200, 200, 200, 70 ));
    highlight->setOutlineThickness(1);

    target.push_back(highlight);
}

void LayoutEditorCanvas::AddSmallButtonGuiElement(std::vector < std::shared_ptr<sf::Shape> > & target, const sf::Vector2f & position, const gd::String & buttonName )
{
    //Declare the button as a gui element
    gd::LayoutEditorCanvasGuiElement guiElement;
    guiElement.name = buttonName;
    guiElement.area = wxRect(position.x, position.y, smallButtonSize, smallButtonSize);
    guiElements.push_back(guiElement);

    //Draw button
    std::shared_ptr<sf::Shape> button = std::make_shared<sf::RectangleShape>(sf::Vector2f(smallButtonSize, smallButtonSize));
    button->setPosition(position);
    button->setOutlineColor(sf::Color( 0, 0, 0, 255 ));
    button->setOutlineThickness(1);
    if ( !guiElement.area.Contains(wxPoint(gd::RenderingWindow::GetMousePosition(*this).x, gd::RenderingWindow::GetMousePosition(*this).y)) )
        button->setFillColor(sf::Color( 220, 220, 220, 255 ));
    else
        button->setFillColor(sf::Color( 255, 255, 255, 255 ));

    target.push_back(button);
}

/**
 * \brief Internal Tool class used to display instances at edittime
 */
class InstancesRenderer : public gd::InitialInstanceFunctor
{
public:
    InstancesRenderer(LayoutEditorCanvas & editor_, gd::InitialInstance * highlightedInstance_, std::vector < std::shared_ptr<sf::Shape> > & guiElementsShapes_) :
        drawResizeButtons(false),
        resizeButtonsMaxX(0),
        resizeButtonsMinX(0),
        resizeButtonsMaxY(0),
        resizeButtonsMinY(0),
        selectionAngle(0),
        editor(editor_),
        highlightedInstance(highlightedInstance_),
        guiElementsShapes(guiElementsShapes_)
    {};
    virtual ~InstancesRenderer() {};

    virtual void operator()(gd::InitialInstance & instance)
    {
        gd::Object * associatedObject = editor.GetObjectLinkedToInitialInstance(instance);
        if ( !associatedObject ) return;

        associatedObject->DrawInitialInstance(instance, editor.GetRenderingTarget(), editor.project, editor.layout);
        sf::Vector2f origin = associatedObject->GetInitialInstanceOrigin(instance, editor.project, editor.layout);
        sf::Vector2f size = sf::Vector2f(instance.GetCustomWidth(), instance.GetCustomHeight());
        if ( !instance.HasCustomSize() )
            size = associatedObject->GetInitialInstanceDefaultSize(instance, editor.project, editor.layout);

        //Selection rectangle
        if ( editor.selectedInstances.find(&instance) != editor.selectedInstances.end() )
        {
            sf::Vector2f rectangleOrigin = editor.ConvertToWindowCoordinates(instance.GetX()-origin.x, instance.GetY()-origin.y, editor.editionView);
            sf::Vector2f rectangleEnd = editor.ConvertToWindowCoordinates(instance.GetX()-origin.x+size.x, instance.GetY()-origin.y+size.y, editor.editionView);

            editor.DrawSelectionRectangleGuiElement(guiElementsShapes, sf::FloatRect(rectangleOrigin, rectangleEnd-rectangleOrigin ));

            if ( !drawResizeButtons )
            {
                resizeButtonsMaxX = rectangleEnd.x;
                resizeButtonsMaxY = rectangleEnd.y;
                resizeButtonsMinX = rectangleOrigin.x;
                resizeButtonsMinY = rectangleOrigin.y;
                selectionAngle = instance.GetAngle();
                drawResizeButtons = true;
            }
            else
            {
                resizeButtonsMaxX = std::max(resizeButtonsMaxX, rectangleEnd.x);
                resizeButtonsMaxY = std::max(resizeButtonsMaxY, rectangleEnd.y);
                resizeButtonsMinX = std::min(resizeButtonsMinX, rectangleOrigin.x);
                resizeButtonsMinY = std::min(resizeButtonsMinY, rectangleOrigin.y);
            }
        }
        else if ( highlightedInstance == &instance )
        {
            sf::Vector2f rectangleOrigin = editor.ConvertToWindowCoordinates(instance.GetX()-origin.x, instance.GetY()-origin.y, editor.editionView);
            sf::Vector2f rectangleEnd = editor.ConvertToWindowCoordinates(instance.GetX()-origin.x+size.x, instance.GetY()-origin.y+size.y, editor.editionView);

            editor.DrawHighlightRectangleGuiElement(guiElementsShapes, sf::FloatRect(rectangleOrigin, rectangleEnd-rectangleOrigin ));
        }
    }

    bool drawResizeButtons;
    float resizeButtonsMaxX;
    float resizeButtonsMinX;
    float resizeButtonsMaxY;
    float resizeButtonsMinY;
    float selectionAngle;

private:
    LayoutEditorCanvas & editor;
    gd::InitialInstance * highlightedInstance;
    std::vector < std::shared_ptr<sf::Shape> > & guiElementsShapes;
};

void LayoutEditorCanvas::RenderEdittime()
{
    GetRenderingTarget().clear( sf::Color( layout.GetBackgroundColorRed(), layout.GetBackgroundColorGreen(), layout.GetBackgroundColorBlue() ) );
    GetRenderingTarget().setView(editionView);

    glClear(GL_DEPTH_BUFFER_BIT);
    GetRenderingTarget().pushGLStates(); //To allow using OpenGL to draw

    //Prepare GUI elements and the renderer
    std::vector < std::shared_ptr<sf::Shape> > guiElementsShapes;
    guiElements.clear();
    InstancesRenderer renderer(*this, GetInitialInstanceUnderCursor(), guiElementsShapes);

    //Render objects of each layer
    for (std::size_t layerIndex =0;layerIndex<layout.GetLayersCount();++layerIndex)
    {
        if ( layout.GetLayer(layerIndex).GetVisibility() )
        {
            GetRenderingTarget().popGLStates();

            glMatrixMode(GL_PROJECTION);
            glLoadIdentity();
            OpenGLTools::PerspectiveGL(layout.GetOpenGLFOV(), static_cast<double>(GetSize().x)/static_cast<double>(GetSize().y), layout.GetOpenGLZNear(), layout.GetOpenGLZFar());

            glViewport(0,0, GetSize().x, GetSize().y);

            GetRenderingTarget().pushGLStates();

            instances.IterateOverInstancesWithZOrdering(renderer, layout.GetLayer(layerIndex).GetName());
        }
    }


    //Go back to "window" view before drawing GUI elements
    GetRenderingTarget().setView(sf::View(sf::Vector2f(GetSize().x/2,GetSize().y/2), sf::Vector2f(GetSize().x,GetSize().y)));

    if ( options.grid ) RenderGrid();
    RenderInitialWindowBorder();

    if ( renderer.drawResizeButtons )
    {
        float resizeButtonsMaxX = renderer.resizeButtonsMaxX;
        float resizeButtonsMinX = renderer.resizeButtonsMinX;
        float resizeButtonsMaxY = renderer.resizeButtonsMaxY;
        float resizeButtonsMinY = renderer.resizeButtonsMinY;

        AddSmallButtonGuiElement(guiElementsShapes, sf::Vector2f(resizeButtonsMinX-gapBetweenButtonsAndRectangle-smallButtonSize, resizeButtonsMinY-gapBetweenButtonsAndRectangle-smallButtonSize), "resizeLeftUp");
        AddSmallButtonGuiElement(guiElementsShapes, sf::Vector2f(0.5*(resizeButtonsMinX+resizeButtonsMaxX-smallButtonSize), resizeButtonsMinY-gapBetweenButtonsAndRectangle-smallButtonSize), "resizeUp");
        AddSmallButtonGuiElement(guiElementsShapes, sf::Vector2f(resizeButtonsMaxX+gapBetweenButtonsAndRectangle, resizeButtonsMinY-gapBetweenButtonsAndRectangle-smallButtonSize), "resizeRightUp");
        AddSmallButtonGuiElement(guiElementsShapes, sf::Vector2f(resizeButtonsMaxX+gapBetweenButtonsAndRectangle, 0.5*(resizeButtonsMinY+resizeButtonsMaxY-smallButtonSize)), "resizeRight");
        AddSmallButtonGuiElement(guiElementsShapes, sf::Vector2f(resizeButtonsMaxX+gapBetweenButtonsAndRectangle, resizeButtonsMaxY+gapBetweenButtonsAndRectangle), "resizeRightDown");
        AddSmallButtonGuiElement(guiElementsShapes, sf::Vector2f(0.5*(resizeButtonsMinX+resizeButtonsMaxX-smallButtonSize), resizeButtonsMaxY+gapBetweenButtonsAndRectangle), "resizeDown");
        AddSmallButtonGuiElement(guiElementsShapes, sf::Vector2f(resizeButtonsMinX-gapBetweenButtonsAndRectangle-smallButtonSize, resizeButtonsMaxY+gapBetweenButtonsAndRectangle), "resizeLeftDown");
        AddSmallButtonGuiElement(guiElementsShapes, sf::Vector2f(resizeButtonsMinX-gapBetweenButtonsAndRectangle-smallButtonSize, 0.5*(resizeButtonsMinY+resizeButtonsMaxY-smallButtonSize)), "resizeLeft" );
        DrawAngleButtonGuiElement(guiElementsShapes, sf::Vector2f(0.5*(resizeButtonsMinX+resizeButtonsMaxX-smallButtonSize), 0.5*(resizeButtonsMinY+resizeButtonsMaxY-smallButtonSize)), renderer.selectionAngle);
    }

    if ( isSelecting )
    {
        sf::Vector2f rectangleOrigin = ConvertToWindowCoordinates(selectionRectangle.GetX(), selectionRectangle.GetY(),
                                                                  editionView);

        sf::Vector2f rectangleEnd = ConvertToWindowCoordinates(selectionRectangle.GetBottomRight().x,
                                                               selectionRectangle.GetBottomRight().y,
                                                               editionView);

        DrawSelectionRectangleGuiElement(guiElementsShapes, sf::FloatRect(rectangleOrigin, rectangleEnd-rectangleOrigin));
    }

    for (std::size_t i = 0;i<guiElementsShapes.size();++i)
    	GetRenderingTarget().draw(*guiElementsShapes[i]);

    if ( options.windowMask ) RenderWindowMask();

    GetRenderingTarget().setView(editionView);
    GetRenderingTarget().popGLStates();
}

void LayoutEditorCanvas::RenderWindowMask()
{
    sf::Vector2f rectangleOrigin = ConvertToWindowCoordinates(editionView.getCenter().x-project.GetMainWindowDefaultWidth()/2,
        editionView.getCenter().y-project.GetMainWindowDefaultHeight()/2, editionView);

    sf::Vector2f rectangleEnd = ConvertToWindowCoordinates(editionView.getCenter().x+project.GetMainWindowDefaultWidth()/2,
        editionView.getCenter().y+project.GetMainWindowDefaultHeight()/2, editionView);

    sf::Color maskColor((layout.GetBackgroundColorRed()+128)%255,
        (layout.GetBackgroundColorGreen()+128)%255,
        (layout.GetBackgroundColorBlue()+128)%255, 128);

    {
        sf::RectangleShape mask(sf::Vector2f(GetSize().x, rectangleOrigin.y));
        mask.setPosition(0, 0);
        mask.setFillColor(maskColor);
        GetRenderingTarget().draw(mask);
    }
    {
        sf::RectangleShape mask(sf::Vector2f(rectangleOrigin.x, GetSize().y-rectangleOrigin.y));
        mask.setPosition(0, rectangleOrigin.y);
        mask.setFillColor(maskColor);
        GetRenderingTarget().draw(mask);
    }
    {
        sf::RectangleShape mask(sf::Vector2f(GetSize().x-rectangleEnd.x, GetSize().y-rectangleOrigin.y));
        mask.setPosition(rectangleEnd.x, rectangleOrigin.y);
        mask.setFillColor(maskColor);
        GetRenderingTarget().draw(mask);
    }
    {
        sf::RectangleShape mask(sf::Vector2f(rectangleEnd.x-rectangleOrigin.x, GetSize().y-rectangleEnd.y));
        mask.setPosition(rectangleOrigin.x, rectangleEnd.y);
        mask.setFillColor(maskColor);
        GetRenderingTarget().draw(mask);
    }
}

void LayoutEditorCanvas::RenderInitialWindowBorder()
{
    sf::Color color((layout.GetBackgroundColorRed()+128)%255,
        (layout.GetBackgroundColorGreen()+128)%255,
        (layout.GetBackgroundColorBlue()+128)%255, 240);
    sf::Vertex line[8] = {sf::Vertex(ConvertToWindowCoordinates(0, 0, editionView), color),
        sf::Vertex(ConvertToWindowCoordinates(project.GetMainWindowDefaultWidth(), 0, editionView), color),
        sf::Vertex(ConvertToWindowCoordinates(project.GetMainWindowDefaultWidth(), 0, editionView), color),
        sf::Vertex(ConvertToWindowCoordinates(project.GetMainWindowDefaultWidth(), project.GetMainWindowDefaultHeight(), editionView), color),
        sf::Vertex(ConvertToWindowCoordinates(project.GetMainWindowDefaultWidth(), project.GetMainWindowDefaultHeight(), editionView), color),
        sf::Vertex(ConvertToWindowCoordinates(0, project.GetMainWindowDefaultHeight(), editionView), color),
        sf::Vertex(ConvertToWindowCoordinates(0, project.GetMainWindowDefaultHeight(), editionView), color),
        sf::Vertex(ConvertToWindowCoordinates(0, 0, editionView), color),};
    GetRenderingTarget().draw(line, 8, sf::Lines);
}

void LayoutEditorCanvas::RenderGrid()
{
    int initialXPos = floor((editionView.getCenter().x-editionView.getSize().x/2) / options.gridWidth)-options.gridWidth;
    initialXPos *= options.gridWidth;
    int initialYPos = floor((editionView.getCenter().y-editionView.getSize().y/2) / options.gridHeight)-options.gridHeight;
    initialYPos *= options.gridHeight;

    for ( int Xpos = initialXPos + options.gridOffsetX; Xpos < (editionView.getCenter().x+editionView.getSize().x/2); Xpos += options.gridWidth )
    {
        sf::Vertex line[2] = {sf::Vertex(ConvertToWindowCoordinates(Xpos, initialYPos, editionView), sf::Color(options.gridR, options.gridG, options.gridB)),
                              sf::Vertex(ConvertToWindowCoordinates(Xpos, editionView.getCenter().y+editionView.getSize().y/2, editionView), sf::Color(options.gridR, options.gridG, options.gridB))};
        GetRenderingTarget().draw(line, 2, sf::Lines);
    }

    for ( int Ypos = initialYPos + options.gridOffsetY; Ypos < (editionView.getCenter().y+editionView.getSize().y/2); Ypos += options.gridHeight )
    {
        sf::Vertex line[2] = {sf::Vertex(ConvertToWindowCoordinates(initialXPos, Ypos, editionView), sf::Color(options.gridR, options.gridG, options.gridB)),
                              sf::Vertex(ConvertToWindowCoordinates(editionView.getCenter().x+editionView.getSize().x/2, Ypos, editionView), sf::Color(options.gridR, options.gridG, options.gridB))};
        GetRenderingTarget().draw(line, 2, sf::Lines);
    }
}

sf::Vector2f LayoutEditorCanvas::ConvertToWindowCoordinates(float x, float y, const sf::View & view)
{
    //Transform by the view matrix
    sf::Vector2f hCoords = view.getTransform().transformPoint(x,y);

    //Go back from homogeneous coordinates to viewport ones.
    sf::IntRect viewport = GetRenderingTarget().getViewport(view);
    return sf::Vector2f(( hCoords.x + 1.f ) / 2.f * viewport.width + viewport.left,
                        (-hCoords.y + 1.f ) / 2.f * viewport.height + viewport.top);
}

void LayoutEditorCanvas::OnDeleteObjectSelected(wxCommandEvent & event)
{
    std::vector<gd::InitialInstance*> instancesToDelete;
    for (auto & it : selectedInstances)
        instancesToDelete.push_back(it.first);

    DeleteInstances(instancesToDelete);

    ClearSelection();
    ChangesMade();
}

void LayoutEditorCanvas::OnCreateObjectSelected(wxCommandEvent & event)
{
    gd::ChooseObjectTypeDialog chooseTypeDialog(this, project);
    if ( chooseTypeDialog.ShowModal() == 0 )
        return;

    //Find a new unique name for the object
    gd::String name = _("NewObject");
    for (unsigned int i = 2;layout.HasObjectNamed(name);++i)
        name =  _("NewObject")+gd::String::From(i);

    //Add a new object of selected type to objects list
    layout.InsertNewObject(project, chooseTypeDialog.GetSelectedObjectType(), name, layout.GetObjectsCount());

    for (auto & it : associatedEditors)
        it->ObjectsUpdated();

    //Add it on the layout ( Use oldMouseX/Y as the cursor has moved since the right click )
    AddObject(name, oldMouseX, oldMouseY);

    //Edit now the object
    gd::Object & object = layout.GetObject(name);
    object.EditObject(this, project, mainFrameWrapper);
    project.GetCurrentPlatform().GetChangesNotifier().OnObjectEdited(project, &layout, layout.GetObject(name));

    //Reload resources
    if ( wxDirExists(wxFileName::FileName(project.GetProjectFile()).GetPath()))
        wxSetWorkingDirectory(wxFileName::FileName(project.GetProjectFile()).GetPath());

    object.LoadResources(project, layout);

    wxSetWorkingDirectory(mainFrameWrapper.GetIDEWorkingDirectory());
}

void LayoutEditorCanvas::OnLockSelected(wxCommandEvent & event)
{
    for (auto & it : selectedInstances)
        if (it.first) it.first->SetLocked();

    ClearSelection();
    for (auto & it : associatedEditors)
        it->InitialInstancesUpdated();
}

void LayoutEditorCanvas::OnUnLockSelected(wxCommandEvent & event)
{
    gd::InitialInstance * instance = GetInitialInstanceAtPosition(oldMouseX, oldMouseY, /*pickOnlyLockedInstances=*/true);
    if (instance)
    {
        instance->SetLocked(false);

        ClearSelection();
        SelectInstance(instance);
        for (auto & it : associatedEditors)
            it->InitialInstancesUpdated();
    }
}

void LayoutEditorCanvas::OnCopySelected(wxCommandEvent & event)
{
    vector < std::shared_ptr<gd::InitialInstance> > copiedPositions;

    for(auto & it : selectedInstances)
    {
        if (it.first == NULL) continue;

        copiedPositions.push_back(std::shared_ptr<gd::InitialInstance>(it.first->Clone()));
        copiedPositions.back()->SetX(copiedPositions.back()->GetX() - oldMouseX);
        copiedPositions.back()->SetY(copiedPositions.back()->GetY() - oldMouseY);
    }

    gd::Clipboard::Get()->SetInstances(copiedPositions);
}

void LayoutEditorCanvas::OnCutSelected(wxCommandEvent & event)
{
    vector < std::shared_ptr<gd::InitialInstance> > copiedPositions;

    for (auto & it : selectedInstances)
    {
        if ( it.first == NULL ) continue;

        copiedPositions.push_back(std::shared_ptr<gd::InitialInstance>(it.first->Clone()));
        copiedPositions.back()->SetX(copiedPositions.back()->GetX() - oldMouseX);
        copiedPositions.back()->SetY(copiedPositions.back()->GetY() - oldMouseY);
    }
    gd::Clipboard::Get()->SetInstances(copiedPositions);
    ChangesMade();

    //Do not forget to remove the cut instances
    std::vector<gd::InitialInstance*> instancesToDelete;
    for (auto & it : selectedInstances)
        instancesToDelete.push_back(it.first);

    DeleteInstances(instancesToDelete);
    for (auto & it : associatedEditors)
        it->InitialInstancesUpdated();
}

void LayoutEditorCanvas::OnPasteSelected(wxCommandEvent & event)
{
    if ( !gd::Clipboard::Get()->HasInstances() ) return;

    vector < std::shared_ptr<gd::InitialInstance> > pastedInstances = gd::Clipboard::Get()->Gets();

    for (auto & it : pastedInstances)
    {
        gd::InitialInstance & instance = instances.InsertInitialInstance(*it->Clone());
        instance.SetX(instance.GetX()+oldMouseX);
        instance.SetY(instance.GetY()+oldMouseY);
    }

    ChangesMade();
    for (auto & it : associatedEditors)
        it->InitialInstancesUpdated();
}

void LayoutEditorCanvas::OnPasteSpecialSelected(wxCommandEvent & event)
{
    if ( !gd::Clipboard::Get()->HasInstances() ) return;
    vector < std::shared_ptr<gd::InitialInstance> > pastedInstances = gd::Clipboard::Get()->Gets();
    if ( pastedInstances.empty() || pastedInstances[0] == std::shared_ptr<gd::InitialInstance>() ) return;

    gd::InstancesAdvancedPasteDialog dialog(this);
    dialog.SetStartX(oldMouseX);
    dialog.SetStartY(oldMouseY);

    std::shared_ptr<gd::InitialInstance> instance = std::shared_ptr<gd::InitialInstance>(pastedInstances[0]->Clone());
    if ( instance != std::shared_ptr<gd::InitialInstance>() )
    {
        sf::Vector2f size = GetInitialInstanceSize(*instance);
        dialog.SetXGap(size.x);
        dialog.SetYGap(size.y);
    }

    if ( dialog.ShowModal() != 1 ) return;

    float angle = dialog.GetRotationIncrementation();
    for (std::size_t i = 0;i<dialog.GetYCount();++i)
    {
        for (std::size_t j = 0;j<dialog.GetXCount();++j)
        {
            gd::InitialInstance & insertedInstance = instances.InsertInitialInstance(*instance);
            insertedInstance.SetX(dialog.GetStartX()+dialog.GetXGap()*j);
            insertedInstance.SetY(dialog.GetStartY()+dialog.GetYGap()*i);
            insertedInstance.SetAngle(instance->GetAngle() + angle);

            angle += dialog.GetRotationIncrementation();
        }
    }

    ChangesMade();
    for (auto & it : associatedEditors)
        it->InitialInstancesUpdated();
}

void LayoutEditorCanvas::EnsureVisible(const gd::InitialInstance & instance)
{
    editionView.setCenter(instance.GetX(), instance.GetY());
}

void LayoutEditorCanvas::OnZoomInitBtClick( wxCommandEvent & event )
{
    options.zoomFactor = 1;
    UpdateViewAccordingToZoomFactor();
}

void LayoutEditorCanvas::OnZoomMoreBtClick(wxRibbonButtonBarEvent& evt)
{
    evt.PopupMenu(&zoomMenu);
}

void LayoutEditorCanvas::OnPreviewDropDownBtClick(wxRibbonButtonBarEvent& evt)
{
    evt.PopupMenu(&platformsMenu);
}

void LayoutEditorCanvas::OnMouseWheel( wxMouseEvent &event )
{
    if (!editing) return;

    if ( ctrlPressed )
    {
        float rotation = -event.GetWheelRotation()*8;
        float newheight = editionView.getSize().y + ( rotation / 25 );
        float newZoomFactor = static_cast<float>(GetSize().y)/newheight;
        if ( newZoomFactor > 0 ) options.zoomFactor = newZoomFactor;
        UpdateViewAccordingToZoomFactor();
    }
    else if ( altPressed )
    {
        editionView.move(-event.GetWheelRotation(), 0);
        UpdateScrollbars();
    }
    else
    {
        if(event.GetWheelAxis() == wxMOUSE_WHEEL_VERTICAL)
            editionView.move(0, -event.GetWheelRotation());
        else
            editionView.move(event.GetWheelRotation(), 0);
        UpdateScrollbars();
    }
}

void LayoutEditorCanvas::OnCustomZoom5Selected(wxCommandEvent& event)
{
    options.zoomFactor = 0.05;
    UpdateViewAccordingToZoomFactor();
}
void LayoutEditorCanvas::OnCustomZoom10Selected(wxCommandEvent& event)
{
    options.zoomFactor = 0.10;
    UpdateViewAccordingToZoomFactor();
}
void LayoutEditorCanvas::OnCustomZoom25Selected(wxCommandEvent& event)
{
    options.zoomFactor = 0.25;
    UpdateViewAccordingToZoomFactor();
}
void LayoutEditorCanvas::OnCustomZoom50Selected(wxCommandEvent& event)
{
    options.zoomFactor = 0.5;
    UpdateViewAccordingToZoomFactor();
}
void LayoutEditorCanvas::OnCustomZoom100Selected(wxCommandEvent& event)
{
    options.zoomFactor = 1.0;
    UpdateViewAccordingToZoomFactor();
}
void LayoutEditorCanvas::OnCustomZoom150Selected(wxCommandEvent& event)
{
    options.zoomFactor = 1.5;
    UpdateViewAccordingToZoomFactor();
}
void LayoutEditorCanvas::OnCustomZoom200Selected(wxCommandEvent& event)
{
    options.zoomFactor = 2.0;
    UpdateViewAccordingToZoomFactor();
}
void LayoutEditorCanvas::OnCustomZoom500Selected(wxCommandEvent& event)
{
    options.zoomFactor = 5.0;
    UpdateViewAccordingToZoomFactor();
}

void LayoutEditorCanvas::OnOrigineBtClick(wxCommandEvent & event )
{
    editionView.setCenter( (project.GetMainWindowDefaultWidth()/2),(project.GetMainWindowDefaultHeight()/2));
}

void LayoutEditorCanvas::UpdateSize()
{
    if (parentControl == NULL) return;

    if ( editing )
    {
        if ( parentControl->GetSize().GetWidth() <= 0 || parentControl->GetSize().GetHeight() <= 0)
            return;

        unsigned int width = parentControl->GetSize().GetWidth()-(vScrollbar ? vScrollbar->GetSize().GetWidth() : 0);
        unsigned int height = parentControl->GetSize().GetHeight()- (hScrollbar ? hScrollbar->GetSize().GetHeight() : 0);

        double scaleFactor = GUIContentScaleFactor::Get();

        //Scene takes all the space available in edition mode.
        wxWindowBase::SetPosition(wxPoint(0,0));
        wxWindowBase::SetSize(width * scaleFactor, height * scaleFactor);

        UpdateViewAccordingToZoomFactor();
    }
    else
    {
        //Scene has the size of the project's window size in preview mode.
        wxWindowBase::SetClientSize(project.GetMainWindowDefaultWidth(), project.GetMainWindowDefaultHeight());

        //Scene is centered in preview mode
        wxWindowBase::SetPosition(wxPoint((parentControl->GetSize().GetWidth()-wxWindowBase::GetSize().GetX())/2,
                              (parentControl->GetSize().GetHeight()-wxWindowBase::GetSize().GetY())/2));
    }
}

void LayoutEditorCanvas::OnvScrollbarScroll(wxScrollEvent& event)
{
    if ( vScrollbar == NULL )
        return;

    int newY = event.GetPosition()-(vScrollbar->GetRange()/2)+(GetSize().y/2);
    editionView.setCenter( editionView.getCenter().x, newY);

    OnUpdate();
}

void LayoutEditorCanvas::OnhScrollbarScroll(wxScrollEvent& event)
{
    if ( hScrollbar == NULL )
        return;

    int newX = event.GetPosition()-(hScrollbar->GetRange()/2)+(GetSize().x/2);
    editionView.setCenter( newX, editionView.getCenter().y );

    OnUpdate();
}

void LayoutEditorCanvas::UpdateScrollbars()
{
    if ( hScrollbar == NULL || vScrollbar == NULL )
        return;

    //Compute the thumb position
    int thumbY = editionView.getCenter().y+vScrollbar->GetRange()/2-GetSize().y/2;
    vScrollbar->SetScrollbar(thumbY, GetSize().y, vScrollbar->GetRange(), GetSize().y);

    int thumbX = editionView.getCenter().x+hScrollbar->GetRange()/2-GetSize().x/2;
    hScrollbar->SetScrollbar(thumbX, GetSize().x, hScrollbar->GetRange(), GetSize().x);

    //Update the size if needed
    if ( hScrollbar->HasFocus() || vScrollbar->HasFocus() )
        return;

    if ( thumbY <= 0 || static_cast<int>(thumbY+GetSize().y) >= vScrollbar->GetRange())
    {
        int offset = GetSize().y;
        vScrollbar->SetScrollbar(thumbY+offset/2, GetSize().y, vScrollbar->GetRange()+offset, GetSize().y);
    }

    if ( thumbX <= 0 || static_cast<int>(thumbX+GetSize().x) >= hScrollbar->GetRange())
    {
        int offset = GetSize().x;
        hScrollbar->SetScrollbar(thumbX+offset/2, GetSize().x, hScrollbar->GetRange()+offset, GetSize().x);
    }
}
void LayoutEditorCanvas::UpdateViewAccordingToZoomFactor()
{
    editionView.setSize(GetSize().x/options.zoomFactor, GetSize().y/options.zoomFactor);
}

void LayoutEditorCanvas::OnHelpBtClick( wxCommandEvent & event )
{
    gd::HelpFileAccess::Get()->OpenPage("game_develop/documentation/manual/edit_layout");
}


}
#endif
