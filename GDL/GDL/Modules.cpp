#ifdef PYSUPPORT


#include <string>
#include <vector>
#include <boost/python.hpp>
#include <SFML/System.hpp>
#include <SFML/Window.hpp>
#include <SFML/Graphics.hpp>
#include <SFML/Audio.hpp>

#include "GDL/sf_classes_1.pypp.hpp"
#include "GDL/sf_classes_2.pypp.hpp"
#include "GDL/sf_classes_3.pypp.hpp"
#include "GDL/sf_classes_4.pypp.hpp"
#include "GDL/sf_classes_5.pypp.hpp"
#include "GDL/sf_classes_6.pypp.hpp"
#include "GDL/sf_classes_7.pypp.hpp"
#include "GDL/sf_enumerations.pypp.hpp"
#include "GDL/sf_free_functions.pypp.hpp"
#include "GDL/sf_global_variables.pypp.hpp"

#include "GDL/Game.h"
#include "GDL/Scene.h"
#include "GDL/RuntimeScene.h"
#include "GDL/Variable.h"

#include "GDL/Modules.h"


using namespace std;
using namespace boost::python;

namespace bp = boost::python;


////////////////////////////////////////////////////////////
/// Binding SFML
///
/// Généré avec Py++
////////////////////////////////////////////////////////////
BOOST_PYTHON_MODULE(sf){
    //register_enumerations();

/*    bp::implicitly_convertible< sf::Unicode::Text, std::basic_string< short unsigned int, std::char_traits< short unsigned int >, std::allocator< short unsigned int > > >();
    bp::implicitly_convertible< sf::Unicode::Text, std::basic_string< unsigned char, std::char_traits< unsigned char >, std::allocator< unsigned char > > >();
    bp::implicitly_convertible< sf::Unicode::Text, std::string >();
    bp::implicitly_convertible< sf::Unicode::Text, std::wstring >();*/

    /*register_classes_1();
    register_classes_2();
    register_classes_3();
    register_classes_4();
    register_classes_5();
    register_classes_6();
    register_classes_7();
    register_global_variables();
    register_free_functions();*/
}

////////////////////////////////////////////////////////////
/// Binding Game Develop
////////////////////////////////////////////////////////////
BOOST_PYTHON_MODULE(gd)
{
    class_<Game>("Game").def_readwrite("name", &Game::name)
                        .def_readwrite("author", &Game::author)
                        .def_readwrite("windowWidth", &Game::windowWidth)
                        .def_readwrite("windowHeight", &Game::windowHeight)
                        .def_readwrite("maxFPS", &Game::maxFPS)
                        .def_readwrite("minFPS", &Game::minFPS)
                        .def_readwrite("verticalSync", &Game::verticalSync);

    class_<Scene>("Scene")
                        .def_readwrite("backgroundColorR", &Scene::backgroundColorR)
                        .def_readwrite("backgroundColorG", &Scene::backgroundColorG)
                        .def_readwrite("backgroundColorB", &Scene::backgroundColorB)
                        .def_readwrite("standardSortMethod", &Scene::standardSortMethod);

    //class_<RuntimeScene, bases<Scene> >("RuntimeScene");

    class_<Variable>("Variable", init<std::string>())
                        .add_property("name", &Variable::GetName, &Variable::SetName)
                        .add_property("value", &Variable::Getvalue, &Variable::Setvalue)
                        .add_property("text", &Variable::GetString, &Variable::SetString)
                        /*.def("assign", &Variable::operator=)*/
                        .def(self += double())
                        .def(self -= double())
                        .def(self /= double())
                        .def(self *= double())
                        /*.def(self = string())*/
                        .def(self += string());

}

namespace gdp
{

void GD_API InitializePythonModule()
{
    PyImport_AppendInittab( "gd", &initgd );
    PyImport_AppendInittab( "sf", &initsf );
    Py_Initialize();
}

} // namespace gdp

#endif //PYSUPPORT
