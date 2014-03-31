class RuntimeScene;
class RuntimeObject;

//Simple function changing scene background color.
//The function is implemented in Test.cpp and called by Scene 2 using a C++ code event.
void MyFunction(RuntimeScene & scene);

//Another function implemented in Test.cpp and called by Scene 2.
void MyFunction2(std::vector<RuntimeObject*> & objectsList);
