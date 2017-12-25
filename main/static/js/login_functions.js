function login(){
  $('#login-btn').button('loading');
  client_no = $('#client_no').val();
  user_email = $('#user_email').val();
  user_password = $('#user_password').val();
  $.post('/user/authenticate',{
    client_no:client_no,
  	user_email:user_email,
  	user_password:user_password
  },
  	function(data){
	  	if (data['status'] == 'failed'){
        $('#login-error-container').show();
	  		$('#login-error').html(data['error']);
	  		$('#login-form-loader').hide();
        $('#login-btn').button('complete');
	  	}
	   	else{
	   		$(location).attr('href', '/');
	   	}
  });
}
