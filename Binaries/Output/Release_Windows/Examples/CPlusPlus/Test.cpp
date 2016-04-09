#include "GDCpp/Runtime/RuntimeScene.h"
#include "TextObject/TextObject.h" //but do not forget extensions includes
#include <iostream>

//Simple function changing scene background color.
//The function is declared in Test.h and called by Scene 2
void MyFunction(RuntimeScene & scene)
{
    scene.SetBackgroundColor(240, 100,100);
}

//Another function manipulating objects this time.
void MyFunction2(std::vector<RuntimeObject*> & objectsList)
{
    //Changing the positions of objects
    for(unsigned int i = 0;i<objectsList.size();++i)
    {
        objectsList[i]->SetX(50);
    }
    
    //Manipulating the text objects more specifically thanks to GetSpecificObjects
    std::vector<RuntimeTextObject*> textObjects = GetSpecificObjects<RuntimeTextObject>(objectsList);
    for(unsigned int i = 0;i<textObjects.size();++i)
    {
        textObjects[i]->SetString("Hi, my X coordinate was changed to be 50.");
    }
}