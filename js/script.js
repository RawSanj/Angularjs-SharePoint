var app = angular.module('myApp', ['ngAnimate', 'ui.bootstrap']);
app.filter('startFrom', function () {
    return function (input, start) {
        if (input) {
            start = +start;
            return input.slice(start);
        }
        return [];
    };
});

app.controller('PageCtrl', ['$scope', '$http', '$timeout', '$sce', 'filterFilter', function ($scope, $http, $timeout, $sce, filterFilter) {
    //Hide and Display section when JS libs are available or not.
    jQuery("#hideIfNoJS").removeClass("hidden");
    jQuery("#hideIfJS").addClass("hidden");
    $scope.editIssueUrl = "none";
    $scope.items = {};
    $scope.restAPICall = "Active Issues";
    $scope.collapseFilter = true;
    $scope.collapseSuccess = false;
    $scope.collapseDanger = false;
    $scope.collapseWarning = false;
    $scope.collapseMore = true;
    $scope.$watch('restAPICall', function (newVal, oldVal) {
        $scope.myClass = "displayimage";
        $scope.disableRelease = "Disabled";
        if ($scope.restAPICall=="Active Issues") {
            var restQuery = "Current eq true and SubcategoryValue ne "+"'"+"Enhancement"+"'"+" and StatusValue ne "+"'"+"Closed'";
        } else{
            var restQuery = "Release eq " + "'" + $scope.restAPICall + "'";
        };
        
        //To reset the Values
        $scope.initializenResetCount();

        $http.defaults.headers.common['Accept'] = 'application/json;odata=verbose';
        //console.log("http://sharepoint3.bankofamerica.com/sites/qualitymgmt/tm/_vti_bin/ListData.svc/IssueTracker?$filter="+ restQuery);
        var url = "http://sharepoint3.bankofamerica.com/sites/qualitymgmt/tm/_vti_bin/ListData.svc/IssueTracker?$select=Id,Title,ComponentValue,SeverityValue,TestStatusValue,StatusValue,Release,RootCauseValue,ExistInProdValue,RelatedStory&$filter=";
        $http.get(url+ restQuery).
            success(function(data) {
                $scope.items = data.d.results;
                $scope.myClass = "hideimage";
                $scope.disableRelease = "Enabled";
                //console.log(releaseName);
            
                $scope.countFunction();
            
                // create empty search model (object) to trigger $watch on update
                $scope.search = {};

                $scope.resetFilters = function () {
                // needs to be a function or it won't trigger a $watch
                $scope.search = {};
                };

                // pagination controls
                $scope.currentPage = 1;
                $scope.totalItems = $scope.items.length;
                $scope.entryLimit = 20; // items per page
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
    
    $scope.exportToXLS = function () {

        var datasheet1=[
            {'Severity':"0-Pending", 'Count': $scope.severityCount.pendingCount},
            {'Severity':"1-Critical", 'Count': $scope.severityCount.criticalCount},
            {'Severity':"2-High", 'Count': $scope.severityCount.highCount},
            {'Severity':"3-Medium", 'Count': $scope.severityCount.mediumCount},
            {'Severity':"4-Low", 'Count': $scope.severityCount.lowCount},
            {'Severity':"5-N/A", 'Count': $scope.severityCount.naCount},
            {'Severity':"", 'Count': ""},
            {'Severity':"Root Cause", 'Count': "Count"},
            {'Severity':"Code", 'Count': $scope.rootCauseCount.Code},
            {'Severity':"Data", 'Count': $scope.rootCauseCount.Data},
            {'Severity':"Script", 'Count': $scope.rootCauseCount.Script},
            {'Severity':"Working As Designed", 'Count': $scope.rootCauseCount.WorkingAsDesigned},
            {'Severity':"Missed Requirement", 'Count': $scope.rootCauseCount.MissedRequirement},
            {'Severity':"Requirement Updates", 'Count': $scope.rootCauseCount.RequirementUpdates},
            {'Severity':"User Education", 'Count': $scope.rootCauseCount.UserEducation},
            {'Severity':"Environmental", 'Count': $scope.rootCauseCount.Environmental},
            {'Severity':"Infrastructure", 'Count': $scope.rootCauseCount.Infrastructure},
            {'Severity':"Interface NotRunning", 'Count': $scope.rootCauseCount.InterfaceNotRunning},
            {'Severity':"Interfacing Application", 'Count': $scope.rootCauseCount.InterfacingApplication},
        ];

        var datasheet2 =[{
            Id:"test", Title:"test", Release:"test", Component:"test", 'Related to':"test", 'In Prod':"test", 
            Severity: "test", Status : "test", 'Test Status': "test"
        }];
        datasheet2.pop();

        angular.forEach($scope.items, function(value, key){
            datasheet2.push({
                Id: value.Id, Title: value.Title, Release:value.Release, Component:value.ComponentValue, 'Related to':value.RelatedStory, 'In Prod':value.ExistInProdValue, 
            Severity: value.SeverityValue, 'IT Status' : value.StatusValue, 'Test Status': value.TestStatusValue
            });
        });

        var data2 = [{a:100,b:10},{a:200,b:20}];
        var option = [{sheetid:'Report',header:true},{sheetid:'Issues',header:true}];

        alasql('SELECT INTO XLSX("Issue Tracker-'+$scope.restAPICall+'.xlsx",?) FROM ?', [option,[datasheet1,datasheet2]]);
    };

    $scope.initializenResetCount = function(){
         //Reset Old Values And
        //Object to store count of ITs by Severity Count
        $scope.severityCount = { "pendingCount": 0, "criticalCount": 0, "highCount": 0, "mediumCount": 0, "lowCount": 0, "naCount": 0,};
        
        //Object to store count of ITs by RootCause Count
        $scope.rootCauseCount = { "Code": 0, "Data": 0, "Script": 0, "WorkingAsDesigned": 0, "MissedRequirement": 0, "RequirementUpdates": 0,"UserEducation": 0,"Environmental": 0,"Infrastructure": 0,"InterfaceNotRunning": 0,"InterfacingApplication": 0 };

        //Object to store count of ITs by Component
        $scope.componentCount = {
            "DLA_Design_Console": 0,
            "Service_Request_Fulfillment": 0,    
            "DLA_Sys_Admin": 0,  
            "Performance": 0,    
            "Infrastructure": 0, 
            "Interfaces": 0, 
            "Change_Management": 0,  
            "DLA_Decom": 0,  
            "DLA_IT_Console": 0, 
            "Foundation_Data": 0,    
            "DLA_Equipment_Placement": 0,    
            "Reporting": 0,  
            "System_Administration": 0,  
            "Incident_Management": 0,    
            "DLA_SRM": 0,    
            "Event_Management": 0,   
            "Problem_Management": 0, 
            "DLA_Approval_Central": 0,   
            "Service_Asset_And_Configuration_Management": 0,   
            "Knowledge_Management": 0,   
            "Interface": 0,  
            "Release_And_Deployment_Management": 0,    
            "Not_Listed": 0, 
            "DLA_ITBM": 0,  
            "DLA_Interfaces": 0,
            "Service_Level_Management": 0,   
            "TechDirect": 0, 
            "Orchestrator": 0,   
            "ITSM_Interfaces": 0,    
            "Financial_Management": 0,   
            "DLA_Product_Catalog": 0,    
            "ITSM_Sys_Admin": 0, 
            "Change_Evaluation": 0,  
            "IRIS": 0,   
            "DLA_Demand_Forecast": 0,    
            "Service_Validation_&_Testing": 0,   
            "ITSM_Incident": 0,  
            "zDLA_SRM": 0
        };
        $scope.totalIssues = 0;

    };

    $scope.countFunction = function(){
        
        //Fucntion to add data in Object to store count of ITs by Severity Count and RootCause Count
            angular.forEach($scope.items, function(values, key){
                //console.log("I am inside forEach");
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
                if (values.RootCauseValue=="Code" || values.RootCauseValue=="Vendor Code") {
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


                ////For Component Count
                if (values.ComponentValue=="Change Management") {
                    $scope.componentCount.Change_Management += 1;
                };
                if (values.ComponentValue=="Incident Management") {
                    $scope.componentCount.Incident_Management += 1;
                };
                if (values.ComponentValue=="Problem Management") {
                    $scope.componentCount.Problem_Management += 1;
                };
                if (values.ComponentValue=="Knowledge Management") {
                    $scope.componentCount.Knowledge_Management += 1;
                };
                if (values.ComponentValue=="Event Management") {
                    $scope.componentCount.Event_Management += 1;
                };
                if (values.ComponentValue=="Service Asset & Configuration Management") {
                    $scope.componentCount.Service_Asset_And_Configuration_Management += 1;
                };
                if (values.ComponentValue=="Service Request Fulfillment") {
                    $scope.componentCount.Service_Request_Fulfillment += 1;
                };
                if (values.ComponentValue=="Release & Deployment Management") {
                    $scope.componentCount.Release_And_Deployment_Management += 1;
                };
                if (values.ComponentValue=="Change Evaluation") {
                    $scope.componentCount.Change_Evaluation += 1;
                };
                if (values.ComponentValue=="Foundation Data") {
                    $scope.componentCount.Foundation_Data += 1;
                };
                if (values.ComponentValue=="DLA - ITBM") {
                    $scope.componentCount.DLA_ITBM += 1;
                };
                if (values.ComponentValue=="DLA - SRM") {
                    $scope.componentCount.DLA_SRM += 1;
                };
                if (values.ComponentValue=="DLA Decom") {
                    $scope.componentCount.DLA_Decom += 1;
                };
                if (values.ComponentValue=="Interface" || values.ComponentValue=="Interfaces") {
                    $scope.componentCount.Interface += 1;
                };
                if (values.ComponentValue=="Infrastructure") {
                    $scope.componentCount.Infrastructure += 1;
                };
                if (values.ComponentValue=="Service Level Management") {
                    $scope.componentCount.Service_Level_Management += 1;
                };
                if (values.ComponentValue=="DLA Demand Forecast") {
                    $scope.componentCount.DLA_Demand_Forecast += 1;
                };

        });

        $scope.totalIssues = 
            $scope.severityCount.pendingCount + $scope.severityCount.criticalCount 
                + $scope.severityCount.highCount + $scope.severityCount.mediumCount
                + $scope.severityCount.lowCount + $scope.severityCount.naCount ;
        
        $scope.drawChart();

    };

    
    $scope.searchIssueById = function(issueId){
        $scope.isIssueExist = false;
        $scope.dataLoading = false;
        $http.get("http://sharepoint3.bankofamerica.com/sites/qualitymgmt/tm/_vti_bin/ListData.svc/IssueTracker?$filter=Id eq "+issueId).
        success(function(data) {
            $scope.searchReturnedById = data.d.results;
            if ($scope.searchReturnedById.length == 1) {
                $scope.isIssueExist = true;
                $scope.isArchieved = false;
                $scope.dataLoading = true;
            }
            else{   
                $http.get("http://sharepoint3.bankofamerica.com/sites/qualitymgmt/tm/_vti_bin/ListData.svc/IssueTrackerArchive?$filter=Id eq "+ issueId).
                success(function(data) {
                    $scope.searchReturnedById = data.d.results;
                    if ($scope.searchReturnedById.length == 1) {
                        $scope.isIssueExist = true;
                        $scope.isArchieved = true;
                        $scope.dataLoading = true;
                    };
                });
            };
        });
        //Timeout to force Issue-Not-found Modal to display if Issue doesnt exists
        $timeout(function(){
            $scope.dataLoading = true}, 2000); 
         
    };

    //Method no longer required since iFrame for Edit Issue is not working in IE11
    // $scope.editIssue = function(issueId){
    //     $scope.dataLoading =false;
    //     var trustedUrl = "http://sharepoint3.bankofamerica.com/sites/qualitymgmt/tm/Lists/IssueTracker/Issue/editifs.aspx?ID="+issueId;
    //     $scope.editIssueUrl = $sce.trustAsResourceUrl(trustedUrl);
    //     $timeout(function(){
    //         $scope.dataLoading = true}, 2000); 
    // };

    //Unused Testing function
    $scope.getReleaseNames = function(){
        $http.get("http://sharepoint3.bankofamerica.com/sites/qualitymgmt/tm/_vti_bin/ListData.svc/TestLibrary?$select=Release&$filter=ArchiveValue eq 'No' and IsRegression eq false").
        success(function(data) {
            $scope.listOfRelease = data.d.results;
            angular.forEach($scope.listOfRelease, function(value, key){
                console.log(value.Release);
            });
            console.log("No of items : "+$scope.listOfRelease.length);
        });

        function groupBy(items,propertyName)
        {
            var result = [];
            $.each(items, function(index, item) {
               if ($.inArray(item[propertyName], result)==-1) {
                  result.push(item[propertyName]);
               }
            });
            return result;
        }


        var catalog = { products: [
           { category: "Food & Dining"},
           { category: "Techonology"},
           { category: "Retail & Apparel"},
           { category: "Retail & Apparel"}
        ]};

        var categoryNames = groupBy(catalog.products, 'category'); //get distinct categories
        console.log(categoryNames);

    }


    $scope.reloadPage = function(){
        window.location.reload();
    };


    $scope.drawChart = function(){
        //AmChart Functions RootCause - Bar Chart
        var rootCauseChart = AmCharts.makeChart( "RootCauseChart", 
            {
              "type": "serial",
              "theme": "light",
              "startDuration": 2,
              "startEffect" : "bounce",
              "dataProvider": [ {
                "Root Cause": "Vendor Code / Code",
                "count": $scope.rootCauseCount.Code,
                "color": "#FF0F00"
              },
              {
                "Root Cause": "Script",
                "count": $scope.rootCauseCount.Script,
                "color": "#FF6600"
              },
              {
                "Root Cause": "Data",
                "count": $scope.rootCauseCount.Data,
                "color": "#FF9E01"
              }, {
                "Root Cause": "Working As Designed",
                "count": $scope.rootCauseCount.WorkingAsDesigned,
                "color": "#FCD202"
              }, {
                "Root Cause": "Missed Requirement",
                "count": $scope.rootCauseCount.MissedRequirement,
                "color": "#F8FF01"
              }, {
                "Root Cause": "Requirement Updates",
                "count": $scope.rootCauseCount.RequirementUpdates,
                "color": "#B0DE09"
              }, {
                "Root Cause": "User Education",
                "count": $scope.rootCauseCount.UserEducation,
                "color": "#04D215"
              }, {
                "Root Cause": "Environmental",
                "count": $scope.rootCauseCount.Environmental, 
                "color": "#0D8ECF"
              }, {
                "Root Cause": "Infrastructure",
                "count": $scope.rootCauseCount.Infrastructure,
                "color": "#0D52D1"
              }, {
                "Root Cause": "Interface Not Running",
                "count": $scope.rootCauseCount.InterfaceNotRunning,
                "color": "#2A0CD0"
              }, {
                "Root Cause": "InterfacingApplication",
                "count": $scope.rootCauseCount.InterfacingApplication,
                "color": "#8A0CCF"
              } ],
                "valueAxes": [{
                    "position": "left",
                    "title": "Issues by Root Cause"
                }],
                "graphs": [{
                    "balloonText": "[[category]]: <b>[[value]]</b>",
                    "fillColorsField": "color",
                    "fillAlphas": 1,
                    "lineAlpha": 0.1,
                    "type": "column",
                    "valueField": "count"
                }],
                "depth3D": 20,
                "angle": 30,
                "chartCursor": {
                    "categoryBalloonEnabled": false,
                    "cursorAlpha": 0,
                    "zoomable": false
                },    
                "categoryField": "Root Cause",
                "categoryAxis": {
                    "gridPosition": "start",
                    "labelRotation": 45
                },
                "export": {
                    "enabled": true
                 }
        },0);

        jQuery('.rootCauseChart-input').off().on('input change',function() {
            var property    = jQuery(this).data('property');
            var target      = rootCauseChart;
            rootCauseChart.startDuration = 0;

            if ( property == 'topRadius') {
                target = rootCauseChart.graphs[0];
                if ( this.value == 0 ) {
                  this.value = undefined;
                }
            }

            target[property] = this.value;
            rootCauseChart.validateNow();
        });

        //AmChart Functions Component - Cylinder Chart
        var componentChartVar = AmCharts.makeChart("componentChart", {
            "theme": "light",
            "type": "serial",
            "startDuration": 2,
            "dataProvider": [{
                "Component": "Change Management",
                "Count": $scope.componentCount.Change_Management,
                "color": "#FF0F00"
            }, {
                "Component": "Incident Management",
                "Count": $scope.componentCount.Incident_Management,
                "color": "#FF6600"
            }, {
                "Component": "Problem Management",
                "Count": $scope.componentCount.Problem_Management,
                "color": "#FF9E01"
            }, {
                "Component": "Knowledge Management",
                "Count": $scope.componentCount.Knowledge_Management,
                "color": "#FCD202"
            }, {
                "Component": "SACM",
                "Count": $scope.componentCount.Service_Asset_And_Configuration_Management,
                "color": "#F8FF01"
            }, {
                "Component": "SRF",
                "Count": $scope.componentCount.Service_Request_Fulfillment,
                "color": "#B0DE09"
            }, {
                "Component": "RDM",
                "Count": $scope.componentCount.Release_And_Deployment_Management,
                "color": "#04D215"
            }, {
                "Component": "Foundation Data",
                "Count": $scope.componentCount.Foundation_Data,
                "color": "#0D8ECF"
            }, {
                "Component": "DLA Decom",
                "Count": $scope.componentCount.DLA_Decom,
                "color": "#0D52D1"
            }],
            "valueAxes": [{
                "position": "left",
                "title": "Issues by Component",
                "axisAlpha":0,
                "gridAlpha":0         
            }],
            "graphs": [{
                "balloonText": "[[category]]: <b>[[value]]</b>",
                "colorField": "color",
                "fillAlphas": 0.85,
                "lineAlpha": 0.1,
                "type": "column",
                "topRadius":1,
                "valueField": "Count"
            }],
            "depth3D": 40,
            "angle": 30,
            "chartCursor": {
                "categoryBalloonEnabled": false,
                "cursorAlpha": 0,
                "zoomable": false
            },    
            "categoryField": "Component",
            "categoryAxis": {
                "gridPosition": "start",
                "labelRotation": 30,
                "axisAlpha":0,
                "gridAlpha":0
                
            },
            "export": {
                "enabled": true
             }

        },0);

        jQuery('.componentChartVar-input').off().on('input change',function() {
            var property    = jQuery(this).data('property');
            var target      = componentChartVar;
            componentChartVar.startDuration = 0;

            if ( property == 'topRadius') {
                target = componentChartVar.graphs[0];
            }

            target[property] = this.value;
            componentChartVar.validateNow();
        });


        //AmChart Functions Severity - Pie Chart
        var severityChartVar = AmCharts.makeChart( "severityChart", {
              "type": "pie",
              "theme": "light",
              "startEffect": "bounce",
              "startDuration": 2,
              "titles": [
                {
                    "text": "Issues by Severity",
                    "size": 15
                }
                ],
              "dataProvider": [ {
                "Severity": "0-Pending",
                "Count": $scope.severityCount.pendingCount
              }, {
                "Severity": "1-Critical",
                "Count": $scope.severityCount.criticalCount
              }, {
                "Severity": "2-High",
                "Count": $scope.severityCount.highCount
              }, {
                "Severity": "3-Medium",
                "Count": $scope.severityCount.mediumCount
              }, {
                "Severity": "4-Low",
                "Count": $scope.severityCount.lowCount
              }, {
                "Severity": "5-N/A",
                "Count": $scope.severityCount.naCount
              } ],
              "valueField": "Count",
              "titleField": "Severity",
              "outlineAlpha": 0.4,
              "depth3D": 20,
              "balloonText": "[[title]]<br><span style='font-size:14px'><b>[[value]]</b> ([[percents]]%)</span>",
              "angle": 30,
              "export": {
                "enabled": true
              }
        } );
        jQuery( '.severityChartVar-input' ).off().on( 'input change', function() {
          var property = jQuery( this ).data( 'property' );
          var target = severityChartVar;
          var value = Number( this.value );
          severityChartVar.startDuration = 0;

          if ( property == 'innerRadius' ) {
            value += "%";
          }

          target[ property ] = value;
          severityChartVar.validateNow();
        } );
    };



}]);
