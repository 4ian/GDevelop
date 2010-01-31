#ifndef TEXTOBJECT_H
#define TEXTOBJECT_H

#include "GDL/Object.h"
#include "GDL/ObjectWithOpacity.h"
#include <SFML/Graphics.hpp>
class Evaluateur;
class ImageManager;
class RuntimeScene;
class Object;
class ExpressionInstruction;
class ObjectsConcerned;
class ImageManager;
class InitialPosition;
#ifdef GDE
class wxBitmap;
class Game;
class wxWindow;
class MainEditorCommand;
#endif

/**
 * Text Object
 */
class TextObject : public Object
{
    public :

        TextObject(std::string name_);
        virtual ~TextObject() {};

        virtual bool LoadResources(const ImageManager & imageMgr );
        virtual bool InitializeFromInitialPosition(const InitialPosition & position);

        virtual bool Draw(sf::RenderWindow& main_window);

        #ifdef GDE
        virtual bool DrawEdittime(sf::RenderWindow& main_window);
        virtual bool GenerateThumbnail(const Game & game, wxBitmap & thumbnail);

        virtual void EditObject( wxWindow* parent, Game & game_, MainEditorCommand & mainEditorCommand_ );
        virtual wxPanel * CreateInitialPositionPanel( wxWindow* parent, const Game & game_, const Scene & scene_, const InitialPosition & position );
        virtual void UpdateInitialPositionFromPanel(wxPanel * panel, InitialPosition & position);

        virtual void GetPropertyForDebugger (unsigned int propertyNb, string & name, string & value) const;
        virtual bool ChangeProperty(unsigned int propertyNb, string newValue);
        virtual unsigned int GetNumberOfProperties() const;
        #endif

        virtual void LoadFromXml(const TiXmlElement * elemScene);
        virtual void SaveToXml(TiXmlElement * elemScene);

        virtual void UpdateTime(float timeElapsed);

        virtual void OnPositionChanged() {};

        virtual float GetWidth() const;
        virtual float GetHeight() const;
        virtual void SetWidth(float ) {};
        virtual void SetHeight(float ) {};

        virtual float GetDrawableX() const;
        virtual float GetDrawableY() const;

        virtual float GetCenterX() const;
        virtual float GetCenterY() const;

        virtual void SetAngle(float newAngle) { angle = newAngle;};
        virtual float GetAngle() const {return angle;};

        inline void SetString(std::string str) { text.SetString(str); };
        inline std::string GetString() const {return text.GetString();};

        inline void SetCharacterSize(float size) { text.SetCharacterSize(size); };
        inline float GetCharacterSize() const { return text.GetCharacterSize(); };

        void SetFont(std::string fontName_);
        inline std::string GetFont() {return fontName;};

        void SetOpacity(int val);
        inline int GetOpacity() const {return opacity;};

        void SetColor(unsigned int r,unsigned int v,unsigned int b);
        inline unsigned int GetColorR() const { return colorR; };
        inline unsigned int GetColorG() const { return colorG; };
        inline unsigned int GetColorB() const { return colorB; };

        //ACE for string
        bool CondString( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );
        bool ActString( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );

        //ACE for font and size
        bool ActFont( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
        bool CondSize( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );
        bool ActSize( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );

        //ACE for opacity
        bool CondOpacity( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );
        bool ActOpacity( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
        double ExpOpacity( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );

        //Action for color
        bool ActChangeColor( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );

    private:

        //The text to display
        sf::Text text;
        std::string fontName;

        //Opacity
        int opacity;

        //Color
        unsigned int colorR;
        unsigned int colorG;
        unsigned int colorB;

        float angle;
};

void GD_API DestroyTextObject(Object * object);
Object * GD_API CreateTextObject(std::string name);
Object * GD_API CreateTextObjectByCopy(Object * object);

#endif // TEXTOBJECT_H
