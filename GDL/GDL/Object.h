/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef OBJECT_H
#define OBJECT_H

#include <SFML/System.hpp>
#include <SFML/Graphics.hpp>
#include <iostream>
#include <string>
#include <vector>
#include <boost/shared_ptr.hpp>
#include <boost/enable_shared_from_this.hpp>

#include "GDL/Force.h"
#include "GDL/constantes.h"
#include "GDL/Sprite.h"
#include "GDL/ListVariable.h"
#include "GDL/Animation.h"
#include "GDL/ErrorReport.h"
#include "GDL/ObjectType.h"
using namespace std;

class RuntimeScene;
class Object;
class ExpressionInstruction;
class ObjectsConcerned;
class ImageManager;
class InitialPosition;
class TiXmlElement;
#ifdef GDE
class wxBitmap;
class Game;
class Scene;
class wxWindow;
class MainEditorCommand;
#include <wx/wx.h>
#endif

/**
 * An object is something displayed on the scene.
 * Games use not directly this class, but derived classes
 * provided by extensions.
 */
class GD_API Object : public boost::enable_shared_from_this<Object>
{
    public:

        Object(string name);
        virtual ~Object();

        /**
         * Called by RuntimeScene at loading
         */
        virtual bool LoadResources(const ImageManager & imageMgr) {return true;};

        /**
         * Called by RuntimeScene when placing an real object from a position
         */
        virtual bool InitializeFromInitialPosition(const InitialPosition & position) {return true;}

        /**
         * Draw the object
         */
        virtual bool Draw(sf::RenderWindow& main_window) {return true;};

        #ifdef GDE
        /**
         * Draw the object at edittime ( on a scene editor )
         */
        virtual bool DrawEdittime(sf::RenderWindow& main_window) {return true;};

        virtual bool GenerateThumbnail(const Game & game, wxBitmap & thumbnail) {return false;};
        virtual void EditObject( wxWindow* parent, Game & game_, MainEditorCommand & mainEditorCommand_ ) {};
        virtual wxPanel * CreateInitialPositionPanel( wxWindow* parent, const Game & game_, const Scene & scene_, const InitialPosition & position ) {return new wxPanel(parent);};
        virtual void UpdateInitialPositionFromPanel(wxPanel * panel, InitialPosition & position) {};

        virtual void GetPropertyForDebugger (unsigned int propertyNb, string & name, string & value) const;
        virtual bool ChangeProperty(unsigned int propertyNb, string newValue);
        virtual unsigned int GetNumberOfProperties() const;
        #endif

        virtual void LoadFromXml(const TiXmlElement * elemScene) {};
        virtual void SaveToXml(TiXmlElement * elemScene) {};

        virtual void UpdateTime(float timeElapsed) {};

        /**
         * Get the width of the object
         */
        virtual float GetWidth() const {return 0;};

        /**
         * Get the height of the object
         */
        virtual float GetHeight() const {return 0;};

        /**
         * Set the new width of the object.
         * The width can be not changed if the object doesn't want/is not designed to.
         */
        virtual void SetWidth(float ) {};

        /**
         * Set the new height of the object.
         * The height can be not changed if the object doesn't want/is not designed to.
         */
        virtual void SetHeight(float ) {};

        /**
         * Set the new angle of the object.
         * The angle can be not changed if the object doesn't want/is not designed to.
         */
        virtual void SetAngle(float ) {};

        /**
         * Get the angle of the object
         */
        virtual float GetAngle() const {return 0;};

        /**
         * Get X Position of the object.
         */
        inline float GetX() const { return X; }

        /**
         * Get Y Position of the object.
         */
        inline float GetY() const { return Y; }

        /**
         * Change X position. Call OnPositionChanged() to allow
         * objects do special things if they want.
         */
        void SetX(float x_) { X = x_; OnPositionChanged(); }

        /**
         * Change Y position. Call OnPositionChanged() to allow
         * objects do special things if they want.
         */
        void SetY(float y_) { Y = y_; OnPositionChanged(); }

        /**
         * Object can use this function to do special work
         * when position is changed.
         */
        virtual void OnPositionChanged() {};

        /**
         * Get the real X position where is renderer the object.
         * Used by the IDE to draw selection box for instance.
         */
        virtual float GetDrawableX() const {return 0;};

        /**
         * Get the real Y position where is renderer the object.
         * Used by the IDE to draw selection box for instance.
         */
        virtual float GetDrawableY() const {return 0;};

        /**
         * Get the X position of the center.
         * Used by actions that move object for instance.
         */
        virtual float GetCenterX() const {return 0;};

        /**
         * Get the Y position of the center.
         * Used by actions that move object for instance.
         */
        virtual float GetCenterY() const {return 0;};

        //Forces
        Force Force5;
        vector < Force > Forces;
        bool UpdateForce(float ElapsedTime);
        float TotalForceX() const;
        float TotalForceY() const;
        float TotalForceAngle() const;
        float TotalForceLength() const;
        bool ClearForce();

        void SetName(string name_);
        inline string GetName() { return name; }
        inline unsigned int GetObjectIdentifier() {return objectId;};

        /** Return the type indentifier of the object.
         */
        inline unsigned int GetTypeId() const { return typeId; }

        /** Set the type indentifier of the object.
         */
        inline void SetTypeId(unsigned int typeId_) { typeId = typeId_; }


        inline int GetZOrder() const { return zOrder; }
        inline void SetZOrder(int zOrder_ ) { zOrder = zOrder_; }

        inline bool IsHidden() const {return hidden;};
        inline void SetHidden(bool hide = true) {hidden = hide;};

        inline void SetLayer(string layer_) { layer = layer_;}
        inline string GetLayer() const { return layer; }

        //Variables
        ListVariable variablesObjet;

        //Pointeur pour l'ajout de messages d'erreurs.
        ErrorReport * errors;

        //Actions
        bool ActMettreX( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
        bool ActMettreY( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
        bool ActMettreXY( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
        bool ActMettreAutourPos( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
        bool ActChangeLayer( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
        bool ActAddForceXY( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
        bool ActAddForceAL( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
        bool ActAddForceVersPos( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
        bool ActArreter( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
        bool ActAddForceTournePos( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
        bool ActDelete( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
        bool ActChangeZOrder( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
        bool ActModVarObjet( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
        bool ActModVarObjetTxt( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
        bool ActCacheObjet( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
        bool ActMontreObjet( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
        bool ActDuplicate( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );

        //Conditions
        bool CondLayer( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );
        bool CondArret( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );
        bool CondVitesse( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );
        bool CondZOrder( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );
        bool CondPosX( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );
        bool CondPosY( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );
        bool CondVarObjet( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );
        bool CondVarObjetTxt( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );
        bool CondVarObjetDef( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );
        bool CondInvisibleObjet( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );
        bool CondVisibleObjet( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );

        //Expressions
        double ExpGetObjectX( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpGetObjectY( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpGetObjectTotalForceX( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpGetObjectTotalForceY( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpGetObjectTotalForceAngle( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpGetObjectTotalForceLength( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpGetObjectWidth( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpGetObjectHeight( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpGetObjectZOrder( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpGetObjectVariableValue( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpGetSqDistanceBetweenObjects( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpGetDistanceBetweenObjects( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );

    protected:

        string name;
        unsigned int objectId; ///< The ObjectId, associated with the name, is used ( instead of the name ) by the runtime to identify objects.
        unsigned int typeId; ///< The TypeId indicate of which type is the object. ( To test if we can do something reserved to some objects with it )*/

        float X;
        float Y;

        int zOrder;
        bool hidden;
        string layer;
};

//Actions
bool ActCreate( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
bool ActMettreAutour( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
bool ActAjoutObjConcern( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
bool ActAjoutHasard( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
bool ActRebondir( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
bool ActEcarter( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
bool ActAddForceVers( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
bool ActAddForceTourne( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
bool ActMoveObjects( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );

//Conditions
bool CondSeDirige( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );
bool CondDistance( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );
bool CondNbObjet( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );
bool CondAjoutObjConcern( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );
bool CondAjoutHasard( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );

/**
 * As extensions, need to provide creations and destruction functions
 */
void DestroyBaseObject(Object * object);
Object * CreateBaseObject(std::string name);
Object * CreateBaseObjectByCopy(Object * object);

//Usual typedefs
typedef vector < boost::shared_ptr<Object> > ObjList;
typedef boost::shared_ptr<Object> ObjSPtr;

/**
 * Test if an object must be deleted
 */
bool GD_API MustBeDeleted ( boost::shared_ptr<Object> object );

/**
 * Functor testing object name
 */
struct ObjectHasName : public std::binary_function<boost::shared_ptr<Object>, string, bool> {
    bool operator()(const boost::shared_ptr<Object> & object, string name) const { return object->GetName() == name; }
};

/**
 * Functor for sorting an ObjList by ZOrder
 */
struct SortByZOrder
{
   bool operator ()(ObjSPtr o1, ObjSPtr o2) const
   {
      return o1->GetZOrder() < o2->GetZOrder();
   }
};

#endif // OBJECT_H
