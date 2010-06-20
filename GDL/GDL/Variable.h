#ifndef VARIABLE_H
#define VARIABLE_H
#include <string>
#include <iostream>
#include <functional>

using namespace std;

class GD_API Variable
{
    public:

        Variable(string pNom);
        virtual ~Variable();

        string GetName() const { return name; }
        void SetName(string val) { name = val; }

        inline double Getvalue() const { return value; }
        void Setvalue(double val);
        void operator=(double val);
        void operator+=(double val);
        void operator-=(double val);
        void operator*=(double val);
        void operator/=(double val);

        inline string Gettexte() const { return texte; }
        void Settexte(string val);
        void operator=(string val);
        void operator+=(string val);
    protected:
    private:
        string name;
        double value;
        string texte;
};

/**
 * Functor testing variable name
 */
struct VariableHasName : public std::binary_function<const Variable &, string, bool> {
    bool operator()(const Variable & variable, string name) const { return variable.GetName() == name; }
};


#endif // VARIABLE_H
