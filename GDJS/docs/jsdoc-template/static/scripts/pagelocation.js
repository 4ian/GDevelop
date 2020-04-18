'use strict';

$(document).ready(function () {
  var currentSectionNav, target;

  // If an anchor hash is in the URL highlight the menu item
  highlightActiveHash();
  // If a specific page section is in the URL highlight the menu item
  highlightActiveSection();

  // If a specific page section is in the URL scroll that section up to the top
  currentSectionNav = $('#' + getCurrentSectionName() + '-nav');

  if (currentSectionNav.position()) {
    $('nav').scrollTop(currentSectionNav.position().top);
  }

  // function to scroll to anchor when clicking an anchor linl
  $('a[href*="#"]:not([href="#"])').click(function () {
    /* eslint-disable no-invalid-this */
    if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && location.hostname === this.hostname) {
      target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: target.offset().top
        }, 1000);
      }
    }
    /* eslint-enable no-invalid-this */
  });
});

// If a new anchor section is selected, change the hightlighted menu item
$(window).bind('hashchange', function (event) {
  highlightActiveHash(event);
});

function highlightActiveHash(event) {
  var oldUrl, oldSubSectionElement;

  // check for and remove old hash active state
  if (event && event.originalEvent.oldURL) {
    oldUrl = event.originalEvent.oldURL;

    if (oldUrl.indexOf('#') > -1) {
      oldSubSectionElement = $('#' + getCurrentSectionName() + '-' + oldUrl.substring(oldUrl.indexOf('#') + 1) + '-nav');

      if (oldSubSectionElement) {
        oldSubSectionElement.removeClass('active');
      }
    }
  }

  if (getCurrentHashName()) {
    $('#' + getCurrentSectionName() + '-' + getCurrentHashName() + '-nav').addClass('active');
  }
}

function highlightActiveSection() {
  var pageId = getCurrentSectionName();

  $('#' + pageId + '-nav').addClass('active');
}

function getCurrentSectionName() {
  var path = window.location.pathname;
  var pageUrl = path.split('/').pop();

  var sectionName = pageUrl.substring(0, pageUrl.indexOf('.'));

  // remove the wodr module- if its in the url
  sectionName = sectionName.replace('module-', '');

  return sectionName;
}

function getCurrentHashName() {
  var pageSubSectionId;
  var pageSubSectionHash = window.location.hash;

  if (pageSubSectionHash) {
    pageSubSectionId = pageSubSectionHash.substring(1).replace('.', '');

    return pageSubSectionId;
  }

  return false;
}
