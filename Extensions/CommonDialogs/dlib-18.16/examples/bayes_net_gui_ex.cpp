// The contents of this file are in the public domain. See LICENSE_FOR_EXAMPLE_PROGRAMS.txt
/*
    This is a rather involved example illustrating the use of the GUI api from 
    the dlib C++ Library.   This program is a fully functional utility for
    creating Bayesian Networks.  It allows the user to graphically draw the network,
    save/load the network to/from disk, and also to calculate the posterior 
    probability of any node in the network given a set of evidence.

    This is not the first dlib example program you should be looking at.  If you
    want to see a simpler GUI example please look at the gui_api_ex.cpp or
    image_ex.cpp example.  

    If you want to understand how to use the Bayesian Network utilities in the library
    you should definitely look at the bayes_net_ex.cpp example program.  It gives a
    comprehensive introduction to creating and manipulating Bayesian Networks.  If you
    want to see how to load a saved network from disk and use it in a non-GUI application
    then look at the bayes_net_from_disk_ex.cpp example.


    Now all of that being said, if you have already looked at the other relevant 
    examples and want to see a more in-depth example then by all means, continue reading. :)
*/

#include <dlib/gui_widgets.h>
#include <sstream>
#include <string>
#include <dlib/directed_graph.h>
#include <dlib/string.h>
#include <dlib/bayes_utils.h>
#include <dlib/smart_pointers.h>
#include <dlib/set.h>
#include <dlib/graph_utils.h>
#include <dlib/stl_checked.h>


using namespace std;
using namespace dlib;
using namespace dlib::bayes_node_utils;

//  ----------------------------------------------------------------------------

typedef directed_graph<bayes_node>::kernel_1a_c directed_graph_type;
typedef directed_graph<bayes_node>::kernel_1a_c::node_type node_type;
typedef graph<dlib::set<unsigned long>::compare_1b_c, dlib::set<unsigned long>::compare_1b_c>::kernel_1a_c join_tree_type;

//  ----------------------------------------------------------------------------

class main_window : public drawable_window 
{
    /*!
        INITIAL VALUE
            This window starts out hidden and with an empty Bayesian Network

        WHAT THIS OBJECT REPRESENTS
            This object is the main window of a utility for drawing Bayesian Networks.
            It allows you to draw a directed graph and to set the conditional probability 
            tables up for each node in the network.  It also allows you to compute the 
            posterior probability of each node.  And finally, it lets you save and load
            networks from file
    !*/
public:
    main_window();
    ~main_window();

private:

    // Private helper methods

    void initialize_node_cpt_if_necessary ( unsigned long index );
    void load_selected_node_tables_into_cpt_grid ();
    void load_selected_node_tables_into_ppt_grid ();
    void no_node_selected ();


    // Event handlers 

    void on_cpt_grid_modified(unsigned long row, unsigned long col);
    void on_evidence_toggled ();
    void on_graph_modified ();
    void on_menu_file_open ();
    void on_menu_file_quit ();
    void on_menu_file_save ();
    void on_menu_file_save_as ();
    void on_menu_help_about ();
    void on_menu_help_help ();
    void on_node_deleted ();
    void on_node_deselected ( unsigned long n );
    void on_node_selected (unsigned long n);
    void on_open_file_selected ( const std::string& file_name);
    void on_save_file_selected ( const std::string& file_name);
    void on_sel_node_evidence_modified ();
    void on_sel_node_num_values_modified ();
    void on_sel_node_text_modified ();
    void on_window_resized ();
    void recalculate_probabilities ();

    // Member data

    const rgb_pixel color_non_evidence;
    const rgb_pixel color_default_bg;
    const rgb_pixel color_evidence;
    const rgb_pixel color_error;
    const rgb_pixel color_gray;
    bool graph_modified_since_last_recalc;

    button btn_calculate;
    check_box sel_node_is_evidence;
    directed_graph_drawer<directed_graph_type> graph_drawer;
    label sel_node_index;
    label sel_node_num_values_label; 
    label sel_node_text_label;
    label sel_node_evidence_label;
    menu_bar mbar;
    named_rectangle selected_node_rect;
    tabbed_display tables;
    text_field sel_node_num_values;
    text_field sel_node_text;
    text_field sel_node_evidence;
    text_grid cpt_grid;
    text_grid ppt_grid;
    unsigned long selected_node_index;
    bool node_is_selected;
    widget_group cpt_group;
    widget_group ppt_group;

    scoped_ptr<bayesian_network_join_tree> solution;
    join_tree_type join_tree;
    // The std_vector_c is an object identical to the std::vector except that it checks
    // all its preconditions and throws a dlib::fatal_error if they are violated.
    std_vector_c<assignment> cpt_grid_assignments;
    std::string graph_file_name;
};

// ----------------------------------------------------------------------------------------

int main()
{
    // create our window
    main_window my_window;

    // tell our window to put itself on the screen
    my_window.show();

    // wait until the user closes this window before we let the program 
    // terminate.
    my_window.wait_until_closed();
}

// ----------------------------------------------------------------------------------------

#ifdef WIN32
//  If you use main() as your entry point when building a program on MS Windows then
//  there will be a black console window associated with your application.  If you
//  want your application to not have this console window then you need to build
//  using the WinMain() entry point as shown below and also set your compiler to 
//  produce a "Windows" project instead of a "Console" project.  In visual studio
//  this can be accomplished by going to project->properties->general configuration->
//  Linker->System->SubSystem and selecting Windows instead of Console.  
// 
int WINAPI WinMain (HINSTANCE, HINSTANCE, PSTR cmds, int)
{
    main();
    return 0;
}
#endif

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//               Methods from the main_window object
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

main_window::
main_window(
) : 
    color_non_evidence(0,0,0),
    color_default_bg(255,255,255),
    color_evidence(100,200,100),
    color_error(255,0,0),
    color_gray(210,210,210),
    graph_modified_since_last_recalc(true),
    btn_calculate(*this),
    sel_node_is_evidence(*this),
    graph_drawer(*this),
    sel_node_index(*this),
    sel_node_num_values_label (*this),
    sel_node_text_label(*this),
    sel_node_evidence_label(*this),
    mbar(*this),
    selected_node_rect(*this),
    tables(*this),
    sel_node_num_values(*this),
    sel_node_text(*this),
    sel_node_evidence(*this),
    cpt_grid(*this),
    ppt_grid(*this),
    selected_node_index(0),
    node_is_selected(false),
    cpt_group(*this),
    ppt_group(*this)
{
    // Note that all the GUI widgets take a reference to the window that contains them
    // as their constructor argument.  This is a universal feature of GUI widgets in the
    // dlib library.

    set_title("Bayesian Network Utility");

    // position the widget that is responsible for drawing the directed graph, the graph_drawer, 
    // just below the mbar (menu bar) widget.
    graph_drawer.set_pos(5,mbar.bottom()+5);
    set_size(750,400);

    // register the event handlers with their respective widgets
    btn_calculate.set_click_handler              (*this, &main_window::recalculate_probabilities);
    cpt_grid.set_text_modified_handler           (*this, &main_window::on_cpt_grid_modified);
    graph_drawer.set_graph_modified_handler      (*this, &main_window::on_graph_modified);
    graph_drawer.set_node_deleted_handler        (*this, &main_window::on_node_deleted);
    graph_drawer.set_node_deselected_handler     (*this, &main_window::on_node_deselected);
    graph_drawer.set_node_selected_handler       (*this, &main_window::on_node_selected);
    sel_node_evidence.set_text_modified_handler  (*this, &main_window::on_sel_node_evidence_modified);
    sel_node_is_evidence.set_click_handler       (*this, &main_window::on_evidence_toggled);
    sel_node_num_values.set_text_modified_handler(*this, &main_window::on_sel_node_num_values_modified);
    sel_node_text.set_text_modified_handler      (*this, &main_window::on_sel_node_text_modified);

    // now set the text of some of our buttons and labels
    btn_calculate.set_name("Recalculate posterior probability table");
    selected_node_rect.set_name("Selected node");
    sel_node_evidence_label.set_text("evidence value:");
    sel_node_is_evidence.set_name("is evidence");
    sel_node_num_values_label.set_text("Number of values: ");
    sel_node_text_label.set_text("Node label:");

    // Now setup the tabbed display.  It will have two tabs, one for the conditional
    // probability table and one for the posterior probability table.
    tables.set_number_of_tabs(2);
    tables.set_tab_name(0,"Conditional probability table");
    tables.set_tab_name(1,"Posterior probability table");
    cpt_group.add(cpt_grid,0,0);
    ppt_group.add(ppt_grid,0,0);
    tables.set_tab_group(0,cpt_group);
    tables.set_tab_group(1,ppt_group);

    // Now setup the menu bar.  We will have two menus.  A File and Help menu.
    mbar.set_number_of_menus(2);
    mbar.set_menu_name(0,"File",'F');
    mbar.set_menu_name(1,"Help",'H');

    // add the entries to the File menu.
    mbar.menu(0).add_menu_item(menu_item_text("Open",   *this, &main_window::on_menu_file_open,    'O'));
    mbar.menu(0).add_menu_item(menu_item_separator());
    mbar.menu(0).add_menu_item(menu_item_text("Save",   *this, &main_window::on_menu_file_save,    'S'));
    mbar.menu(0).add_menu_item(menu_item_text("Save As",*this, &main_window::on_menu_file_save_as, 'a'));
    mbar.menu(0).add_menu_item(menu_item_separator());
    mbar.menu(0).add_menu_item(menu_item_text("Quit",   *this, &main_window::on_menu_file_quit,    'Q'));

    // Add the entries to the Help menu.
    mbar.menu(1).add_menu_item(menu_item_text("Help",   *this, &main_window::on_menu_help_help,    'e'));
    mbar.menu(1).add_menu_item(menu_item_text("About",  *this, &main_window::on_menu_help_about,   'A'));


    // call our helper functions and window resize event to get the widgets
    // to all arrange themselves correctly in our window.
    no_node_selected();
    on_window_resized();
} 

// ----------------------------------------------------------------------------------------

main_window::
~main_window(
)
{
    // You should always call close_window() in the destructor of window
    // objects to ensure that no events will be sent to this window while 
    // it is being destructed.  
    close_window();
}

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//               Private methods from the main_window object
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

void main_window::
load_selected_node_tables_into_ppt_grid (
)
{
    // This function just takes the currently selected graph node and loads
    // its posterior probabilities into the ppt_graph widget.
    node_type& node = graph_drawer.graph_node(selected_node_index);
    ppt_grid.set_grid_size(2,node.data.table().num_values());

    // load the top row of the table into the grid.  This row is the "title bar" row
    // that tells you what each column contains.
    for (unsigned long col = 0; col < node.data.table().num_values(); ++col)
    {
        ppt_grid.set_text(0,col,"P(node=" + cast_to_string(col) + ")");
        ppt_grid.set_background_color(0,col,rgb_pixel(150,150,250));
        ppt_grid.set_editable(0,col,false);
    }

    // If we have a solution to the network on hand then load the probabilities
    // from that into the table
    if (solution)
    {
        // get the probability distribution for the currently selected node out
        // of the solution.
        const matrix<double,1> prob = solution->probability(selected_node_index);

        // now load the probabilities into the ppt_grid so the user can see them.
        for (unsigned long col = 0; col < node.data.table().num_values(); ++col)
        {
            ppt_grid.set_text(1,col,cast_to_string(prob(col)));
        }
    }

    // make the second row of the table non-editable have a color that indicates
    // that to the user
    for (unsigned long col = 0; col < node.data.table().num_values(); ++col)
    {
        ppt_grid.set_background_color(1,col,color_gray);
        ppt_grid.set_editable(1,col,false);
    }
}

// ----------------------------------------------------------------------------------------

void main_window::
load_selected_node_tables_into_cpt_grid (
)
{
    // This function just takes the conditional probability table in the 
    // currently selected graph node and puts it into the cpt_grid widget.
    
    node_type& node = graph_drawer.graph_node(selected_node_index);

    initialize_node_cpt_if_necessary(selected_node_index);
    cpt_grid_assignments.clear();

    // figure out how many rows there should be in the cpt
    unsigned long cpt_rows = 1;
    for (unsigned long i = 0; i < node.number_of_parents(); ++i)
    {
        cpt_rows *= node.parent(i).data.table().num_values();
    }

    unsigned long cpt_cols = node.data.table().num_values();

    cpt_grid.set_grid_size(cpt_rows+1, cpt_cols+ node.number_of_parents());
    const unsigned long num_cols = cpt_grid.number_of_columns();

    // fill in the top row of the grid that shows which parent node the left hand columns go with
    assignment a(node_first_parent_assignment(graph_drawer.graph(),selected_node_index));
    unsigned long col = 0;
    a.reset();
    while (a.move_next())
    {
        cpt_grid.set_text(0,col,cast_to_string(a.element().key()) + ": " + graph_drawer.node_label(a.element().key()) );
        cpt_grid.set_background_color(0,col,rgb_pixel(120,210,210));
        cpt_grid.set_editable(0,col,false);
        ++col;
    }

    // fill in the top row of the grid that shows which probability the right hand columns go with
    for (col = node.number_of_parents(); col < num_cols; ++col)
    {
        cpt_grid.set_text(0,col,"P(node=" + cast_to_string(col-node.number_of_parents()) + ")");
        cpt_grid.set_background_color(0,col,rgb_pixel(150,150,250));
        cpt_grid.set_editable(0,col,false);
    }

    // now loop over all the possible parent assignments for this node
    const unsigned long num_values = node.data.table().num_values();
    unsigned long row = 1;
    do
    {
        col = 0;

        // fill in the left side of the grid row that shows what the parent assignment is
        a.reset();
        while (a.move_next())
        {
            cpt_grid.set_text(row,col,cast_to_string(a.element().value()));
            cpt_grid.set_background_color(row,col,rgb_pixel(180,255,255));
            cpt_grid.set_editable(row,col,false);

            ++col;
        }

        // fill in the right side of the grid row that shows what the conditional probabilities are
        for (unsigned long value = 0; value < num_values; ++value)
        {
            const double prob = node.data.table().probability(value,a);
            cpt_grid.set_text(row,col,cast_to_string(prob));
            ++col;
        }

        // save this assignment so we can use it later to modify the node's
        // conditional probability table if the user modifies the cpt_grid
        cpt_grid_assignments.push_back(a);
        ++row;
    } while (node_next_parent_assignment(graph_drawer.graph(),selected_node_index,a));

}

// ----------------------------------------------------------------------------------------

void main_window::
initialize_node_cpt_if_necessary (
    unsigned long index 
)
{
    node_type& node = graph_drawer.graph_node(index);

    // if the cpt for this node isn't properly filled out then let's clear it out
    // and populate it with some reasonable default values
    if (node_cpt_filled_out(graph_drawer.graph(), index) == false)
    {
        node.data.table().empty_table();

        const unsigned long num_values = node.data.table().num_values();

        // loop over all the possible parent assignments for this node and fill them out 
        // with reasonable default values
        assignment a(node_first_parent_assignment(graph_drawer.graph(), index));
        do
        {
            // set the first value to have probability 1
            node.data.table().set_probability(0, a, 1.0);

            // set all the other values to have probability 0
            for (unsigned long value = 1; value < num_values; ++value)
                node.data.table().set_probability(value, a, 0);

        } while (node_next_parent_assignment(graph_drawer.graph(), index,a));
    }
}

// ----------------------------------------------------------------------------------------

void main_window::
no_node_selected (
)
{
    // Make it so that no node is selected on the gui.  Do this by disabling things
    // and clearing out text fields and so forth.


    node_is_selected = false;
    tables.disable();
    sel_node_evidence.disable();
    sel_node_is_evidence.disable();
    sel_node_index.disable();
    sel_node_evidence_label.disable();
    sel_node_text_label.disable();
    sel_node_text.disable();
    sel_node_index.set_text("index:");
    sel_node_num_values_label.disable();
    sel_node_num_values.disable();
    cpt_grid.set_grid_size(0,0);
    ppt_grid.set_grid_size(0,0);

    sel_node_is_evidence.set_unchecked();
    sel_node_text.set_text("");
    sel_node_num_values.set_text("");
    sel_node_evidence.set_text("");
    sel_node_num_values.set_background_color(color_default_bg);
    sel_node_evidence.set_background_color(color_default_bg);
}

// ----------------------------------------------------------------------------------------

void main_window::
recalculate_probabilities (
)
{
    // clear out the current solution 
    solution.reset();
    if (graph_is_connected(graph_drawer.graph()) == false)
    {
        message_box("Error","Your graph has nodes that are completely disconnected from the other nodes.\n" 
                    "You must connect them somehow");
    }
    else if (graph_drawer.graph().number_of_nodes() > 0)
    {
        if (graph_modified_since_last_recalc)
        {
            // make sure all the cpts are filled out
            const unsigned long num_nodes = graph_drawer.graph().number_of_nodes();
            for (unsigned long i = 0; i < num_nodes; ++i)
            {
                initialize_node_cpt_if_necessary(i);
            }

            // remake the join tree for this graph
            create_moral_graph(graph_drawer.graph(), join_tree);
            create_join_tree(join_tree, join_tree);
            graph_modified_since_last_recalc = false;
        }

        // create a solution to this bayesian network using the join tree algorithm
        solution.reset(new bayesian_network_join_tree(graph_drawer.graph(), join_tree));

        if (node_is_selected)
        {
            load_selected_node_tables_into_ppt_grid();
        }
    }
}

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
//               Event handling methods from the main_window object
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

// This event is called when the user selects a file with a saved 
// bayesian network in it.
void main_window::
on_open_file_selected (
    const std::string& file_name
)
{
    try
    {
        no_node_selected();
        ifstream fin(file_name.c_str(), ios::binary);
        graph_drawer.load_graph(fin);
        graph_file_name = file_name;
        set_title("Bayesian Network Utility - " + right_substr(file_name,"\\/"));
    }
    catch (...)
    {
        message_box("Error", "Unable to load graph file " + file_name);
    }
}

// ----------------------------------------------------------------------------------------

// This event is called when the user selects from the menu bar File->Open
void main_window::
on_menu_file_open (
)
{
    // display a file chooser window and when the user choses a file
    // call the on_open_file_selected() function
    open_existing_file_box(*this, &main_window::on_open_file_selected);
}

// ----------------------------------------------------------------------------------------

// This event is called when the user selects from the menu bar File->Save
void main_window::
on_menu_file_save (
)
{
    // if we don't currently have any file name associated with our graph
    if (graph_file_name.size() == 0)
    {
        // display a file chooser window and when the user choses a file
        // call the on_save_file_selected() function
        save_file_box(*this, &main_window::on_save_file_selected);
    }
    else
    {
        // we know what file to open so just do that and save the graph to it
        ofstream fout(graph_file_name.c_str(), ios::binary);
        graph_drawer.save_graph(fout);
    }
}

// ----------------------------------------------------------------------------------------

// This event is called when the user choses which file to save the graph to
void main_window::
on_save_file_selected (
    const std::string& file_name
)
{
    ofstream fout(file_name.c_str(), ios::binary);
    graph_drawer.save_graph(fout);
    graph_file_name = file_name;
    set_title("Bayesian Network Utility - " + right_substr(file_name,"\\/"));
}

// ----------------------------------------------------------------------------------------

// This event is called when the user selects from the menu bar File->Save As
void main_window::
on_menu_file_save_as (
)
{
    // display a file chooser window and when the user choses a file
    // call the on_save_file_selected() function
    save_file_box(*this, &main_window::on_save_file_selected);
}

// ----------------------------------------------------------------------------------------

// This event is called when the user selects from the menu bar File->Quit
void main_window::
on_menu_file_quit (
)
{
    close_window();
}

// ----------------------------------------------------------------------------------------

// This event is called when the user selects from the menu bar Help->Help
void main_window::
on_menu_help_help (
)
{
    message_box("Help", 
                "To create new nodes right click on the drawing area.\n"
                "To create edges select the parent node and then shift+left click on the child node.\n"
                "To remove nodes or edges select them by left clicking and then press the delete key.");
}

// ----------------------------------------------------------------------------------------

// This event is called when the user selects from the menu bar Help->About
void main_window::
on_menu_help_about (
)
{
    message_box("About","This application is the GUI front end to the dlib C++ Library's\n"
                "Bayesian Network inference utilities\n\n"
                "Version 1.2\n\n"
                "See http://dlib.net for updates");
}

// ----------------------------------------------------------------------------------------

// This event is called when the user modifies the graph_drawer widget.  That is,
// when the user adds or removes an edge or node in the graph.
void main_window::
on_graph_modified (
)
{
    // make note of the modification
    graph_modified_since_last_recalc = true;
    // clear out the solution object since we will need to recalculate it
    // since the graph changed
    solution.reset();
}

// ----------------------------------------------------------------------------------------

// This event is called when the user modifies the evidence value for a node
void main_window::
on_sel_node_evidence_modified (
)
{
    // make a reference to the node in the graph that is currently selected
    node_type& node = graph_drawer.graph_node(selected_node_index);
    unsigned long value;
    try
    {
        // get the numerical value of the new evidence value.  Here we are taking
        // the string from the text field and casting it to an unsigned long.
        value = sa = trim(sel_node_evidence.text());
    }
    catch (string_cast_error&)
    {
        // if the user put something that isn't an integer into the 
        // text field then make it have a different background color
        // so that they can easily see this.
        sel_node_evidence.set_background_color(color_error);
        return;
    }

    // validate the input from the user and store it in the selected node
    // if it is ok
    if (value >= node.data.table().num_values())
    {
        sel_node_evidence.set_background_color(color_error);
    }
    else
    {
        node.data.set_value(value);
        sel_node_evidence.set_background_color(color_default_bg);
    }

    // clear out the solution to the graph since we now need
    // to recalculate it.
    solution.reset();
}

// ----------------------------------------------------------------------------------------

// This event is called when the user modifies the number of evidence values for
// a node.
void main_window::
on_sel_node_num_values_modified (
)
{
    // make a reference to the node in the graph that is currently selected
    node_type& node = graph_drawer.graph_node(selected_node_index);

    unsigned long num_values;
    try
    {
        // get the number of values out of the text field.  
        num_values = sa = trim(sel_node_num_values.text());
    }
    catch (string_cast_error&)
    {
        sel_node_num_values.set_background_color(color_error);
        return;
    }

    // validate the input from the user to make sure it is something reasonable
    if (num_values < 2 || num_values > 100)
    {
        sel_node_num_values.set_background_color(color_error);
    }
    else
    {
        // update the graph
        node.data.table().set_num_values(num_values);
        graph_modified_since_last_recalc = true;
        sel_node_num_values.set_background_color(color_default_bg);

        on_sel_node_evidence_modified();
        // also make sure the evidence value of this node makes sense still
        if (node.data.is_evidence() && node.data.value() >= num_values)
        {
            // just set it to zero
            node.data.set_value(0);
        }

    }

    solution.reset();

    // call these functions so that the conditional and posterior probability
    // tables get updated
    load_selected_node_tables_into_cpt_grid();
    load_selected_node_tables_into_ppt_grid();
}

// ----------------------------------------------------------------------------------------

// This event is called when the user modifies the cpt_grid (i.e. the conditional
// probability table widget)
void main_window::
on_cpt_grid_modified(unsigned long row, unsigned long col)
{
    node_type& node = graph_drawer.graph_node(selected_node_index);
    solution.reset();

    double prob;
    try
    {
        // get the new value out of the table
        prob = sa = cpt_grid.text(row,col);
    }
    catch (string_cast_error&)
    {
        cpt_grid.set_background_color(row,col,color_error);
        return;
    }

    // validate the value
    if (prob < 0 || prob > 1)
    {
        cpt_grid.set_background_color(row,col,color_error);
        return;
    }

    // the value of this node that is having its conditional probability
    // updated
    const unsigned long cur_val = col-node.number_of_parents();

    node.data.table().set_probability(cur_val, cpt_grid_assignments[row-1], prob);

    // sum the probabilities in the cpt and modify the last one such that they all 
    // sum to 1.  We are excluding either the first or last element from the sum
    // because we are going to set it equal to 1-sum below.
    double sum = 0;
    if (cur_val != node.data.table().num_values()-1)
    {
        for (unsigned long i = 0; i < node.data.table().num_values()-1; ++i)
            sum += node.data.table().probability(i, cpt_grid_assignments[row-1]);
    }
    else
    {
        for (unsigned long i = 1; i < node.data.table().num_values(); ++i)
            sum += node.data.table().probability(i, cpt_grid_assignments[row-1]);
    }

    // make sure all the probabilities sum to 1
    if (sum > 1.0)
    {
        cpt_grid.set_background_color(row,cpt_grid.number_of_columns()-1,color_error);
    }
    else
    {
        // edit one of the other elements in the table to ensure that the probabilities still sum to 1
        if (cur_val == node.data.table().num_values()-1)
        {
            node.data.table().set_probability(0, cpt_grid_assignments[row-1], 1-sum);
            cpt_grid.set_text(row,node.number_of_parents(),cast_to_string(1-sum));
        }
        else
        {
            node.data.table().set_probability(node.data.table().num_values()-1, cpt_grid_assignments[row-1], 1-sum);
            cpt_grid.set_text(row,cpt_grid.number_of_columns()-1,cast_to_string(1-sum));
        }

        cpt_grid.set_background_color(row,cpt_grid.number_of_columns()-1,color_default_bg);
        cpt_grid.set_background_color(row,col,color_default_bg);
    }

}

// ----------------------------------------------------------------------------------------

// This event is called when the user resizes the main_window.  Note that unlike the other
// events, this event is part of the drawable_window base class that main_window inherits from.
// So you won't see any statements in the constructor that say "register the main_window::on_window_resized function"
void main_window::
on_window_resized ()
{
    // when you override any of the drawable_window events you have to make sure you 
    // call the drawable_window's version of them because it needs to process
    // the events as well.  So we do that here.
    drawable_window::on_window_resized();

    // The rest of this function positions the widgets on the window 
    unsigned long width,height;
    get_size(width,height);

    // Don't do anything if the user just made the window too small.  That is, leave
    // the widgets where they are.
    if (width < 500 || height < 350)
        return;

    // Set the size of the probability tables and the drawing area for the graph
    graph_drawer.set_size(width-370,height-10-mbar.height());
    cpt_grid.set_size((width-graph_drawer.width())-35,height-237);
    ppt_grid.set_size((width-graph_drawer.width())-35,height-237);
    // tell the tabbed display to make itself just the right size to contain
    // the two probability tables.
    tables.fit_to_contents();


    // Now position all the widgets in the window.  Note that much of the positioning
    // is relative to other widgets.  This part of the code I just figured out by
    // trying stuff and rerunning the program to see if it looked nice. 
    sel_node_index.set_pos(graph_drawer.right()+14,graph_drawer.top()+18);
    sel_node_text_label.set_pos(sel_node_index.left(),sel_node_index.bottom()+5);
    sel_node_text.set_pos(sel_node_text_label.right()+5,sel_node_index.bottom());
    sel_node_num_values_label.set_pos(sel_node_index.left(), sel_node_text.bottom()+5);
    sel_node_num_values.set_pos(sel_node_num_values_label.right(), sel_node_text.bottom()+5);
    sel_node_is_evidence.set_pos(sel_node_index.left(),sel_node_num_values.bottom()+5);
    sel_node_evidence_label.set_pos(sel_node_index.left(),sel_node_is_evidence.bottom()+5);
    sel_node_evidence.set_pos(sel_node_evidence_label.right()+5,sel_node_is_evidence.bottom());
    tables.set_pos(sel_node_index.left(),sel_node_evidence.bottom()+5);
    sel_node_evidence.set_width(tables.right()-sel_node_evidence.left()+1);
    sel_node_text.set_width(tables.right()-sel_node_text.left()+1);
    sel_node_num_values.set_width(tables.right()-sel_node_num_values.left()+1);



    // Tell the named rectangle to position itself such that it fits around the 
    // tabbed display that contains the probability tables and the label at the top of the
    // screen.
    selected_node_rect.wrap_around(sel_node_index.get_rect()+
                                   tables.get_rect());

    // finally set the button to be at the bottom of the named rectangle 
    btn_calculate.set_pos(selected_node_rect.left(), selected_node_rect.bottom()+5);
}

// ----------------------------------------------------------------------------------------

// This event is called by the graph_drawer widget when the user selects a node
void main_window::
on_node_selected (unsigned long n)
{
    // make a reference to the selected node
    node_type& node = graph_drawer.graph_node(n);


    // enable all the widgets related to the selected node
    selected_node_index = n;
    node_is_selected = true;
    tables.enable();
    sel_node_is_evidence.enable();
    sel_node_index.enable();
    sel_node_evidence_label.enable();
    sel_node_text_label.enable();
    sel_node_text.enable();
    sel_node_num_values_label.enable();
    sel_node_num_values.enable();

    // make sure the num_values field of the node's cpt is set to something valid. 
    // So default it to 2 if it isn't set already.
    if (node.data.table().num_values() < 2)
    {
        node.data.table().set_num_values(2);
        graph_modified_since_last_recalc = true;
    }

    // setup the evidence check box and input field
    sel_node_index.set_text("index: " + cast_to_string(n));
    if (graph_drawer.graph_node(n).data.is_evidence())
    {
        sel_node_is_evidence.set_checked();
        sel_node_evidence.enable();
        sel_node_evidence.set_text(cast_to_string(graph_drawer.graph_node(n).data.value()));
    }
    else
    {
        sel_node_is_evidence.set_unchecked();
        sel_node_evidence.disable();
        sel_node_evidence.set_text("");
    }

    sel_node_num_values.set_text(cast_to_string(node_num_values(graph_drawer.graph(),n)));

    sel_node_text.set_text(graph_drawer.node_label(n));

    load_selected_node_tables_into_cpt_grid();
    load_selected_node_tables_into_ppt_grid();
}

// ----------------------------------------------------------------------------------------

// This event is called when the user toggles the "is evidence" check box
void main_window::
on_evidence_toggled (
)
{
    if (sel_node_is_evidence.is_checked())
    {
        graph_drawer.graph_node(selected_node_index).data.set_as_evidence();
        sel_node_evidence.enable();
        sel_node_evidence.set_text(cast_to_string(graph_drawer.graph_node(selected_node_index).data.value()));

        graph_drawer.set_node_color(selected_node_index, color_evidence);
    }
    else
    {
        graph_drawer.graph_node(selected_node_index).data.set_as_nonevidence();
        sel_node_evidence.disable();
        sel_node_evidence.set_text("");
        sel_node_evidence.set_background_color(color_default_bg);
        graph_drawer.set_node_color(selected_node_index, color_non_evidence);
    }
    solution.reset();
}

// ----------------------------------------------------------------------------------------

// This event is called when the user causes no node to be selected 
void main_window::
on_node_deselected ( unsigned long  )
{
    no_node_selected();
}

// ----------------------------------------------------------------------------------------

// This event is called when the user causes a node to be deleted 
void main_window::
on_node_deleted (  )
{
    no_node_selected();
}

// ----------------------------------------------------------------------------------------

// This event is called when the user changes the text in the "node label" text field
void main_window::
on_sel_node_text_modified (
)
{
    // set the selected node's text to match whatever the user just typed in
    graph_drawer.set_node_label(selected_node_index,sel_node_text.text());
}

// ----------------------------------------------------------------------------------------

