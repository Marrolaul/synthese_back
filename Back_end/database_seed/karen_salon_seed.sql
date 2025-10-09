DROP DATABASE IF EXISTS karen_salon;
CREATE DATABASE karen_salon;

USE karen_salon;

CREATE TABLE employees (
	id INT AUTO_INCREMENT PRIMARY KEY,
    refId VARCHAR(24) NOT NULL UNIQUE,
    isActive BOOLEAN DEFAULT 1
);

CREATE TABLE customers (
	id INT AUTO_INCREMENT PRIMARY KEY,
    refId VARCHAR(24) NOT NULL UNIQUE
);

CREATE TABLE haircuts (
	id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    price FLOAT NOT NULL,
    duration INT NOT NULL,
    isAvailable BOOLEAN NOT NULL
);

CREATE TABLE schedules (
	id INT AUTO_INCREMENT PRIMARY KEY,
    employeeId INT NOT NULL,
    date DATE NOT NULL,
    startTime TIME NOT NULL,
    endTime TIME NOT NULL,
    FOREIGN KEY (employeeId) REFERENCES employees (id)
);

CREATE TABLE transactions (
	id INT AUTO_INCREMENT PRIMARY KEY,
    datePaid DATETIME NOT NULL,
    totalPrice FLOAT NOT NULL,
    paymentMethod VARCHAR(50) NOT NULL
);

CREATE TABLE appointments (
	id INT AUTO_INCREMENT PRIMARY KEY,
    transactionId INT,
    employeeId INT NOT NULL,
    customerId  INT NOT NULL,
    haircutId INT NOT NULL,
    date DATE NOT NULL,
    startTime TIME,
    status ENUM("active","done","cancelled"),
    FOREIGN KEY (transactionId) REFERENCES transactions(id),
    FOREIGN KEY (employeeId) REFERENCES employees(id),
    FOREIGN KEY (customerId) REFERENCES customers(id),
    FOREIGN KEY (haircutId) REFERENCES haircuts(id)
);

INSERT INTO haircuts (name, duration, price, isAvailable)
VALUES ("Mohawk", 30, 35.99, true),
	("Permanente", 45, 45.75, true),
    ("Longueuil", 30, 30.25, true);




