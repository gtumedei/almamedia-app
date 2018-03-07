// This script runs in the context of the popup.html, therefore the DOM is the one of the popup.
var origCareer = null;
var career = null;

function showResults(){
	$("#info").hide();
	$("#results").show();	
}

function showInfo(){
	$("#results").hide();
	$("#info").show();
}

function showError(message) {
	hideMessages();
	$("#messages").show();
	$("#error").show();
	$("#error").html(message);
}

function showWarning(message) {
	hideMessages();
	$("#messages").show();
	$("#warning").show();
	$("#warning").html(message);
}

function hideMessages(){
	$("#messages").hide();
	$("#messages").children().hide();
}

function hideError() {
	$("#error").hide();
}

function validateGrade(grade) {
	
	if(isNaN(grade)){
		return "Il voto deve essere un numero!";
	}
	
	if(grade < 18 || grade > 30)
	{
		return "Il voto deve essere compreso tra 18 e 30!";
	}
	
	return null;
}

function validateCredits(credits) {
	
	if(isNaN(credits)){
		return "I crediti devono essere un numero!";
	}
	
	if(credits <= 0)
	{
		return "I crediti non possono essere nulli o negativi!";
	}
	
	return null;
}


function addExamToCareer(row){
	
	var gradeElem = $(row).find("input[name=grade]");
	var creditsElem = $(row).find("input[name=credits]");
	
	var gradeText = gradeElem.val();
	var creditsText = creditsElem.val();
	
	if(!gradeText && !creditsText){
		showWarning("Le righe vuote sono state ignorate.");
		return true;
	}
	
	var credits = parseInt(creditsText);
	var grade = parseInt(gradeText);
	
	var errorGrade = validateGrade(grade);
	if(errorGrade != null){
		$(gradeElem).parent("td").addClass("error_field");
		$(gradeElem).attr("title", errorGrade);
	}
	else{
		$(gradeElem).parent("td").removeClass("error_field");
		$(gradeElem).removeAttr("title");
	}
	
	var errorCredits = validateCredits(credits);
	if(errorCredits != null){
		$(creditsElem).parent("td").addClass("error_field");
		$(creditsElem).attr("title", errorCredits);
	}
	else{
		$(creditsElem).parent("td").removeClass("error_field");
		$(creditsElem).removeAttr("title");
	}
	
	if(errorGrade || errorCredits)
		return false;
	
	var exam = new Exam(credits);
	exam.setGrade(grade);
	career.addExam(exam);
	
	return true;	
}

function focusOnFirstError() {
	$(".error_field input").first().focus();	
}

function onCalcolaClicked(){
	hideMessages();
	/* Every time calcola is clicked we reset the career because we retrieve all new exams again. */
	resetCareer();
	
	/* Retrieve all the exams inserted */
	var rows = $(".new_exam");
	var resultCalculation = true;
	for(var i = 0; i < rows.length; ++i){
		if(addExamToCareer(rows[i]) == false)
			resultCalculation = false;	
	}
	
	if(!resultCalculation)
		showError("Uno o più campi non validi!");
	else
		updateData();
		
	focusOnFirstError();
	
	return false;	
}

function initializeDocument(){
	$("#info").hide();
	$("#results").hide();
	hideMessages();
}


function onResetClicked(){
	resetCareer();
	hideMessages()
	updateData();
	
	/* Remove all rows except one */
	$(".new_exam").each(function(index, element) {
		if(index > 0){
			element.remove();
		}
    });
	
	/* Empty fields in the first row */
	resetRow($(".new_exam"));

	return false;
}

function resetRow(elem) {
	$(elem).find("input").val("");
	$(elem).find("td").removeClass("error_field");
	$(elem).find("input").removeAttr("title");
}

function resetCareer() {
	if(origCareer == null)
		showError("E' successo qualcosa di brutto! Prova a ricaricare la pagina.");
	career = cloneCareer(origCareer);
}

function updateData(){
    $("#studentName").text(career.name);
	$("#media").html(career.getMedia());
	$("#media_centodieci").html(career.getMediaCentoDieci());
	$("#cfu").html(career.getCFU());
}

function onDataReceived(response){
	if(response.career == null){
		showInfo();
	}
	else{
		origCareer = cloneCareer(response.career);
		resetCareer();
		showResults();
		updateData();
	}
}

function addNewExamRow(){
	// Columns
	var gradeInput = $(".grade-input").first().clone().val("");
	var creditsInput = $(".credits-input").first().clone().val("");
	var removeButton = $(".remove").first().clone();
	
	// Row
	var row = $("<tr>").addClass("new_exam").append($("<td>").append(gradeInput));
	$(row).append($("<td>").append(creditsInput));
	$(row).append($("<td>").append(removeButton));

	$(".input_table tr:last").after(row);
	
	addRemoveListeners();
	return false;
}


function addRemoveListeners(){
	$('.remove').on("click", function() {
		if($(".new_exam").length > 1){
			$(this).parent().parent("tr").remove();
		}
		else if ($(".new_exam").length == 1){
			resetRow($(this).parent().parent("tr"));
		}
		return false;
	});
}

$(document).ready(function() {
	
	$("#reset").click(onResetClicked);
	
	chrome.tabs.getSelected(null, function(tab) {
	  chrome.tabs.sendMessage(tab.id, {execute: "calculate"}, function(response) {
			onDataReceived(response);
	  });
	});
	
	addRemoveListeners();
	
	$("#add").on("click", addNewExamRow);
	$("#add").attr("title", "Aggiungi nuovo esame");
	$("#calcola").on("click", onCalcolaClicked);
	
	// Press enter is like calcola clicked
	$(document).keypress(function(e) {
		if(e.which == 13) {
			if($(":focus").is("input"))
				onCalcolaClicked();
		}
	});
	
	initializeDocument();

});
