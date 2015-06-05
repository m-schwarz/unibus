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
    +====================+
    |       service      |   Implements the communication with Rejseplanen
    +====================+
