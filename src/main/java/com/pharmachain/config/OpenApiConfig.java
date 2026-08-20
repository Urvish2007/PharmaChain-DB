package com.pharmachain.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI pharmaChainOpenApi() {
        return new OpenAPI().info(new Info()
                .title("PharmaChain API")
                .description("REST + JPA layer over the PharmaChain-DB pharmaceutical manufacturing schema: "
                        + "inventory, batches, quality control, sales and FDA-style recalls.")
                .version("v0.1")
                .contact(new Contact().name("PharmaChain")));
    }
}
