INSERT INTO users (name, email, password_hash, role)
VALUES 
('Anabel', 'anabel@example.com', 'hashed_admin_password', 'admin'),
('Laura', 'laura@example.com', 'hashed_user_password', 'subscriber'),
('Ana', 'ana@example.com', '$2b$10$A25ffn.JiHmuLerRdhiIaOhWn3hony0IE6W8l8isHUMqAQKatrulu', 'subscriber');

INSERT INTO subscriptions (
    user_id, status, start_date, end_date, auto_renewal, monthly_price, currency, provider_subscription_id
)
VALUES
(2, 'active', '2026-03-01', '2026-04-01', TRUE, 10.00, 'EUR', 'sub_001'),
(3, 'active', '2026-03-01', '2026-04-01', TRUE, 10.00, 'EUR', 'sub_ana_001');

INSERT INTO payments (
    user_id, subscription_id, amount, currency, status, provider_payment_id
)
VALUES
(2, 1, 10.00, 'EUR', 'completed', 'pay_001'),
(2, 1, 10.00, 'EUR', 'completed', 'pay_002'),
(3, 2, 10.00, 'EUR', 'completed', 'pay_ana_001');

INSERT INTO premium_content (
    title, slug, description, support_text, video_url, cover_image, topic, display_order, published
)
VALUES
(
    'How to structure a website',
    'how-to-structure-a-website',
    'Basic website structure explained.',
    'In this content I explain the main sections of a website and how to organize them.',
    'https://example.com/video1',
    'https://example.com/cover1.jpg',
    'structure',
    1,
    TRUE
),
(
    'CSS organization tips',
    'css-organization-tips',
    'Tips for keeping CSS clean and scalable.',
    'This content covers naming, file structure and reusable styles.',
    'https://example.com/video2',
    'https://example.com/cover2.jpg',
    'css',
    2,
    TRUE
),
(
    'Responsive design basics',
    'responsive-design-basics',
    'Introduction to responsive web design.',
    'This content explains breakpoints, flexible layouts and mobile-first design.',
    'https://example.com/video3',
    'https://example.com/cover3.jpg',
    'responsive',
    3,
    TRUE
);