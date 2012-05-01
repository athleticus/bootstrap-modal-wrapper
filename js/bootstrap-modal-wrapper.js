var modalWrapper = function(options){
    
    //the html shell for a modal
    var modalHtml = '<div class="modal fade hide"><div class="modal-header"><a class="close" data-dismiss="modal">&times;</a><h3>Title</h3></div><div class="modal-body"></div><div class="modal-footer"></div></div>';
    
    //close function
    var closeFunction = function(event){
        $(this).closest('.modal').modal('hide');
    }
    
    //if buttons have not been defined, use the defaults
    if(typeof options.buttons === 'undefined'){
        options.buttons = [modalWrapperButtons.close];
    }
    
    //query the modal for special children
    var modal = $(modalHtml);
    var modalTitle = modal.find('h3');
    var modalBody = modal.find('.modal-body');
    var modalFooter = modal.find('.modal-footer');
    
    if(typeof options.title === 'string'){
        //append the title
        modalTitle.text(options.title);
    } else {
        modal.find('.modal-header').remove();
    }
    
    //test if simple text has been set
    if(typeof options.text === 'string'){
        options.body = '<p>'+options.text+'</p>'
    }
    
    //append the body
    modalBody.append(options.body);
    
    //get a unique id
    var id = 'modal-'+(new Date().getTime());
    
    //create an empty jquery object to hold the buttons
    var btnGroup = $();
    //iterate over the buttons and create them
    $.each(options.buttons, function(key, value){
    
        //create the button
        var btn = $('<button class="btn"/>');
        
        //set the button's label
        btn.text(value.label);
        
        //test if this is a primary button
        if(value.primary){
            //make the button primary
            btn.addClass('btn-primary');
        }
        
        //test if the button is set to close the modal
        if(value.close){
            //close the modal when the button is clicked
            btn.on('click', closeFunction);
        }
        
        //test if the modal has an action defined
        if(typeof value.action === 'function'){
            //call the modal's action when it is clicked
            btn.on('click', value.action);
        }
    
        //add the button to the group of buttons
        btnGroup = btnGroup.add(btn);
    });
    
    //append the buttons to the modal footer
    btnGroup.appendTo(modalFooter);
    
    //set the id
    modal.attr('id', id);
    
    //append the modal to the body
    modal.appendTo('body');
    
    //return it
    return modal;
    
}

var modalConfirm = function(options, okay, cancel){

    var okayed = false;
    
    options.buttons = [
        $.extend(modalWrapperButtons.ok, {
            action: function(event){
                okayed = true;
                $(this).closest('.modal').modal('hide');
            },
            close: false
        }),
        modalWrapperButtons.close
    ];
    
    var modal = modalWrapper(options);
    
    modal.on('hidden', function(event){
        if(okayed){
            okay.call();
        } else {
            if(typeof cancel === 'function'){
                cancel.call();
            }
        }
    });
    
    modal.on('show', function(event){
        okayed = false;
    });
    
    return modal;
    
}

//default modal buttons
var modalWrapperButtons = {

    save: {
        label: 'Save Changes',
        close: true,
        primary: true
    },
    ok: {
        label: 'Okay',
        close: true,
        primary: true
    },
    close: {
        label: 'Close',
        close: true    
    }
};