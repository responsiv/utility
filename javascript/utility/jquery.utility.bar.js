
/**
 * Popup widget
 *
 * Usage: 
 *   $('#popup').popup({ trigger: '#button' });
   * $('body').popup({ trigger: '#button', partial: 'partial:name' });
 */

;(function ($, window, document, undefined) {

    $.widget("utility.bar", {
        version: '1.0',
        options: {
            inject_to:  'body', // Element to prepend bar to
            message:    '',     // Message to display in bar
            context:    'info', // Message context (info, error, success, notice)
            position:   'top',  // Bar location
            show_close: false,  // Show the X to close 
            time:       2000    // Duration
        },

        _timer: null,
        _bar: null,
        _message: null,
        _close_link: null,
        _is_visible: false,

        _create: function () { var _this = this;
            this._message = $('<span />')
                .addClass('bar-content');

            this._bar = $('<div />')
                .addClass('utility-bar')
                .addClass(this.options.context)
                .addClass((this.options.position == 'bottom') ? 'bar-bottom' : 'bar-top');

            if (this.options.show_close) {
                this._close_link = $('<a />')
                    .addClass('bar-close')
                    .click(function() { _this.remove_message(); });
            } else {
                this._bar
                    .css('cursor', 'pointer')
                    .click(function() { _this.remove_message(); });
            }

            this._bar
                .append(this._message)
                .append(this._close_link)
                .hide()
                .prependTo(this.options.inject_to);
        },

        _setOption: function(key, value) {
            switch (key) {
                case "context":
                    this._bar
                        .removeClass('info success warning error')
                        .addClass(value);
                    break;
            }
            this.options[key] = value;
        },

        destroy: function () { 
            $.Widget.prototype.destroy.call(_this);
        },

        show_message: function(message, params) { var _this = this; 
            this._set_timer();
            this._message.html(message);
            this._bar.stop().fadeIn('fast', function() {
                _this._is_visible = true;
            });
        },

        _set_timer: function() { var _this = this;
            if (this._timer)
                this._clear_timer();

            this._timer = setTimeout(function() { _this.remove_message(); }, this.options.time);
        },

        _clear_timer: function() {
            clearTimeout(this._timer);
        },

        remove_message: function() { var _this = this; 
            if (_this._is_visible) {
                _this._clear_timer();
                _this._bar.stop().fadeOut('fast', function() {
                    _this._is_visible = false;
                });
            }
        }

    });

})( jQuery, window, document );
