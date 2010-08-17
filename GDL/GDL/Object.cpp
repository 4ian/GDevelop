/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/Object.h"
#include <SFML/System.hpp>
#include <SFML/Graphics.hpp>
#include <iostream>
#include <string>
#include <vector>
#include <boost/shared_ptr.hpp>

#include "GDL/ObjectIdentifiersManager.h"
#include "GDL/Log.h"
#include "GDL/Force.h"
#include "GDL/constantes.h"
#include <string>
#include <list>
#include <sstream>
#include "GDL/MemTrace.h"
#include "GDL/ErrorReport.h"
#include "GDL/CommonTools.h"
#include "GDL/Automatism.h"
#include <typeinfo>

using namespace std;

Object::Object(string name_) :
        errors( NULL ),
        name( name_ ),
        objectId(0),
        typeId(0), //0 is the default typeId for an object
        X( 0 ),
        Y( 0 ),
        zOrder( 0 ),
        hidden( false )
{
    ObjectIdentifiersManager * objectIdentifiersManager = ObjectIdentifiersManager::getInstance();
    objectId = objectIdentifiersManager->GetOIDfromName(name_);

    this->ClearForce();
}

void Object::Init(const Object & object)
{
    Forces = object.Forces;
    Force5 = object.Force5;
    variablesObjet = object.variablesObjet;
    errors = object.errors;

    name = object.name;
    objectId = object.objectId;
    typeId = object.typeId;

    X = object.X;
    Y = object.Y;
    zOrder = object.zOrder;
    hidden = object.hidden;
    layer = object.layer;

    automatisms.clear();
    for (boost::interprocess::flat_map<unsigned int, boost::shared_ptr<Automatism> >::const_iterator it = object.automatisms.begin() ; it != object.automatisms.end(); ++it )
    {
    	automatisms[it->first] = it->second->Clone();
    	automatisms[it->first]->SetOwner(this);
    }
}

/**
 * Change object's name, and so identifier.
 * Remember to notify classes that can hold the object ( e.g. ObjectInstancesHolder )
 * that the object's name has changed.
 */
void Object::SetName(string name_)
{
    name = name_;

    ObjectIdentifiersManager * objectIdentifiersManager = ObjectIdentifiersManager::getInstance();
    objectId = objectIdentifiersManager->GetOIDfromName(name_);
}

////////////////////////////////////////////////////////////
/// Met les forces à zéro
//NE PAS EFFACER CETTE FONCTION APPARAMMENT INUTILE,
//VOIR PLUS LOIN
////////////////////////////////////////////////////////////
bool Object::ClearForce()
{
    Force ForceVide;
    ForceVide.SetX(0);
    ForceVide.SetY(0);
    ForceVide.SetAngle(0);
    ForceVide.SetLength(0);
    ForceVide.SetClearing(0);

    Force5 = ForceVide;

    //NE PAS EFFACER CETTE FONCTION APPARAMMENT INUTILE,
    //TANT QUE CECI N'AURA PAS ETE ENLEVE :
    for ( unsigned int i = 0; i < Forces.size();i++ )
        Forces[i] = ForceVide;

    return true;
}


////////////////////////////////////////////////////////////
/// Met à jour les forces en fonction de leur diffusion
////////////////////////////////////////////////////////////
bool Object::UpdateForce( float ElapsedTime )
{
    Force5.SetLength( Force5.GetLength() - Force5.GetLength() * ( 1 - Force5.GetClearing() ) * ElapsedTime );
    if ( Force5.GetClearing() == 0 ) Force5.SetLength(0);

    for ( unsigned int i = 0; i < Forces.size();i++ )
    {
        Forces[i].SetLength( Forces[i].GetLength() - Forces[i].GetLength() * ( 1 - Forces[i].GetClearing() ) * ElapsedTime );
        if ( Forces[i].GetClearing() == 0 ) {Forces[i].SetLength(0); }
    }

    Forces.erase( std::remove_if( Forces.begin(), Forces.end(), ForceNulle() ), Forces.end() );

    return true;
}
////////////////////////////////////////////////////////////
/// Donne le total des forces en X
////////////////////////////////////////////////////////////
float Object::TotalForceX() const
{
    float ForceXsimple = 0;
    for ( unsigned int i = 0; i < Forces.size();i++ )
        ForceXsimple += Forces[i].GetX();

    return ForceXsimple + Force5.GetX();
}

////////////////////////////////////////////////////////////
/// Donne le total des forces en Y
////////////////////////////////////////////////////////////
float Object::TotalForceY() const
{
    float ForceYsimple = 0;
    for ( unsigned int i = 0; i < Forces.size();i++ )
        ForceYsimple += Forces[i].GetY();

    return ForceYsimple + Force5.GetY();
}

////////////////////////////////////////////////////////////
/// Donne l'angle moyen des force
////////////////////////////////////////////////////////////
float Object::TotalForceAngle() const
{
    Force ForceMoyenne;
    ForceMoyenne.SetX( TotalForceX() );
    ForceMoyenne.SetY( TotalForceY() );

    return ForceMoyenne.GetAngle();
}

////////////////////////////////////////////////////////////
/// Donne l'angle moyen des force
////////////////////////////////////////////////////////////
float Object::TotalForceLength() const
{
    Force ForceMoyenne;
    ForceMoyenne.SetX( TotalForceX() );
    ForceMoyenne.SetY( TotalForceY() );

    return ForceMoyenne.GetLength();
}

void Object::DoAutomatismsPreEvents(RuntimeScene & scene)
{
    for (boost::interprocess::flat_map<unsigned int, boost::shared_ptr<Automatism> >::const_iterator it = automatisms.begin() ; it != automatisms.end(); ++it )
        it->second->StepPreEvents(scene);
}

void Object::DoAutomatismsPostEvents(RuntimeScene & scene)
{
    for (boost::interprocess::flat_map<unsigned int, boost::shared_ptr<Automatism> >::const_iterator it = automatisms.begin() ; it != automatisms.end(); ++it )
        it->second->StepPostEvents(scene);
}

vector < unsigned int > Object::GetAllAutomatismsNameIdentifiers()
{
    vector < unsigned int > allNameIdentifiers;

    for (boost::interprocess::flat_map<unsigned int, boost::shared_ptr<Automatism> >::const_iterator it = automatisms.begin() ; it != automatisms.end(); ++it )
    	allNameIdentifiers.push_back(it->first);

    return allNameIdentifiers;
}

void Object::AddAutomatism(boost::shared_ptr<Automatism> automatism)
{
    automatisms[automatism->GetAutomatismId()] = automatism;
    automatisms[automatism->GetAutomatismId()]->SetOwner(this);
}
#ifdef GDE
void Object::RemoveAutomatism(unsigned int type)
{
    automatisms.erase(type);
}
#endif

#if GDE
void Object::GetPropertyForDebugger(unsigned int propertyNb, string & name, string & value) const
{
    if      ( propertyNb == 0 ) {name = _("Position");      value = ToString(GetX())+";"+ToString(GetY());}
    else if ( propertyNb == 1 ) {name = _("Angle");         value = ToString(GetAngle())+"°";}
    else if ( propertyNb == 2 ) {name = _("Taille");        value = ToString(GetWidth())+";"+ToString(GetHeight());}
    else if ( propertyNb == 3 ) {name = _("Visibilité");    value = hidden ? _("Masqué") : _("Affiché");}
    else if ( propertyNb == 4 ) {name = _("Calque");        value = layer;}
    else if ( propertyNb == 5 ) {name = _("Plan");          value = ToString(zOrder);}
    else if ( propertyNb == 6 ) {name = _("Vitesse");       value = ToString(TotalForceLength());}
    else if ( propertyNb == 7 ) {name = _("Angle de déplacement"); value = ToString(TotalForceAngle());}
    else if ( propertyNb == 8 ) {name = _("Déplacement en X");     value = ToString(TotalForceX());}
    else if ( propertyNb == 9 ) {name = _("Déplacement en Y"); value = ToString(TotalForceY());}
}

bool Object::ChangeProperty(unsigned int propertyNb, string newValue)
{
    if ( propertyNb == 0 )
    {
        size_t separationPos = newValue.find(";");

        if ( separationPos > newValue.length())
            return false;

        string xValue = newValue.substr(0, separationPos);
        string yValue = newValue.substr(separationPos+1, newValue.length());

        SetX(ToInt(xValue));
        SetY(ToInt(yValue));
    }
    else if ( propertyNb == 1 ) {return SetAngle(ToFloat(newValue));}
    else if ( propertyNb == 2 ) {return false;}
    else if ( propertyNb == 3 )
    {
        if ( newValue == _("Masqué") )
        {
            SetHidden();
        }
        else
            SetHidden(false);
    }
    else if ( propertyNb == 4 ) { layer = newValue; }
    else if ( propertyNb == 5 ) {SetZOrder(ToInt(newValue));}
    else if ( propertyNb == 6 ) {return false;}
    else if ( propertyNb == 7 ) {return false;}
    else if ( propertyNb == 8 ) {return false;}
    else if ( propertyNb == 9 ) {return false;}

    return true;
}

unsigned int Object::GetNumberOfProperties() const
{
    //Be careful, properties start at 0.
    return 10;
}
#endif


bool GD_API MustBeDeleted ( boost::shared_ptr<Object> object )
{
    return object->GetName().empty();
}

void DestroyBaseObject(Object * object)
{
    delete object;
}

Object * CreateBaseObject(std::string name)
{
    return new Object(name);
}

Object * CreateBaseObjectByCopy(Object * object)
{
    return new Object(*object);
}
