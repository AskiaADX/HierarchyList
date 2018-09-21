(function () {
	var hierarchy = new Hierarchy({
		database: Hierarchy.databases["{%:= CurrentADC.PropValue("databaseName")%}"],
		searchIn: [{%:= CurrentADC.PropValue("searchIn")%}],
		searchAtBeginning: {%= CurrentADC.PropValue("searchAtBeginning")%},
		searchSeparator: "{%:= CurrentADC.PropValue("searchSeparator")%}",
		values: [{%:= CurrentADC.PropValue("values")%}],
		prefix: "{%:= CurrentADC.PropValue("prefix")%}",
		dropdowns: {%= On(CurrentADC.PropValue("dropDownSize").ToNumber() > 1, "false", "true")%},
		blankOptions: {%:= On(CurrentADC.PropValue("blankOptions") <> "", "[" + CurrentADC.PropValue("blankOptions") + "]", "null")%}, 
		useSearch: {%= CurrentADC.PropValue("useSearch")%},
        filterFirstLevel: "{%= CurrentADC.PropValue("filterFirstLevel")%}",
		customSearchId : "{%= CurrentADC.PropValue("customSearchId")%}",
		firstLevelVisible: {%= CurrentADC.PropValue("firstLevelVisible")%},
		minChars: {%:= CurrentADC.PropValue("minChars")%},
		maxResults: {%:= CurrentADC.PropValue("maxResults")%},
		visibility: "{%:= CurrentADC.PropValue("visibility")%}",
		instanceId: {%= CurrentADC.InstanceId%},
		autoSelect: {%= CurrentADC.PropValue("autoSelect")%},
        currentQuestion: "{%:= CurrentQuestion.Shortcut %}",
        noMatchFound: "{%:= CurrentADC.PropValue("noMatchFound")%}",
        sortFirst: "{%:= CurrentADC.PropValue("sortFirst") %}",
        searchPhonetic: "{%:= CurrentADC.PropValue("searchPhonetic") %}"
	});
} ());