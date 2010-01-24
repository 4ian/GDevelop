#if defined(GDE)
/**
 * Game Develop
 *    Editor
 *
 *  Par Florian "4ian" Rival
 *
 */
/**
 *
 *
 *  Classe utilisé pour transmettre la nécessité de recharger les images ( toutes scènes )
 *  ou une scène particulière.
 */

#ifndef NEEDRELOAD_H
#define NEEDRELOAD_H
#include <string>
#include <vector>

using namespace std;

class GD_API needReload
{
    public:
        needReload();
        virtual ~needReload();

        void SetImagesMustBeReloaded();
        void SetImagesAreUpToDate();
        bool GetImagesMustBeReloaded();

        void SetASceneMustBeReloaded(int nb);
        void SetASceneIsUpToDate(int nb);

        void SetAllScenesMustBeReloaded();

        bool MustTheSceneBeReloaded(int nb);

    protected:
    private:

        bool imagesMustBeReload;
        vector < int > sceneIsUpToDate;
};

#endif // NEEDRELOAD_H
#endif
