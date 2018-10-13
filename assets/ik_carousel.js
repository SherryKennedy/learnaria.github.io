;(function ( $, window, document, undefined ) {
	
	var pluginName = 'ik_carousel',
		defaults = { // default settings
			// Activity 11, add instructions for ik_carousel
		  'instructions': 'Carousel widget. Use left and reight arrows to navigate between slides.',
			'animationSpeed' : 4000         //3000   

		//focus on arrow key is not changing to say anything
		};
	 
	/**
	 * @constructs Plugin
	 * @param {Object} element - Current DOM element from selected collection.
	 * @param {Object} options - Configuration options.
	 * @param {string} options.instructions - Custom instructions for screen reader users.
	 * @param {number} options.animationSpeed - Slide transition speed in milliseconds.
	 */
	function Plugin( element, options ) {
		
		this._name = pluginName;
		this._defaults = defaults;
		this.element = $(element);
		this.options = $.extend( {}, defaults, options) ;
		
		this.init();
	
	};
	
	/** Initializes plugin. */
	Plugin.prototype.init = function () {
		
		var id, plugin, $elem, $image, $controls, $navbar;
		
		plugin = this;
		id = 'carousel' + $('.ik_slider').length;
		$elem = plugin.element;
		
		$elem
			.attr({
				//Activity 11, add attr for carousel role=region for landmark, tabindex so keyboard focusable, and ref ID of instructions <div> with aria-describedby. 
				'id': id,
				'role': 'region', // assign region role
    		'tabindex': 0, // add into the tab order
    		'aria-describedby': id + '_instructions' // associate with instructions
				//'aria-labelledby': id + '_instructions' // associate with instructions
			})
			.addClass('ik_carousel')
			//Activity 11, add onKeydown as ref to function for keyboard operability
			.on('keydown', {'plugin': plugin}, plugin.onKeyDown)
			.on('focusin mouseenter', {'plugin': plugin}, plugin.stopTimer)
			.on('focusout mouseleave', {'plugin': plugin}, plugin.startTimer)
		
		
		$controls = $('<div/>')
       //Activity 11, readers will not need Next/Previous controls, so hide them. Use Arrow keys instead defined in onKeyDown function 
			.attr({
         'aria-hidden': 'true' // hide controls from screen readers
     		})
			.addClass('ik_controls')
			.appendTo($elem);
				
		$('<div/>')
			.addClass('ik_button ik_prev')
			.on('click', {'plugin': plugin, 'slide': 'left'}, plugin.gotoSlide)
			.appendTo($controls);
		
		$('<div/>')
			.addClass('ik_button ik_next')
			.on('click', {'plugin': plugin, 'slide': 'right'}, plugin.gotoSlide)
			.appendTo($controls);
		
		$navbar = $('<ul/>')
			.addClass('ik_navbar')
			.appendTo($controls);
			
		plugin.slides = $elem
			.children('figure')
			.each(function(i, el) {
				var $me, $src;
				
				$me = $(el);
				$src = $me.find('img').remove().attr('src');
				
				//Activity 11, Hide images from readers. Notice alt text for the images are defined in HTL but left empty so it is not read in this case. Readers will read the figcaptions. 
				$me.attr({
    			    'aria-hidden': 'true' // hide images from screen readers
				   })  //took out the $me.css
				    .css({
							 'background-image': 'url(' + $src + ')'
						});	
				
				$('<li/>')
					.on('click', {'plugin': plugin, 'slide': i}, plugin.gotoSlide)
					.appendTo($navbar);
			});
			
		//Activity 11, add in reader instructions by generating the <div> containing instructions. Hide <div> by dftlt.
	 //Instructions read when carousel receives focus and aria-
	 // describedby attrib is dynamically added to ref instr. 
	 $('<div/>') // add instructions for screen reader users
			.attr({
				'id': id + '_instructions',
				'aria-hidden': 'true'
			})
			.text(this.options.instructions)
			.addClass('ik_readersonly')
			.appendTo($elem);
	
		
		plugin.navbuttons = $navbar.children('li');
		plugin.slides.first().addClass('active');
		plugin.navbuttons.first().addClass('active');
		plugin.startTimer({'data':{'plugin': plugin}});
		
	};
	
	/** 
	 * Starts carousel timer. 
	 * Reference to plugin must be passed with event data.
	 * 
	 * @param {Object} event - Mouse or focus event.
	 */
	Plugin.prototype.startTimer = function (event) {
		
		var plugin;
		
		$elem = $(this);
		plugin = event.data.plugin;
		
		if(plugin.timer) {
			clearInterval(plugin.timer);
			plugin.timer = null;
		}
		
		plugin.timer = setInterval(plugin.gotoSlide, plugin.options.animationSpeed, {'data':{'plugin': plugin, 'slide': 'right'}});
		
		//Activity 11, remove the live region when focus on carousel is removed. So live regions stops reading when 
		//time is reactivated onblur, and does not interfers with reader elsewhere on page. 
		if (event.type === 'focusout') {
    		plugin.element.removeAttr('aria-live');
			}
		
	};
	
	/** 
	 * Stops carousel timer. 
	 * 
	 * @param {object} event - Mouse or focus event.
	 * @param {object} event.data - Event data.
	 * @param {object} event.data.plugin - Reference to plugin.
	 */
	Plugin.prototype.stopTimer = function (event) {
		
		var plugin = event.data.plugin;
		clearInterval(plugin.timer);
		plugin.timer = null;
		
		//Actiivty 11, add aria-live=polite so content updating in live region announces when a reader in not reading elsewhere on page
		//Content on visible carousel is read automatically, manually navigate btwn panels with arrow keys. 
		if (event.type === 'focusin') {
	 			plugin.element.attr({'aria-live': 'polite'});
				}
		
	};
	
	/** 
	 * Goes to specified slide. 
	 * 
	 * @param {object} event - Mouse or focus event.
	 * @param {object} event.data - Event data.
	 * @param {object} event.data.plugin - Reference to plugin.
	 * @param {number} event.data.slide - Index of the slide to show.
	 */
	Plugin.prototype.gotoSlide = function (event) {
		
		var plugin, n, $elem, $active, $next, index, direction, transevent;
		
		plugin = event.data.plugin;
		n = event.data.slide;
		$elem = plugin.element;
		$active = $elem.children('.active');
		index = $active.index();
		
		if (typeof n === 'string') {
			
			if(n === 'left') {
				direction = 'left';
				n = index == 0 ? plugin.slides.length - 1 : --index;
			} else {
				direction = 'right'
				n = index == plugin.slides.length - 1 ? 0 : ++index;
			}
			
		} else {
			if (index < n || (index == 0 && n == plugin.slides.length - 1)) {
				direction = 'left';
			} else {
				direction = 'right';
			}
		}
		
		$next = plugin.slides.eq(n).addClass('next');
		transevent = ik_utils.getTransitionEventName();
		$active.addClass(direction).on(transevent, {'next': $next, 'dir': direction}, function(event) {
			
			var active, next, dir;
			
			active = $(this);
			next = event.data.next;
			dir = event.data.dir;
			
			//Activity 11, hide the active slide from reader with aria-hidden=true
			active.attr({
        				'aria-hidden': 'true'
    					})
						.off( ik_utils.getTransitionEventName() )
						.removeClass(direction + ' active');
			//Activity 11, make the next slide visible to reader with aria-hidden=false, in the gotoSlide
			next.attr({
        		'aria-hidden': 'false'
    			})	
					.removeClass('next')
				  .addClass('active');
			
		});
		
		plugin.navbuttons.removeClass('active').eq(n).addClass('active');
		
	}
	
	//Activity 11, add keyboard operability for carousel, pull keyboard events from ik_utils.js, left and right arrows for moving btwn panels in carousel, Esc key to exit carousel and 
	//resume automatic rotation. 
	/**
* Handles keydown event on the next/prev links.
*
* @param {Object} event - Keyboard event.
* @param {object} event.data - Event data.
* @param {object} event.data.plugin - Reference to plugin.
*/
Plugin.prototype.onKeyDown = function (event) {
       
    var plugin = event.data.plugin;
       
    switch (event.keyCode) {
           
        case ik_utils.keys.left:
            event.data = {'plugin': plugin, 'slide': 'left'};
            plugin.gotoSlide(event);
            break;
        case ik_utils.keys.right:
            event.data = {'plugin': plugin, 'slide': 'right'};
            plugin.gotoSlide(event);
            break;
        case ik_utils.keys.esc:
            plugin.element.blur();
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
