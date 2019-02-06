
var dit = dit || {};

dit.classes = dit.classes || {};
dit.components = dit.components || {};
dit.constants = dit.constants || {};

dit.components.greatHeader = (new function() {
  var HEADER_NAV = '#great-header-nav';
  var COLLAPSED_CLASS = 'collapsed';
  var MENU_HEADING = '.js-link-heading';
  var COLLAPSIBLE_MENUS = '.js-collapsible-menu';
  var MENU_CONTROL_CLASSNAME = 'js-menu-control';
  var MOBILE_MENU_BUTTON_ID = 'js-mobile-button';
  var LANGUAGE_SELECTOR = '#language-selector-activator';
  var EXTRA_LINKS = '#great-header-extra-links';
  var NAV_LIST = '#great-header-nav-list';

  var expanders = [];
  var self = this;

  self.config = {
    HEADER_NAV: HEADER_NAV,
    MENU_HEADING: MENU_HEADING,
    MENU_CONTROL_CLASSNAME: MENU_CONTROL_CLASSNAME,
  };

  function setupResponsiveView() {
    self.mode = dit.responsive.mode();
    switch(self.mode) {
      case 'desktop': setupDesktopHeader(); break;
      case 'tablet': setupMobileHeader(); break;
      case 'mobile': setupMobileHeader(); break;
      default: console.log('Could not determine responsive mode');
    }
  }

  function setupDesktopHeader() {
    self.config.mode = self.mode;
    self.config.hover = true;
    self.config.blur = true;

    $(COLLAPSIBLE_MENUS).each(function() {
      expanders.push(new dit.classes.Dropdown($(this), self.config));
    });
  }

  function setupMobileHeader() {
    var $control = $('<button></button>');
    var $icon = $('<span></span>');

    $control.text('Menu');
    $control.attr('tabindex', '0');
    $control.attr('id', MOBILE_MENU_BUTTON_ID);
    $control.attr('class', MOBILE_MENU_BUTTON_ID);
    $control.attr('aria-controls', HEADER_NAV);
    $control.append($icon.clone());

    var $menu = $(HEADER_NAV);
    $menu.before($control);
    $menu.addClass(COLLAPSED_CLASS);

    // change the invest heading to a link
    var $invest = $('#header-invest-links-heading');
    var attrs = {};
    attrs.href = $('#headerInvestURL').attr('value');

    $.each($invest[0].attributes, function(index, attr) {
      attrs[attr.nodeName] = attr.nodeValue;
    });

    $invest.replaceWith(function () {
      return $('<a />', attrs).append($(this).contents());
    });

    // hide submenu items
    $(COLLAPSIBLE_MENUS)
      .attr('aria-hidden', 'true')
      .hide();

    var _expanders = [];

    _expanders.push(new dit.classes.Dropdown($menu, {
      $control: $control,
      blur: false,
      hover: false,
      mode: self.mode,
      cleanup: function() {
        // reassign because the element changed
        $invest = $('#header-invest-links-heading');

        // change link back to a span
        $.each($invest[0].attributes, function(idx, attr) {
            attrs[attr.nodeName] = attr.nodeValue;
        });

        delete attrs.href;

        $invest.replaceWith(function () {
          return $('<span />', attrs).append($(this).contents());
        });

        // remove the menu button
        $control.remove();

        // show submenu items again
        $(COLLAPSIBLE_MENUS)
          .attr('aria-hidden', 'false')
          .show();
      }
    }));

    expanders.push.apply(expanders, _expanders);
  }

  // listen for resize event and change mode if different
  function setupResponsiveListener() {
    $(document.body).on(dit.responsive.reset, function(e, newMode) {
      if (newMode !== self.mode) dit.components.greatHeader.reset();
    });
  }

  // destroy, set up again in correct mode
  this.reset = function() {
    while (expanders.length) expanders.pop().destroy();
    setupResponsiveView();
  }

  /* Find and enhance any Language Selector Dialog view
   **/
  function enhanceLanguageSelector() {
    var $dialog = $("[data-component='language-selector-dialog']");
    dit.components.languageSelector.enhanceDialog($dialog, {
      $controlContainer: $(".great-header-extra-links")
    });

    languageSelectorViewInhibitor(false);
  }

  /* Because non-JS view is to show all, we might see a brief glimpse of
   * the open language selector before JS has kicked in to add functionality.
   * We are preventing this by immediately calling a view inhibitor function,
   * and then the enhanceLanguageSelector() function will switch of the
   * inhibitor by calling when component has been enhanced and is ready.
   **/
  languageSelectorViewInhibitor(true);
  function languageSelectorViewInhibitor(activate) {
    var rule = "[data-component='language-selector-dialog'] { display: none; }";
    var style;
    if (arguments.length && activate) {
      // Hide it.
      style = document.createElement("style");
      style.setAttribute("type", "text/css");
      style.setAttribute("id", "language-dialog-view-inhibitor");
      style.appendChild(document.createTextNode(rule));
      document.head.appendChild(style);
    }
    else {
      // Reveal it.
      document.head.removeChild(document.getElementById("language-dialog-view-inhibitor"));
    }
  }

  this.init = function() {
    dit.responsive.init({
      'desktop': 'min-width: 769px',
      'tablet' : 'max-width: 768px',
      'mobile' : 'max-width: 640px'
    });

    setupResponsiveListener();
    setupResponsiveView();
    enhanceLanguageSelector();
    delete this.init; // Run once
  }
});

$(document).ready(function() {
  dit.components.greatHeader.init();
});