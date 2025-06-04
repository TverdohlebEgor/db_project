package it.unibo.db.progetto; // Adjust package as needed

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**") // Apply CORS to all endpoints under /api/
                .allowedOrigins(
                    "http://localhost:3000", // Common for Create React App
                    "http://localhost:5173", // Common for React Vite
                    "http://localhost:8080", // If your frontend is also on 8080 for some reason
                    "http://localhost:8081", // Another common dev port
                    "http://127.0.0.1:5500", // Common for VS Code Live Server
                    "null"                   // For direct HTML file opening in browser (file:///)
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Allowed HTTP methods
                .allowedHeaders("*")    // Allow all headers from the client
                .allowCredentials(true) // Allow sending cookies, authorization headers, etc.
                .maxAge(3600);          // How long the preflight request results can be cached
    }
}