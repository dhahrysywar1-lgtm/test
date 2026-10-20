-- À exécuter une seule fois avec : sudo mysql < database/create-user.sql
-- Crée un utilisateur applicatif (pas root) avec accès aux bases nova_store et nova_store_test.
-- Changez le mot de passe puis reportez-le dans backend/.env
CREATE USER IF NOT EXISTS 'nova'@'localhost' IDENTIFIED BY 'nova_password_change_me';
GRANT ALL PRIVILEGES ON `nova\_store%`.* TO 'nova'@'localhost';
FLUSH PRIVILEGES;
