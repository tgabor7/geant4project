//
// Copyright (c) 2016-2019 Vinnie Falco (vinnie dot falco at gmail dot com)
//
// Distributed under the Boost Software License, Version 1.0. (See accompanying
// file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)
//
// Official repository: https://github.com/boostorg/beast
//

//------------------------------------------------------------------------------
//
// Example: WebSocket server, synchronous
//
//------------------------------------------------------------------------------

#include <boost/beast/core.hpp>
#include <boost/beast/websocket.hpp>
#include <boost/asio/ip/tcp.hpp>
#include <cstdlib>
#include <functional>
#include <iostream>
#include <string>
#include <thread>
#include "G4RunManager.hh"
#include "Simulation.hh"
#include "G4MTRunManager.hh"
#include "G4StateManager.hh"
#include <string>
#include "ActionInitialization.hh"

namespace beast = boost::beast;         // from <boost/beast.hpp>
namespace http = beast::http;           // from <boost/beast/http.hpp>
namespace websocket = beast::websocket; // from <boost/beast/websocket.hpp>
namespace net = boost::asio;            // from <boost/asio.hpp>
using tcp = boost::asio::ip::tcp;       // from <boost/asio/ip/tcp.hpp>

//------------------------------------------------------------------------------

// Echoes back all received WebSocket messages

Simulation* simulation = nullptr;

std::vector<std::string> split(std::string s, char c)
{
	std::vector<std::string> result;
	std::string tmp;

	for (int i = 0; i < s.length() - 1; i++) {
		if (s[i] != c) tmp += s[i];
		if (s[i] == c) {
			result.push_back(tmp);
			tmp = "";
		}
	}

	return result;
}
int index = 0;

float nextFloat(std::vector<std::string> data)
{
	float f = std::stof(data[index]);
	index++;

	return f;
}
std::string nextString(std::vector<std::string> data)
{
	std::string s = data[index];
	index++;

	return s;
}

void do_session(tcp::socket& socket,Simulation *sim)
{
	
	try
	{
		// Construct the stream by moving in the socket
		websocket::stream<tcp::socket> ws{ std::move(socket) };

		// Set a decorator to change the Server of the handshake
		ws.set_option(websocket::stream_base::decorator(
			[](websocket::response_type& res)
			{
				res.set(http::field::server,
					std::string(BOOST_BEAST_VERSION_STRING) +
					" websocket-server-sync");
			}));

		// Accept the websocket handshake
		ws.accept();

		for (;;)
		{
			// This buffer will hold the incoming message
			beast::flat_buffer buffer;

			// Read a message
			ws.read(buffer);
			std::cout << "\n received \n";
			std::string response = beast::buffers_to_string(buffer.data());
			if (response.length() < 9) break;

			sim->clearDetectors();

			Gun* gun = new Gun();
			gun->energy = .01;
			gun->definition = GAMMA;
			
			std::vector<Geometry*> geometries;

			Geometry* geo = new Geometry();

			std::vector<std::string> floats = split(response, ',');
			index = 0;
			
			//ágyú
			int number_of_particles = nextFloat(floats);

			gun->position.x = nextFloat(floats) * 10;
			gun->position.y = nextFloat(floats) * 10;
			gun->position.z = nextFloat(floats) * 10;

			gun->direction.x = nextFloat(floats);
			gun->direction.y = nextFloat(floats);
			gun->direction.z = nextFloat(floats);

			gun->energy = nextFloat(floats);

			int number_of_detectors = nextFloat(floats);

			std::cout << "\nNumber of Detectors" << number_of_detectors << "\n";

			//detektorok
			for (int i = 0; i < number_of_detectors; i++) {
				Geometry* tmp = new Geometry;
				tmp->material = nextString(floats);
				std::cout << "\n" << tmp->material << "\n";
				tmp->position.x = nextFloat(floats);
				tmp->position.y = nextFloat(floats);
				tmp->position.z = nextFloat(floats);

				tmp->rotation.x = nextFloat(floats);
				tmp->rotation.y = nextFloat(floats);
				tmp->rotation.z = nextFloat(floats);

				tmp->scale.x = nextFloat(floats);
				tmp->scale.y = nextFloat(floats);
				tmp->scale.z = nextFloat(floats);
				std::cout << "\n" << tmp->scale.z << "\n";
				int number_of_vertices = nextFloat(floats);

				std::cout << "Number of Vertices" << number_of_vertices << "\n";
				for (int j = 0; j < number_of_vertices; j++) {
					float v = nextFloat(floats);
					tmp->vertices.push_back(v);
				}
				sim->addDetector(tmp);
			}

			
			G4StateManager* stateManager = G4StateManager::GetStateManager();
			std::cout << stateManager->GetCurrentState();
			sim->updateGun(gun);
			
			
			//sim->addDetector(geo);

			std::stringstream result = sim->run(gun,number_of_particles);

			boost::beast::multi_buffer b;
			boost::beast::ostream(b) << result.str();

			// üzenet visszaküldése
			ws.text(ws.got_text());

			ws.write(b.data());
			



			break;
		}
	}
	catch (beast::system_error const& se)
	{
		// This indicates that the session was closed
		if (se.code() != websocket::error::closed)
			std::cerr << "Error: " << se.code().message() << std::endl;
	}
	catch (std::exception const& e)
	{
		std::cerr << "Error: " << e.what() << std::endl;
	}
}

//------------------------------------------------------------------------------


int main(int argc, char* argv[])
{
	
	
	try
	{
		// Check command line arguments.
		if (argc != 3)
		{
			std::cerr <<
				"Usage: websocket-server-sync <address> <port>\n" <<
				"Example:\n" <<
				"    websocket-server-sync 0.0.0.0 8080\n";
			return EXIT_FAILURE;
		}
		auto const address = net::ip::make_address(argv[1]);
		auto const port = static_cast<unsigned short>(std::atoi(argv[2]));

		// The io_context is required for all I/O
		net::io_context ioc{ 1 };
		simulation = new Simulation;

		G4StateManager* stateManager = G4StateManager::GetStateManager();
		std::cout << stateManager->GetCurrentState();
		// The acceptor receives incoming connections
		tcp::acceptor acceptor{ ioc, {address, port} };
		for (;;)
		{
			// This will receive the new connection
			tcp::socket socket{ ioc };

			// Block until we get a connection
			acceptor.accept(socket);

			// Launch the session, transferring ownership of the socket
			do_session(std::move(socket), simulation);
			/*G4Thread{ std::bind(
				&do_session,
				std::move(socket),simulation) }.detach();*/
		}

		delete simulation;
	}
	catch (const std::exception & e)
	{
		std::cerr << "Error: " << e.what() << std::endl;
		return EXIT_FAILURE;
	}
}