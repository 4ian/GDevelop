#include "GDL/TextObject.h"
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
#include "GDL/TextObjectEditor.h"
#endif

TextObject::TextObject(std::string name_) :
Object(name_),
text("Text"),
opacity( 255 ),
colorR( 255 ),
colorG( 255 ),
colorB( 255 )
{
}

void TextObject::LoadFromXml(const TiXmlElement * object)
{
    if ( object->FirstChildElement( "String" ) == NULL ||
         object->FirstChildElement( "String" )->Attribute("value") == NULL )
    {
        cout << "Les informations concernant le texte d'un objet Text manquent.";
    }
    else
    {
        text.SetString(object->FirstChildElement("String")->Attribute("value"));
    }

    if ( object->FirstChildElement( "Font" ) == NULL ||
         object->FirstChildElement( "Font" )->Attribute("value") == NULL )
    {
        cout << "Les informations concernant la police d'un objet Text manquent.";
    }
    else
    {
        SetFont(object->FirstChildElement("Font")->Attribute("value"));
    }

    if ( object->FirstChildElement( "CharacterSize" ) == NULL ||
         object->FirstChildElement( "CharacterSize" )->Attribute("value") == NULL )
    {
        cout << "Les informations concernant la taille du texte d'un objet Text manquent.";
    }
    else
    {
        float size = 20;
        object->FirstChildElement("CharacterSize")->QueryFloatAttribute("value", &size);

        SetCharacterSize(size);
    }

    if ( object->FirstChildElement( "Color" ) == NULL ||
         object->FirstChildElement( "Color" )->Attribute("r") == NULL ||
         object->FirstChildElement( "Color" )->Attribute("g") == NULL ||
         object->FirstChildElement( "Color" )->Attribute("b") == NULL )
    {
        cout << "Les informations concernant la couleur du texte d'un objet Text manquent.";
    }
    else
    {
        int r = 255;
        int g = 255;
        int b = 255;
        object->FirstChildElement("Color")->QueryIntAttribute("r", &r);
        object->FirstChildElement("Color")->QueryIntAttribute("g", &g);
        object->FirstChildElement("Color")->QueryIntAttribute("b", &b);

        SetColor(r,g,b);
    }
}

void TextObject::SaveToXml(TiXmlElement * object)
{
    TiXmlElement * str = new TiXmlElement( "String" );
    object->LinkEndChild( str );
    str->SetAttribute("value", string(text.GetString()).c_str());

    TiXmlElement * font = new TiXmlElement( "Font" );
    object->LinkEndChild( font );
    font->SetAttribute("value", GetFont().c_str());

    TiXmlElement * characterSize = new TiXmlElement( "CharacterSize" );
    object->LinkEndChild( characterSize );
    characterSize->SetAttribute("value", GetCharacterSize());

    TiXmlElement * color = new TiXmlElement( "Color" );
    object->LinkEndChild( color );
    color->SetAttribute("r", colorR);
    color->SetAttribute("g", colorG);
    color->SetAttribute("b", colorB);
}

bool TextObject::LoadResources(const ImageManager & imageMgr )
{
    //No ressources to load.

    return true;
}

/**
 * Update animation and direction from the inital position
 */
bool TextObject::InitializeFromInitialPosition(const InitialPosition & position)
{
    //TODO

    return true;
}

/**
 * Render object at runtime
 */
bool TextObject::Draw( sf::RenderWindow& window )
{
    //Don't draw anything if hidden
    if ( hidden ) return true;

    text.SetX( GetX() );
    text.SetY( GetY() );
    text.SetColor(sf::Color(colorR, colorG, colorB, opacity));

    window.Draw( text );

    return true;
}

#ifdef GDE
/**
 * Render object at edittime
 */
bool TextObject::DrawEdittime(sf::RenderWindow& renderWindow)
{
    text.SetX( GetX() );
    text.SetY( GetY() );
    text.SetColor(sf::Color(colorR, colorG, colorB, opacity));

    renderWindow.Draw( text );

    return true;
}

bool TextObject::GenerateThumbnail(const Game & game, wxBitmap & thumbnail)
{
    thumbnail = wxBitmap("Extensions/texticon.png", wxBITMAP_TYPE_ANY);

    return true;
}

void TextObject::EditObject( wxWindow* parent, Game & game, MainEditorCommand & mainEditorCommand )
{
    TextObjectEditor dialog(parent, game, *this, mainEditorCommand);
    dialog.ShowModal();
}

wxPanel * TextObject::CreateInitialPositionPanel( wxWindow* parent, const Game & game_, const Scene & scene_, const InitialPosition & position )
{
    //TODO
    return NULL;
}

void TextObject::UpdateInitialPositionFromPanel(wxPanel * panel, InitialPosition & position)
{
    //TODO
}

void TextObject::GetPropertyForDebugger(unsigned int propertyNb, string & name, string & value) const
{
    if      ( propertyNb == 0 ) {name = _("Texte");                     value = text.GetString();}
    else if ( propertyNb == 1 ) {name = _("Police");                    value = fontName;}
    else if ( propertyNb == 2 ) {name = _("Taille de caractères");      value = toString(GetCharacterSize());}
    else if ( propertyNb == 3 ) {name = _("Couleur");       value = toString(colorR)+";"+toString(colorG)+";"+toString(colorB);}
    else if ( propertyNb == 4 ) {name = _("Opacité");       value = toString(GetOpacity());}
}

bool TextObject::ChangeProperty(unsigned int propertyNb, string newValue)
{
    if      ( propertyNb == 0 ) { text.SetString(newValue); return true; }
    else if ( propertyNb == 1 ) { SetFont(newValue); }
    else if ( propertyNb == 2 ) { SetCharacterSize(toInt(newValue)); }
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

        SetColor(toInt(r), toInt(g), toInt(b));
    }
    else if ( propertyNb == 4 ) { SetOpacity(toInt(newValue)); }

    return true;
}

unsigned int TextObject::GetNumberOfProperties() const
{
    return 5;
}
#endif

/**
 * Get the real X position of the sprite
 */
float TextObject::GetDrawableX() const
{
    return text.GetPosition().x;
}

/**
 * Get the real Y position of the text
 */
float TextObject::GetDrawableY() const
{
    return text.GetPosition().y;
}

/**
 * Width is the width of the current sprite.
 */
float TextObject::GetWidth() const
{
    return text.GetRect().GetSize().x;
}

/**
 * Height is the height of the current sprite.
 */
float TextObject::GetHeight() const
{
    return text.GetRect().GetSize().y;
}

/**
 * X center is computed with text rectangle
 */
float TextObject::GetCenterX() const
{
    return text.GetRect().GetSize().x/2;
}

/**
 * Y center is computed with text rectangle
 */
float TextObject::GetCenterY() const
{
    return text.GetRect().GetSize().y/2;
}

/**
 * Nothing to do when updating time
 */
void TextObject::UpdateTime(float)
{
}

/**
 * Change the color filter of the sprite object
 */
void TextObject::SetColor( unsigned int r, unsigned int g, unsigned int b )
{
    colorR = r;
    colorG = g;
    colorB = b;
}

void TextObject::SetOpacity(int val)
{
    if ( val > 255 )
        val = 255;
    else if ( val < 0 )
        val = 0;

    opacity = val;
}

void TextObject::SetFont(string fontName_)
{
    fontName = fontName_;

    FontManager * fontManager = FontManager::getInstance();
    text.SetFont(*fontManager->GetFont(fontName));
}

/**
 * Test the string
 */
bool TextObject::CondString( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    if (( condition.GetParameter(2).GetAsCompOperator() == GDExpression::Equal && string(text.GetString()) == eval.EvalTxt(condition.GetParameter( 1 ), shared_from_this()) ) ||
        ( condition.GetParameter(2).GetAsCompOperator() == GDExpression::Different && string(text.GetString()) != eval.EvalTxt(condition.GetParameter( 1 ), shared_from_this()) )
       )
    {
        return true;
    }

    return false;
}

/**
 * Change the string
 */
bool TextObject::ActString( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    if ( action.GetParameter(2).GetAsModOperator() == GDExpression::Set )
        text.SetString( eval.EvalTxt(action.GetParameter(1), shared_from_this()) );
    else if ( action.GetParameter(2).GetAsModOperator() == GDExpression::Add )
        text.SetString( string(text.GetString()) + eval.EvalTxt(action.GetParameter(1), shared_from_this()) );

    return true;
}

bool TextObject::ActFont( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    SetFont(eval.EvalTxt(action.GetParameter(1), shared_from_this()));

    return true;
}

bool TextObject::CondSize( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetCharacterSize() == eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetCharacterSize() < eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetCharacterSize() > eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetCharacterSize() <= eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetCharacterSize() >= eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetCharacterSize() != eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) )
       )
    {
       return true;
    }

    return false;
}

bool TextObject::ActSize( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetCharacterSize( static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetCharacterSize( GetCharacterSize() + static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetCharacterSize( GetCharacterSize() - static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetCharacterSize( GetCharacterSize() * static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetCharacterSize( GetCharacterSize() / static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));

    return true;
}

/**
 * Test the opacity
 */
bool TextObject::CondOpacity( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetOpacity() == eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetOpacity() < eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetOpacity() > eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetOpacity() <= eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetOpacity() >= eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetOpacity() != eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) )
       )
    {
       return true;
    }

    return false;
}

/**
 * Modify opacity
 */
bool TextObject::ActOpacity( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetOpacity( static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetOpacity( GetOpacity() + static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetOpacity( GetOpacity() - static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetOpacity( GetOpacity() * static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetOpacity( GetOpacity() / static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));

    return true;
}

double TextObject::ExpOpacity( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return opacity;
}

/**
 * Change the color of the texte
 */
bool TextObject::ActChangeColor( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    vector < GDExpression > colors = SpliterStringToVector <GDExpression> (eval.EvalTxt(action.GetParameter(1), shared_from_this()), ';');

    if ( colors.size() < 3 ) return false; //La couleur est incorrecte

    colorR = eval.EvalExp( colors[0], shared_from_this() );
    colorG = eval.EvalExp( colors[1], shared_from_this() );
    colorB = eval.EvalExp( colors[2], shared_from_this() );

    return true;
}


/**
 * Function destroying an extension Object.
 * Game Develop does not delete directly extension object
 * to avoid overloaded new/delete conflicts.
 */
void DestroyTextObject(Object * object)
{
    delete object;
}

/**
 * Function creating an extension Object.
 * Game Develop can not directly create an extension object
 */
Object * CreateTextObject(std::string name)
{
    return new TextObject(name);
}

/**
 * Function creating an extension Object from another.
 * Game Develop can not directly create an extension object.
 *
 * Note that it is safe to do the static cast, as this function
 * is called owing to the typeId of the object to copy.
 */
Object * CreateTextObjectByCopy(Object * object)
{
    return new TextObject(*static_cast<TextObject *>(object));
}
