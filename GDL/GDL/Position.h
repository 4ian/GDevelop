#ifndef POSITION_H
#define POSITION_H

#include <string>
#include <map>

using namespace std;

class GD_API InitialPosition
{
    public:
        InitialPosition();
        virtual ~InitialPosition();

        string objectName;
        float x;
        float y;
        int zOrder;
        string layer;
        int animation;
        int direction;
        map < string, float > floatInfos;
        map < string, string > stringInfos;

    protected:
    private:
};

#endif // POSITION_H
