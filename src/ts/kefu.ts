/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../../vendor/loadscript/script.d.ts"/>

var kefu = angular.module("RongCloudkefu", ["RongWebIMWidget"]);



kefu.service("RongKefu", ["WebIMWidget", function(WebIMWidget: WebIMWidget) {
    var kefuServer = <KefuServer>{};
    var defaultconfig = <any>{
        __isCustomerService: true,
        showEvaluate:false
    };

    kefuServer.init = function(config) {
        angular.extend(defaultconfig, config);
        kefuServer._config = config;

        WebIMWidget.init({
            appkey: config.appkey,
            token: config.token,
            onSuccess: function(e) {
                config.onSuccess && config.onSuccess(e);
            },
        });
        WebIMWidget.onShow = function() {
            WebIMWidget.setConversation(WidgetModule.EnumConversationType.CUSTOMER_SERVICE, config.kefuId, "客服");
        }
        WebIMWidget.onCloseBefore = function(obj) {

            obj.close({ showEvaluate: defaultconfig.showEvaluate });
        }

    }

    kefuServer.show = function() {
        WebIMWidget.show();
    }

    kefuServer.hidden = function() {
        WebIMWidget.hidden();
    }

    kefuServer.KefuPostion = KefuPostion;

    return kefuServer;
}]);

interface KefuServer {
    init(config: KefuConfig): void
    show(): void
    hidden(): void
    KefuPostion: any
    _config: any
}

interface KefuConfig {
    appkey: string
    token: string
    kefuId: string
    position: KefuPostion
    onSuccess(par?: any): void
    showEvaluate?:boolean
}
enum KefuPostion {
    left = 1, right = 2
}
