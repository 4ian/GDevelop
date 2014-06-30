/* global $:true */
$(function() {
    'use strict';

    // ************************************************************************* //
    //  HTML templates
    // ************************************************************************* //

    // (None)


    // ************************************************************************* //
    //  Functions
    // ************************************************************************* //

    function setUpActiveTab() {
        if(localStorage.getItem('main-nav')){
            $('a[href="'+ localStorage['main-nav'] + '"]').tab('show');
        }
    }

    function setUpOptionsCheckboxes() {
        if(localStorage.getItem('options')){
            var optionsArr = JSON.parse(localStorage.options),
                optionsForm = $('#options-form');

            for(var i=0;i<optionsArr.length;i++){
                var box = optionsForm.find('input:checkbox').eq(i);
                box.prop('checked', optionsArr[i]);
                setOptionDisplayState(box);
            }
        }
    }

    function setUpWidgets() {
        var sideSource = [], navbarSource = [], sidebarSearch, navbarSearch;

        $('#sidebar .tab-pane.active li a').each(function(index, elem) {
            sideSource.push($(elem).text());
        });
        $('#sidebar .tab-pane li a').each(function(index, elem) {
            navbarSource.push($(elem).text());
        });

        sidebarSearch = $('#sidebar input[type="search"]');
        sidebarSearch.typeahead({
            updater : function(item) {
                $('#sidebar .tab-pane.active a:contains(' + item + ')')[0].click();
                return item;
            }
        });
        sidebarSearch.data('typeahead').source = sideSource;

        navbarSearch = $('.navbar input');

        navbarSearch.typeahead({
            source : navbarSearch.data('obj'),
            matcher : function(item) {
                var regex = new RegExp(this.query, 'ig');

                return regex.test(item.split('/')[1]);
            },
            updater : function(item) {
                window.location.assign(location.protocol + "//" + location.host + '/' + item + '.html');
            }
        });
    }

    function setOptionDisplayState(box) {
        var cssName = $.trim(box.parent('label').text()).toLowerCase();
        if(box.is(':checked')){
            $('div.'+cssName).css('display', 'block');
            $('li.'+cssName).css('display', 'block');
            $('span.'+cssName).css('display', 'inline');
        }else{
            $('.'+cssName).css('display', 'none');
        }
    }

    $('[data-tabid]').on('click', function(event) {
        var tabToActivate = $(this).attr('data-tabid'),
        anchor = $(this).attr('data-anchor');
        event.preventDefault();
        $('[data-toggle=tab][href="'+ tabToActivate + '"]').click();
        $(document).scrollTop( $(anchor).offset().top );
    });

    // ************************************************************************* //
    //  Initializations + Event listeners
    // ************************************************************************* //

    //
    // Store last clicked tab in local storage
    //
    $('#main-nav li').on('click', function(e) {
        e.preventDefault();
        localStorage['main-nav'] = $(this).find('a').attr('href');
    });

    //
    // Refresh typeahead source arrays when user changes tabs
    //
    $('#main-nav li').on('shown', function(e) {
        e.preventDefault();
        setUpWidgets();
    });

    //
    // Bind change events for options form checkboxes
    //
    $('#options-form input:checkbox').on('change', function(){
        setOptionDisplayState($(this));

        // Update localstorage
        var optionsArr = [];
        $('#options-form input:checkbox').each(function(i,el) {
            optionsArr.push($(el).is(':checked'));
        });
        localStorage.options = JSON.stringify(optionsArr);
    });

    //
    // Keyboard shortcut - 's' key
    // This brings the api search input into focus.
    //
    $(window).keyup(function(e) {
        // Listen for 's' key and focus search input if pressed
        if(e.keyCode === 83){ // 's'
            $('#api-tabview-filter input').focus();
        }
    });

    //
    // Keyboard shortcut - 'ctrl+left', 'ctrl+right', 'up', 'down'
    // These shortcuts offer sidebar navigation via keyboard,
    // *only* when sidebar or any element within has focus.
    //
    var nextIndex;
    $('#sidebar').keydown(function(e) {
        var $this = $(this);

        // Determine if the control/command key was pressed
        if(e.ctrlKey){
            if(e.keyCode === 37){ // left arrow
                $('#main-nav li a:first').tab('show');
            } else if(e.keyCode === 39){ // right arrow
                $('#main-nav li a:last').tab('show');
            }
        } else {
            if(e.keyCode === 40){ // down arrow
                if ($('#api-tabview-filter input').is(':focus')) {
                    // Scenario 1: We're focused on the search input; move down to the first li
                    $this.find('.tab-content .tab-pane.active li:first a').focus();
                } else if ($this.find('.tab-content .tab-pane.active li:last a').is(':focus')) {
                    // Scenario 2: We're focused on the last li; move up to search input
                    $('#api-tabview-filter input').focus();
                } else {
                    // Scenario 3: We're in the list but not on the last element, simply move down
                    nextIndex = $this
                    .find('.tab-content .tab-pane.active li')
                    .find('a:focus')
                    .parent('li').index() + 1;
                    $this.find('.tab-content .tab-pane.active li:eq('+nextIndex+') a').focus();
                }
                e.preventDefault(); // Stop page from scrolling
            } else if (e.keyCode === 38){ // up arrow
                if($('#api-tabview-filter input').is(':focus')) {
                    // Scenario 1: We're focused on the search input; move down to the last li
                    $this.find('.tab-content .tab-pane.active li:last a').focus();
                }else if($this.find('.tab-content .tab-pane.active li:first a').is(':focus')){
                    // Scenario 2: We're focused on the first li; move up to search input
                    $('#api-tabview-filter input').focus();
                }else{
                    // Scenario 3: We're in the list but not on the first element, simply move up
                    nextIndex = $this
                    .find('.tab-content .tab-pane.active li')
                    .find('a:focus')
                    .parent('li').index() - 1;
                    $this.find('.tab-content .tab-pane.active li:eq('+nextIndex+') a').focus();
                }
                e.preventDefault(); // Stop page from scrolling
            }
        }
    });


    // ************************************************************************* //
    //  Immediate function calls
    // ************************************************************************* //

    setUpActiveTab();
    setUpOptionsCheckboxes();
    setUpWidgets();

});
