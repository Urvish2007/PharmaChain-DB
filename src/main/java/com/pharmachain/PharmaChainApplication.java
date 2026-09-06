package com.pharmachain;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class PharmaChainApplication {

    public static void main(String[] args) {
        SpringApplication.run(PharmaChainApplication.class, args);
    }
}
