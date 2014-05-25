var template = require('./template');
var scrolltop = require('scrolltop');
var Emitter = require('emitter');
var classes = require('classes');
var indexOf = require('indexof');
var keyname = require('keyname');
var prevent = require('prevent');
var domify = require('domify');
var events = require('events');
var query = require('query');
var text = require('text');
  
/**
 * Select constructor
 */

function Combo (options) {
  if (!(this instanceof Combo)) return new Combo(options);
  
  this.options = {};
  this.selectable = [];
  
  this.closed = true;
  this.value = null;
  
  this.placeholder = options.placeholder || '';
  this.searchable = options.search;
  
  this.render();
  this.bind();
}

/**
 * Inherit from emitter
 */

Emitter(Combo.prototype);

/**
 * Render html
 */

Combo.prototype.render = function () {  
  this.el = domify(template);
  
  this.list = query('.options', this.el);
  this.input = query('.search', this.el);
  this.label = query('.label', this.el);
  
  this.events = events(this.el, this);
  this.winEvents = events(window, this);
  this.classes = classes(this.el);
  
  text(this.label, this.placeholder);
  
  // search enabled
  if (this.searchable) {
    this.addClass('searchable');
  }
};

/**
 * Bind events
 */

Combo.prototype.bind = function () {
  this.events.bind('mousedown .label', 'toggle');
  this.events.bind('change .search', 'onkeyup');
  this.events.bind('mousedown', 'stop');
  this.events.bind('mouseup', 'stop');
  this.events.bind('mouseover .option');
  this.events.bind('mouseup .option');
  this.events.bind('keyup .search');
  this.events.bind('keypress');
  this.events.bind('keydown');
  return this;
};

/**
 * Unbind events
 */

Combo.prototype.unbind = function () {
  this.events.unbind();
  return this.unbindOutside();
};

/**
 * Bind window events
 */

Combo.prototype.bindOutside = function () {
  this.winEvents.bind('scroll', 'reposition');
  this.winEvents.bind('resize', 'reposition');
  this.winEvents.bind('mousedown', 'close');
  this.winEvents.bind('mouseup', 'close');
  return this;
};

/**
 * Unbind window events
 */

Combo.prototype.unbindOutside = function () {
  this.winEvents.unbind();
  return this;
};

/**
 * Stop propagation
 */

Combo.prototype.stop = function () {
  this.clicked = true;
};

/**
 * Handle `mouseup` events
 */

Combo.prototype.onmouseup = function (e) {
  var el = e.delegateTarget;
  var val = el.getAttribute('data-value');
  this.select(val);
};

/**
 * Handle `mouseover` events
 */

Combo.prototype.onmouseover = function (e) {
  var el = e.delegateTarget;
  var val = el.getAttribute('data-value');
  this.highlight(val);
};

/**
 * Handle `keyup` events
 */

Combo.prototype.onkeyup = function () {
  this.filter(this.input.value);
};

/**
 * Handle `keypress` events
 */

Combo.prototype.onkeypress = function (e) {
  if (!this.closed) return;
  
  var key = e.keyCode
  var c = String.fromCharCode(key);
    
  if (!/\w/.test(c)) return;
  
  this.input.value = c;
  this.open();
  this.filter(c);
  
  prevent(e);
};

/**
 * Handle `keydown` events
 */

Combo.prototype.onkeydown = function (e) {
  var key = e.keyCode;
  var current = this.highlighted || this.value;
  
  switch (keyname(key)) {
    case 'tab':
    case 'esc':
      this.close();
      break;
    case 'enter':
      prevent(e);
      this.select(current);
      break;
    case 'left':
    case 'right':
      this.open();
      break;
    case 'up':
      prevent(e);
      this.navigate(-1);
      break;
    case 'down':
      prevent(e);
      this.navigate(1);
      break;
  }
};

/**
 * Add option
 */

Combo.prototype.add = function (value, text, selected) {
  var el = document.createElement('li');
  
  el.className = 'option selectable';
  el.setAttribute('data-value', value);
  el.innerHTML = text;
  
  this.options[value] = el;
  this.selectable.push(value.toString());
  this.list.appendChild(el);
  
  if (!(this.placeholder || this.value) || selected) {
    this.select(value);
  }
  
  this.emit('add', value);
  
  return this;
};

/** 
 * Remove option
 */

Combo.prototype.remove = function (value) {
  var el = this.options[value];
  this.list.removeChild(el);
  delete this.options[value];
  var i = indexOf(selectable, value.toString());
  if (~i) this.selectable.splice(i, 1);
  this.emit('remove', value);
  return this;
};

/**
 * Move highlight `n` positions
 */

Combo.prototype.navigate = function (n) {
  if (this.closed) return this.open();
  
  var selectable = this.selectable;
  var i = indexOf(selectable, this.highlighted) + n;
  
  if (selectable.length > i && i >= 0) {
    var value = selectable[i];
    this.highlight(value);
  }
  
  return this;
};

/**
 * Highlight option with the given value
 */

Combo.prototype.highlight = function (value) {
  var focus = query('.focus', this.list);
  var option = this.options[value];
  
  if (!option) return this;
  if (focus) classes(focus).remove('focus');
  classes(option).add('focus');
  
  this.highlighted = value.toString();
  this.scrollTo(value);
  
  return this.emit('focus', value);
};

/**
 * Select option with the given value
 */

Combo.prototype.select = function (value) {
  var option = this.options[value];
  if (!option) return this;
  
  var selected = query('.selected', this.list);
  if (selected) classes(selected).remove('selected');
  classes(option).add('selected');
  
  this.label.innerHTML = option.innerHTML;
  this.value = value.toString();
  
  this.emit('select', value);
  return this.close();
};

/**
 * Scroll to option with the given value
 */

Combo.prototype.scrollTo = function (value) {  
  var option = this.options[value];
  if (!option) return this;
  
  var list = query('.list', this.el);
  var lh = list.clientHeight;
  var lt = list.scrollTop;
  var lb = lt + lh;
  
  var oh = option.offsetHeight;
  var ot = option.offsetTop;
  
  if (ot + oh > lb) {
    list.scrollTop = ot + oh - lh;
  } else if (ot < lt) {
    list.scrollTop = ot;
  }
  
  return this;
}

/**
 * Reposition combobox
 */

Combo.prototype.reposition = function () {
  if (this.closed) return this;
  
  var wt = scrolltop();
  var wb = wt + window.innerHeight;
  var lh = this.label.offsetHeight;
  var lt = offset(this.el);
  var inner = query('.inner', this.el);
  var ih = inner.offsetHeight;
  
  // south
  if (lt + lh + ih <= wb) {
    this.addClass('south');
    this.removeClass('north');  
    this.emit('position', 'south');
    return this;
  }
  
  // north
  this.addClass('north');
  this.removeClass('south');
  this.emit('position', 'north');
  return this;
};

/**
 * Filter options by text
 */

Combo.prototype.filter = function (filter) {
  var reg = new RegExp(filter || '', 'i');
  var selectable = this.selectable = [];
  
  for (var i in this.options) {
    var option = this.options[i];
    
    if (reg.test(option.innerHTML)) {
      selectable.push(i);
      classes(option).add('selectable');
    } else {
      classes(option).remove('selectable');
    }
  }
  
  this.rehighlight();
  this.emit('filter', filter);
  
  return this;
};

/**
 * Refocus if the element in focus is unselectable
 */

Combo.prototype.rehighlight = function () {
  var selectable = this.selectable;
  
  // highlighted is selectable
  if (~indexOf(selectable, this.highlighted)) {
    return this.scrollTo(this.highlighted);
  }
  
  // nothing is selectable
  if (!selectable.length) {
    return this.highlight(null);
  }
  
  return this.highlight(selectable[0]);
};

/**
 * Open combobox
 */

Combo.prototype.open = function () {
  var self = this;
  if (!this.closed) return this;
  this.closed = false;
  this.classes.add('open');
  this.classes.remove('closed');
  this.bindOutside();
  this.highlight(this.value);
  this.reposition();
  this.emit('open');
  
  setTimeout(function () {
    self.input.focus();
  }, 50);
  
  return this;
};

/**
 * Close combobox
 */

Combo.prototype.close = function () {
  if (this.closed) return this;
  
  // don't close when click is inside
  if (this.clicked) {
    this.clicked = false;
    return this;
  }
  
  this.closed = true;
  this.classes.add('closed');
  this.classes.remove('open');
  this.el.focus();
  this.unbindOutside();
  this.emit('close');
  return this;
};

/**
 * Toggle combobox visibility
 */

Combo.prototype.toggle = function () {
  return this.closed
    ? this.open()
    : this.close();
};

/**
 * Append combobox to el
 */

Combo.prototype.appendTo = function (el) {
  el.appendChild(this.el);
  return this;
};

/**
 * Add class to combobox
 */

Combo.prototype.addClass = function (name) {
  this.classes.add(name);
  return this;
};

/**
 * Remove class from combobox
 */

Combo.prototype.removeClass = function (name) {
  this.classes.remove(name);
  return this;
};

/**
 * Get element offset
 */

function offset (el, to) {
  var parent = el;
  var top = el.offsetTop;
  
  while (parent = parent.offsetParent) {
    top += parent.offsetTop;
    if (parent == to) return top;
  }
  
  return top;
}

module.exports = Combo;