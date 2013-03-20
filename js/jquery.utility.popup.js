/**
 * Popup widget
 *
 * Usage: 
 *   $('#popup').popup({ trigger: '#button' });
 *   $('body').popup({ trigger: '#button', partial: 'partial:name' });
 */

;(function ($, window, document, undefined) {

	$.widget("utility.popup", {
		version: '1.2.5',
		options: {
			on_open:           null,           // Callback when popup opens
			on_close:          null,           // Callback when popup closes
			trigger:           null,           // Trigger to open
			extra_close:       '.popup_close', // Trigger to close
			show_close:        true,           // Show the X to close
			close_on_bg_click: true,           // If you click background close popup?
			move_to_element:   false,          // Move the popup to another element
			size:              null,           // Options: small, medium, large, xlarge, expand
			animation:         'fadeAndPop',   // Options: fade, fadeAndPop, none
			animation_speed:   300,            // Animate speed in milliseconds
			auto_reveal:       false,          // Show popup when page opens?
			
			// PHPR Specific
			action:            'on_action',    // PHPR AJAX Action
			partial:           null,           // Dynamically load a PHPR partial
			partial_data:      null,           // Data to send along with the PHPR partial request
			cache_partial:     false           // Cache the PHPR partial content
		},

		// Internals
		_partial_container_id: null,
		_partial_name: null,
		_partial_loaded: false,
		_reveal_options: { },

		_init: function () {
			if (this.element.is('body')) {
				var new_element = $('<div />').appendTo('body');
				new_element.popup(this.options);
				return;
			}

			this._reveal_options = {
				animation: this.options.animation,
				animationspeed: this.options.animation_speed,
				closeOnBackgroundClick: this.options.close_on_bg_click,
				dismissModalClass: 'close-reveal-modal'
			};

			this._partial_name = this.options.partial;

			this._build();
		},

		destroy: function () {
			$.Widget.prototype.destroy.call(this);
		},

		_build: function() {

			var self = this;

			this.element.addClass('reveal-modal');
			if (this.options.size)
				this.element.addClass(this.options.size);

			// Popup opening
			if (this.options.trigger) {
				var trigger = $(this.options.trigger);
				trigger.die('click').live('click', function() {
					self._handle_partial($(this));
					self.open_popup($(this));
				});
			}

			// Popup closing
			this.element.find(this.options.extra_close).die('click').live('click', function() {
				self.element.trigger('reveal:close');
			});

			// Add close cross
			var close_cross = $('<a />').addClass('close-reveal-modal').html('&#215;');
			close_cross.appendTo(this.element);

			// Move the popup to a more suitable position
			if (this.options.move_to_element)
				this.element.prependTo($(this.options.move_to_element));  

			// Auto reveal
			if (this.options.auto_reveal) {
				self._handle_partial($(this));
				self.open_popup($(this));
			}

		},

		// Service methods
		// 

		open_popup: function(triggered_by) { var self = this;

			// Open event
			this.options.on_open && this.element.unbind('reveal:open').bind('reveal:open', this.options.on_open.apply(this, [triggered_by]));

			// Close event
			this.options.on_close && this.element.unbind('reveal:close').bind('reveal:close', this.options.on_close.apply(this, [triggered_by]));
			
			this.element.reveal(this._reveal_options);
			
			// Reset cache if necessary
			this.element.bind('reveal:close', function(){ 
				if (!self.options.cache_partial)
					self.reset_cache();
			}); 

		},

		close_popup: function() { 
			this.element.trigger('reveal:close'); 
		},

		// Partial Loading
		// 

		reset_cache: function() {
			$('#'+this._partial_container_id).attr('rel', '');
			this._partial_loaded = false;
		},

		_handle_partial: function(triggered_by) { var self = this;
			var inline_partial = triggered_by.data('partial');
			this._partial_name = (inline_partial) ? inline_partial : this.options.partial;

			if (this._partial_name) {
				this._partial_build_container();
				
				var container_id = '#' + this._partial_container_id,
					update_object = { }; 
					update_object[container_id] = this._partial_name;

				// Halt here for partial cache
				if (this.options.cache_partial && this._partial_loaded) {
					// @todo This will pollute the DOM with it's leftover
					// reveal containers, should clean these up
					$(container_id).appendTo(this.element);
					return;
				}
				
				// Add ajax loader
				$(container_id).empty().append($('<div />').addClass('reveal-loading'));
				
				// Request partial content
				$('<form />').sendRequest(self.options.action, { 
					update: update_object, 
					extraFields: this.options.partial_data,
					onSuccess: function() { 
						$(container_id)
							.addClass('partial-content-loaded')
							.attr('rel', self._partial_name);

						self._partial_loaded = true;
					}
				});
			}

		},

		_partial_build_container: function() {

			// Look for a cached partial container
			if (this.options.cache_partial) {
				var existing_partial = $('div[rel="'+this._partial_name+'"]');
				if (existing_partial.length > 0 && existing_partial.hasClass('partial-reveal-modal')) {
					this._partial_container_id = existing_partial.attr('id');
					this._partial_loaded = true;
					return;
				}
			}

			// Container ID not found
			if (!this._partial_container_id) {
				var random_number = (Math.floor((Math.random() * 100)) % 94) + 33;
				this._partial_container_id = 'reveal-content'+random_number;
			}

			// Container not found, create
			if ($('#'+this._partial_container_id).length == 0) {
				$('<div />').addClass('partial-reveal-modal')
					.attr('id', this._partial_container_id)
					.appendTo(this.element);
			}
		}

	});

})( jQuery, window, document );