/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef OBJECT_H
#define OBJECT_H

#include "GDL/Force.h" //This include file must be placed first. Could be removed if Force is removed a day.
#include <string>
#include <vector>
#include <map>
#include <boost/shared_ptr.hpp>
#include <boost/enable_shared_from_this.hpp>
#include "GDL/ListVariable.h"
#include "GDL/ObjectHelpers.h"

namespace sf
{
    class RenderWindow;
}

class RotatedRectangle;
class RuntimeScene;
class Object;
class ExpressionInstruction;
class StrExpressionInstruction;
class ObjectsConcerned;
class ImageManager;
class InitialPosition;
class TiXmlElement;
class Automatism;
#if defined(GD_IDE_ONLY)
class wxBitmap;
class wxPanel;
class Game;
class Scene;
class wxWindow;
class MainEditorCommand;
class ResourcesMergingHelper;
#endif

/**
 * \brief An object is something displayed on the scene.
 *
 * Games don't directly use this class: Extensions can provide object by deriving from this class, and redefining functions:
 * - Two important functions are Object::Draw and Object::DrawEdittime. They are called by scenes so as to render the object. These functions take in parameter a reference to the window where render the object.
 * - Objects must be able to return their size, by redefining Object::GetWidth and Object::GetHeight
 * - Objects must be able to return the position where they have precisely drawn ( for example, Sprite can draw image not exactly at the position of the object, if the origine point was moved ). They must also be able to return the position of their center. See Object::GetDrawableX, Object::GetDrawableY and Object::GetCenterX, Object::GetCenterY.
 * - If objects need to load ressources ( for example textures at the loading ), redefine and implement Object::LoadResources and/or Object::LoadRuntimeResources ( See the Box3D Object extension sources so as to view an example ).
 * - When objects are placed at the start of the scene, scenes call Object::InitializeFromInitialPosition, passing a InitialPosition object in parameter ( containing information like the position where place the object ). Note that common information were already changed ( Position, angle, layer... ). You just need to setup the object with the information related to your object.
 * - Objects are loaded and saved ( to xml ) with Object::LoadFromXml and Object::SaveToXml, using TinyXml library ( See the source of the Text Object or the Box 3D Object so as to view how to implement these functions ) :
 * - Objects can have also functions related to the edition: Object::GenerateThumbnail, Object::EditObject, Object::CreateInitialPositionPanel and Object::UpdateInitialPositionFromPanel
 * - Finally, objects can expose debugging features: Object::GetPropertyForDebugger, Object::ChangeProperty and Object::GetNumberOfProperties
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

        /** Change name
         */
        void SetName(const std::string & name_) {name = name_;};

        /** Get string representing object's name.
         */
        inline const std::string & GetName() { return name; }

        /** Return the type indentifier of the object.
         */
        inline const std::string & GetType() const { return type; }

        /**
         * Set the type indentifier of the object.
         */
        inline void SetType(const std::string & type_) { type = type_; }

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
         * Return if the object is visible ( not hidden )
         */
        inline bool IsVisible() const {return !hidden;};

        /**
         * Hide/Show the object
         */
        inline void SetHidden(bool hide = true) {hidden = hide;};

        /**
         * Change the layer of the object
         */
        inline void SetLayer(const std::string & layer_) { layer = layer_;}

        /**
         * Get the layer of the object
         */
        inline const std::string & GetLayer() const { return layer; }

        /**
         * Get object hit box(es)
         */
        virtual std::vector<RotatedRectangle> GetHitBoxes() const;

        /**
         * Call each automatism before events
         */
        void DoAutomatismsPreEvents(RuntimeScene & scene);

        /**
         * Call each automatism after events
         */
        void DoAutomatismsPostEvents(RuntimeScene & scene);

        /**
         * Get automatism from name
         */
        inline boost::shared_ptr<Automatism> & GetAutomatism(const std::string & name) { return automatisms.find(name)->second; }

        /**
         * Get (const) automatism from name
         */
        inline const boost::shared_ptr<Automatism> & GetAutomatism(const std::string & name) const { return automatisms.find(name)->second; }

        /**
         * Only used by GD events generated code
         */
        Automatism* GetAutomatismRawPointer(const std::string & name);

        /**
         * Only used by GD events generated code
         */
        Automatism* GetAutomatismRawPointer(const std::string & name) const;

        /**
         * Add an automatism
         */
        void AddAutomatism(boost::shared_ptr<Automatism> automatism);

        /**
         * Get all types of automatisms used by the object
         */
        std::vector < std::string > GetAllAutomatismNames();

        /**
         * Test if object has an automaism
         */
        bool HasAutomatism(const std::string & name) { return automatisms.find(name) != automatisms.end(); };

        #if defined(GD_IDE_ONLY)
        /**
         * Remove an automatism
         */
        void RemoveAutomatism(const std::string & name);
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
         * Called ( e.g. during compilation ) so as to inventory internal resources and update their filename.
         * Implementation example:
         * \code
         * myResourceFile = resourcesMergingHelper.GetNewFilename(myResourceFile);
         * \endcode
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
        virtual wxPanel * CreateInitialPositionPanel( wxWindow* parent, const Game & game_, const Scene & scene_, const InitialPosition & position );

        /**
         * Called so as to update InitialPosition values with values of panel.
         */
        virtual void UpdateInitialPositionFromPanel(wxPanel * panel, InitialPosition & position) {};

        /**
         * Called by the debugger so as to get a property value and name
         * Implementation example:
         * \code
         * if      ( propertyNb == 0 ) {name = _("MyObjectProperty");      value = ToString(GetSomeProperty());}
         * else if ( propertyNb == 1 ) {name = _("AnotherProperty");       value = GetAnotherPropety();}
         * \endcode
         */
        virtual void GetPropertyForDebugger (unsigned int propertyNb, std::string & name, std::string & value) const;

        /**
         * Called by the debugger so as to update a property
         * \return true if property was changed, false if it not possible.
         *
         * Implementation example:
         * \code
         * if      ( propertyNb == 0 ) {return SetSomeProperty(ToFloat(newValue));}
         * else if ( propertyNb == 1 ) {return false;} //Changing property is not allowed: returning false.
         * \endcode
         */
        virtual bool ChangeProperty(unsigned int propertyNb, std::string newValue);

        /**
         * Must return the number of available properties for the debugger.
         */
        virtual unsigned int GetNumberOfProperties() const;
        #endif

        void DeleteFromScene(RuntimeScene & scene);

        void PutAroundAPosition( float positionX, float positionY, float distance, float angleInDegrees );
        void AddForce( float x, float y, float clearing );
        void AddForceUsingPolarCoordinates( float angle, float length, float clearing );
        void AddForceTowardPosition( float positionX, float positionY, float length, float clearing );
        void AddForceToMoveAround( float positionX, float positionY, float angularVelocity, float distance, float clearing );
        void AddForceTowardObject( std::string , float length, float clearing, Object * object );
        void AddForceToMoveAroundObject( std::string , float velocity, float length, float clearing, Object * object );
        void PutAroundObject( std::string , float length, float angleInDegrees, Object * object );

        void SetXY( float xValue, const char* xOperator, float yValue, const char* yOperator );

        void Duplicate( RuntimeScene & scene, std::vector<Object*>& );
        void ActivateAutomatism( const std::string & automatismName, bool activate = true );
        bool AutomatismActivated( const std::string & automatismName );

        bool IsStopped();
        bool TestAngleOfDisplacement( float angle, float tolerance );

        double GetSqDistanceWithObject( const std::string &, Object * other );
        double GetDistanceWithObject( const std::string &, Object * other );

        ListVariable variablesObjet; ///<List of the variables of the object
        double GetVariableValue( const std::string & variable ); /** Only used internally by GD events generated code. */
        const std::string & GetVariableString( const std::string & variable ); /** Only used internally by GD events generated code. */

        /** To be deprecated
         */
        void SeparateObjectsWithoutForces( const std::string & , std::map <std::string, std::vector<Object*> *> pickedObjectLists);

        /** To be deprecated
         */
        void SeparateObjectsWithForces( const std::string & , std::map <std::string, std::vector<Object*> *> pickedObjectLists);
    protected:

        std::string name; ///< The full name of the object
        std::string type; ///< Which type is the object. ( To test if we can do something reserved to some objects with it )

        float X; ///<X position on the scene
        float Y; ///<Y position on the scene
        int zOrder; ///<Z order on the scene, to choose if an object is displayed before another object.
        bool hidden; ///<True to prevent the object from being rendered.
        std::string layer; ///<Name of the layer on which the object is.
        std::map<std::string, boost::shared_ptr<Automatism> > automatisms; ///<Contains all automatisms of the object.

        /**
         * Initialize object using another object. Used by copy-ctor and assign-op.
         * Don't forget to update me if members were changed !
         */
        void Init(const Object & object);
};

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
struct ObjectHasName : public std::binary_function<boost::shared_ptr<Object>, std::string, bool> {
    bool operator()(const boost::shared_ptr<Object> & object, const std::string & name) const { return object->GetName() == name; }
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
