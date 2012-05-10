var BootstrapModal = function(options){
    this.setOpts(options);
    this.init();
    return this.elem;
};

var BootstrapModalButtons = (function(){
    var buttons = {
        save: {
            label: 'Save Changes',
            beforeAction: function(){ this.continue(); },
            action: function(){ this.continue(); },
            primary: true
        },
        ok: {
            label: 'Okay',
            beforeAction: function(){ this.continue(); },
            action: function(){ this.continue(); },
            primary: true
        },
        close: {
            label: 'Close',
            beforeAction: function(){ this.continue(); },
            action: function(){ this.continue(); }
        }
    };
    
    return buttons;
})();

BootstrapModal.prototype = {
    defaultOpts: {
        html: '<div class="modal fade hide"><div class="modal-header"><a class="close" data-dismiss="modal">&times;</a><h3>Title</h3></div><div class="modal-body"></div><div class="modal-footer"></div></div>',
        text: '',
        body: '',
        autoShow: true,
        removeAfterHide: false,
        buttons: [
            BootstrapModalButtons.close
        ],
        keyboard: false,
        backdrop: true
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
            var btn = $(this),
                config = btn.data('config'),
                fns = [],
                fni = 0,
                event;
            
            // ----
            // LEGACY support
            if(config.beforeAction){
                fns.push(config.beforeAction);
            }
            // ----
            if(config.action){
                $.merge(fns, $.isArray(config.action) ? config.action : [config.action]);
            }
            
            fns.push(function(){
                //close the modal
                self.elem.modal('hide');
            });
            
            //event obj
            event = (function(){
                var loadingElem,
                    isLoading = false,
                    initLoading,
                    event,
                    fadeTime = 400;
                initLoading = function(){ 
                    loadingElem = $('<div class="loading"/>');
                    loadingElem.css({
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        top: '0',
                        left: '0',
                        background: 'rgba(255, 127, 127, 0.7)',
                        zIndex: '2100'
                    }).fadeTo(0,0);
                    self.elem.append(loadingElem);
                
                    //stop this function being called again                    
                    initLoading = function(){};
                };
                event = {
                    modalElem: self.elem,
                    continue: function(){
                        fni++;
                        fns[fni-1].call(event);
                        if(fni === fns.length){
                            event.continue = function(){};
                        }
                    },
                    stop: function(){},
                    showLoading: function(){
                        if(isLoading){
                            return;
                        }
                        initLoading();
                        isLoading = true;
                        loadingElem.fadeTo(fadeTime, 1);
                    },
                    closeLoading: function(){
                        isLoading = false;
                        loadingElem.fadeTo(fadeTime, 0);
                    }
                };
                return event;
            })();
            
            event.continue.call(event);
        });
        
        modal.on('hidden', function(event){
            if(self.opts.removeAfterHidden){
                self.elem.remove();
            }
        });
        
        //append the modal to the body
        this.elem.appendTo('body');

        this.elem.modal({
            keyboard: self.opts.keyboard,
            backdrop: 'static',
            show: this.opts.autoShow
        });
    },
    setOpts: function(opts){
        this.opts = $.extend(true, this.defaultOpts, opts);
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