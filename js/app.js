var map; //Global variable map
// Array that stores all our locations with their lat and long
var dLocations = [
	{ title:'Gandhi Smriti',
	  lat: 28.601780,
	  long: 77.214339 },
	{ title:'Rashtrapati Bhavan',
	  lat: 28.614360,
	  long: 77.199621 },
	{ title:'Akshardham temple',
	  lat: 28.612673,
	  long: 77.277262 },
	{ title:'Red Fort, Delhi',
	  lat: 28.656159,
	  long: 77.24102 },
	{ title:'Lotus Temple',
	  lat: 28.553492,
	  long: 77.258826 },
	{ title:'Jantar Mantar, Delhi',
	  lat: 28.627055,
	  long: 77.216627 },
	{ title:'DLF Emporio',
	  lat: 28.543425,
	  long: 77.156765 },
	{ title:'Garden of Five Senses',
	  lat: 28.513307,
	  long: 77.198503 },
	{ title:'Purana Qila',
	  lat: 28.609574,
	  long: 77.243737 },
	{ title:'Jama Masjid, Delhi',
	  lat: 28.650679,
	  long: 77.233442 }
];

function Location(loc)
{
	var self = this;
	this.title = loc.title;
	this.lng = loc.long;
	this.lat = loc.lat;
	this.visible = ko.observable(false);
	this.infoWindow = new google.maps.InfoWindow();


	// Wikipedia Api
	this.Content = function()
	{
		var wiki = [];
		// Url for wikipedia api
		var Url = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + self.title + '&format=json&callback=wikiCallback';

		$.getJSON({url: Url,
			dataType: "jsonp",}).done(function(response)
			{	var result = response[1];
				for (var i=0; i < result.length; i++)
				{
					var Str = result[i];
					var link = 'http://en.wikipedia.org/wiki/' + Str;
					wiki.push('<li><a href="' + link + '" target="_blank">' + Str + '</a></li>');
				}
				if (wiki.length > 0)
				{
					self.content = '<h2>' + self.title + '</h2>' + wiki;
				}
				else
				{
					self.content = '<h2>' + self.title + '</h2>' + '<h4>Search Failed</h4>';
				}
			}).fail(function()
			{
				self.content = '<h2>' + self.title + '</h2>' + '<h4>Wikipedia API did not load. Try again.</h4>';
				console.log('getJSON failed');
			});
	}();
	// Google maps Marker setup
	this.marker = new google.maps.Marker
	({
		position: new google.maps.LatLng(loc.lat, loc.long),
		map: map,
		title: loc.name,
	});

	this.displayMarker = ko.computed(
		function()
		{
			if(this.visible() === true)
			{
				this.marker.setMap(map);
			}
			else {
				this.marker.setMap(null);
			}
			return true;
		}, this);

	// Infowindow setup
	this.openInfowindow = function()
	{
		map.panTo(self.marker.getPosition());
		self.infoWindow.setContent(self.content);
		self.infoWindow.open(map, self.marker);
		self.marker.setAnimation(google.maps.Animation.DROP);
      	setTimeout(function()
			{
				self.infoWindow.close();
	      		self.marker.setAnimation(null);
	     	}, 3000
		);
	};

	this.Listener = google.maps.event.addListener
	(
		self.marker,'click', this.openInfowindow
	);
}

function ViewModel()
{
	var self = this;

	this.filter = ko.observable('');
	this.mylocations = ko.observableArray([]);

	dLocations.forEach(function(location)
	{
		self.mylocations.push( new Location(location));
	});
	// Creates a new map with the given center and zoom
    map = new google.maps.Map(
        document.getElementById('map'),
        {
	        zoom: 12,
	        center: new google.maps.LatLng(28.612912, 77.22951),
	        disableDefaultUI: false,  // Enables the default zoom and street view icons
			mapTypeControl: false 	  // Disables user from changing map type i.e terrain, sattelite.
		});

	// This function Filters our locations on the basis of our search
	// Gets called every time user changes the search text
	this.filterLocations = ko.computed(
		function()
		{
			var search = self.filter().toLowerCase();
			if (!search)
			{
				self.mylocations().forEach(
					function(location)
					{
						location.visible(true);
					});
				return self. mylocations();
			}
			else
			{
				return ko.utils.arrayFilter(self.mylocations(),
					function(location)
					{
						var isVisble = location.title.toLowerCase().indexOf(search) >= 0;
						location.visible(isVisble);
						return isVisble;
					});
			}
		}, self);
}

function initMap()
{
	ko.applyBindings(new ViewModel());
}

function error()
{
	alert("Error while loading google maps");	//send error
}
