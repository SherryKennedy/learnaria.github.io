;(function ( $, window, document, undefined ) {
 	
	var pluginName = 'ik_accordion',
		defaults = { // set default parameters
			autoCollapse: false,
			animationSpeed: 200
		};
	 
	/**
	 * @constructs Plugin
	 * @param {Object} element - Current DOM element from selected collection.
	 * @param {Object} options - Configuration options.
	 * @param {boolean} options.autoCollapse - Automatically collapse inactive panels.
	 * @param {number} options.animationSpeed - Panel toggle speed in milliseconds.
	 */
	function Plugin( element, options ) {
		
		this._name = pluginName;
		this._defaults = defaults;
		this.element = $(element); 
		this.options = $.extend( {}, defaults, options) ; // override default parameters if setup object is present
		
		this.init();
	}
	
	/** Initializes plugin. */
	Plugin.prototype.init = function () {
		
		var id, $elem, plugin;
		
		id = 'acc' + $('.ik_accordion').length; // create unique id
		$elem = this.element;
		plugin = this;
		
		$elem.attr({//Activity 9, add landmark role to <dl>
			'id': id,
       'role': 'region' // add the accordion to the landmarked regions
		}).addClass('ik_accordion');
		
    //Activity 9, add aria-multiselect to <dl>
    //dynamically set to true or false, pending single vs multiselect
    $elem.attr({'aria-multiselectable': !this.options.autoCollapse}); // define if more than one panel can be expanded
    
    //Activity 9, remove children of <dl> header, assigned presentation role, thus definition semantics removed
    //by adding role=heading to <dt> to aria-level attrib.
    //simplified here, added aria-level because it is a header
    this.headers = $elem.children('dt')
        .attr({'role': 'heading'})//; // set heading role for each accordion header
        .attr({'aria-level': "3"});  //add aria level as is a heading
    
    	
		this.headers = $elem.children('dt').each(function(i, el) {
			var $me, $btn;
			
			$me = $(el);
      //Activity 9 adds a div inside header (<dt>)
      //define role (button), aria-controls attrib define which of the accordion panels it controls
      //aria-expanded = false to updated dynamically when
      //button click or key pressed. 
      //finally add tabindex =0 to the button div to 
      //make the keyboard focusable
			$btn = $('<div/>').attr({
          'id': id + '_btn_' + i,
          'role': 'button',
          'aria-controls': id + '_panel_' + i, // associate button with corresponding panel
          'aria-expanded': false, // toggle expanded state
          'tabindex': 0 //add keyboard focus
        })
        .addClass('button')
        .html($me.html())
        //Activity 9, on keydown, .on makes focusable but not clickable, .onkeydown activates onKeyDown function
        .on('keydown', {'plugin': plugin}, plugin.onKeyDown) // enable keyboard navigation
        .on('click', {'plugin': plugin}, plugin.togglePanel);
        
			$me.empty().append($btn); // wrap content of each header in an element with role button
		});
		
		this.panels = $elem.children('dd').each(function(i, el) {
			var $me = $(this), id = $elem.attr('id') + '_panel_' + i;
      //Acitivty 9 accordion panel, <dd>, elements role=presentation removed, but added to <dl>
      //panels need role=region, to make panel browsable in landmark list, set hidden by default to true so panels 
      //closed when page loads. Tabindex =0 so panel keyboaard focusable
			$me.attr({
				'id': id,
        'role': 'region', // add role region to each panel
        'aria-hidden': true, // mark all panels as hidden
        'tabindex': 0, // add panels into the tab order
        'aria-labelledby': $elem.attr('id') + '_panel_' + i           //$me    //'dt'
			});
		}).hide();
		
	};
	
	/** 
	 * Toggles accordion panel.
	 *
	 * @param {Object} event - Keyboard or mouse event.
	 * @param {object} event.data - Event data.
	 * @param {object} event.data.plugin - Reference to plugin.
	 */
	Plugin.prototype.togglePanel = function (event) { 
		/*Aria-expanded and aria-hidden attributes do not update automatically. You need to do that manually inside togglePanel method.*/
		var plugin, $elem, $panel, $me, isVisible;
		
		plugin = event.data.plugin;
		$elem = $(plugin.element);
		$me = $(event.target);
		$panel = $me.parent('dt').next();
    //console.log("made it here 1")
		//console.log(plugin.options.autoCollapse)
		if(plugin.options.autoCollapse) { // expand current panel and collapse the rest
			//console.log("made it here collapse=true 2")
			plugin.headers.each(function(i, el) {
				var $hdr, $btn; 
				
				$hdr = $(el);
				$btn = $hdr.find('.button');
      
				if($btn[0] != $(event.currentTarget)[0]) { 
          //Activity 9, set to collapse 
          //add in aria-expanded and aria-hidden
          $btn.attr({'aria-expanded': false})
          $btn.removeClass('expanded');  //
          //console.log("change aria-hidden = true")
          $hdr.next().attr({'aria-hidden': 'true'})
					$hdr.next().slideUp(plugin.options.animationSpeed);
				} else { 
          //console.log("change aria-expanded = true")
          //Activity 9, set to expand
          //add in aria-expanded and aria-hidden
          $btn.attr({'aria-expanded': true})
					$btn.addClass('expanded');
          //console.log("change the aria-hidden to false")
          $hdr.next().attr({'aria-hidden': 'false'})
					$hdr.next().slideDown(plugin.options.animationSpeed);
				}
			});
			
		} else { // toggle current panel depending on the state
		  //Acitivity 9, autocollapse = false, 
      //change html: to use isVisible, jQuery v 2.1.4 and not not 3.3.1
      isVisible = !!$panel.is(':visible');
      //add attribute to change aria-expanded depends on isVisible
      $me.attr({'aria-expanded': !isVisible}); 
      //add in function to toggle expanded class 
      //add in attr aria-hidden depends on isVisible  
      $panel.slideToggle({ duration: plugin.options.animationSpeed, 
      done: function(){ $me.toggleClass('expanded');
      $panel.attr({'aria-hidden':isVisible})
      }});
			
		}
	};

  
  //Acitivity 9, add onKeyDown function / events
  //adds keboard operability to hte header elements of the accordion, alls both space bar and enter keys to operate the toggles
  //ie headers that open and close panels, arrow keys to move btwn headers.
  // by default user can navigate btwn headers, headers and panels using tab key
  /**
     * Handles kedown event on header button.
     *
     * @param {Object} event - Keyboard event.
     * @param {object} event.data - Event data.
     * @param {object} event.data.plugin - Reference to plugin.
     */
    Plugin.prototype.onKeyDown = function (event) {
       
        var $me, $header, plugin, $elem, $current, ind;
       
        $me = $(event.target);
        $header = $me.parent('dt');
        plugin = event.data.plugin;
        $elem = $(plugin.element);
       
        switch (event.keyCode) {
           
            // toggle panel by pressing enter key, or spacebar
            case ik_utils.keys.enter:
            case ik_utils.keys.space:
                event.preventDefault();
                event.stopPropagation();
                plugin.togglePanel(event);
                break;
           
            // use up arrow to jump to the previous header
            case ik_utils.keys.up:
                ind = plugin.headers.index($header);
                if (ind > 0) {
                    plugin.headers.eq(--ind).find('.button').focus();
                }
                console.log(ind);
                break;
           
            // use down arrow to jump to the next header
            case ik_utils.keys.down:
                ind = plugin.headers.index($header);
                if (ind < plugin.headers.length - 1) {
                    plugin.headers.eq(++ind).find('.button').focus();
                }
                break;
        }
    };
  
  
  
  
  
	
	$.fn[pluginName] = function ( options ) {
		
		return this.each(function () {
			
			if ( !$.data(this, pluginName )) {
				$.data( this, pluginName,
				new Plugin( this, options ));
			}
			
		});
		
	}
 
})( jQuery, window, document );
