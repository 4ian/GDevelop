/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef RUNTIMEOBJECT_H
#define RUNTIMEOBJECT_H

#include <map>
#include <memory>
#include <string>
#include <vector>
#include "GDCore/Tools/MakeUnique.h"
#include "GDCpp/Runtime/RuntimeVariablesContainer.h"
#include "GDCpp/Runtime/Force.h"
#include "GDCpp/Runtime/String.h"
#include "GDCpp/Runtime/Project/Behavior.h"
#include <SFML/Graphics/Rect.hpp>
namespace gd { class InitialInstance; }
namespace gd { class Object; }
namespace sf { class RenderTarget; }
class Polygon2d;
class RuntimeScene;

/**
 * \brief A RuntimeObject is something displayed on the scene.
 *
 * Games don't directly use this class: Extensions can provide object by deriving from this class, and redefining functions:
 * - The constructor must have this signature : MyRuntimeObject(RuntimeScene & scene, const MyObject & object) with MyObject the class inheriting from gd::Object.
 * - An important function is RuntimeObject::Draw. It is called to render the object on the scene. This function take in parameter a reference to the target where render the object.
 * - RuntimeObject must be able to return their size, by redefining RuntimeObject::GetWidth and RuntimeObject::GetHeight
 * - RuntimeObject must be able to return the position where they have precisely drawn ( for example, Sprite can draw its image not exactly at the position of the object, if the origin point was moved ). It must also be able to return the position of their center. See RuntimeObject::GetDrawableX, RuntimeObject::GetDrawableY and RuntimeObject::GetCenterX, RuntimeObject::GetCenterY.
 * - If objects need to load resources ( for example textures at the loading ), it must be done inside the constructor creating the object from a gd::Object.
 * - When objects are placed at the start of the scene, scenes call RuntimeObject::ExtraInitializationFromInitialInstance, passing a gd::InitialInstance object in parameter ( containing information like the position where place the object ). Note that common information were already changed ( Position, angle, layer... ). You just need to setup the object with the information related to your object.
 * - Finally, objects can expose debugging features: RuntimeObject::GetPropertyForDebugger, RuntimeObject::ChangeProperty and RuntimeObject::GetNumberOfProperties
 *
 * See also gd::Object which is used to store the initial objects before they are put on the scene.
 *
 * \see gd::Object
 *
 * \ingroup GameEngine
 */
class GD_API RuntimeObject
{
public:
    using Ref = RuntimeObject*;
    using OwningPtr = RuntimeObject*;

    /**
     * \brief Construct a RuntimeObject from an object.
     *
     * The default implementation already takes care of setting common properties
     * ( name, type, behaviors... ). Be sure to call the original constructor if you redefine it:
     * \code
     * MyRuntimeObject(RuntimeScene & scene, const MyObject & object) :
     *     RuntimeObject(scene, object)
     * {
     *     //...
     * }
     * \endcode
     * \note The constructor can take a specialized gd::Object as its second parameter which is the gd::Object sub-class
     * declared in ExtensionBase::AddRuntimeObject (the first template parameter)
     */
    RuntimeObject(RuntimeScene & scene, const gd::Object & object);

    /**
     * \brief Copy constructor. Calls Init().
     */
    RuntimeObject(const RuntimeObject & object) { Init(object); };

    /**
     * \brief Assignment operator. Calls Init().
     */
    RuntimeObject& operator=(const RuntimeObject & object) {if( (this) != &object ) Init(object); return *this; }

    /** \brief Default destructor
     */
    virtual ~RuntimeObject();

    /**
     * \brief Must return a pointer to a copy of the object. A such method is needed to do polymorphic copies.
     *
     * Just redefine this method in your derived object class like this:
     * \code
     * return new MyRuntimeObject(*this);
     * \endcode
     */
    virtual std::unique_ptr<RuntimeObject> Clone() const { return gd::make_unique<RuntimeObject>(*this);}

    /**
     * \brief Called by RuntimeScene when creating the RuntimeObject from an initial instance.
     *
     * \note The RuntimeScene already takes care of setting common properties (position, angle... )
     * according to the InitialInstance. You only need to initialize extra properties specific to your object.
     */
    virtual bool ExtraInitializationFromInitialInstance(const gd::InitialInstance & position) {return true;}

    /**
     * \brief Draw the object.
     * \param renderTarget The SFML Rendertarget where object must be drawn.
     */
    virtual bool Draw(sf::RenderTarget & renderTarget) {return true;};

    /** \name Object's variables
     * Members functions providing access to the object's variables.
     */
    ///@{

    /**
     * \brief Provide access to variables of the object.
     */
    inline const RuntimeVariablesContainer & GetVariables() const { return objectVariables; }

    /**
     * \brief Provide access to variables of the object.
     */
    inline RuntimeVariablesContainer & GetVariables() { return objectVariables; }

    ///@}


    /** \name Behavior related functions
     * Functions related to behaviors management.
     */
    ///@{
    /**
     * \brief Call each behavior so that they do their work before events
     */
    void DoBehaviorsPreEvents(RuntimeScene & scene);

    /**
     * \brief Call each behavior so that they do their work after the events were runn.
     */
    void DoBehaviorsPostEvents(RuntimeScene & scene);

    /**
     * Only used by GD events generated code
     */
    gd::Behavior* GetBehaviorRawPointer(const gd::String & name);

    /**
     * Only used by GD events generated code
     */
    gd::Behavior* GetBehaviorRawPointer(const gd::String & name) const;

    /**
     * \brief Return true if the object has the behavior with the specified name.
     */
    virtual bool HasBehaviorNamed(const gd::String & name) const { return behaviors.find(name) != behaviors.end(); };
    ///@}

    /**
     * \brief Get the name of the object
     */
    inline const gd::String & GetName() const { return name; };

    /**
     * \brief Get the type of the object
     */
    inline const gd::String & GetType() const { return type; };

    /**
     * \brief Query the Z order of the object
     */
    inline int GetZOrder() const { return zOrder; }

    /**
     * \brief Change the Z order of the object
     */
    inline void SetZOrder(int zOrder_ ) { zOrder = zOrder_; }

    /**
     * \brief Return if the object is hidden or not
     */
    inline bool IsHidden() const {return hidden;};

    /**
     * \brief Return if the object is visible ( not hidden )
     */
    inline bool IsVisible() const {return !hidden;};

    /**
     * \brief Hide/Show the object
     */
    inline void SetHidden(bool hide = true) {hidden = hide;};

    /**
     * \brief Change the layer of the object
     */
    inline void SetLayer(const gd::String & layer_) { layer = layer_;}

    /**
     * \brief Get the layer of the object
     */
    inline const gd::String & GetLayer() const { return layer; }

    /**
     * \brief Check if the object is on a layer.
     */
    inline bool IsOnLayer(const gd::String & layer_) const { return layer == layer_; }

    /**
     * \brief Get the object AABB
     */
    sf::FloatRect GetAABB() const;

    /**
     * \brief Get the object hitbox(es)
     * \note Default implementation returns a basic bounding box, according to the object width/height and angle.
     */
    virtual std::vector<Polygon2d> GetHitBoxes() const;

    /**
     * \brief Get the object hitbox(es) preferably intersecting with hint
     * \note The default implementation returns all the hitbox given by GetHitBoxes()
     */
    virtual std::vector<Polygon2d> GetHitBoxes(sf::FloatRect hint) const;

    /**
     * \brief Check collision between two objects using their hitboxes.
     * \note If bounding circles of objects are not colliding, hit boxes are not tested.
     * \param other The other object for collision to be tested against.
     */
    bool IsCollidingWith(RuntimeObject * other);

    /**
     * \brief Check if a point is inside the object collision hitboxes.
     * \param pointX The point x coordinate.
     * \param pointY The point y coordinate.
     * \return true if the point is inside the object collision hitboxes.
     */
    bool IsCollidingWithPoint(float pointX, float pointY);

    /**
     * \brief Check collision with each object of the list using their hitboxes, and move the object
     * according to the sum of the move vector returned by each collision test.
     * \note Bounding circles of objects are *not* checked.
     * \param objects The vector of objects to be used.
     * \return true if the object was moved.
     */
    bool SeparateFromObjects(const std::vector<RuntimeObject*> & objects);

    /**
     * \brief Return true if the cursor is on the object
     * \param scene The scene the object belongs to.
     * \param accurate If true, the test should be precise (depending on the object type). Otherwise,
     * a simple bouding box test is made.
     *
     * \return bool if the cursor is on the object
     */
    virtual bool CursorOnObject(RuntimeScene & scene, bool accurate);

    /**
     * \brief Called at each frame, before events and rendering.
     * \note The default implementation does nothing.
     */
    virtual void Update(const RuntimeScene & scene) {};

    /**
     * \brief Return the time elapsed since the last frame, in microseconds, for the object.
     *
     * Objects can have different elapsed time if they are on layers with different time scales.
     */
    signed long long GetElapsedTime(const RuntimeScene & scene) const;

    /**
     * \brief Get the width of the object, in pixels.
     */
    virtual float GetWidth() const {return 0;};

    /**
     * \brief Get the height of the object, in pixels.
     */
    virtual float GetHeight() const {return 0;};

    /**
     * \brief Set the new width of the object.
     *
     * The width can be not changed if the object doesn't want/is not designed to.
     */
    virtual void SetWidth(float ) {};

    /**
     * \brief Set the new height of the object.
     *
     * The height can be not changed if the object doesn't want/is not designed to.
     */
    virtual void SetHeight(float ) {};

    /**
     * \brief Get the angle of the object, in degrees.
     *
     * The angle can be not changed if the object doesn't want/is not designed to.
     */
    virtual bool SetAngle(float ) {return false;};

    /**
     * \brief Get the angle of the object, in degrees.
     */
    virtual float GetAngle() const {return 0;};

    /**
     * \brief Get the X coordinate of the object in the layout.
     */
    inline float GetX() const { return X; }

    /**
     * \brief Get the Y coordinate of the object in the layout.
     */
    inline float GetY() const { return Y; }

    /**
     * \brief Change X position of the object.
     * \note This method cannot be redefined: Redefine OnPositionChanged() to do extra work if needed.
     */
    void SetX(float x_) { X = x_; OnPositionChanged(); }

    /**
     * \brief Change Y position of the object.
     * \note This method cannot be redefined: Redefine OnPositionChanged() to do extra work if needed.
     */
    void SetY(float y_) { Y = y_; OnPositionChanged(); }

    /**
     * Object can use this function to do special work
     * when position is changed.
     */
    virtual void OnPositionChanged() {};

    /**
     * \brief Get the real X position where is renderer the object.
     *
     * Most of the time, this will return the same value as GetX().<br>
     * However, some objects may allow the origin point to be moved: In this case, you need to redefine this method.
     */
    virtual float GetDrawableX() const {return GetX();};

    /**
     * \brief Get the real Y position where is renderer the object.
     *
     * Most of the time, this will return the same value as GetY().<br>
     * However, some objects may allow the origin point to be moved: In this case, you need to redefine this method.
     */
    virtual float GetDrawableY() const {return GetY();};

    /**
     * \brief Get the X position of the center, relative to the position returned by GetDrawableX().
     */
    virtual float GetCenterX() const {return GetWidth()/2;};

    /**
     * \brief Get the Y position of the center, relative to the position returned by GetDrawableY().
     */
    virtual float GetCenterY() const {return GetHeight()/2;};

    /**
     * \brief Get squared distance, in pixel, between the object and the specified position.
     * \param x X coordinate of the point
     * \param y Y coordinate of the point
     */
    double GetSqDistanceTo(double x, double y);
    ///@}

    /** \name Forces
     * Members functions providing access to built-in force system
     * used to move the objects
     */
    ///@{

    Force force5; ///< \deprecated Old custom force used to manage collisions.

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
     * \brief Delete all forces applied to the object
     */
    bool ClearForce();

    #if defined(GD_IDE_ONLY)
    /** \name Others IDE related functions
     * Members functions used by the IDE
     */
    ///@{
    /**
     * \brief Called by the debugger so as to get a property value and name.
     * \warning value should be set to an UTF8 encoded string.
     * Implementation example:
     * \code
     * if      ( propertyNb == 0 ) {name = _("MyObjectProperty");      value = gd::String::From(GetSomeProperty());}
     * else if ( propertyNb == 1 ) {name = _("AnotherProperty");       value = GetAnotherPropety();}
     * \endcode
     */
    virtual void GetPropertyForDebugger (std::size_t propertyNb, gd::String & name, gd::String & value) const;

    /**
     * \brief Called by the debugger so as to update a property
     * \param propertyNb the property number
     * \param newValue the new value as an UTF8 string
     * \return true if property was changed, false if it not possible.
     *
     * Implementation example:
     * \code
     * if      ( propertyNb == 0 ) {return SetSomeProperty(ToFloat(newValue));}
     * else if ( propertyNb == 1 ) {return false;} //Changing property is not allowed: returning false.
     * \endcode
     */
    virtual bool ChangeProperty(std::size_t propertyNb, gd::String newValue);

    /**
     * \brief Must return the number of available properties for the debugger.
     */
    virtual std::size_t GetNumberOfProperties() const;
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
    void AddForceTowardObject( RuntimeObject * object, float length, float clearing );
    void AddForceToMoveAroundObject( RuntimeObject * object, float velocity, float length, float clearing );
    void PutAroundObject( RuntimeObject * object, float length, float angleInDegrees );

    void RotateTowardPosition(float Xposition, float Yposition, float speed, RuntimeScene & scene);
    void RotateTowardAngle(float angleInDegrees, float speed, RuntimeScene & scene);
    void Rotate(float speed, RuntimeScene & scene);

    static gd::Variable & ReturnVariable(gd::Variable & variable) { return variable; };
    bool VariableExists(const gd::String & variable);
    static double GetVariableValue(const gd::Variable & variable) { return variable.GetValue(); };
    static const gd::String& GetVariableString(const gd::Variable & variable) { return variable.GetString(); };
    static bool VariableChildExists(const gd::Variable & variable, const gd::String & childName);
    static void VariableRemoveChild(gd::Variable & variable, const gd::String & childName);
    static void VariableClearChildren(gd::Variable & variable);
    static unsigned int GetVariableChildCount(gd::Variable & variable);

    void SetXY( const char* xOperator, float xValue, const char* yOperator, float yValue );

    void Duplicate( RuntimeScene & scene, std::map <gd::String, std::vector<RuntimeObject*> *> pickedObjectLists );
    void ActivateBehavior( const gd::String & behaviorName, bool activate = true );
    bool BehaviorActivated( const gd::String & behaviorName );

    bool IsStopped();
    bool TestAngleOfDisplacement( float angle, float tolerance );

    double GetSqDistanceWithObject( RuntimeObject * other );
    double GetDistanceWithObject( RuntimeObject * other );

    bool SeparateFromObjects( std::map <gd::String, std::vector<RuntimeObject*> *> pickedObjectLists);

    /** \deprecated
     */
    void SeparateObjectsWithoutForces( std::map <gd::String, std::vector<RuntimeObject*> *> pickedObjectLists);

    /** \deprecated
     */
    void SeparateObjectsWithForces( std::map <gd::String, std::vector<RuntimeObject*> *> pickedObjectLists);
    ///@}

protected:

    gd::String                                             name; ///< The full name of the object
    gd::String                                             type; ///< Which type is the object. ( To test if we can do something reserved to some objects with it )
    float                                                  X; ///<X position on the scene
    float                                                  Y; ///<Y position on the scene
    int                                                    zOrder; ///<Z order on the scene, to choose if an object is displayed before another object.
    bool                                                   hidden; ///<True to prevent the object from being rendered.
    gd::String                                             layer; ///<Name of the layer on which the object is.
    std::map<gd::String, std::unique_ptr<gd::Behavior>>    behaviors; ///<Contains all behaviors of the object. Behaviors are the ownership of the object
    RuntimeVariablesContainer                              objectVariables; ///<List of the variables of the object
    std::vector < Force >                                  forces; ///< Forces applied to the object

    /**
     * \brief Initialize object using another object. Used by copy-ctor and assign-op.
     * \warning Don't forget to update me if members were changed!
     */
    void Init(const RuntimeObject & object);
};

#endif // RUNTIMEOBJECT_H
