package com.campus.hub;

import com.campus.hub.config.GoogleOAuthProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(GoogleOAuthProperties.class)
public class CampusHubApplication {

    public static void main(String[] args) {
        SpringApplication.run(CampusHubApplication.class, args);
    }
}
