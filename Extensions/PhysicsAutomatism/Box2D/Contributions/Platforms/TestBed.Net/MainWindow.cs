using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Text;
using System.Windows.Forms;
using Tao.OpenGl;
using Box2D.Net;
using System.Reflection;

namespace TestBed.Net
{
    public partial class MainWindow : Form
    {
        private Settings Settings = new Settings();
        private Test mCurrentTest;
        public Test CurrentTest
        {
            get
            {
                return mCurrentTest;
            }

            set
            {
                //Call code to reset current test
                mCurrentTest = value;
            }
        }

        public MainWindow()
        {
            InitializeComponent();
            
            //Find all Tests in this module
            foreach (Type type in Assembly.GetExecutingAssembly().GetExportedTypes())
            {
                Test test = new Test();
                if (type.IsSubclassOf(test.GetType()))
                {
                    TestsComboBox.Items.Add(System.Activator.CreateInstance(type));
                }
            }
            TestsComboBox.SelectedIndex = 0;
            CurrentTest = (Test)System.Activator.CreateInstance(TestsComboBox.SelectedItem.GetType());

            OpenGLControl.Dock = DockStyle.Fill;
        }

        private void MainWindow_Load(object sender, EventArgs e)
        {
            OpenGLControl.InitializeContexts();
            panel1.Dock = DockStyle.Fill;
            panel2.Dock = DockStyle.Right;
            MainWindow_Resize(null, null);
            RedrawTimer.Interval = (int)(1000.0f / (float)Settings.Hz);
            RedrawTimer.Start();
        }   

        private void MainWindow_Resize(object sender, EventArgs e)
        {
            Size size = new Size(OpenGLControl.Size.Width - panel2.Width, OpenGLControl.Size.Height);
            Renderer.InitOpenGL(size, CurrentTest.Zoom, CurrentTest.ViewOffset);
            Renderer.OpenGLDraw(CurrentTest);
        }

        private void OpenGLControl_Paint(object sender, PaintEventArgs e)
        {
            Renderer.OpenGLDraw(CurrentTest);
        }

        private Vector RelativeCoordinates(Point MousePoint)
        {
            float Height = (float)OpenGLControl.Size.Height;
            float Width = (float)(OpenGLControl.Size.Width - panel2.Width);
            if(Height <= 0)
                Height = 1;

            float AspectRatio = Width / Height;

            Vector relative = new Vector(
                (float)MousePoint.X / Width,
                (float)MousePoint.Y / Height);

            relative -= new Vector(.5f, .5f);
            relative *= 2;
            relative.Y *= -1;
            relative.X *= AspectRatio;
            return relative;
        }

        private void OpenGLControl_MouseMove(object sender, MouseEventArgs e)
        {
            CurrentTest.MouseMove(RelativeCoordinates(e.Location));
        }

        private void OpenGLControl_MouseUp(object sender, MouseEventArgs e)
        {
            CurrentTest.MouseUp(RelativeCoordinates(e.Location));
        }

        private void OpenGLControl_MouseDown(object sender, MouseEventArgs e)
        {
            CurrentTest.MouseDown(RelativeCoordinates(e.Location));
        }

        private void RedrawTimer_Tick(object sender, EventArgs e)
        {
            CurrentTest.Step(Settings);
            Renderer.OpenGLDraw(CurrentTest);
            OpenGLControl.Draw();

            int errorCode = 0;
            if ((errorCode = Gl.glGetError()) > 0)
            {
                RedrawTimer.Stop();

                //Handled by the OpenGLControl
                //MessageBox.Show(Glu.gluErrorString(errorCode));
            }
        }

        private void OpenGLControl_PreviewKeyDown(object sender, PreviewKeyDownEventArgs e)
        {
            if(e.KeyCode == Keys.R)
                CurrentTest = (Test)System.Activator.CreateInstance(CurrentTest.GetType());
            else
                CurrentTest.KeyPress(e.KeyCode);
        }
    }
}
