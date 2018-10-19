/* NAVIGATION */

function show_raffles(slice_from) {
  $('.panel-nav-item').removeClass('active');
  $('#navRaffles').addClass('active');
  $.get('/raffles',
  {
    slice_from:slice_from
  },
    function(data){
      $('.content').html(data);
      $('#searchLoader').addClass('hidden');
      $('#clearRafflesSearch').addClass('hidden');
    });
}

function show_users(slice_from) {
  $('.panel-nav-item').removeClass('active');
  $('#navUsers').addClass('active');
  $.get('/users',
  {
    slice_from:slice_from
  },
    function(data){
      $('.content').html(data);
      $('#searchLoader').addClass('hidden');
      $('#clearConversationsSearch').addClass('hidden');
    });
}

function show_usage(slice_from) {
  $('.panel-nav-item').removeClass('active');
  $('#navUsage').addClass('active');
  $.get('/usage',
  {
    slice_from:slice_from
  },
    function(data){
      $('.content').html(data);
      $('#searchLoader').addClass('hidden');
      $('#clearConversationsSearch').addClass('hidden');
    });
}

function user_profile() {
  alert('This feature will be available on paid version.');
}

/* END OF NAVIGATION */

/* START OF PAGINATION */

function user_next_page() {
  $.post('/users/next',
    function(data){
      initialize_selected_entries();
      $('#usersTbody').html(data['template']);
      $('#paginationShowingUsers').html(data['showing']);
      $('#paginationTotalUsers').html(data['total_entries']);
      $('.pagination-btn').blur();

      if (data['prev_btn'] == 'disabled') {
        $('.pagination-btn.left.user').attr('disabled', true);
      }
      else {
        $('.pagination-btn.left.user').attr('disabled', false);
      }

      if (data['next_btn'] == 'disabled') {
        $('.pagination-btn.right.user').attr('disabled', true);
      }
      else {
        $('.pagination-btn.right.user').attr('disabled', false);
      }
    });
}

function user_prev_page() {
  $.post('/users/prev',
    function(data){
      initialize_selected_entries();
      $('#usersTbody').html(data['template']);
      $('#paginationShowingUsers').html(data['showing']);
      $('#paginationTotalUsers').html(data['total_entries']);
      $('.pagination-btn').blur();

      if (data['prev_btn'] == 'disabled') {
        $('.pagination-btn.left.user').attr('disabled', true);
      }
      else {
        $('.pagination-btn.left.user').attr('disabled', false);
      }

      if (data['next_btn'] == 'disabled') {
        $('.pagination-btn.right.user').attr('disabled', true);
      }
      else {
        $('.pagination-btn.right.user').attr('disabled', false);
      }
    });
}

/* END OF PAGINATION */

function supply_user_info(user_id) {
  $.get('/user',
    {
      user_id:user_id
    },
    function(data){
      $('#editUserModal .modal-body').html(data);
      $('#editUserModal .form-control').change();
    });
}

function search_users(active_text) {
  $('#usersTbody').html('');
  $('#searchLoader').removeClass('hidden');
  $('#clearUsersSearch').removeClass('hidden');
  var name = $('#searchUsersName').val();
  var role = $('#searchUsersRole').val();
  var email = $('#searchUsersEmail').val();
  var api_key = $('#searchUsersApi').val();
  if ((name == '') && (role == '') && (email == '')) {
    $.get('/users',
    {
      slice_from:'reset'
    },
    function(data){
      initialize_selected_entries();
      $('#clearUsersSearch').addClass('hidden');
      $('.content').html(data);
      $('#searchLoader').addClass('hidden');
      $('#'+active_text).focus();
    });
  }
  else {
    $.get('/users/search',
    {
      name:name,
      role:role,
      email:email,
      api_key:api_key
    },
    function(data){
      $('#usersTbody').html(data['template']);
      $('#searchLoader').addClass('hidden');
      if (data['count'] != 0) {
        var start_from = 1;
      }
      else {
        var start_from = 0;
      }
      $('#paginationShowingUsers').html(start_from+' to '+data['count']);
      $('#paginationTotalUsers').html(data['count']);
      $('.pagination-btn').attr('disabled',true);
    });
  }
}


function validate_blank(element,value) {
  error_icon_id = $(element).attr('data-error');
  if (value == '') {
    $(element).css("border", "1px solid #d9534f");
    $('#'+error_icon_id).removeClass('hidden');
    $('#'+error_icon_id).removeClass('tooltip');
  }
  else {
    $(element).css("border", "1px solid #999");
    $('#'+error_icon_id).addClass('hidden');
    $('#'+error_icon_id).addClass('tooltip');
  }
}

function validate_msisdn(element,value) {
  error_icon_id = $(element).attr('data-error');
  if ((value != '') && (value.length == 11)) {
    $(element).css("border", "1px solid #999");
    $('#'+error_icon_id).addClass('hidden');
    $('#'+error_icon_id).addClass('tooltip');
  }
  else {
    $(element).css("border", "1px solid #d9534f");
    $('#'+error_icon_id).removeClass('hidden');
    $('#'+error_icon_id).removeClass('tooltip');
  }
}

function validate_password(element,value) {
  error_icon_id = $(element).attr('data-error');
  if ((value != '') && (value.length >= 8)) {
    $(element).css("border", "1px solid #999");
    $('#'+error_icon_id).addClass('hidden');
    $('#'+error_icon_id).addClass('tooltip');
  }
  else {
    $(element).css("border", "1px solid #d9534f");
    $('#'+error_icon_id).removeClass('hidden');
    $('#'+error_icon_id).removeClass('tooltip');
  }
}

function validate_password_confirm(element,value) {
  error_icon_id = $(element).attr('data-error');
  password = $('#changePasswordText').val();
  password_confirm = $('#changePasswordConfirmText').val();
  if (password == password_confirm) {
    $(element).css("border", "1px solid #999");
    $('#'+error_icon_id).addClass('hidden');
    $('#'+error_icon_id).addClass('tooltip');
  }
  else {
    $(element).css("border", "1px solid #d9534f");
    $('#'+error_icon_id).removeClass('hidden');
    $('#'+error_icon_id).removeClass('tooltip');
  }
}

function validate_temp_pass(element,value) {
  error_icon_id = $(element).attr('data-error');
  password = $('#addUserPassword').val();
  password_confirm = $('#addUserPasswordConfirm').val();
  if (password == password_confirm) {
    $(element).css("border", "1px solid #999");
    $('#'+error_icon_id).addClass('hidden');
    $('#'+error_icon_id).addClass('tooltip');
  }
  else {
    $(element).css("border", "1px solid #d9534f");
    $('#'+error_icon_id).removeClass('hidden');
    $('#'+error_icon_id).removeClass('tooltip');
  }
}

function validate_password_reset(element,value) {
  error_icon_id = $(element).attr('data-error');
  password = $('#resetPasswordText').val();
  password_confirm = $('#resetPasswordConfirmText').val();
  if (password == password_confirm) {
    $(element).css("border", "1px solid #999");
    $('#'+error_icon_id).addClass('hidden');
    $('#'+error_icon_id).addClass('tooltip');
  }
  else {
    $(element).css("border", "1px solid #d9534f");
    $('#'+error_icon_id).removeClass('hidden');
    $('#'+error_icon_id).removeClass('tooltip');
  }
}

function reset_password() {
  $('#saveResetPasswordBtn').button('complete');
  password = $('#resetPasswordText').val();
  $.post('/user/password/reset',
  {
    password:password
  },
  function(data){
    $('#resetPasswordModal .form-control').change();
    $('#resetPasswordModal .form-control').val('');
    $('#resetPasswordModal .error-icon-container').addClass('hidden');
    $('#resetPasswordModal .form-control').css('border','1px solid #999');
    $('#saveResetPasswordBtn').button('complete');
    $('#resetPasswordModal').modal('hide');
    $('#replySuccess .snackbar-message').html('Password successfully reset.');
    $('#replySuccess').fadeIn();
    setTimeout(function() {
      $('#replySuccess').fadeOut();
    }, 4000);
  });
}

function save_user() {
  $('#saveUserBtn').button('loading');
  name = $('#addUserName').val();
  email = $('#addUserEmail').val();
  temp_pw = $('#addUserPassword').val();
  role = $('#addUserRole').val();

  $.post('/user/add',
  {
    name:name,
    email:email,
    temp_pw:temp_pw,
    role:role
  },
  function(data){
    $('.content').html(data);
    $('#addUserRole').prop('selectedIndex',0);
    $('#addUserModal .form-control').val('');
    $('#addUserModal .form-control').change();
    $('#addUserModal .error-icon-container').addClass('hidden');
    $('#addUserModal .form-control').css('border','1px solid #999');
    $('#saveUserBtn').button('complete');
    $('#addUserModal').modal('hide');
  });
}

function edit_user() {
  $('#editUserBtn').button('loading');
  name = $('#editUserName').val();
  email = $('#editUserEmail').val();
  role = $('#editUserRole').val();

  $.post('/user/edit',
  {
    name:name,
    email:email,
    role:role
  },
  function(data){
    $('.content').html(data);
    $('#editUserModal .form-control').val('');
    $('#editUserModal .form-control').change();
    $('#editUserModal .error-icon-container').addClass('hidden');
    $('#editUserModal .form-control').css('border','1px solid #999');
    $('#editUserBtn').button('complete');
    $('#editUserModal').modal('hide');
    $('#replySuccess .snackbar-message').html('Changes saved.');
    $('#replySuccess').fadeIn();
    setTimeout(function() {
      $('#replySuccess').fadeOut();
    }, 4000);
  });
}

function delete_user() {
  $('#deleteUserBtn').button('loading');
  $.post('/user/delete',
  function(data){
    $('.content').html(data);
    $('#deleteUserBtn').button('complete');
    $('#editUserModal').modal('hide');
    $('#deleteUserModal').modal('hide');
    $('#replySuccess .snackbar-message').html('User successfully deleted.');
    $('#replySuccess').fadeIn();
    setTimeout(function() {
      $('#replySuccess').fadeOut();
    }, 4000);
  });
}

function change_password() {
  $('#changePasswordModal').modal({
    backdrop: 'static',
    keyboard: false
  });
}

function save_password() {
  $('#savePasswordBtn').button('loading');
  password = $('#changePasswordText').val();

  $.post('/user/password/save',
  {
    password:password
  },
  function(data){
    if (data['status'] == 'success') {
      $('#changePasswordModal').modal('hide');
    }
    else {
      $('#replyError .snackbar-message').html(data['message']);
      $('#replyError').fadeIn();
      $("html, body").animate({ scrollTop: $(document).height()-$(window).height() });
      setTimeout(function() {
        $('#replyError').fadeOut();
      }, 4000);
    }
    $('#savePasswordBtn').button('complete');
  });
}

function restrict_space(event) {
    var k = event ? event.which : window.event.keyCode;
    if (k == 32) return false;
}

function save_prize() {
  $('#savePrizeBtn').button('loading');
  label = $('#addPrizeLabel').val();
  prize = $('#addPrize').val();
  $.post('/raffle/prize/save',
  {
    label:label,
    prize:prize
  },
    function(data){
      $('#prizeTable tbody').append(data['template']);
      if (data['item_count'] == 1){
        $('#prizeCount').html('Prizes: ('+data['item_count']+' item)');
      }
      else {
        $('#prizeCount').html('Prizes: ('+data['item_count']+' items)');
      }
      $('#addPrizeModal').modal('hide');
      $('#savePrizeBtn').button('complete');
    });
}

function save_brand() {
  $('#saveBrandBtn').button('loading');
  name = $('#addBrandName').val();
  code = $('#addBrandCode').val();
  $.post('/raffle/brand/save',
  {
    name:name,
    code:code
  },
    function(data){
      $('#brandTable tbody').append(data['template']);
      if (data['item_count'] == 1){
        $('#brandCount').html('Participating Brands: ('+data['item_count']+' item)');
      }
      else {
        $('#brandCount').html('Participating Brands: ('+data['item_count']+' items)');
      }
      $('#addBrandModal').modal('hide');
      $('#saveBrandBtn').button('complete');
    });
}

function save_existing_brand() {
  $('#saveExistingBrandBtn').button('loading');
  name = $('#addExistingBrandName').val();
  code = $('#addExistingBrandCode').val();
  $.post('/raffle/brand/existing/save',
  {
    name:name,
    code:code
  },
    function(data){
      $('#brandExistingTable tbody').append(data['template']);
      if (data['item_count'] == 1){
        $('#brandExistingCount').html('Participating Brands: ('+data['item_count']+' item)');
      }
      else {
        $('#brandExistingCount').html('Participating Brands: ('+data['item_count']+' items)');
      }
      $('#addExistingBrandModal').modal('hide');
      $('#saveExistingBrandBtn').button('complete');
    });
}

function save_existing_prize() {
  $('#saveExistingPrizeBtn').button('loading');
  label = $('#addExistingPrizeLabel').val();
  prize = $('#addExistingPrize').val();
  $.post('/raffle/prize/existing/save',
  {
    label:label,
    prize:prize
  },
    function(data){
      $('#prizeExistingTable tbody').append(data['template']);
      if (data['item_count'] == 1){
        $('#prizeExistingCount').html('Prizes: ('+data['item_count']+' item)');
      }
      else {
        $('#prizeExistingCount').html('Prizes: ('+data['item_count']+' items)');
      }
      $('#addExistingPrizeModal').modal('hide');
      $('#saveExistingPrizeBtn').button('complete');
    });
}


function save_forgot_prize() {
  $('#saveForgotPrizeBtn').button('loading');
  label = $('#forgotPrizeLabel').val();
  prize = $('#forgotPrize').val();
  $.post('/raffle/prize/save',
  {
    label:label,
    prize:prize
  },
    function(data){
      $('#prizeTable tbody').append(data['template']);
      if (data['item_count'] == 1){
        $('#prizeCount').html('Prizes: ('+data['item_count']+' item)');
      }
      else {
        $('#prizeCount').html('Prizes: ('+data['item_count']+' items)');
      }
      $('#forgotPrizeModal').modal('hide');
      $('#saveForgotPrizeBtn').button('complete');
    });
}

function clear_raffle_data() {
  $('#cancelRaffleBtn').button('loading');
  $('#addRaffleModal .form-control').val('');
  $('#addRaffleIsLimited').prop('checked', false).change()
  $('#addRaffleIsLimited').removeClass('checked').change()
  $('#addRaffleModal .form-control').change();
  $.post('/raffle/prize/clear',
  function(data){
    $('#prizeCount').html('Prizes (0 items)');
    $('#addRaffleModal .error-icon-container').addClass('hidden');
    $('#addRaffleModal .form-control').css('border','1px solid #999');
    $('#addRaffleModal').modal('hide');
    $('#cancelRaffleBtn').button('complete');
    $('#addRaffleModal .modal-body').scrollTop(0);
    $('.prize').remove();
  });
}

function delete_prize(prize_id) {
  $.post('/raffle/prize/remove',
  {
    prize_id:prize_id
  },
  function(data){
    $('#'+prize_id+'.prize').remove();
    if (data['item_count'] == 1){
      $('#prizeCount').html('Prizes ('+data['item_count']+' item)');
    }
    else {
      $('#prizeCount').html('Prizes ('+data['item_count']+' items)');
    }
  });
}

function delete_existing_prize(prize_id) {
  $.post('/raffle/prize/existing/remove',
  {
    prize_id:prize_id
  },
  function(data){
    $('#'+prize_id+'.prize').remove();
    if (data['item_count'] == 1){
      $('#prizeCount').html('Prizes ('+data['item_count']+' item)');
    }
    else {
      $('#prizeCount').html('Prizes ('+data['item_count']+' items)');
    }
  });
}

function delete_brand(brand_id) {
  $.post('/raffle/brand/remove',
  {
    brand_id:brand_id
  },
  function(data){
    $('#'+brand_id+'.brand').remove();
    if (data['item_count'] == 1){
      $('#brandCount').html('Participating Brands ('+data['item_count']+' item)');
    }
    else {
      $('#brandCount').html('Participating Brands ('+data['item_count']+' items)');
    }
  });
}

function delete_existing_brand(brand_id) {
  $.post('/raffle/brand/existing/remove',
  {
    brand_id:brand_id
  },
  function(data){
    $('#'+brand_id+'.brand').remove();
    if (data['item_count'] == 1){
      $('#brandCount').html('Participating Brands ('+data['item_count']+' item)');
    }
    else {
      $('#brandCount').html('Participating Brands ('+data['item_count']+' items)');
    }
  });
}

function save_raffle() {
  $('#saveRaffleBtn').button('loading');

  if ($('#prizeTable tbody tr').length == 0) {
    $('#forgotPrizeModal').modal('show');
    $('#saveRaffleBtn').button('complete');
  }

  else{
    name = $('#addRaffleName').val();
    keyword = $('#addRaffleKeyword').val();
    desc = $('#addRaffleDesc').val();
    start_date = $('#addRaffleStartDate').val();
    end_date = $('#addRaffleEndDate').val();
    is_limited = $('#addRaffleIsLimited').hasClass('checked');
    limit = $('#addRaffleSlots').val();
    min_purchase = $('#addRafflePurchase').val();
    dti_permit = $('#addRafflePermit').val();

    $.post('/raffles/new',
    {
      name:name,
      keyword:keyword,
      desc:desc,
      start_date:start_date,
      end_date:end_date,
      is_limited:is_limited,
      limit:limit,
      dti_permit:dti_permit,
      min_purchase:min_purchase
    },
    function(data){
      $('.content').html(data);
      $('#addRaffleModal').modal('hide');

      $('#addRaffleModal .form-control').val('');
      $('#addRaffleIsLimited').prop('checked', false).change()
      $('#addRaffleIsLimited').removeClass('checked').change()
      $('#addRaffleModal .form-control').change();
      $('#prizeCount').html('Prizes (0 items)');
      $('#addRaffleModal .error-icon-container').addClass('hidden');
      $('#addRaffleModal .form-control').css('border','1px solid #999');
      $('#cancelRaffleBtn').button('complete');
      $('#addRaffleModal .modal-body').scrollTop(0);
      $('.prize').remove();
    });
  }
}

function open_raffle(raffle_id) {
  $('#raffleInfoModal').modal({backdrop: 'static', keyboard: false})
  $.post('/raffle',
  {
    raffle_id:raffle_id
  },
  function(data){
    $('#raffleInfoModal .modal-dialog').html(data['template']);
  });
}

function get_raffle_participants() {
  $('#raffleParticipantsLoader').removeClass('hidden');
  $.get('/raffle/participants',
  function(data){
    $('.raffle-participants-container').html(data['template']);
    if (data['count'] == 1) {
      $('#raffleParticipantCount').html(String(data['count']) + ' entry');
    }
    else {
      $('#raffleParticipantCount').html(String(data['count']) + ' entries');
    }
    $('#raffleParticipantsLoader').addClass('hidden');
    $('#raffleParticipantCount').removeClass('hidden');
  });
}

function hide_participant_count() {
  $('#raffleParticipantCount').addClass('hidden');
}