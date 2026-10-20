-- Données de démonstration.
-- INSERT IGNORE + clé unique sur "name" : relancer le script ne crée aucun doublon.
INSERT IGNORE INTO products (name, description, price, category, image_url, stock) VALUES
('Nova Air Pro Headphones', 'Over-ear wireless headphones with adaptive noise cancelling, 40 hours of battery life and a premium memory-foam fit.', 199.00, 'Audio', '/assets/products/p01.svg', 25),
('Pulse Wireless Earbuds', 'Compact true wireless earbuds with crystal-clear calls, IPX5 water resistance and a pocket-size charging case.', 89.90, 'Audio', '/assets/products/p02.svg', 60),
('Echo Mini Speaker', 'Portable Bluetooth speaker with surprisingly deep bass, 12 hours of playtime and a rugged fabric finish.', 59.00, 'Audio', '/assets/products/p03.svg', 8),
('Orbit Smartwatch S2', 'AMOLED smartwatch with GPS, heart-rate and sleep tracking, and a 7-day battery in a lightweight aluminium case.', 249.00, 'Wearables', '/assets/products/p04.svg', 18),
('Flex Fitness Band', 'Slim activity tracker with 20 workout modes, step counting and smart notifications for everyday use.', 49.90, 'Wearables', '/assets/products/p05.svg', 40),
('Aura Mechanical Keyboard', 'Hot-swappable 75 percent mechanical keyboard with tactile switches, PBT keycaps and soft RGB backlighting.', 129.00, 'Accessories', '/assets/products/p06.svg', 22),
('Glide Ergonomic Mouse', 'Vertical ergonomic wireless mouse that reduces wrist strain, with silent clicks and adjustable DPI.', 69.50, 'Accessories', '/assets/products/p07.svg', 35),
('Arc Laptop Stand', 'Foldable aluminium laptop stand with six height levels and ventilated design for better cooling.', 39.00, 'Accessories', '/assets/products/p08.svg', 5),
('Titan USB-C Hub 8-in-1', 'Eight ports in one: HDMI 4K, USB 3.0, SD card reader and 100W power delivery for your laptop.', 79.00, 'Accessories', '/assets/products/p09.svg', 3),
('Lumen Desk Lamp', 'LED desk lamp with five colour temperatures, touch dimming and a wireless charging base.', 54.00, 'Home', '/assets/products/p10.svg', 30),
('Zen Aroma Diffuser', 'Ultrasonic essential-oil diffuser with a soft ambient light and automatic shut-off, ideal for the bedroom.', 34.90, 'Home', '/assets/products/p11.svg', 45),
('Nimbus Smart Plug Pack', 'Pack of four Wi-Fi smart plugs with scheduling, energy monitoring and voice assistant compatibility.', 29.90, 'Home', '/assets/products/p12.svg', 70),
('Vortex Gaming Controller', 'Wireless controller with hall-effect sticks, programmable back buttons and a 30-hour battery.', 74.90, 'Gaming', '/assets/products/p13.svg', 28),
('Nebula 27 inch Gaming Monitor', '27 inch QHD monitor with a 165 Hz refresh rate, 1 ms response time and adaptive sync for ultra-smooth gameplay.', 329.00, 'Gaming', '/assets/products/p14.svg', 12);
