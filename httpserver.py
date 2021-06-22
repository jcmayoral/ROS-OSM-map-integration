# Import server module

import http.server

# Import SocketServer module

import socketserver


# Set the port number

port = 8080

# Create object for handling HTTP requests

Handler = http.server.SimpleHTTPRequestHandler


# Run the server forever to handle the HTTP requests

with socketserver.TCPServer(("", port), Handler) as httpd:

    print("Web Server is running at http://localhost:%s" %port)

    httpd.serve_forever()
