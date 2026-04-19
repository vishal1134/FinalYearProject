package com.landregistry.backend;

import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@ConfigurationPropertiesScan
@SpringBootApplication
public class LandRegistryBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(LandRegistryBackendApplication.class, args);
	}

}
