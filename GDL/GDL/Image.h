#ifndef IMAGE_H
#define IMAGE_H

#include <string>
#include <vector>

using namespace std;

class GD_API Image
{
    public:
        /** Default constructor */
        Image();
        /** Default destructor */
        ~Image();

        string fichier; //!< Member variable "fichier"
        string nom; //!< Member variable "nom"
        bool lissage; //!< Member variable "lissage"

    protected:
    private:
};

#endif // IMAGE_H
