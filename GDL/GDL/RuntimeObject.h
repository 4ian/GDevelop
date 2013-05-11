/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef RUNTIMEOBJECT_H
#define RUNTIMEOBJECT_H

#include <string>
#include <vector>
#include <map>
#include "GDCore/PlatformDefinition/VariablesContainer.h"
#include "GDL/Force.h"
namespace gd { class Automatism; }
namespace gd { class InitialInstance; }
namespace gd { class Object; }
namespace sf { class RenderTarget; }
class Polygon2d;
class RuntimeScene;

/**
 * \brief A RuntimeObject is something displayed on the scene.
 *
 * Games don't directly use this class: Extensions can provide object by deriving from this class, and redefining functions:
 * - An important function is RuntimeObject::Draw. It is called to render the object on the scene. This function take in parameter a reference to the target where render the object.
 * - RuntimeObjects must be able to return their size, by redefining RuntimeObject::GetWidth and RuntimeObject::GetHeight
 * - RuntimeObjects must be able to return the position where they have precisely drawn ( for example, Sprite can draw image not exactly at the position of the object, if the origin point was moved ). They must also be able to return the position of their center. See RuntimeObject::GetDrawableX, RuntimeObject::GetDrawableY and RuntimeObject::GetCenterX, RuntimeObject::GetCenterY.
 * - If objects need to load ressources ( for example textures at the loading ), it must be done inside the constructor creating the object from a gd::RuntimeObject.
 * - When objects are placed at the start of the scene, scenes call RuntimeObject::ExtraInitializationFromInitialInstance, passing a gd::InitialInstance object in parameter ( containing information like the position where place the object ). Note that common information were already changed ( Position, angle, layer... ). You just need to setup the object with the information related to your object.
 * - Finally, objects can expose debugging features: RuntimeObject::GetPropertyForDebugger, RuntimeObject::ChangeProperty and RuntimeObject::GetNumberOfProperties
 *
 * See also gd::Object which is used to store the initial objects before they are instancied on the scene.
 *
 * \see gd::Object
 *
 * \ingroup GameEngine
 * \ingroup PlatformDefinition
 */
class GD_API RuntimeObject
{
public:
    /**
     * Construct a RuntimeObject from an object.
     * The default implementation already takes care of setting common properties
     * ( name, type, automatisms... ). Be sure to call the original constructor if you redefine it:
     * \code
     * MyRuntimeObject(RuntimeScene & scene, const gd::Object & object) :
     *     RuntimeObject(scene, object)
     * {
     *     //...
     * }
     * \endcode
     */
    RuntimeObject(RuntimeScene & scene, const gd::Object & object);

    /**
     * Copy constructor. Calls Init().
     */
    RuntimeObject(const RuntimeObject & object) { Init(object); };

    /**
     * Assignment operator. Calls Init().
     */
    RuntimeObject& operator=(const RuntimeObject & object) {if( (this) != &object ) Init(object); return *this; }

    /** Default destructor
     */
    virtual ~RuntimeObject();

    /**
     * Must return a pointer to a copy of the object. A such method is needed to do polymorphic copies.
     * Just redefine this method in your derived object class like this:
     * \code
     * return new MyRuntimeObject(*this);
     * \endcode
     */
    virtual RuntimeObject * Clone() const { return new RuntimeObject(*this);}

    /**
     * Called by RuntimeScene when creating the RuntimeObject from an initial instance.
     * The RuntimeScene already takes care of setting common properties ( Position, Angle... )
     * according to the InitialInstance.
     */
    virtual bool ExtraInitializationFromInitialInstance(const gd::InitialInstance & position) {return true;}

    /**
     * Draw the object.
     * \param renderTarget The SFML Rendertarget where object must be drawn.
     */
    virtual bool Draw(sf::RenderTarget & renderTarget) {return true;};

    /** \name Object's variables
     * Members functions providing access to the object's variables.
     */
    ///@{

    /**
     * Provide access to the gd::VariablesContainer member containing the layout variables
     */
    inline const gd::VariablesContainer & GetVariables() const { return objectVariables; }

    /**
     * Provide access to the gd::VariablesContainer member containing the layout variables
     */
    inline gd::VariablesContainer & GetVariables() { return objectVariables; }

    ///@}


    /** \name Automatism related functions
     * Functions related to automatisms management.
     */
    ///@{
    /**
     * Call each automatism before events
     */
    void DoAutomatismsPreEvents(RuntimeScene & scene);

    /**
     * Call each automatism after events
     */
    void DoAutomatismsPostEvents(RuntimeScene & scene);

    /**
     * Only used by GD events generated code
     */
    gd::Automatism* GetAutomatismRawPointer(const std::string & name);

    /**
     * Only used by GD events generated code
     */
    gd::Automatism* GetAutomatismRawPointer(const std::string & name) const;

    /**
     * Return true if the object has the automatism with the specified name.
     */
    virtual bool HasAutomatismNamed(const std::string & name) const { return automatisms.find(name) != automatisms.end(); };
    ///@}

    /**
     * Get the name of the object
     */
    inline const std::string & GetName() const { return name; };

    /**
     * Get the type of the object
     */
    inline const std::string & GetType() const { return type; };

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
     * Return true if object's layer is layer_.
     */
    inline bool IsOnLayer(const std::string & layer_) const { return layer == layer_; }

    /**
     * Get object hitbox(es)
     *
     * \note Default implementation returns a basic bounding box, according to the object width/height and angle.
     */
    virtual std::vector<Polygon2d> GetHitBoxes() const;

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
    virtual float GetDrawableX() const {return GetX();};

    /**
     * Get the real Y position where is renderer the object.
     * Used by the IDE to draw selection box for instance.
     */
    virtual float GetDrawableY() const {return GetY();};

    /**
     * Get the X position of the center.
     * Used by actions that move object for instance.
     */
    virtual float GetCenterX() const {return GetWidth()/2;};

    /**
     * Get the Y position of the center.
     * Used by actions that move object for instance.
     */
    virtual float GetCenterY() const {return GetHeight()/2;};

    ///@}

    /** \name Forces
     * Members functions providing access to built-in force system
     * used to move the objects
     */
    ///@{

    Force force5; ///< \deprecated Old custom force used to manage collisions.
    std::vector < Force > forces; ///< Forces applied to object

    /**
     * Automatically called at each frame so as to update forces applied on the object.
     */
    bool UpdateForce(float ElapsedTime);

    float TotalForceX() const;
    float TotalForceY() const;
    float TotalForceAngle() const;
    float TotalForceLength() const;
    ///@}

    /**
     * Delete all forces applied to the object
     */
    bool ClearForce();

    #if defined(GD_IDE_ONLY)
    /** \name Others IDE related functions
     * Members functions used by the IDE
     */
    ///@{
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
    ///@}
    #endif

    /** \name Functions meant to be used by events generated code
     */
    ///@{
    void DeleteFromScene(RuntimeScene & scene);
    void PutAroundAPosition( float positionX, float positionY, float distance, float angleInDegrees );
    void AddForce( float x, float y, float clearing );
    void AddForceUsingPolarCoordinates( float angle, float length, float clearing );
    void AddForceTowardPosition( float positionX, float positionY, float length, float clearing );
    void AddForceToMoveAround( float positionX, float positionY, float angularVelocity, float distance, float clearing );
    void AddForceTowardObject( const std::string &, float length, float clearing, RuntimeObject * object );
    void AddForceToMoveAroundObject( const std::string &, float velocity, float length, float clearing, RuntimeObject * object );
    void PutAroundObject( const std::string &, float length, float angleInDegrees, RuntimeObject * object );

    void SetXY( const char* xOperator, float xValue, const char* yOperator, float yValue );

    void Duplicate( RuntimeScene & scene, std::map <std::string, std::vector<RuntimeObject*> *> pickedObjectLists );
    void ActivateAutomatism( const std::string & automatismName, bool activate = true );
    bool AutomatismActivated( const std::string & automatismName );

    bool IsStopped();
    bool TestAngleOfDisplacement( float angle, float tolerance );

    double GetSqDistanceWithObject( const std::string &, RuntimeObject * other );
    double GetDistanceWithObject( const std::string &, RuntimeObject * other );

    double GetVariableValue( const std::string & variable ); /** Only used internally by GD events generated code. */
    const std::string & GetVariableString( const std::string & variable ); /** Only used internally by GD events generated code. */

    void SeparateFromObjects(const std::string & , std::map <std::string, std::vector<RuntimeObject*> *> pickedObjectLists);

    /** To be deprecated
     */
    void SeparateObjectsWithoutForces( const std::string & , std::map <std::string, std::vector<RuntimeObject*> *> pickedObjectLists);

    /** To be deprecated
     */
    void SeparateObjectsWithForces( const std::string & , std::map <std::string, std::vector<RuntimeObject*> *> pickedObjectLists);
    ///@}

protected:

    std::string                                             name; ///< The full name of the object
    std::string                                             type; ///< Which type is the object. ( To test if we can do something reserved to some objects with it )
    float                                                   X; ///<X position on the scene
    float                                                   Y; ///<Y position on the scene
    int                                                     zOrder; ///<Z order on the scene, to choose if an object is displayed before another object.
    bool                                                    hidden; ///<True to prevent the object from being rendered.
    std::string                                             layer; ///<Name of the layer on which the object is.
    std::map<std::string, gd::Automatism* >                 automatisms; ///<Contains all automatisms of the object. Automatisms are the ownership of the object
    gd::VariablesContainer                                  objectVariables; ///<List of the variables of the object

    /**
     * Initialize object using another object. Used by copy-ctor and assign-op.
     * Don't forget to update me if members were changed !
     */
    void Init(const RuntimeObject & object);
};

/**
 * As extensions, a function used to delete the object. ( Simply a "delete object;" )
 */
void DestroyBaseRuntimeObject(RuntimeObject * object);

/**
 * As extensions, a function used to create an object. ( Simply a "return new RuntimeObject(name);" )
 */
RuntimeObject * CreateBaseRuntimeObject(RuntimeScene & scene, const gd::Object & object);

#endif // RUNTIMEOBJECT_H
