#include "GDL/DrawerObject.h"
#include <SFML/Graphics.hpp>
#include "GDL/Object.h"
#include "GDL/Access.h"
#include "GDL/ImageManager.h"
#include "GDL/tinyxml.h"
#include "GDL/FontManager.h"

#ifdef GDE
#include <wx/wx.h>
#include "GDL/StdAlgo.h"
#include "GDL/MainEditorCommand.h"
#include "GDL/DrawerObjectEditor.h"
#endif

DrawerObject::DrawerObject(std::string name_) :
Object(name_),
fillColorR( 255 ),
fillColorG( 255 ),
fillColorB( 255 ),
fillOpacity( 255 ),
outlineSize(1),
outlineColorR(0),
outlineColorG(0),
outlineColorB(0),
outlineOpacity(255),
absoluteCoordinates(true)
{
}

void DrawerObject::LoadFromXml(const TiXmlElement * object)
{
    if ( object->FirstChildElement( "FillColor" ) == NULL ||
         object->FirstChildElement( "FillColor" )->Attribute("r") == NULL ||
         object->FirstChildElement( "FillColor" )->Attribute("g") == NULL ||
         object->FirstChildElement( "FillColor" )->Attribute("b") == NULL )
    {
        cout << "Les informations concernant la couleur de remplissage d'un objet Drawer manquent.";
    }
    else
    {
        int r = 255;
        int g = 255;
        int b = 255;
        object->FirstChildElement("FillColor")->QueryIntAttribute("r", &r);
        object->FirstChildElement("FillColor")->QueryIntAttribute("g", &g);
        object->FirstChildElement("FillColor")->QueryIntAttribute("b", &b);

        SetFillColor(r,g,b);
    }

    if ( object->FirstChildElement( "FillOpacity" ) == NULL ||
         object->FirstChildElement( "FillOpacity" )->Attribute("value") == NULL )
    {
        cout << "Les informations concernant l'opacité du remplissage d'un objet Drawer manquent.";
    }
    else
    {
        object->FirstChildElement("FillOpacity")->QueryIntAttribute("value", &fillOpacity);
    }


    if ( object->FirstChildElement( "OutlineColor" ) == NULL ||
         object->FirstChildElement( "OutlineColor" )->Attribute("r") == NULL ||
         object->FirstChildElement( "OutlineColor" )->Attribute("g") == NULL ||
         object->FirstChildElement( "OutlineColor" )->Attribute("b") == NULL )
    {
        cout << "Les informations concernant la couleur du contour d'un objet Drawer manquent.";
    }
    else
    {
        int r = 255;
        int g = 255;
        int b = 255;
        object->FirstChildElement("OutlineColor")->QueryIntAttribute("r", &r);
        object->FirstChildElement("OutlineColor")->QueryIntAttribute("g", &g);
        object->FirstChildElement("OutlineColor")->QueryIntAttribute("b", &b);

        SetOutlineColor(r,g,b);
    }

    if ( object->FirstChildElement( "OutlineOpacity" ) == NULL ||
         object->FirstChildElement( "OutlineOpacity" )->Attribute("value") == NULL )
    {
        cout << "Les informations concernant l'opacité du contour d'un objet Drawer manquent.";
    }
    else
    {
        object->FirstChildElement("OutlineOpacity")->QueryIntAttribute("value", &outlineOpacity);
    }

    if ( object->FirstChildElement( "OutlineSize" ) == NULL ||
         object->FirstChildElement( "OutlineSize" )->Attribute("value") == NULL )
    {
        cout << "Les informations concernant la taille du contour d'un objet Drawer manquent.";
    }
    else
    {
        object->FirstChildElement("OutlineSize")->QueryIntAttribute("value", &outlineSize);
    }

    absoluteCoordinates = true;
    if ( object->FirstChildElement( "AbsoluteCoordinates" ) == NULL ||
         object->FirstChildElement( "AbsoluteCoordinates" )->Attribute("value") == NULL )
    {
        cout << "Les informations concernant le type des coordonnées d'un objet Drawer manquent.";
    }
    else
    {
        string result = object->FirstChildElement("AbsoluteCoordinates")->Attribute("value");
        if ( result == "false" )
            absoluteCoordinates = false;
    }
}

void DrawerObject::SaveToXml(TiXmlElement * object)
{
    TiXmlElement * fillOpacityElem = new TiXmlElement( "FillOpacity" );
    object->LinkEndChild( fillOpacityElem );
    fillOpacityElem->SetAttribute("value", outlineOpacity);

    TiXmlElement * fillColorElem = new TiXmlElement( "FillColor" );
    object->LinkEndChild( fillColorElem );
    fillColorElem->SetAttribute("r", fillColorR);
    fillColorElem->SetAttribute("g", fillColorG);
    fillColorElem->SetAttribute("b", fillColorB);

    TiXmlElement * outlineSizeElem = new TiXmlElement( "OutlineSize" );
    object->LinkEndChild( outlineSizeElem );
    outlineSizeElem->SetAttribute("value", outlineSize);

    TiXmlElement * outlineOpacityElem = new TiXmlElement( "OutlineOpacity" );
    object->LinkEndChild( outlineOpacityElem );
    outlineOpacityElem->SetAttribute("value", outlineOpacity);

    TiXmlElement * outlineColorElem = new TiXmlElement( "OutlineColor" );
    object->LinkEndChild( outlineColorElem );
    outlineColorElem->SetAttribute("r", outlineColorR);
    outlineColorElem->SetAttribute("g", outlineColorG);
    outlineColorElem->SetAttribute("b", outlineColorB);

    TiXmlElement * absoluteCoordinatesElem = new TiXmlElement( "AbsoluteCoordinates" );
    object->LinkEndChild( absoluteCoordinatesElem );
    if ( absoluteCoordinates )
        absoluteCoordinatesElem->SetAttribute("value", "true");
    else
        absoluteCoordinatesElem->SetAttribute("value", "false");
}

bool DrawerObject::LoadResources(const ImageManager & imageMgr )
{
    //No ressources to load.
    #if defined(GDE)
    edittimeIconImage.LoadFromFile("Extensions/primitivedrawingicon.png");
    edittimeIcon.SetImage(edittimeIconImage);
    #endif

    return true;
}

/**
 * Update animation and direction from the inital position
 */
bool DrawerObject::InitializeFromInitialPosition(const InitialPosition & position)
{
    return true;
}

/**
 * Render object at runtime
 */
bool DrawerObject::Draw( sf::RenderWindow& window )
{
    //Don't draw anything if hidden
    if ( hidden )
    {
        shapesToDraw.clear();
        return true;
    }

    for (unsigned int i = 0;i<shapesToDraw.size();++i)
    	window.Draw(shapesToDraw[i]);

    shapesToDraw.clear();

    return true;
}

#ifdef GDE
/**
 * Render object at edittime
 */
bool DrawerObject::DrawEdittime(sf::RenderWindow& renderWindow)
{
    edittimeIcon.SetPosition(GetX(), GetY());
    renderWindow.Draw(edittimeIcon);

    return true;
}

bool DrawerObject::GenerateThumbnail(const Game & game, wxBitmap & thumbnail)
{
    thumbnail = wxBitmap("Extensions/primitivedrawingicon.png", wxBITMAP_TYPE_ANY);

    return true;
}

void DrawerObject::EditObject( wxWindow* parent, Game & game, MainEditorCommand & mainEditorCommand )
{
    DrawerObjectEditor dialog(parent, game, *this, mainEditorCommand);
    dialog.ShowModal();
}

wxPanel * DrawerObject::CreateInitialPositionPanel( wxWindow* parent, const Game & game_, const Scene & scene_, const InitialPosition & position )
{
    //TODO
    return NULL;
}

void DrawerObject::UpdateInitialPositionFromPanel(wxPanel * panel, InitialPosition & position)
{
    //TODO
}

void DrawerObject::GetPropertyForDebugger(unsigned int propertyNb, string & name, string & value) const
{
    if      ( propertyNb == 0 ) {name = _("Couleur de remplissage");    value = toString(fillColorR)+";"+toString(fillColorG)+";"+toString(fillColorB);}
    else if ( propertyNb == 1 ) {name = _("Opacité du remplissage");    value = toString(fillOpacity);}
    else if ( propertyNb == 2 ) {name = _("Taille du contour");         value = toString(outlineSize);}
    else if ( propertyNb == 3 ) {name = _("Couleur du contour");        value = toString(outlineColorR)+";"+toString(outlineColorG)+";"+toString(outlineColorB);}
    else if ( propertyNb == 4 ) {name = _("Opacité du contour");        value = toString(outlineOpacity);}
}

bool DrawerObject::ChangeProperty(unsigned int propertyNb, string newValue)
{
    if      ( propertyNb == 0 )
    {
        string r, gb, g, b;
        {
            size_t separationPos = newValue.find(";");

            if ( separationPos > newValue.length())
                return false;

            r = newValue.substr(0, separationPos);
            gb = newValue.substr(separationPos+1, newValue.length());
        }

        {
            size_t separationPos = gb.find(";");

            if ( separationPos > gb.length())
                return false;

            g = gb.substr(0, separationPos);
            b = gb.substr(separationPos+1, gb.length());
        }

        SetFillColor(toInt(r), toInt(g), toInt(b));
    }
    else if ( propertyNb == 1 ) { SetFillOpacity(toInt(newValue)); }
    else if ( propertyNb == 2 ) { SetOutlineSize(toInt(newValue)); }
    else if ( propertyNb == 3 )
    {
        string r, gb, g, b;
        {
            size_t separationPos = newValue.find(";");

            if ( separationPos > newValue.length())
                return false;

            r = newValue.substr(0, separationPos);
            gb = newValue.substr(separationPos+1, newValue.length());
        }

        {
            size_t separationPos = gb.find(";");

            if ( separationPos > gb.length())
                return false;

            g = gb.substr(0, separationPos);
            b = gb.substr(separationPos+1, gb.length());
        }

        SetOutlineColor(toInt(r), toInt(g), toInt(b));
    }
    else if ( propertyNb == 4 ) { SetOutlineOpacity(toInt(newValue)); }

    return true;
}

unsigned int DrawerObject::GetNumberOfProperties() const
{
    return 5;
}
#endif

/**
 * Get the real X position of the sprite
 */
float DrawerObject::GetDrawableX() const
{
    return GetX();
}

/**
 * Get the real Y position of the text
 */
float DrawerObject::GetDrawableY() const
{
    return GetY();
}

/**
 * Width
 */
float DrawerObject::GetWidth() const
{
    return 32;
}

/**
 * Height
 */
float DrawerObject::GetHeight() const
{
    return 32;
}

/**
 * X center is computed with text rectangle
 */
float DrawerObject::GetCenterX() const
{
    return 16;
}

/**
 * Y center is computed with text rectangle
 */
float DrawerObject::GetCenterY() const
{
    return 16;
}

/**
 * Nothing to do when updating time
 */
void DrawerObject::UpdateTime(float)
{
}

/**
 * Change the color filter of the sprite object
 */
void DrawerObject::SetFillColor( unsigned int r, unsigned int g, unsigned int b )
{
    fillColorR = r;
    fillColorG = g;
    fillColorB = b;
}

void DrawerObject::SetFillOpacity(int val)
{
    if ( val > 255 )
        val = 255;
    else if ( val < 0 )
        val = 0;

    fillOpacity = val;
}

/**
 * Change the color filter of the sprite object
 */
void DrawerObject::SetOutlineColor( unsigned int r, unsigned int g, unsigned int b )
{
    outlineColorR = r;
    outlineColorG = g;
    outlineColorB = b;
}

void DrawerObject::SetOutlineOpacity(int val)
{
    if ( val > 255 )
        val = 255;
    else if ( val < 0 )
        val = 0;

    outlineOpacity = val;
}


bool DrawerObject::CondOutlineSize( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetOutlineSize() == eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetOutlineSize() < eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetOutlineSize() > eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetOutlineSize() <= eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetOutlineSize() >= eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetOutlineSize() != eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) )
       )
    {
       return true;
    }

    return false;
}

bool DrawerObject::ActOutlineSize( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetOutlineSize( static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetOutlineSize( GetOutlineSize() + static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetOutlineSize( GetOutlineSize() - static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetOutlineSize( GetOutlineSize() * static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetOutlineSize( GetOutlineSize() / static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));

    return true;
}

/**
 * Test the fill color opacity
 */
bool DrawerObject::CondFillOpacity( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetFillOpacity() == eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetFillOpacity() < eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetFillOpacity() > eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetFillOpacity() <= eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetFillOpacity() >= eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetFillOpacity() != eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) )
       )
    {
       return true;
    }

    return false;
}

/**
 * Modify fill color opacity
 */
bool DrawerObject::ActFillOpacity( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetFillOpacity( static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetFillOpacity( GetFillOpacity() + static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetFillOpacity( GetFillOpacity() - static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetFillOpacity( GetFillOpacity() * static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetFillOpacity( GetFillOpacity() / static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));

    return true;
}

double DrawerObject::ExpFillOpacity( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return fillOpacity;
}

/**
 * Test the opacity
 */
bool DrawerObject::CondOutlineOpacity( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetOutlineOpacity() == eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetOutlineOpacity() < eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetOutlineOpacity() > eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetOutlineOpacity() <= eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetOutlineOpacity() >= eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetOutlineOpacity() != eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) )
       )
    {
       return true;
    }

    return false;
}

/**
 * Modify opacity
 */
bool DrawerObject::ActOutlineOpacity( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetOutlineOpacity( static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetOutlineOpacity( GetOutlineOpacity() + static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetOutlineOpacity( GetOutlineOpacity() - static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetOutlineOpacity( GetOutlineOpacity() * static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetOutlineOpacity( GetOutlineOpacity() / static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));

    return true;
}

double DrawerObject::ExpOutlineOpacity( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return outlineOpacity;
}

/**
 * Change the fill color
 */
bool DrawerObject::ActFillColor( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    vector < GDExpression > colors = SpliterStringToVector <GDExpression> (eval.EvalTxt(action.GetParameter(1), shared_from_this()), ';');

    if ( colors.size() < 3 ) return false; //La couleur est incorrecte

    fillColorR = eval.EvalExp( colors[0], shared_from_this() );
    fillColorG = eval.EvalExp( colors[1], shared_from_this() );
    fillColorB = eval.EvalExp( colors[2], shared_from_this() );

    return true;
}

/**
 * Change the color of the outline
 */
bool DrawerObject::ActOutlineColor( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    vector < GDExpression > colors = SpliterStringToVector <GDExpression> (eval.EvalTxt(action.GetParameter(1), shared_from_this()), ';');

    if ( colors.size() < 3 ) return false; //La couleur est incorrecte

    outlineColorR = eval.EvalExp( colors[0], shared_from_this() );
    outlineColorG = eval.EvalExp( colors[1], shared_from_this() );
    outlineColorB = eval.EvalExp( colors[2], shared_from_this() );

    return true;
}

bool DrawerObject::ActRectangle( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    float Xgap = absoluteCoordinates ? 0 : GetX();
    float Ygap = absoluteCoordinates ? 0 : GetY();

    shapesToDraw.push_back(sf::Shape::Rectangle(eval.EvalExp(action.GetParameter(1), shared_from_this())+Xgap,
                                                eval.EvalExp(action.GetParameter(2), shared_from_this())+Ygap,
                                                eval.EvalExp(action.GetParameter(3), shared_from_this())+Xgap,
                                                eval.EvalExp(action.GetParameter(4), shared_from_this())+Ygap,
                                                sf::Color(fillColorR, fillColorG, fillColorB, fillOpacity),
                                                outlineSize,
                                                sf::Color(outlineColorR, outlineColorG, outlineColorB, outlineOpacity)
                                                ));

    return true;
}

bool DrawerObject::ActLine( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    float Xgap = absoluteCoordinates ? 0 : GetX();
    float Ygap = absoluteCoordinates ? 0 : GetY();

    shapesToDraw.push_back(sf::Shape::Line(eval.EvalExp(action.GetParameter(1), shared_from_this())+Xgap,
                                                eval.EvalExp(action.GetParameter(2), shared_from_this())+Ygap,
                                                eval.EvalExp(action.GetParameter(3), shared_from_this())+Xgap,
                                                eval.EvalExp(action.GetParameter(4), shared_from_this())+Ygap,
                                                eval.EvalExp(action.GetParameter(5), shared_from_this()),
                                                sf::Color(fillColorR, fillColorG, fillColorB, fillOpacity),
                                                outlineSize,
                                                sf::Color(outlineColorR, outlineColorG, outlineColorB, outlineOpacity)
                                                ));

    return true;
}

bool DrawerObject::ActCircle( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    float Xgap = absoluteCoordinates ? 0 : GetX();
    float Ygap = absoluteCoordinates ? 0 : GetY();

    shapesToDraw.push_back(sf::Shape::Circle(eval.EvalExp(action.GetParameter(1), shared_from_this())+Xgap,
                                                eval.EvalExp(action.GetParameter(2), shared_from_this())+Ygap,
                                                eval.EvalExp(action.GetParameter(3), shared_from_this()),
                                                sf::Color(fillColorR, fillColorG, fillColorB, fillOpacity),
                                                outlineSize,
                                                sf::Color(outlineColorR, outlineColorG, outlineColorB, outlineOpacity)
                                                ));

    return true;
}

bool ActCopyImageOnAnother( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    std::map < string, sf::Image >::iterator dest = scene->game->imageManager.images.find(eval.EvalTxt(action.GetParameter(0)));
    if ( dest == scene->game->imageManager.images.end() ) return false;

    std::map < string, sf::Image >::const_iterator src = scene->game->imageManager.images.find(eval.EvalTxt(action.GetParameter(1)));
    if ( src == scene->game->imageManager.images.end() ) return false;

    //Make sure the coordinates are correct.
    int destX = eval.EvalExp(action.GetParameter(2));
    if ( destX < 0 || static_cast<unsigned>(destX) >= dest->second.GetWidth()) return false;

    int destY = eval.EvalExp(action.GetParameter(3));
    if ( destY < 0 || static_cast<unsigned>(destY) >= dest->second.GetWidth()) return false;

    dest->second.Copy(src->second, destX, destY);

    return true;
}

/**
 * Function destroying an extension Object.
 * Game Develop does not delete directly extension object
 * to avoid overloaded new/delete conflicts.
 */
void DestroyDrawerObject(Object * object)
{
    delete object;
}

/**
 * Function creating an extension Object.
 * Game Develop can not directly create an extension object
 */
Object * CreateDrawerObject(std::string name)
{
    return new DrawerObject(name);
}

/**
 * Function creating an extension Object from another.
 * Game Develop can not directly create an extension object.
 *
 * Note that it is safe to do the static cast, as this function
 * is called owing to the typeId of the object to copy.
 */
Object * CreateDrawerObjectByCopy(Object * object)
{
    return new DrawerObject(*static_cast<DrawerObject *>(object));
}
