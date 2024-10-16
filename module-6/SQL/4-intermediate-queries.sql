-- joins employee details along with their department info
SELECT e.employee_id, e.first_name, e.last_name, d.department
FROM schema_1.Employee e
JOIN schema_1.department d ON e.department_id = d.department_id;

-- calculates the total salary expenditure for each department
SELECT d.department, SUM(s.employee_salary) AS total_salary
FROM schema_1.salary s
JOIN schema_1.Employee e ON s.employee_id = e.employee_id
JOIN schema_1.department d ON e.department_id = d.department_id
GROUP BY d.department;

-- finds the average salary of all employees
SELECT AVG(s.employee_salary) AS average_salary
FROM schema_1.salary s;
