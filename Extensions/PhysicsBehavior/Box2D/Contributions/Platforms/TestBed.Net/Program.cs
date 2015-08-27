using System;
using System.Collections.Generic;
using System.Text;
using Box2D.Net;
using System.Windows.Forms;

namespace TestBed.Net
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.Title = "Box2D.Net Test Bed";
            Application.EnableVisualStyles();
            MainWindow win = new MainWindow();

            Console.Write("Loading the OpenGL display window.  Please be patient... ");

            //Show above the console
            win.Show();
            win.BringToFront(); //Doesn't bring above the console?
            win.TopMost = true; //Hacky fix instead:
            win.TopMost = false;

            Console.WriteLine("DONE");
            
            Application.Run(win);            
        }
    }
}
