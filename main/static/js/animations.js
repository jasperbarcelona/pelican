$(document).ready(function(){

$(window).load(function(){
  setTimeout(function() {
    $('#mainPreloader').fadeOut();
  }, 3000);
});

profile_options = 'closed'

$('#profile-options').hide();
$('#replyError').hide();
$('#replySuccess').hide();

$('.form-control.floatlabel').floatlabel({

});

$(".datepicker").datepicker({
    dateFormat: "MM dd, yy"
});

$('#addRaffleModal').on('shown.bs.modal', function () {
    $('#addRaffleName').focus();
});

$('#addPrizeModal').on('shown.bs.modal', function () {
    $('#addPrizeLabel').focus();
});

$('#forgotPrizeModal').on('shown.bs.modal', function () {
    $('#forgotPrizeLabel').focus();
});

$('#addBrandModal').on('shown.bs.modal', function () {
    $('#addBrandName').focus();
});


$('#addPrizeModal').on('hidden.bs.modal', function () {
    $('#addPrizeModal .form-control').val('');
    $('#addPrizeModal .error-icon-container').addClass('hidden');
    $('#addPrizeModal .form-control').css('border','1px solid #999');
    $('#savePrizeBtn').button('complete');
    $('#savePrizeBtn').attr('disabled', true);
});

$('#forgotPrizeModal').on('hidden.bs.modal', function () {
    $('#forgotPrizeModal .form-control').val('');
    $('#forgotPrizeModal .error-icon-container').addClass('hidden');
    $('#forgotPrizeModal .form-control').css('border','1px solid #999');
    $('#saveForgotPrizeBtn').button('complete');
    $('#saveForgotPrizeBtn').attr('disabled', true);
});

$('#addBrandModal').on('hidden.bs.modal', function () {
    $('#addBrandModal .form-control').val('');
    $('#addBrandModal .error-icon-container').addClass('hidden');
    $('#addBrandModal .form-control').css('border','1px solid #999');
    $('#savePrizeBtn').button('complete');
    $('#savePrizeBtn').attr('disabled', true);
});

$('#addRaffleIsLimited').on('change', function () { 
  $(this).toggleClass('checked')
  if ($(this).hasClass('checked')) {
    $('#addRaffleSlots').attr('disabled', false);
    $('#addRaffleSlots').focus();
  }
  else {
    error_icon_id = $('#addRaffleSlots').attr('data-error');
    $('#addRaffleSlots').attr('disabled', true);
    $('#addRaffleSlots').val('');
    $('#addRaffleSlots').css("border", "1px solid #999");
    $('#'+error_icon_id).addClass('hidden');
    $('#'+error_icon_id).addClass('tooltip');
  }
});

$('#addRaffleModal .form-control').on('keyup', function () {
  name = $('#addRaffleName').val();
  keyword = $('#addRaffleKeyword').val();
  desc = $('#addRaffleDesc').val();
  start_date = $('#addRaffleStartDate').val();
  end_date = $('#addRaffleEndDate').val();
  is_limited = $('#addRaffleIsLimited').hasClass('checked');
  limit = $('#addRaffleSlots').val();

  if ((name != '') && (desc != '') && (start_date != '') && (end_date != '') && (keyword != '')) {
    if (is_limited) {
      if (limit != '') {
        $('#saveRaffleBtn').attr('disabled',false);
      }
      else{
        $('#saveRaffleBtn').attr('disabled',true);
      }
    }
    else {
      $('#saveRaffleBtn').attr('disabled',false);
    }
  }
  else {
    $('#saveRaffleBtn').attr('disabled',true);
  }
});

$('#addRaffleModal .form-control').on('change', function () {
  name = $('#addRaffleName').val();
  desc = $('#addRaffleDesc').val();
  start_date = $('#addRaffleStartDate').val();
  end_date = $('#addRaffleEndDate').val();
  is_limited = $('#addRaffleIsLimited').hasClass('checked');
  limit = $('#addRaffleSlots').val();

  if ((name != '') && (desc != '') && (start_date != '') && (end_date != '') && (keyword != '')) {
    if (is_limited) {
      if (limit != '') {
        $('#saveRaffleBtn').attr('disabled',false);
      }
      else{
        $('#saveRaffleBtn').attr('disabled',true);
      }
    }
    else {
      $('#saveRaffleBtn').attr('disabled',false);
    }
  }
  else {
    $('#saveRaffleBtn').attr('disabled',true);
  }
});

$('#addPrizeModal .form-control').on('keyup', function () {
  label = $('#addPrizeLabel').val();
  prize = $('#addPrize').val();

  if ((label != '') && (prize != '')) {
    $('#savePrizeBtn').attr('disabled',false);
  }
  else {
    $('#savePrizeBtn').attr('disabled',true);
  }
});

$('#addPrizeModal .form-control').on('change', function () {
  label = $('#addPrizeLabel').val();
  prize = $('#addPrize').val();

  if ((label != '') && (prize != '')) {
    $('#savePrizeBtn').attr('disabled',false);
  }
  else {
    $('#savePrizeBtn').attr('disabled',true);
  }
});

$('#forgotPrizeModal .form-control').on('keyup', function () {
  label = $('#forgotPrizeLabel').val();
  prize = $('#forgotPrize').val();

  if ((label != '') && (prize != '')) {
    $('#saveForgotPrizeBtn').attr('disabled',false);
  }
  else {
    $('#saveForgotPrizeBtn').attr('disabled',true);
  }
});

$('#forgotPrizeModal .form-control').on('change', function () {
  label = $('#forgotPrizeLabel').val();
  prize = $('#forgotPrize').val();

  if ((label != '') && (prize != '')) {
    $('#saveForgotPrizeBtn').attr('disabled',false);
  }
  else {
    $('#saveForgotPrizeBtn').attr('disabled',true);
  }
});

$('#addBrandModal .form-control').on('keyup', function () {
  name = $('#addBrandName').val();
  code = $('#addBrandCode').val();

  if ((name != '') && (code != '')) {
    $('#saveBrandBtn').attr('disabled',false);
  }
  else {
    $('#saveBrandBtn').attr('disabled',true);
  }
});

$('#addBrandModal .form-control').on('keyup', function () {
  name = $('#addBrandName').val();
  code = $('#addBrandCode').val();

  if ((name != '') && (code != '')) {
    $('#saveBrandBtn').attr('disabled',false);
  }
  else {
    $('#saveBrandBtn').attr('disabled',true);
  }
});

$('#addUserModal .form-control').on('keyup', function () {
  name = $('#addUserName').val();
  email = $('#addUserEmail').val();
  temp_pw = $('#addUserPassword').val();
  temp_pw_confirm = $('#addUserPasswordConfirm').val();
  role = $('#addUserRole').val();

  if ((name != '') && (email != '') && (temp_pw != '') && (temp_pw_confirm != '') && (temp_pw_confirm == temp_pw) && (role != undefined)) {
    $('#saveUserBtn').attr('disabled',false);
  }
  else {
    $('#saveUserBtn').attr('disabled',true);
  }
});

$('#addUserModal .form-control').on('change', function () {
  name = $('#addUserName').val();
  email = $('#addUserEmail').val();
  temp_pw = $('#addUserPassword').val();
  temp_pw_confirm = $('#addUserPasswordConfirm').val();
  role = $('#addUserRole').val();

  if ((name != '') && (email != '') && (temp_pw != '') && (temp_pw_confirm != '') && (role != undefined)) {
    $('#saveUserBtn').attr('disabled',false);
  }
  else {
    $('#saveUserBtn').attr('disabled',true);
  }
});

$('#resetPasswordModal .form-control').on('keyup', function () {
  temp_pw = $('#resetPasswordText').val();
  temp_pw_confirm = $('#resetPasswordConfirmText').val();
  role = $('#addUserRole').val();

  if ((temp_pw != '') && (temp_pw_confirm != '') && (temp_pw_confirm == temp_pw)) {
    $('#resetPasswordBtn').attr('disabled',false);
  }
  else {
    $('#resetPasswordBtn').attr('disabled',true);
  }
});

});