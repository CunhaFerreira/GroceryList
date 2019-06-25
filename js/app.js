var app = angular.module('groceryListApp', ['ngRoute']);

app.config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'views/groceryList.html',
            controller: 'HomeController'
        })
        .when('/addItem', {
            templateUrl: 'views/addItem.html',
            controller: 'GroceryListItemController'
        })
        .when('/addItem/edit/:id/', {
            templateUrl: 'views/addItem.html',
            controller: 'GroceryListItemController'
        })
        .otherwise({
            redirectTo: '/'
        })
})

app.service('GroceryService', function ($http) {

    var groceryService = {};

    groceryService.groceryItems = [];

    // Loading entries
    $http.get('data/server_data.json')
        .success(function (data) {
            groceryService.groceryItems = data;

            // Make data as an object
            for (var item in groceryService.groceryItems) {
                groceryService.groceryItems[item].date = new Date(groceryService.groceryItems[item].date);
            }

        })
        .error(function (data, status) {
            alert('something is wrong!')
        });

    // Finding ID and passing it
    groceryService.findById = function (id) {
        for (var item in groceryService.groceryItems) {
            if (groceryService.groceryItems[item].id === id) {
                console.log(groceryService.groceryItems[item]);
                return groceryService.groceryItems[item];
            }
        }
    };

    // Generating New ID >>> Add library's Script Underscore at index.html
    groceryService.getNewId = function () {

        if (groceryService.newId) {
            groceryService.newId++;
            return groceryService.newId;
        } else {
            var maxId = _.max(groceryService.groceryItems, function (entry) {
                return entry.id;
            })
            groceryService.newId = maxId.id + 1;
            return groceryService.newId;
        }
    };

    // Defining function completed
    groceryService.markCompleted = function (entry) {

        entry.completed = !entry.completed;

    };

    // Defining function trash's bin
    groceryService.removeItem = function (entry) {

        $http.get('data/delete_item.json', {id: entry.id})
            .success(function (data) {

                    if (data.status) {
                    var index = groceryService.groceryItems.indexOf(entry);
                    groceryService.groceryItems.splice(index, 1);
                    }
            })
            .error(function () {

            });


    };

    // Defining function to save
    groceryService.save = function (entry) {

        var updatedItem = groceryService.findById(entry.id);

        // Update existing data
        if (updatedItem) {

            $http.get('data/updated_item.json', entry)
                .success(function (data) {

                    if (data.status == 1) {
                        updatedItem.completed = entry.completed;
                        updatedItem.itemName = entry.itemName;
                        updatedItem.date = entry.date;
                    }
                })
                .error(function (data, status) {

                })

        } else {

            // http.post should be used when not using live-server to test the app
            $http.get('data/added_item.json', entry)
                .success(function (data) {
                    // Server is generating a new ID
                    entry.id = data.newId;
                })
                .error(function (data, status) {

                });

            groceryService.groceryItems.push(entry);
        }
    };

    return groceryService;
});

app.controller('HomeController', ['$scope', 'GroceryService', function ($scope, GroceryService) {

    $scope.groceryItems = GroceryService.groceryItems;

    // To remove item using trash's bin
    $scope.removeItem = function (entry) {
        GroceryService.removeItem(entry);
    };

    $scope.markCompleted = function (entry) {
        GroceryService.markCompleted(entry);
    };

    // To load the data everytime the page is loaded
    $scope.$watch(function () {
        return GroceryService.groceryItems;
    }, function (groceryItems) {
        $scope.groceryItems = groceryItems;
    })

}]);

app.controller('GroceryListItemController', ['$scope', '$routeParams', '$location', 'GroceryService', function ($scope, $routeParams, $location, GroceryService) {

    // To distinguish between adding and editing an entry
    if (!$routeParams.id) {
        $scope.groceryItem = {
            id: 0,
            completed: false,
            itemName: '',
            date: new Date()
        };
    } else {
        $scope.groceryItem = _.clone(GroceryService.findById(parseInt($routeParams.id)));
    }

    $scope.save = function () {
        GroceryService.save($scope.groceryItem);
        $location.path('/');
    };

}]);

app.directive('biGroceryItem', function () {

    return {
        restrict: 'E',
        templateUrl: 'views/groceryItem.html'
    }
});