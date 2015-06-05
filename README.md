# unibus

## Purpose and description
The Unibus application makes it possible to quickly get an overview of public transportation in the area. The application 
geolocalizes the user and gives a graphical overview of nearby busstops. The purpose os to quickly give the user and 
overview of all departurs in the local area, so that he can determine which bus he needs to ride and from which stop.

The appliaction is backed by data from Rejseplanen.

## Scope and architecture of the solution
The application contains both a server side app and a client side app, both written in JavaScript. The client retrieves data
from the server through a simple REST/JSON api. 

## Server
The server is written in JavaScript using node.js. I have built the server as a classical three-layer application with a service
layer that contacts Rejseplanen at the bottom, and app layer that handles caching (and could handle further business logic) in 
the middle and a REST endpoint as the top layer:

    +--------------------+
    |      endpoint      |   Receives and decodes REST/JSON messages from the client
    +--------------------+
             |
    +--------------------+
    |        app         |   Handled caching and business logic (if any is added) of the application
    +--------------------+
              |
    +--------------------+
    |       service      |   Implements the communication with Rejseplanen
    +--------------------+

The architecture also makes it possible to test various aspects of the server independently. At the server layer, the tests
focus on whether the code is able to correctly parse the data from Rejseplanen, at the application layer on whether caching and
application logic is implemented correctly and at the endpoint layer whether the client is able to communicate with the server.

In principle (but not currently implemented), an alternative implementation of the service layer could be implemented 
for testing the app layer. This way we could ensure that tests in the app layer would not break because of changing bus
schedules, dataformats etc.

Rejseplanen exposes its data through a stateless XML api and the service layer extracts the data from the XML using the
'xmldom' (https://www.npmjs.com/package/xmldom) and 'xpath'
(https://www.npmjs.com/package/xpath) modules.

The automated tests use the Mocha framework (http://mochajs.org/) and library management for the server is done using 'npm'.

Prior experience with the stack: I have written very little Node.js code (at the level of 'Hello world') prior to writing
this application and it is my first time using Mocha and the xml libraries.

### Running the server
The server requires Node.js and npm to be installed. Simply run
    
    npm install

to download all required libraries and run the bin/www script to start the server (on port 3000).

## Client
The client is written using a combination of Backbone.js and jQuery. Backbone.js is, in this application, used for separating model an view cleanly from each other. 

## Model
The model is split into three parts: 
1) The CurrentLocation location model which represents the current geolocation of the user. This model is updated when the geolocation changes.
2) The AreaBusStopData model which represents the set of bus stops in the area. This model is updated when CurrentLocation changes and the data is populated using data from the server side of the application (essentially by contacting the server endpoint).
3) The SelectedBusStop which represents the (in the interface) currently selected bus stop. This model is populated with departure information (from the server side) whenever the bus stop selection changes.

## View
The view is separated into three implementations parts:
1) The CircleView which gives a radar-like graphical view of distances using concentric circles in alternating colors. The CircleView is generated using SVG and is in its current form relatively static. If I were to implement a feature where the user could select the maximum distance to bus stops, then the CircleView should be updatable so that the distance in real world meters would be constanct between two circle perimeters.
2) The BusStopsRadarView which populates the CircleView (visually) with nearby bus stops. The BusStopsRadarView is updated when AreaBusStopData changes.
3) The BusStopNextDeparturesView which lists upcoming departures form the selected bus stop. The BusStopNextDeparturesView is updated when the SelectedBusStop changes.
