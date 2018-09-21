(function () {
  "use strict";

  var dom = {
    /**
     * Indicates if the dom is ready
     */
    isReady: false,
    /**
     * Callback functions to execute when the dom is ready
     */
    callbacks: [],
    /**
     * Event triggered when the DOM is ready
     */
    onDomReady: function onDomReady() {
      if (this.isReady) {
        return;
      }
      this.isReady = true;
      var i, l;
      for (i = 0, l = this.callbacks.length; i < l; i += 1) {
        this.callbacks[i]();
      }
      this.callbacks.length = 0;
    },

    /**
     * Register a function to execute when the dom is ready
     * @param {Function} fn Function to register
     */
    ready: function ready(fn) {
      if (this.isReady) {
        fn();
        return;
      }
      this.callbacks.push(fn);
    },

    /**
     * Listen the dom ready event
     */
    listen: function listen() {
      function fireDomReady() {
        dom.onDomReady();
      }
      if (document.addEventListener) {
        document.addEventListener("DOMContentLoaded", fireDomReady, false);
      } else if (document.all && !window.opera) {
        document.write('<script type="text/javascript" id="contentloadtag" defer="defer" src="javascript:void(0)"><\/script>');
        var contentloadtag = document.getElementById("contentloadtag");
        contentloadtag.onreadystatechange = function onReadyState() {
          if (this.readyState === "complete") {
            fireDomReady();
          }
        }
      } else {
        var backupOnLoad = window.onload;
        window.onload = function () {
          setTimeout(fireDomReady, 0);
          if (typeof backupOnLoad === "function") {
            backupOnLoad();
          }
        }
      }
    }
  };

  /**
   * Add event listener in DOMElement
   *
   * @param {HTMLElement} obj HTMLElement which should be listen
   * @param {String} type Type of the event to listen
   * @param {Function} fn Callback function
   */
  function addEvent(obj, type, fn) {
    if (typeof obj.addEventListener === 'function') {
      obj.addEventListener(type, fn, false);
    } else if (obj.attachEvent) {
      obj['e' + type + fn] = fn;
      obj[type + fn] = function () {
        obj['e' + type + fn].call(obj, window.event);
      }
      obj.attachEvent('on' + type, obj[type + fn]);
    }
  }

  /**
   * Trigger the DOM event
   *
   * @param {HTMLElement} obj HTMLElement to trigger the event on
   * @param {String} type Type of the event to trigger
   */
  function triggerEvent(obj, type) {
    // This a little ugly for the moment only register the change event to
    // be an HTMLEvents, all other are consider as MouseEvents
    // we can refine this function if needed
    var eventType = (type === 'change') ? 'HTMLEvents' : 'MouseEvents';
    if (document.createEvent) {
      var evt = document.createEvent('HTMLEvents');
      evt.initEvent(type, true, false);
      obj.dispatchEvent(evt);
    } else if (document.createEventObject) {
      obj.fireEvent('on' + type);
    } else if (typeof obj['on' + type] == 'function') {
      obj['on' + type]();
    }
  }

  /**
   * Indicates if the current object is an array
   * @param {Object} object Object to test
   * @return {Boolean} Returns true when the object is an array
   */
  function isArray(object) {
    // Native isArray from the Array.prototype
    if (Array.isArray) {
      return Array.isArray(object);
    }

    // Legacy browser
    if (typeof object === "object" && object.toString() === "[object Array]") {
      return true;
    }

    // Very old legacy browser
    // "duck checking"
    if (typeof object !== "object") {
      return false;
    }
    return "length" in object && typeof object.push === 'function' && typeof object.join === 'function' && typeof object.sort === 'function';
  }

  /**
   * Iterate on array and break if at least return true
   * @param {Array} array Array
   * @param {Function} fn Function to execute at each iteration
   * @param {Object} [scope] Scope of the method
   * @return {Boolean} Return true when at least one of the callback call return true
   */
  function some(array, fn, scope) {

    // Native `some` from the Array.prototype
    if (Array.prototype.some) {
      return Array.prototype.some.call(array, fn, scope);
    }

    // Legacy browser
    var i, l;
    for (i = 0, l = array.length; i < l; i += 1) {
      if (fn.call(scope, array[i], i, array)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Iterate on array and break if at least one return false
   * @param {Array} array Array
   * @param {Function} fn Function to execute at each iteration
   * @param {Object} [scope] Scope of the method
   * @return {Boolean} True when all callback return true
   */
  function every(array, fn, scope) {

    // Native `every` from the Array.prototype
    if (Array.prototype.every) {
      return Array.prototype.every.call(array, fn, scope);
    }

    // Legacy browser
    var i, l;
    for (i = 0, l = array.length; i < l; i += 1) {
      if (!fn.call(scope, array[i], i, array)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Iterate on array
   * @param {Array} array Array
   * @param {Function} fn Function to execute at each iteration
   * @param {Object} [scope] Scope of the method
   */
  function forEach(array, fn, scope) {

    // Native forEach from the Array.prototype
    if (Array.prototype.forEach) {
      Array.prototype.forEach.call(array, fn, scope);
      return;
    }

    // Legacy browser
    var i, l;
    for (i = 0, l = array.length; i < l; i += 1) {
      fn.call(scope, array[i], i, array);
    }
  }

  /**
   * Filter the array
   * When the callback function return true the item is pushed on the returned array
   * @param {Array} array Array
   * @param {Function} fn Function to execute at each iteration
   * @param {Object} [scope] Scope of the method
   * @return {Array} Fitlered array
   */
  function filter(array, fn, scope) {

    // Native fitler
    if (Array.prototype.filter) {
      return Array.prototype.filter.call(array, fn, scope);
    }

    // Legacy browser
    var res = [],
      i, l;
    for (i = 0, l = array.length; i < l; i += 1) {
      if (fn.call(scope, array[i], i, array)) {
        res.push(array[i]);
      }
    }
    return res;
  }

  /**
   * Clone object or array
   * @param {Object|Array} o Element to clone
   * @return {Object|Array} Clone
   */
  function clone(o) {
    var theClone, prop;
    if (isArray(o)) {
      theClone = [];
      forEach(o, function push(item) {
        theClone.push(clone(item));
      });
    } else if (typeof o === "object") {
      theClone = {};
      for (prop in o) {
        if (o.hasOwnProperty(prop)) {
          theClone[prop] = clone(o[prop]);
        }
      }
    } else {
      theClone = o;
    }

    return theClone;
  }
    
    /**
   * Sort the array alphabetically matching the beginning of string then alphabetically for contained text object or array
   * @param {Object|Array} input the first input to search
   */
    function sortInputFirst(input, data, index, searchPhonetic) {
        var first = [];
        var others = [];
        for (var i = 0; i < data.length; i++) {
          if (searchPhonetic === 'yes' && (data[i][index].withoutAccent().toLowerCase().indexOf(input.withoutAccent().toLowerCase()) == 0)) {
                first.push(data[i]);
          } else if (searchPhonetic === 'no' && (data[i][index].toLowerCase().indexOf(input.toLowerCase()) == 0)) {
                first.push(data[i]);
          } else {
                others.push(data[i]);
          }
        }
        return(first.concat(others));
    }
    
    /**
   * Replace the accent by the non accent version and replace y by i for phonetic search
   */
    String.prototype.withoutAccent = function(){
        // Array accents
		var pattern_accent = new Array(/À/g, /Á/g, /Â/g, /Ã/g, /Ä/g, /Å/g, /Æ/g, /Ç/g, /È/g, /É/g, /Ê/g, /Ë/g,
		/Ì/g, /Í/g, /Î/g, /Ï/g, /Ð/g, /Ñ/g, /Ò/g, /Ó/g, /Ô/g, /Õ/g, /Ö/g, /Ø/g, /Ù/g, /Ú/g, /Û/g, /Ü/g, /Ý/g,
		/Þ/g, /ß/g, /à/g, /á/g, /â/g, /ã/g, /ä/g, /å/g, /æ/g, /ç/g, /è/g, /é/g, /ê/g, /ë/g, /ì/g, /í/g, /î/g,
		/ï/g, /ð/g, /ñ/g, /ò/g, /ó/g, /ô/g, /õ/g, /ö/g, /ø/g, /ù/g, /ú/g, /û/g, /ü/g, /ý/g, /ý/g, /þ/g, /ÿ/g);
 
		// Array without accents
		var pattern_replace_accent = new Array("A","A","A","A","A","A","A","C","E","E","E","E",
		"I","I","I","I","D","N","O","O","O","O","O","O","U","U","U","U","I",
		"b","s","a","a","a","a","a","a","a","c","e","e","e","e","i","i","i",
		"i","d","n","o","o","o","o","o","o","u","u","u","u","i","i","b","i");
        
        var my_string = this;
 
		//For each caracters if accent remplace it by his non accent version
		for(var i=0;i<pattern_accent.length;i++){
			my_string = my_string.replace(pattern_accent[i],pattern_replace_accent[i]);
		}
		return my_string;
    }

  /**
   * Shim string.prototype.trim
   */
  if (!String.prototype.trim) {
    String.prototype.trim = function trim() {
      return this.replace(/^\s+|\s+$/gm, '');
    };
  }


  /**
   * Set the options in the specified select box
   *
   * Polyfill is to fix an IE bug with the select.innerHTML which act as an select.innerText
   *
   * @param {HTMLElement} element Select box element
   * @param {String} options Options as string
   */
  var setSelectOptions = (function () {
    var selectTest = document.createElement("ul");
    selectTest.innerHTML = "<li>test</li>";
    if (!/^<li>/gi.test(selectTest.innerHTML)) {
      return function setSelectOptionsIEFix(element, options) {
        var div = document.createElement("div");
        div.innerHTML = "<ul>" + options + "</ul>";
        var child = div.childNodes[0].options;
        element.innerHTML = "";
        forEach(child, function appendOptions(option) {
          element.appendChild(option.cloneNode(true));
        });
      };
    }

    // Normal browser
    return function setSelectOptionsModern(element, options) {
      element.innerHTML = options;
    };

  }());


  /**
   * Throw an error
   * @param {String} message Message of the error
   */
  function throwError(message) {
    alert(message);
    throw new Error(message);
  }

  /**
   * Enumerate the type of search
   * @type {{none: number, autoGenerate: number, custom: number, filtered: number}}
   */
  var searchType = {
    /**
     * No search
     */
    none: 0,
    /**
     * Auto-generate the input search
     */
    autoGenerate: 1,
    /**
     * Use custom input search
     */
    custom: 2,
    /**
     * Use filtered input search
     */
    filtered: 3
  };

  var filterFirstLevel = "";
  var searchSeparator = "";
  var searchResult = 0;

  /**
   * Creates a new instance of the hierarchy
   *
   * Use the the following page to generate the dictionary:
   * http://www.askia.com/Downloads/dev/adc/hierarchy/CSVConverter.html
   *
   * @param {Object} options Options of the hierarchy
   * @param {Array} options.database Database
   * @param {String} options.instanceId Id of the ADC instance
   * @param {Array} options.values Field to save
   * @param {String} [options.prefix] Prefix of the inputs result
   * @param {Number} [options.maxResults=0] Indicates the maximum number of results to display (set 0 for unlimited)
   * @param {Boolean} [options.firstLevelVisible=false] Indicates if the first level is visible
   * @param {Number} [options.useSearch=0] Use the search box (0: no search, 1: auto-generated search, 2: custom search box), if not then the first level is implicitly visible
   * @param {String} [options.customSearchId=''] When useSearch=2, specified the id of the input search
   * @param {Number} [options.minChars=0] Indicates the minimum number of characters before to start the search
   * @param {Array} [options.searchIn] Search fields
   * @param {Boolean} [options.searchAtBeginning=false] Search at the beginning of each words
   * @param {String} [options.searchSeparator='+'] Separator to split search value
   * @param {Boolean} [options.dropdowns=false] Uses dropdowns and not list
   * @param {Array<String>} [options.blankOptions=null] Blank option for each levels
   * @param {String} [options.visibility=null] Class to add/remove on selection
   * @param {Boolean} [options.autoSelect=false] Auto-select the next level when only one result
   */
  function Hierarchy(options) {
    this.cache = {};
    this.currentValue = '';
    this.options = options;
    this.prefix = options.prefix || "";
    this.minChars = options.minChars || 0;
    this.maxResults = (options.maxResults && options.maxResults > 0) ? options.maxResults : 0;
    this.useSearch = options.useSearch || 0;
    this.filterFirstLevel = options.filterFirstLevel || '';
    this.customSearchId = options.customSearchId || '';
    this.firstLevelVisible = options.firstLevelVisible || false;
    if (!this.useSearch) {
      this.firstLevelVisible = true; // Enforce the first level to be visible in that case
    }
    this.dropdowns = options.dropdowns || false;
    this.visibility = options.visibility || null;
    this.autoSelect = options.autoSelect || false;
    this.searchAtBeginning = options.searchAtBeginning || false;
    this.searchSeparator = options.searchSeparator || '+';
    this.currentQuestion = options.currentQuestion || '';
    this.noMatchFound = options.noMatchFound || '';
    this.sortFirst = options.sortFirst;
    this.searchPhonetic = options.searchPhonetic;

    filterFirstLevel = options.filterFirstLevel;
    searchSeparator = options.searchSeparator;

    // Register the initialization when the dom is ready
    var self = this;
    dom.ready(function init() {
      self.initialize();
    });
  }

  /**
   * Display the help when an error occurred with the database format
   */
  Hierarchy.prototype.displayDatabaseError = function displayHelp() {
    var container = document.getElementById("hierarchy_search_container_" + this.instanceId),
      el, html = [];
    if (!container) {
      return;
    }
    html.push('Error using the Hierarchy ADC<br/>');
    html.push('The database of the `Hierarchy ADC` is based on CSV.');
    html.push('You may have to use the following page to convert the CSV to a Javascript database file');
    html.push('<br/><a target="_blank" href="http://www.askia.com/Downloads/dev/adc/hierarchy/CSVConverter.html">http://www.askia.com/Downloads/dev/adc/hierarchy/CSVConverter.html</a>');

    el = document.createElement("div");
    el.style.background = "#ffc0cb";
    el.style.color = "#ff0000";
    el.style.fontWeight = "bold";
    el.style.padding = "10px";
    el.style.margin = "15px";
    el.style.border = "2px solid #ff0000";

    el.innerHTML = html.join('<br/>');

    container.insertBefore(el, container.firstChild);
  };

  /**
   * Initialize the hierarchy when the dom is ready
   */
  Hierarchy.prototype.initialize = function initialize() {
    var options = this.options,
      elPrefix,
      self = this,
      searchId;

    if (!options) {
      return throwError("The parameters `options` is require");
    }

    // Instance Id
    if (options.instanceId === undefined || options.instanceId === null) {
      return throwError("The `options.instanceId` is require");
    }
    this.instanceId = options.instanceId;

    // Database
    if (!options.database) {
      this.displayDatabaseError();
      return throwError("The `options.database` is require");
    }

    // Header
    if (!options.database.header) {
      this.displayDatabaseError();
      return throwError("The `database.header` is require");
    }
    this.header = options.database.header;


    // Records
    if (!options.database.records) {
      this.displayDatabaseError();
      return throwError("The `database.records` is require");
    }
    if (!isArray(options.database.records)) {
      this.displayDatabaseError();
      return throwError("The `database.records` must be an array");
    }
    this.records = options.database.records;


    // Levels
    if (!options.database.levels) {
      this.displayDatabaseError();
      return throwError("The `database.levels` is require");
    }
    if (!isArray(options.database.levels)) {
      this.displayDatabaseError();
      return throwError("The `database.levels` must be an array");
    }
    this.levels = clone(options.database.levels);


    // Use search
    if (this.useSearch && !options.searchIn) {
      return throwError("The `options.searchIn` is require");
    }
    if (this.useSearch && !isArray(options.searchIn)) {
      return throwError("The `options.searchIn` must be an array");
    }
    if (this.useSearch && !options.searchIn.length) {
      return throwError("The `options.searchIn` must be a non-empty array");
    }
    if (this.useSearch === searchType.custom && !this.customSearchId) {
      return throwError("The `options.customSearchId` must be a non-empty string when the `options.useSearch` is custom (2)");
    }

    // Values
    if (!options.values) {
      return throwError("The `options.values` is require");
    }
    if (!isArray(options.values)) {
      return throwError("The `options.values` must be an array");
    }
    if (!options.values.length) {
      return throwError("The `options.values` must be a non-empty array");
    }
    this.values = options.values;


    // Blank options
    if (options.blankOptions && !isArray(options.blankOptions)) {
      return throwError("The `options.blankOptions` must be an array");
    }
    this.blankOptions = options.blankOptions;


    // Dropdowns
    if (this.dropdowns) {
      this.blankOptions = this.blankOptions || [];
    }


    // Manage the search box
    if (this.useSearch) {
      this.searchIn = options.searchIn;
      this.searchFieldIndexes = [];
      forEach(this.searchIn, function (search) {
        this.searchFieldIndexes.push(this.header[search]);
      }, this);
      searchId = (this.useSearch === searchType.custom) ? this.customSearchId : "hierarchy_search_" + this.instanceId;
      this.inputSearch = document.getElementById(searchId);
      if (!this.inputSearch) {
        return throwError("Could not find the `" + searchId + "` input");
      }

      addEvent(this.inputSearch, 'keyup', function () {
        self.search(this.value);
      });
      addEvent(this.inputSearch, 'search', function () {
        self.search(this.value);
      });
    }

    // Treat each level
    elPrefix = "hierarchy_level_" + this.instanceId + "_";
    forEach(this.levels, function forEachLevels(level, index) {
      var el = document.getElementById(elPrefix + index);

      if (!el) {
        throwError("Could not find the `" + elPrefix + index + "` input");
      }

      // Fix the blankOptions
      if (this.dropdowns && this.blankOptions.length <= index) {
        this.blankOptions[index] = "";
      }

      // Register the select of the level
      level.element = el;

      // Register all outputs that must be filled with the level selection
      if (level.liveValues) {
        level.outputs = [];
        forEach(level.liveValues, function (value) {
          level.outputs.push({
            fieldIndex: this.header[value],
            element: document.getElementById(this.prefix + value)
          });
        }, this);
      }

      // Load previous selection
      this.loadSelection(level, index);
        
        if (!Element.prototype.matches) {
            Element.prototype.matches = Element.prototype.msMatchesSelector;
        }

        // Add event listener
        addEvent(el, 'click', function (e) {
            var elemLi = e.srcElement;
            if (elemLi.tagName === "A") {
                elemLi = e.srcElement.parentElement;
            }
            self.onselect(index, elemLi.value);
            for (var i = 0, j = e.currentTarget.children.length; i < j; i++) {
                if (e.currentTarget.children[i].matches('li[selected="selected"]')) {
                    e.currentTarget.children[i].removeAttribute("selected");   
                }
            }
            if (!elemLi.matches('li[disabled="disabled"]')) elemLi.setAttribute('selected', 'selected');
        });
        addEvent(el, 'search', function (e) {
            var elemLi = e.srcElement;
            if (elemLi.tagName === "A") {
                elemLi = e.srcElement.parentElement;
            }
            self.onselect(index, elemLi.value);
            for (var i = 0, j = e.currentTarget.children.length; i < j; i++) {
                if (e.currentTarget.children[i].matches('li[selected="selected"]')) {
                    e.currentTarget.children[i].removeAttribute("selected");   
                }
            }
            if (!elemLi.matches('li[disabled="disabled"]')) elemLi.setAttribute('selected', 'selected');
        });

    }, this);

    // Global values
    this.outputs = [];
    forEach(this.values, function (value) {
      this.outputs.push({
        fieldIndex: this.header[value],
        element: document.getElementById(this.prefix + value)
      });
    }, this);
    
    // Manage Filter first level options
    if (this.useSearch === 3) {
        var search = document.querySelector("#hierarchy_search_" + this.instanceId);
        var selectedRow = '';
      
        if (filterFirstLevel === document.getElementById(this.levels[0].name).value && this.levels[1]) {
            selectedRow = document.getElementById(this.levels[1].name).value;
        }
        if (filterFirstLevel !== '') {
            search.value = filterFirstLevel + searchSeparator + selectedRow;
        }
    }

    // Trigger the search if the input search is not empty
    if (this.useSearch === 3 && this.inputSearch && this.inputSearch.value) {
      triggerEvent(this.inputSearch, 'keyup');
    }

  };

  /**
   * Search the string in the database
   * 
   * @param {String} value Value to search
   */
  Hierarchy.prototype.search = function search(value) {
    
    // Don't fire it twice
    if (this.currentValue === value) {
      return;
    }

    if (this.useSearch != 2) {
      this.clearLevels(0, value.length);
    }

    this.currentValue = value;

    if (value.length < this.minChars) {
      return;
    }

    var searchProcess;
    // Use the cache
    if (this.cache[value]) {
      searchProcess = this.cache[value];
      if (searchProcess.isDone) {
        this.done(searchProcess);
      }
      return;
    }

    this.cache[value] = new SearchProcess(this, value);
    searchProcess = this.cache[value];

    // Put it into a thread
    setTimeout(function searchAsynch() {
      searchProcess.search();
    }, 0);
  };


  /**
   * Manage asynchronous callback when a process was done
   * @param {SearchProcess} searchProcess
   */
  Hierarchy.prototype.done = function done(searchProcess) {
    // Verify if the search is still eligible 
    if (searchProcess.value !== this.currentValue) {
      return;
    }

    if (this.useSearch != 2) {
      this.clearLevels(0, true);
    }

    this.fillDropdown({
      level: this.levels[0],
      levelIndex: 0,
      records: searchProcess.results || [],
      triggerEvent: true
    });
  };

  /**
   * Create the array to fill with options
   *
   * @param {Number} levelIndex Index of the level
   */
  Hierarchy.prototype.createOptionsArray = function createOptionsArray(levelIndex) {
    var options = [];
    //if (this.dropdowns) {
    //  options.push('<li value="">' + this.blankOptions[levelIndex] + '</li>');
    //}
    return options;
  };

  /**
   * Update the visibility of the element
   *
   * @param {HTMLElement} element Element to update
   * @param {Boolean} [activate=false] Activate or not
   */
  Hierarchy.prototype.updateVisibility = function updateVisibility(element, activate) {
    switch (this.visibility) {
      case 'disabled':
        if (activate) {
          element.parentNode.removeAttribute('disabled', 'disabled');
          element.removeAttribute('disabled');
        } else {
          element.parentNode.setAttribute('disabled', 'disabled');
          element.setAttribute('disabled', 'disabled');
        }
        break;

      case 'hide':
        if (activate) {
          element.parentNode.className = '';
        } else {
          element.parentNode.className = 'hide';
        }
        break;
    }
  };

  /**
   * Load the selection using the uniqueKey
   *
   * @param {Object} level Level to load
   * @param {Number} levelIndex Index of the level
   */
  Hierarchy.prototype.loadSelection = function loadSelection(level, levelIndex) {
    var elementRef = document.getElementById(this.prefix + level.id),
      value = elementRef && elementRef.value || null,
      hasValue = (value !== null),
      levelIdIndex = this.header[level.id],
      previousLevelIndex = (levelIndex === 0) ? null : levelIndex - 1,
      previousLevel = (previousLevelIndex !== null) ? this.levels[previousLevelIndex] : null,
      previousValue = (previousLevel && document.getElementById(this.prefix + previousLevel.id) && document.getElementById(this.prefix + previousLevel.id).value) || null,
      previousLevelIdIndex = previousLevel && this.header[previousLevel.id],
      records = (previousLevel) ? previousLevel.records : this.records;

    // No value
    if (!hasValue) {
      if (levelIndex === 0) {
        this.resetFirstLevel();
      }
      return;
    }

    // Filter the results
    if (levelIndex === 0 && !this.firstLevelVisible) {
      records = filter(records, function (record) {
        return (record[levelIdIndex] === value);
      }, this);
    } else if (previousLevelIndex !== null && previousValue) {
      records = filter(records, function (record) {
        return (record[previousLevelIdIndex] === previousValue);
      }, this);
    }

    // No records found
    if (!records.length) {
      if (levelIndex === 0) {
        this.resetFirstLevel();
      }
      return;
    }

    this.fillDropdown({
      level: level,
      levelIndex: levelIndex,
      records: records,
      selectedValue: value
    });
  };

  /**
   * An option has been selected in the specified level
   * @param {Number} levelIndex Index of the level
   * @param {String} id Id of the selected item
   */
  Hierarchy.prototype.onselect = function onselect(levelIndex, id) {
    var levels = this.levels,
      level = levels[levelIndex],
      levelIdIndex = this.header[level.id],
      records = [],
      nextLevelIndex = levelIndex + 1,
      nextLevel = (nextLevelIndex < levels.length) ? levels[nextLevelIndex] : null,
      hasValue = (id !== "");
      
    var customsearch = document.querySelector("#hierarchy_search_container_" + this.instanceId + " #hierarchy_filtered_search_" + this.instanceId);
    var searchInput = document.querySelector("#hierarchy_search_container_" + this.instanceId + " #hierarchy_search_" + this.instanceId);
      
    if (levelIndex === 0 && this.useSearch === 3 && searchResult === 2) {
      // Manage Filter first level options
      document.querySelector("#hierarchy_search_container_" + this.instanceId + " .hierarchy-search-result-container div:first-child").style.display = "none";
      searchInput.style.display = "none";
      customsearch.style.display = "";
      customsearch.addEventListener("input", (function (passedInElement) {
        return function (e) {
          setAndDispatch(e, passedInElement);
        };
      }(this)));
    }


    // Clear all inputs from the child
    if (nextLevel) {
      this.clearLevels(nextLevelIndex);
    }

    // Filter the results
    if (hasValue) {
      records = filter(level.records, function (record) {
        return (record[levelIdIndex] == id);
      }, this);
    }

    if (level.outputs) {
      this.setValues(level.outputs, (hasValue && records[0]));
    }

    if (!nextLevel) {
      if (this.outputs) {
        this.setValues(this.outputs, (hasValue && records[0]))
      }
      return;
    }


    // Build all options
    if (hasValue) {
      this.fillDropdown({
        level: nextLevel,
        levelIndex: nextLevelIndex,
        records: records,
        triggerEvent: true
      });
    }

  };

  /**
   * Fill dropdown with the specified options
   *
   * @param {Object} options Options to fill the dropdown
   * @param {Object} options.level Level
   * @param {Number} options.levelIndex Index of level
   * @param {Array} options.records Records
   * @param {String} [options.selectedValue=null] Selected value
   * @param {Boolean} [options.triggerEvent=false] Trigger event
   */
  Hierarchy.prototype.fillDropdown = function fillDropdown(options) {
    var records = options.records || [],
      level = options.level,
      levelElementId = options.level.element.id,
      levelIndex = options.levelIndex,
      levelIdIndex = this.header[level.id],
      levelNameIndex = this.header[level.name],
      selectedValue = options.selectedValue,
      value,
      attrSelected = '',
      selectedValueDone = (!selectedValue),
      opts = [],
      added = {},
      i, l,
      maxResults = this.maxResults;
      var noFound = this.options.noMatchFound;
	
    if (records.length === 0 && noFound.trim().length > 0) {
      opts.push('<li value="0" disabled="disabled">' + noFound + '</li>');
    } else if (records.length === 1 && this.autoSelect) {
      opts.push('<li value="' + records[0][levelIdIndex] + '" selected="selected"><a href="#" tabindex="0">' + records[0][levelNameIndex] + '</a></li>');
    } else {
      if (maxResults > 0) {
        maxResults -= opts.length;
      }

      for (i = 0, l = records.length; i < l; i++) {
        value = records[i][levelIdIndex];
        if (added[value]) {
          continue;
        }

        attrSelected = (selectedValue === value) ? ' selected="selected"' : '';
        if (!selectedValueDone && attrSelected) {
          selectedValueDone = true;
        }
        opts.push('<li value="' + value + '"' + attrSelected + '><a href="#" tabindex="0">' + records[i][levelNameIndex] + '</a></li>');
        added[value] = true;

        if (selectedValueDone && maxResults && opts.length >= maxResults) {
          break;
        }
      }

      // Add blank option when needed
      if (opts.length !== 1 || !this.autoSelect) {
        opts = this.createOptionsArray(levelIndex).concat(opts);
      }
    }

    setSelectOptions(level.element, opts.join(''));
    this.updateVisibility(level.element, true);
    level.records = records;

    // Trigger the click event
    if (options.triggerEvent && (records.length === 1 || opts.length === 1) && this.autoSelect) {
      if (opts[0].indexOf('disabled') === -1) level.element.selectedIndex = 0;
      triggerEvent(level.element.firstElementChild, 'click');
      triggerEvent(level.element.firstElementChild, 'search');
    }
  };
    

  /**
   * Set the values on the outputs
   * @param {Array} outputs Outputs where to set the values
   * @param {Object|null} record Record which contains the value to set
   */
  Hierarchy.prototype.setValues = function setValues(outputs, record) {
    if (!outputs) {
      return;
    }
    var i, l, output;
    for (i = 0, l = outputs.length; i < l; i += 1) {
      output = outputs[i];
      output.element.value = (record) ? record[output.fieldIndex] : "";
    }
    if (window.askia &&
      window.arrLiveRoutingShortcut &&
      window.arrLiveRoutingShortcut.length > 0 &&
      window.arrLiveRoutingShortcut.indexOf(this.currentQuestion) >= 0) {
      askia.triggerAnswer();
    }
  };

  /**
   * Clear levels
   * @param {Number} startIndex Index of level to start the clearing
   * @param {Boolean} duringSearch Flag which indicates that the clear is done during the search
   */
  Hierarchy.prototype.clearLevels = function clearLevels(startIndex, duringSearch) {
    var levels = this.levels,
      i = startIndex || 0,
      l = levels.length;

    if (startIndex >= l) {
      return;
    }

    for (; i < l; i += 1) {
      if (i === 0) {
        this.resetFirstLevel(duringSearch);
      } else {
        levels[i].element.innerHTML = '';
        this.updateVisibility(levels[i].element, false);
      }
      if (levels[i].outputs) {
        forEach(levels[i].outputs, this.clearOutput);
      }
    }

    // Clear global outputs
    if (this.outputs) {
      forEach(this.outputs, this.clearOutput);
    }
  };

  /**
   * Clear output element
   * @param output
   */
  Hierarchy.prototype.clearOutput = function clearOutput(output) {
    output.element.value = "";
  };

  /**
   * Reset the first level
   * @param {Boolean} duringSearch Flag which indicates that the reset is done during the search
   */
  Hierarchy.prototype.resetFirstLevel = function resetFirstLevel(duringSearch) {
    var firstLevel = this.levels[0];

    if (this.firstLevelVisible && !duringSearch) {
      this.fillDropdown({
        level: firstLevel,
        levelIndex: 0,
        records: this.records
      });
    } else {
      firstLevel.element.innerHTML = '';
      delete firstLevel.records;
    }
  };

  /**
   * Set search value and dispatch keyup event
   */
  function setAndDispatch(event, that) {
    var el = event.target || event.srcElement;
    var search = document.querySelector("#hierarchy_search_" + that.instanceId);
    search.value = filterFirstLevel + searchSeparator + el.value;
    if ("createEvent" in document) {
      var evt = document.createEvent("HTMLEvents");
      evt.initEvent("keyup", false, true);
      search.dispatchEvent(evt);
    } else {
      search.fireEvent("onkeyup");
    }
  }

  /**
   * Asynchronous search process
   *
   * @param {Hierarchy} hierarchy database
   * @param {String} value Value to search
   */
  function SearchProcess(hierarchy, value) {
    this.hierarchy = hierarchy;
    this.records = hierarchy.records;
    this.searchFieldIndexes = hierarchy.searchFieldIndexes;
    this.maxResults = hierarchy.maxResults;
    this.searchAtBeginning = hierarchy.searchAtBeginning;
    this.searchSeparator = hierarchy.searchSeparator;
    this.value = value;
    this.regexps = this.computeRegexps();
    this.results = [];
    this.isDone = false;
    this.sortFirst = hierarchy.sortFirst;
    this.searchPhonetic = hierarchy.searchPhonetic;
  }


  /**
   * Escape text for regular expression
   * @param {String} str Text to escape
   * @return {String} Text escaped
   */
  SearchProcess.prototype.escapeRegExp = function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  };

  /**
   * Compute regular expressions from the value
   * @return {RegExp[]} Regular expressions
   */
  SearchProcess.prototype.computeRegexps = function computeRegexp() {
    var values = this.value.split(this.searchSeparator),
      pattern,
      regexps = [],
      i, l;

    for (i = 0, l = values.length; i < l; i += 1) {
      if (this.hierarchy.searchPhonetic === 'yes') {
        pattern = this.escapeRegExp(values[i].trim().withoutAccent());
      } else {
        pattern = this.escapeRegExp(values[i].trim());   
      }
      if (this.searchAtBeginning) {
        pattern = '^' + pattern;
      }
      regexps.push(new RegExp(pattern, 'gi'));
    }

    return regexps;
  };

  /**
   * Indicates if the record field match match
   * @return {Boolean} Return true when the regexp match
   */
  SearchProcess.prototype.isFieldMatch = function isFieldMatch(fieldIndex) {
    this.rg.lastIndex = 0; // Reset the search
      
    if (this.searchPhonetic === 'yes') {
      return this.rg.test(this.record[fieldIndex].withoutAccent());
    } else {
      return this.rg.test(this.record[fieldIndex]);   
    }
  };

  /**
   * Indicates if the regexp match
   * @return {Boolean} Return true when the regexp match
   */
  SearchProcess.prototype.isRegexpMatch = function isRegexpMatch(rg) {
    return some(this.searchFieldIndexes, this.isFieldMatch, {
      record: this.record,
      rg: rg,
      searchPhonetic: this.searchPhonetic
    });
  };

  /**
   * Indicates if the record match
   * @return {Boolean} Return true when the record match
   */
  SearchProcess.prototype.isRecordMatch = function isRecordMatch(record) {
    if (!record) {
      return false;
    }

    return every(this.regexps, this.isRegexpMatch, {
      searchFieldIndexes: this.searchFieldIndexes,
      isFieldMatch: this.isFieldMatch,
      record: record,
      searchPhonetic: this.searchPhonetic
    });
  };


  /**
   * Search the string in the database
   */
  SearchProcess.prototype.search = function search() {
      if (this.sortFirst === 'yes') {
        this.results = sortInputFirst(this.value.split(this.searchSeparator)[0], filter(this.records, this.isRecordMatch, this),this.hierarchy.options.database.header[this.hierarchy.levels[0].name],this.searchPhonetic);  
      } else {
        this.results = filter(this.records, this.isRecordMatch, this);  
      }
    if (this.results.length > 0 && this.results[0][1] === this.results[this.results.length - 1][1]) {
        searchResult = 2;
    } else if (this.results.length > 0 && this.results[0][0] !== this.results[this.results.length - 1][0]) {
        searchResult = 1;
    } else {
        searchResult = 0;
    }
    this.isDone = true;
    this.hierarchy.done(this);
  };


  // Hold the databases
  Hierarchy.databases = {};
  window.Hierarchy = Hierarchy;

  dom.listen();
}());