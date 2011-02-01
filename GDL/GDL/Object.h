/**
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef OBJECT_H
#define OBJECT_H

#if defined(GD_IDE_ONLY)
#include <wx/wx.h> //This include file must be placed first
#endif
#include "GDL/Force.h" //This include file must be placed first
#include <SFML/System.hpp>
#include <SFML/Graphics.hpp>
#include <iostream>
#include <string>
#include <vector>
#include <boost/shared_ptr.hpp>
#include <boost/interprocess/containers/flat_map.hpp>
#include <boost/enable_shared_from_this.hpp>
#include "GDL/ListVariable.h"
#include "GDL/ObjectHelpers.h"
#include "GDL/RotatedRectangle.h"

class RuntimeScene;
class Object;
class ExpressionInstruction;
class ObjectsConcerned;
class ImageManager;
class InitialPosition;
class TiXmlElement;
class Automatism;
#if defined(GD_IDE_ONLY)
class wxBitmap;
class Game;
class Scene;
class wxWindow;
class MainEditorCommand;
class ResourcesMergingHelper;
#endif

/**
 * An object is something displayed on the scene.
 * Games don't directly use this class, but derived classes
 * provided by extensions.
 */
class GD_API Object : public boost::enable_shared_from_this<Object>
{
    public:

        /**
         * Create a new object with the name passed as argument.
         * \param name Object's name
         */
        Object(std::string name);

        /**
         * Copy constructor. Calls Init().
         */
        Object(const Object & object) { Init(object); };

        /**
         * Assignement operator. Calls Init().
         */
        Object& operator=(const Object & object) {if( (this) != &object ) Init(object); return *this; }

        /**
         * Destructor. Does nothing particular.
         */
        virtual ~Object();

        /**
         * Return a new shared_ptr pointing to a copy of the object.
         */
        virtual ObjSPtr Clone() { return boost::shared_ptr<Object>(new Object(*this));}

        /**
         * Called by RuntimeScene at loading. The object is not necessarily used on the scene.
         */
        virtual bool LoadResources(const RuntimeScene & scene, const ImageManager & imageMgr) {return true;};

        /**
         * Called by RuntimeScene when the object is going to be used on the scene.
         */
        virtual bool LoadRuntimeResources(const RuntimeScene & scene, const ImageManager & imageMgr) {return true;};

        /**
         * Called by RuntimeScene when placing an real object from a position
         */
        virtual bool InitializeFromInitialPosition(const InitialPosition & position) {return true;}

        /**
         * Draw the object
         */
        virtual bool Draw(sf::RenderWindow& main_window) {return true;};

        /**
         * Load object from an xml element.
         */
        virtual void LoadFromXml(const TiXmlElement * elemScene) {};
        #if defined(GD_IDE_ONLY)

        /**
         * Save object to an xml element.
         */
        virtual void SaveToXml(TiXmlElement * elemScene) {};
        #endif

        /**
         * Called at each frame so as to update internal object's things using time ( Such as animation for a sprite ).
         */
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
        virtual bool SetAngle(float ) {return false;};

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
        std::vector < Force > Forces; ///< Forces applied to object

        /**
         * Automatically called at each frame so as to update forces applied on the object.
         */
        bool UpdateForce(float ElapsedTime);
        float TotalForceX() const;
        float TotalForceY() const;
        float TotalForceAngle() const;
        float TotalForceLength() const;

        /**
         * Delete all forces applied to the object
         */
        bool ClearForce();

        /**
         * Change name ( and object identifier )
         */
        void SetName(std::string name_);

        /**
         * Get string representing object's name.
         */
        inline std::string GetName() { return name; }

        /**
         * Get object identifier ( number representing the object name )
         */
        inline unsigned int GetObjectIdentifier() {return objectId;};

        /** Return the type indentifier of the object.
         */
        inline unsigned int GetTypeId() const { return typeId; }

        /**
         * Set the type indentifier of the object.
         */
        inline void SetTypeId(unsigned int typeId_) { typeId = typeId_; }

        /**
         * Query the Z order of the object
         */
        inline int GetZOrder() const { return zOrder; }

        /**
         * Change the Z order of the object
         */
        inline void SetZOrder(int zOrder_ ) { zOrder = zOrder_; }

        /**
         * Return if the object is hidden or not
         */
        inline bool IsHidden() const {return hidden;};

        /**
         * Hide/Show the object
         */
        inline void SetHidden(bool hide = true) {hidden = hide;};

        /**
         * Change the layer of the object
         */
        inline void SetLayer(std::string layer_) { layer = layer_;}

        /**
         * Get the layer of the object
         */
        inline std::string GetLayer() const { return layer; }

        /**
         * Get object hit box(es)
         */
        virtual std::vector<RotatedRectangle> GetHitBoxes() const { return std::vector<RotatedRectangle>(); };

        /**
         * Call each automatism before events
         */
        void DoAutomatismsPreEvents(RuntimeScene & scene);

        /**
         * Call each automatism after events
         */
        void DoAutomatismsPostEvents(RuntimeScene & scene);

        /**
         * Get automatism from type
         */
        inline boost::shared_ptr<Automatism> & GetAutomatism(unsigned int type) { return automatisms.find(type)->second; }

        /**
         * Get (const) automatism from type
         */
        inline const boost::shared_ptr<Automatism> & GetAutomatism(unsigned int type) const { return automatisms.find(type)->second; }

        /**
         * Add an automatism
         */
        void AddAutomatism(boost::shared_ptr<Automatism> automatism);

        /**
         * Get all types of automatisms used by the object
         */
        std::vector < unsigned int > GetAllAutomatismsNameIdentifiers();

        /**
         * Test if object has an automaism
         */
        bool HasAutomatism(unsigned int type) { return automatisms.find(type) != automatisms.end(); };

        #if defined(GD_IDE_ONLY)
        /**
         * Remove an automatism
         */
        void RemoveAutomatism(unsigned int type);
        #endif

        /**
         * Get a shared pointer for the object
         */
        inline boost::shared_ptr<Object> Shared_ptrFromObject()
        {
            return shared_from_this();
        }

        /**
         * Get a shared pointer for the object
         */
        inline boost::shared_ptr<const Object> Shared_ptrFromObject() const
        {
            return shared_from_this();
        }

        #if defined(GD_IDE_ONLY)
        /**
         * Draw the object at edittime ( on a scene editor )
         */
        virtual bool DrawEdittime(sf::RenderWindow& main_window) {return true;};

        /**
         * Called ( e.g. during compilation ) so as to inventory internal resources and update their filename
         */
        virtual void PrepareResourcesForMerging(ResourcesMergingHelper & resourcesMergingHelper) {return;};

        /**
         * Generate thumbnail for editor
         */
        virtual bool GenerateThumbnail(const Game & game, wxBitmap & thumbnail) {return false;};

        /**
         * Called when user wants to edit the object.
         */
        virtual void EditObject( wxWindow* parent, Game & game_, MainEditorCommand & mainEditorCommand_ ) {};

        /**
         * Called when user edit an object on scene.
         */
        virtual wxPanel * CreateInitialPositionPanel( wxWindow* parent, const Game & game_, const Scene & scene_, const InitialPosition & position ) {return new wxPanel(parent);};

        /**
         * Called so as to update InitialPosition values with values of panel.
         */
        virtual void UpdateInitialPositionFromPanel(wxPanel * panel, InitialPosition & position) {};

        /**
         * Called by the debugger so as to get a property value and name
         */
        virtual void GetPropertyForDebugger (unsigned int propertyNb, std::string & name, std::string & value) const;

        /**
         * Called by the debugger so as to update a property
         */
        virtual bool ChangeProperty(unsigned int propertyNb, std::string newValue);

        /**
         * Must return the number of available properties for the debugger
         */
        virtual unsigned int GetNumberOfProperties() const;
        #endif

        //Actions
        bool ActMettreX( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActMettreY( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActMettreXY( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActMettreAutourPos( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActChangeLayer( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActAddForceXY( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActAddForceAL( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActAddForceVersPos( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActArreter( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActAddForceTournePos( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActDelete( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActChangeZOrder( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActModVarObjet( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActModVarObjetTxt( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActCacheObjet( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActMontreObjet( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActDuplicate( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActActivateAutomatism( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );

        //Conditions
        bool CondLayer( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondArret( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondAngleOfDisplacement( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondVitesse( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondZOrder( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondPosX( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondPosY( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondVarObjet( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondVarObjetTxt( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondVarObjetDef( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondInvisibleObjet( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondVisibleObjet( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondAutomatismActivated( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );

        //Expressions
        double ExpGetObjectX( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpGetObjectY( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpGetObjectTotalForceX( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpGetObjectTotalForceY( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpGetObjectTotalForceAngle( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpGetObjectTotalForceLength( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpGetObjectWidth( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpGetObjectHeight( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpGetObjectZOrder( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpGetObjectVariableValue( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        std::string ExpGetObjectVariableString( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const StrExpressionInstruction & exprInstruction );
        double ExpGetSqDistanceBetweenObjects( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpGetDistanceBetweenObjects( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );

        ListVariable variablesObjet; ///<List of the variables of the object

    protected:

        std::string name; ///< The full name of the object
        unsigned int objectId; ///< The ObjectId, associated with the name, is used ( instead of the name ) by the runtime to identify objects.
        unsigned int typeId; ///< The TypeId indicate of which type is the object. ( To test if we can do something reserved to some objects with it )

        float X; ///<X position on the scene
        float Y; ///<Y position on the scene
        int zOrder; ///<Z order on the scene, to choose if an object is displayed before another object.
        bool hidden; ///<True to prevent the object from being rendered.
        std::string layer; ///<Name of the layer on which the object is.
        boost::interprocess::flat_map<unsigned int, boost::shared_ptr<Automatism> > automatisms; ///<Contains all automatisms of the object. Note the use of flat_map for better performance.

        /**
         * Initialize object using another object. Used by copy-ctor and assign-op.
         * Don't forget to update me if members were changed !
         */
        void Init(const Object & object);
};

//Actions
bool ActCreate( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActCreateByName( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActMettreAutour( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActAjoutObjConcern( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActAjoutHasard( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActRebondir( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActEcarter( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActAddForceVers( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActAddForceTourne( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
bool ActMoveObjects( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );

//Conditions
bool CondSeDirige( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool CondDistance( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool CondNbObjet( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool CondAjoutObjConcern( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool CondAjoutHasard( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool CondHBCollision( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );

/**
 * As extensions, a function used to delete the object. ( Simply a "delete object;" )
 */
void DestroyBaseObject(Object * object);

/**
 * As extensions, a function used to create an object. ( Simply a "return new Object(name);" )
 */
Object * CreateBaseObject(std::string name);

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
