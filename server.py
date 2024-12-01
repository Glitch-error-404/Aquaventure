import http.server
import socketserver
import os

PORT = 8080

class AquaventureHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Map root URL to login.html
        if self.path == '/':
            self.path = '/views/login.html'
        elif self.path in ['/dashboard', '/calculator', '/discover', '/leaderboard', '/about']:
            self.path = f'/views{self.path}.html'
        
        # Try to serve the file
        try:
            # Always look in the views directory first
            if not self.path.startswith('/views/'):
                possible_view_path = f'/views{self.path}'
                full_view_path = os.path.join(os.getcwd(), possible_view_path[1:])
                if os.path.exists(full_view_path):
                    self.path = possible_view_path

            return http.server.SimpleHTTPRequestHandler.do_GET(self)
        except Exception as e:
            # If file not found, serve 404.html
            self.path = '/views/404.html'
            return http.server.SimpleHTTPRequestHandler.do_GET(self)

Handler = AquaventureHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"\n🌊 Aquaventure server is running!")
    print(f"📱 Access the application at: http://localhost:{PORT}")
    print(f"💡 Press Ctrl+C to stop the server\n")
    httpd.serve_forever()
