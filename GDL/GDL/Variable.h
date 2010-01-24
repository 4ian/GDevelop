#ifndef VARIABLE_H
#define VARIABLE_H
#include <string>
#include <iostream>

using namespace std;

class GD_API Variable
{
    public:

        Variable(string pNom);
        virtual ~Variable();

        string GetName() const { return nom; }
        void SetName(string val) { nom = val; }

        double Getvalue() const { return value; }
        void Setvalue(double val);
        void operator=(double val);
        void operator+=(double val);
        void operator-=(double val);
        void operator*=(double val);
        void operator/=(double val);

        string Gettexte() const { return texte; }
        void Settexte(string val);
        void operator=(string val);
        void operator+=(string val);
    protected:
    private:
        string nom;
        double value;
        string texte;
};

#endif // VARIABLE_H
