(function () {
    "use strict";
    var converter = (function () {

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
         * Parse a CSV line and return an array with all fields witin the line
         *
         * @param {String} line Line to parse
         * @param {String} separator CSV separator
         * @returns {Array} Result of line
         */
        function parseLine(line, separator) {
            if (!line) {
                return null;
            }
            var chars = line.trim().split(''),
                word = '',
                ch,
                isQuote = false,
                fields = [];

            while(chars.length) {
                ch = chars.shift();
                if (ch === separator  && !isQuote) {
                    fields.push(word);
                    word = '';
                    continue;
                }
                if (ch === '"' && !isQuote) {
                    isQuote = true;
                    continue;
                }
                if (ch === '"' && isQuote) {
                    isQuote = false;
                    continue;
                }
                word += ch;
            }

            // Last word
            fields.push(word);

            return fields;
        }


        /**
         * Parse CSV
         *
         * @param {String} csv CSV content
         * @param {Array} levels Levels
         * @param {String} separator CSV separator
         */
        function parseCSV(csv, levels, separator) {
            separator = separator || ',';

            var lines = csv.trim().replace(/\r/gi, '').split(/\n/gi),
                keys = parseLine(lines.shift(), separator),
                header = {},
                records = [];

            // Prepare headers
            forEach(keys, function (key, index) {
                header[key.trim()] = index;
            });

            // Iterate through lines
            forEach(lines, function (line) {
                if (!line) return;
                records.push(parseLine(line, separator));
            });

            return {
                levels : levels,
                header : header,
                records : records
            };
        }


        return {
            parseCSV : parseCSV
        };

    } ());

    var uiManager = (function () {
        var levelsTable = document.getElementById('levels');

        function updateLevelNames() {
            var i, l;
            levelsTable.childNodes[0].childNodes[4].childNodes[1].style.display = "none";
            for (i = 0, l = levelsTable.childNodes.length; i < l; i += 1) {
                levelsTable.childNodes[i].childNodes[0].innerText= "Level " + (i + 1) + ":";
            }
        }

        function removeLevel(index) {
            var i, l;
            for (i = 0, l = levelsTable.childNodes.length; i < l; i += 1) {
                if (parseInt(levelsTable.childNodes[i].getAttribute('data-index'), 10) === index) {
                    levelsTable.removeChild(levelsTable.childNodes[i]);
                    break;
                }
            }
            updateLevelNames();
        }

        function addLevel(index) {
            var tr = document.createElement('tr'),
                th = document.createElement('th'),
                tdId = document.createElement('td'),
                inputId = document.createElement('input'),
                tdName = document.createElement('td'),
                inputName = document.createElement('input'),
                tdValues = document.createElement('td'),
                inputValues = document.createElement('input'),
                tdControls = document.createElement('td'),
                inputAdd = document.createElement('input'),
                inputRemove = document.createElement('input');

            function addOnKeyEnter(e) {
                e = e || window.event;
                if (e.keyCode === 13 ) {
                    addLevel(parseInt(tr.getAttribute('data-index'), 10) + 1);
                }
            }
            tr.setAttribute('data-index', index);
            tr.appendChild(th);

            inputId.type = "text";
            inputId.onkeyup = addOnKeyEnter;
            tdId.appendChild(inputId);
            tr.appendChild(tdId);

            inputName.type = "text";
            inputName.onkeyup = addOnKeyEnter;
            tdName.appendChild(inputName);
            tr.appendChild(tdName);

            inputValues.type = "text";
            inputValues.onkeyup = addOnKeyEnter;
            tdValues.appendChild(inputValues);
            tr.appendChild(tdValues);

            inputAdd.type = "button";
            inputAdd.value = "Add";
            inputAdd.onclick = function () {
                addLevel(parseInt(tr.getAttribute('data-index'), 10) + 1);
            };
            tdControls.appendChild(inputAdd);


            inputRemove.type = "button";
            inputRemove.value = "Remove";
            inputRemove.onclick = function () {
                removeLevel(parseInt(tr.getAttribute('data-index'), 10));
            };
            tdControls.appendChild(inputRemove);

            tr.appendChild(tdControls);

            levelsTable.appendChild(tr);
            updateLevelNames();

            inputId.focus();
        }

        addLevel(0);

        return {
            getLevels : function () {
                var i, l, j, k,
                    levels = [],
                    tds,
                    idIdx = 1,
                    nameIdx = 2,
                    liveValuesIdx = 3,
                    level,
                    liveValues;


                for (i = 0, l = levelsTable.childNodes.length; i < l; i += 1) {
                    tds = levelsTable.childNodes[i].childNodes;
                    liveValues = tds[liveValuesIdx].childNodes[0].value.trim().replace(/\s/g, '').split(',');
                    level = {
                        id     : tds[idIdx].childNodes[0].value.trim(),
                        name   : tds[nameIdx].childNodes[0].value.trim(),
                        liveValues : []
                    };
                    if (!level.id || !level.name) {
                        alert("Please specify the `id` and the `name` of the level");
                        if (!level.id) {
                            tds[idIdx].childNodes[0].focus();
                        }   else {
                            tds[nameIdx].childNodes[0].focus();
                        }
                        return null;
                    }
                    for (j = 0, k = liveValues.length; j < k; j += 1) {
                        if (liveValues[j]) {
                            level.liveValues.push(liveValues[j]);
                        }
                    }
                    if (!level.liveValues.length) {
                        delete level.liveValues;
                    }
                    levels.push(level);
                }

                if (!levels.length) {
                    alert("At least one level is require");
                    return null;
                }
                return levels;
            }
        }
    }());

    document.getElementById("level_details_link").onclick = function () {
        var details = document.getElementById("level_details");
        details.style.display = details.style.display ? '': 'block';
        this.innerHTML = (details.style.display) ? "&lt;&lt; hide details": "show details &gt;&gt;"
    };

    document.getElementById("run").onclick = function () {
        var csv = document.getElementById("csv").value,
            separator = document.getElementById("separator").value,
            dbName = document.getElementById("databaseName").value.trim(),
            levels = uiManager.getLevels();

        if (!levels) {
            return;
        }
        if (!csv) {
            alert("Please enter a valid CSV content");
            document.getElementById("csv").focus();
            return;
        }
        if (!dbName) {
            alert("Please enter the name of the database");
            document.getElementById("databaseName").focus();
            return;
        }

        document.documentElement.innerHTML = "PLEASE WAIT THIS COULD TAKE A WHILE";
        setTimeout(function () {
            var db = converter.parseCSV(csv, levels, separator);
            document.documentElement.innerHTML = 'Hierarchy.databases["' +
                dbName +
                '"]=' + JSON.stringify(db) + ';';
        }, 500);
    };

    document.getElementById('csv').focus();

}());

