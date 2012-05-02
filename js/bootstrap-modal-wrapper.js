var BootstrapModal = function(options){
    this.setOpts(options);
    this.init();
    return this.elem;
};

var BootstrapModalButtons = {
    save: {
        label: 'Save Changes',
        beforeAction: function(){ return true; },
        action: function(){ return true; },
        primary: true
    },
    ok: {
        label: 'Okay',
        beforeAction: function(){ return true; },
        action: function(){ return true; },
        primary: true
    },
    close: {
        label: 'Close',
        beforeAction: function(){ return true; },
        action: function(){ return true; }
    }
};

BootstrapModal.prototype = {
    defaultOpts: {
        html: '<div class="modal fade hide"><div class="modal-header"><a class="close" data-dismiss="modal">&times;</a><h3>Title</h3></div><div class="modal-body"></div><div class="modal-footer"></div></div>',
        text: '',
        body: '',
        autoShow: true,
        removeAfterHide: false,
        buttons: [
            BootstrapModalButtons.close
        ]
    },
    init: function(){
        var self = this;
    
        var options = this.opts;
        
        //query the modal for special children
        var modal = $(this.opts.html);
        var modalTitle = modal.find('.modal-header h3');
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
            var btn = $('<button class="btn" />');
            
            //set the button's label
            btn.text(value.label);
            
            //test if this is a primary button
            if(value.primary){
                //make the button primary
                btn.addClass('btn-primary');
            }
            
            btn.data('config', value);
        
            //add the button to the group of buttons
            btnGroup = btnGroup.add(btn);
        });
        
        //append the buttons to the modal footer
        btnGroup.appendTo(modalFooter);
        
        //set the id
        modal.attr('id', id);
        
        //return it
        this.elem = modal;
        
        //listen for clicks
        modalFooter.on('click', 'button', function(event){
            var btn = $(this);
            var config = btn.data('config');
            
            //try the before action
            if(config.beforeAction){
                if(!config.beforeAction()){
                    return;
                }
            }
            //try the action
            if(config.action){
                if(!config.action()){
                    return;
                }
            }
            //close the modal
            self.elem.modal('hide');
        });
        
        modal.on('hidden', function(event){
            if(self.opts.removeAfterHidden){
                self.elem.remove();
            }
        });
        
        //append the modal to the body
        this.elem.appendTo('body');
        
        if(this.opts.autoShow){
            this.elem.modal();
        }
    },
    setOpts: function(opts){
        this.opts = $.extend(this.defaultOpts, opts);
    },
    closeFunction: function(event){
        $(this).closest('.modal').modal('hide');
    }
};

var BootstrapConfirm = function(options, okayFunction, cancelFunction){

    var okayed = false;
    
    options.buttons = [
        $.extend(BootstrapModalButtons.ok, {
            action: function(event){
                okayed = true;
                return true;
            }
        }),
        BootstrapModalButtons.close
    ];
    
    //confirm dialog boxes are single use
    options.removeAfterClose = true;
    
    var confirm = new BootstrapModal(options);
    
    confirm.on('hidden', function(event){
        okayed ? okayFunction() : cancelFunction();
    });
    
    return confirm;
};