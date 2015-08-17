var app = angular.module('myApp', ['ui.bootstrap']);
app.filter('startFrom', function () {
	return function (input, start) {
		if (input) {
			start = +start;
			return input.slice(start);
		}
		return [];
	};
});

app.controller('PageCtrl', ['$scope', '$http', 'filterFilter', function ($scope, $http, filterFilter) {
	$scope.items = {};
	$scope.releaseNames = "Remedy Release 4.0";

    $scope.$watch('releaseNames', function (newVal, oldVal) {
        $scope.myClass = "displayimage";
        var releaseName = "'" + $scope.releaseNames + "'";
    	$http.defaults.headers.common['Accept'] = 'application/json;odata=verbose';
    	//$http.get('http://sharepoint3.bankofamerica.com/sites/qualitymgmt/tm/_vti_bin/ListData.svc/CoreMembers').
        $http.get("http://sharepoint3.bankofamerica.com/sites/qualitymgmt/tm/_vti_bin/ListData.svc/IssueTracker?$filter=Release eq "+ releaseName).
            success(function(data) {
        	$scope.items = data.d.results;
        	$scope.myClass = "hideimage";
            console.log(releaseName);
        	//Object to store count of ITs by Severity Count
        	$scope.severityCount = { "pendingCount": 0, "criticalCount": 0, "highCount": 0, "mediumCount": 0, "lowCount": 0, "naCount": 0,};
        	//Object to store count of ITs by RootCause Count
        	$scope.rootCauseCount = { "Code": 0, "Data": 0, "Script": 0, "WorkingAsDesigned": 0, "MissedRequirement": 0, "RequirementUpdates": 0,"UserEducation": 0,"Environmental": 0,"Infrastructure": 0,"InterfaceNotRunning": 0,"InterfacingApplication": 0 };

        	//Fucntion to add data in Object to store count of ITs by Severity Count and RootCause Count
        	angular.forEach($scope.items, function(values, key){

        		//For Severity Count
        		if (values.SeverityValue=="0-Pending") {
        			$scope.severityCount.pendingCount += 1;
        		};
        		if (values.SeverityValue=="1-Critical") {
        			$scope.severityCount.criticalCount += 1;
        		};
        		if (values.SeverityValue=="2-High") {
        			$scope.severityCount.highCount += 1;
        		};
        		if (values.SeverityValue=="3-Medium") {
        			$scope.severityCount.mediumCount += 1;
        		};
        		if (values.SeverityValue=="4-Low") {
        			$scope.severityCount.lowCount += 1;
        		};  
        		if (values.SeverityValue=="5-N/A") {
        			$scope.severityCount.naCount += 1;
        		};

        		//For RootCause Count
        		if (values.RootCauseValue=="Code") {
        			$scope.rootCauseCount.Code += 1;
        		};
    			if (values.RootCauseValue=="Data") {
        			$scope.rootCauseCount.Data += 1;
        		};
    			if (values.RootCauseValue=="Script") {
        			$scope.rootCauseCount.Script += 1;
        		};
    			if (values.RootCauseValue=="Working As Designed") {
        			$scope.rootCauseCount.WorkingAsDesigned += 1;
        		};
    			if (values.RootCauseValue=="Missed Requirement") {
        			$scope.rootCauseCount.MissedRequirement += 1;
        		};
    			if (values.RootCauseValue=="Requirement Updates") {
        			$scope.rootCauseCount.RequirementUpdates += 1;
        		};
    			if (values.RootCauseValue=="User Education") {
        			$scope.rootCauseCount.UserEducation += 1;
        		};
    			if (values.RootCauseValue=="Environmental") {
        			$scope.rootCauseCount.Environmental += 1;
        		};
    			if (values.RootCauseValue=="Infrastructure") {
        			$scope.rootCauseCount.Infrastructure += 1;
        		};
    			if (values.RootCauseValue=="Interface Not Running") {
        			$scope.rootCauseCount.InterfaceNotRunning += 1;
        		};
    			if (values.RootCauseValue=="Interfacing Application") {
        			$scope.rootCauseCount.InterfacingApplication += 1;
        		};


        	});

        

            // create empty search model (object) to trigger $watch on update
            $scope.search = {};

            $scope.resetFilters = function () {
                // needs to be a function or it won't trigger a $watch
                $scope.search = {};
            };

            // pagination controls
            $scope.currentPage = 1;
            $scope.totalItems = $scope.items.length;
            $scope.entryLimit = 50; // items per page
            $scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);

            // $watch search to update pagination
            $scope.$watch('search', function (newVal, oldVal) {
                $scope.filtered = filterFilter($scope.items, newVal);
                $scope.totalItems = $scope.filtered.length;
                $scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);
                $scope.currentPage = 1;
            }, true);


    	 });

    }, true);





}]);
