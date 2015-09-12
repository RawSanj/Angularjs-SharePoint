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

    //Release Names for Type Ahead.
    $scope.inputReleaseValues = ['Remedy Release 4.0','Remedy Release 4.2','Remedy 14.2.F.01','Remedy Release 3.4','Remedy Release 4.0.2','Remedy Release 1.3.1','Remedy Release 1.6','Remedy Release 2.2.2','Remedy Release 2.2.1','Remedy Release 3.1.1','BizTalk Upgrade','Remedy Release 1.3','Remedy elease 1.6a','Remedy Release 1.2','Remedy Release 1.5','Remedy Release 1.4','Regression','Regression - Auto','Remedy Release 1.2.1','IRIS','Remedy elease 2.2','Remedy Release 2.1','Remedy Release 2.3','Remedy Release 3.0','Remedy Release 3.1','Remedy Release 3.2','Remedy Release 2.0'];
    $scope.editIssueUrl = "none";
    $scope.items = {};
    $scope.restAPICall = "Active Issues";
    $scope.collapseFilter = true;
    $scope.collapseSuccess = false;
    $scope.collapseDanger = false;
    $scope.collapseWarning = false;
    $scope.collapseMore = true;
    $scope.$watch('restAPICall', function (newVal, oldVal) {
        //clear field for placeholder.
        $scope.inputRelease = "";
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
        //console.log("http://sharepoint.yourcompany.com/_vti_bin/ListData.svc/IssueTracker?$filter="+ restQuery);
        var url = "http://sharepoint.yourcompany.com/_vti_bin/ListData.svc/IssueTracker?$select=Id,Title,ComponentValue,SeverityValue,TestStatusValue,StatusValue,Release,RootCauseValue,ExistInProdValue,RelatedStory&$filter=";
        //Remove comment from below line of code to call Rest API of SharePoint
        //$http.get(url+ restQuery).
        //Calling a dummy Rest API lib for displaying result in Console
        $http.get("http://it-ebooks-api.info/v1/search/java").
            success(function(data) {
                console.log(data);
                //Remove comment from below line of code to use data returned from SharePoint
                //$scope.items = data.d;
                //Putting dummay data instead of Data returned from SharePoint
                if ($scope.restAPICall=="Remedy Release 3.2") {
                    data = Release32;
                } else if ($scope.restAPICall=="Remedy Release 2.0") {
                    data = Release2;
                } else if ($scope.restAPICall=="Remedy Release 3.0") {
                    data = Release3;
                } else if ($scope.restAPICall=="Remedy Release 4.0") {
                    data = Release4;
                } else{
                    data = ActiveIssues;
                };
                $scope.items = data.d;
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
                $scope.entryLimit = 15; // items per page
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
        console.log("Exporting data into Excel");

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

        console.log("Export Complete");
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
        //Remove comment from below line of code to call Rest API of SharePoint
        //$http.get("http://sharepoint.yourcompany.com/_vti_bin/ListData.svc/IssueTracker?$filter=Id eq "+issueId).
        //Calling a dummy Rest API lib for displaying result in Console
        $http.get("http://it-ebooks-api.info/v1/search/java").
        success(function(data) {
            if (issueId<1000) {
                $scope.searchReturnedById = IDlessThan1k.d.results; 
            } else 
            if (issueId<2000) {
                $scope.searchReturnedById = IDlessThan2k.d.results;
            } else
            if (issueId<3000) {
                $scope.searchReturnedById = IDlessThan3k.d.results;
            } else{
                $scope.searchReturnedById = "";
            };
            //Remove comment from below line of code to use data returned from SharePoint
            //$scope.searchReturnedById = data.d.results;
            if ($scope.searchReturnedById.length == 1) {
                $scope.isIssueExist = true;
                $scope.isArchieved = false;
                $scope.dataLoading = true;
            }
        });
        //Timeout to force Issue-Not-found Modal to display if Issue doesnt exists
        $timeout(function(){
            $scope.dataLoading = true}, 2000); 
         
    };

    //Method no longer required since iFrame for Edit Issue is not working in IE11
    // $scope.editIssue = function(issueId){
    //     $scope.dataLoading =false;
    //     var trustedUrl = "http://sharepoint.yourcompany.com//Lists/IssueTracker/Issue/editifs.aspx?ID="+issueId;
    //     $scope.editIssueUrl = $sce.trustAsResourceUrl(trustedUrl);
    //     $timeout(function(){
    //         $scope.dataLoading = true}, 2000); 
    // };

    //Unused Testing function
    $scope.getReleaseNames = function(){
        $http.get("http://sharepoint.yourcompany.com/_vti_bin/ListData.svc/TestLibrary?$select=Release&$filter=ArchiveValue eq 'No' and IsRegression eq false").
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





    // --------- DUMMY DATA ------------------

    //Active Issues data -
    var ActiveIssues =  {
          "d": [
            {
              "Release": "Production Found",
              "ExistInProdValue": "Yes",
              "Title": "When searching for EARC components in SRM Design Console, Autosys Agent can't be found.",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Failed",
              "StatusValue": "Open",
              "RootCauseValue": null,
              "Id": 641,
              "ComponentValue": "DLA Design Console",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Production Found",
              "ExistInProdValue": "Yes",
              "Title": "Design Console data issue",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Failed",
              "StatusValue": "Open",
              "RootCauseValue": "New Feature",
              "Id": 787,
              "ComponentValue": "DLA Design Console",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Production Found",
              "ExistInProdValue": "Yes",
              "Title": "Getting Maximo error for Server/Storage decoms",
              "SeverityValue": "1-Critical",
              "TestStatusValue": "Failed",
              "StatusValue": "New",
              "RootCauseValue": null,
              "Id": 866,
              "ComponentValue": "Incident Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Production Found",
              "ExistInProdValue": "Yes",
              "Title": "Incorrect Service Levels reported in SR Detail report.",
              "SeverityValue": "1-Critical",
              "TestStatusValue": "Failed",
              "StatusValue": "Open",
              "RootCauseValue": null,
              "Id": 1074,
              "ComponentValue": "Incident Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Production Found",
              "ExistInProdValue": "Yes",
              "Title": "For same server DLA Request, there are two work items generated",
              "SeverityValue": "0-Pending",
              "TestStatusValue": "Pending",
              "StatusValue": "In Review",
              "RootCauseValue": null,
              "Id": 1168,
              "ComponentValue": "DLA Design Console",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Production Found",
              "ExistInProdValue": "Yes",
              "Title": "Maximo/Biztalk sends multiple messages to IPCenter for same txn",
              "SeverityValue": "1-Critical",
              "TestStatusValue": "Failed",
              "StatusValue": "Open",
              "RootCauseValue": null,
              "Id": 1427,
              "ComponentValue": "Interfaces",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Production Found",
              "ExistInProdValue": "Yes",
              "Title": "CEW Reporting drops product lines",
              "SeverityValue": "2-High",
              "TestStatusValue": "Failed",
              "StatusValue": "Open",
              "RootCauseValue": null,
              "Id": 1521,
              "ComponentValue": "Incident Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Production Found",
              "ExistInProdValue": "Yes",
              "Title": "AI job for AD OUs failing because of retired servers",
              "SeverityValue": "2-High",
              "TestStatusValue": "Failed",
              "StatusValue": "Open",
              "RootCauseValue": null,
              "Id": 1722,
              "ComponentValue": "Change Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Production Found",
              "ExistInProdValue": "Yes",
              "Title": " MAXIMO - Requests need to be closed (forc-closed).",
              "SeverityValue": "1-Critical",
              "TestStatusValue": "Failed",
              "StatusValue": "Open",
              "RootCauseValue": null,
              "Id": 1746,
              "ComponentValue": "Incident Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Production Found",
              "ExistInProdValue": "Yes",
              "Title": "Maximo- Request Mgmt:  Unable to retain date change.",
              "SeverityValue": "1-Critical",
              "TestStatusValue": "Failed",
              "StatusValue": "Open",
              "RootCauseValue": null,
              "Id": 1751,
              "ComponentValue": "Change Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Production Found",
              "ExistInProdValue": "Yes",
              "Title": "hk.apac.london.com.com DNS domain missing.",
              "SeverityValue": "1-Critical",
              "TestStatusValue": "Failed",
              "StatusValue": "Open",
              "RootCauseValue": null,
              "Id": 1756,
              "ComponentValue": "Change Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Production Found",
              "ExistInProdValue": "Yes",
              "Title": "Missing Service Request 81256 from the IT Console.",
              "SeverityValue": "2-High",
              "TestStatusValue": "Not Applicable",
              "StatusValue": "Open",
              "RootCauseValue": null,
              "Id": 1889,
              "ComponentValue": "Change Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Production Found",
              "ExistInProdValue": "Yes",
              "Title": "REM>MXO incidents won't go to CLOSED because dispatches are in COMP status",
              "SeverityValue": "4-Low",
              "TestStatusValue": "Failed",
              "StatusValue": "Open",
              "RootCauseValue": null,
              "Id": 1924,
              "ComponentValue": "Change Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Production Found",
              "ExistInProdValue": "Yes",
              "Title": "Old Service Requests in the IT Console that should have been closed.",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Failed",
              "StatusValue": "Open",
              "RootCauseValue": null,
              "Id": 1927,
              "ComponentValue": "Change Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Production Found",
              "ExistInProdValue": "Yes",
              "Title": "eSmart report quantities inaccurate for server decom's when multiple hostnames provided",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Failed",
              "StatusValue": "Open",
              "RootCauseValue": null,
              "Id": 1980,
              "ComponentValue": "Change Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Production Found",
              "ExistInProdValue": "Yes",
              "Title": "IIS services not discovered in SRM decom requests",
              "SeverityValue": "4-Low",
              "TestStatusValue": "Failed",
              "StatusValue": "Open",
              "RootCauseValue": null,
              "Id": 2000,
              "ComponentValue": "Change Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Production Found",
              "ExistInProdValue": "Yes",
              "Title": "Cannot find requests in IT Home Global Search",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Failed",
              "StatusValue": "Open",
              "RootCauseValue": null,
              "Id": 2014,
              "ComponentValue": "Change Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Production Found",
              "ExistInProdValue": "Yes",
              "Title": "Workorder fields are blank or missing to some fulfillment users",
              "SeverityValue": "0-Pending",
              "TestStatusValue": "Failed",
              "StatusValue": "Open",
              "RootCauseValue": null,
              "Id": 2028,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Production Found",
              "ExistInProdValue": "Yes",
              "Title": "System does not detect active storage on LKCMA0EA",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Failed",
              "StatusValue": "Open",
              "RootCauseValue": null,
              "Id": 2047,
              "ComponentValue": "DLA Decom",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Production Found",
              "ExistInProdValue": "Yes",
              "Title": "Application Messaging Removal Work Orders are being routed to a Middleware support team",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Failed",
              "StatusValue": "New",
              "RootCauseValue": null,
              "Id": 2058,
              "ComponentValue": "DLA - SRM",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Production Found",
              "ExistInProdValue": "Yes",
              "Title": "The link of the associated work orders which are relate to a another work order is not working. ",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Failed",
              "StatusValue": "Open",
              "RootCauseValue": null,
              "Id": 2073,
              "ComponentValue": "DLA IT Console",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Production Found",
              "ExistInProdValue": "Yes",
              "Title": "Multiple approvals assigned to same manager for one request",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Failed",
              "StatusValue": "Open",
              "RootCauseValue": null,
              "Id": 2079,
              "ComponentValue": "DLA Decom",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Production Found",
              "ExistInProdValue": "Yes",
              "Title": "User added a CI TAPMLB10VA host name,0014053 serial number to maximo on 10/23 however it's still not available in ITSM nor in RTT",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Failed",
              "StatusValue": "New",
              "RootCauseValue": null,
              "Id": 2109,
              "ComponentValue": "DLA - SRM",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Production Found",
              "ExistInProdValue": "Yes",
              "Title": "DLA Server Decom - Duplicate Server name with different serial numbers.",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Failed",
              "StatusValue": "Open",
              "RootCauseValue": null,
              "Id": 2297,
              "ComponentValue": "DLA Decom",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Production Found",
              "ExistInProdValue": "Yes",
              "Title": "Request  NOT at Mgr Approval Queue and Not to me the Delegate - Request REQ000000129524 ",
              "SeverityValue": "0-Pending",
              "TestStatusValue": "Failed",
              "StatusValue": "Open",
              "RootCauseValue": null,
              "Id": 3067,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Production Found",
              "ExistInProdValue": "Yes",
              "Title": "Re-Opened Network Request is placed into a Server queue",
              "SeverityValue": "0-Pending",
              "TestStatusValue": "Pending",
              "StatusValue": "In Progress",
              "RootCauseValue": null,
              "Id": 3112,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Production Found",
              "ExistInProdValue": "Yes",
              "Title": "Database work order not created for Decom DB server",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Failed",
              "StatusValue": "Open",
              "RootCauseValue": null,
              "Id": 3160,
              "ComponentValue": "DLA Decom",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Production Found",
              "ExistInProdValue": "Yes",
              "Title": "Auto Cancellation NOT automatic set to YES on Service Request",
              "SeverityValue": "2-High",
              "TestStatusValue": "Failed",
              "StatusValue": "Open",
              "RootCauseValue": null,
              "Id": 3163,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Production Found",
              "ExistInProdValue": "Yes",
              "Title": "Requests fail to complete approval process during prod code install",
              "SeverityValue": "0-Pending",
              "TestStatusValue": "Failed",
              "StatusValue": "In Review",
              "RootCauseValue": null,
              "Id": 3193,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Production Found",
              "ExistInProdValue": "Yes",
              "Title": " Incorrect routing for DBSE-GMRT-SQL-US",
              "SeverityValue": "0-Pending",
              "TestStatusValue": "Failed",
              "StatusValue": "New",
              "RootCauseValue": null,
              "Id": 3205,
              "ComponentValue": "DLA Sys Admin",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Production Found",
              "ExistInProdValue": "Yes",
              "Title": "Unable to to generate workorders",
              "SeverityValue": "0-Pending",
              "TestStatusValue": "Failed",
              "StatusValue": "Open",
              "RootCauseValue": null,
              "Id": 3222,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Production Found",
              "ExistInProdValue": "Yes",
              "Title": "REQ 138494 for TFN Engineering Team, work order not generated",
              "SeverityValue": "0-Pending",
              "TestStatusValue": "Failed",
              "StatusValue": "Open",
              "RootCauseValue": null,
              "Id": 3223,
              "ComponentValue": "Problem Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Production Found",
              "ExistInProdValue": "Yes",
              "Title": "Issue with the data orphaning of maximo while merged to remedy",
              "SeverityValue": "2-High",
              "TestStatusValue": "Failed",
              "StatusValue": "Open",
              "RootCauseValue": null,
              "Id": 3235,
              "ComponentValue": "Problem Management",
              "RelatedStory": "Not Applicable"
            }
          ]
        };

        //Release 4.0
        var Release4 = {
          "d": [
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "SRWizRequester values are incorrect when using On Behalf Of",
              "SeverityValue": "4-Low",
              "TestStatusValue": "Failed",
              "StatusValue": "Closed",
              "RootCauseValue": "Vendor Code",
              "Id": 5032,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Circuit CI created before 20 minutes not appearing in BMC Asset data set ",
              "SeverityValue": "1-Critical",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Infrastructure",
              "Id": 5156,
              "ComponentValue": "Service Asset & Configuration Management",
              "RelatedStory": "E2E Circuit CI"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Computer System CI: CI not moving to BMC.Asset",
              "SeverityValue": "1-Critical",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Infrastructure",
              "Id": 5157,
              "ComponentValue": "Service Asset & Configuration Management",
              "RelatedStory": "E2E Asset_Computer_System"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "AI Job Error - CI Bulk Upload is not working. CIs are not getting related and long error message is displayed on More Info.",
              "SeverityValue": "1-Critical",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Environmental",
              "Id": 5158,
              "ComponentValue": "Change Management",
              "RelatedStory": "E2E Change #2"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Load Errors received while creating/updating the CIs using Data Load functionality",
              "SeverityValue": "1-Critical",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Infrastructure",
              "Id": 5159,
              "ComponentValue": "Service Asset & Configuration Management",
              "RelatedStory": "E2E Asset_Computer_System"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Error message is displayed when we click on the Add/Modify Infrastructure Demand Link \"You have no access permission to the form BAC:ITBM:ForecastDemand\"",
              "SeverityValue": "4-Low",
              "TestStatusValue": "Pending",
              "StatusValue": "Closed",
              "RootCauseValue": "User Education",
              "Id": 5161,
              "ComponentValue": "DLA - ITBM",
              "RelatedStory": "E2E_ITBM_8.1"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Resource Adjustment Request  is getting cancelled. ",
              "SeverityValue": "5-N/A",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "User Education",
              "Id": 5200,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "SMORE-13784"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Search Knowledge is not displayed under functions menu for Change users: LDT7411/LDT7417",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Data",
              "Id": 5206,
              "ComponentValue": "Change Management",
              "RelatedStory": "SMORE-14291"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "In Server name field's drop down list getting closed on clicking down Arrow in dropdown list ",
              "SeverityValue": "5-N/A",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Working As Designed",
              "Id": 5208,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "SMORE-13784"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Region, Site Group and Site information is not displayed in the Impacted Areas for a different Problem Coordinator.",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Script",
              "Id": 5209,
              "ComponentValue": "Problem Management",
              "RelatedStory": "SMORE-14679"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "Yes",
              "Title": "Error Message \"You have no access permission to the form RKM:CreateNewKnowledgeArticle. (ARERR 9264)\" is displayed .",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Security",
              "Id": 5210,
              "ComponentValue": "Problem Management",
              "RelatedStory": "SMORE-14475"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "Yes",
              "Title": "Displaying error message as 'You have no access permission to the form RKM:CreateNewKnowledgeArticle. (ARERR 9264)' when clicking on Create Knowledge with LDT7302-LDT7315",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Security",
              "Id": 5212,
              "ComponentValue": "Problem Management",
              "RelatedStory": "SMORE-14926"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Nothing displays When performed Basic search.",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Security",
              "Id": 5213,
              "ComponentValue": "Knowledge Management",
              "RelatedStory": "SMORE-14412"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Error being displayed as \nYou have no access to form : AST:BusinessService (ARERR 353) ",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Security",
              "Id": 5214,
              "ComponentValue": "Knowledge Management",
              "RelatedStory": "SMORE-14017"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "Yes",
              "Title": "Task Assignment Email notification for requests is not sent to mapped corp2 ID.",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Working As Designed",
              "Id": 5216,
              "ComponentValue": "Incident Management",
              "RelatedStory": "SMORE-14513"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "An Overlapped text Display on label of Advance Search  filter",
              "SeverityValue": "4-Low",
              "TestStatusValue": "Failed",
              "StatusValue": "Closed",
              "RootCauseValue": "Vendor Code",
              "Id": 5217,
              "ComponentValue": "Knowledge Management",
              "RelatedStory": "SMORE-14412"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Basic Search is not working, Showing 0 entries for any CRQ while the same CRQ is displayed using Advanced search",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Security",
              "Id": 5219,
              "ComponentValue": "Knowledge Management",
              "RelatedStory": "SMORE-14482"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "Yes",
              "Title": "Error message 'Either the Form List is empty or forms do not have any FTS fields in the AR System Multi-Form Search form : formList=3571;3573;3579;3584;3585 (ARERR 691)' is displayed when trying to search for KM article using basic search",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Environmental",
              "Id": 5220,
              "ComponentValue": "Knowledge Management",
              "RelatedStory": "SMORE-14926"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "Yes",
              "Title": "Getting an error when clicked on Search Knowledge base. ",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Environmental",
              "Id": 5221,
              "ComponentValue": "Knowledge Management",
              "RelatedStory": "SMORE-14925"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "Yes",
              "Title": "Error message displays when click on Search Knowledge base",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Environmental",
              "Id": 5222,
              "ComponentValue": "Knowledge Management",
              "RelatedStory": "SMORE-14294"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Its displaying error message when trying to select the highest impact value of CI while restarting CRQ from Rejected ",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Requirement Updates",
              "Id": 5223,
              "ComponentValue": "Change Management",
              "RelatedStory": "SMORE-14123"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "Yes",
              "Title": "Error Message is getting displayed when we search the Article Title or Problem ID using Basic search option ",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Environmental",
              "Id": 5224,
              "ComponentValue": "Knowledge Management",
              "RelatedStory": "SMORE-14475"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Error is displaying with 'Resource Adjustment-Post Adjustment Validation' task fulfillment window.",
              "SeverityValue": "5-N/A",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Unable to Reproduce",
              "Id": 5225,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "SMORE-13784"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Text value is displayed as 'Please select the preferred area code.' instead of 'What is the preferred notification method of received and failed faxes?'",
              "SeverityValue": "4-Low",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Data",
              "Id": 5226,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "SMORE-14665"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "As per pre requisite  : Error Message is displayed while creating the realtionship as \"IMPACT\" between CI ",
              "SeverityValue": "4-Low",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Data",
              "Id": 5227,
              "ComponentValue": "Change Management",
              "RelatedStory": "SMORE-14445"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "No email notification send for requestor regarding rejection.",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Workflow/Escalation",
              "Id": 5229,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "SMORE-14666"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "\"Manufacturer\" word is misspelled in Error file.",
              "SeverityValue": "4-Low",
              "TestStatusValue": "Failed",
              "StatusValue": "Closed",
              "RootCauseValue": "Code",
              "Id": 5231,
              "ComponentValue": "Service Asset & Configuration Management",
              "RelatedStory": "SMORE-14277"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "The date fields on CI under Lifecycle section do not match the values entered in load template.",
              "SeverityValue": "5-N/A",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Working As Designed",
              "Id": 5232,
              "ComponentValue": "Service Asset & Configuration Management",
              "RelatedStory": "SMORE-14277"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Floor and Room values are not cleared when Site field is updated with new value",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Failed",
              "StatusValue": "Closed",
              "RootCauseValue": "Code",
              "Id": 5234,
              "ComponentValue": "Service Asset & Configuration Management",
              "RelatedStory": "SMORE-13676"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Change Search & Status Update on RKM form",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Code",
              "Id": 5235,
              "ComponentValue": "Knowledge Management",
              "RelatedStory": "SMORE-14482"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Search Service Request from RKM form",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Code",
              "Id": 5236,
              "ComponentValue": "Knowledge Management",
              "RelatedStory": "SMORE-14304"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Incident Threshold Alert (2nd Alert) sending email to Assignee when no Assignee is specified.",
              "SeverityValue": "4-Low",
              "TestStatusValue": "Failed",
              "StatusValue": "Closed",
              "RootCauseValue": "Vendor Code",
              "Id": 5237,
              "ComponentValue": "Incident Management",
              "RelatedStory": "SMORE-14245"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "Yes",
              "Title": "Where are the data attributes for No Search Results and Article Usage Viewed? ",
              "SeverityValue": "2-High",
              "TestStatusValue": "Pending",
              "StatusValue": "Closed",
              "RootCauseValue": "Data",
              "Id": 5238,
              "ComponentValue": "Knowledge Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Created CI are not moving from BMC Asset Sandbox to BMC ASSET",
              "SeverityValue": "5-N/A",
              "TestStatusValue": "Failed",
              "StatusValue": "Closed",
              "RootCauseValue": "Environmental",
              "Id": 5239,
              "ComponentValue": "Service Asset & Configuration Management",
              "RelatedStory": "SMORE-14477"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "BAC.MDH.IMPORT Recon Job is Failing in SIT1",
              "SeverityValue": "1-Critical",
              "TestStatusValue": "Not Applicable",
              "StatusValue": "Closed",
              "RootCauseValue": "Environmental",
              "Id": 5240,
              "ComponentValue": "Service Asset & Configuration Management",
              "RelatedStory": "SMORE-14290"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "Yes",
              "Title": "Incident Template - 1002 value is not displayed in 'Template Category Tier 1' Dropdown field on the Incident Template Window.",
              "SeverityValue": "5-N/A",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Script",
              "Id": 5241,
              "ComponentValue": "Incident Management",
              "RelatedStory": "SMORE-14769"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "While changing the Status of KM article from In progress to Draft an Error message is getting displayed.",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Unknown",
              "Id": 5242,
              "ComponentValue": "Service Asset & Configuration Management",
              "RelatedStory": "SMORE-14477"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "Yes",
              "Title": "Save button is enabled and the logged in user can edit the template in the Incident Template Selection window and the changes are saved.",
              "SeverityValue": "5-N/A",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Working As Designed",
              "Id": 5243,
              "ComponentValue": "Incident Management",
              "RelatedStory": "SMORE-14769"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "Yes",
              "Title": "Typo in Warning Message",
              "SeverityValue": "4-Low",
              "TestStatusValue": "Failed",
              "StatusValue": "Closed",
              "RootCauseValue": "Vendor Code",
              "Id": 5246,
              "ComponentValue": "Incident Management",
              "RelatedStory": "SMORE-14467"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Esupport has not coded to support the update of Operational fields at this time.",
              "SeverityValue": "4-Low",
              "TestStatusValue": "Failed",
              "StatusValue": "Closed",
              "RootCauseValue": "Missed Requirement",
              "Id": 5247,
              "ComponentValue": "Incident Management",
              "RelatedStory": "SMORE-14465"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Using 'Search' Not Rendering Results as Expected",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Infrastructure",
              "Id": 5250,
              "ComponentValue": "Service Asset & Configuration Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "Yes",
              "Title": "Error Message is getting displayed while changing the status of KM article from In progress to Draft.",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Script",
              "Id": 5255,
              "ComponentValue": "Problem Management",
              "RelatedStory": "SMORE-14475"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Standard Change with a ChangeCon Event conflict moves to Scheduled status instead of SFA.",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Promotion",
              "Id": 5257,
              "ComponentValue": "Change Management",
              "RelatedStory": "SMORE-15133"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Emergency Change - Change Con Approvers are not getting displayed for a change with Change Con Conflict",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Promotion",
              "Id": 5258,
              "ComponentValue": "Change Management",
              "RelatedStory": "SMORE-15133"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Incident record values are not getting pre-populated during creating incident from change request, but able to see the values after I save and open that incident",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Promotion",
              "Id": 5259,
              "ComponentValue": "Change Management",
              "RelatedStory": "SMORE-15064"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "Yes",
              "Title": "Assigned Group = NETW-CORE-SERVICE DESK-GLBL is not displayed for the selected template.",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Script",
              "Id": 5261,
              "ComponentValue": "Incident Management",
              "RelatedStory": "SMORE-14769"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Update of Priority Mismatch",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Code",
              "Id": 5264,
              "ComponentValue": "Interface",
              "RelatedStory": "SMORE-15036"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Error message is getting displayed when we search KM article from Basic search link .",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Infrastructure",
              "Id": 5265,
              "ComponentValue": "Service Asset & Configuration Management",
              "RelatedStory": "SMORE-14477"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "Yes",
              "Title": "Incident ticket  got saved. no error message is displayed.",
              "SeverityValue": "5-N/A",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Unable to Reproduce",
              "Id": 5269,
              "ComponentValue": "Incident Management",
              "RelatedStory": "SMORE-14466"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "RDM Configurations not done correctly. ",
              "SeverityValue": "4-Low",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Script",
              "Id": 5270,
              "ComponentValue": "Release & Deployment Management",
              "RelatedStory": "SMORE-14559"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "No records are displayed in the Notification table.",
              "SeverityValue": "4-Low",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Script",
              "Id": 5271,
              "ComponentValue": "Release & Deployment Management",
              "RelatedStory": "SMORE-14561"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Request status (draft) is not mentioned in the email subject. Request ID: \nREQ000000060759",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Data",
              "Id": 5277,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "SMORE-14356"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Incident Interfaces doesnt map Prioirty when a template is passed with the incident creation",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Code",
              "Id": 5282,
              "ComponentValue": "Incident Management",
              "RelatedStory": "SMORE-15036"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "MAXIMO Incident ticket is not displaying in Remedy-SIT1.",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Interface Not Running",
              "Id": 5283,
              "ComponentValue": "Incident Management",
              "RelatedStory": "SMORE-15043"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Unable to click submit button",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Not Applicable",
              "StatusValue": "Closed",
              "RootCauseValue": "User Education",
              "Id": 5284,
              "ComponentValue": "Change Management",
              "RelatedStory": "US-CE Training Scr"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Unable to test the scenario \" Individual resolving the Incident is not a member of default group,assigned group and owning group\"",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Data",
              "Id": 5285,
              "ComponentValue": "Incident Management",
              "RelatedStory": "SMORE-14463"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Incident and Problem Management Access",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Not Applicable",
              "StatusValue": "Closed",
              "RootCauseValue": "Security",
              "Id": 5287,
              "ComponentValue": "Incident Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Notifications are not sent.",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Script",
              "Id": 5291,
              "ComponentValue": "Release & Deployment Management",
              "RelatedStory": "SMORE-14561"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Confidential work log entries are visible for LDT7205",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Data",
              "Id": 5292,
              "ComponentValue": "Incident Management",
              "RelatedStory": "SMORE-14775"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Status is changing to \"scheduled for approval\" when clicking on restart and then asking to resolve collisions and save.",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Code",
              "Id": 5294,
              "ComponentValue": "Change Management",
              "RelatedStory": "SMORE-14123"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "On Query Search, following error is populating \" Unknown field referenced in query line : at position 80 ( 'Assignee Login ID' ) (ARERR 1587) \" ",
              "SeverityValue": "4-Low",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Usability",
              "Id": 5296,
              "ComponentValue": "Incident Management",
              "RelatedStory": "SMORE-15080"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "Yes",
              "Title": "Status of KM article is populating as \"BLANK\" in relationship tab of  Problem Ticket",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Code",
              "Id": 5298,
              "ComponentValue": "Problem Management",
              "RelatedStory": "SMORE-14475"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Query name got changed to Impact= 1-High.",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Working As Designed",
              "Id": 5301,
              "ComponentValue": "Incident Management",
              "RelatedStory": "SMORE-15080"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Tag & Location Data Coming from MDH Not Being Updated on CI in CMDB",
              "SeverityValue": "2-High",
              "TestStatusValue": "Failed",
              "StatusValue": "Closed",
              "RootCauseValue": "Code",
              "Id": 5304,
              "ComponentValue": "Service Asset & Configuration Management",
              "RelatedStory": "SMORE-14337"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Change Scheduled Dates are not getting copied to Task created from Task Tamplates as well in Adhoc Task.",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Code",
              "Id": 5310,
              "ComponentValue": "Change Management",
              "RelatedStory": "SMORE-14431"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Not Able to Access Omdb UAT1 link",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Interface Not Running",
              "Id": 5311,
              "ComponentValue": "Interface",
              "RelatedStory": "E2E INT ITSM MOAB-RB-CHP-MXO"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "AO moved to pending status ",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Vendor Code",
              "Id": 5312,
              "ComponentValue": "Interface",
              "RelatedStory": "E2E INT ITSM MOAB-RB-CHP-MXO"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Problem Assigned Group not displaying in Problem record using PKE UPDATE (Defect ID: 5151)",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Code",
              "Id": 5314,
              "ComponentValue": "Problem Management",
              "RelatedStory": "SMORE-15126"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Work Order Manager Assignment email notification subject line does not mention the word 'Manager'",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "User Education",
              "Id": 5315,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "SMORE-14356"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Training Issue Tracker, please close",
              "SeverityValue": "4-Low",
              "TestStatusValue": "Failed",
              "StatusValue": "Closed",
              "RootCauseValue": "User Education",
              "Id": 5316,
              "ComponentValue": "Change Evaluation",
              "RelatedStory": "US-CE Training Scr"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Training Issue Tracker, please close",
              "SeverityValue": "5-N/A",
              "TestStatusValue": "Failed",
              "StatusValue": "Closed",
              "RootCauseValue": "User Education",
              "Id": 5317,
              "ComponentValue": "Change Evaluation",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Priority is not displayed in the work order email notification",
              "SeverityValue": "4-Low",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Script",
              "Id": 5318,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "SMORE-14356"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Getting error when navigating to Data Management >> Job Console ",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Environmental",
              "Id": 5319,
              "ComponentValue": "Service Asset & Configuration Management",
              "RelatedStory": "E2E Asset_Computer_System"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "No server details are displaying in the Runbook entry.\nServer Name : wcdra1kfpap",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Interface Not Running",
              "Id": 5321,
              "ComponentValue": "Interface",
              "RelatedStory": "E2E INT ITSM SRDB"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "Yes",
              "Title": "Add Relationship to CI testcase fails from SOAP UI.",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Requirement Updates",
              "Id": 5322,
              "ComponentValue": "Interface",
              "RelatedStory": "E2E INT INC WEB SERVICE"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "HW/OS info tab is not getting green check mark for platform \"High Density\"",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Failed",
              "StatusValue": "Closed",
              "RootCauseValue": "Unknown",
              "Id": 5324,
              "ComponentValue": "DLA - SRM",
              "RelatedStory": "E2E-SRM_BULK"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Not able to search K articles using Search KM",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Environmental",
              "Id": 5325,
              "ComponentValue": "Knowledge Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Owning External System Id  Field is blank ",
              "SeverityValue": "1-Critical",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Infrastructure",
              "Id": 5326,
              "ComponentValue": "Interface",
              "RelatedStory": "E2E INT ITSM-MXO INCIDENT"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "There are no Worklog entries for Maximo ebond and DSW ebond",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Environmental",
              "Id": 5327,
              "ComponentValue": "Interface",
              "RelatedStory": "E2E INT ITSM INC-DSW"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "Yes",
              "Title": "User is not able to search for Knowledge and Work order from Global Search.",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Infrastructure",
              "Id": 5328,
              "ComponentValue": "Foundation Data",
              "RelatedStory": "E2E FTS"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "Yes",
              "Title": "Impact,urgency and priority values in NEWS are not as per those selected in ITSM Incident.",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Script",
              "Id": 5331,
              "ComponentValue": "Incident Management",
              "RelatedStory": "SMORE-14768"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Auto: DRA data not found in UAT1 ",
              "SeverityValue": "5-N/A",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Data",
              "Id": 5332,
              "ComponentValue": "DLA - SRM",
              "RelatedStory": "E2E-SRM_BULK"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Incorrect values displaying in Impact and Priority fields.",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Interfacing Application",
              "Id": 5342,
              "ComponentValue": "Incident Management",
              "RelatedStory": "SMORE-15043"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Knowledge articles are not displayed even though they have the same values mentioned in change form",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Data",
              "Id": 5343,
              "ComponentValue": "Change Management",
              "RelatedStory": "SMORE-14291"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Change coordinator is able to attach the attachments in Task tab when the change in \"Implementation in progress\" status and the task is in \"work in progress\" status",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Code",
              "Id": 5344,
              "ComponentValue": "Change Management",
              "RelatedStory": "SMORE-14441"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "SIT1 - Escalation does not seem to be running or could have missing proper rpc queue setup for escalations",
              "SeverityValue": "1-Critical",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Infrastructure",
              "Id": 5346,
              "ComponentValue": "Service Asset & Configuration Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Training UAT Issue Tracker Please close ",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Not Applicable",
              "StatusValue": "Closed",
              "RootCauseValue": "User Education",
              "Id": 5347,
              "ComponentValue": "Change Evaluation",
              "RelatedStory": "US-CE Training Scr"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Issue Tracker Training Please close ",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Not Applicable",
              "StatusValue": "Closed",
              "RootCauseValue": "User Education",
              "Id": 5348,
              "ComponentValue": "Change Evaluation",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "In correct summary value is getting populated while relating the KM Article to Change Request",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Failed",
              "StatusValue": "Closed",
              "RootCauseValue": "Code",
              "Id": 5349,
              "ComponentValue": "Change Management",
              "RelatedStory": "SMORE-14481"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Status & Start Date of attached KM article is not getting displayed in Change request.",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "User Education",
              "Id": 5350,
              "ComponentValue": "Change Management",
              "RelatedStory": "SMORE-14481"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Error Message is getting displayed while adding the same deleted KM article with same Change request.",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Failed",
              "StatusValue": "Closed",
              "RootCauseValue": "Code",
              "Id": 5351,
              "ComponentValue": "Change Management",
              "RelatedStory": "SMORE-14481"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Priority Field value is not getting updated in Incident Ticket while updating the ticket from SOAP UI",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Data",
              "Id": 5354,
              "ComponentValue": "Incident Management",
              "RelatedStory": "SMORE-15036"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Issue Tracker Training Please close. ",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Not Applicable",
              "StatusValue": "Closed",
              "RootCauseValue": "User Education",
              "Id": 5355,
              "ComponentValue": "Change Evaluation",
              "RelatedStory": "US-CE Training Scr"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "One more Issue tracker training item. Please close ",
              "SeverityValue": "5-N/A",
              "TestStatusValue": "Failed",
              "StatusValue": "Closed",
              "RootCauseValue": "User Education",
              "Id": 5356,
              "ComponentValue": "Change Evaluation",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Request is not enforcing standard Band 5 auto - approval and is requiring 1st level manager approval ",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Unable to Reproduce",
              "Id": 5357,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "US-IPcenter Access"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "work order routed to default ITOP-CORE-TPM-Reassign-GLBL and not to the correct fulfillment group ",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Data",
              "Id": 5358,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "US-IPcenter Access"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Change Manager is able to attach the attachments in Task tab when the change in \"Implementation in progress\" status and the task is in \"work in progress\" status",
              "SeverityValue": "5-N/A",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Code",
              "Id": 5359,
              "ComponentValue": "Change Management",
              "RelatedStory": "SMORE-14441"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Tag & Location data (Nlyte) Coming from MDH Not Updating on Storage Devices",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Code",
              "Id": 5360,
              "ComponentValue": "Service Asset & Configuration Management",
              "RelatedStory": "SMORE-14337"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Error: Required field (without a default) not specified : Manager Group*+ (ARERR 9424)  when saving",
              "SeverityValue": "4-Low",
              "TestStatusValue": "Not Applicable",
              "StatusValue": "Closed",
              "RootCauseValue": "Script",
              "Id": 5361,
              "ComponentValue": "Change Management",
              "RelatedStory": "US-CM-001 NormRL2"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "system hangs after I clicked the magnifying glass  icon",
              "SeverityValue": "4-Low",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "User Education",
              "Id": 5362,
              "ComponentValue": "Change Management",
              "RelatedStory": "US-CM-001 NormRL2"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Getting timeout error when clicked on impact analysis",
              "SeverityValue": "2-High",
              "TestStatusValue": "Pending",
              "StatusValue": "Closed",
              "RootCauseValue": "Environmental",
              "Id": 5364,
              "ComponentValue": "Change Management",
              "RelatedStory": "E2E Change 1"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Knowledge search Results open without list of Knowledge articles",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Script",
              "Id": 5365,
              "ComponentValue": "Incident Management",
              "RelatedStory": "SMORE-14294"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Getting Error message when trying to close the task which is in \"work in progress\" status and attachments added to it and Change is in \"Implementation in progress\" ",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Code",
              "Id": 5367,
              "ComponentValue": "Change Management",
              "RelatedStory": "SMORE-14441"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Testers no longer listed please add (Carlotta (Florence) Moses, Victoria Lozano-Patrick, Don Buck)",
              "SeverityValue": "2-High",
              "TestStatusValue": "Not Applicable",
              "StatusValue": "Closed",
              "RootCauseValue": "Security",
              "Id": 5368,
              "ComponentValue": "Change Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "The message Popup displayed does not depict what exactly is happening when clicked on Yes/No buttons.This applies to message Popup for Out of Range Dates warning as well",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Code",
              "Id": 5369,
              "ComponentValue": "Change Management",
              "RelatedStory": "SMORE-14431"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "The missing 2 records that link the Pricing table to the admin tool ",
              "SeverityValue": "2-High",
              "TestStatusValue": "Failed",
              "StatusValue": "Closed",
              "RootCauseValue": "Data",
              "Id": 5370,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "SMORE-14389"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Risk level gets reflected only when clicked on \"Save\" and not automatically as per Release 3.0",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Script",
              "Id": 5371,
              "ComponentValue": "Change Management",
              "RelatedStory": "US-CM-001 NormRL2"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Impact Analysis is timing out in UAT1",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Environmental",
              "Id": 5372,
              "ComponentValue": "Change Management",
              "RelatedStory": "US-CM-001 NormRL2"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "risk level is 4",
              "SeverityValue": "4-Low",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Script",
              "Id": 5373,
              "ComponentValue": "Change Management",
              "RelatedStory": "US-CM-004 NormRL5"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "When running impact analysis,Timeout during database update -- the operation has been accepted by the server and will usually complete successfully : itsm-uat1arapp.yourcompany.com:39604 ONC/RPC call timed out (ARERR 92)",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Duplicate",
              "Id": 5374,
              "ComponentValue": "Change Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "No E-mail triggered to Fulfillment team",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Requirement Updates",
              "Id": 5375,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "SMORE-14389"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "The eSMART Report does not display Related CIs that are causing the Impacted CIs to show up in the Impact Analysis.",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Script",
              "Id": 5376,
              "ComponentValue": "Change Management",
              "RelatedStory": "SMORE-14511"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "BladeLogic Enrollment Status & BladeLogic Message are not displayed.\n Please see attached screenshot.",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Environmental",
              "Id": 5377,
              "ComponentValue": "Interface",
              "RelatedStory": "SMORE-14323"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "BL Enrollment - Blank Note is displayed after downloading the CSV file.",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Failed",
              "StatusValue": "Closed",
              "RootCauseValue": "Vendor Code",
              "Id": 5380,
              "ComponentValue": "Interface",
              "RelatedStory": "SMORE-14323"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Promote section is in Queued status",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Failed",
              "StatusValue": "Closed",
              "RootCauseValue": "Working As Designed",
              "Id": 5381,
              "ComponentValue": "Knowledge Management",
              "RelatedStory": "SMORE-14302"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Article ID field is not populated in Article page. Also, Article Expiration Date is wrong",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Data",
              "Id": 5382,
              "ComponentValue": "Knowledge Management",
              "RelatedStory": "SMORE-14302"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Blade logic server - Able to add more then 1500 server names to Server Enrollment request.",
              "SeverityValue": "4-Low",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Requirement Updates",
              "Id": 5383,
              "ComponentValue": "Interface",
              "RelatedStory": "SMORE-14323"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Uploaded Article is not present in the KM console page",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Working As Designed",
              "Id": 5384,
              "ComponentValue": "Knowledge Management",
              "RelatedStory": "SMORE-14302"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Status of KM ARTICLE is getting displayed as \"BLANK\"  in CI relationship tab.",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Code",
              "Id": 5385,
              "ComponentValue": "Service Asset & Configuration Management",
              "RelatedStory": "Adhoc"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Incorrect Summary value of KM article is getting displayed in Request Summary column for CI",
              "SeverityValue": "4-Low",
              "TestStatusValue": "Pending",
              "StatusValue": "In Review",
              "RootCauseValue": null,
              "Id": 5386,
              "ComponentValue": "Service Asset & Configuration Management",
              "RelatedStory": "Adhoc"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "Yes",
              "Title": "A pop up note message is getting displayed before the KM article get related to PM request.",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Working As Designed",
              "Id": 5387,
              "ComponentValue": "Problem Management",
              "RelatedStory": "SMORE-14475"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "No impact analysis re-run message generated.",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "User Education",
              "Id": 5388,
              "ComponentValue": "Change Management",
              "RelatedStory": "US-CM-001 NormRL2"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "Yes",
              "Title": "A pop up note message is getting displayed before the KM article get related to PM request",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Code",
              "Id": 5389,
              "ComponentValue": "Problem Management",
              "RelatedStory": "SMORE-14475"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Only summary field is populated with the Change summary value. The Name field is empty.",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "User Education",
              "Id": 5390,
              "ComponentValue": "Change Management",
              "RelatedStory": "US-CM-002 NormRL3"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Change Manager converts nbid and tool does not accept.",
              "SeverityValue": "1-Critical",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "User Error",
              "Id": 5391,
              "ComponentValue": "Change Management",
              "RelatedStory": "US-CM-001 NormRL2"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Only summary field is populated with the Change summary value. The Name field is empty.",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Failed",
              "StatusValue": "Closed",
              "RootCauseValue": "Duplicate",
              "Id": 5392,
              "ComponentValue": "Change Management",
              "RelatedStory": "US-CM-002 NormRL3"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Previous fix missed in this release. Select window for templates spins indefinitely.",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "User Error",
              "Id": 5393,
              "ComponentValue": "Change Management",
              "RelatedStory": "US-CM-010 StdChg"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "There should not be a 'cancel' link under 'My Requests' section .",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Script",
              "Id": 5394,
              "ComponentValue": "Interface",
              "RelatedStory": "SMORE-14327"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Receiving an Error Message when creating a ticket from a template",
              "SeverityValue": "2-High",
              "TestStatusValue": "Failed",
              "StatusValue": "Closed",
              "RootCauseValue": "Data",
              "Id": 5395,
              "ComponentValue": "Incident Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "PERF: HP Task not getting closed",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Failed",
              "StatusValue": "Closed",
              "RootCauseValue": "Code",
              "Id": 5396,
              "ComponentValue": "Interface",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Incorrect value is getting populated before the Title name & also status value as BLANK.",
              "SeverityValue": "5-N/A",
              "TestStatusValue": "Not Applicable",
              "StatusValue": "Closed",
              "RootCauseValue": "Duplicate",
              "Id": 5397,
              "ComponentValue": "Service Asset & Configuration Management",
              "RelatedStory": "SMORE-14382"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Impact field on change record clears if no value is brought over from CI impact field",
              "SeverityValue": "2-High",
              "TestStatusValue": "Not Applicable",
              "StatusValue": "Closed",
              "RootCauseValue": "Duplicate",
              "Id": 5398,
              "ComponentValue": "Change Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Impact field on change record clears out when null value on impact field from CI",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Code",
              "Id": 5399,
              "ComponentValue": "Change Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Risk Questionnaire change appears to have fallen out.",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Data",
              "Id": 5400,
              "ComponentValue": "Change Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "I can select higher risk level in dropdown but when I Save it reverts back to CRQ driven risk",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Unknown",
              "Id": 5401,
              "ComponentValue": "Change Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Impacted Area remain unchanged. ",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Script",
              "Id": 5402,
              "ComponentValue": "Problem Management",
              "RelatedStory": "US-PBI-Impacted A"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "No CI record displayed in Maximo .",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Environmental",
              "Id": 5403,
              "ComponentValue": "Interface",
              "RelatedStory": "E2E INT ITSM MOAB-RB-CHP-MXO"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Work Info not created for the Incident submitted in SIT1.",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Interface Not Running",
              "Id": 5405,
              "ComponentValue": "Incident Management",
              "RelatedStory": "SMORE-15042"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "BladeLogic Status & BladeLogic Message are not displayed.",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Duplicate",
              "Id": 5406,
              "ComponentValue": "Interface",
              "RelatedStory": "SMORE-14329"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Change Coordinator: <As defined in Person record> Name not listed",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Not Applicable",
              "StatusValue": "Closed",
              "RootCauseValue": "Environmental",
              "Id": 5407,
              "ComponentValue": "Change Management",
              "RelatedStory": "US-CM-001"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Search Article Issue from Design Console",
              "SeverityValue": "4-Low",
              "TestStatusValue": "Failed",
              "StatusValue": "Closed",
              "RootCauseValue": "Code",
              "Id": 5409,
              "ComponentValue": "Knowledge Management",
              "RelatedStory": "SMORE-14482"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "BladeLogic Server Decommission edit changes the servername to lower case",
              "SeverityValue": "4-Low",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Data",
              "Id": 5410,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "SMORE-14330"
            },
            {
              "Release": "Remedy Release 4.0",
              "ExistInProdValue": "No",
              "Title": "Knowledge Submitter permission not applied to GTO/Process Roles",
              "SeverityValue": "1-Critical",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Security",
              "Id": 5411,
              "ComponentValue": "Knowledge Management",
              "RelatedStory": "SMORE-14157"
            }
          ]
        };

        //Release 3.0
        var Release3 = {
          "d": [
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "Alternate Approver is not listed under Approval History on Request Detail page",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Script",
              "Id": 4175,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "SMORE-13745"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "ENG env: UI - Buttons Overlapped in Design Console (DLA)",
              "SeverityValue": "2-High",
              "TestStatusValue": "Pending",
              "StatusValue": "Closed",
              "RootCauseValue": "Unknown",
              "Id": 4239,
              "ComponentValue": "DLA Design Console",
              "RelatedStory": "SMORE-12345"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": null,
              "Title": "After selecting an incident template for the first time we are unable to select another template before saving",
              "SeverityValue": "2-High",
              "TestStatusValue": "Failed",
              "StatusValue": "Closed",
              "RootCauseValue": "Vendor Code",
              "Id": 4264,
              "ComponentValue": "Incident Management",
              "RelatedStory": "SMORE-12345"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "Many AI jobs will not run in DEV1 as part of the Release 3.0 SP2 validation.",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Unknown",
              "Id": 4452,
              "ComponentValue": "Not Listed",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "IE is running in Compatibility View. Please remove Mid-tier URL from either IE Compatibility View Settings or Registry location. (ARWARN 9429)",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Failed",
              "StatusValue": "Closed",
              "RootCauseValue": "Vendor Code",
              "Id": 4457,
              "ComponentValue": "Infrastructure",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "\"Notify Assignee\" field blank on the template. ",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Failed",
              "StatusValue": "Closed",
              "RootCauseValue": "Code",
              "Id": 4484,
              "ComponentValue": "Incident Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "Purchase Date field selector icon being different size than other date selector icons on Asset forms",
              "SeverityValue": "4-Low",
              "TestStatusValue": "Failed",
              "StatusValue": "Closed",
              "RootCauseValue": "Vendor Code",
              "Id": 4490,
              "ComponentValue": "Service Asset & Configuration Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "Unable to find the created EP  request in Approval centre page.",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Workflow/Escalation",
              "Id": 4494,
              "ComponentValue": "DLA Equipment Placement",
              "RelatedStory": "E2E_SRM_EP_8.1"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "On Advanced_CI search page, Dataset dropdown shows blank.",
              "SeverityValue": "2-High",
              "TestStatusValue": "Failed",
              "StatusValue": "Closed",
              "RootCauseValue": "Vendor Code",
              "Id": 4495,
              "ComponentValue": "Service Asset & Configuration Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "Unable to configure Approval Mapping on Dev1 with ITSM SP2",
              "SeverityValue": "1-Critical",
              "TestStatusValue": "Failed",
              "StatusValue": "Closed",
              "RootCauseValue": "Vendor Code",
              "Id": 4496,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "A popup displays with yourcompany.com is not responding.  There is a Recover webpage button.  Clicking the button does not recover the webpage.",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Unknown",
              "Id": 4497,
              "ComponentValue": "Knowledge Management",
              "RelatedStory": "E2E Knowledge Management"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "ARERR 9506 Upon Log In",
              "SeverityValue": "2-High",
              "TestStatusValue": "Pending",
              "StatusValue": "Closed",
              "RootCauseValue": "Environmental",
              "Id": 4502,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "Create storage & Delete Storage form display an error.",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Interface Not Running",
              "Id": 4505,
              "ComponentValue": "Interface",
              "RelatedStory": "E2E INT ITSM Storage Auto"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "AIT ID not populating-unable to select any AIT ID.",
              "SeverityValue": "2-High",
              "TestStatusValue": "Failed",
              "StatusValue": "Closed",
              "RootCauseValue": "Vendor Code",
              "Id": 4513,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "E2E ITSM  INT MOAB"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "No Entry in \"Notification Audit\" tab present for notification sent.",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "User Education",
              "Id": 4514,
              "ComponentValue": "Problem Management",
              "RelatedStory": "E2E_ITSM_PRB"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "On Behalf of Username not showing properly.",
              "SeverityValue": "4-Low",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Data",
              "Id": 4515,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "E2E SRF"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "Error message got populated when we try to generate a new HOST name",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Interface Not Running",
              "Id": 4516,
              "ComponentValue": "DLA - SRM",
              "RelatedStory": "E2E-SRM_BULK"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "Articles not going for approval to the Approver Ids (UserIDs  - LDT7093 and LDT7094)",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Pending",
              "StatusValue": "Closed",
              "RootCauseValue": "Unknown",
              "Id": 4517,
              "ComponentValue": "Knowledge Management",
              "RelatedStory": "E2E Knowledge Management"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "Data Network: Service Type drop down not listed any values for selection.",
              "SeverityValue": "2-High",
              "TestStatusValue": "Failed",
              "StatusValue": "Closed",
              "RootCauseValue": "Vendor Code",
              "Id": 4518,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "E2E SRF"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "Bulk Update button is overlapped by Bulk Submit button",
              "SeverityValue": "2-High",
              "TestStatusValue": "Failed",
              "StatusValue": "Closed",
              "RootCauseValue": "Code",
              "Id": 4519,
              "ComponentValue": "DLA - SRM",
              "RelatedStory": "E2E-SRM_BULK"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "Yes",
              "Title": "Getting an error while creating Incident using Webservice.",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Infrastructure",
              "Id": 4520,
              "ComponentValue": "Interface",
              "RelatedStory": "E2E INT INC WEB SERVICE"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "Issue with the Aproval Engine - all the Change request are getting stuck in Scheduled for Approval.",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Data",
              "Id": 4521,
              "ComponentValue": "Change Management",
              "RelatedStory": "E2E Change #4"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "IE9 - Getting an error when saving the CI = No entry is specified for this statiscal operation ",
              "SeverityValue": "2-High",
              "TestStatusValue": "Not Applicable",
              "StatusValue": "Closed",
              "RootCauseValue": "Environmental",
              "Id": 4522,
              "ComponentValue": "Service Asset & Configuration Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "Manage CIs > Advanced Search - Counts Are No Longer Visible - Msg Displays There are No Records When Records are Returned",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Vendor Code",
              "Id": 4523,
              "ComponentValue": "Service Asset & Configuration Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "Manage CIs > Advanced Search - Serial Number Field Entry is Not Cleared",
              "SeverityValue": "4-Low",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Vendor Code",
              "Id": 4524,
              "ComponentValue": "Service Asset & Configuration Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "CI Selection Issue while Creating Change Request",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Pending",
              "StatusValue": "Closed",
              "RootCauseValue": "Data",
              "Id": 4525,
              "ComponentValue": "Change Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "Decom requests are not displayed in Approval Central.",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Workflow/Escalation Not Active",
              "Id": 4526,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "E2E_ApplicationDecom"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "Field Overlapping issue on Specifications tab",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Vendor Code",
              "Id": 4527,
              "ComponentValue": "Service Asset & Configuration Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "NEWLY ADDED FIELDS on AST forms in SP2 - should be read-only",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Vendor Code",
              "Id": 4528,
              "ComponentValue": "Service Asset & Configuration Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "Job Console page is not opening",
              "SeverityValue": "1-Critical",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Infrastructure",
              "Id": 4529,
              "ComponentValue": "Service Asset & Configuration Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "Waiting Approval request not coming into approval central",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Workflow/Escalation",
              "Id": 4530,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "E2E Application Server_8.1"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "Refresh Icon on Manage CIs > Advanced Search Disappears After Initial Search",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Vendor Code",
              "Id": 4532,
              "ComponentValue": "Service Asset & Configuration Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "IE9 - Unable to Expand Menus Once They Have Been Collapsed",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Vendor Code",
              "Id": 4533,
              "ComponentValue": "Service Asset & Configuration Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "IE9 - Manually Created CIRCUIT CI is Not Moving to BMC Asset & Many Fields That Contained Data Are Now Blank When CI Viewed in Sandbox",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Vendor Code",
              "Id": 4534,
              "ComponentValue": "Service Asset & Configuration Management",
              "RelatedStory": "E2E Circuit CI "
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "Unable to Add Work Info Entry on Initial Creation of a CI - Error Message Also Contains Misspellings",
              "SeverityValue": "4-Low",
              "TestStatusValue": "Failed",
              "StatusValue": "Closed",
              "RootCauseValue": "Vendor Code",
              "Id": 4535,
              "ComponentValue": "Service Asset & Configuration Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "IE9 - ACCOUNT CI Created via Load template is not displaying all the field values and Not Moving to BMC Asset.",
              "SeverityValue": "1-Critical",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Vendor Code",
              "Id": 4536,
              "ComponentValue": "Service Asset & Configuration Management",
              "RelatedStory": "E2E Asset_Account"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "CI without product name and manufacturer is not appeared in BMC.ASSET.SANDBOX",
              "SeverityValue": "5-N/A",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "User Education",
              "Id": 4537,
              "ComponentValue": "Service Asset & Configuration Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "IE9 - Transaction Asset Load Erroring - Account & Circuit Tests ",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Vendor Code",
              "Id": 4538,
              "ComponentValue": "Service Asset & Configuration Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "IE9 - DMT Job Console Functions Area Not Displaying Correctly",
              "SeverityValue": "4-Low",
              "TestStatusValue": "Failed",
              "StatusValue": "Closed",
              "RootCauseValue": "Vendor Code",
              "Id": 4539,
              "ComponentValue": "Service Asset & Configuration Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "Function Navigation Item throws error",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Vendor Code",
              "Id": 4540,
              "ComponentValue": "Incident Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "IE9 - Circuit CI Created Via a Load Is Not Moving to BMC Asset ",
              "SeverityValue": "1-Critical",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Data",
              "Id": 4541,
              "ComponentValue": "Service Asset & Configuration Management",
              "RelatedStory": "E2E Circuit CI"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "Create storage & Delete Storage form display an error - WebService application Unavailable",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Pending",
              "StatusValue": "Closed",
              "RootCauseValue": "Interface Not Running",
              "Id": 4542,
              "ComponentValue": "DLA Interfaces",
              "RelatedStory": "E2E INT ITSM Storage Auto"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "In \"Related Records\" TAB Owning External System ID is not generating \"Owning External System ID\" field.",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Interface Not Running",
              "Id": 4543,
              "ComponentValue": "Interface",
              "RelatedStory": "SMORE-11965"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "AUTO : ITBM Application is not working ",
              "SeverityValue": "4-Low",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Environmental",
              "Id": 4544,
              "ComponentValue": "DLA - ITBM",
              "RelatedStory": "E2E_ITBM_8.1"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "KM-0158 - System prompts to save article and should not for a KM Viewer (SP2 Fix) (IT 2789 - SMORE-13278)",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Vendor Code",
              "Id": 4547,
              "ComponentValue": "Knowledge Management",
              "RelatedStory": "SMORE-13873"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "Screen Jumps When Initially Selecting Advanced Filter & Location Filter On Asset Console",
              "SeverityValue": "4-Low",
              "TestStatusValue": "Failed",
              "StatusValue": "Closed",
              "RootCauseValue": "Vendor Code",
              "Id": 4548,
              "ComponentValue": "Service Asset & Configuration Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "SR Design - SR->Request ->Buttons at the bottom are over Written",
              "SeverityValue": "5-N/A",
              "TestStatusValue": "Failed",
              "StatusValue": "Closed",
              "RootCauseValue": "Duplicate",
              "Id": 4549,
              "ComponentValue": "DLA Design Console",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "Support Group missing from SIT1",
              "SeverityValue": "1-Critical",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Data",
              "Id": 4551,
              "ComponentValue": "Event Management",
              "RelatedStory": "E2E EM IM"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "BMC Remedy ITSM Application fly-out (application menu) in version 8.1.0 with SP2 applied appears blurred",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Failed",
              "StatusValue": "Closed",
              "RootCauseValue": "Vendor Code",
              "Id": 4552,
              "ComponentValue": "Service Asset & Configuration Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 3.0",
              "ExistInProdValue": "No",
              "Title": "KM-0188 Relocate and Resize window as desired",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Working As Designed",
              "Id": 4553,
              "ComponentValue": "Knowledge Management",
              "RelatedStory": "SMORE-14266"
            }
          ]
        };

        //Release 2.0
        var Release2 = {
          "d": [
            {
              "Release": "Remedy Release 2.0",
              "ExistInProdValue": "No",
              "Title": "For Testing Purposes - Notepad does not open",
              "SeverityValue": "5-N/A",
              "TestStatusValue": "Failed",
              "StatusValue": "Closed",
              "RootCauseValue": "Unknown",
              "Id": 1042,
              "ComponentValue": "Incident Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 2.0",
              "ExistInProdValue": "No",
              "Title": "AUTO: The current Decom dataloads are not working. Development is yet to provide updated decom data load files as the current files and process is not working. Alex Sheperd is also aware of this.",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Data",
              "Id": 3477,
              "ComponentValue": "DLA Decom",
              "RelatedStory": "E2E_ApplicationDecom"
            },
            {
              "Release": "Remedy Release 2.0",
              "ExistInProdValue": "No",
              "Title": "AUTO: Change is not going to second level of approval like CAB Approver, Impacted area Approval etc",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Data",
              "Id": 3507,
              "ComponentValue": "Change Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 2.0",
              "ExistInProdValue": "No",
              "Title": "SMORE-13718 EP New Field - Number of Plug – Field is not visible in the Design Console for WLM",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Not Applicable",
              "StatusValue": "Closed",
              "RootCauseValue": "New Feature",
              "Id": 3559,
              "ComponentValue": "DLA Equipment Placement",
              "RelatedStory": "SMORE-13718"
            },
            {
              "Release": "Remedy Release 2.0",
              "ExistInProdValue": "No",
              "Title": "CI Records Missing in Remedy for Non Banking Center Printers noted in Outbound extract. ",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Data",
              "Id": 3580,
              "ComponentValue": "Service Asset & Configuration Management",
              "RelatedStory": "SMORE-13907"
            },
            {
              "Release": "Remedy Release 2.0",
              "ExistInProdValue": "No",
              "Title": "Remedy jobs are taking considerable amount of time to be complete (more then 6 hours) which is delaying the testing.",
              "SeverityValue": "2-High",
              "TestStatusValue": "Not Applicable",
              "StatusValue": "Closed",
              "RootCauseValue": "Data",
              "Id": 3595,
              "ComponentValue": "Service Asset & Configuration Management",
              "RelatedStory": "SMORE-13408"
            },
            {
              "Release": "Remedy Release 2.0",
              "ExistInProdValue": "No",
              "Title": "REM2NEWS - Stop Escalations are not consistently and as expected. (Defect ID: 2915)",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Data",
              "Id": 3596,
              "ComponentValue": "Incident Management",
              "RelatedStory": "SMORE-13896"
            },
            {
              "Release": "Remedy Release 2.0",
              "ExistInProdValue": "No",
              "Title": "REQ000000163729 No check mark in Header/Facility Info tab. Bold fields completed but error says they are not. ",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Code",
              "Id": 3600,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "SMORE-13266"
            },
            {
              "Release": "Remedy Release 2.0",
              "ExistInProdValue": "No",
              "Title": "CIs Missing OS Relationships Noted in Outbound Extracts",
              "SeverityValue": "2-High",
              "TestStatusValue": "Failed",
              "StatusValue": "Closed",
              "RootCauseValue": "Code",
              "Id": 3604,
              "ComponentValue": "Service Asset & Configuration Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 2.0",
              "ExistInProdValue": "No",
              "Title": "Why is EMEA Service Requests appearing in the US Region Design Console for the WLM?",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Security",
              "Id": 3605,
              "ComponentValue": "DLA Equipment Placement",
              "RelatedStory": "SMORE-12985"
            },
            {
              "Release": "Remedy Release 2.0",
              "ExistInProdValue": "No",
              "Title": "The new field – Material Id No is not being past to the Equipment Placement approval process",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Not Applicable",
              "StatusValue": "Closed",
              "RootCauseValue": "User Education",
              "Id": 3606,
              "ComponentValue": "DLA Equipment Placement",
              "RelatedStory": "SMORE-12895"
            },
            {
              "Release": "Remedy Release 2.0",
              "ExistInProdValue": "No",
              "Title": "The host unmapping page that the \"Click here\" link points to has been relocated",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Working As Designed",
              "Id": 3622,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "SMORE-12589"
            },
            {
              "Release": "Remedy Release 2.0",
              "ExistInProdValue": "No",
              "Title": "The site name does show correctly, but there is no label to make sure that it is in the correct place.",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Working As Designed",
              "Id": 3629,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "US-REQF-Host-007"
            },
            {
              "Release": "Remedy Release 2.0",
              "ExistInProdValue": "No",
              "Title": "Multiple entries are displaying in capability list field",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Working As Designed",
              "Id": 3633,
              "ComponentValue": "Service Asset & Configuration Management",
              "RelatedStory": "SMORE-13907"
            },
            {
              "Release": "Remedy Release 2.0",
              "ExistInProdValue": "No",
              "Title": "Access issue - Greg Worth",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Not Applicable",
              "StatusValue": "Closed",
              "RootCauseValue": "Security",
              "Id": 3634,
              "ComponentValue": "Change Management",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 2.0",
              "ExistInProdValue": "No",
              "Title": "UAT Runbook does not come up into Search mode",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "User Education",
              "Id": 3644,
              "ComponentValue": "DLA Interfaces",
              "RelatedStory": "US-REQF-Host-005"
            },
            {
              "Release": "Remedy Release 2.0",
              "ExistInProdValue": "No",
              "Title": "AUTO: User With Problem and Incident Access Not able to Create Incident Ticket",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Security",
              "Id": 3659,
              "ComponentValue": "Incident Management",
              "RelatedStory": "E2E_ITSM_IM"
            },
            {
              "Release": "Remedy Release 2.0",
              "ExistInProdValue": "No",
              "Title": "LAPTOP CIs -Some of the fields & relationship for the modified CI does not get updated from MDH",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Failed",
              "StatusValue": "Closed",
              "RootCauseValue": "Data",
              "Id": 3660,
              "ComponentValue": "Service Asset & Configuration Management",
              "RelatedStory": "SMORE-13469"
            },
            {
              "Release": "Remedy Release 2.0",
              "ExistInProdValue": "No",
              "Title": "Software Server - LPAR Relationship added manually should not display under relationship tab After MDH  Run",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Promotion",
              "Id": 3661,
              "ComponentValue": "Service Asset & Configuration Management",
              "RelatedStory": "SMORE-13543"
            },
            {
              "Release": "Remedy Release 2.0",
              "ExistInProdValue": "No",
              "Title": "APPLIANCE CIs - Values of the CI are not reflected correctly after running the MDH and Remedy jobs.",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Not Applicable",
              "StatusValue": "Closed",
              "RootCauseValue": "Data",
              "Id": 3663,
              "ComponentValue": "Service Asset & Configuration Management",
              "RelatedStory": "SMORE-13464"
            }
          ]
        };

        //Release 3.2

        var Release32 = {
          "d": [
            {
              "Release": "Remedy Release 3.2",
              "ExistInProdValue": "No",
              "Title": "Banking Center Phone and Features",
              "SeverityValue": "4-Low",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Script",
              "Id": 5233,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "SMORE-14983"
            },
            {
              "Release": "Remedy Release 3.2",
              "ExistInProdValue": "No",
              "Title": "Data Connectivity SRD - WO not getting initiated ",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Promotion",
              "Id": 5244,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 3.2",
              "ExistInProdValue": "No",
              "Title": "Field Services SRD not promoted in UAT",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Promotion",
              "Id": 5245,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "Not Applicable"
            },
            {
              "Release": "Remedy Release 3.2",
              "ExistInProdValue": "No",
              "Title": "no SRD available ",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Promotion",
              "Id": 5248,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "US-Media Service"
            },
            {
              "Release": "Remedy Release 3.2",
              "ExistInProdValue": "No",
              "Title": "Standard Phone and Features - SRD unavailable for review in the Sharepoint under 3.2 folder",
              "SeverityValue": "1-Critical",
              "TestStatusValue": "Pending",
              "StatusValue": "Closed",
              "RootCauseValue": "Data",
              "Id": 5252,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "SMORE-14976"
            },
            {
              "Release": "Remedy Release 3.2",
              "ExistInProdValue": "No",
              "Title": "SRD unavailable for SMORE-15071 under Release 3.2 folder in the Sharepoint",
              "SeverityValue": "1-Critical",
              "TestStatusValue": "Pending",
              "StatusValue": "Closed",
              "RootCauseValue": "User Education",
              "Id": 5253,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "SMORE-15071"
            },
            {
              "Release": "Remedy Release 3.2",
              "ExistInProdValue": "No",
              "Title": "Requirements unclear for SMORE-14857 (Communication Enabled Business Solutions)",
              "SeverityValue": "1-Critical",
              "TestStatusValue": "Pending",
              "StatusValue": "Closed",
              "RootCauseValue": "User Education",
              "Id": 5254,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "SMORE-14857"
            },
            {
              "Release": "Remedy Release 3.2",
              "ExistInProdValue": "No",
              "Title": "Information missing for SMORE-15092 - Field service",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Pending",
              "StatusValue": "Closed",
              "RootCauseValue": "Unable to Reproduce",
              "Id": 5256,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "SMORE-15092"
            },
            {
              "Release": "Remedy Release 3.2",
              "ExistInProdValue": "No",
              "Title": "The Request Manager group is wrong for the \"Disconnect\" option.",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Data",
              "Id": 5262,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "US-1st Mtg Phone"
            },
            {
              "Release": "Remedy Release 3.2",
              "ExistInProdValue": "No",
              "Title": "This offering no longer displays in the catalog",
              "SeverityValue": "1-Critical",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Working As Designed",
              "Id": 5263,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "US-Banking Ctr Pho"
            },
            {
              "Release": "Remedy Release 3.2",
              "ExistInProdValue": "No",
              "Title": "When changing the mail code (I used NY3-222-02-01), it does not display for selection in the drop-down box.",
              "SeverityValue": "1-Critical",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Working As Designed",
              "Id": 5266,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "US-CEBS "
            },
            {
              "Release": "Remedy Release 3.2",
              "ExistInProdValue": "No",
              "Title": "There is no time zone prompt.",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Script",
              "Id": 5267,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "US-1st Mtg Phone"
            },
            {
              "Release": "Remedy Release 3.2",
              "ExistInProdValue": "No",
              "Title": "SRC for Canada Server Port REQ Incorrect",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Data",
              "Id": 5268,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "SMORE-14975"
            },
            {
              "Release": "Remedy Release 3.2",
              "ExistInProdValue": "No",
              "Title": "mailcode did not appear in confirmation box ",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Pending",
              "StatusValue": "Closed",
              "RootCauseValue": "Script",
              "Id": 5275,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "US-Field Services "
            },
            {
              "Release": "Remedy Release 3.2",
              "ExistInProdValue": "No",
              "Title": "Prod Cats :Services>Hosting>Data Transportation ",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "User Education",
              "Id": 5276,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "US-Data Network Co"
            },
            {
              "Release": "Remedy Release 3.2",
              "ExistInProdValue": "No",
              "Title": "The service form and SRD don't match.  According to the SRD, \"Please indicate Service Type = Change Phone Number\" should have a \"Provide ISP Download Speed (Mb/s)\" selection",
              "SeverityValue": "3-Medium",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Promotion",
              "Id": 5278,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "US-Teleworker"
            },
            {
              "Release": "Remedy Release 3.2",
              "ExistInProdValue": "No",
              "Title": "I think this is missing a word:\nPlease provide the Area Code and Phone Number of the existing phone where you would like your new phone's shared voicemail. ",
              "SeverityValue": "4-Low",
              "TestStatusValue": "Failed",
              "StatusValue": "Closed",
              "RootCauseValue": "Data",
              "Id": 5279,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "US-Banking Ctr Pho"
            },
            {
              "Release": "Remedy Release 3.2",
              "ExistInProdValue": "No",
              "Title": "Type of Service Needed = \"Install\" AND WOBanking Center Phone & Features ",
              "SeverityValue": "1-Critical",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "Data",
              "Id": 5280,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "US-Banking Ctr Pho"
            },
            {
              "Release": "Remedy Release 3.2",
              "ExistInProdValue": "No",
              "Title": "Submitted a Remove; Avaya; Remove VM.  WO's for Avaya and Cisco appear to generate in parallel on the Flow tab, but generate in serial in SIT2 ",
              "SeverityValue": "2-High",
              "TestStatusValue": "Passed",
              "StatusValue": "Closed",
              "RootCauseValue": "User Education",
              "Id": 5281,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "US-Teleworker"
            },
            {
              "Release": "Remedy Release 3.2",
              "ExistInProdValue": "No",
              "Title": "Work order routes to NETW-CISCO-VOICE MOVE ADD CHANGE DELETE TEAM-STANDARD.\n \nPer the script, there are 2 different support groups listed.",
              "SeverityValue": "2-High",
              "TestStatusValue": "Not Applicable",
              "StatusValue": "Closed",
              "RootCauseValue": "User Request",
              "Id": 5286,
              "ComponentValue": "Service Request Fulfillment",
              "RelatedStory": "US-Banking Ctr Pho"
            }
          ]
        };

    
    var IDlessThan1k = {
                  "d": {
                    "results": [
                      {
                        "CategoryValue": "Issue",
                        "SubcategoryValue": "Data",
                        "Release": "Production Found",
                        "RequestNumber": "IM25720566",
                        "ExistInProdValue": "Yes",
                        "ScriptNumber": "Not Applicable",
                        "Title": "When searching for EARC components in SRM Design Console, Autosys Agent can't be found.",
                        "Description": "When searching for EARC components in SRM Design Console, Autosys Agent can't be found.\nREQ000000042267\n\nProvide steps to reproduce the issue = Select GAP Server Request.  Enter search criteria which in this case \"CA WAAE – Work Load Automation – AutoSys Edition R11\" in \"Additonal Product Search Dialog\" box in the RA Options tab.\n      \nWhat is the expected result? = Expected result should return the product being search\n      \nWhat is the actual result? = No items are returned in the view\n\nCA WAAE – Work Load Automation – AutoSys Edition R11 has been in EARC for about 2 weeks and it should be in DLA as well.\n\nPlease see attachment for details.",
                        "ExpectedResult": "See description.",
                        "ActualResult": "See description.",
                        "SeverityValue": "3-Medium",
                        "TestStatusValue": "Failed",
                        "StatusValue": "Open",
                        "RootCauseValue": null,
                        "ListItemID": "999",
                        "Id": 999,
                        "ComponentValue": "DLA Design Console",
                        "RelatedStory": "Not Applicable"
                      }
                    ]
                  }
                };


   

    var  IDlessThan2k =  {
                      "d": {
                        "results": [
                          {
                            "CategoryValue": "Issue",
                            "SubcategoryValue": "Tool",
                            "Release": "Remedy Release 3.0",
                            "RequestNumber": "KBA00004908",
                            "ExistInProdValue": "No",
                            "ScriptNumber": "E2E Knowledge Management_1",
                            "Title": "IE11 : Unable to search a KM article via Search Console.",
                            "Description": "STEPS TO REPRODUCE:\n1. Login to ITSM Application as Knowledge Management Operator.\n2. Click on Applications tab >> Knowledge Management >> Knowledge Management Console.\n3. Create:\n4. Select Create and what type of article you want to create. The options are:\n\n1.How to\n\n2.Known Error\n\n3.Problem Solution\n\n4.Reference\n\n5.Decision Tree\n5. Click the Template drop down arrow to display a list of the available templates.\n6. Select the How To template and click the Create button.\n7. Enter a Title using the following standard:Template Type: Summary Description Examples: How To: Launch eSupport For Prod Cert you would use something like - How To: Release 1.4 Production Cert Test - DO NOT USE\n8. Complete the fields displayed in the Content tab. Note the Article ID\n9. Click the Save button.\n10. Select the Article Visibility Function\n11. Select XYz Company from the Company drop down list and ALL from the Visibility Group drop down list. Click the Add button.\n12. Click Save\n13. Click OK\n14. Click Close\n15. Click the Details tab.\n16. In the first details group box, click the Company*+ drop down arrow and select XYz Company.\n17. In the Company group box, note the value in the Author field.\n18. In the Company group box Keywords field, enter the Keyword of Knowledge and any additional words as desired.  Note:  this will be used to search for the article.",
                            "ExpectedResult": "KM article displays. Status of the article is Published.",
                            "ActualResult": "KM article is not displayed.",
                            "SeverityValue": "2-High",
                            "TestStatusValue": "Passed",
                            "StatusValue": "Closed",
                            "RootCauseValue": "Environmental",
                            "ListItemID": "1999",
                            "Id": 1999,
                            "ComponentValue": "Knowledge Management",
                            "RelatedStory": "E2E Knowledge Management"
                          }
                        ]
                      }
                    };

    
    var IDlessThan3k = {
                      "d": {
                        "results": [
                          {
                            "CategoryValue": "Feedback",
                            "SubcategoryValue": "Enhancement",
                            "Release": "Remedy Release 1.2",
                            "RequestNumber": null,
                            "ExistInProdValue": "No",
                            "ScriptNumber": "SMORE-13016_1",
                            "Title": "Need type ahead capability in the Company Cost field on Cost Form",
                            "Description": "Prerequisites: Incident User must have Cost Manager Permission.\n\n1. Login to ITSM Application as an Incident User.\n2. Click on Applications tab-->Incident Management-->Incident Management Console.\n3. Click on the 'New Incident' link under Functions menu.\n4. Select a 'Support Group' that the Incident User is a member of in the Assigned Group field.\n5. Complete all additional required fields and save.Note: Make a note of the Incident ticket#.\n6. Click on Incident Console Link & Click on Search Incident.\n7. Enter the Incident ticket number as noted above in the Incident ID field & Click on Search button.\n8. Click on Relationship tab, Verify that Priority Column is present. \nIf not, then click on Preferences -> Add Column -> click on Priority.\n9. Select 'Incident' from Search dropdown in Create Relationship section and then click on Search icon.\n10. Click on Use Advanced Search.\n11. Select Status=Assigned and any Priority value.\nClick on Search.\n \nNote: Make a note of selected priority value.\n12. Select any Incident and Click on Relate.\n13. Click Ok.\n14. Select 'Configuration Item' from Search dropdown in Create Relationship section and then click on Search icon.\n15. Click on Use Advanced Search.",
                            "ExpectedResult": "The value is populated in the field.",
                            "ActualResult": "Need type ahead capability",
                            "SeverityValue": "2-High",
                            "TestStatusValue": "Not Applicable",
                            "StatusValue": "Closed",
                            "RootCauseValue": "New Feature",
                            "ListItemID": "2999",
                            "Id": 2999,
                            "ComponentValue": "Incident Management",
                            "RelatedStory": "SMORE-13016"
                          }
                        ]
                      }
                    };



}]);
