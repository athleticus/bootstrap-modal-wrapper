(function($, window){

    function object(o){
        function F(){}
        F.prototype = o;
        return new F();
    }

    var BootstrapModal = function(options){
        var self = object(BoostrapModalFns);
        self.setOpts(options);
        self.init();
        return self.elem;
    };

    var defaultAction = function(){
        this.continue();
    };

    var buttons = {};

    var getButton = function(name){
        var btn = buttons[name];
        if(!btn){
            throw new Error('There is no button defined with the index of "' + name + '".');
        }
        return $.extend(true, {}, btn);
    };

    var extendButton = function(){
        var args = Array.prototype.slice.call(arguments);
        var name = args.shift();
        var btn = buttons[name];
        if(!btn){
            throw new Error('There is no button defined with the index of "' + name + '".');
        }
        args = [true, {}, btn].concat(args);
        return $.extend.apply($, args);
    };

    var addButton = function(name, button){
        var btn = $.extend({}, button);
        
        if(!btn.beforeAction){
            btn.beforeAction = defaultAction;
        }
        
        if(!btn.action){
            btn.action = defaultAction;
        }

        buttons[name] = btn;
    };

    var BoostrapModalFns = {
        defaultOpts: {
            html: '<div class="modal fade hide"><div class="modal-header"><a class="close" data-dismiss="modal">&times;</a><h3>Title</h3></div><div class="modal-body"></div><div class="modal-footer"></div></div>',
            text: '',
            body: '',
            autoShow: true,
            removeAfterHide: false,
            buttons: [
                'close'
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
            var id = options.id || 'modal-'+(new Date().getTime());
            
            //create an empty jquery object to hold the buttons
            var btnGroup = $();
            //iterate over the buttons and create them
            $.each(options.buttons, function(key, value){

                //if button (value) is a string, get the button object
                if(typeof value === 'string'){
                    value = getButton(value);
                }
            
                //copy the button
                value = $.extend({}, value);
            
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
            this.opts = $.extend(true, {}, this.defaultOpts, opts);
        },
        closeFunction: function(event){
            $(this).closest('.modal').modal('hide');
        }
    };

    var BootstrapConfirm = function(options, okayFunction, cancelFunction){

        var okayed = false;
        
        options.buttons = [
            extendButton('ok', {
                action: function(){
                    okayed = true;
                    this.continue();
                }
            }),
            'close'
        ];
        
        //confirm dialog boxes are single use
        options.removeAfterClose = true;
        
        var confirm = new BootstrapModal(options);
        
        confirm.on('hidden', function(event){
            okayed ? okayFunction() : cancelFunction();
        });
        
        return confirm;
    };

    var createModal = function(){
        var args = Array.prototype.slice.call(arguments);
        return BootstrapModal.apply(BootstrapModal, args);
    };

    var createConfirm = function(){
        var args = Array.prototype.slice.call(arguments);
        return BootstrapConfirm.apply(BootstrapConfirm, args);
    };

    var returnObj = $.proxy(createModal, {});

    returnObj.getButton = getButton;
    returnObj.addButton = addButton;
    returnObj.extendButton = extendButton;
    returnObj.createModal = createModal;
    returnObj.createConfirm = createConfirm;

    window.BootstrapModal = returnObj;

    //add default buttons
    addButton('save', {
        label: 'Save Changes',
        beforeAction: defaultAction,
        action: defaultAction,
        primary: true
    });
    addButton('ok', {
        label: 'Okay',
        beforeAction: defaultAction,
        action: defaultAction,
        primary: true
    });
    addButton('close', {
        label: 'Close',
        beforeAction: defaultAction,
        action: defaultAction
    });

})(jQuery, window);