#ifndef VERSIONWRAPPER_H
#define VERSIONWRAPPER_H
#include <string>
#include <vector>

using namespace std;

class GDEditorVersionWrapper
{
    public:
        static int Major();
        static int Minor();
        static int Build();
        static int Revision();
        static string FullString();
        static string Status();
        static string Year();
        static string Month();
        static string Date();
    protected:
    private:
};

#endif // VERSIONWRAPPER_H
