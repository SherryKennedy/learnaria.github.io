;(function ( $, window, document, undefined ) {
 
var pluginName = "ik_sortable",
	//Activity 14, instructions for sortable list with keyboard. 
  //Modifier for MAC Command key otherwise Ctrl keys
  //Standard access key commands: (work as a modifier and be described)
  // (e.g. Ctrl+Alt on Mac, or Ctrl on Windows).
  modifier = navigator.platform.indexOf('Mac') > -1 ? 'Command' : 'Control',
  defaults = {
    'instructions': 'Use arrow keys to select a list item,  ' +  modifier + ' + arrow keys to move it to a new position.'
  };
	 
	function Plugin( element, options ) {
		
		this.element = $(element);
		this.options = $.extend( {}, defaults, options);
		this._defaults = defaults;
		this._name = pluginName;
		
		this.init();
	}
	 
	Plugin.prototype.init = function () {
		
		var $elem, plugin, id, total;
		
		plugin = this;
		id = 'sortable_' + $('.ik_sortable').length;
    
    //Activity 14, assign redundant role=list, to opening UL
    //make the UL keyboard focusable, and attach the instruction 
    //with aria-labelledby="[instruction div id]" so keyboard 
    //navigation details are announced when the list initially 
    //receives focus while using a screen reader. 
		$elem = this.element.attr({
			'id': id,
      'role': 'list',
      'tabindex': 0,
      'aria-labelledby': id + '_instructions'
		  })
		.wrap('<div class="ik_sortable"></div>').before(plugin.temp);
			
		total = $elem.children('li').length;
		
    //Activity 14, generate the <div> that will contain 
    //instr. and add aria-hidden=true to hid it by dflt from reader 
    $('<div/>') // add div element to be used with aria-describedby attribute of the menu
      .text(plugin.options.instructions) // get instruction text from plugin options
      .addClass('ik_readersonly') // hide element from visual display
      .attr({
          'id': id + '_instructions',
          'aria-hidden': 'true'  // hide element from screen readers to prevent it from being read twice
         })     
       .appendTo($elem);
    	
		plugin.items = $elem.children('li').each( function(i, el) {
			
      //Activity 14, draggable below, add a redundatn role=listitem
      //generate a label for each item that describes the list item's current position and that that list item is 'movable'
      //set tabindex=0 on the first list item, ensure a list item  
      //is focusable by default
			$(el).attr({
				'draggable': true,
				'id': id + '_' + i,
        'role': 'listitem',
        'aria-label': $(el).text() + ' ' + (i + 1) + ' of ' + total + ' movable',
        'tabindex': i > 0 ? -1 : 0
			});
		})
    
    //Activity 14, where draggable attributes are defined near 
    //the end of the init function, attach a keydown reference to 
    //the onKeyDown function to make the list draggable with a keyboard 
		.on('dragstart', {'plugin': plugin}, plugin.onDragStart)
		.on('drop', {'plugin': plugin}, plugin.onDrop)
		.on('dragend', {'plugin': plugin}, plugin.onDragEnd)
		.on('dragenter', {'plugin': plugin}, plugin.onDragEnter)
		.on('dragover', {'plugin': plugin}, plugin.onDragOver)
		.on('dragleave', {'plugin': plugin}, plugin.onDragLeave)
    .on('keydown', {'plugin': plugin}, plugin.onKeyDown);
		
		
	};
	
	// dragged item
	
	Plugin.prototype.onDragStart = function (event) {
		
		var plugin, $me;
				
		plugin = event.data.plugin;
		event = event.originalEvent || event;
		$me = $(event.currentTarget);
		
		event.dataTransfer.effectAllowed = 'move';
		event.dataTransfer.setData('text', $me.attr('id'));
		
	};
	
	Plugin.prototype.onDrop = function (event) {
		
		var source_id, $me;
		
		event = event.originalEvent || event;
		event.preventDefault();
		event.stopPropagation();
		$me = $(event.currentTarget);
		
		source_id = event.dataTransfer.getData('text');
		
		if(source_id != $me.attr('id')) {
			
			if ($me.hasClass('dropafter')) {
				$me.after($('#' + source_id));
			} else {
				$me.before($('#' + source_id));
			}
			
		}
		
	};
	
	Plugin.prototype.onDragEnd = function (event) {
		
		var plugin;
				
		plugin = event.data.plugin;
		plugin.element.find('.dragover').removeClass('dragover');
		
	};
	
	// drop target
	
	Plugin.prototype.onDragEnter = function (event) {
		
		$(event.currentTarget).addClass('dragover');
		
	};
	
	Plugin.prototype.onDragOver = function (event) {
		
		var $me, y, h;
		
		event = event.originalEvent || event;
		event.preventDefault();
		event.dataTransfer.dropEffect = 'move';
		
		$me = $(event.currentTarget);
		
		y = event.pageY - $me.offset().top;
		h = $me.outerHeight();
		
		$me.toggleClass('dropafter', y > h / 2);
		
	};
	
	Plugin.prototype.onDragLeave = function (event) {
		
		$(event.currentTarget).removeClass('dragover');
		
	};
	
	Plugin.prototype.resetNumbering = function (plugin) {
		
		plugin.items = plugin.element.children('li');
		
		plugin.items.each( function(i, el) {
			var $me = $(el);
      //Activity 14, update the label for moved items to reflect 
      //their new position in the list using aria-label="[new posiion]"
      $me.attr({
          'aria-label': $me.text() + ' ' + (i + 1) + ' of ' + plugin.items.length + ' movable'
      });
      
    });  //end of function plugin items each
		
	}  //end of resetNumbering
  
  //Activity 14, for the sortable list, defines up and down arrow keys, along iwth a roving tabindex. W3C has not yet created a best practice for authoring keyboard interaction for drag and drop elements
  Plugin.prototype.onKeyDown = function (event) {
 
        var plugin, $me, currIndex, nextIndex;
       
        plugin = event.data.plugin;
        $me = $(event.currentTarget);
        currentIndex = plugin.items.index(event.currentTarget);
           
        switch (event.keyCode) {
           
            case ik_utils.keys.down:
               
                plugin.items.attr({'tabindex': -1});
               
                if(currentIndex < plugin.items.length - 1) {
                    if(event.ctrlKey || event.metaKey) { // move item down
                        $me.insertAfter( $me.next() );
                        $me.attr({'tabindex': 0}).focus();
                        plugin.resetNumbering(plugin);
                    } else { // move focus to the next item
                        $me.next().attr({'tabindex': 0}).focus();
                    }
                }
               
                break;
           
            case ik_utils.keys.up:
               
                plugin.items.attr({'tabindex': -1});
               
                if(currentIndex > 0) {
                    if(event.ctrlKey || event.metaKey) { // move item up
                        $me.insertBefore( $me.prev() );
                        $me.attr({'tabindex': 0}).focus();
                        plugin.resetNumbering(plugin);
                    } else { // move focus to the previous item
                        $me.prev().attr({'tabindex': 0}).focus();
                    }
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
