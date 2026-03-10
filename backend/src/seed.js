require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const { Pool } = require('pg');
const Assignment = require('./models/Assignment');
const connectMongoDB = require('./config/db');

const pgPool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT || 5432,
});

const seedDatabase = async () => {
    try {
        // 1. Seed MongoDB Assignments
        await connectMongoDB();
        await Assignment.deleteMany(); // Clear existing

        const newAssignments = [
            {
                title: "Active Users List",
                difficulty: "Easy",
                description: "Write a SQL query to select the username and email of all users in the 'users' table who have an active account ('is_active' = true).",
                expectedTables: [
                    {
                        tableName: "users",
                        schemaDescription: "id INT, username VARCHAR, email VARCHAR, is_active BOOLEAN",
                        sampleData: [
                            { id: 1, username: "john_doe", email: "john@example.com", is_active: true },
                            { id: 2, username: "jane_smith", email: "jane@example.com", is_active: false },
                            { id: 3, username: "mike_w", email: "mike@example.com", is_active: true }
                        ]
                    }
                ],
                expectedQuery: "SELECT username, email FROM users WHERE is_active = true;"
            },
            {
                title: "Find Top Earners",
                difficulty: "Medium",
                description: "Write a SQL query to find all employees in the 'Engineering' department who earn more than 80,000.",
                expectedTables: [
                    {
                        tableName: "employees",
                        schemaDescription: "id INT, name VARCHAR, department VARCHAR, salary INT",
                        sampleData: [
                            { id: 1, name: "Alice", department: "Engineering", salary: 90000 },
                            { id: 2, name: "Bob", department: "HR", salary: 60000 },
                            { id: 3, name: "Charlie", department: "Engineering", salary: 75000 }
                        ]
                    }
                ],
                expectedQuery: "SELECT * FROM employees WHERE department = 'Engineering' AND salary > 80000;"
            },
            {
                title: "Most Expensive Ordered Product",
                difficulty: "Hard",
                description: "Write a SQL query that joins the 'orders' and 'products' tables to find the name and price of the product that appears in an order with a quantity greater than 5.",
                expectedTables: [
                    {
                        tableName: "products",
                        schemaDescription: "id INT, name VARCHAR, price INT",
                        sampleData: [
                            { id: 1, name: "Laptop", price: 1000 },
                            { id: 2, name: "Mouse", price: 50 },
                            { id: 3, name: "Keyboard", price: 80 }
                        ]
                    },
                    {
                        tableName: "orders",
                        schemaDescription: "order_id INT, product_id INT, quantity INT",
                        sampleData: [
                            { order_id: 101, product_id: 2, quantity: 10 },
                            { order_id: 102, product_id: 1, quantity: 2 },
                            { order_id: 103, product_id: 3, quantity: 6 }
                        ]
                    }
                ],
                expectedQuery: "SELECT products.name, products.price FROM products JOIN orders ON products.id = orders.product_id WHERE orders.quantity > 5;"
            }
        ];

        await Assignment.insertMany(newAssignments);
        console.log("MongoDB seeded with multiple assignments!");

        // 2. Seed PostgreSQL Sandbox Tables

        // Employees table
        await pgPool.query('DROP TABLE IF EXISTS employees;');
        await pgPool.query(`
            CREATE TABLE employees (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100),
                department VARCHAR(100),
                salary INT
            );
        `);
        await pgPool.query(`
            INSERT INTO employees (name, department, salary) VALUES
            ('Alice', 'Engineering', 90000),
            ('Bob', 'HR', 60000),
            ('Charlie', 'Engineering', 75000),
            ('Diana', 'Marketing', 85000),
            ('Eve', 'Engineering', 95000);
        `);

        // Users table
        await pgPool.query('DROP TABLE IF EXISTS users;');
        await pgPool.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(100),
                email VARCHAR(100),
                is_active BOOLEAN
            );
        `);
        await pgPool.query(`
            INSERT INTO users (username, email, is_active) VALUES
            ('john_doe', 'john@example.com', true),
            ('jane_smith', 'jane@example.com', false),
            ('mike_w', 'mike@example.com', true),
            ('sara_connor', 'sara@example.com', false);
        `);

        // Products and Orders tables
        await pgPool.query('DROP TABLE IF EXISTS orders;');
        await pgPool.query('DROP TABLE IF EXISTS products;');

        await pgPool.query(`
            CREATE TABLE products (
                id INT PRIMARY KEY,
                name VARCHAR(100),
                price INT
            );
        `);
        await pgPool.query(`
            CREATE TABLE orders (
                order_id INT PRIMARY KEY,
                product_id INT,
                quantity INT
            );
        `);

        await pgPool.query(`
            INSERT INTO products (id, name, price) VALUES
            (1, 'Laptop', 1000),
            (2, 'Mouse', 50),
            (3, 'Keyboard', 80),
            (4, 'Monitor', 300);
            
            INSERT INTO orders (order_id, product_id, quantity) VALUES
            (101, 2, 10),
            (102, 1, 2),
            (103, 3, 6),
            (104, 4, 1);
        `);

        console.log("PostgreSQL seeded with users, employees, products, and orders!");

        // Exit
        process.exit(0);
    } catch (error) {
        console.error("Seeding error:", error);
        process.exit(1);
    }
};

seedDatabase();
