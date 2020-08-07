'use strict';

angular.module('bahmni.common.ethiopianDateSelector').directive('ethiopianDateSelector', ['ethiopianGregorianService', function (ethiopianGregorianService) {
    return {
        restrict: 'E',
        template: '<div class="field-value"><input ng-required="required" ng-disabled="disabled" /></div>',
        scope: {
            date: "=",
            handler: "&",
            required: "=?",
            disabled: "=?",
            minDate: "=?"
        },
        link: function (scope, element, attrs) {
            $(element[0].childNodes[0].childNodes[0]).removeAttr('type');
            var DateUtil = Bahmni.Common.Util.DateUtil;
            var minDate = scope.minDate ? DateUtil.parse(scope.minDate) : null;
            var calendar = $.calendars.instance('ethiopian', 'am');
            $(element[0].childNodes[0].childNodes[0]).calendarsPicker({
                calendar: calendar,
                onSelect: function () {
                    var eth = $(element[0].childNodes[0].childNodes[0]).val();
                    var greg = DateUtil.parse(ethiopianGregorianService.ethToGreg(eth));
                    scope.date = greg;
                    scope.$apply();
                    scope.handler();
                    scope.$apply();
                },
                minDate: minDate ? ethiopianGregorianService.gregToEth((minDate.getMonth() + 1) + "/" + minDate.getDate() + "/" + minDate.getFullYear()) : null,
                holidays: Bahmni.Common.EthiopianDateSelector.constants.holidays
            });

            scope.$watch('date', function (val) {
                // calculate the ethiopian date based on the gregorian
                if (!val) return;
                var eth = ethiopianGregorianService.gregToEth((val.getMonth() + 1) + "/" + val.getDate() + "/" + val.getFullYear());
                $(element[0].childNodes[0].childNodes[0]).val(eth);
            });

            scope.handler();
        }
    };
}]).directive('ethiopianDateSelectorV2', ['ethiopianGregorianService', function (ethiopianGregorianService) {
    return {
        restrict: 'E',
        transclude: true,
        template: '<span ng-transclude></span>',
        scope: {
            date: "=",
            required: "=?",
            disabled: "=?",
            minDate: "=?",
            handler: "&"
        },
        link: function (scope, element, attrs) {
            $(element[0].childNodes[0].childNodes[1]).removeAttr('type');
            var DateUtil = Bahmni.Common.Util.DateUtil;
            var minDate = scope.minDate ? DateUtil.parse(scope.minDate) : null;
            var calendar = $.calendars.instance('ethiopian', 'am');
            $(element[0].childNodes[0].childNodes[1]).calendarsPicker({
                calendar: calendar,
                onSelect: function () {
                    var eth = $(element[0].childNodes[0].childNodes[1]).val();
                    var greg = DateUtil.parse(ethiopianGregorianService.ethToGreg(eth));
                    scope.date = greg;
                    scope.$apply();
                    scope.handler();
                    scope.$apply();
                },
                minDate: minDate ? ethiopianGregorianService.gregToEth((minDate.getMonth() + 1) + "/" + minDate.getDate() + "/" + minDate.getFullYear()) : null,
                holidays: Bahmni.Common.EthiopianDateSelector.constants.holidays
            });

            scope.$watch('date', function (val) {
                // calculate the ethiopian date based on the gregorian
                if (!val) return;
                var eth = ethiopianGregorianService.gregToEth((val.getMonth() + 1) + "/" + val.getDate() + "/" + val.getFullYear());
                $(element[0].childNodes[0].childNodes[1]).val(eth);
            });

            scope.handler();
        }
    };
}]).directive('ethiopianDateSelectorV3', ['ethiopianGregorianService', function (ethiopianGregorianService) {
    return {
        restrict: 'E',
        template: '<div class="field-value"><input /></div>',
        scope: {
            date: "=",
            handler: "=",
            handlerParam: "=",
            required: "=?",
            disabled: "=?",
            minDate: "=?"
        },
        link: function (scope, element, attrs) {
            $(element[0].childNodes[0].childNodes[0]).removeAttr('type');
            var DateUtil = Bahmni.Common.Util.DateUtil;
            var minDate = scope.minDate ? DateUtil.parse(scope.minDate) : null;
            var calendar = $.calendars.instance('ethiopian', 'am');
            $(element[0].childNodes[0].childNodes[0]).calendarsPicker({
                calendar: calendar,
                onSelect: function () {
                    var eth = $(element[0].childNodes[0].childNodes[0]).val();
                    var greg = Bahmni.Common.Util.DateUtil.parse(ethiopianGregorianService.ethToGreg(eth));
                    scope.date = greg;
                    scope.$apply();
                    scope.handler(scope.handlerParam);
                    scope.$apply();
                },
                minDate: minDate ? ethiopianGregorianService.gregToEth((minDate.getMonth() + 1) + "/" + minDate.getDate() + "/" + minDate.getFullYear()) : null,
                holidays: Bahmni.Common.EthiopianDateSelector.constants.holidays
            });

            scope.$watch('date', function (val) {
                // calculate the ethiopian date based on the gregorian
                if (!val) return;
                var eth = ethiopianGregorianService.gregToEth((val.getMonth() + 1) + "/" + val.getDate() + "/" + val.getFullYear());
                $(element[0].childNodes[0].childNodes[0]).val(eth);
            });

            scope.handler(scope.handlerParam);
        }
    };
}]);
