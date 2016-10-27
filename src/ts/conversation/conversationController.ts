/// <reference path="../../../typings/tsd.d.ts"/>
/// <reference path="../../lib/window.d.ts"/>


var conversationController = angular.module("RongWebIMWidget.conversationController", ["RongWebIMWidget.conversationServer"]);


conversationController.controller("conversationController", ["$scope",
    "conversationServer", "WebIMWidget", "conversationListServer", "widgetConfig", "providerdata","Product",
    function($scope: any, conversationServer: ConversationServer,
        WebIMWidget: WebIMWidget, conversationListServer: conversationListServer,
        widgetConfig: widgetConfig, providerdata: providerdata,Product:any) {

        var ImageDomain = "http://7xogjk.com1.z0.glb.clouddn.com/";
        var notExistConversation = true;
        var qiniuuploader;

        $scope.$parent.myScrollOptions = {
            'wrapper': {
                snap: false,
                click: true
            },
        };

        $scope.refreshiScroll = function() {
            setTimeout(function() {
                var sc = $scope.$parent.myScroll['wrapper'];
                console.log(sc);
                sc.refresh();
                sc.scrollTo(0, sc.wrapperHeight - sc.scrollerHeight);
            }, 500);
        };

        var position = 0;
        function recordPosition() {
            var sc = $scope.$parent.myScroll['wrapper'];
            position = sc.scrollerHeight - sc.y;
        }
        function scrollToRecord(){
            setTimeout(function() {
                var sc = $scope.$parent.myScroll['wrapper'];
                console.log(sc);
                sc.refresh();
                sc.scrollTo(0, position - sc.scrollerHeight);
            }, 500);
        }

        $scope.$watch("WebIMWidget.display", function(newVal, oldVal) {
            if (newVal === oldVal) {

            } else if (newVal == true) {
                $scope.refreshiScroll();
            }
        });
        conversationServer.show = function() {
            $scope.showSelf = true;
        };
        conversationServer.hidden = function() {
            $scope.showSelf = false;
        }

        $scope.currentConversation = <WidgetModule.Conversation>{
            title: "",
            targetId: "",
            targetType: 0
        }

        $scope.uploadingImgList = [];
        $scope.messageList = [];

        $scope.messageContent = "";

        $scope.WebIMWidget = WebIMWidget;
        $scope.widgetConfig = widgetConfig;
        $scope.conversationServer = conversationServer;
        $scope._inputPanelState = WidgetModule.InputPanelType.person;

        $scope.showSelf = false;


        //显示表情
        $scope.showemoji = false;
        $scope.showMoreOpt = false;
        document.getElementById("wrapper").addEventListener("touchstart", function() {
            $scope.$apply(function() {
                $scope.showemoji = false;
                $scope.showMoreOpt = false;
            });
        });


        $scope.$watch("showemoji", function(newVal, oldVal) {
            if (newVal === oldVal)
                return;
            // if (newVal) {
            //     $scope.wrapperbottom = {
            //         bottom: "9rem"
            //     }
            // } else {
            //     $scope.wrapperbottom = {
            //         bottom: "1.5rem"
            //     }
            // }
            $scope.refreshiScroll();
        });

        $scope.$watch("currentConversation.messageContent", function(newVal: string, oldVal: string) {
            if (newVal === oldVal)
                return;
            if ($scope.currentConversation) {
                RongIMLib.RongIMClient.getInstance().saveTextMessageDraft(+$scope.currentConversation.targetType, $scope.currentConversation.targetId, newVal)
            }
        });

        $scope.$watch("_inputPanelState", function(newVal, oldVal) {
            if (newVal === oldVal) {
                return;
            }
            if (newVal == WidgetModule.InputPanelType.person) {
                // setTimeout(function() {
                //     qiniuuploader && qiniuuploader.destroy();
                //     console.log($("#uploadfile").length);console.log($("#uploadfile").width());console.log($("#uploadfile").height());
                //     uploadFileInit();
                // });
            } else {
                //qiniuuploader && qiniuuploader.destroy();
            }
        });
        $scope.$watch("showSelf", function(newVal, oldVal) {
            if (newVal === oldVal) {
                return;
            }
            if (newVal) {
                $scope.refreshiScroll();
                // setTimeout(function() {
                //     qiniuuploader && qiniuuploader.destroy();
                //     console.log($("#uploadfile").length);console.log($("#uploadfile").width());console.log($("#uploadfile").height());
                //     uploadFileInit();
                // }, 1000);
            } else {
                //qiniuuploader && qiniuuploader.destroy();
            }
        });

        conversationServer.onConversationChangged = function(conversation: WidgetModule.Conversation) {

            if (widgetConfig.displayConversationList) {
                $scope.showSelf = true;
                conversationListServer.showSelf = false;
                $scope.WebIMWidget.display = true;
            } else {
                $scope.showSelf = true;
                $scope.WebIMWidget.display = true;
            }

            if (conversation && conversation.targetType == WidgetModule.EnumConversationType.CUSTOMER_SERVICE && (!conversationServer.current || conversationServer.current.targetId != conversation.targetId)) {
                RongIMLib.RongIMClient.getInstance().startCustomService(conversation.targetId, {
                    onSuccess: function() {

                    },
                    onError: function() {
                        console.log("连接客服失败");
                    }
                })
            }

            //会话为空清除页面各项值
            if (!conversation || !conversation.targetId) {
                $scope.messageList = [];
                $scope.currentConversation = null;
                conversationServer.current = null;
                setTimeout(function() {
                    $scope.$apply();
                })
                return;
            }
            conversationServer.current = conversation;
            $scope.currentConversation = conversation;


            //TODO:获取历史消息

            conversationServer._cacheHistory[conversation.targetType + "_" + conversation.targetId] = conversationServer._cacheHistory[conversation.targetType + "_" + conversation.targetId] || []

            var currenthis = conversationServer._cacheHistory[conversation.targetType + "_" + conversation.targetId] || [];
            if (currenthis.length == 0) {
                conversationServer._getHistoryMessages(+conversation.targetType, conversation.targetId, 3).then(function(data) {
                    $scope.messageList = conversationServer._cacheHistory[conversation.targetType + "_" + conversation.targetId];
                    if ($scope.messageList.length > 0) {
                        $scope.messageList.unshift(new WidgetModule.TimePanl($scope.messageList[0].sentTime));
                        if (data.has) {
                            $scope.messageList.unshift(new WidgetModule.GetMoreMessagePanel());
                        }
                        // adjustScrollbars();
                        $scope.refreshiScroll();
                    }
                });
            } else {
                $scope.messageList = currenthis;
            }

            //TODO:获取草稿
            $scope.currentConversation.messageContent = RongIMLib.RongIMClient.getInstance().getTextMessageDraft(+$scope.currentConversation.targetType, $scope.currentConversation.targetId) || "";
            setTimeout(function() {
                $scope.$apply();
            })
        }



        conversationServer.onReceivedMessage = function(msg: WidgetModule.Message) {
            // $scope.messageList.splice(0, $scope.messageList.length);
            if ($scope.currentConversation && msg.targetId == $scope.currentConversation.targetId && msg.conversationType == $scope.currentConversation.targetType) {
                $scope.$apply();
                var systemMsg = null;
                switch (msg.messageType) {
                    case WidgetModule.MessageType.HandShakeResponseMessage:
                        conversationServer._customService.type = msg.content.data.serviceType;
                        conversationServer._customService.companyName = msg.content.data.companyName;
                        conversationServer._customService.robotName = msg.content.data.robotName;
                        conversationServer._customService.robotIcon = msg.content.data.robotIcon;
                        conversationServer._customService.robotWelcome = msg.content.data.robotWelcome;
                        conversationServer._customService.humanWelcome = msg.content.data.humanWelcome;
                        conversationServer._customService.noOneOnlineTip = msg.content.data.noOneOnlineTip;

                        if (msg.content.data.serviceType == "1") {//仅机器人
                            changeInputPanelState(WidgetModule.InputPanelType.robot);
                            msg.content.data.robotWelcome && (systemMsg = packReceiveMessage(RongIMLib.TextMessage.obtain(msg.content.data.robotWelcome), WidgetModule.MessageType.TextMessage));
                        } else if (msg.content.data.serviceType == "3") {
                            msg.content.data.robotWelcome && (systemMsg = packReceiveMessage(RongIMLib.TextMessage.obtain(msg.content.data.robotWelcome), WidgetModule.MessageType.TextMessage));
                            changeInputPanelState(WidgetModule.InputPanelType.robotSwitchPerson);
                        } else {
                            // msg.content.data.humanWelcome && (systemMsg = packReceiveMessage(RongIMLib.TextMessage.obtain(msg.content.data.humanWelcome), WidgetModule.MessageType.TextMessage));
                            changeInputPanelState(WidgetModule.InputPanelType.person);
                        }
                        $scope.evaluate.valid = false;
                        setTimeout(function() {
                            $scope.evaluate.valid = true;
                        }, 60 * 1000);

                        break;
                    case WidgetModule.MessageType.ChangeModeResponseMessage:
                        switch (msg.content.data.status) {
                            case 1:
                                conversationServer._customService.human.name = msg.content.data.name || "客服人员";
                                conversationServer._customService.human.headimgurl = msg.content.data.headimgurl;
                                changeInputPanelState(WidgetModule.InputPanelType.person);
                                break;
                            case 2:
                                if (conversationServer._customService.type == "2") {
                                    changeInputPanelState(WidgetModule.InputPanelType.person);
                                } else if (conversationServer._customService.type == "1" || conversationServer._customService.type == "3") {
                                    changeInputPanelState(WidgetModule.InputPanelType.robotSwitchPerson);
                                }
                                break;
                            case 3:
                                changeInputPanelState(WidgetModule.InputPanelType.robot);
                                systemMsg = packReceiveMessage(RongIMLib.InformationNotificationMessage.obtain("你被拉黑了"), WidgetModule.MessageType.InformationNotificationMessage);
                                break;
                            case 4:
                                changeInputPanelState(WidgetModule.InputPanelType.person);
                                systemMsg = packReceiveMessage(RongIMLib.InformationNotificationMessage.obtain("已经是人工了"), WidgetModule.MessageType.InformationNotificationMessage);
                                break;
                            default:
                                break;
                        }
                        break;
                    case WidgetModule.MessageType.TerminateMessage:
                        //关闭客服
                        if (msg.content.code == 0) {
                            $scope.evaluate.CSTerminate = true;
                            $scope.close();
                        } else {
                            if (conversationServer._customService.type == "1") {
                                changeInputPanelState(WidgetModule.InputPanelType.robot);
                            } else {
                                changeInputPanelState(WidgetModule.InputPanelType.robotSwitchPerson);
                            }
                        }

                        break;
                    case WidgetModule.MessageType.CustomerStatusUpdateMessage:
                        switch (Number(msg.content.serviceStatus)) {
                            case 1:
                                if (conversationServer._customService.type == "1") {
                                    changeInputPanelState(WidgetModule.InputPanelType.robot);
                                } else {
                                    changeInputPanelState(WidgetModule.InputPanelType.robotSwitchPerson);
                                }
                                break;
                            case 2:
                                changeInputPanelState(WidgetModule.InputPanelType.person);
                                break;
                            case 3:
                                changeInputPanelState(WidgetModule.InputPanelType.notService);
                                break;
                            default:
                                break;
                        }
                        break;
                    default:
                        break;
                }

                if (systemMsg) {
                    var wmsg = WidgetModule.Message.convert(systemMsg);
                    addCustomService(wmsg);
                    conversationServer._addHistoryMessages(wmsg);
                }

                addCustomService(msg);

                setTimeout(function() {
                    // adjustScrollbars();
                    $scope.refreshiScroll();
                }, 200);
            }
        }



        conversationServer._onConnectSuccess = function() {
            RongIMLib.RongIMClient.getInstance().getFileToken(RongIMLib.FileType.IMAGE, {
                onSuccess: function(data) {
                    conversationServer._uploadToken = data.token;
                    var prodGuid = getUrlVar("prodGuid");
                    if(prodGuid){
                        $scope.sendProd(prodGuid);
                    }
                    // setTimeout(function() {
                    //     console.log($("#uploadfile").length);console.log($("#uploadfile").width());console.log($("#uploadfile").height());
                    //     uploadFileInit();
                    // }, 1000);
                    

                }, onError: function() {

                }
            })
        }


        $scope.getHistory = function() {
            recordPosition();
            var arr = conversationServer._cacheHistory[$scope.currentConversation.targetType + "_" + $scope.currentConversation.targetId];
            arr.splice(0, arr.length);
            conversationServer._getHistoryMessages(+$scope.currentConversation.targetType, $scope.currentConversation.targetId, 20).then(function(data) {
                $scope.messageList = conversationServer._cacheHistory[$scope.currentConversation.targetType + "_" + $scope.currentConversation.targetId];
                $scope.messageList.unshift(new WidgetModule.TimePanl($scope.messageList[0].sentTime));
                if (data.has) {
                    conversationServer._cacheHistory[$scope.currentConversation.targetType + "_" + $scope.currentConversation.targetId].unshift(new WidgetModule.GetMoreMessagePanel());
                }
                // adjustScrollbars();
                // $scope.refreshiScroll();
                scrollToRecord();
            });
        }

        $scope.getMoreMessage = function() {
            recordPosition();
            conversationServer._cacheHistory[$scope.currentConversation.targetType + "_" + $scope.currentConversation.targetId].shift();
            conversationServer._cacheHistory[$scope.currentConversation.targetType + "_" + $scope.currentConversation.targetId].shift();

            conversationServer._getHistoryMessages(+$scope.currentConversation.targetType, $scope.currentConversation.targetId, 20).then(function(data) {
                $scope.messageList = conversationServer._cacheHistory[$scope.currentConversation.targetType + "_" + $scope.currentConversation.targetId];
                $scope.messageList.unshift(new WidgetModule.TimePanl($scope.messageList[0].sentTime));
                if (data.has) {
                    conversationServer._cacheHistory[$scope.currentConversation.targetType + "_" + $scope.currentConversation.targetId].unshift(new WidgetModule.GetMoreMessagePanel());
                }
                // $scope.refreshiScroll();
                scrollToRecord();
            });
        }

        function addCustomService(msg: WidgetModule.Message) {
            if (msg.conversationType == WidgetModule.EnumConversationType.CUSTOMER_SERVICE && msg.content) {
                if (conversationServer._customService.currentType == "1") {
                    msg.content.userInfo = {
                        name: conversationServer._customService.human.name || "客服人员",
                        portraitUri: conversationServer._customService.human.headimgurl || conversationServer._customService.robotIcon,
                    }
                } else {
                    msg.content.userInfo = {
                        name: conversationServer._customService.robotName,
                        portraitUri: conversationServer._customService.robotIcon,
                    }
                }
            }
            return msg;
        }

        var changeInputPanelState = function(type) {
            $scope._inputPanelState = type;
            if (type == WidgetModule.InputPanelType.person) {
                $scope.evaluate.type = 1;
                conversationServer._customService.currentType = "1";
                conversationServer.current.title = conversationServer._customService.human.name || "客服人员";
            } else {
                $scope.evaluate.type = 2;
                conversationServer._customService.currentType = "2";
                conversationServer.current.title = conversationServer._customService.robotName;
            }
        }

        function packDisplaySendMessage(msg: any, messageType: string) {
            var ret = new RongIMLib.Message();
            var userinfo = new RongIMLib.UserInfo(conversationServer.loginUser.id, conversationServer.loginUser.name || "我", conversationServer.loginUser.portraitUri);
            msg.user = userinfo;
            ret.content = msg;
            ret.conversationType = $scope.currentConversation.targetType;
            ret.targetId = $scope.currentConversation.targetId;
            ret.senderUserId = conversationServer.loginUser.id;

            ret.messageDirection = RongIMLib.MessageDirection.SEND;
            ret.sentTime = (new Date()).getTime() - RongIMLib.RongIMClient.getInstance().getDeltaTime();
            ret.messageType = messageType;

            return ret;
        }

        function packReceiveMessage(msg: any, messageType: string) {
            var ret = new RongIMLib.Message();
            var userinfo = null;
            msg.userInfo = userinfo;
            ret.content = msg;
            ret.conversationType = $scope.currentConversation.targetType;
            ret.targetId = $scope.currentConversation.targetId;
            ret.senderUserId = $scope.currentConversation.targetId;

            ret.messageDirection = RongIMLib.MessageDirection.RECEIVE;
            ret.sentTime = (new Date()).getTime() - RongIMLib.RongIMClient.getInstance().getDeltaTime();
            ret.messageType = messageType;

            return ret;
        }


        function closeState() {

            if (WebIMWidget.onClose && typeof WebIMWidget.onClose === "function") {
                WebIMWidget.onClose($scope.currentConversation);
            }
            if (widgetConfig.displayConversationList) {
                $scope.showSelf = false;
                conversationListServer.showSelf = true;
            } else {
                // $scope.WebIMWidget.display = false;
                $scope.showSelf = false;
            }
            $scope.messageList = [];
            $scope.currentConversation = null;
            conversationServer.current = null;
        }

        $scope.evaluate = {
            type: 1,
            showevaluate: false,
            valid: false,
            CSTerminate: false,
            onConfirm: function(data) {
                //发评价
                if (data) {
                    if ($scope.value == 1) {
                        RongIMLib.RongIMClient.getInstance().evaluateHumanCustomService(conversationServer.current.targetId, data.stars, data.describe, {
                            onSuccess: function() {

                            }
                        })
                    } else {
                        RongIMLib.RongIMClient.getInstance().evaluateRebotCustomService(conversationServer.current.targetId, data.value, data.describe, {
                            onSuccess: function() {

                            }
                        })
                    }
                }
                RongIMLib.RongIMClient.getInstance().stopCustomeService(conversationServer.current.targetId, {
                    onSuccess: function() {

                    },
                    onError: function() {

                    }
                });

                closeState();
            },
            onCancle: function() {
                RongIMLib.RongIMClient.getInstance().stopCustomeService(conversationServer.current.targetId, {
                    onSuccess: function() {

                    },
                    onError: function() {

                    }
                });
                closeState();
            }
        }

        $scope.close = function() {
            if (WebIMWidget.onCloseBefore && typeof WebIMWidget.onCloseBefore === "function") {
                var isClose = WebIMWidget.onCloseBefore({
                    close: function(data) {
                        if (data.showEvaluate && conversationServer.current.targetType == WidgetModule.EnumConversationType.CUSTOMER_SERVICE) {
                            if ($scope.evaluate.valid) {
                                $scope.evaluate.showevaluate = true;
                            } else {
                                $scope.evaluate.onCancle();
                            }
                        } else {
                            closeState();
                        }
                    }
                });
            } else {
                if (conversationServer.current.targetType == WidgetModule.EnumConversationType.CUSTOMER_SERVICE) {
                    if ($scope.evaluate.valid) {
                        $scope.evaluate.showevaluate = true;
                    } else {
                        $scope.evaluate.onCancle();
                    }
                } else {
                    closeState();
                }
            }
        }


        $scope.send = function() {
            if (!$scope.currentConversation.targetId || !$scope.currentConversation.targetType) {
                alert("请先选择一个会话目标。")
                return;
            }
            if ($scope.currentConversation.messageContent == "") {
                return;
            }


            var con = RongIMLib.RongIMEmoji.symbolToEmoji($scope.currentConversation.messageContent);

            var msg = RongIMLib.TextMessage.obtain(con);
            var userinfo = new RongIMLib.UserInfo(conversationServer.loginUser.id, conversationServer.loginUser.name, conversationServer.loginUser.portraitUri);

            msg.user = userinfo;

            RongIMLib.RongIMClient.getInstance().sendMessage(+$scope.currentConversation.targetType, $scope.currentConversation.targetId, msg, {
                onSuccess: function(retMessage: RongIMLib.Message) {

                    conversationListServer.updateConversations().then(function() {

                    });
                },
                onError: function(error) {
                    console.log(error);
                }
            });

            var content = packDisplaySendMessage(msg, WidgetModule.MessageType.TextMessage);

            var cmsg = WidgetModule.Message.convert(content);
            conversationServer._addHistoryMessages(cmsg);
            // $scope.messageList.push();

            // adjustScrollbars();
            $scope.refreshiScroll();
            $scope.currentConversation.messageContent = ""
            if (!$scope.showemoji) {
                var obj = document.getElementById("inputMsg");
                WidgetModule.Helper.getFocus(obj);
            }
        }

        $scope.minimize = function() {
            WebIMWidget.display = false;
        }

        $scope.switchPerson = function() {
            RongIMLib.RongIMClient.getInstance().switchToHumanMode(conversationServer.current.targetId, {
                onSuccess: function() {

                },
                onError: function() {

                }
            })
        }

        $scope.onInputElmFocus = function(){
            //$scope.showemoji = !$scope.showemoji;
            if($scope.showMoreOpt){
                $scope.showMoreOpt = false;
            }
        }

        $scope.toggleEmojiKeyboard = function(){
            $scope.showemoji = !$scope.showemoji;
            if($scope.showMoreOpt){
                $scope.showMoreOpt = false;
            }
        }
        $scope.toggleMoreOptions = function(){
            if($scope.showemoji){
                $scope.showemoji = !$scope.showemoji;
            }

            if($scope.showMoreOpt){
                $scope.showMoreOpt = false;
            }else{
                $scope.showMoreOpt = true;
                setTimeout(function(){uploadFileInit();},500);
            }
            

        }
        $scope.removeUploadingImg = function(file){
            return;
            // qiniuuploader.stop();
            // qiniuuploader.removeFile(file);
            // qiniuuploader.start();
            // $.each($scope.uploadingImgList,function(index,item){
            //     if(item.id == file.id){
            //         $scope.uploadingImgList.splice(index,1);
            //         return false;
            //     }
            // });
            // console.log(qiniuuploader.files);
        }
        var refreshToken = setInterval(function() {
            conversationServer._onConnectSuccess();
        }, 10 * 60 * 1000);

        function uploadFileInit() {

            if(qiniuuploader){return;}
            qiniuuploader = Qiniu.uploader({
                // runtimes: 'html5,flash,html4',
                runtimes: 'html5,html4',
                browse_button: 'uploadfile',
                // browse_button: 'upload',
                //container: 'funcPanel',
                drop_element: 'Messages',
                max_file_size: '100mb',
                // flash_swf_url: '/widget/images/Moxie.swf',
                dragdrop: true,
                chunk_size: '4mb',
                // uptoken_url: "http://webim.demo.rong.io/getUploadToken",
                uptoken: conversationServer._uploadToken,
                domain: ImageDomain,
                get_new_uptoken: false,
                unique_names: true,
                filters: {
                    mime_types: [{ title: "Image files", extensions: "jpg,gif,png" }],
                    prevent_duplicates: false
                },
                multi_selection: false,
                auto_start: true,
                resize:{width : 750,  height:750,quality : 70, crop: false},
                init: {
                    'FilesAdded': function(up: any, files: any) {

                        $.each(files,function(index,file){
                            WidgetModule.Helper.ImageHelper.getThumbnail(files[0].getNative(), 60000, function(obj: any, data: any) {
                                file.dataImg = data;
                                //$timeout(,1000);
                                $scope.$apply(function(){
                                    $scope.uploadingImgList.push(file);
                                    });
                            });
                        });
                        
                        
                        $scope.$apply(function(){
                            $scope.showMoreOpt = false;
                        });
                    },
                    'BeforeUpload': function(up: any, file: any) {
                        if (!$scope.currentConversation.targetId || !$scope.currentConversation.targetType) {
                            $scope.uploadingImgList = [];
                            alert("请先选择一个会话目标。");
                            return;
                        }
                    },
                    'UploadProgress': function(up: any, file: any) {
                        console.log(file);
                        $scope.$apply();
                    },
                    'UploadComplete': function() {
                    },
                    'FileUploaded': function(up: any, file: any, info: any) {
                        
                        $.each($scope.uploadingImgList,function(index,item){
                            if(item.id == file.id){
                                
                                //$timeout(,1000);
                                $scope.$apply(function(){
                                    $scope.uploadingImgList.splice(index,1);
                                });
                                return false;
                            }
                        });

                        info = JSON.parse(info);
                        RongIMLib.RongIMClient.getInstance().getFileUrl(RongIMLib.FileType.IMAGE, file.target_name, {
                            onSuccess: function(url) {

                                WidgetModule.Helper.ImageHelper.getThumbnail(file.getNative(), 60000, function(obj: any, data: any) {
                                    var im = RongIMLib.ImageMessage.obtain(data, url.downloadUrl);

                                    var content = packDisplaySendMessage(im, WidgetModule.MessageType.ImageMessage);
                                    RongIMLib.RongIMClient.getInstance().sendMessage($scope.currentConversation.targetType, $scope.currentConversation.targetId, im, {
                                        onSuccess: function() {
                                            conversationListServer.updateConversations().then(function() {

                                            });
                                        },
                                        onError: function() {

                                        }
                                    })
                                    conversationServer._addHistoryMessages(WidgetModule.Message.convert(content));
                                    $scope.$apply();
                                    $scope.refreshiScroll();
                                })

                            },
                            onError: function() {

                            }
                        });
                    },
                    'Error': function(up: any, err: any, errTip: any) {
                        console.log(errTip);
                    }
                }
            });
        }


        function getUrlVar(name) {

        var url = document.URL;
        var oRegex = new RegExp('[\?&]' + name + '=([^&]+)', 'i');

        var oMatch = oRegex.exec(url);
        if (oMatch && oMatch.length > 1)
            return oMatch[1];
        else
            return '';
    }

    $scope.sendProd = function(guid){
            
        //Product.getProd(prodGuid).then(function(product){
        //         var prodName = product.ProductName;
        //         var prodGuid = prodGuid;
        //         var prodImg = product.ProductSpec[0].image;

        //     });
        
        if (!$scope.currentConversation.targetId || !$scope.currentConversation.targetType) {
                alert("请先选择一个会话目标。")
                return;
            }


            var prodName = "产品标题";
        var prodDesc = "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";
        var prodGuid = "xxxx-xxx-xxxx-xxx";
        var prodImg = "http://ic1.zhendeyouliao.com/UpFiles/Images/Product/16011319522973394.jpg";
        var urlPrefix = window.location.protocol + "//" + window.location.host;
        var prodUrl = urlPrefix + "/Product/ProductIntro.aspx?guid="+prodGuid;
            var con = "询问："+prodName + "\n" + prodUrl;

            var msg = RongIMLib.TextMessage.obtain(con);
            var userinfo = new RongIMLib.UserInfo(conversationServer.loginUser.id, conversationServer.loginUser.name, conversationServer.loginUser.portraitUri);

            msg.user = userinfo;

            RongIMLib.RongIMClient.getInstance().sendMessage(+$scope.currentConversation.targetType, $scope.currentConversation.targetId, msg, {
                onSuccess: function(retMessage: RongIMLib.Message) {

                    conversationListServer.updateConversations().then(function() {

                    });
                },
                onError: function(error) {
                    console.log(error);
                }
            });

            var content = packDisplaySendMessage(msg, WidgetModule.MessageType.TextMessage);

            var cmsg = WidgetModule.Message.convert(content);
            conversationServer._addHistoryMessages(cmsg);
            
            $scope.refreshiScroll();


        

        // var im = RongIMLib.RichContentMessage.obtain(prodName, prodDesc, prodImg,"");

        // var content = packDisplaySendMessage(im, WidgetModule.MessageType.RichContentMessage);
        // RongIMLib.RongIMClient.getInstance().sendMessage($scope.currentConversation.targetType, $scope.currentConversation.targetId, im, {
        //     onSuccess: function() {
        //         console.log("onSuccess");
        //         conversationListServer.updateConversations().then(function() {});
        //     },
        //     onError: function() {
        //         console.log("onError");
        //     }
        // });
        // conversationServer._addHistoryMessages(WidgetModule.Message.convert(content));
        // if(!$scope.$$phase){
        //     $scope.$apply();
        // }
        
        // $scope.refreshiScroll();
        }


    }]);
