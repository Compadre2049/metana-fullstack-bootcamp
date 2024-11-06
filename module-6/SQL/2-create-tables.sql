-- create table schema_1.Employee
CREATE TABLE schema_1.Employee (
  employee_id INTEGER PRIMARY KEY,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  department_id INTEGER,
  FOREIGN KEY (department_id) REFERENCES schema_1.department (department_id)
);

-- insert data into schema_1.Employee
INSERT INTO schema_1.Employee (employee_id, first_name, last_name, department_id)
VALUES (1, 'John', 'Doe', 1),
       (2, 'Bob', 'Lawblaw', 1),
       (3, 'Bill', 'Ackman', 2),
       (4, 'Jim', 'Salabim', 3),
       (5, 'Sarah', 'French', 2);

-- create table schema_1.salary
CREATE TABLE schema_1.salary (
  employee_salary INTEGER PRIMARY KEY,
  employee_id INTEGER,
  FOREIGN KEY (employee_id) REFERENCES schema_1.Employee (employee_id)
);

-- insert data into schema_1.salary
INSERT INTO schema_1.salary (employee_salary, employee_id)
VALUES (100000, 1),
       (90000, 2),
       (3, 3),
       (50000, 4),
       (70000, 5);

-- create table schema_1.department
CREATE TABLE schema_1.department (
  department_id INTEGER PRIMARY KEY,
  department VARCHAR(255),
  employee_id INTEGER
);

-- insert data into schema_1.department
INSERT INTO schema_1.department (department_id, department)
VALUES (1, 'Accounting'),
       (2, 'Human Resources'),
       (3, 'Logistics');
