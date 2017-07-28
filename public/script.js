$(function() {

// login button from header.ejs
	$('.loginFromHeader').click(function() {
		$.get('/login',function(data) {
			$('.modal.login').html(data);
			$('.modal.login').css('display', 'block');

			$('.closeButton').click(function() {
				$('.modal.login').css('display', 'none');
			});
		});
	});

// submit an article button from header.ejs
	$('.submitFromHeader').click(function() {
		$('.modal.submitError').css('display', 'block');

		$('.closeButton').click(function() {
			$('.modal.submitError').css('display', 'none');
		});
	});

// article submittion from submit.ejs
	$('#articleSubmit').click(function() {
		// alert("Submit button clicked!")

		$('.errorMessage').removeClass('errorMessage');

		var validated = true;

		$('.validate').each(function() {
			// alert("Validating each input field! " + this)
			if ($(this).val() == "") {
				// alert(this);
				$(this).parent().addClass('errorMessage');
				validated = false;
				// alert("Error!");
			}
		});

		// return false;

		if (validated == true) {
			
		} else {
			return false;
		}

	});

// add tinymce to textarea in submit.ejs
  	tinymce.init({
	    selector: "textarea",
	    setup: function (editor) {
	        editor.on('change', function () {
	            editor.save(); // value in textarea saving to database and displaying but value not style
	        });
	    }
	});

})