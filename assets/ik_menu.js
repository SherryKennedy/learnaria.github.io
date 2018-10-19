;(function ( $, window, document, undefined ) {
 
	var pluginName = 'ik_menu',
		defaults = {//Activity 12, add instructions for menu keyboard to default options
      'instructions': 'Use arrow keys to navigate between menuitems, spacebar to expand submenus, escape key to close submenus, enter to activate menuitems.'
    };
	 
	/**
	 * @constructs Plugin
	 * @param {Object} element - Current DOM element from selected collection.
	 * @param {Object} [options] - Configuration options.
	 */
	function Plugin( element, options ) {
		
		this._name = pluginName;
		this._defaults = defaults;
		this.element = $(element);
		this.options = $.extend( {}, defaults, options) ;
		
		this.init();
	}
	
	/** Initializes plugin. */
	Plugin.prototype.init = function () {
		
		var id, $elem, plugin;
		
		plugin = this;
		id = 'menu' + $('.ik_menu').length; // generate unique id
		$elem = plugin.element;
		
		$elem.addClass('ik_menu')
			.attr({
				'id': id
			});
		//instruction <div>
		$('<div/>') // add div element to be used with aria-described attribute of the menu
			.text(plugin.options.instructions) // get instruction text from plugin options
			.addClass('ik_readersonly') // hide element from visual display
			.attr({ //Activity 12, hide instructions till needed
				'id': id + '_instructions',
        'aria-hidden': 'true'  // hide element from screen readers to prevent it from being read twice
			})
			.appendTo(this.element);
		//Activity 12, Add role=menubar to top level <ul> in menu 
    //make the UL keyboard focusable with tabindex=0, so it reads the instr. while in focus being ref. with aria-labelledby 	
		$elem.find('ul:eq(0)')
			.attr({
				'id': id,
        'role': 'menubar', // assign menubar role to the topmost ul element
       'tabindex': 0,
       'aria-labelledby': id + '_instructions'
			});
      
    //Activity 12, all menu items in menubar have submenus 
    //role=menu to <ul> and hide them by dflt using
    //aria-hidden=true  
    $elem.find('li>ul')
        .attr({
          'role': 'menu',
          'aria-hidden': true // hide submenus from screen reader
        });
        
		plugin.menuitems = $elem.find('li') // setup menuitems
			.css({ 'list-style': 'none' })
			.each(function(i, el) {
				
				var $me, $link;
				//Activity 12, hide the links in the menu items from reader 
        //dftl using tabindex= -1 and setting aria-hidden=true
				$me = $(this);
				$link = $me.find('>a')
        .attr({ // disable links
          'tabindex': -1,
          'aria-hidden': true
        })
        ;
				//Activity 12, setup the menu items throughout the menu using role=menuitem. Remove keyboard access by dflt. using tabindex=-1
        //Label each menu itme with text of the associated link using aria-label="[$link.text]"
        $me.attr({
          'role': 'menuitem', // assign menuitem rols
          'tabindex': -1,  // remove from tab order
          'aria-label': $link.text() // label with link text
          });
        //Activity 12, for each menu items that has a submenu 
        //add aria-haspopup=true to announce the presence of the submenu, and set its dflt state to collapsed 
        //by adding aria-expanded=false
				$me.has('ul')
        .attr({ // setup submenus
          'aria-haspopup': true,
          'aria-expanded': false
        })
        .addClass('expandable');
			});
		
		plugin.selected = plugin.menuitems // setup selected menuitem
			.find('.selected')
      //Activity 12 when menu item is marked slected, also 
      //add aira-selected=true and keyboard access back to the menuitem with tabindex= 0 
      .attr({
        'tabindex': 0,
        'aria-selected': true
      })
      ;
		
		if (!plugin.selected.length) {
			//Acitivity 12, addkeyboard access back to menu itmes 
      //using tabindex=0, 2 cases
			plugin.menuitems
				.eq(0)
        .attr({
            'tabindex': 0
         })
        ;
			
		} else {
			
			plugin.selected
				.parentsUntil('nav', 'li')
        .attr({
          'tabindex': 0
        })
        ;
			
		}
		//Acityivty 12, add keyboard access where mouse events are 
    //defined in the onKeyDown function
		plugin.menuitems // setup event handlers
			.on('mouseenter', plugin.showSubmenu)
			.on('mouseleave', plugin.hideSubmenu)
			.on('click', {'plugin': plugin}, plugin.activateMenuItem)
      .on("keydown", {'plugin': plugin}, plugin.onKeyDown)
      ;
			
		$(window).on('resize', function(){ plugin.collapseAll(plugin); } ); // collapse all submenues when window is resized
		
	};
	
	/** 
	 * Shows submenu.
	 * 
	 * @param {object} event - Mouse event.
	 */
	Plugin.prototype.showSubmenu = function(event) {
		
		var $elem, $submenu;
		
		$elem = $(event.currentTarget);
		$submenu = $elem.children('ul');
		
		if ($submenu.length) {
			$elem.addClass('expanded')
      //Activity 12, add aria-expanded=true to submenus 
      //when they are expanded, remove keyboard access 
      //from the submenu container with tabindex=-1.
      //make submenu visible with aria-hidden = false
        .attr({
            'aria-expanded': true,
            'tabindex': -1
        })
      ;
      $submenu
       .attr({
           'aria-hidden': false
       });
		}
	};
	
	/** 
	 * Hides submenu.
	 * 
	 * @param {object} event - Mouse event.
	 */
	Plugin.prototype.hideSubmenu = function(event) {
		
		var $elem, $submenu;
		
		$elem = $(event.currentTarget);
		$submenu = $elem.children('ul');
		
		if ($submenu.length) {
			$elem.removeClass('expanded')
      //Activity 12, set aria-expanded=false, 
      .attr({'aria-expanded': false})
      ;
      //Acivity 12, hide submenus 
      //with aria-hidden = true, remove keyboard access with 
      //tabindex = -1
      $submenu.attr({'aria-hidden': true});
      $submenu.children('li').attr({'tabindex': -1});

		}
	}
	
	/** 
	 * Collapses all submenus. Whem element is specified collapses all sumbenus inside that element.
	 * 
	 * @param {object} plugin - Reference to plugin.
	 * @param {object} [$elem] - jQuery object containing element (optional).
	 */
	Plugin.prototype.collapseAll = function(plugin, $elem) {
		
		$elem = $elem || plugin.element;
		//Activity 12, to callapse menus, reverse all attributes 
    //defining the element as ope, reversing:
    //aria-hidden=true, aria-expanded=false, tabindex=0 to be able open again
    $elem.find('[aria-hidden=false]')
      .attr({'aria-hidden': true});
    $elem.find('.expanded')
      .removeClass('expanded')
      .attr({'aria-expanded': false});
    $elem.find('li')
      .attr({'tabindex':-1}).eq(0).attr({'tabindex': 0});
	};
	
	/** 
	 * Activates menu selected menuitem.
	 * 
	 * @param {Object} event - Keyboard or mouse event.
	 * @param {object} event.data - Event data.
	 * @param {object} event.data.plugin - Reference to plugin.
	 */
	Plugin.prototype.activateMenuItem = function(event) {
		
		var plugin, $elem;
		
		event.stopPropagation();
		
		plugin = event.data.plugin;
		$elem = $(event.currentTarget);
		
		plugin.collapseAll(plugin);
	
		if ($elem.has('a').length) {
			alert('Menu item ' + $elem.find('>a').text() + ' selected');
		}
		
	};
	
	//Activity 12, keyboard accessibility:
  //implement a subset of the keyboard interaction W3C recommends an onKeyDown function that is called when event
  //handlers are set up for menu items. These keys include:
  //Left/Right Arrows, Up/Down Arrows, space bar and Enter key
  //Tab and Esc keys. 
  /**
  * Selects specified tab.
  *
  * @param {Object} event - Keyboard event.
  * @param {object} event.data - Event data.
  * @param {object} event.data.plugin - Reference to plugin.
  * @param {object} event.data.index - Index of a tab to be selected.
  */
  
  
 Plugin.prototype.onKeyDown = function (event) {
    
     var plugin, $elem, $current, $next, $parent, $submenu, $selected;
    
     plugin = event.data.plugin;
     $elem = $(plugin.element);
     $current = $(plugin.element).find(':focus');
     $submenu = $current.children('ul');
     $parentmenu = $($current.parent('ul'));
     $parentitem = $parentmenu.parent('li');
        
     switch (event.keyCode) {
        
         case ik_utils.keys.right:
          //  console.log("at key right")
            
             event.preventDefault();
             //console.log("current parent")
            // console.log($current.parents('ul'))
             //console.log("next li should have tabindex 0 and focus")
             //console.log("at right arrow key, length of submenu")
             //console.log($submenu.length)
             //originally
             if ($current.parents('ul').length == 1) {
               $current.attr({'tabindex': -1}).next('li').attr({'tabindex': 0}).focus();
             }
             
             //go to the right testing through submenu to menu
            /*  if ($current.parents('ul').length == 1) {//on main header go to right
                // $parentitem.addClass('expanded'); 
                  $current.attr({'tabindex': -1}).next('li').attr({'tabindex': 0}).focus();
              } else if ($submenu.length == 1){//want submenu to go over to right when not on parent
                //  $parentitem.addClass('expanded'); 
                  $submenu.attr({'aria-hidden': 'false'}).show();
                  $submenu.find('li:eq(0)').attr({"tabindex": 0}).focus();
              }*/
             
             break;
        
         case ik_utils.keys.left:
            console.log("at key left")
             event.preventDefault();
            
             if ($current.parents('ul').length == 1) {
                 $current.attr({'tabindex': -1}).prev('li').attr({'tabindex': 0}).focus();
             }
            
             break;
            
         case ik_utils.keys.up:
         //Activity 12, key up used to move into and out of a submenu, and to move between menu items in a submenu.
         //Instructions say to only use to move up for submenus. (use esc to get out of menu)
            console.log("at key up")
             event.preventDefault();
             event.stopPropagation();
             console.log("at key up, parent length:")
             console.log($current.parents('ul').length)
             
             
             //orig //((test))
             if ($current.parents('ul').length > 1) {
                $current.attr({'tabindex': -1}).prev('li').attr({'tabindex': 0}).focus();
            }
             
            //tested below 
            // $current.attr({'tabindex': -1}).prev('li').attr({'tabindex': 0}).focus();
            
            
             //up arrow will collapse submenu on 
            // if ($parentmenu.parent().attr('aria-haspopup')) {
                //  // $parentitem.removeClass('expanded');
				        //  // $current.attr({"tabindex": -1});
				        //  // $parentmenu.attr({'aria-hidden': 'true'}).hide().parent().focus();
                //  $current.attr({'tabindex': -1}).prev('li').attr({'tabindex': 0}).focus();
			       //} 
            // else if ($current.parents('ul').length > 1) { 
                //  //regular link on to go up one, ??????????????????????????????????????????????
                  //$current.attr({'tabindex': -1}).prev('li').attr({'tabindex': 0}).focus();
             //}
             break;
        
         case ik_utils.keys.down:
         //Activity 12, key down: opens menu and moves focus to first menuitem
         //down arrow: moves focus to next menu item, if focus 
         // on the last menu itme, moves focus to first (optional)
            // console.log("at key down")
             event.preventDefault();
             event.stopPropagation();
             //console.log(plugin.options.autoCollapse)
             //console.log("current parent")
             //console.log($current.parents('ul'))
             //console.log("next li should have tabindex 0 and focus")
             //console.log("length of ul")
             //var ulLength = $current.parents('ul').length
             //console.log(ulLength)
             
             //for links going down (working with down arrow from menu as well
          /*   if ($current.parents('ul').length > 1) {
                     $current.attr({'tabindex': -1}).next('li').attr({'tabindex': 0}).focus();
             } else if ($submenu.length ==1) {
                     $submenu.attr({'aria-hidden': 'false'}).show();
             }*/
            //originally
             if($current.parents('ul').length > 1) {
              $current.attr({'tabindex': -1}).next('li').attr({'tabindex': 0}).focus();
             }
            
            
             break;
            
         case ik_utils.keys.space:
            
             event.preventDefault();
             event.stopPropagation();
            //Activity 12, found that this only works the first time and not subsequent, to open the submenu
            //ORIG Test, not working all time
            /*if($submenu.length) {
                 plugin.showSubmenu(event);
                 $submenu.children('li:eq(0)').attr({'tabindex': 0}).focus();
             } */
             //Acitivity 12, space bar used to activate a menu item
             //plugin.activateMenuItem(event);
             //instuctions when go on menu say it is supposed to open submenu
             //working that i did
             if ($submenu.length) {
            //  if ($submenu.length ==1) {
                       $submenu.attr({'aria-hidden': 'false'}).show();
                       $submenu.find('li:eq(0)').attr({"tabindex": 0}).focus();
               }
               break;
        
         case ik_utils.keys.esc:
            //Close the current submenu
             event.stopPropagation();
            
             if ($parentitem.hasClass('expandable')) {
                
                 $parentitem.removeClass('expanded').attr({
                     'tabindex': 0,
                     'aria-expanded': false
                 }).focus();
                 plugin.collapseAll(plugin, $parentitem); 
             }
             //Activity 12, close the current submenus
             //up arrow will collapse submenu on 
             if ($parentmenu.parent().attr('aria-haspopup')) {
                  // $parentitem.removeClass('expanded');
                  $current.attr({"tabindex": -1});
                  $parentmenu.attr({'aria-hidden': 'true'}).hide().parent().focus();
            } 
             
             
             
             break;
        
         case ik_utils.keys.enter:
            
             plugin.activateMenuItem(event);
            
             break;
        
         case ik_utils.keys.tab:
            //Found that this does not work correct.   
            // http://api.jqueryui.com/menu/   $( ".selector" ).menu( "collapseAll", null, true );  or $( ".selector" ).menu( "destroy" );
             plugin.collapseAll(plugin);
             //pulgin.collapseAll(plugin,true);
             //plugin.menu("collapseAll",null,true);
             //$elem.menu("destroy");
             break;
     }
 }  
  
  
	$.fn[pluginName] = function ( options ) {
		
		return this.each(function () {
			
			if ( !$.data(this, pluginName )) {
				$.data( this, pluginName,
				new Plugin( this, options ));
			}
			
		});
		
	}
 
})( jQuery, window, document );
