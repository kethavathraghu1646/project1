package com.farmersmarket.backend.controller;

import com.farmersmarket.backend.model.Product;
import com.farmersmarket.backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping("/public/all")
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    @GetMapping
    public List<Product> getProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable String id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/public/category/{category}")
    public List<Product> getProductsByCategory(@PathVariable String category) {
        return productService.getProductsByCategory(category);
    }

    @PostMapping
    @PreAuthorize("hasRole('FARMER')")
    public Product createProduct(@RequestBody Product product) {
        return productService.saveProduct(product);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('FARMER')")
    public Product updateProduct(@PathVariable String id, @RequestBody Product productUpdates) {
        Product existing = productService.getProductById(id).orElseThrow(() -> new RuntimeException("Product not found"));
        if (productUpdates.getPrice() != null) existing.setPrice(productUpdates.getPrice());
        if (productUpdates.getQuantity() != null) existing.setQuantity(productUpdates.getQuantity());
        if (productUpdates.getDescription() != null) existing.setDescription(productUpdates.getDescription());
        return productService.saveProduct(existing);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('FARMER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteProduct(@PathVariable String id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok("Product deleted successfully");
    }
}
